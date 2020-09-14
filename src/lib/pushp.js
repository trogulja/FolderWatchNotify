if (!process.env.LOADED) require('./config');
const net = require('net');

class Mlinar {
  constructor() {
    // this.fromHost = process.env.MLINAR_FROM_HOST;
    // this.fromPort = process.env.MLINAR_FROM_PORT;
    // this.toHost = process.env.MLINAR_TO_HOST;
    // this.toPort = process.env.MLINAR_TO_PORT;

    this.fromHost = 'localhost';
    this.fromPort = 8125;
    this.toHost = 'localhost';
    this.toPort = 8126;

    this.server = null;
    this.target = null;
    this.client = null;
  }

  init() {
    if (!process.env.MLINAR_ACTIVE) return this.destroy();

    const thc = this;
    this.server = net
      .createServer((from) => {
        thc.target = net.createConnection({ host: thc.toHost, port: thc.toPort }).on('error', (error) => {
          thc.server.close();
          thc.client.end();
          thc.target.end();
          console.log('conn error, we are rebooting!')
          thc.init();
        });
        from.pipe(thc.target);
        thc.target.pipe(from);
      })
      .listen(thc.fromPort, thc.fromHost, () => {
        console.log(`Server listening on port ${thc.fromPort}`);
        thc.server.maxConnections = 1;
      });

    this.server.on('error', (error) => {
      console.log(
        `Server caused an error code: ${error.code}, errno: ${error.errno}, syscall: ${error.syscall}, address: ${error.address}, port: ${error.port}`
      );
    });
    this.server.on('connection', (socket) => {
      thc.client = socket;
      thc.client.on('error', () => {
        console.log('Client connection error occured, disconnecting...');
      });
      thc.client.on('close', () => {
        console.log('Client disconnected!');
      });
      console.log('New client connected!');
    });
    this.server.on('close', () => {
      console.log('Server connection is closed!');
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

const mlin = new Mlinar();
mlin.init();