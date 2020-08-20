const ftp_hr_m4 = require('./lib/jobFtphrm4');
const database = require('./lib/database');
const db = new database();

ftp_hr_m4.runme().then((data) => {
  // data = { jobs: [{ root, type, profile, name, path, todoNew, todoTaken, done }], images: [{ jobID, status, path }] }
  const cID = 'ftp_hr_m4';

  db.delJob(cID);

  data.jobs.forEach((job, i) => {
    const id = db.addJob({ cID, ...job, dueMS: 0, updatedAtMS: new Date().getTime() });
    data.jobs[i].id = id;
  });
  
  db.addImages(
    data.images.map((image) => ({
      job: data.jobs[image.jobID].id,
      status: image.status,
      path: image.path,
    }))
  );
});
