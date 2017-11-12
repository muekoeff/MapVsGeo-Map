/**
 * Escapes the given string to prevent HTML injection
 * Source: https://stackoverflow.com/a/6234804
 *
 * @param	string  unsafe  String to escape
 * @return	string  Escaped version of 'unsafe'
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
 * Generates the HTML for a popup box
 *
 * @param	string  data	Raw data
 * @return	string  Generated HTML
 */
function getPopup(data) {
	return '<style></style>' +
		'<div id="content">' +
		'<h1 id="firstHeading" class="firstHeading">' + _e(data.data.displayName) + '</h1>' +
		'<div id="bodyContent">' +
		'<p>This <i>MapVsGeo</i> was made by <a href="https://www.reddit.com/u/' + _e(data.reddit.author) + '/" target="_blank">/u/' + _e(data.reddit.author) + '</a>' + ('poster' in data.reddit ? ' and posted by <a href="https://www.reddit.com/u/' + _e(data.reddit.poster) + '/" target="_blank">/u/' + _e(data.reddit.poster) + '</a>' : '') + '<br/><br/>' +
		'<a class="btn btn-primary" href="https://www.reddit.com/r/MapVsGeo/comments/' + _e(data.reddit.commentsId) + '/" target="_blank">View on Reddit</a></p>' +
		'</div>' +
		'</div>'
}

function init() {
	var map = L.map('map').setView([51.505, -0.09], 2);
	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		minZoom: 0,
		maxZoom: 19,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'
	}).addTo(map);

	placeMarkers(markers, map);
}

function placeMarkers(markers, map) {
	for(var key in markers) {
		var j = markers[key];

		// Create marker
		var marker = L.marker(j.data.position, {
			riseOnHover: true
		}).addTo(map);
		marker.bindPopup(getPopup(j));
	}
}
