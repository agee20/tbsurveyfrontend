const brevo = require('@getbrevo/brevo');
const oracledb = require('oracledb'); // Import the oracledb package

// Database connection configuration
const dbConfig = {
  user: 'ADMIN',
  password: 'Password1234',
  connectString: '(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.us-chicago-1.oraclecloud.com))(connect_data=(service_name=g56584dbca20ce4_tbsurveydbcloud_medium.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))'
};

let defaultClient = brevo.ApiClient.instance;
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = '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';

let apiInstance = new brevo.TransactionalEmailsApi();

async function sendEmails() {
  let connection;
  try {
    console.log('Attempting to establish database connection');
    connection = await oracledb.getConnection(dbConfig);
    console.log('Connected to the database');
  // Execute SQL query to fetch data from your database and join users table
  const query = `
      SELECT users.UserID, users.FirstName, users.LastName, users.Email, studentsurvey.numberofreminderssent, studentsurvey.hastakensurvey, studentsurvey.lastemailsenddate, studentsurvey.lastemailsendstatus, studentsurvey.surveycompletiondate, studentsurvey.result
      FROM users
      INNER JOIN studentsurvey ON users.userID = studentsurvey.userID
  `;
  // Assuming you have the `connection` object available from elsewhere
  const result = await connection.execute(query);
  console.log(result.rows);
    
    // Iterate through the query results and send emails dynamically
    await Promise.all(result.rows.map(async (row) => {
      const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
      let sendSmtpEmail = new brevo.SendSmtpEmail();
      if (row.hastakensurvey === 0) {
        if (row.numberofreminderssent === 0) {
          // Initial reminder email template
          sendSmtpEmail.subject = "TB Testing Survey";
          sendSmtpEmail.htmlContent = `
          <html>
            <body>
              <p>Dear ${row.FirstName},</p>
              <br/>
              <p>Welcome to The University of Akron! As discussed at your orientation, the university requires
              that all new students are screened for Tuberculosis (TB). Please complete the online screening
              survey using this link: (insert survey link here). Please complete it by (insert due date here).</p>
              <br/>
              <p>If you have any questions or concerns, please contact Student Health Services at 330-972-7808
              or <a href="mailto:healthservices@uakron.edu">healthservices@uakron.edu</a>.</p>
              <br/>
              <p>Sincerely,</p>
              <p>The University of Akron
              <br/>
              Student Health Services</p>
            </body>
          </html>`;
          sendSmtpEmail.sender = { "name": "Akron Health Services", "email": "testtbsurvey123@gmail.com" };
          sendSmtpEmail.to = [{ "email": "testtbsurvey123@gmail.com", "name": row.FirstName + ' ' + row.LastName }];
        } else if (row.numberofreminderssent >= 1 && row.numberofreminderssent <= 8) {
          // Reminder email template
          sendSmtpEmail.subject = "TB Testing Survey Reminder";
          sendSmtpEmail.htmlContent = `
          <html>
            <body>
              <p>Dear ${row.FirstName},</p>
              <br/>
              <p>Our records show that you have not yet completed the Tuberculosis (TB) screening survey,
              which is a requirement of The University of Akron for all new students. Please complete the
              survey using this link: (insert survey link here). The due date is (insert due date here).</p>
              <br/>
              <p>If you have any questions or concerns, please contact Student Health Services at 330-972-7808
              or <a href="mailto:healthservices@uakron.edu">healthservices@uakron.edu</a>.</p>
              <br/>
              <p>Sincerely,</p>
              <p>The University of Akron
              <br/>
              Student Health Services</p>
            </body>
          </html>`;
          sendSmtpEmail.sender = { "name": "Akron Health Services", "email": "testtbsurvey123@gmail.com" };
          sendSmtpEmail.to = [{ "email": "testtbsurvey123@gmail.com", "name": row.FirstName + ' ' + row.LastName }];
        } else if (row.numberofreminderssent === 9) {
          // Final reminder email template
          sendSmtpEmail.subject = "TB Testing Survey Final Reminder";
          sendSmtpEmail.htmlContent = `
          <html>
            <body>
              <p>Dear ${row.FirstName},</p>
              <br/>
              <p>Our records show that you have not completed the mandatory Tuberculosis (TB) screening survey. This is a
              requirement for all new students at The University of Akron. The final deadline is (insert date here).</p>
              <br/>
              <p>Failure to complete the survey by this date will result in a medical hold on your student account. The hold
              prevents you from registering for classes for the next semester and may cause issues with your student visa.
              The hold will be removed after you have completed the necessary requirements.</p>
              <br/>
              <p>If you have any questions or concerns, please contact Student Health Services at 330-972-7808
              or <a href="mailto:healthservices@uakron.edu">healthservices@uakron.edu</a>.</p>
              <br/>
              <p>Sincerely,</p>
              <p>The University of Akron
              <br/>
              Student Health Services</p>
            </body>
          </html>`;
          sendSmtpEmail.sender = { "name": "Akron Health Services", "email": "testtbsurvey123@gmail.com" };
          sendSmtpEmail.to = [{ "email": "testtbsurvey123@gmail.com", "name": row.FirstName + ' ' + row.LastName }];
        }
      } else if (row.hastakensurvey === 1 && row.lastemailsenddate <= row.surveycompletiondate) {
        // Send result email only if the survey has been completed and last email date is before or equal to survey completion date
        sendSmtpEmail.sender = { "name": "Akron Health Services", "email": "testtbsurvey123@gmail.com" };
        sendSmtpEmail.to = [{ "email": "testtbsurvey123@gmail.com", "name": row.FirstName + ' ' + row.LastName }];
        
        if (row.result === 'positive') {
          // Positive result email template
          sendSmtpEmail.subject = "TB Testing Survey Result: Positive";
          sendSmtpEmail.htmlContent = `
          <html>
            <body>
              <p>Dear ${row.FirstName},</p>
              <br/>
              <p>Thank you for completing the online Tuberculosis (TB) screening survey. Based on your survey answers,
              you do not need a TB test and have completed the universitys TB screening/testing requirements.</p>
              <br/>
              <p>Sincerely,</p>
              <br/>
              <p>The University of Akron
              <br/>
              Student Health Services</p>
            </body>
          </html>`;
        } else if (row.result === 'negative') {
          // Negative result email template
          sendSmtpEmail.subject = "TB Testing Survey Result: Negative";
          sendSmtpEmail.htmlContent = `
          <html>
            <body>
              <p>Dear <strong>${row.FirstName},</strong></p>
              <br/>
              <p>Thank you for completing the online Tuberculosis (TB) screening survey. <strong>Your answers indicate a need for TB testing.</strong></p>
              <br/>
              <p>Please make an appointment at Student Health Services by calling 330-972-7808 or emailing <a href="mailto:healthservices@uakron.edu">healthservices@uakron.edu</a>. Please have your TB test by (insert due date here).</p>
              <br/>
              <p>Student Health Services is located inside the Student Recreation and Wellness Center, Suite 260. If you do not have the universitys student health insurance plan, please bring your health insurance card.</p>
              <br/>
              <p><strong>As a friendly reminder, this is a requirement of the university.</strong> Please be aware that failure to complete the test by the due date listed above will result in a medical hold placed on your student account. The hold prevents you from registering for classes for the next semester and may cause issues with your student visa. The hold is removed after you have completed the necessary requirements.</p>
              <br/>
              <p>Please let us know if you have any questions.</p>
              <br/>
              <p>Thank you,</p>
              <p>The University of Akron<br/>Student Health Services</p>
            </body>
          </html>`;
        }
        
        try {
          await apiInstance.sendTransacEmail(sendSmtpEmail);
          console.log('Result email sent successfully to ' + "testtbsurvey123@gmail.com");
          // Update database to indicate successful email send
          await connection.query('UPDATE studentsurvey SET lastemailsenddate = ?, lastemailsendstatus = "sent" WHERE userID = ?', [currentDate, row.UserID]);
        } catch (error) {
          console.error('Error sending result email to ' + "testtbsurvey123@gmail.com" + ': ' + error);
          // Update database to indicate failed email send
          await connection.query('UPDATE studentsurvey SET lastemailsenddate = ?, lastemailsendstatus = "failed" WHERE userID = ?', [currentDate, row.UserID]);
        }
      }
    }));

  } catch (error) {
    console.error('Error executing SQL query:', error);
  } finally {
    // Release the connection
    if (connection) {
      try {
        await connection.close();
        console.log('Closed database connection');
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
    }
  }
}

module.exports = { sendEmails };