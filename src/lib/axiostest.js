if (!process.env.LOADED) require('./config');
const axios = require('axios');
const database = require('./database');
const db = new database();

function reportJobs() {
  const newJobs = db.getNew();

  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text:
          'Bok, robot zvan Robotko Njuškalić se prijavljuje na dužnost! Pronjuškao sam direktorije i našao ove otvorene stavke:\n\n *Lokacije koje sadrže nove poslove:*',
      },
    },
    {
      type: 'divider',
    },
  ];

  newJobs.forEach((job) => {
    const txtNew =
      job.todoNew > 4
        ? 'novih slika'
        : job.todoNew > 1
        ? 'nove slike'
        : job.todoNew > 0
        ? 'nova slika'
        : 'novih slika';
    const txtTaken =
      job.todoTaken > 4
        ? 'uzetih'
        : job.todoTaken > 1
        ? 'uzete'
        : job.todoTaken > 0
        ? 'uzeta'
        : 'uzetih';
    const txtDone =
      job.done > 4
        ? 'napravljenih'
        : job.done > 1
        ? 'napravljene'
        : job.done > 0
        ? 'napravljena'
        : 'napravljenih';
    const date = new Date(job.updatedAtMS);
    const dateDay = `${date.getDate()}.${date.getMonth() + 1}.`;
    const dateHour = `${date.getHours()}:${date.getMinutes()}`;

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${job.name}*\n\n:new: *${job.todoNew} ${txtNew}* _(${job.todoTaken} ${txtTaken}, ${job.done} ${txtDone})_\n\n_lokacija:_ ${job.root}\n_(status na dan ${dateDay} u ${dateHour} sati)_`,
      },
    });
    blocks.push({ type: 'divider' });
  });

  const txtTotalPre =
    newJobs.length > 4
      ? 'Nađeno je'
      : newJobs.length > 1
      ? 'Nađena su'
      : newJobs.length > 0
      ? 'Nađen je'
      : 'Nađeno je';
  const txtTotalPost = newJobs.length > 1 ? 'foldera' : newJobs.length > 0 ? 'folder' : 'foldera';
  const txtTotal = `${txtTotalPre} ${newJobs.length} ${txtTotalPost} sa slikama koje nisu napravljene.`;

  axios
    .post(process.env.SLACK_WEBHOOK, { text: txtTotal, blocks })
    .then((res) => console.log(res.data))
    .catch((err) => console.log(err));
}

reportJobs();