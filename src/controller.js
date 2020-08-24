const database = require('./lib/database');
const FTPController = require('./lib/FTPController');
const ShareController = require('./lib/ShareController');
const db = new database();
const path = require('path');
const paths = require('./lib/pathHandler');
const FTPControllerWien = require('./lib/FTPControllerWien');
if (!process.env.LOADED) require('dotenv').config({ path: path.join(paths.root, '.env') });

async function jobs() {
  const share = await ShareController.runme();
  refreshDB(share);

  const jobs = ['monat', 'start', '7dnevno', 'emmezeta', 'opravdano'];

  for await (const job of jobs) {
    const dataRaw = new FTPController(job);
    const data = await dataRaw.runme();
    refreshDB(data);
  }

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

  for await (const job of wienjobs) {
    const dataRaw = new FTPControllerWien(job);
    const data = await dataRaw.runme();
    refreshDB(data);
  }
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

jobs();
