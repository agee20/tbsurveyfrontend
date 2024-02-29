function onload() {
    console.log("controller load success");
}

function onFormLoad() {
    console.log('form loaded success')
    //Hides the results div on load
    var resultsDiv = document.getElementById('resultsDiv');
    resultsDiv.style.visibility = 'hidden';
}

function submitContactForm() { 
    var name = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    var comments = document.getElementById('comments').value;
    alert('Successfully submitted contact form. \nName: ' + name + '\nEmail: ' + email + '\nComments: ' + comments);
} 

function submitBusinessForm() { 
    var amount = document.getElementById('amount').value;
    var term = document.getElementById('term').value;
    var rate = document.getElementById('rate').value;

    //monthly interest rate 
    var r =  (rate / 12.0) / 100; 

    //number of months 
    var n = term * 12;

    var monthlyPayment = (amount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)).toFixed(2);

    var totalAmountPaid = (monthlyPayment * n).toFixed(2);

    var interestPaid = (totalAmountPaid - amount).toFixed(2); 

    //Shows results div and updates the <p>s with the data
    resultsDiv.style.visibility = 'visible';
    document.getElementById('monthlyPayment').innerText = 'Monthly Payment: $' + monthlyPayment;
    document.getElementById('totalAmountPaid').innerText = 'Total Amount Paid: $' + totalAmountPaid;
    document.getElementById('interestPaid').innerText = 'Interest Paid: $' + interestPaid;
}