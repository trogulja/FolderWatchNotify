if (!process.env.LOADED) require('./config');
const net = require('net');
const { EventEmitter } = require('events');

class Mlinar {
  constructor() {
    this.fromHost = process.env.MLINAR_FROM_HOST;
    this.fromPort = process.env.MLINAR_FROM_PORT;
    this.toHost = process.env.MLINAR_TO_HOST;
    this.toPort = process.env.MLINAR_TO_PORT;
  
    // this.fromHost = 'localhost';
    // this.fromPort = 4444;
    // this.toHost = 'localhost';
    // this.toPort = 8251;
  
    this.server = null;
    this.target = null;
    this.client = null;
  
    this.events = new EventEmitter();
  }

  init() {
    if (!process.env.MLINAR_ACTIVE) {
      this.events.emit('log', 'No config, exiting...')
      return this.destroy();
    }

    const thc = this;
    this.server = net
      .createServer((from) => {
        thc.target = net
          .createConnection({ host: thc.toHost, port: thc.toPort })
          .on('error', (error) => {
            thc.server.close();
            thc.client.end();
            thc.target.end();
            thc.events.emit('log', 'conn error, we are rebooting!');
            thc.init();
          });
        from.pipe(thc.target);
        thc.target.pipe(from);
      })
      .listen(thc.fromPort, thc.fromHost, () => {
        thc.events.emit('log', `Server listening on port ${thc.fromPort}`);
        thc.server.maxConnections = 1;
      });

    this.server.on('error', (error) => {
      thc.events.emit('log', `Failed connection from ${thc.fromHost}:${thc.fromPort} to ${thc.toHost}:${thc.toPort}`);
      thc.events.emit(
        'log',
        `Server caused an error code: ${error.code}, errno: ${error.errno}, syscall: ${error.syscall}, address: ${error.address}, port: ${error.port}`
      );
    });
    this.server.on('connection', (socket) => {
      thc.client = socket;
      thc.client.on('error', () => {
        thc.events.emit('log', 'Client connection error occured, disconnecting...');
      });
      thc.client.on('close', () => {
        thc.events.emit('log', 'Client disconnected!');
      });
      thc.events.emit('log', 'New client connected!');
    });
    this.server.on('close', () => {
      thc.events.emit('log', 'Server connection is closed!');
    });
  }

  destroy() {
    if (this.server) this.server.close();
    if (this.client) this.client.end();
    if (this.target) this.target.end();

    this.server = null;
    this.client = null;
    this.target = null;
  }
}

module.exports = Mlinar;

// net
//   .createServer((socket) => {
//     // confirm socket connection from client
//     console.log(new Date(), 'New Connection');
//     socket.write('Welcome to test socket server! \r\n');

//     socket.on('data', function (data) {
//       var string = data.toString();
//       process.stdout.write(string);
//     });
//     // send info to client
//     // socket.write('Echo from server: NODE.JS Server \r\n');
//     // socket.pipe(socket);
//     // socket.end();
//     // console.log('The client has disconnected...\n');
//   })
//   .listen(10337, 'localhost');
