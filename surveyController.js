document.addEventListener("DOMContentLoaded", function() {
    //Logout button listener
    //Get the button element
    const loginButton = document.querySelector('.button-blue');

    // Add event listener to the button
    loginButton.addEventListener('click', function() {
        // Redirect to the index page
        window.location.href = 'index.html';
    });

    //hide survey and show spinner while queries are still loading
    const loadingSpinner = document.getElementById("loading-container");
    const surveyContainer = document.getElementById("survey-container");
    //loadingSpinner.style.display = "none";
    surveyContainer.style.display = 'none';


    //get user id and password from url string
    const urlParams = new URLSearchParams(window.location.search);
    var userId = urlParams.get('userid');
    var firstName = urlParams.get('firstname');
    var lastName = urlParams.get('lastname');
    
    var ineligibleContainer = document.getElementById("ineligible-message-container");
    ineligibleContainer.style.display = 'none';

    
    //check if surveyeligible
    const checkEligibilityQuery = "SELECT issurveyeligible from users where userid = " + userId;
    executeSQL(checkEligibilityQuery)
    .then(
        rows => {
            var isSurveyEligible = rows[0].issurveyeligible;
            console.log("Eligible: " + isSurveyEligible)
            if(isSurveyEligible == 0) 
            {
                ineligibleContainer.style.display = 'flex';
            }
            else
            {
                const checkIfSurveyRecordExists = "select studentsurveyid, userid, hastakensurvey from studentsurvey where userid = " + userId;
                executeSQL(checkIfSurveyRecordExists)
                .then(rows => {
                    console.log(rows);
                    
                    //No survey record
                    if (rows.length === 0) {
                        //create new survey record
                        console.log("No record exists, creating one...");
                        var createRecordQuery = "INSERT INTO StudentSurvey (StudentSurveyID, UserID, HasTakenSurvey, SurveyCompletionDate, Result, NumberOfRemindersSent, LastEmailSendDate, LastEmailSendStatus) VALUES (" + userId + ", " +  userId + ", 0, NULL, NULL, 0, NULL, NULL)";
                        executeSQL(createRecordQuery)
                        .then(
                            rows => {
                                console.log(rows);
                                console.log("Record created successfully");
                                displaySurveyQuestions(firstName, lastName);
                                surveyContainer.style.display = 'flex';
                                loadingSpinner.style.display = 'none';
                        })
                        .catch(error => console.error('Error:', error));
                    } 
                    //Existing survey record
                    else 
                    {
                        //check if survey has been completed
                        if(rows[0].hastakensurvey == 0)
                        {
                            console.log("Getting to 53");
                            displaySurveyQuestions(firstName, lastName);
                            surveyContainer.style.display = 'flex';
                            loadingSpinner.style.display = 'none';
                        }
                        else
                        {
                            window.location.href = "./results.html?" + "userid=" + userId;
                        }
                    }
                })
                .catch(error => console.error('Error:', error));

            }
    })
    .catch(error => console.error('Error:', error));



    //setup listener for the form submission
    document.getElementById("surveyForm").addEventListener("submit", function(event) {
        event.preventDefault();

        var responses = getFormResponses();
        console.log(responses);
        //get studentsurveyid
        var getSurveyIdQuery = "SELECT StudentSurveyId FROM StudentSurvey WHERE UserID = " + userId;
        executeSQL(getSurveyIdQuery)
        .then(
            rows => {
                console.log(rows);
                var studentsurveyid = rows[0].studentsurveyid;
                //loop through each question and update SurveyQuestionResponses table 
                //and calculate results
                var result = "negative";
                responses.forEach(response => {
                    if(response.Response.toLowerCase() === "yes")
                    {
                        result = "positive";
                    }
                    var addQuestionResultQuery = "INSERT INTO SurveyQuestionResponses (StudentSurveyId, SurveyQuestionId, Response) VALUES (" + studentsurveyid + ", " + response.SurveyQuestionID + ", '" + response.Response + "')";
                    executeSQL(addQuestionResultQuery)
                    .then(
                        rows => {
                            console.log(rows);
                    })
                    .catch(error => console.error('Error:', error));
                });
                var currentDate = new Date();
                var formattedDate = currentDate.toISOString().slice(0, 10);

                var updateSurveyRecordQuery = "UPDATE StudentSurvey SET HasTakenSurvey = 1, SurveyCompletionDate = TO_DATE('" + formattedDate + "', 'YYYY-MM-DD'), Result = '" + result + "' WHERE UserId = " + userId;
                executeSQL(updateSurveyRecordQuery)
                .then(
                    rows => {
                        console.log(rows);
                        sendResultsEmail(userId, result)
                        window.location.href = "./results.html?" + "userid=" + userId;
                })
                .catch(error => console.error('Error:', error));
        })
        .catch(error => console.error('Error:', error));
        
      });

});


function displaySurveyQuestions(firstName, lastName) {
    //add code to to call the DB and get questions 
    document.getElementById("survey-header").innerText = "Tuberculosis Survey for " + firstName + " " + lastName;
    const getQuestionsQuery = 'SELECT * FROM SURVEYQUESTION ORDER BY SURVEYQUESTIONID';
    executeSQL(getQuestionsQuery)
    .then(
        rows => {
            var questions = rows;
            console.log(questions);

            const highRiskCountriesQuery = "SELECT * FROM HIGHRISKCOUNTRIES";
            executeSQL(highRiskCountriesQuery)
            .then(
                rows => {
                    console.log(rows);
                    var countries = rows;

                    //programatically generate the survey
                    generateFormQuestions(questions, countries);

            })
            .catch(error => console.error('Error:', error));
    })
    .catch(error => console.error('Error:', error));
}

