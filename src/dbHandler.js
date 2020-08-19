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

walk('Q:\\_JOBS').then((data) => {
  const jobs = handleData(data);
  console.log(jobs.filter((el) => el.todoNew));
});

// const rawdata = fs.readFile('output.json').then((data) => {
//   handleData(JSON.parse(data));
//   // console.log(parsed)
// });

function handleData(data) {
  const directories = data.filter((el) => el.type === 'directory').map((el) => el.path);
  const files = data.filter((el) => el.type === 'file').map((el) => el.path);
  const garbage = { directories: [], files: [], extensions: new Set(), indd: new Set() };
  const jobs = [];
  const images = [];

  directories.forEach((d) => {
    const job = parsePath(d, 'directory');
    if (job.err) return garbage.directories.push(job);
    jobs.push({ ...job, todoNew: 0, todoTaken: 0, done: 0 });
  });

  files.forEach((f) => {
    const item = parsePath(f, 'file');
    if (item.err) return garbage.files.push(item);
    if (!/\.(gif|jpe?g|tiff?|png|webp|bmp|psd|pdf|ai|eps|cdr|jfif|psb)$/i.test(f)) {
      if (path.extname(f) === '.indd') return garbage.indd.add(path.basename(f, '.indd'));
      if (path.basename(f) === 'Thumbs.db') return;
      garbage.extensions.add(path.extname(f));
      return garbage.files.push({ str: f, err: `extension is ignored` });
    }
    const i = findIndex(jobs, {
      root: item.root,
      type: item.type,
      profile: item.profile,
      name: item.name,
    });
    if (i < 0) throw new Error('This file exists outside of directory structure!', item);

    const status = parseFileStatus(f);
    images.push({ ...item, id: i, status });
    // jobs[i][status] += 1;
  });

  const newImages = images.filter((el) => {
    let res = true;
    garbage.indd.forEach((e) => {
      if (!res) return;
      if (new RegExp(e).test(el.path)) res = false;
    });
    return res;
  });
  // console.log(jobs);
  // console.log(`garbage dirs: ${garbage.directories.length}, garbage files: ${garbage.files.length}`);
  // console.log(garbage.files);
  // console.log(garbage.extensions);
  return jobs;
}

function parsePath(fullpath, type) {
  // fulpath == Q:\_JOBS\Werbemarkt\heatset\ISO Coated v2 300\1436-2006-Dasein02 Bilder\TODO\something.psd
  // type    == file || directory
  const frag = fullpath.split(path.sep);

  const lengthRoot = type === 'directory' ? 3 : 6;
  if (frag.length < lengthRoot)
    return { str: fullpath, err: `path length less than ${lengthRoot}` };
  if (type !== 'directory' && type !== 'file')
    return { str: fullpath, err: `type "${type}" is not known` };

  if (frag[2] !== 'Werbemarkt' && frag[2] !== 'Others')
    return { str: fullpath, err: '#3 not Werbemarkt or Others' };

  // ANTENNE exception
  if (frag[3] === 'ANTENNE') {
    if (type === 'directory') {
      if (frag.length !== 5) return { str: fullpath, err: 'ANTENNE dir path length not 5' };
    } else {
      if (frag.length <= 5) return { str: fullpath, err: 'ANTENNE file path length not 6+' };
    }
    return {
      root: path.join('\\\\srvczg-files\\ftp_hr_m4\\_JOBS\\', frag[2]),
      type: frag[3],
      profile: 'Newspaper Coldset V5',
      name: frag[4],
      path: fullpath,
    };
  }

  // Regular jobs
  if (frag[3] !== 'coldset' && frag[3] !== 'heatset')
    return { str: fullpath, err: '#4 not heatset or coldset' };

  const lengthItem = frag[3] === 'heatset' ? 6 : 5;
  if (type === 'directory') {
    if (frag.length !== lengthItem)
      return { str: fullpath, err: `${frag[3]} dir path length not ${lengthItem}` };
  } else {
    if (frag.length <= lengthItem)
      return { str: fullpath, err: `${frag[3]} file path length not ${lengthItem + 1}+` };
  }

  const profile = frag[3] === 'heatset' ? frag[4] : 'Newspaper Coldset V5';
  const name = frag[3] === 'heatset' ? frag[5] : frag[4];

  return { root: path.join('\\\\srvczg-files\\ftp_hr_m4\\_JOBS\\', frag[2]), type: frag[3], profile, name, path: fullpath };
}

function parseFileStatus(fullpath) {
  // const todo = new RegExp('\\.?to.?do.?\\', 'i');
  // const todoDE = new RegExp('\\.?zu.?.?bearbeiten\\', 'i');
  const done = new RegExp('\\\\.?done\\\\', 'i');
  const doneDE = new RegExp('\\\\.?fertig\\\\', 'i');
  const taken = new RegExp('\\\\.?taken', 'i');

  let status = 'todoNew';

  if (taken.test(fullpath)) status = 'todoTaken';
  if (done.test(fullpath)) status = 'done';
  if (doneDE.test(fullpath)) status = 'done';

  return status;
}
