document.addEventListener("DOMContentLoaded", function() {
    //get user id and password from url string
    const urlParams = new URLSearchParams(window.location.search);
    var userId = urlParams.get('userid');
    var firstName = urlParams.get('firstname');
    var lastName = urlParams.get('lastname');

    //add code to to call the DB and get questions 
    const getQuestionsQuery = 'SELECT * FROM SURVEYQUESTION ORDER BY SURVEYQUESTIONID';
    executeSQL(getQuestionsQuery)
    .then(
        rows => {
            var questions = rows;
            console.log(questions);

            //programatically generate the survey
            generateFormQuestions(questions);

            // autofill firstname and lastname 
            // TABLING THIS FOR NOW, spent too much time on it and it is an insignificant feature so we can come back to this
            /* questions.forEach(question => {
                const input = document.querySelector(`#generatedDiv input[name="question${question.surveyquestionid}"]`);
                if (input) {
                    if (question.surveyquestionid === 1) {
                        input.value = firstName;
                    } else if (question.surveyquestionid === 2) {
                        input.value = lastName;
                    }
                }
            }); */
    })
    .catch(error => console.error('Error:', error));




    //setup listener for the form submission
    document.getElementById("surveyForm").addEventListener("submit", function(event) {
        event.preventDefault();

        var responses = getFormResponses();
        console.log(responses);
        //TODO: calculate results + update database

        //window.location.href = "./file";
      });

});




function generateFormQuestions(questions) {
    // Get the div where questions will be generated
    var generatedDiv = document.getElementById('generatedDiv');

    // Loop through each question object in the array
    questions.forEach(function(questionObj) {
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



/* Database Connection Utility Functions */

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



