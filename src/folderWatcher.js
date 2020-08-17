const path = require('path');
const fs = require('fs');
const watcher = require('chokidar');
const { EventEmitter } = require('events');
const { debounce, set } = require('lodash');
const { start } = require('./folderMonitor');

const testFolder = path.join(process.env.TEMP || process.env.TMP, 'test_folders');

class FolderWatcher {
  constructor(folder) {
    if (fs.existsSync(folder)) {
      this.folder = folder;
    } else {
      this.folder = testFolder;
    }
    this.watcher = null;
    this.events = new EventEmitter();
    this.db = [];
  }

  start() {
    const options = {
      persistent: true,
      ignoreInitial: false,
      usePolling: true,
      awaitWriteFinish: {
        stabilityTreshold: 2000,
        pollInterval: 500,
      },
    };
    const thisObj = this;

    try {
      this.watcher = watcher.watch(this.folder, options);
    } catch (error) {
      this.events.emit('log', error);
    }
    console.log(this.folder);
    // SetUp:
    // Q:\_JOBS\Werbemarkt\heatset\ISO Coated v2 300\1436-2006-Dasein02 Bilder\TODO\_TAKEN
    // Q:\_JOBS\Others\coldset\1530-2006-SteirischeWirtschaft-0626\TODO
    // _JOBS \ Others
    /** Rules for _JOBS folder
     * 1. heatsets have subdir with profile name, coldset does not
     * 2. root job is made of easyjob number (and possibly something else), but is also in specific length (4. or 5. place)
     * 3. subfolders describe what has been done with images: TODO _TAKEN and DONE* should be ignored
     */
    this.watcher
      .on('add', (item) => {
        handleNewFile(path.normalize(item.replace(thisObj.folder, '.')));
        // New file added
      })
      .on('addDir', (item) => {
        // New dir created
      })
      .on('change', (item) => {
        // File or folder has been changed (usually just file)
      })
      .on('unlink', (item) => {
        // File has been deleted
      })
      .on('unlinkDir', (item) => {
        // Folder has been deleted
      })
      .on('error', (item) => {
        // Error has occured (when dir that we're listening gets removed)
      })
      .on('ready', () => {
        // Watcher is ready
      });
  }

  simulate() {
    const vm = this;
    setTimeout(() => {
      vm.events.emit('log', 'this is some log');
    }, 1000);
  }
}

function handleNewFile(file) {
  const frag = file.split(path.sep);
  const output = {
    root: 'Werbemarkt',
    type: 'heatset',
    profile: 'ISO Coated v2 300',
    jobname: '1436-2006-Dasein02 Bilder',
    file: 'something.psd',
    path: 'Werbemarkt\\heatset\\ISO Coated v2 300\\1436-2006-Dasein02 Bilder\\TODO\\something.psd'
  }

  output.root = frag[0];
  output.type = frag[1];
  // frag[0] -> Werbemarkt || Others
  // frag[1] -> type
  if (frag[1] === 'heatset') {
    output.profile = frag[2];
    output.jobname = frag[3];
    output.file = frag[5];
    // frag[2] -> color profile
    // frag[3] -> jobname
    // frag[4] -> TODO
    // frag[5] -> filename
  } else if (frag[1] === 'coldset') {
    output.profile = 'ISONewspaper v5';
    output.jobname = frag[2];
    output.file = frag[4];
    // newspaper -> color profile
    // frag[2] -> jobname
    // frag[3] -> TODO
    // frag[4] -> filename
  }
  output.path = file;

  return output;

  /** frag
   *
   */
}

const jobs = new FolderWatcher();
jobs.events.on('log', function (e) {
  console.log(e);
});
jobs.start();
