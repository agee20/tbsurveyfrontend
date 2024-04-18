const brevo = require('@getbrevo/brevo');
const http = require('http');

// Specify the port for SMTP with SSL/TLS
const PORT = 465; // Port 465 is commonly used for SMTPS

// Create a server and listen on the specified port
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Server is running.');
});

let defaultClient = brevo.ApiClient.instance;

let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = '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';

let apiInstance = new brevo.TransactionalEmailsApi();
let sendSmtpEmail = new brevo.SendSmtpEmail();

sendSmtpEmail.subject = "My {{params.subject}}";
sendSmtpEmail.htmlContent = "<html><body><h1>Common: This is my first transactional email {{params.parameter}}</h1></body></html>";
sendSmtpEmail.sender = { "name": "Blake", "email": "bwgarner2@gmail.com" };
sendSmtpEmail.to = [ 
  { "email": "testtbsurvey123@gmail.com", "name": "John" }
];
sendSmtpEmail.replyTo = { "email": "bwgarner2@gmail.com", "name": "Blake" };
sendSmtpEmail.headers = { "Some-Custom-Name": "unique-id-1234" };
sendSmtpEmail.params = { "parameter": "Test", "subject": "common subject" };
sendSmtpEmail.messageVersions = [{
    "to": [
      {
        "email": "testtbsurvey123@gmail.com",
        "name": "John"
      }
    ],
    "headers": {
      "Message-Id": "<123.123@smtp-relay.mailin.fr>"
    },
    "params": {
      "greeting": "Welcome onboard!",
      "headline": "Be Ready for Takeoff."
    },
    "subject": "Test Email 1",
    "htmlContent": "<html><body><h1>Test email content</h1></body></html>"
  },
  {
    "to": [
      {
        "email": "testtbsurvey123@gmail.com",
        "name": "Steve"
      }
    ],
    "params": {
      "greeting": "Greeting 1.",
      "headline": "Some bathing suits you might like"
    },
    "subject": "Test email 2",
    "htmlContent": "<html><body><h1>Test email content</h1></body></html>"
}];

apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
  console.log('API called successfully. Returned data: ' + JSON.stringify(data));
}, function (error) {
  console.error(error);
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
  });