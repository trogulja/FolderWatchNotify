if (!process.env.LOADED) require('./lib/config');
const database = require('./lib/database');
const paths = require('./lib/pathHandler');
const axios = require('axios');
const FTPController = require('./lib/FTPController');
const ShareController = require('./lib/ShareController');
const FTPControllerWien = require('./lib/FTPControllerWien');
const cron = require('node-cron');
const { EventEmitter } = require('events');

async function jobsAll() {
  await jobShares();
  await jobFTPs();
  await jobWien();
}

function refreshDB(data) {
  db.delJob(data.cID);

  data.jobs.forEach((job, i) => {
    const id = db.addJob({ cID: data.cID, ...job, dueMS: 0, updatedAtMS: new Date().getTime() });
    data.jobs[i].id = id;
  });

  db.addImages(
    data.images.map((image) => ({
      job: data.jobs[image.jobID].id,
      status: image.status,
      path: image.path,
    }))
  );
}

async function jobShares() {
  emitLog(`Collecting data for: \\\\srvczg-files\\ftp_hr_m4\\_JOBS\\`);
  emitMeta({ job: 'shares', status: 'start' });

  const share = new ShareController();
  share.events.on('log', function (msg) {
    emitLog(msg);
  });
  share.events.on('info', function (msg) {
    emitInfo(msg);
  });

  const data = await share.runme().catch((error) => {
    emitMeta({ job: 'shares', status: 'error' });
    emitLog(error.message || error);
    return false;
  });
  if (!data) return false;

  refreshDB(data);
  emitMeta({ job: 'shares', status: 'done' });
  emitLog(`Collecting data done: \\\\srvczg-files\\ftp_hr_m4\\_JOBS\\`);
  return true;
}

async function jobFTPs() {
  emitMeta({ job: 'ftps', status: 'start' });
  const jobs = ['monat', 'start', '7dnevno', 'emmezeta', 'opravdano'];

  for (const job of jobs) {
    emitLog(`Collecting data for: ${job}`);

    const dataRaw = new FTPController(job);
    dataRaw.events.on('log', function (msg) {
      emitLog(msg);
    });
    dataRaw.events.on('info', function (msg) {
      emitInfo(msg);
    });

    const data = await dataRaw.runme().catch((error) => {
      emitMeta({ job: 'ftps', status: 'error' });
      emitLog(error.message || error);
      return false;
    });
    if (!data) continue;

    refreshDB(data);
    emitLog(`Collecting data done: ${job}`);
  }

  emitMeta({ job: 'ftps', status: 'done' });
  return true;
}

async function jobWien() {
  emitMeta({ job: 'wien', status: 'start' });
  const wienjobs = [
    'diva',
    'wienerin',
    'rapidfak',
    'rapidmagazin',
    'corner',
    'activebeauty',
    'hub',
    'va',
  ];

  for (const job of wienjobs) {
    emitLog(`Collecting data for: ${job}`);

    const dataRaw = new FTPControllerWien(job);
    dataRaw.events.on('log', function (msg) {
      emitLog(msg);
    });
    dataRaw.events.on('info', function (msg) {
      emitInfo(msg);
    });

    const data = await dataRaw.runme().catch((error) => {
      emitMeta({ job: 'wien', status: 'error' });
      emitLog(error.message || error);
      dataRaw.destroy();
      return false;
    });
    if (!data) continue;

    refreshDB(data);
    emitLog(`Collecting data done: ${job}`);
  }

  emitMeta({ job: 'wien', status: 'done' });
  return true;
}

