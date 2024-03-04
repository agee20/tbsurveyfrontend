document.addEventListener("DOMContentLoaded", function() {
    //get user id and password from url string
    const urlParams = new URLSearchParams(window.location.search);
    var userId = urlParams.get('userid');
    var firstName = urlParams.get('firstname');
    var lastName = urlParams.get('lastname');

    //add code to to call the DB and get questions 
    
    //programatically generate the survey
    generateFormQuestions(questionsSimulation);

    // autofill firstname and lastname
    var firstNameInput = document.getElementById('question1').value = firstName;
    var lastNameInput = document.getElementById('question2').value = lastName;

    //setup listener for the form submisstion
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
    questions.forEach(function(question) {
        //Insert survey questions list
        if(question.SurveyQuestionID === 6)
        {
            var para = document.createElement('p');
            para.innerHTML = "insert countries list here";
            generatedDiv.appendChild(para);
            //TODO: Add countries list programatically
        }

        // Div
        var questionDiv = document.createElement('div');
        questionDiv.classList.add('form-group');

        // Label
        var label = document.createElement('label');
        label.setAttribute('for', 'question' + question.SurveyQuestionID);
        label.textContent = question.Question;
        questionDiv.appendChild(label);

        // Input
        var input;
        if (question.QuestionType === 'text' || question.QuestionType === 'number') {
            input = document.createElement('input');
            input.setAttribute('type', question.QuestionType);
            input.setAttribute('id', 'question' + question.SurveyQuestionID);
            input.classList.add('form-control');
            input.setAttribute('required', true);
        } else if (question.QuestionType === 'yn') {
            // Create radio buttons for yes/no options
            var radioYes = document.createElement('input');
            radioYes.setAttribute('type', 'radio');
            radioYes.setAttribute('id', 'question' + question.SurveyQuestionID + '_yes');
            radioYes.setAttribute('name', 'question' + question.SurveyQuestionID);
            radioYes.setAttribute('value', 'yes');
            radioYes.setAttribute('required', true);

            var labelYes = document.createElement('label');
            labelYes.setAttribute('for', 'question' + question.SurveyQuestionID + '_yes');
            labelYes.textContent = 'Yes';

            var radioNo = document.createElement('input');
            radioNo.setAttribute('type', 'radio');
            radioNo.setAttribute('id', 'question' + question.SurveyQuestionID + '_no');
            radioNo.setAttribute('name', 'question' + question.SurveyQuestionID);
            radioNo.setAttribute('value', 'no');
            radioNo.setAttribute('required', true);

            var labelNo = document.createElement('label');
            labelNo.setAttribute('for', 'question' + question.SurveyQuestionID + '_no');
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

var questionsSimulation = [
    {
        SurveyQuestionID: 1,
        QuestionType: 'text',
        Question: 'What is your first name?'
    },
    {
        SurveyQuestionID: 2,
        QuestionType: 'text',
        Question: 'What is your last name?'
    },
    {
        SurveyQuestionID: 3,
        QuestionType: 'number',
        Question: 'What is your 7-digit University of Akron student ID number?'
    },
    {
        SurveyQuestionID: 4,
        QuestionType: 'text',
        Question: 'What country were you born in?'
    },
    {
        SurveyQuestionID: 5,
        QuestionType: 'yn',
        Question: 'Have you ever had close contact with a person/people who have Active TB or are suspected of having active TB? Select YES or NO.'
    },
    {
        SurveyQuestionID: 6,
        QuestionType: 'yn',
        Question: 'Were you born in one of the countries or territories listed above? Select YES or NO.'
    },
    {
        SurveyQuestionID: 7,
        QuestionType: 'yn',
        Question: 'Have you had frequent or prolonged visits (such as vacation, study, or work) to one or more of the countries or territories listed above? Select YES or NO.'
    },
    {
        SurveyQuestionID: 8,
        QuestionType: 'yn',
        Question: 'Have you ever lived, volunteered, or worked in: a jail, a long-term care facility, or a homeless shelter? Select YES or NO.'
    },
    {
        SurveyQuestionID: 9,
        QuestionType: 'yn',
        Question: 'Have you ever provided care to Tuberculosis patients as a volunteer or healthcare worker? Select YES or NO.'
    },
];