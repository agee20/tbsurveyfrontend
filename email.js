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

async function sendEmailsNew() { 
  const getusersquery = `
    SELECT users.UserID, users.FirstName, users.LastName, users.Email, studentsurvey.numberofreminderssent, studentsurvey.hastakensurvey, studentsurvey.lastemailsenddate, studentsurvey.lastemailsendstatus, studentsurvey.surveycompletiondate, studentsurvey.result, studentsurvey.emailtype
    FROM users
    INNER JOIN studentsurvey ON users.userID = studentsurvey.userID
    `;
  
    try {
      const rows = await executeSQL(getusersquery);

      console.log("Rows:", rows); // Log the rows array to inspect its structure

      const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

      for (const row of rows) {

      let sendSmtpEmail = new brevo.SendSmtpEmail();

      if (row.hastakensurvey === 0 || row.numberofreminderssent <= 9) {
        if (row.numberofreminderssent === 0) {
          sendInitialReminderEmail(sendSmtpEmail, row);
        } else if (row.numberofreminderssent >= 1 && row.numberofreminderssent <= 8) {
          sendReminderEmail(sendSmtpEmail, row);
        } else if (row.numberofreminderssent === 9) {
          sendFinalReminderEmail(sendSmtpEmail, row);
        }

          // Construct the update query with the user ID included directly
          const updateQuery = `
          UPDATE studentsurvey 
          SET 
            numberofreminderssent = numberofreminderssent + 1, 
            lastemailsenddate = TO_TIMESTAMP('${currentDate}', 'YYYY-MM-DD HH24:MI:SS'),
            lastemailsendstatus = 'Sent',
            emailtype = 'Reminder'
          WHERE userid = ${row.userid}
          `;

          // Execute the update query
          await executeSQL(updateQuery);
          // Call the API to send the email
          apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
          console.log('API called successfully. Returned data: ' + JSON.stringify(data));
        }).catch(function (error) {
          console.error('Error:', error);
          // Update lastemailsendstatus to 'Failed' if the email sending failed
          const updateFailedQuery = `
            UPDATE studentsurvey 
            SET 
              lastemailsendstatus = 'Failed'
            WHERE userid = ${row.userid}
          `;
          executeSQL(updateFailedQuery); // No await as we don't need to wait for this to finish
        });

      }
    }
  } catch (error) {
    console.error('Error:', error);
  }

}

async function sendEmailsResults() {
  const surveyResultQuery = `
      SELECT userID, result, resultssent, emailtype
      FROM studentsurvey
      WHERE result IN ('positive', 'negative') AND (resultssent = 0 OR resultssent IS NULL);
  `;
  
  try {
      const rows = await executeSQL(surveyResultQuery);

      console.log("Rows:", rows); // Log the rows array to inspect its structure

      const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

      for (const row of rows) {
      console.log("Row:", row); // Log the current row object to inspect its properties

      let sendSmtpEmail = new brevo.SendSmtpEmail();


          if (row.hastakensurvey === 1) {
            if (row.resultsent === 0 || row.resultsent === null) {
                if (row.emailtype !== 'Result') {
                    if (row.result === 'Negative') {
                        sendResultEmail(sendSmtpEmail, row);
                    } else if (row.result === 'Positive') {
                        sendResultEmail(sendSmtpEmail, row);
                    }
                }
            }


            const updateQuery = `
              UPDATE studentsurvey 
              SET 
                  lastemailsenddate = TO_TIMESTAMP('${currentDate}', 'YYYY-MM-DD HH24:MI:SS'),
                  lastemailsendstatus = 'Sent',
                  emailtype = 'Result',
                  WHERE userid = ${row.userid}
          `;

          await executeSQL(updateQuery);

        // Call the API to send the email
        apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
          console.log('API called successfully. Returned data: ' + JSON.stringify(data));
        }).catch(function (error) {
          console.error('Error:', error);
          // Update lastemailsendstatus to 'Failed' if the email sending failed
          const updateFailedQuery = `
            UPDATE studentsurvey 
            SET 
              lastemailsendstatus = 'Failed'
            WHERE userid = ${row.userid}
          `;
          executeSQL(updateFailedQuery); // No await as we don't need to wait for this to finish
        });
            
      }
      }
  } catch (error) {
      console.error('Error sending emails:', error);
  }
}

async function sendResultEmailFromServer(userId, result) {
  console.log("GETTING TO SEND RESULT EMAIL")
  console.log(userId);
  console.log(result);

  let sendSmtpEmail = new brevo.SendSmtpEmail();
  const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

  console.log("SEND SMPT EMAIL OBJECT VALUE: ");
  console.log(sendSmtpEmail);

  sendResultEmail(sendSmtpEmail, result);

  apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
    console.log('API called successfully. Returned data: ' + JSON.stringify(data));
      //Update survey in database on success
      const updateQuery = `
      UPDATE studentsurvey 
      SET 
          lastemailsenddate = TO_TIMESTAMP('${currentDate}', 'YYYY-MM-DD HH24:MI:SS'),
          lastemailsendstatus = 'Sent',
          emailtype = 'Result',
          resultssent = '1'
      WHERE userid = ${userId}
    `;
      executeSQL(updateQuery);
  }).catch(function (error) {
    console.error('Error:', error);
    // Update lastemailsendstatus to 'Failed' if the email sending failed
    const updateFailedQuery = `
      UPDATE studentsurvey 
      SET 
        lastemailsendstatus = 'Failed'
      WHERE userid = ${userId}
    `;
    executeSQL(updateFailedQuery); // No await as we don't need to wait for this to finish
  });


}

