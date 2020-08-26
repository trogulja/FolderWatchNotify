const Database = require('better-sqlite3');
const path = require('path');
const paths = require('./pathHandler');

class Config {
  constructor() {
    this.db = new Database(path.join(paths.db, 'fwConfig.db'));
    this.db.pragma('journal_mode = WAL');
    this.db.prepare('CREATE TABLE IF NOT EXISTS config (id INTEGER PRIMARY KEY NOT NULL, key STRING, value STRING)').run();

    this.getConfig = this.db.prepare('SELECT key, value FROM config');
    this.insertConf = this.db.prepare('INSERT INTO config (key, value) VALUES (@key, @value)');

    const thisclass = this;
    this.insertAll = this.db.transaction((conf) => {
      for (const c of conf) thisclass.insertConf.run(c);
    });
  }

  getAll() {
    return this.getConfig.all();
  }

  input(el) {
    return this.insertAll(el);
  }
  
  dispose() {
    return this.db.close();
  }
}

let config = new Config();
const conf = config.getAll();
conf.forEach((c) => {
  process.env[c.key] = c.value;
});

config.dispose();
config = null;
