if (!process.env.LOADED) require('./config');
const database = require('./database');
const paths = require('./pathHandler');
const FTPControllerWien = require('./FTPControllerWien');

db = new database();

async function jobWien() {
  console.log('data collection start');
  const dataRaw = new FTPControllerWien('va');
  dataRaw.events.on('log', function (msg) {
    console.log(msg);
  });
  dataRaw.events.on('info', function (msg) {
    console.log(msg);
  });

  const data = await dataRaw.runme().catch((error) => {
    console.log('data collection error');
    console.log(error.message || error);
    return false;
  });

  if (!data) {
    console.log('no data!');
  }

  console.log(data);

  refreshDB(data);
  console.log('data collection done');
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

jobWien();