function sendEmail(sendSmtpEmail) {
  console.log("54");
}

function sendInitialReminderEmail(sendSmtpEmail, row) {
  sendSmtpEmail.subject = "TB Testing Survey";
  sendSmtpEmail.htmlContent = generateInitialReminderContent(row);
  setCommonEmailProperties(sendSmtpEmail, row);
  sendEmail(sendSmtpEmail);
}

function sendReminderEmail(sendSmtpEmail, row) {
  sendSmtpEmail.subject = "TB Testing Survey Reminder";
  sendSmtpEmail.htmlContent = generateReminderContent(row);
  setCommonEmailProperties(sendSmtpEmail, row);
  sendEmail(sendSmtpEmail);
}

function sendFinalReminderEmail(sendSmtpEmail, row) {
  sendSmtpEmail.subject = "TB Testing Survey Final Reminder";
  sendSmtpEmail.htmlContent = generateFinalReminderContent(row);
  setCommonEmailProperties(sendSmtpEmail, row);
  sendEmail(sendSmtpEmail);
}

function sendResultEmail(sendSmtpEmail, result) {
  sendSmtpEmail.subject = result === 'positive' ? "TB Testing Survey Result: Positive" : "TB Testing Survey Result: Negative";
  sendSmtpEmail.htmlContent = generateResultContent(result);
  setCommonEmailPropertiesResult(sendSmtpEmail);
  sendEmail(sendSmtpEmail);
}

//Functions to return the HTML content of each type of email 
function generateInitialReminderContent(row) {
  return `
    <html>
      <body>
        <p>Dear ${row.firstname},</p>
        <br/>
        <p>Welcome to The University of Akron! As discussed at your orientation, the university requires
        that all new students are screened for Tuberculosis (TB). Please complete the online screening
        survey using this link: <a href="http://localhost:3000/">Click to Access Survey</a>. Please complete it by May 25th 2024.</p>
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
}

function generateReminderContent(row) {
  return `
    <html>
      <body>
        <p>Dear ${row.firstname},</p>
        <br/>
        <p>Our records show that you have not yet completed the Tuberculosis (TB) screening survey,
        which is a requirement of The University of Akron for all new students. Please complete the
        survey using this link: <a href="http://localhost:3000/">Click to Access Survey</a>. The due date is May 25th 2024.</p>
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
}

function generateFinalReminderContent(row) {
  return `
    <html>
      <body>
        <p>Dear ${row.firstname},</p>
        <br/>
        <p>Our records show that you have not completed the mandatory Tuberculosis (TB) screening survey. This is a
        requirement for all new students at The University of Akron. The final deadline is May 25th 2024.</p>
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
}

function generateResultContent(result) {
  if (result === 'positive') {
    return `
    <html>
      <body>
        <p>Hello,</strong></p>
        <br/>
        <p>Thank you for completing the online Tuberculosis (TB) screening survey. <strong>Your answers indicate a need for TB testing.</strong></p>
        <br/>
        <p>Please make an appointment at Student Health Services by calling 330-972-7808 or emailing <a href="mailto:healthservices@uakron.edu">healthservices@uakron.edu</a>. Please have your TB test by August 1st.</p>
        <br/>
        <p>Student Health Services is located inside the Student Recreation and Wellness Center, Suite 260. If you do not have the university's student health insurance plan, please bring your health insurance card.</p>
        <br/>
        <p><strong>As a friendly reminder, this is a requirement of the university.</strong> Please be aware that failure to complete the test by the due date listed above will result in a medical hold placed on your student account. The hold prevents you from registering for classes for the next semester and may cause issues with your student visa. The hold is removed after you have completed the necessary requirements.</p>
        <br/>
        <p>Please let us know if you have any questions.</p>
        <br/>
        <p>Thank you,</p>
        <p>The University of Akron<br/>Student Health Services</p>
      </body>
    </html>`;
  } else if (result === 'negative') {
    return `
      <html>
        <body>
          <p>Hello,</p>
          <br/>
          <p>Thank you for completing the online Tuberculosis (TB) screening survey. Based on your survey answers,
          you do not need a TB test and have completed the university's TB screening/testing requirements.</p>
          <br/>
          <p>Sincerely,</p>
          <br/>
          <p>The University of Akron
          <br/>
          Student Health Services</p>
        </body>
      </html>`;
  }
}

function setCommonEmailProperties(sendSmtpEmail, row) {
  sendSmtpEmail.sender = { "name": "Akron Health Services", "email": "testtbsurvey123@gmail.com" };
  sendSmtpEmail.to = [{ "email": "testtbsurvey123@gmail.com", "name": row.firstname + ' ' + row.lastname }];
}

function setCommonEmailPropertiesResult(sendSmtpEmail) {
  sendSmtpEmail.sender = { "name": "Akron Health Services", "email": "testtbsurvey123@gmail.com" };
  sendSmtpEmail.to = [{ "email": "testtbsurvey123@gmail.com"}];
}

module.exports = { sendEmailsNew, sendEmailsResults, sendResultEmailFromServer };


/* Database Connection Utility Functions */

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