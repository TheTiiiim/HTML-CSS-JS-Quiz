class QuestionTracker {
	#questionNumber;
	#questionBankFull;
	#questionBank;
	#areQuestionsLoaded;
	#endQuizCallback;
	questionAmount;

	constructor(questionAmount, endQuizCallback) {
		this.#questionNumber = 0
		this.#areQuestionsLoaded = false;
		this.#endQuizCallback = endQuizCallback;
		this.questionAmount = questionAmount;

		// get question bank from server
		$.getJSON("https://raw.githubusercontent.com/TheTiiiim/HTML-CSS-JS-Quiz/main/questions.json")
			.done((data) => {
				this.#questionBankFull = JSON.parse(JSON.stringify(data));
				this.#questionBank = shuffle(data).slice(0, (this.questionAmount > data.length) ? data.length : this.questionAmount);
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

	reset(questionAmount = this.questionAmount) {
		this.questionAmount = questionAmount;
		this.#questionNumber = 0
		let data = JSON.parse(JSON.stringify(this.#questionBankFull));
		this.#questionBank = shuffle(data).slice(0, (this.questionAmount > data.length) ? data.length : this.questionAmount);
		this.#displayQuestionText();
	}

	getQuestionNumber() {
		return this.#questionNumber;
	}

	nextQuestion() {
		//if question number exceeds questions in bank
		if (this.#questionNumber >= (this.#questionBank.length - 1)) {
			this.#endQuizCallback();
			return false;
		} else {
			this.#questionNumber++;
			this.#displayQuestionText();
			return true;
		}
	}

	areQuestionsLoaded() {
		return this.#areQuestionsLoaded;
	}
}

class Timer {
	defaultStartTime;
	#timeRemaining;
	#timerInterval;
	#timeUpCallback;

	constructor(defaultStartTime, timeUpCallback) {
		this.defaultStartTime = defaultStartTime;
		this.#timeRemaining = defaultStartTime;
		$(".timerDisplay").text(this.#timeRemaining);
		this.#timeUpCallback = timeUpCallback;
	}

	start(startTime = this.defaultStartTime) {
		this.#timeRemaining = startTime;
		this.resume();
	}

	pause() {
		clearInterval(this.#timerInterval);
		return this.#timeRemaining;
	}

	resume() {
		this.#timerInterval = setInterval(() => {
			this.changeTime(-1);
		}, 1000);
	}

	timeRemaining() {
		return this.#timeRemaining;
	}

	changeTime(amount) {
		this.#timeRemaining += amount;
		$(".timerDisplay").text(this.#timeRemaining);

		// Check if time is up
		if (this.#timeRemaining <= 0) {
			this.#timeUpCallback();
		}
	}
}

const questionTracker = new QuestionTracker(10, endQuiz);
const quizTimer = new Timer(60, endQuiz);

// On Load
$(() => {
	// Start Game
	$(".start").on("click", function (e) {
		// Change Screen
		$(".startArea").fadeOut(() => {
			// TODO: wait unitl questionTracker.areQuestionLoaded() is true before fading in
			$(".questionTextArea").css("opacity", "100%");
			$(".questionArea").fadeIn(300, () => {
				quizTimer.start();
			});
		});
	});

	// return to startarea
	$(".back").on("click", function (e) {
		// get parent under main
		let fadeRecipient = $(e.target);
		while (!(fadeRecipient.parent().get(0).nodeName === "MAIN")) {
			fadeRecipient = fadeRecipient.parent();
		}

		// Change Screen
		fadeRecipient.fadeOut(() => {
			$(".startArea").fadeIn();
		});
	});

	// Answer Choices
	$(".questionArea .choice").on("click", function (e) {
		// set feedback value
		if ($(e.target).data("answer") === true) {
			$(".answerResponse").text("Correct!").css("color", "#558564");
		} else {
			$(".answerResponse").text("Incorrect").css("color", "#E4572E");
			quizTimer.changeTime(-5);
			$(".timerChange").text("-5").stop(true, true).css("display", "block").fadeOut(1500)
		}

		// display and animate feedback
		$(".answerResponse").stop(true, true).css("display", "block").fadeOut(2000);

		//change question without setting display: none
		let area = $(".questionTextArea");
		area.animate({ "opacity": "0" }, 200, () => {
			if (questionTracker.nextQuestion()) {
				area.animate({ "opacity": "100%" }, 200);
			}
		});
	});

	// TODO: handle scoreSubmit form submissions
});

function endQuiz() {
	let score = quizTimer.pause();
	$(".questionArea").fadeOut(() => {
		questionTracker.reset();
		if (score <= 0) {
			$(".timeUp").fadeIn();
		} else {
			$("#inputScore").attr("value", score)
			$(".submitScore").fadeIn();
		}
	})
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