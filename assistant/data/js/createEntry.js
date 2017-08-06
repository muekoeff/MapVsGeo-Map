jQuery(document).ready(function($) {
	$("#form_redditUrl_button").click(function() {
		if(validateUrl($("#form_redditUrl").val())
			&& ($("#form_redditUrl").val().startsWith("http://reddit.com/") || $("#form_redditUrl").val().startsWith("http://www.reddit.com/")
				|| $("#form_redditUrl").val().startsWith("https://reddit.com/") || $("#form_redditUrl").val().startsWith("https://www.reddit.com/"))) {
			$("#form_redditUrl").prop("disabled", true);
			$("#form_redditUrl_addon i").removeClass("glyphicon-option-horizontal glyphicon-remove").addClass("glyphicon-refresh");
			$("#form_redditUrl_button").prop("disabled", true);
			$("#form_redditUrl_result_error").hide();
			$("#form_redditUrl_result_success").hide();
			$("#form_redditUrl_result_invalid").hide();

			$.ajax({
				dataType: "json",
				type: "get",
				url: $("#form_redditUrl").val() + ".json"
			}).always(function() {
				$("#form_redditUrl").prop("disabled", false);
				$("#form_redditUrl_addon i").removeClass("glyphicon-refresh").addClass("glyphicon-option-horizontal");
				$("#form_redditUrl_button").prop("disabled", false);
			}).done(function(data) {
				console.log(data);
				try {
					var dataBase = data[0].data.children[0].data;
					$("#form_redditPoster").val(dataBase.author);
					$("#form_redditPosterIsAuthor").prop("checked", true);
					$("#form_redditAuthor").prop("disabled", true);
					$("#form_redditCommentId").val(dataBase.id);

					$("#form_dataDisplayName").val(dataBase.title);

					$("#form_redditUrl_result_success").fadeIn();
				} catch(ex) {
					$("#form_redditUrl_addon i").removeClass("glyphicon-option-horizontal").addClass("glyphicon-remove");
					$("#form_redditUrl_result_error").fadeIn();
					console.log("Unable to read data");
				}
			}).fail(function(data) {
				$("#form_redditUrl_addon i").removeClass("glyphicon-option-horizontal").addClass("glyphicon-remove");
				$("#form_redditUrl_result_error").fadeIn();
			});
		} else {
			$("#form_redditUrl_result_invalid").fadeIn();
		}
	});

	$("#form_redditPosterIsAuthor").change(function() {
		console.log(this.checked);
		if(this.checked) {
			$("#form_redditAuthor").prop("disabled", true);
		} else {
			$("#form_redditAuthor").prop("disabled", false);
		}
	});

	$("#form_dataPositionFetcher_button").click(function() {
		$("#form_dataPositionFetcher_button").prop("disabled", true);
		$("#form_dataPositionFetcher_result_error").hide();
		$("#form_dataPositionFetcher_result_success").hide();
		$("#form_dataPositionFetcher_result_invalid").hide();

		$.ajax({
			dataType: "json",
			type: "get",
			url: "https://maps.google.com/maps/api/geocode/json?address=" + encodeURIComponent($("#form_dataDisplayName").val())
		}).always(function() {
			$("#form_dataPositionFetcher_button").prop("disabled", false);
		}).done(function(data) {
			console.log(data);
			try {
				var dataBase = data.results[0];

				if(($.inArray("country", dataBase.types) != -1 || $.inArray("locality", dataBase.types) != -1) && $.inArray("political", dataBase.types) != -1) {
					$("#form_dataPositionLat").val(dataBase.geometry.location.lat);
					$("#form_dataPositionLng").val(dataBase.geometry.location.lng);
					$("#form_dataPositionFetcher_result_success em").text("(" + dataBase.formatted_address + ")");
					$("#form_dataPositionFetcher_result_success").fadeIn();
				} else {
					$("#form_dataPositionFetcher_result_invalid em").text("(Possible wrong match - doesn't have required tags | " + dataBase.formatted_address + ", lat:" + dataBase.geometry.location.lat + ", lng:" + dataBase.geometry.location.lng + ")");
					$("#form_dataPositionFetcher_result_invalid").fadeIn();
				}
			} catch(ex) {
				$("#form_dataPositionFetcher_result_invalid em").text("");
				$("#form_dataPositionFetcher_result_invalid").fadeIn();
				console.log("Unable to read data");
			}
		}).fail(function(data) {
			$("#form_dataPositionFetcher_result_error").fadeIn();
		});
	});

	$("#form_submit").click(function() {
		var means = "";
		$.each($("#form_dataMeans").val().split(","), function(i, j) {
			if(i != 0) means += ',';
			means += '\n				"' + j + '"';
		});
		if(means != "") means += "\n			";

		var output = `	"` + _e($("#form_redditCommentId").val()) + `": {
		data: {
			displayName: "` + _e($("#form_dataDisplayName").val()) + `",
			means: [` + means + `],
			position: {
				lat: ` + _e($("#form_dataPositionLat").val()) + `,
				lng: ` + _e($("#form_dataPositionLng").val()) + `
			}
		},
		meta: {
			adder: "` + _e($("#form_metaAdder").val()) + `"
		},
		reddit: {
			author: "` + _e( ($("#form_redditPosterIsAuthor").is(":checked") ? $("#form_redditPoster").val() : $("#form_redditAuthor").val()) ) + `",
			commentsId: "` + _e($("#form_redditCommentId").val()) + `"` + "\n" +
(!$("#form_redditPosterIsAuthor").is(":checked") ? `			poster: "` + _e($("#form_redditPoster").val()) + `"` + "\n" : "") +
`		}
	},`;

		$("#form_output textarea").val(output);
		$("#form_output_commit").text("Added " + _e($("#form_dataDisplayName").val()) + " (" + _e($("#form_redditCommentId").val()) + ")");
		$("#form_output").fadeIn();
	});
});

/**
 * Escapes the given string to prevent HTML injection
 * Source: https://stackoverflow.com/a/6234804
 *
 * @param      string  unsafe  String to escape
 * @return     string  Escaped version of 'unsafe'
 */
function _e(unsafe) {
	return unsafe
		 .replace(/&/g, "&amp;")
		 .replace(/</g, "&lt;")
		 .replace(/>/g, "&gt;")
		 .replace(/"/g, "&quot;")
		 .replace(/'/g, "&#039;");
}

/**
 * Source: https://stackoverflow.com/a/8317014
 */
function validateUrl(value) {
	return /^(?:(?:(?:https?):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test( value );
}