const axios = require('axios');
const database = require('./database');
const db = new database();

// db.


// axios
//   .post(process.env.SLACK_WEBHOOK, {
//     text: 'Nađeno je 12 foldera sa slikama koje nisu napravljene',
//     blocks: [
//       {
//         type: 'section',
//         text: {
//           type: 'mrkdwn',
//           text:
//             'Bok, robot zvan Robotko Njuškalić se prijavljuje na dužnost! Pronjuškao sam direktorije i našao ove otvorene stavke:\n\n *Lokacije koje sadrže nove poslove:*',
//         },
//       },
//       {
//         type: 'divider',
//       },
//       {
//         type: 'section',
//         text: {
//           type: 'mrkdwn',
//           text:
//             '*1355-2005-Antenne-Bundesliga-getty*\n\n:new: *12 novih slika* _(0 uzetih, 20 napravljenih)_\n\n_lokacija:_ \\\\srvczg-files\\ftp_hr_m4\\_JOBS\\Others\\\n_refresh @_ *25.8.* - *21:15*',
//         },
//       },
//       {
//         type: 'divider',
//       },
//       {
//         type: 'section',
//         text: {
//           type: 'mrkdwn',
//           text:
//             '*1355-2005-Antenne-Bundesliga-getty*\n:new: *12 novih slika* _(0 uzetih, 20 napravljenih)_\n_lokacija:_ \\\\srvczg-files\\ftp_hr_m4\\_JOBS\\Others\\\n:clock1: _refresh @_ *25.8.* - *21:15*',
//         },
//       },
//       {
//         type: 'divider',
//       },
//       {
//         type: 'section',
//         text: {
//           type: 'mrkdwn',
//           text:
//             '*1355-2005-Antenne-Bundesliga-getty*\n:new: *12 novih slika* _(0 uzetih, 20 napravljenih)_\n_lokacija:_ \\\\srvczg-files\\ftp_hr_m4\\_JOBS\\Others\\\n:clock1: _refresh @_ *25.8.* - *21:15*',
//         },
//       },
//       {
//         type: 'divider',
//       },
//     ],
//   })
//   .then((res) => console.log(res.data))
//   .catch((err) => console.log(err));
