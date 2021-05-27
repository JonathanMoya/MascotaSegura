const accountSid = 'AC0f651ac245ef1c48bd64b34d02edf026';
const authToken = 'a9a504144cdb611efd77ff5e4f072eb2';
const client = require('twilio')(accountSid, authToken);

client.messages
    .create({
        from: 'whatsapp:+14155238886',
        body: 'Hello there!',
        to: 'whatsapp:+573188374505'
    })
    .then(message => console.log(message.sid));
