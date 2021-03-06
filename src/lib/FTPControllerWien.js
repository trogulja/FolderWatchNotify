if (!process.env.LOADED) require('./config');
const PromiseFTP = require('promise-ftp');
const path = require('path');
const ftp = new PromiseFTP();
const { EventEmitter } = require('events');

const rules = {
  ftpOptions: {
    host: process.env.FTP_WIENNA_HOST,
    user: process.env.FTP_WIENNA_USER,
    password: process.env.FTP_WIENNA_PASS,
  },
  cID: 'ftp_wien',
  diva: {
    ftpEntry: '/FCL/Diva',
    jobnames: [
      {
        regexp: new RegExp('Diva.(\\d+).(\\d+).Nr.(\\d+)(?:[^/]\\w+)?', 'i'),
        name: 'Diva',
        issue: 3,
        month: 1,
        year: 2,
      },
      {
        regexp: new RegExp('Diva.?Solitaire.Nr.(\\d+)', 'i'),
        name: 'Diva Solitaire',
        issue: 1,
        month: null,
        year: null,
      },
      {
        regexp: new RegExp('DivaDandy.(\\d+).(\\d+)', 'i'),
        name: 'Diva Dandy',
        issue: 1,
        month: null,
        year: 2,
      },
      {
        regexp: new RegExp('DivaWohnen.(\\d+).(\\d+).Nr.(\\d+)', 'i'),
        name: 'Diva Wohnen',
        issue: 3,
        month: null,
        year: 2,
      },
    ],
    steps: {
      [4]: new RegExp('PRODUKTION', 'i'),
      [5]: new RegExp('Bilder für Litho', 'i'),
    },
    parseStatus: {
      taken: { id: 6, str: new RegExp('_[A-Z]{2}$|_In Bearbeitung$') },
      done: { id: 6, str: new RegExp('FERTIG|DONE', 'i') },
    },
    job: {
      root: `ftp://${process.env.FTP_WIENNA_HOST}`,
      type: 'heatset',
      profile: 'ISO Coated v2 300',
      name: 'Diva',
    },
  },
  wienerin: {
    ftpEntry: '/FCL/Wienerin',
    jobnames: [
      {
        regexp: new RegExp('Kochzeitung.(\\d+).(\\d+)', 'i'),
        name: 'Kochzeitung',
        issue: 1,
        month: null,
        year: 2,
      },
      {
        regexp: new RegExp('spar.mahlzeit.(\\d+).(\\d+)', 'i'),
        name: 'Spar Mahlzeit',
        issue: 1,
        month: null,
        year: 2,
      },
      {
        regexp: new RegExp('spar.?mahlzeit.junior.(\\d+).(\\d+)', 'i'),
        name: 'Spar Mahlzeit Junior',
        issue: 1,
        month: null,
        year: 2,
      },
      {
        regexp: new RegExp('wienerin.(\\d+).(\\d+).Nr.(\\d+)', 'i'),
        name: 'Wienerin',
        issue: 3,
        month: 1,
        year: 2,
      },
    ],
    steps: {
      [4]: new RegExp('PRODUKTION', 'i'),
      [5]: new RegExp('Bilder für Litho', 'i'),
    },
    parseStatus: {
      taken: { id: 6, str: new RegExp('_[A-Z]{2}$|_In Bearbeitung$') },
      done: { id: 6, str: new RegExp('FERTIG|DONE', 'i') },
    },
    job: {
      root: `ftp://${process.env.FTP_WIENNA_HOST}`,
      type: 'heatset',
      profile: 'ISO Coated v2 300',
      name: 'Wienerin',
    },
  },
  rapidfak: {
    ftpEntry: '/MCL/Rapid/Fanartikelkatalog',
    jobnames: [
      {
        regexp: new RegExp('Katalog ([^\\d]+)(\\d+)', 'i'),
        name: 'Rapid Fanartikelkatalog',
        issue: 1,
        month: null,
        year: 2,
      },
    ],
    steps: {
      [5]: new RegExp('LITHO', 'i'),
    },
    parseStatus: {
      taken: { id: 6, str: new RegExp('_[A-Z]{2}$|(?:B|b)earbeit(?:en|ung)|(?:T|t)aken|TAKEN') },
      done: { id: 6, str: new RegExp('FERTIG|DONE', 'i') },
    },
    job: {
      root: `ftp://${process.env.FTP_WIENNA_HOST}`,
      type: 'heatset',
      profile: 'ISO Coated v2 300',
      name: 'Rapid Fanartikelkatalog',
    },
  },
  rapidmagazin: {
    ftpEntry: '/MCL/Rapid/Rapid Magazin',
    jobnames: [
      {
        regexp: new RegExp('Rapid Magazin.(\\d+).(\\d+)', 'i'),
        name: 'Rapid Magazin',
        issue: 1,
        month: null,
        year: 2,
      },
    ],
    steps: {
      [5]: new RegExp('PRODUKTION', 'i'),
      [6]: new RegExp('Bilder für Litho', 'i'),
    },
    parseStatus: {
      taken: { id: 7, str: new RegExp('_[A-Z]{2}$|(?:B|b)earbeit(?:en|ung)|(?:T|t)aken|TAKEN') },
      done: { id: 7, str: new RegExp('FERTIG|DONE', 'i') },
    },
    job: {
      root: `ftp://${process.env.FTP_WIENNA_HOST}`,
      type: 'heatset',
      profile: 'ISO Coated v2 300',
      name: 'Rapid Magazin',
    },
  },
  corner: {
    ftpEntry: '/MCL/ÖFB/Corner',
    jobnames: [
      {
        regexp: new RegExp('Nr(\\d+).ÖFB.Corner.(\\d+).(\\d+)', 'i'),
        name: 'ÖFB Corner',
        issue: 2,
        month: null,
        year: 3,
      },
    ],
    steps: {
      [5]: new RegExp('LITHO', 'i'),
    },
    parseStatus: {
      taken: { id: 6, str: new RegExp('_[A-Z]{2}$|(?:B|b)earbeit(?:en|ung)|(?:T|t)aken|TAKEN') },
      done: { id: 6, str: new RegExp('FERTIG|DONE', 'i') },
    },
    job: {
      root: `ftp://${process.env.FTP_WIENNA_HOST}`,
      type: 'heatset',
      profile: 'ISO Coated v2 300',
      name: 'ÖFB Corner',
    },
  },
  activebeauty: {
    ftpEntry: '/SCP/Active Beauty',
    jobnames: [
      {
        regexp: new RegExp('Active ?Beauty.(\\d+).(\\d+)', 'i'),
        name: 'Active Beauty',
        issue: null,
        month: 1,
        year: 2,
      },
      {
        regexp: new RegExp('Active.?Beauty.?Family.?Nummer(\\d+)', 'i'),
        name: 'Active Beauty Family',
        issue: 1,
        month: null,
        year: null,
      },
    ],
    steps: {
      [4]: new RegExp('PRODUKTION', 'i'),
      [5]: new RegExp('Bilder für Litho', 'i'),
    },
    parseStatus: {
      taken: { id: 6, str: new RegExp('_[A-Z]{2}$|(?:B|b)earbeit(?:en|ung)|(?:T|t)aken|TAKEN') },
      done: { id: 6, str: new RegExp('FERTIG|DONE', 'i') },
    },
    job: {
      root: `ftp://${process.env.FTP_WIENNA_HOST}`,
      type: 'heatset',
      profile: 'ISO Coated v2 300',
      name: 'Active Beauty',
    },
  },
  hub: {
    ftpEntry: '/SCP/hub-HKSÖL',
    jobnames: [
      {
        regexp: new RegExp('HUB.(\\d+).(\\d+)', 'i'),
        name: 'HUB',
        issue: 1,
        month: null,
        year: 2,
      },
    ],
    steps: {
      [4]: new RegExp('PRODUKTION', 'i'),
      [5]: new RegExp('Bilder für Litho', 'i'),
    },
    parseStatus: {
      taken: { id: 6, str: new RegExp('_[A-Z]{2}$|(?:B|b)earbeit(?:en|ung)|(?:T|t)aken|TAKEN') },
      done: { id: 6, str: new RegExp('FERTIG|DONE', 'i') },
    },
    job: {
      root: `ftp://${process.env.FTP_WIENNA_HOST}`,
      type: 'heatset',
      profile: 'ISO Coated v2 300',
      name: 'HUB',
    },
  },
  va: {
    ftpEntry: '/SCP/VA',
    jobnames: [
      {
        regexp: new RegExp('VA.(\\d{2}).?(\\d{2})[^/]+', 'i'),
        name: 'VoestAlpine',
        nested: true,
        issue: 1,
        month: null,
        year: 2,
      },
    ],
    steps: {
      [4]: new RegExp('PRODUKTION', 'i'),
      [5]: new RegExp('Bilder für Litho', 'i'),
    },
    parseStatus: {
      taken: { id: 6, str: new RegExp('_[A-Z]{2}$|(?:B|b)earbeit(?:en|ung)|(?:T|t)aken|TAKEN') },
      done: { id: 6, str: new RegExp('FERTIG|DONE', 'i') },
    },
    job: {
      root: `ftp://${process.env.FTP_WIENNA_HOST}`,
      type: 'heatset',
      profile: 'ISO Coated v2 300',
      name: 'VoestAlpine',
    },
  },
};

