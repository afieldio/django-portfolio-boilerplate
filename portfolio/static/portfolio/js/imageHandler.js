$(window).on("load", function imageHandler () {
	var viewportWidth = $(window).width();
	if (viewportWidth < 960) {
		$(".row").removeClass("vertical-align");
	} else if (viewportWidth >=960){
		$(".row").addClass("vertical-align");
	} else {
		$(".row").addClass("vertical-align");
	}
}).resize();