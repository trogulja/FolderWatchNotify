if (!process.env.LOADED) require('./lib/config');
const database = require('./lib/database');
const db = new database();
const axios = require('axios');
const FTPController = require('./lib/FTPController');
const ShareController = require('./lib/ShareController');
const FTPControllerWien = require('./lib/FTPControllerWien');
const cron = require('node-cron');

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
  console.log(`[${new Date().toTimeString().split(' ')[0]}] Collecting data for: \\\\srvczg-files\\ftp_hr_m4\\_JOBS\\`)
  const share = await ShareController.runme();
  refreshDB(share);
  return true;
}

async function jobFTPs() {
  const jobs = ['monat', 'start', '7dnevno', 'emmezeta', 'opravdano'];

  for await (const job of jobs) {
    console.log(`[${new Date().toTimeString().split(' ')[0]}] Collecting data for: ${job}`)
    const dataRaw = new FTPController(job);
    const data = await dataRaw.runme();
    refreshDB(data);
  }

  return true;
}

async function jobWien() {
  const wienjobs = ['diva', 'wienerin', 'rapidfak', 'rapidmagazin', 'corner', 'activebeauty', 'hub', 'va'];

  for await (const job of wienjobs) {
    console.log(`[${new Date().toTimeString().split(' ')[0]}] Collecting data for: ${job}`)
    const dataRaw = new FTPControllerWien(job);
    const data = await dataRaw.runme();
    refreshDB(data);
  }

  return true;
}

function reportJobs() {
  const newJobs = db.getNew();

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
    const dateHour = `${date.getHours()}:${date.getMinutes()}`;

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

cron.schedule('0 0,8-23 * * *', function () {
  jobWien();
});

cron.schedule('10 0,8-23 * * *', function () {
  jobFTPs();
});

cron.schedule('15 0,8-23 * * *', function () {
  jobShares();
});

cron.schedule('0 7 * * *', function () {
  jobsAll();
});

cron.schedule('30 9,12,18 * * 1-5', function() {
  // Weekday reports - 9:30, 12:30, 18:30
  reportJobs();
})

cron.schedule('30 12,18 * * 0,6', function() {
  // Weekend reports: 12:30, 18:30
  reportJobs();
})
jobWien();