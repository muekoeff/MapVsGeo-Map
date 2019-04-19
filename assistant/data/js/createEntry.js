jQuery(document).ready(function($) {
	$("#form_redditUrl_button").click(function() {
		// If domain Reddit
		if(validateUrl($("#form_redditUrl").val())
			&& $("#form_redditUrl").val().toLowerCase().match(/https?:\/\/([^.]*\.)?reddit\.com\//)) {

			// If subreddit MapVsGeo
			if($("#form_redditUrl").val().toLowerCase().match(/https?:\/\/([^.]*\.)?reddit\.com\/r\/mapvsgeo\//)) {
				resetForm(false);
				$("#form_redditUrl_result").hide();
	
				$.ajax({
					dataType: "json",
					type: "get",
					url: $("#form_redditUrl").val() + ".json"
				}).always(function() {
					if($("#form_redditUrlOriginal").val().length === 0) {
						resetForm(true);
					}
				}).done(function(data) {
					console.debug(data);
					try {
						var dataBase = data[0].data.children[0].data;
						$("#form_redditPoster").val(dataBase.author);
						$("#form_redditPosterIsAuthor").prop("checked", true);
						$("#form_redditAuthor").prop("disabled", true);
						$("#form_redditCommentId").val(dataBase.id);
	
						$("#form_dataDisplayName").val(dataBase.title);
						
						if($("#form_redditUrlOriginal").val().length === 0) {
							$("#form_redditUrl_result").attr("class", "alert alert-success").text("Data successfully fetched").fadeIn();
						} else {
							$.ajax({
								dataType: "json",
								type: "get",
								url: $("#form_redditUrlOriginal").val() + ".json"
							}).always(function() {
								resetForm(true);
							}).done(function(data) {
								console.debug(data);
								try {
									var dataBaseOriginal = data[0].data.children[0].data;
									$("#form_redditCommentIdOriginal").val(dataBaseOriginal.id);
									if(dataBaseOriginal.author == dataBase.author) {
										$("#form_redditPosterIsAuthor").prop("checked", true);
										$("#form_redditAuthor").prop("disabled", true);
									} else {
										$("#form_redditPosterIsAuthor").prop("checked", false);
										$("#form_redditAuthor").prop("disabled", false);
										$("#form_redditAuthor").val(dataBaseOriginal.author);
									}
								} catch(ex) {
									$("#form_redditUrl_result").attr("class", "alert alert-danger").html("Unable to request data <small>(Invalid answer)</small>").fadeIn();
								}
							}).fail(function(data) {
								$("#form_redditUrl_result").attr("class", "alert alert-danger").html("Unable to request data <small>(Request failed)</small>").fadeIn();
							});
						}
					} catch(ex) {
						$("#form_redditUrl_result").attr("class", "alert alert-danger").html("Unable to request data <small>(Invalid answer)</small>").fadeIn();
					}
				}).fail(function(data) {
					$("#form_redditUrl_result").attr("class", "alert alert-danger").html("Unable to request data <small>(Request failed)</small>").fadeIn();
				});
			} else {
				$("#form_redditUrl_result").attr("class", "alert alert-danger").text("We only accept posts from /r/MapVsGeo").fadeIn();
			}
		} else {
			$("#form_redditUrl_result").attr("class", "alert alert-danger").text("Invalid Reddit URL").fadeIn();
		}
		
		function resetForm(state) {
			$("#form_redditUrl").prop("disabled", !state);
			$("#form_redditUrl_button").prop("disabled", !state);
			$("#form_redditUrlOriginal").prop("disabled", !state);
		}
	});

	$("#form_redditPosterIsAuthor").change(function() {
		$("#form_redditAuthor").prop("disabled", this.checked);
	});

	$("#form_dataPositionFetcher_button").click(function() {
		$("#form_dataPositionFetcher_button").prop("disabled", true);
		$("#form_dataPositionFetcher_result").hide();

		if($("#form_dataDisplayName").val().length > 0) {
			$.ajax({
				data: {
					format: "json",
					q: $("#form_dataDisplayName").val()
				},
				dataType: "json",
				type: "get",
				url: "https://nominatim.openstreetmap.org/search"
			}).always(function() {
				$("#form_dataPositionFetcher_button").prop("disabled", false);
			}).done(function(data) {
				console.debug(data);
				try {
					if(data.length > 0) {
						$.each(data, function(i, val) {
							if(val.type == "administrative" || val.type == "city" || val.type == "island") {
								$("#form_dataPositionLat").val(val.lat);
								$("#form_dataPositionLng").val(val.lon);
								$("#form_dataPositionFetcher_result").attr("class", "alert alert-success").html(`Location found (<a href="https://osm.org/?mlat=${val.lat}&mlon=${val.lon}" target="_blank" rel="noopener">${_e(val.display_name)})</a>`).fadeIn();
							}
						});
					} else {
						$("#form_dataPositionFetcher_result").attr("class", "alert alert-danger").text(`No locations found`).fadeIn();
					}
				} catch(ex) {
					$("#form_dataPositionFetcher_result").attr("class", "alert alert-danger").text(`Unable to request coordinates (Invalid answer)`).fadeIn();
				}
			}).fail(function(data) {
				$("#form_dataPositionFetcher_result").attr("class", "alert alert-danger").text(`Unable to request coordinates (Request failed)`).fadeIn();
			});
		} else {
			$("#form_dataPositionFetcher_result").attr("class", "alert alert-danger").text(`Please enter a location to look for`).fadeIn();
		}		
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
			author: "${_e($("#form_redditPosterIsAuthor").is(":checked") ? $("#form_redditPoster").val() : $("#form_redditAuthor").val())}",
			commentsId: "${_e($("#form_redditCommentId").val())}",`
+ (!$("#form_redditPosterIsAuthor").is(":checked") ? `\n			poster: "${_e($("#form_redditPoster").val())}",` : "")
+ ($("#form_redditCommentIdOriginal").val().length > 0 ? `\n			commentsIdOriginal: "${_e($("#form_redditCommentIdOriginal").val())}",` : "")
+ `
		}
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