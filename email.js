const oracledb = require('oracledb');
const brevo = require('brevo'); // Assuming Brevo is the correct library name
const cron = require('node-cron');

// Oracle ATP connection details
const dbConfig = {
  user: 'ADMIN',
  password: 'Password1234',
  connectString: '(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.us-chicago-1.oraclecloud.com))(connect_data=(service_name=g56584dbca20ce4_tbsurveydbcloud_medium.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))'
};

// Brevo configuration
const brevoConfig = {
  apiKey: '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',
};

// SQL query to fetch eligible users and their email templates
const query = `
  SELECT u.UserID, u.Email, e.EmailSubject, e.EmailBodyHTML
  FROM Users u
  JOIN EmailTemplate e ON u.EmailType = e.EmailType
  WHERE u.IsSurveyEligible = 1;
`;

// Function to send emails
async function sendEmails() {
  try {
    // Connect to Oracle ATP database
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(query);

    // Iterate over the results and send emails
    for (const row of result.rows) {
      const userId = row[0];
      const userEmail = row[1];
      const emailSubject = row[2];
      const emailBodyHTML = row[3];

      // Construct email content
      const emailContent = {
        name: "TB Testing Survey",
        subject: emailSubject,
        sender: {"name": "Akron TB Test", "email": "test@uakron.edu"}, //Fill in email address once a gmail account is created
        type: "classic",
        htmlContent: emailBodyHTML,
        recipients: {listIds: [userId]}, // Assuming listIds represents user IDs
      };

      // Send email campaign using Brevo
      await brevo.createEmail(emailContent, brevoConfig);
    }

    // Close Oracle ATP connection
    await connection.close();
  } catch (error) {
    console.error('Error sending emails:', error);
  }
}

// Schedule daily batch job
cron.schedule('30 18 * * *', () => {
  console.log('Running batch job...');
  sendEmails();
});