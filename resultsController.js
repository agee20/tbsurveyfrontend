const brevo = require('@getbrevo/brevo');
const { sendEmailsResults } = require('./email'); // Assuming you have defined sendEmailsResults function in email.js

let defaultClient = brevo.ApiClient.instance;
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = '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';

let apiInstance = new brevo.TransactionalEmailsApi();

console.log('hello'); // Retaining the console.log statement

// Get the element containing the thank you message
const thankYouElement = document.querySelector('.thank-you');

// Function to center the message
function centerThankYou() {
  const windowWidth = window.innerWidth;
  const messageWidth = thankYouElement.offsetWidth;
  const leftMargin = (windowWidth - messageWidth) / 2;
  thankYouElement.style.marginLeft = leftMargin + 'px';
}

// Call the centerThankYou function on window resize
window.addEventListener('resize', centerThankYou);

// Call the centerThankYou function initially to center on page load
centerThankYou();

const urlParams = new URLSearchParams(window.location.search);
var userId = urlParams.get('userid');
// Update result message based on survey result
const resultMessageElement = document.getElementById('result-message');

async function handleSurveyResults(userId) {
    try {
        const surveyResultQuery = "SELECT Result from StudentSurvey WHERE UserId = " +  userId;
        const rows = await executeSQL(surveyResultQuery);
        console.log(rows);
        
        const surveyResult = rows[0].result;

        if (surveyResult === 'positive') {
            resultMessageElement.innerHTML = '<h2>Your TB screening result is <span style="color: red;">positive</span>. You need to take a TB test.</h2>';
            await sendEmailsResults(); // Wait for sending emails to complete
        } else if (surveyResult === 'negative') {
            resultMessageElement.innerHTML = '<h2>Your TB screening result is <span style="color: green;">negative</span>. You do not need a TB test.</h2>';
            await sendEmailsResults(); // Wait for sending emails to complete
        } else {
            resultMessageElement.innerHTML = '<h2>Your TB screening result is pending. Check your email for further instructions.</h2>';
        }
    } catch (error) {
        console.error('Error executing survey result query:', error);
    }
}

// Call the async function
handleSurveyResults(userId)




document.addEventListener("DOMContentLoaded", function() {
    // Get the button element
    const loginButton = document.querySelector('.button-blue');
    
    // Add event listener to the button
    loginButton.addEventListener('click', function() {
        // Redirect to the index page
        window.location.href = 'index.html';
    });
});

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
