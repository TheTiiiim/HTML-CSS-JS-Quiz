$(() => {
	$("#startQuiz").on("click", function (e) {
		$(".start").fadeOut(() => {
			$(".questionArea").fadeIn()
		});
	});
});