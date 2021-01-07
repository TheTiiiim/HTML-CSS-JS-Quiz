let isReady = false;
let questionBank

$(() => {
	// get question bank from server
	$.getJSON("https://raw.githubusercontent.com/TheTiiiim/HTML-CSS-JS-Quiz/main/questions.json")
		.done((data) => {
			questionBank = shuffle(data);
			isReady = true;
		});

	$("#startQuiz").on("click", function (e) {
		$(".start").fadeOut(() => {
			setQuestion(0);
			$(".questionArea").fadeIn()
		});
	});

	//TODO: hook to answer choice button clicks and advance questions
});

function setQuestion(number) {
	$(".questionArea .question").text(questionBank[number].question);

	let choicesArray = shuffle(questionBank[number].choices);
	let choicesQuery = $(".questionArea .choice");

	let answerPosition = Math.floor(Math.random() * (3)) + 1;

	// Iterates through choice spots and assigns one to be answer
	for (i = 0; i < 4; i++) {
		if (i === answerPosition) {
			choicesQuery.eq(i).text(questionBank[number].answer);
		} else {
			if (answerPosition < i) {
				let adjustedChoice = i - 1;
				choicesQuery.eq(i).text(choicesArray[adjustedChoice]);
			} else {
				choicesQuery.eq(i).text(choicesArray[i]);
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