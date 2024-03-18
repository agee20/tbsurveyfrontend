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


function executeSQL(query) {
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
          console.error('Error:', error);
          throw error; // Re-throw the error to propagate it to the caller
      });
}