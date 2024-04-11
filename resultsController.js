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


// Update result message based on survey result
const resultMessageElement = document.getElementById('result-message');
const surveyResult = ''; // replace this with the actual survey result

if (surveyResult === 'positive') {
  resultMessageElement.innerHTML = '<p>Your TB screening result is <span style="color: red;">positive</span>.</p>';
} else if (surveyResult === 'negative') {
  resultMessageElement.innerHTML = '<p>Your TB screening result is <span style="color: green;">negative</span>.</p>';
} else {
  resultMessageElement.innerHTML = '<p>Your TB screening result is pending. Check your email for further instructions.</p>';
}

document.addEventListener("DOMContentLoaded", function() {
    // Get the button element
    const loginButton = document.querySelector('.button-blue');
    
    // Add event listener to the button
    loginButton.addEventListener('click', function() {
        // Redirect to the index page
        window.location.href = 'index.html';
    });
});

console.log('hello')