function reportJobs() {
  const newJobs = db.getNew();
  if (!newJobs.length) return false;

  emitLog(`Reporting to webhook ${newJobs.length} new jobs.`);

  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text:
          'Bok, robot zvan Robotko Njuškalić se prijavljuje na dužnost! Pronjuškao sam direktorije i našao ove otvorene stavke:\n\n *Lokacije koje sadrže nove poslove:*',
      },
    },
    {
      type: 'divider',
    },
  ];

  newJobs.forEach((job) => {
    const txtNew =
      job.todoNew > 4
        ? 'novih slika'
        : job.todoNew > 1
        ? 'nove slike'
        : job.todoNew > 0
        ? 'nova slika'
        : 'novih slika';
    const txtTaken =
      job.todoTaken > 4
        ? 'uzetih'
        : job.todoTaken > 1
        ? 'uzete'
        : job.todoTaken > 0
        ? 'uzeta'
        : 'uzetih';
    const txtDone =
      job.done > 4
        ? 'napravljenih'
        : job.done > 1
        ? 'napravljene'
        : job.done > 0
        ? 'napravljena'
        : 'napravljenih';
    const date = new Date(job.updatedAtMS);
    const dateDay = `${date.getDate()}.${date.getMonth() + 1}.`;
    const dateHour = `${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${job.name}*\n\n:new: *${job.todoNew} ${txtNew}* _(${job.todoTaken} ${txtTaken}, ${job.done} ${txtDone})_\n\n_lokacija:_ ${job.root}\n_(status na dan ${dateDay} u ${dateHour} sati)_`,
      },
    });
    blocks.push({ type: 'divider' });
  });

  const txtTotalPre =
    newJobs.length > 4
      ? 'Nađeno je'
      : newJobs.length > 1
      ? 'Nađena su'
      : newJobs.length > 0
      ? 'Nađen je'
      : 'Nađeno je';
  const txtTotalPost = newJobs.length > 1 ? 'foldera' : newJobs.length > 0 ? 'folder' : 'foldera';
  const txtTotal = `${txtTotalPre} ${newJobs.length} ${txtTotalPost} sa slikama koje nisu napravljene.`;

  axios
    .post(process.env.SLACK_WEBHOOK, { text: txtTotal, blocks })
    .then((res) => console.log(res.data))
    .catch((err) => console.log(err));
}

function emitLog(s) {
  CronController.events.emit('log', `[${new Date().toTimeString().split(' ')[0]}] ${s}`);
  console.log('emitting log:', `[${new Date().toTimeString().split(' ')[0]}] ${s}`);
}

function emitInfo(s) {
  CronController.events.emit('info', s);
  console.log('emitting info:', s);
}

function emitMeta(o) {
  CronController.events.emit('meta', o);
  console.log('emitting meta:');
  console.log(o);
}

const cronjob = {};
let db = null;

class CronController {
  static init() {
    if (db) this.destroy();

    db = new database();
    emitLog('Database connection opened.');

    cronjob.wien = cron.schedule(
      '20,50 0,8-23 * * *',
      function () {
        emitLog('Starting cronjob: wien');
        jobWien();
      },
      { scheduled: false }
    );

    cronjob.ftps = cron.schedule(
      '10,40 0,8-23 * * *',
      function () {
        emitLog('Starting cronjob: ftps');
        jobFTPs();
      },
      { scheduled: false }
    );

    cronjob.shares = cron.schedule(
      '15,45 0,8-23 * * *',
      function () {
        emitLog('Starting cronjob: shares');
        jobShares();
      },
      { scheduled: false }
    );

    cronjob.all = cron.schedule(
      '0 7 * * *',
      function () {
        emitLog('Starting cronjob: all');
        jobsAll();
      },
      { scheduled: false }
    );

    cronjob.weekday = cron.schedule(
      '0 9,12,18 * * 1-5',
      function () {
        // Weekday reports - 9:00, 12:00, 18:00
        emitLog('Starting cronjob: Weekday reports');
        reportJobs();
      },
      { scheduled: false }
    );

    cronjob.weekend = cron.schedule(
      '30 12,18 * * 0,6',
      function () {
        // Weekend reports: 12:30, 18:30
        emitLog('Starting cronjob: Weekend reports');
        reportJobs();
      },
      { scheduled: false }
    );
    emitLog(`Looking for db at: ${paths.db}`);
    emitLog('Cronjobs installed.');
  }

  static start() {
    cronjob.wien.start();
    cronjob.ftps.start();
    cronjob.shares.start();
    cronjob.all.start();
    cronjob.weekday.start();
    cronjob.weekend.start();
    emitLog('Cronjobs started.');
  }

  static stop() {
    cronjob.wien.stop();
    cronjob.ftps.stop();
    cronjob.shares.stop();
    cronjob.all.stop();
    cronjob.weekday.stop();
    cronjob.weekend.stop();
    emitLog('Cronjobs stopped.');
  }

  static destroy() {
    cronjob.wien.destroy();
    cronjob.ftps.destroy();
    cronjob.shares.destroy();
    cronjob.all.destroy();
    cronjob.weekday.destroy();
    cronjob.weekend.destroy();
    emitLog('Cronjobs destroyed.');
    db.close();
    db = null;
    emitLog('Database connection closed.');
  }

  static runnow() {
    jobsAll();
  }

  static forceStart(job) {
    // job === shares | ftps | wien
    if (job === 'shares') jobShares();
    if (job === 'ftps') jobFTPs();
    if (job === 'wien') jobWien();
  }

  static events = new EventEmitter();
}

module.exports = CronController;

// CronController.init();
// CronController.start();
// CronController.runnow();
