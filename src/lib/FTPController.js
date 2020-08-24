const PromiseFTP = require('promise-ftp');
const path = require('path');
const ftp = new PromiseFTP();
const paths = require('./pathHandler');
if (!process.env.LOADED) require('dotenv').config({ path: path.join(paths.root, '.env') });

const rules = {
  monat: {
    ftpOptions: {
      host: process.env.FTP_MONAT_HOST,
      user: process.env.FTP_MONAT_USER,
      password: process.env.FTP_MONAT_PASS,
    },
    ftpIgnores: [new RegExp('arhiva', 'i')],
    ftpEntry: '/FTPdigital/_Kaerntner_Monat',
    parseStatus: {
      taken: { id: 3, str: new RegExp('taken', 'i') },
      done: { id: 3, str: new RegExp('fertig', 'i') },
    },
    job: {
      root: `ftp://${process.env.FTP_MONAT_USER}@${process.env.FTP_MONAT_HOST}/FTPdigital/_Kaerntner_Monat`,
      type: 'coldset',
      profile: 'Newspaper Coldset V5',
      name: 'Monat',
      todoNew: 0,
      todoTaken: 0,
      done: 0,
    },
    cID: 'ftp_monat',
  },
  start: {
    ftpOptions: {
      host: process.env.FTP_START_HOST,
      user: process.env.FTP_START_USER,
      password: process.env.FTP_START_PASS,
    },
    ftpIgnores: [new RegExp('arhiva', 'i')],
    ftpEntry: '/start',
    parseStatus: {
      taken: { id: null, str: new RegExp('uzeto', 'i') },
      done: { id: 2, str: new RegExp('gotov', 'i') },
    },
    job: {
      root: `ftp://${process.env.FTP_START_USER}@${process.env.FTP_START_HOST}/start`,
      type: 'heatset',
      profile: 'LWC Improved',
      name: 'Start',
      todoNew: 0,
      todoTaken: 0,
      done: 0,
    },
    cID: 'ftp_start',
  },
  ['7dnevno']: {
    ftpOptions: {
      host: process.env.FTP_7DNEVNO_HOST,
      user: process.env.FTP_7DNEVNO_USER,
      password: process.env.FTP_7DNEVNO_PASS,
    },
    ftpIgnores: [new RegExp('arhiva', 'i')],
    ftpEntry: '/7dnevno',
    parseStatus: {
      taken: { id: null, str: new RegExp('uzeto', 'i') },
      done: { id: 2, str: new RegExp('gotov', 'i') },
    },
    job: {
      root: `ftp://${process.env.FTP_7DNEVNO_USER}@${process.env.FTP_7DNEVNO_HOST}/7dnevno`,
      type: 'coldset',
      profile: 'Newspaper Coldset V4',
      name: '7dnevno',
      todoNew: 0,
      todoTaken: 0,
      done: 0,
    },
    cID: 'ftp_7dnevno',
  },
  emmezeta: {
    ftpOptions: {
      host: process.env.FTP_EMMEZETA_HOST,
      user: process.env.FTP_EMMEZETA_USER,
      password: process.env.FTP_EMMEZETA_PASS,
    },
    ftpIgnores: [new RegExp('arhiva', 'i')],
    ftpEntry: '/emmezeta',
    parseStatus: {
      taken: { id: 3, str: new RegExp('uzeto', 'i') },
      done: { id: 2, str: new RegExp('gotov', 'i') },
    },
    job: {
      root: `ftp://${process.env.FTP_EMMEZETA_USER}@${process.env.FTP_EMMEZETA_HOST}/emmezeta`,
      type: 'web',
      profile: 'sRGB',
      name: 'Emmezeta',
      todoNew: 0,
      todoTaken: 0,
      done: 0,
    },
    cID: 'ftp_emmezeta',
  },
  opravdano: {
    ftpOptions: {
      host: process.env.FTP_OPRAVDANO_HOST,
      user: process.env.FTP_OPRAVDANO_USER,
      password: process.env.FTP_OPRAVDANO_PASS,
    },
    ftpIgnores: [new RegExp('arhiva', 'i')],
    ftpEntry: '/Opravdano',
    parseStatus: {
      taken: { id: 2, str: new RegExp('uzeto', 'i') },
      done: { id: 2, str: new RegExp('gotov', 'i') },
    },
    job: {
      root: `ftp://${process.env.FTP_OPRAVDANO_USER}@${process.env.FTP_OPRAVDANO_HOST}/Opravdano`,
      type: 'coldset',
      profile: 'Newspaper Coldset V4',
      name: 'Opravdano',
      todoNew: 0,
      todoTaken: 0,
      done: 0,
    },
    cID: 'ftp_opravdano',
  },
};

