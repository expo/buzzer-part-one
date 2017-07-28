const twilio = require('twilio');
const express = require('express');

let app = express();

// State that persists across requests
let _unlockedAt = null;

app.post('/unlock', (request, response) => {
  _unlockedAt = new Date();
  response.type('application/json');
  response.send({ unlockedAt: _unlockedAt });
});

app.post('/lock', (request, response) => {
  _unlockedAt = null;
  response.type('application/json');
  response.send({ locked: true });
});

app.post('/', (request, response) => {
  let twiml = new twilio.twiml.VoiceResponse();
  if (_isUnlocked()) {
    twiml.play({ digits: 'ww666ww666ww666' });
  } else {
    // Have Twilio fallback to our "Call Me" bin
    throw new Error('Not permitted to unlock');
  }

  response.type('text/xml');
  response.send(twiml.toString());
});

function _isUnlocked() {
  return _unlockedAt && new Date().getTime() - _unlockedAt.getTime() < 30000;
}

app.listen(3000);
console.log(`server running (${process.env.NODE_ENV})`);
