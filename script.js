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

	shuffle(questionBank[number].choices);
	let choices = $(".questionArea .choice");

	//TODO: randomize answer position
	choices.eq(0).text(questionBank[number].choices[0]);
	choices.eq(1).text(questionBank[number].choices[1]);
	choices.eq(2).text(questionBank[number].choices[2]);
	choices.eq(3).text(questionBank[number].answer);

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