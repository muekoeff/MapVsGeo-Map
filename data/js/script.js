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
 * Source: https://stackoverflow.com/a/16606414
 */
function bindInfoWindow(marker, map, infowindow, data) {
	marker.addListener('click', function() {
		var description =
			'<style>.btn-primary{color:#fff;background-color:#0275d8;border-color:#0275d8}.btn{display:inline-block;font-weight:400;line-height:1.25;text-align:center;text-decoration:none;white-space:nowrap;vertical-align:middle;user-select:none;border:1px solid transparent;padding:.5rem 1rem;font-size:.75rem;transition:all .2s ease-in-out}.btn-primary:hover{color:#fff;background-color:#025aa5;border-color:#01549b}</style>'
			+ '<div id="content">'
			+ '<h1 id="firstHeading" class="firstHeading">' + _e(data.data.displayName) + '</h1>'
			+ '<div id="bodyContent">'
			+ '<p>This <i>MapVsGeo</i> was made by <a href="https://www.reddit.com/u/' + _e(data.reddit.author) + '/" target="_blank">/u/' + _e(data.reddit.author) + '</a>' + ('poster' in data.reddit ? ' and posted by <a href="https://www.reddit.com/u/' + _e(data.reddit.poster) + '/" target="_blank">/u/' + _e(data.reddit.poster) + '</a>' : '') + '<br/><br/>'
			+ '<a class="btn btn-primary" href="https://www.reddit.com/r/MapVsGeo/comments/' + _e(data.reddit.commentsId) + '/" target="_blank">View on Reddit</a></p>'
			+ '</div>'
			+ '</div>';

		infowindow.setContent(description);
		infowindow.open(map, this);

		map.setCenter(data.data.position);
	});
}
function initMap() {
	var infowindow = new google.maps.InfoWindow();
	var map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: 52.507629,
			lng: 13.1459661
		},
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		styles: mapStyles['Multi Brand Network'].styles,
		zoom: 4
	});

	for(var key in markers) {
		var j = markers[key];

		// Create marker
		var marker = new google.maps.Marker({
			position: j.data.position,
			map: map,
			title: j.data.displayName
		});

		// Add infowindow
		

		bindInfoWindow(marker, map, infowindow, j);
	}
}