class FTPController {
  constructor(location) {
    // valid location: monat, start, 7dnevno, emmezeta, opravdano
    this.ftpOptions = rules[location].ftpOptions;
    this.ftpIgnores = rules[location].ftpIgnores;
    this.ftpEntry = rules[location].ftpEntry;
    this.parseStatus = rules[location].parseStatus;
    this.garbage = { directories: [], files: [], extensions: new Set(), indd: new Set() };
    this.jobs = [{ ...rules[location].job }];
    this.cID = rules[location].cID;
  }

  async runme() {
    const dataRaw = await this.walk();
    const data = this.handleData(dataRaw);
    return data;
  }

  async walk() {
    const thisclass = this;

    try {
      const serverMessage = await ftp.connect(this.ftpOptions);
      console.log(this.cID, 'message:', serverMessage);
    } catch (error) {
      return console.log(`${error.name} (${error.code}): ${error.message}`);
    }

    async function walkDir(dir) {
      const files = await readDir(dir);
      const output = [];

      for await (const file of files) {
        let shouldIgnore = false;
        for (const ignore of thisclass.ftpIgnores) {
          if (ignore.test(file.path)) shouldIgnore = true;
        }
        if (shouldIgnore) {
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

    const data = await walkDir(this.ftpEntry);
    await ftp.end();

    return data;
  }

  handleData(data) {
    const files = data.filter((el) => el.type === 'file').map((el) => el.path);
    const images = [];
    const thisclass = this;

    files.forEach((f) => {
      if (!/\.(gif|jpe?g|tiff?|png|webp|bmp|psd|pdf|ai|eps|cdr|jfif|psb)$/i.test(f)) {
        if (path.extname(f) === '.indd')
          return thisclass.garbage.indd.add(path.basename(f, '.indd'));
        if (path.basename(f) === 'Thumbs.db') return;
        thisclass.garbage.extensions.add(path.extname(f));
        return thisclass.garbage.files.push({ str: f, err: `extension is ignored` });
      }

      const status = thisclass.parseFileStatus(f);
      images.push({ jobID: 0, status, path: f });
    });

    const newImages = images.filter((el) => {
      let res = true;
      thisclass.garbage.indd.forEach((e) => {
        if (!res) return;
        if (new RegExp(e).test(el.path)) res = false;
      });
      return res;
    });

    newImages.forEach((img) => (thisclass.jobs[0][img.status] += 1));

    return { cID: this.cID, jobs: this.jobs, images };
  }

  parseFileStatus(fullpath) {
    const frag = fullpath.split('/');
    let status = 'todoNew';

    if (!this.parseStatus.taken.id) {
      if (this.parseStatus.taken.str.test(fullpath)) status = 'todoTaken';
    } else if (frag.length > this.parseStatus.taken.id) {
      if (this.parseStatus.taken.str.test(frag[this.parseStatus.taken.id])) status = 'todoTaken';
    }

    if (!this.parseStatus.done.id) {
      if (this.parseStatus.done.str.test(fullpath)) status = 'done';
    } else if (frag.length > this.parseStatus.done.id) {
      if (this.parseStatus.done.str.test(frag[this.parseStatus.done.id])) status = 'done';
    }

    return status;
  }
}

module.exports = FTPController;