class FTPControllerWien {
  constructor(location) {
    // valid location: diva, wienerin, rapidfak, rapidmagazin, corner, activebeauty, hub, va
    this.ftpOptions = rules.ftpOptions;
    this.ftpEntry = rules[location].ftpEntry;
    this.jobnames = rules[location].jobnames;
    this.steps = rules[location].steps;
    this.parseStatus = rules[location].parseStatus;
    this.garbage = { directories: [], files: [], extensions: new Set(), indd: new Set() };
    this.jobTemplate = { ...rules[location].job };
    this.cID = `${rules.cID} / ${rules[location].job.name}`;
    this.events = new EventEmitter();
  }

  async runme() {
    let dataRaw = await this.walk();
    if (dataRaw === false) dataRaw = await this.walk();
    const data = this.handleData(dataRaw);
    return data;
  }

  async walk() {
    const thisclass = this;

    try {
      const serverMessage = await ftp.connect(this.ftpOptions);
      thisclass.events.emit('info', `${this.cID} message: ${serverMessage}`);
    } catch (error) {
      thisclass.events.emit('log', 'Error during ftp.connect - in FTPControllerWien.walk()');
      thisclass.events.emit('log', `${error.name} (${error.code}): ${error.message}`);
      if (ftp.getConnectionStatus() === 'connected') ftp.destroy();
      if (ftp.getConnectionStatus() === 'connecting') ftp.destroy();
      return false;
    }

    async function walkDir(dir) {
      let files = await readDir(dir);
      if (!files) return false;
      let initialDepth = files.length ? files[0].path.split('/').length - 1 : 0;
      const jobs = [];
      const output = [];

      for await (const file of files) {
        const fileFrag = file.path.split('/');
        const depth = fileFrag.length - 1;
        let pushIt = false;
        let nested = false;
        let hits = 0;
        // depth == init in normal cases, and depth -1 == init - when job can have subjobs
        // deal with nested jobs
        for (const job of thisclass.jobnames) {
          if (!job.nested) continue;

          fileFrag.forEach((frag) => {
            if (job.regexp.test(frag)) hits += 1;
          });

          if (hits > 1) {
            nested = true;
            break;
          }
        }

        if (depth === initialDepth || (nested && depth === initialDepth + 1)) {
          // search for jobnames and push them into files
          for (const job of thisclass.jobnames) {
            if (job.regexp.test(path.basename(file.path))) {
              // create a new job here .. ignore old jobs
              // thisclass.jobTemplate = rules[location].job
              const jobfrag = job.regexp.exec(path.basename(file.path));
              const nowtime = new Date().getTime();
              let jobtime = null;
              if (job.year) {
                const jobmonth = job.month ? jobfrag[job.month] - 1 : 11;
                const jobyear =
                  jobfrag[job.year].length >= 4
                    ? jobfrag[job.year]
                    : Number(
                        `${new Date()
                          .getFullYear()
                          .toString()
                          .substring(0, 4 - jobfrag[job.year].length)}${jobfrag[job.year]}`
                      );
                jobtime = new Date(jobyear, jobmonth, 25, 12).getTime();
              }
              // Ignore jobs that are over 6 months old
              if (jobtime) if (nowtime - jobtime > 1.577e10) break;

              jobs.push({
                root: `${thisclass.jobTemplate.root}${file.path}`,
                type: thisclass.jobTemplate.type,
                profile: thisclass.jobTemplate.profile,
                name: path.basename(file.path),
                todoNew: 0,
                todoTaken: 0,
                done: 0,
                dueMS: 0,
                updatedAtMS: new Date().getTime(),
              });
              pushIt = true;
              break;
            }
          }
        } else if (thisclass.steps[depth] || (nested && thisclass.steps[depth - 1])) {
          // we have a required step for this depth, test it and if true, push into files
          if (nested) {
            if (thisclass.steps[depth - 1].test(path.basename(file.path))) pushIt = true;
          } else {
            if (thisclass.steps[depth].test(path.basename(file.path))) pushIt = true;
          }
        } else {
          // we are deep enough to process all files
          pushIt = true;
          // Ignore fertig, because it causes issues and long load times
          // if (thisclass.parseStatus.done.str.test(path.basename(file.path))) pushIt = false;
        }

        if (pushIt) {
          if (file.type === 'directory') {
            const newFiles = await readDir(file.path);
            if (newFiles) files.push(...newFiles);
          } else {
            output.push(file);
          }
        }
      }

      return { jobs, output };
    }

    async function readDir(dir) {
      let files;
      thisclass.events.emit('info', `Reading: ${dir}`);

      for (let i = 0; i < 4; i++) {
        try {
          files = await ftp.listSafe(dir, false);
          if (files) break;
        } catch (error) {
          thisclass.events.emit('log', `readDir() ${error.name} (${error.code}): ${error.message}`);
          thisclass.events.emit('log', `readDir() retry #${i + 1} for ${dir}`);
          if (error.code === 'ECONNRESET') {
            ftp.destroy();
            try {
              const serverMessage = await ftp.connect(thisclass.ftpOptions);
              thisclass.events.emit('log', `${thisclass.cID} message: ${serverMessage}`);
            } catch (error) {
              thisclass.events.emit(
                'log',
                'Error during ftp.connect - in FTPControllerWien.readDir()'
              );
              thisclass.events.emit('log', `${error.name} (${error.code}): ${error.message}`);
              break;
            }
            continue;
          } else {
            ftp.destroy();
            break;
          }
        }
      }

      if (!files) {
        thisclass.events.emit('log', `readDir() failed permanently for ${dir}`);
        return false;
      }

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
    // data.jobs = { root, type, profile, name, todoNew, todoTaken, done, dueMS, updatedAtMS }
    // data.output = { path, type }
    const files = data.output.filter((el) => el.type === 'file').map((el) => el.path);
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

      const jobID = thisclass.matchJobFile(data.jobs, f);

      images.push({ jobID, status, path: f });
    });

