const oracledb = require('oracledb');
const brevo = require('brevo');
const cron = require('node-cron');

// Brevo configuration
const brevoConfig = {
  apiKey: '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',
};

// SQL query to fetch eligible users and their email templates
const QUERY = `
  SELECT u.UserID, u.Email, e.EmailSubject, e.EmailBodyHTML
  FROM Users u
  JOIN EmailTemplate e ON u.EmailType = e.EmailType
  WHERE u.IsSurveyEligible = 1;
`;

// Function to execute SQL query and fetch data
async function executeSQL(query) {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(query);
    await connection.close();
    return result.rows;
  } catch (error) {
    console.error('Error executing SQL query:', error);
    throw error;
  }
}

// Function to send emails
async function sendEmails() {
  try {
    const rows = await executeSQL(QUERY);

    // Iterate over the results and send emails
    for (const row of rows) {
      const userId = row[0];
      const userEmail = row[1];
      const emailSubject = row[2];
      const emailBodyHTML = row[3];

      // Construct email content
      const emailContent = {
        name: "TB Testing Survey",
        subject: emailSubject,
        sender: {"name": "Akron TB Test", "email": "test@uakron.edu"}, // Fill in email address once a gmail account is created
        type: "classic",
        htmlContent: emailBodyHTML,
        recipients: {listIds: [userId]}, // Assuming listIds represents user IDs
      };

      // Send email using Brevo
      await brevo.createEmail(emailContent, brevoConfig);
    }
  } catch (error) {
    console.error('Error sending emails:', error);
  }
}

// Schedule daily batch job at 6:30 PM
cron.schedule('30 18 * * *', () => {
  console.log('Running batch job...');
  sendEmails();
});