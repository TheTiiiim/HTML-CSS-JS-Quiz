class QuestionTracker {
	#questionNumber;
	#questionBankFull;
	#questionBank;
	#endQuizCallback;
	questionAmount;

	constructor(questionAmount, endQuizCallback) {
		this.#questionNumber = 0
		this.#endQuizCallback = endQuizCallback;
		this.questionAmount = questionAmount;

		// get question bank from server
		$.getJSON("https://raw.githubusercontent.com/TheTiiiim/HTML-CSS-JS-Quiz/main/assets/questions.json")
			.done((data) => {
				// question data master copy
				this.#questionBankFull = JSON.parse(JSON.stringify(data));

				// adjust questionbank length
				this.questionAmount = (this.questionAmount > data.length) ? data.length : this.questionAmount;

				// question data working copy
				this.#questionBank = shuffle(data).slice(0, this.questionAmount);

				// hide spinning circle
				$(".spinnerArea").css("display", "none");
				$(".questionTextArea").css("display", "block")

				// pre-display first question
				this.#displayQuestionText();
				$(".questionAmount").text(this.questionAmount);
			})
			.fail(function () {
				console.error("Unable to load quiz questions.")
			});
	}

	#displayQuestionText() {
		// display question
		$(".questionArea .question").text(this.#questionBank[this.#questionNumber].question);

		// change question number
		$(".questionNumber").text((this.#questionNumber + 1).toString());

		// shuffle incorrect answer choices
		let choicesArray = shuffle(this.#questionBank[this.#questionNumber].choices);

		// query for where choices go
		let choicesQuery = $(".questionArea .choice");

		// determine correct answer's position
		let answerPosition = Math.floor(Math.random() * (3)) + 1;

		// display answer choices
		for (let i = 0; i < 4; i++) {
			let choicePosition = choicesQuery.eq(i);
			choicePosition.removeData("answer");

			// if this is the determined correct answer spot
			if (i === answerPosition) {
				// display the correct answer
				choicePosition.data("answer", true);
				choicePosition.text(this.#questionBank[this.#questionNumber].answer);
			} else {
				// other wise display incorrect choice
				choicePosition.data("answer", false);

				// if answer has been displayed above this choice
				if (answerPosition < i) {
					// adjust for it
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
		$(".questionAmount").text(this.questionAmount);
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
		this.pause();
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
		e.preventDefault(); //prevent default behavior

		// Change Screen
		$(".startArea").fadeOut(() => {
			$(".questionTextArea").css("opacity", "100%");
			$(".timerDisplay").text(quizTimer.defaultStartTime);
			$(".questionArea").fadeIn(300, () => {
				quizTimer.start();
			});
		});
	});

	// return to startarea
	$(".back").on("click", function (e) {
		e.preventDefault(); //prevent default behavior

		// get parent under main
		let fadeRecipient = $(e.target);
		while (!(fadeRecipient.parent().get(0).nodeName === "MAIN")) {
			fadeRecipient = fadeRecipient.parent();
		}

		// Change Screen
		fadeRecipient.fadeOut(() => {

			if (fadeRecipient.hasClass("questionArea")) {
				questionTracker.reset();
				quizTimer.pause();
			}

			$(".startArea").fadeIn();
		});
	});

	// Answer Choices
	$(".questionArea .choice").on("click", function (e) {
		e.preventDefault(); //prevent default behavior
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

	// score submission
	$('.submitScore').on("submit", function (e) {
		// prevent the page refresh
		e.preventDefault();

		// disable button for no double-submission
		$("#SubmitScoreButton").prop("disabled", true);

		let dataArray = $(e.target).serializeArray();

		let dataObj = {};

		for (let i = 0; i < dataArray.length; i++) {
			let name = dataArray[i]["name"]
			let value = dataArray[i]["value"]

			if (name === "score") {
				value = parseInt(value);
			}

			dataObj[name] = value;
		}

		let highscores = [];

		try {
			// adds value to existing highscores object if possible
			highscores = JSON.parse(window.localStorage.getItem("highScores"));

			if (Array.isArray(highscores)) {
				highscores.push(dataObj);
				highscores.sort((a, b) => {
					var aScore = a.score;
					var bScore = b.score;
					return ((aScore > bScore) ? -1 : ((aScore > bScore) ? 1 : 0));
				});
			} else {
				throw new Error();
			}
		} catch {
			// otherwise creates a new one
			highscores = [dataObj];
		} finally {
			window.localStorage.setItem("highScores", JSON.stringify(highscores));
			$(".scoreSubmittedAlert").stop(true, true).css("display", "block").fadeOut(3000);
		}
	});

	// High Scores
	$(".highscoresButton").on("click ", function (e) {
		e.preventDefault(); //prevent default behavior

		// get parent under main
		let fadeRecipient = $(e.target);
		while (!(fadeRecipient.parent().get(0).nodeName === "MAIN")) {
			fadeRecipient = fadeRecipient.parent();
		}

		let highscores = [];

		try {
			// reads highscores object if possible
			highscores = JSON.parse(window.localStorage.getItem("highScores"));
		} catch (e) {
			console.log(e)
		} finally {
			if (Array.isArray(highscores)) {
				highscores = highscores.slice(0, 10);

				// display data
				let dataArea = $(".highScoresData tbody").children("tr");
				dataArea.each(function (index, element) {
					console.log
					element = $(element).children("td");
					if (highscores[index]) {
						element.eq(0).text(highscores[index].user);
						element.eq(1).text(highscores[index].score);
					} else {
						element.eq(0).text("");
						element.eq(1).text("");
					}
				});
			}
			// Change Screen
			fadeRecipient.fadeOut(() => {
				$(".highScores").fadeIn();
			});
		}
	});

	// Clear High Scores
	$(".clearScores").on("click touchstart", function (e) {
		e.preventDefault(); //prevent default behavior
		if (e.type == "touchstart") {
			this.hasBeenTouchedRecently = true;
			setTimeout(() => { this.hasBeenTouchedRecently = false; }, 500);
		} else if (e.type == "click") {
			if (this.hasBeenTouchedRecently) {
				return;
			}
		}
		// clear highscores table
		let dataArea = $(".highScoresData tbody").children("tr");
		dataArea.each(function (index, element) {
			element = $(element).children("td");
			element.eq(0).text("");
			element.eq(1).text("");
		});

		//clear scores from localdata
		window.localStorage.removeItem("highScores")
	});
});

function endQuiz() {
	let score = quizTimer.pause();
	$(".questionArea").fadeOut(() => {
		questionTracker.reset();
		if (score <= 0) {
			$(".timeUp").fadeIn();
		} else {
			$(".scoreValue").attr("value", score);
			$("#SubmitScoreButton").prop("disabled", false);
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