    const newImages = images.filter((el) => {
      let res = true;
      const file = path.basename(el.path);
      const ext = path.extname(el.path).toLowerCase();
      if (ext === 'pdf') {
        thisclass.garbage.indd.forEach((e) => {
          if (!res) return;
          if (new RegExp(e.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).test(file)) {
            res = false;
            thisclass.garbage.files.push({ str: el.path, err: `indesign file matched => "${e}" with "${file}"!` });
          }
        });
      }
      return res;
    });

    newImages.forEach((img) => (data.jobs[img.jobID][img.status] += 1));

    return { cID: this.cID, jobs: data.jobs, images };
  }

  matchJobFile(jobs, fullpath) {
    const thisclass = this;
    let output = 0;
    jobs.forEach((job, i) => {
      if (new RegExp(`^${job.root.replace(thisclass.jobTemplate.root, '')}`).test(fullpath))
        output = i;
    });
    return output;
  }

  parseFileStatus(fullpath) {
    const frag = fullpath.split('/');
    let status = 'todoNew';

    if (!this.parseStatus.taken.id) {
      if (this.parseStatus.taken.str.test(fullpath)) status = 'todoTaken';
    } else if (frag.length > this.parseStatus.taken.id) {
      if (this.parseStatus.taken.str.test(frag[this.parseStatus.taken.id])) status = 'todoTaken';
      if (this.parseStatus.taken.str.test(frag[this.parseStatus.taken.id + 1]))
        status = 'todoTaken';
    }

    if (!this.parseStatus.done.id) {
      if (this.parseStatus.done.str.test(fullpath)) status = 'done';
    } else if (frag.length > this.parseStatus.done.id) {
      if (this.parseStatus.done.str.test(frag[this.parseStatus.done.id])) status = 'done';
      if (this.parseStatus.done.str.test(frag[this.parseStatus.done.id + 1])) status = 'done';
    }

    return status;
  }

  destroy() {
    return ftp.destroy();
  }
}

module.exports = FTPControllerWien;
