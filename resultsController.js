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

