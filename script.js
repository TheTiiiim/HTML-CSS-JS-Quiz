let questionBank;

$(() => {
	let questionNumber = 0;
	let questionsLoaded = false;

	// get question bank from server
	$.getJSON("https://raw.githubusercontent.com/TheTiiiim/HTML-CSS-JS-Quiz/main/questions.json")
		.done((data) => {
			questionBank = shuffle(data);
			questionsLoaded = true;
		});

	// Start Game
	// TODO: wait unitl isReady is true before fading in
	$("#startQuiz").on("click", function (e) {
		$(".start").fadeOut(() => {
			setQuestion(questionNumber);
			$(".questionArea").fadeIn();
		});
	});

	// Answer Choices
	$(".questionArea .choice").on("click", function (e) {
		$(".questionArea").fadeOut(() => {
			questionNumber++;
			setQuestion(questionNumber);
			$(".questionArea").fadeIn();
		});
	});

	// PROBLEM: application dies when questionBank is exhausted
});

function setQuestion(number) {
	$(".questionArea .question").text(questionBank[number].question);

	let choicesArray = shuffle(questionBank[number].choices);
	let choicesQuery = $(".questionArea .choice");

	let answerPosition = Math.floor(Math.random() * (3)) + 1;

	// Iterates through positions spots and assigns one to be answer
	for (i = 0; i < 4; i++) {
		let choicePosition = choicesQuery.eq(i);
		if (i === answerPosition) {
			choicePosition.text(questionBank[number].answer);
			choicePosition.data("answer", true);
		} else {
			choicePosition.data("answer", false);
			if (answerPosition < i) {
				let adjustedChoice = i - 1;
				choicePosition.text(choicesArray[adjustedChoice]);
				//assign data
			} else {
				choicePosition.text(choicesArray[i]);
				//assign data
			}
		}
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