function generateFormQuestions(questions, countries) {
    console.log("Calling generate form questions function");
    // Get the div where questions will be generated
    var generatedDiv = document.getElementById('generatedDiv');

    // Loop through each question object in the array
    questions.forEach(function(questionObj) {

        //Insert high risk countries list before question 6 
        if (questionObj.surveyquestionid === 6) {

            var countriesLabel = document.createElement('h3');
            countriesLabel.classList.add('countries-label');
            countriesLabel.textContent = 'High-Risk Countries List';
            generatedDiv.appendChild(countriesLabel);
            
            var countriesList = document.createElement('div');
            
            countriesList.classList.add('countries-list');

            // Iterate over countries and create list items
            countries.forEach(country => {
                var countryItem = document.createElement('div');
                countryItem.innerText = country.countryname; // Use innerText
                countriesList.appendChild(countryItem);
            });

            // Add the countries list to the paragraph
            generatedDiv.appendChild(countriesList);
        }

        // Div
        var questionDiv = document.createElement('div');
        questionDiv.classList.add('form-group');

        // Label
        var label = document.createElement('label');
        label.setAttribute('for', 'question' + questionObj.surveyquestionid);
        label.textContent = questionObj.question;
        questionDiv.appendChild(label);


        // Input
        var input;
        if (questionObj.questiontype === 'Text' || questionObj.questiontype === 'Number') {
            input = document.createElement('input');
            input.setAttribute('type', questionObj.questiontype.toLowerCase());
            input.setAttribute('id', 'question' + questionObj.surveyquestionid);
            input.classList.add('form-control');
            input.setAttribute('required', true);
        } else if (questionObj.questiontype === 'Yes/No') {
            // Create radio buttons for yes/no options
            var radioYes = document.createElement('input');
            radioYes.setAttribute('type', 'radio');
            radioYes.setAttribute('id', 'question' + questionObj.surveyquestionid + '_yes');
            radioYes.setAttribute('name', 'question' + questionObj.surveyquestionid);
            radioYes.setAttribute('value', 'yes');
            radioYes.setAttribute('required', true);

            var labelYes = document.createElement('label');
            labelYes.setAttribute('for', 'question' + questionObj.surveyquestionid + '_yes');
            labelYes.textContent = 'Yes';

            var radioNo = document.createElement('input');
            radioNo.setAttribute('type', 'radio');
            radioNo.setAttribute('id', 'question' + questionObj.surveyquestionid + '_no');
            radioNo.setAttribute('name', 'question' + questionObj.surveyquestionid);
            radioNo.setAttribute('value', 'no');
            radioNo.setAttribute('required', true);

            var labelNo = document.createElement('label');
            labelNo.setAttribute('for', 'question' + questionObj.surveyquestionid + '_no');
            labelNo.textContent = 'No';

            // Append radio buttons and labels to the question div
            questionDiv.appendChild(document.createElement('br'));
            questionDiv.appendChild(radioYes);
            questionDiv.appendChild(labelYes);
            questionDiv.appendChild(document.createElement('br'));
            questionDiv.appendChild(radioNo);
            questionDiv.appendChild(labelNo);
        }

        // Append input elements to the question div
        if (input) {
            questionDiv.appendChild(input);
        }

        // Append the question div to the generatedDiv
        generatedDiv.appendChild(questionDiv);
    });
}

function getFormResponses() {
    var responses = [];
    //Credit: I asked ChatGPT to help with this line
    var inputs = document.querySelectorAll('#generatedDiv input[type="text"], #generatedDiv input[type="number"], #generatedDiv input[type="radio"]:checked');
    const urlParams = new URLSearchParams(window.location.search);
    var firstName = urlParams.get('firstname');
    var lastName = urlParams.get('lastname');
    var studentid = urlParams.get('universityid');
    //TODO: Pass the studentid from login and use that for q3

    var q1 = {
        SurveyQuestionID: 1,
        Response: firstName
    };
    var q2 = {
        SurveyQuestionID: 2,
        Response: lastName
    };
    var q3 = {
        SurveyQuestionID: 3,
        Response: studentid
    };
    responses.push(q1);
    responses.push(q2);
    responses.push(q3);

    // Loop through each input
    inputs.forEach(function(input) {
        // Get the SurveyQuestionID from the input's ID
        //Credit: I asked ChatGPT to help with this line
        var questionId = parseInt(input.id.match(/\d+/)[0]);

        var response;
        if (input.type === 'radio') {
            // For radio buttons, get the value of the selected option
            if (input.checked) {
                response = input.value;
            }
        } else {
            // For text and number inputs, get the input value
            response = input.value;
        }
        var responseObj = {
                SurveyQuestionID: questionId,
                Response: response
        };
        responses.push(responseObj);
    });

    // Return the array of responses
    return responses;
}


//Temp call for testing
//sendResultsEmail(15, "positive");

/* Send Results Email Function, calls server function */
async function sendResultsEmail(userId, result) {
    console.log("Send results email function called.")
    const url = 'http://localhost:3000/send-results';
    const requestBody = {
        userId: userId,
        result: result
    };
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        // Check if the response is successful
        if (response.ok) {
            const responseData = await response.json();
            console.log(responseData); // Log the response data
        } else {
            console.error('Error:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


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






