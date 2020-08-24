const PromiseFTP = require('promise-ftp');
const path = require('path');
const ftp = new PromiseFTP();
const paths = require('./pathHandler');
if (!process.env.LOADED) require('dotenv').config({ path: path.join(paths.root, '.env') });

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
      done: { id: 6, str: new RegExp('FERTIG', 'i') },
    },
    job: {
      root: `ftp://${process.env.FTP_WIENNA_HOST}/FCL/Diva`,
      type: 'heatset',
      profile: 'ISO Coated v2 300',
      name: 'Diva',
    },
  },
  wienerin: {
    ftpEntry: '/FCL/Wienerin',
    jobnames: [
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
      done: { id: 6, str: new RegExp('FERTIG', 'i') },
    },
    job: {
      root: `ftp://${process.env.FTP_WIENNA_HOST}/FCL/Wienerin`,
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
      done: { id: 6, str: new RegExp('FERTIG', 'i') },
    },
    job: {
      root: `ftp://${process.env.FTP_WIENNA_HOST}/MCL/Rapid/Fanartikelkatalog`,
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
      done: { id: 7, str: new RegExp('FERTIG', 'i') },
    },
    job: {
      root: `ftp://${process.env.FTP_WIENNA_HOST}/MCL/Rapid/Rapid Magazin`,
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
      done: { id: 6, str: new RegExp('FERTIG', 'i') },
    },
    job: {
      root: `ftp://${process.env.FTP_WIENNA_HOST}/MCL/ÖFB/Corner`,
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
      done: { id: 6, str: new RegExp('FERTIG', 'i') },
    },
    job: {
      root: `ftp://${process.env.FTP_WIENNA_HOST}/SCP/Active Beauty`,
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
      done: { id: 6, str: new RegExp('FERTIG', 'i') },
    },
    job: {
      root: `ftp://${process.env.FTP_WIENNA_HOST}/SCP/hub-HKSÖL`,
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
        sub: true,
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
      done: { id: 6, str: new RegExp('FERTIG', 'i') },
    },
    job: {
      root: `ftp://${process.env.FTP_WIENNA_HOST}/SCP/VA`,
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
      console.log('Error during ftp.connect - in walk()');
      console.log(`${error.name} (${error.code}): ${error.message}`);
      return false;
    }

    async function walkDir(dir) {
      let files = await readDir(dir);
      if (!files) return false;
      const initialDepth = files.length
        ? thisclass.jobnames.sub
          ? files[0].path.split('/').length
          : files[0].path.split('/').length - 1
        : 0;
      const jobs = [];
      const output = [];

      for await (const file of files) {
        const depth = file.path.split('/').length - 1;
        let pushIt = false;
        // depth == init in normal cases, and depth -1 == init - when job can have subjobs
        if (depth <= initialDepth) {
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
                root: file.path,
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
        } else if (thisclass.steps[depth]) {
          // we have a required step for this depth, test it and if true, push into files
          if (thisclass.steps[depth].test(path.basename(file.path))) pushIt = true;
        } else {
          // we are deep enough to process all files
          pushIt = true;
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

      for (let i = 0; i < 4; i++) {
        try {
          files = await ftp.list(dir);
          if (files) break;
        } catch (error) {
          console.log(`readDir() ${error.name} (${error.code}): ${error.message}`);
          console.log(`readDir() retry #${i + 1} for ${dir}`);
          return false;
        }
      }

      if (!files) {
        console.log(`readDir() failed permanently for ${dir}`);
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
      thisclass.garbage.indd.forEach((e) => {
        if (!res) return;
        if (new RegExp(e.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).test(el.path)) res = false;
      });
      return res;
    });

    newImages.forEach((img) => (data.jobs[img.jobID][img.status] += 1));

    return { cID: this.cID, jobs: data.jobs, images };
  }

  matchJobFile(jobs, fullpath) {
    let output = 0;
    jobs.forEach((job, i) => {
      if (new RegExp(`^${job.root}`).test(fullpath)) output = i;
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
    }

    if (!this.parseStatus.done.id) {
      if (this.parseStatus.done.str.test(fullpath)) status = 'done';
    } else if (frag.length > this.parseStatus.done.id) {
      if (this.parseStatus.done.str.test(frag[this.parseStatus.done.id])) status = 'done';
    }

    return status;
  }
}

module.exports = FTPControllerWien;
