document.addEventListener("DOMContentLoaded", function() {
    var loadingSpinner = document.getElementById("spinner");
    var loginText = document.getElementById("login-text");
    loadingSpinner.style.display = "none";


    var errorMessageParagraph = document.getElementById("error-text");
    document.getElementById("loginForm").addEventListener("submit", function(event) {
        loadingSpinner.style.display = "inline-block";
        loginText.style.display = "none";
        
        event.preventDefault();
        var email = document.getElementById("email").value;
        var password = document.getElementById("password").value;

        errorMessageParagraph.innerText = "";
        //check login credentials
        const usernameQuery = "SELECT userid FROM users WHERE email = '" + email + "'";
        console.log(usernameQuery);
        executeSQL(usernameQuery)
        .then(
            rows => {
                console.log(rows);

                if (rows.length === 0) {
                    console.log("No user found with the specified email.");
                    errorMessageParagraph.innerText = "Invalid email address.";
                    loginText.style.display = "inline-block";
                    loadingSpinner.style.display = "none";
                } else {
                    const userId = rows[0].userid;
                    const passwordQuery = "select userid, isadmin, firstname, lastname from users where email = '" + email + "' AND password = '" + password + "'";
                    console.log(passwordQuery);
                    executeSQL(passwordQuery)
                    .then(rows => {
                        console.log(rows);
                        
                        if (rows.length === 0) {
                            console.log("No user found with the specified email + password combo.");
                            errorMessageParagraph.innerText = "Incorrect password.";
                            loginText.style.display = "inline-block";
                            loadingSpinner.style.display = "none";
                        } else {
                            //correct user and password
                            var isAdmin = parseInt(rows[0].isadmin);
                            console.log(isAdmin);
                            if(isAdmin == 0)
                            {
                                console.log("here");
                                //student logic + navigations
                                var firstName = rows[0].firstname; 
                                var lastName = rows[0].lastname;
                                var userId = rows[0].userid;
                                window.location.href = "./survey.html?" + "userid=" + userId + "&firstname=" + firstName + "&lastname=" + lastName;
                            }
                            else
                            {
                                alert("Admin login detected. This part of the application is currently not built.")
                            }
;
                        }
                    })
                    .catch(error => console.error('Error:', error));

                }
        })
        .catch(error => console.error('Error:', error));
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