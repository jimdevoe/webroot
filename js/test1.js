// google.load('search', '1.0');
// google.setOnLoadCallback(searchLoad, true);
var map;
var markers = [];
		
var myLat = 42.02737895727626;
var myLon = -72.76871507644655;
var	swlat =  42;
var nelat =  43;
var swlng = -74;
var nelng = -72;
var icons = [
	'http://labs.google.com/ridefinder/images/mm_20_blue.png',
	'http://labs.google.com/ridefinder/images/mm_20_red.png',
	'http://maps.google.com/mapfiles/ms/micons/yellow.png'
//	'http://maps.google.com/mapfiles/ms/micons/blue.png',
//	'http://maps.google.com/mapfiles/ms/micons/red.png',
];
$(document).ready(function() {
	initialize();
});

function initialize(){
	console.log('initialize');
	setupMap();
	getPlaces();
}; 

function setupMap(){
	latlng = new google.maps.LatLng(myLat, myLon);
	center = latlng;
	
	var myOptions = {
		zoom: 13,
		center: center,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		navigationControl: true,
		streetViewControl: false,
		mapTypeControl: false,
		navigationControlOptions: {
			position: google.maps.ControlPosition.TOP_LEFT
		}
	};
 
	map = new google.maps.Map(document.getElementById("map"), myOptions);
	
	google.maps.event.addListener(map, 'drag', function(){
		updateLatLonTable();
	});

	google.maps.event.addListener(map, 'idle', function(){
		updateLatLonTable();
		getPlaces();
	});

	google.maps.event.addListener(map, "rightclick", function(event) {
		var lat = event.latLng.lat();
		var lon = event.latLng.lng();
		addPlace(lat,lon);
	});

	google.maps.event.addListener(map, "touchstart", function(event) {
		alert('touchstart');
	});

};

function updateLatLonTable(){
		var latlonTable = '';
		center = map.getCenter();
		bounds = map.getBounds();
		northeast = bounds.getNorthEast();
		southwest = bounds.getSouthWest();
		swlat = southwest.lat();
		nelat = northeast.lat();
		swlng = southwest.lng();
		nelng = northeast.lng();
		latlonTable += '<tr><th>Point</th><th>lat</th><th>lon</th></tr>';
		latlonTable += '<tr><td>Center</td><td>'+center.lat().toFixed(2)+'</td><td>'+center.lng().toFixed(2)+'</td></tr>';
		latlonTable += '<tr><td>NE</td><td>'+northeast.lat().toFixed(2)+'</td><td>'+northeast.lng().toFixed(2)+'</td></tr>';
		latlonTable += '<tr><td>SW</td><td>'+southwest.lat().toFixed(2)+'</td><td>'+southwest.lng().toFixed(2)+'</td></tr>';
		$('#latlon').html(latlonTable);
};

function addPlace(lat,lon) {
	var name = prompt("Enter name of launch", "new launch");
	$.ajax({
		url: '/cake3/boats/addlatlon',
		data: {
			lat: lat,
			lon: lon,
			name: name
		},
		success: function(data) {
			getPlaces();
		}
	});
};

function getPlaces() {
	$.ajax({
		url: '/cake3/boats/json',
		data: {
			ctrlat: myLat,
			ctrlon: myLon,
			swlat: swlat,
			nelat: nelat,
			swlon: swlng,
			nelon: nelng,
			count: 250
		},
		success: function(data) {
			clearMarkers();
			console.log('success');
			var points = eval(data);
			var dataHtml = '<table>';
			dataHtml += '<tr>';
			dataHtml += '<th>Name</th>';
		//	dataHtml += '<th>Lat</th>';
		//	dataHtml += '<th>Lon</th>';
		//	dataHtml += '<th>Town</th>';
			dataHtml += '<th>State</th>';
			dataHtml += '<th>Sources</th>';
			dataHtml += '</tr>';
			var markerIndex = 0;
			points.forEach(showRow);
			dataHtml += '</table>';
			$('#test1').html(dataHtml);
			
			function showRow(item) {
				dataHtml += '<tr>';
				dataHtml += '<td>'+item.name+'</td>';
			//	dataHtml += '<td>'+item.lat+'</td>';
			//	dataHtml += '<td>'+item.lon+'</td>';
			//	dataHtml += '<td>'+item.town+'</td>';
				dataHtml += '<td>'+item.state+'</td>';
				dataHtml += '<td>'+item.source+'</td>';
				dataHtml += '</tr>';
				createMarker(map,item.name,item.lat,item.lon,3, item.source, true);
			}
		}
	});
};

function createMarker(map, name, lat, lon, iconIndex, pointDetails, editable){
	var point = new google.maps.LatLng(lat, lon);
	var marker = new google.maps.Marker({
		position: 	point,
		map: 		map,
		icon: 		icons[iconIndex],
		title: 		name,
		draggable:  editable,
		editable:	editable,
		details:	pointDetails
	});	
	marker.setMap(map);
	markers.push(marker);
};

     // Sets the map on all markers in the array.
      function setMapOnAll(map) {
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(map);
        }
      }

      // Removes the markers from the map, but keeps them in the array.
      function clearMarkers() {
        setMapOnAll(null);
      }

      // Shows any markers currently in the array.
      function showMarkers() {
        setMapOnAll(map);
      }

      // Deletes all markers in the array by removing references to them.
      function deleteMarkers() {
        clearMarkers();
        markers = [];
      }





