const path = require('path');
const paths = require('./pathHandler');
const Database = require('better-sqlite3');
// const db = new Database(path.join(paths.db, 'folderWatcher.db'), { verbose: console.log });

// db.pragma('journal_mode = WAL');
// db.prepare(
//   'CREATE TABLE IF NOT EXISTS jobs (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, root STRING, type STRING, profile STRING, name STRING, location STRING, todoNew INT, todoTaken INT, done INT, dueMS INT, updatedAtMS INT)'
// ).run();
// db.prepare(
//   'CREATE TABLE IF NOT EXISTS files (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, job REFERENCES jobs(id) ON DELETE CASCADE ON UPDATE CASCADE, filename STRING, dirname STRING, status STRING)'
// ).run();

class dbHandler {
  static addJob(job) {}

  static addFile(file) {}

  static delJob(job) {}

  static delFiles(job) {}
}

module.exports = dbHandler;

// const walk = require('walk');
// let walker;
// const options = {
//   followLinks: false,
//   filters: ['Temp', '_Temp'],
// };
// walker = walk.walk('C:\\Users\\Tibor\\AppData\\Local\\Temp\\test_folders', options);

// walker.on('names', function (root, nodeNamesArray) {
//   console.log('names: root, nodeNamesArray');
//   console.log(root);
//   console.log(nodeNamesArray);
// });

// walker.on('directories', function (root, dirStatsArray, next) {
//   console.log('directories: root, dirStatsArray, next');
//   console.log(root);
//   console.log(dirStatsArray);
//   next();
// });

// walker.on('file', function (root, fileStats, next) {
//   console.log('file: root, fileStats, next');
//   console.log(root);
//   console.log(fileStats);
//   next();
// });

// walker.on('errors', function (root, nodeStatsArray, next) {
//   console.log('errors: root, nodeStatsArray, next');
//   console.log(root);
//   console.log(nodeStatsArray);
//   next();
// });

// walker.on('end', function () {
//   console.log('end');
// });

const fs = require('fs').promises;
const { uniq, uniqBy, findIndex } = require('lodash');

async function walk(dir) {
  let files = await fs.readdir(dir);
  files = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(dir, file);
      const stats = await fs.stat(filePath);
      if (stats.isDirectory()) return walk(filePath);
      else if (stats.isFile()) return { path: filePath, type: 'file' };
    })
  );
  return files.reduce((all, folderContents) => all.concat(folderContents), [
    { path: dir, type: 'directory' },
  ]);
}

// walk('C:\\Users\\Tibor\\AppData\\Local\\Temp\\test_folders').then(console.log);

// const rawdata = fs.readFile('output.json').then((data) => {
//   const parsed = JSON.parse(data);
//   handleData(parsed);
//   // console.log(parsed)
// });

function handleData(data) {
  const directories = data.filter((el) => el.type === 'directory').map((el) => el.path);
  const files = data.filter((el) => el.type === 'file').map((el) => el.path);
  const jobs = handleDirectories(directories);
  handleFiles(files, jobs);
}

const rootDir = 'Q:\\_JOBS';

function handleDirectories(directories) {
  const output = [];
  const garbage = [];

  directories.forEach((directory) => {
    // root dir == Q, _JOBS ... length == 2
    const frag = directory.split(path.sep);
    let job = {
      root: 'Werbemarkt',
      type: 'heatset',
      profile: 'ISO Coated v2 300',
      name: '1436-2006-Dasein02 Bilder',
      path: 'Q:\\_JOBS\\Werbemarkt\\heatset\\ISO Coated v2 300\\1436-2006-Dasein02 Bilder',
    };

    if (frag.length < 3) return garbage.push({ str: directory, err: 'path length less than 3' });

    if (frag[2] === 'Werbemarkt' || frag[2] === 'Others') {
      if (frag[3] === 'heatset') {
        if (frag.length !== 6)
          return garbage.push({ str: directory, err: 'heatset path length not 6' });
        job = { root: frag[2], type: frag[3], profile: frag[4], name: frag[5], path: directory };
      } else if (frag[3] === 'coldset') {
        if (frag.length !== 5)
          return garbage.push({ str: directory, err: 'coldset path length not 5' });
        job = {
          root: frag[2],
          type: frag[3],
          profile: 'Newspaper Coldset V5',
          name: frag[4],
          path: directory,
        };
      } else {
        return garbage.push({ str: directory, err: '#4 not heatset or coldset' });
      }
    } else {
      return garbage.push({ str: directory, err: '#3 not Werbemarkt or Others' });
    }

    output.push(job);
  });

  // console.log(output);
  // const output2 = uniqBy(output, 'type');
  // console.log('output2 len =', output2.length);
  // console.log('output len =', output.length);

  console.log(garbage); // handle garbage somehow
  return output;
}

function handleFiles(files, jobs) {
  const output = [];
  const garbage = [];
  files.forEach((file) => {
    const frag = file.split(path.sep);
    let find = {
      root: 'Werbemarkt',
      type: 'heatset',
      profile: 'ISO Coated v2 300',
      name: '1436-2006-Dasein02 Bilder',
      file: 'something.psd',
      path:
        'Q:\\_JOBS\\Werbemarkt\\heatset\\ISO Coated v2 300\\1436-2006-Dasein02 Bilder\\TODO\\something.psd',
    };

    if (frag.length < 6) return garbage.push({ str: file, err: 'path length less than 6' });

    if (frag[2] === 'Werbemarkt' || frag[2] === 'Others') {
      if (frag[3] === 'heatset') {
        find = { root: frag[2], type: frag[3], profile: frag[4], name: frag[5] };
      } else if (frag[3] === 'coldset') {
        // do the coldset
      } else {
        return garbage.push({ str: file, err: '#4 not heatset or coldset' });
      }
    } else {
      return garbage.push({ str: file, err: '#3 not Werbemarkt or Others' });
    }
  });
}

var users = [
  { user: 'barney', active: false, blob: 'kenja' },
  { user: 'fred', active: false, blob: 'kenja' },
  { user: 'pebbles', active: true, blob: 'kenja' },
];

console.log(findIndex(users, { user: 'barney', blob: 'kenja', active: true }));
