const PromiseFTP = require('promise-ftp');
const path = require('path');
const paths = require('./lib/pathHandler');
const fs = require('fs');
const ftp = new PromiseFTP();
if (!process.env.LOADED) require('dotenv').config({ path: path.join(paths.root, '.env') });

class ftp_7dnevno {
  static async runme() {
    const ftpOptions = { host: process.env.FTP_7DNEVNO_HOST, user: process.env.FTP_7DNEVNO_USER, password: process.env.FTP_7DNEVNO_PASS };

    try {
      const serverMessage = await ftp.connect(ftpOptions);
      console.log('Server message:', serverMessage);
    } catch (error) {
      return console.log(`${error.name} (${error.code}): ${error.message}`);
    }

    async function walk(dir) {
      const files = await readDir(dir);
      const output = [];

      const ignore = new RegExp('arhiva|gotovo', 'i');

      for await (const file of files) {
        // console.log(file)
        if (ignore.test(file.path)) {
          console.log(`Ignoring ${file.path}`);
        } else {
          output.push(file);
          if (file.type === 'directory') {
            const newFiles = await readDir(file.path);
            files.push(...newFiles);
          }
        }
      }

      return output;
    }

    async function readDir(dir) {
      let files = await ftp.list(dir);
      files = files.map((file) => {
        const filePath = path.join(dir, file.name).split(path.sep).join('/');
        return { path: filePath, type: file.type === 'd' ? 'directory' : 'file' };
      });
      return files;
    }

    const data = await walk('/7dnevno');
    await ftp.end();

    return data;
  }

  static handleData(data) {
    // o jebote...
  }
}

ftp_7dnevno.runme().then(console.log);
