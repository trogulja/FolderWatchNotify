/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';
import './css/bootstrap.min.css';
import Vue from './js/vue.min.js';
import { ipcRenderer } from 'electron';

// console.log('👋 This message is being logged by "renderer.js", included via webpack');

var app = new Vue({
  el: '#app',
  data: {
    default: {
      status: {
        stop: {
          txt: 'Stopped',
          class: 'badge badge-danger',
        },
        start: {
          txt: 'Running',
          class: 'badge badge-success',
        },
      },
      btnStart: {
        stop: {
          class: 'btn btn-success',
        },
        start: {
          class: 'btn btn-secondary',
        },
      },
      btnStop: {
        stop: {
          class: 'btn btn-secondary',
        },
        start: {
          class: 'btn btn-danger',
        },
      },
    },

    statusTxt: 'Stopped',
    statusClass: 'badge badge-danger',

    btnStartTxt: 'Start',
    btnStartClass: 'btn btn-secondary',

    btnStopTxt: 'Stop',
    btnStopClass: 'btn btn-danger',

    btnShares: 'btn btn-secondary',
    btnFtps: 'btn btn-secondary',
    btnWien: 'btn btn-secondary',

    running: false,

    info: '',
    log: [],
  },
  computed: {
    showLog: function () {
      let output = '';
      let loglen = this.log.length;
      this.log.forEach((line, i) => {
        output = output + line;
        if (i < loglen - 1) output = output + '<br />';
      });
      return output;
    },
  },
  methods: {
    addLog: function (line) {
      // console.log('adding line to log', line);
      // console.log('status.txt', this.statusTxt);
      this.log.unshift(line);
      if (this.log.length > 50) this.log.pop();
    },
    handleMeta: function (x) {
      // x.job == shares | ftps | wien
      // x.status == start | error | done
      let output = 'btn btn-secondary';
      let job = 'btn' + x.job.charAt(0).toUpperCase() + x.job.slice(1);
      if (x.status === 'start') {
        output = 'btn btn-info';
      } else if (x.status === 'error') {
        output = 'btn btn-danger';
      }

      this[job] = output;
    },
    sendShares: function () {
      if (this['btnShares'] === 'btn btn-info') return;
      if (this['btnFtps'] === 'btn btn-info') return;
      if (this['btnWien'] === 'btn btn-info') return;

      ipcRenderer.send('force-start', 'shares');
    },
    sendFtps: function () {
      if (this['btnShares'] === 'btn btn-info') return;
      if (this['btnFtps'] === 'btn btn-info') return;
      if (this['btnWien'] === 'btn btn-info') return;

      ipcRenderer.send('force-start', 'ftps');
    },
    sendWien: function () {
      if (this['btnShares'] === 'btn btn-info') return;
      if (this['btnFtps'] === 'btn btn-info') return;
      if (this['btnWien'] === 'btn btn-info') return;

      ipcRenderer.send('force-start', 'wien');
    },
    sendStart: function () {
      if (this.running) return;

      ipcRenderer.send('start-job', 'start');
      this.btnStartClass = this.default.btnStart.start.class;
      this.btnStopClass = this.default.btnStop.start.class;
      this.statusTxt = this.default.status.start.txt;
      this.statusClass = this.default.status.start.class;
      this.running = true;
    },
    sendStop: function () {
      if (!this.running) return;

      ipcRenderer.send('stop-job', 'stop');
      this.btnStartClass = this.default.btnStart.stop.class;
      this.btnStopClass = this.default.btnStop.stop.class;
      this.statusTxt = this.default.status.stop.txt;
      this.statusClass = this.default.status.stop.class;
      this.running = false;
    },
  },
  mounted() {
    ipcRenderer.send('init-job', 'init');
    this.btnStartClass = this.default.btnStart.start.class;
    this.btnStopClass = this.default.btnStop.start.class;
    this.statusTxt = this.default.status.start.txt;
    this.statusClass = this.default.status.start.class;
    this.info = this.default.status.start.txt;
    this.running = true;
  },
});

// Set listeners for data change
ipcRenderer.on('info', function (event, arg) {
  app.info = arg;
});

ipcRenderer.on('log', function (event, arg) {
  app.addLog(arg);
});

ipcRenderer.on('meta', function (event, arg) {
  app.handleMeta(arg);
});
