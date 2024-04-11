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

executeSQL(QUERY)
    .then(
        rows => {
            console.log(rows);
            
            //Add additional post-query logic here if necessary
    })
    .catch(error => console.error('Error:', error));

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

      // Send email using Brevo
      await brevo.createEmail(emailContent, brevoConfig);
    }

    // Close Oracle ATP connection
    await connection.close();
  } catch (error) {
    console.error('Error sending emails:', error);
  }
}

// Schedule daily batch job 6:30PM
cron.schedule('30 18 * * *', () => {
  console.log('Running batch job...');
  sendEmails();
});


function executeSQL(query) {
  console.log("Executing SQL query:", query); // Log the SQL query being executed
  return fetch(`http://localhost:3000/executeQuery?sql=${encodeURIComponent(query)}`)
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.json();
      })
      .then(data => {
          if (Array.isArray(data)) {
              return data.map(row => {
                  const rowData = {};
                  Object.keys(row).forEach(key => {
                      // Convert column names to camelCase (or use as is)
                      const camelCaseKey = key.toLowerCase();
                      rowData[camelCaseKey] = row[key];
                  });
                  return rowData;
              });
          } else {
              throw new Error('Invalid data format or missing rows');
          }
      })
      .catch(error => {
          console.error('Error executing SQL query:', error); // Log any errors that occur during SQL query execution
          throw error; // Re-throw the error to propagate it to the caller
      });
}