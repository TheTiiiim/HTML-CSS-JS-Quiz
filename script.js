class QuestionTracker {
	#questionNumber
	#questionBank
	#areQuestionsLoaded

	constructor() {
		this.#questionNumber = 0
		this.#areQuestionsLoaded = false;

		// get question bank from server
		$.getJSON("https://raw.githubusercontent.com/TheTiiiim/HTML-CSS-JS-Quiz/main/questions.json")
			.done((data) => {
				this.#questionBank = shuffle(data).slice(0, 10);
				this.#areQuestionsLoaded = true;
				this.#displayQuestionText();
			});
	}

	#displayQuestionText() {
		$(".questionArea .question").text(this.#questionBank[this.#questionNumber].question);

		let choicesArray = shuffle(this.#questionBank[this.#questionNumber].choices);
		let choicesQuery = $(".questionArea .choice");

		let answerPosition = Math.floor(Math.random() * (3)) + 1;

		// Iterates through positions spots and assigns one to be answer
		for (let i = 0; i < 4; i++) {
			let choicePosition = choicesQuery.eq(i);
			choicePosition.removeData("answer");
			if (i === answerPosition) {
				choicePosition.data("answer", true);
				choicePosition.text(this.#questionBank[this.#questionNumber].answer);
			} else {
				choicePosition.data("answer", false);
				if (answerPosition < i) {
					let adjustedChoice = i - 1;
					choicePosition.text(choicesArray[adjustedChoice]);
				} else {
					choicePosition.text(choicesArray[i]);
				}
			}
		}
	}

	getQuestionNumber() {
		return this.#questionNumber;
	}

	nextQuestion() {
		this.#questionNumber++;
		this.#displayQuestionText();
		return this.#questionNumber;
	}

	areQuestionsLoaded() {
		return this.#areQuestionsLoaded;
	}
}

let timeRemaining = 60;
let timerInterval;

// On Load
$(() => {
	let questionTracker = new QuestionTracker();

	// Start Game
	$("#startQuiz").on("click", function (e) {
		// Change Screen
		$(".start").fadeOut(() => {
			// TODO: wait unitl questionTracker.areQuestionLoaded() is true before fading in
			$(".questionArea").fadeIn(300, () => {
				// Set Timer;
				let timerInterval = setInterval(updateTimer, 1000);
			});
		});
	});

	// Answer Choices
	$(".questionArea .choice").on("click", function (e) {
		// set feedback value
		if ($(e.target).data("answer") === true) {
			$(".answerResponse").text("Correct!").css("color", "#558564");
		} else {
			$(".answerResponse").text("Incorrect").css("color", "#E4572E");
			updateTimer(-5);
			$(".timerChange").text("-5").stop(true, true).css("display", "block").fadeOut(1500)
		}

		// display and animate feedback
		$(".answerResponse").stop(true, true).css("display", "block").fadeOut(2000);

		//change question
		$(".questionTextArea").fadeOut(200, () => {
			questionTracker.nextQuestion();
			$(".questionTextArea").fadeIn(200);
		});
	});

	// PROBLEM: application dies when questionBank is exhausted
});

function updateTimer(change = -1) {
	timeRemaining += change;
	$(".timerDisplay").text(timeRemaining);
	if (timeRemaining <= 0) {
		clearInterval(timerInterval);
		// TODO: end quiz
	}
}


// http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}