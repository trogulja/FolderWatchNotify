const Database = require('better-sqlite3');
const path = require('path');
const paths = require('./pathHandler');
// const db = new Database(path.join(paths.db, 'folderWatcher.db'), { verbose: console.log });

class database {
  constructor() {
    this.db = new Database(path.join(paths.db, 'folderWatcher.db'));
    this.db.pragma('journal_mode = WAL');
    this.db.prepare('CREATE TABLE IF NOT EXISTS jobs (id INTEGER PRIMARY KEY NOT NULL, cID STRING, root STRING, type STRING, profile STRING, name STRING, todoNew INT, todoTaken INT, done INT, dueMS INT, updatedAtMS INT)').run();
    this.db.prepare('CREATE TABLE IF NOT EXISTS files (id INTEGER PRIMARY KEY NOT NULL, job REFERENCES jobs(id) ON DELETE CASCADE ON UPDATE CASCADE, status STRING, path STRING)').run();

    this.insertJob = this.db.prepare('INSERT INTO jobs (cID, root, type, profile, name, todoNew, todoTaken, done, dueMS, updatedAtMS) VALUES (@cID, @root, @type, @profile, @name, @todoNew, @todoTaken, @done, @dueMS, @updatedAtMS)');
    this.deleteJob = this.db.prepare('DELETE FROM jobs WHERE cID = @cID')
    this.insertImage = this.db.prepare('INSERT INTO files (job, status, path) VALUES (@job, @status, @path)');

    this.selectNew = this.db.prepare('SELECT * FROM jobs WHERE todoNew > 0 ORDER BY cID ASC;');

    const thisclass = this;
    this.insertImages = this.db.transaction((images) => {
      for (const image of images) thisclass.insertImage.run(image);
    })
  }

  addJob(job) {
    return this.insertJob.run(job).lastInsertRowid;
  }

  delJob(cID) {
    return this.deleteJob.run({cID});
  }

  addImages(images) {
    return this.insertImages(images);
  }
}

module.exports = database;
