document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("loginForm").addEventListener("submit", function(event) {
        event.preventDefault();
        var username = document.getElementById("username").value;
        var password = document.getElementById("password").value;
        //check login credentials

        //check if admin

        //check if surveyeligible

        //check if survey has been completed

        //else
        var firstName = "Alex"; 
        var lastName = "Gee";
        var userId = 99;
        window.location.href = "./survey.html?" + "userid=" + userId + "&firstname=" + firstName + "&lastname=" + lastName;
      });


      //add code to try to connect to DB here


});