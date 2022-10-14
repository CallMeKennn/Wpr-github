// TODO(you): Write the JavaScript necessary to complete the assignment.

// Gọi biến
const buttonStartQuiz = document.querySelector('#btn-start');
const buttonSubmitQuiz = document.querySelector('#btn-submit')
const buttonTryAgain = document.querySelector('#btn-try-again')

const introduction = document.querySelector('#introduction');
const attemptQuiz = document.querySelector('#attempt-quiz');
const reviewQuiz = document.querySelector('#review-quiz')

const boxSubmit = document.querySelector('.box-submit')

const article = document.querySelector('article')

let idCode;
let dataSubmit = {};
let dataLength
let questionList = [];
let element;
//Function



const startHTMLQuiz = () => {
    introduction.classList.add('hidden')
    attemptQuiz.classList.remove('hidden')
    boxSubmit.classList.remove('hidden')
    attemptQuiz.scrollIntoView({behavior: "smooth", block: "start"})
    reviewQuiz.remove()
}

const callAPI = async () => {
    const response = await fetch('https://wpr-quiz-api.herokuapp.com/attempts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const myJson = await response.json();

    idCode = myJson._id
    dataLength = myJson.questions.length
    await createView(myJson.questions)
    attemptQuiz.innerHTML = element;
}

const createView = (questions) => {
        element = '<form method="POST" action="https://wpr-quiz-api.herokuapp.com/attempts">';
    questions.forEach((question, i) => {
        questionList[i] = question._id
        element += '<h2 class="question-index">Question ' + (i + 1) + ' of ' + questions.length + ' </h2>'
        element += '<p class="question-text">' + htmlEntities(question.text) + '</p>'
        element += '<div class="question-options">'
            question.answers.forEach((answer, j) => {
                element += '<div class="option">'
                    element += '<input type="radio" id="option' + (i + 1) + '-' + (j + 1) + '" name="' + question._id + '" value="option' + (j + 1) + '">'; 
                    element += '<label for="option' + (i + 1) + '-' + (j + 1) + '" id="option' + (i + 1) + '_' + (j + 1) + '" name="' + question._id + j +'">' + htmlEntities(answer) + '</label>';
                element += '</div>'
            })
        element += '</div>'
    });
        element += '</form>'

    if(!reviewQuiz.classList.contains('hidden')) {
        element += '<div id="box-result">'
            element += '<h2>Result:</h2>'
            element += '<p class="correctAns">1/10</p>'
            element += '<p class="correctPer">10%</p>'
            element += '<p class="textComment">Practice more to improve it :D</p>'
            element += '<button id="btn-try-again">Try again</button>'
        element += '</div>' 


    }

    
}

callAPI()

buttonStartQuiz.addEventListener('click', startHTMLQuiz)

const submitQuiz = async () => {
    article.appendChild(reviewQuiz)
    reviewQuiz.classList.remove('hidden')
    attemptQuiz.classList.add('hidden')
    boxSubmit.classList.add('hidden')
    await answerForUser()
    attemptQuiz.remove()
    boxSubmit.remove()
    await postSubmitQuiz()
    reviewQuiz.scrollIntoView({behavior: "smooth", block: "start"})

    const buttonTryAgain = document.querySelector('#btn-try-again')
    buttonTryAgain.addEventListener('click', tryAgainQuiz)
}

const answerForUser = () => {
    for (const question of questionList) {
        let answersInput = document.getElementsByName(question)
        answersInput.forEach((answerInput, index) => {
            if(answerInput.checked){
                dataSubmit[question] = index
            }
        })
    }

  
}

const postSubmitQuiz = async () => {
    const response = await fetch('https://wpr-quiz-api.herokuapp.com/attempts/'+ idCode +'/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({"answers": dataSubmit})

    });
    const myJson = await response.json();

    await createView(myJson.questions)
    reviewQuiz.innerHTML = element;


    const correctAnswers = myJson.correctAnswers
    
    for (const question in questionList) {

        let inputsParent = document.getElementsByName(questionList[question])
        inputsParent.forEach((input, index) => {
            let labelParent = document.getElementsByName(questionList[question] + index)
            input.setAttribute('disabled', true)
            labelParent[0].classList.add('noHover')

            //Check answer
            if (dataSubmit[questionList[question]] == correctAnswers[questionList[question]] && correctAnswers[questionList[question]] == index) {
                input.checked = true;
                labelParent[0].classList.add('correct-answer')
                createBoxCheck(labelParent, 'Correct Answer')

            } else if (dataSubmit[questionList[question]] != correctAnswers[questionList[question]] && correctAnswers[questionList[question]] == index) {
                labelParent[0].classList.add('option-correct')
                createBoxCheck(labelParent, 'Correct Answer')

            } else if (dataSubmit[questionList[question]] == index) {
                input.checked = true;
                labelParent[0].classList.add('wrong-answer')
                createBoxCheck(labelParent, 'Wrong Answer')
            }
        
        })
         
    }

    let score = document.querySelector('.correctAns')
    score.innerText = `${myJson.score}/10`

    let percentScore = document.querySelector('.correctPer')
    percentScore.innerText = `${myJson.score*10}%`

    let textComment = document.querySelector('.textComment')
    textComment.innerText = myJson.scoreText
    
}


const createBoxCheck = (labelParent, message) => {
    let parent = labelParent[0].parentElement 
    let boxCheck = document.createElement('span')

    boxCheck.innerText = message
    boxCheck.classList.add('box-check')

    parent.appendChild(boxCheck)
    
}


buttonSubmitQuiz.addEventListener('click', submitQuiz)



const tryAgainQuiz = () => {
    introduction.classList.remove('hidden')
    reviewQuiz.classList.add('hidden')
    article.appendChild(attemptQuiz)
    article.appendChild(boxSubmit)
    const inputs = document.querySelectorAll('input')
    for (const input in inputs) {
        inputs[input].checked = false
    }
}


const htmlEntities = (s) => {
    return s.replace(/[\u00A0-\u9999<>\&]/gim, function (i) {
        return '&#' + i.charCodeAt(0) + ';';
    });
}