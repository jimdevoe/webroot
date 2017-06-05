var animaldb = '';
var autoSearch = true;
var centerMarker;
var ctr;
var currentMarkerIndex = -1;
var drawingManager;
var debugOn = true;
var firstTime = true;	
var geoCount = 0;
var html, wikiHtml, placeHtml, helpHtml = '';
var icons = [
	'http://labs.google.com/ridefinder/images/mm_20_blue.png',
	'http://labs.google.com/ridefinder/images/mm_20_red.png',
	'http://maps.google.com/mapfiles/ms/micons/yellow.png'
//	'http://maps.google.com/mapfiles/ms/micons/blue.png',
//	'http://maps.google.com/mapfiles/ms/micons/red.png',
];
var lat, lon = 0;
var latlng, center, geocoder;
var llb; //latlngbounds
var userloggedin = false ;
var maxrows = 500;
var map1, map2;
var maploaded = false;
var markerArray = [];
var markerArray2 = [];
var marker, marker2;
var myLat = 41.99;
var myLon = -72.88;
var myLocation;
var myLocations = [];
var name;
var NOAAWeather, NOAAWeatherText;
var point;
var points;
var points2 = [];
var place2;
var recordID = 0;
var trackOn = false;
var type;
type = 'boat';
var username = '';
var watchId;
var zoom = 8;
var searchControl;
var street, city, county, state, state_abbr, zip, country = '';
$(document).ready(function() {
	initialize();
	loggedIn();
});


function initialize(){
	debugMessage('initialize()');
	recordID = window.location.hash;
	getCookies();
	setupMap1();
	setupMap2();
	var bikeLayer1 = new google.maps.BicyclingLayer();
	var bikeLayer2 = new google.maps.BicyclingLayer();
	
	if(navigator.geolocation) {
		// navigator.geolocation.getCurrentPosition(setLocation);
	}	
	function setLocation(position) {
		// alert(position.coords.getLatitude);
		
	}
	
	$("#locateButton").click(function () {
		searchMap();
	});
	$("#resetDebugButton").click(function () {
		$('#debugMessage').html('');
	});
	$("#debugOnButton").click(function () {
		debugOn = !debugOn;
		$('#debugOnButton').text('debug? '+debugOn);
	});
	$(".loginButton").click(function () {
		helpOptions = {
			position: 'center',
			width: '400px'
		};
		html =  '<form action="cake3/users/login" method="POST">';
		html += '<table align="left" border="0" cellspacing="0" cellpadding="3">';
		html += '<tr><td>Username:</td><td><input type="text" name="user" maxlength="30"></td></tr>';
		html += '<tr><td>Password:</td><td><input type="password" name="pass" maxlength="30"</td></tr>';
		html += '<input type="hidden" name="sublogin" value="1">';
		html += '<tr><td colspan="2" align="left"><br><font size="2">[<a href="evolt/forgotpass.php">Forgot Password?</a>]</font></td><td align="right"></td></tr>';
		html += '<tr><td colspan="2" align="left"><br>Not registered? <a href="evolt/register.php">Sign-Up!</a></td></tr>'
		html += '<tr><td colspan=2><input type="submit" value="Login"></td></tr>';
		html += '</table>';
		html += '</form>';

		$('#helpMapText').html(html);
		$('#helpMapText').dialog(helpOptions);		
	});


// jquery tabs and buttons initiated here
	$('#boatbikebuttons :input').change(function(e){
		type = (this.id);
		if(type=="bike"){
			bikeLayer1.setMap(map1);
			bikeLayer2.setMap(map2);
		} else {
			bikeLayer1.setMap(null);
			bikeLayer2.setMap(null);
		}
		getPlaces(type);
		google.maps.event.trigger(map1, 'resize');
		google.maps.event.trigger(map2, 'resize');
	});

	
	$('#tabs1').tabs({ 
		fx: { opacity: 'toggle' },
		activate: function(event, ui){
			if(ui.newTab[0].textContent=='map') {
				google.maps.event.trigger(map1, 'resize');
				map1.setCenter(ctr);
			}
		}
	}); 

	$('#tabs2').tabs({ 
		activate: function(event, ui){
			if(ui.newTab[0].textContent=='map') {
				if(maploaded) {
					google.maps.event.trigger(map2, 'resize');
					map2.setCenter(ctr);
				}
				maploaded = true;
			}
		}
	}); 

}

function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}	

function updateLatLonTable(map, displayDiv){
		var latlonTable = '<table class="table table-striped">';
		var center = map.getCenter();
		var bounds = map.getBounds();
		var ne = bounds.getNorthEast();
		var sw = bounds.getSouthWest();
		var nw = new google.maps.LatLng(ne.lat(), sw.lng());
		var se = new google.maps.LatLng(sw.lat(), ne.lng());		
		var swlat = sw.lat();
		var nelat = ne.lat();
		var swlng = sw.lng();
		var nelng = ne.lng();
		var southDistance = google.maps.geometry.spherical.computeDistanceBetween (sw, se) * 0.000621371192;
		var eastDistance = google.maps.geometry.spherical.computeDistanceBetween (ne, se) * 0.000621371192; // convert meters to miles
		var areaPath = [
			ne,
			nw,
			sw,
			se,
			ne
		];
		var area = google.maps.geometry.spherical.computeArea(areaPath) * 0.000247105;  // convert sq meters to acres
		
		latlonTable += '<tr><th>Reference</th><th>Latitude</th><th>Longitude</th></tr>';
		latlonTable += '<tr><td><b>Center</b></td><td>'+center.lat().toFixed(4)+'</td><td>'+center.lng().toFixed(4)+'</td></tr>';
		latlonTable += '<tr><td><b>NE</b></td><td>'+nelat.toFixed(4)+'</td><td>'+nelng.toFixed(4)+'</td></tr>';
		latlonTable += '<tr><td><b>SW</b></td><td>'+swlat.toFixed(4)+'</td><td>'+swlng.toFixed(4)+'</td></tr>';
		latlonTable += '<tr><td><b>Distance</b></td><td>'+southDistance.toFixed(2)+' miles</td><td>'+eastDistance.toFixed(2)+' miles</td></tr>';
		latlonTable += '<tr><td><b>Area</b></td><td colspan=2>'+area.toFixed(2)+' acres</td></tr>';
		latlonTable += '</table>';
		$('#'+displayDiv).html(latlonTable);
};


function displayPoint(markerIndex){
	debugMessage('displayPoint('+markerIndex+')');
	$('#place').html('');
	$('#place2').html('');
	$('#weather').html('');
	$('#optionslinks').html('');

	html = '';
	wikiHtml = '';
	placeHtml = '';
	street = '';
	city = '';
	county = '';
	state_abbr = '';
	state = '';
	zip = '';
	country = '';
	var m = markerArray[markerIndex];
	debugMessage(m);
	var pt = m.getPosition();
	lat = pt.lat();
	lon = pt.lng();
	var latlon = lat + ', ' + lon;
	var ll = 'lat='+lat+'&lng='+lon;
	var latlng = new google.maps.LatLng(lat, lon);
	var id = m.details.id;
	var iphoneDirections 	= "http://maps.google.com?saddr=Current+Location&daddr="+latlon;
	recordID = m.details.id;
	var name = m.details.name;
	$('#place').append('<table class="table table-striped">');
	for(var prop in m.details) {
		tablePairEdit(prop,m.details[prop]);
	}
	$('#place').append('</table>');

	
	place2 = '<table class="table table-striped">';
	for(var prop in m.details) {
		place2 = place2 + '<tr><td>'+prop+'</td><td>'+m.details[prop]+'</td></tr>';
	}
	place2 = place2 + '</table>';
	$('#place2').html(place2);
	$('#directions').html('<a href="'+iphoneDirections+'" target="_blank">directions</a>');
	
	$('#place').append('<button type="button" id="savePlace"   >save</button>');
	$('#place').append('<button type="button" id="cancelPlace" >cancel</button>');
	$('#place').append('<button type="button" id="deletePlace" >delete</button>');
/*
	var content = m.details.comment;
	var url = m.details.url;
	var town = m.details.town;
	var state = m.details.state;
	var source = m.details.source;
	var type = m.details.type;
	var url = m.details.url;
*/	
	$('#placename').html(name);
	var NOAATideLinks	= 'http://tidesandcurrents.noaa.gov/tide_predictions.shtml?type=Tide+Predictions&searchfor='+lat+'%2C+'+lon;
//	$('#option1').html('<a href="'+NOAATideLinks+' id="NOAA" target="_blank">tides</a>');

	placeHtml = '';
	$('#map2_buttons').html('');
	if(userloggedin) {
//		$('#map2_buttons').append('<button type="button" id="editPlace" 	class="ui-button">edit</button>');
//		$('#map2_buttons').append('<button type="button" id="deletePlace" 	class="ui-button">delete</button>');

		var logoutLink = "'/cake3/users/logout'";
		$('#login1').html('<a href="#" id="logout" onclick="location.href='+logoutLink+'">logout '+username+'</a><br>');
	
		google.maps.event.addListener(m, 'click', function() {
			alert('marker');
		});
		
		$("#editPlace").click(function(){
			$( '#place' ).css('visibility','visible');
			$( "#place" ).dialog({
				resizable: false,
				height: "auto",
				width: "500px",
				modal: true
			});
		});

		$("#cancelPlace").click(function(){
			$( "#place" ).dialog('close');
		});
		
		$("#savePlace").click(function(){
			updatePoint();	
			$( "#place" ).dialog('close');
			getPlaces(type);		
		});

		$("#deletePlace").click(function(){
			deletePoint();
			google.maps.event.trigger(map1, 'resize');
		});

	} else
	{
		$('#login1').html('<a href="#" id="login" >login</a><br>');
		$("#login").click(function() {
			$('#loginPopup').css('visibility','visible');
			$( "#loginPopup" ).dialog();
		});
	}
	
   $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
    });
	
	if(marker2) {
		marker2.setMap(null);
		marker2 = null;
	}
	markerEditable = false;
	if(userloggedin) {
		markerEditable = true;
	} 
	
	marker2 = createMarker(map2, name, lat, lon, 2, 1, false, 'asdf', markerEditable);
	if(currentMarkerIndex>-1){
		markerArray[currentMarkerIndex].setIcon(icons[0]);
		markerArray[currentMarkerIndex].setAnimation(null);
	}

	if(userloggedin) {
		google.maps.event.addListener(marker2, 'click', function() {
			$( '#place' ).css('visibility','visible');
			$( "#place" ).dialog({
				resizable: false,
				height: "auto",
				width: "500px",
				modal: true
			});
//			debugMessage('marker listener: click');
//			alert('click'+ name +': ' +lat+','+lon);
		});
//		debugMessage('<h3>Making marker2 draggable</h3>');
		google.maps.event.addListener(marker2, 'drag', function() {
			debugMessage('marker listener: drag');
			$('#lat').val(this.position.lat());
			$('#lon').val(this.position.lng());
		});
	}

	currentMarkerIndex = markerIndex;
	markerArray[markerIndex].setIcon(icons[2]);
	marker2.setMap(map2);
	if($('#map2').css('visibility')=='hidden'){
		$('#map2').css('visibility','visible');
//		$('#place').css('visibility','visible');
	}
	ctr = new google.maps.LatLng(lat,lon);
	map2.setCenter(ctr);
	google.maps.event.trigger(map2, 'resize');
  	window.location.hash = recordID;
 	getReverseGeocode(latlng);
//	getWeather();  		
}


function setupMap1(){
	console.log('entering setupMap1');
	latlng = new google.maps.LatLng(myLat, myLon);
	center = latlng;
	geocoder = new google.maps.Geocoder();

	var myOptions = {
		zoom: zoom,
		center: center,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		navigationControl: true,
		streetViewControl: false,
		mapTypeControl: true,
		navigationControlOptions: {
			position: google.maps.ControlPosition.TOP_LEFT
		}
	};
 
	map1 = new google.maps.Map(document.getElementById("map1"), myOptions);


	google.maps.event.addListener(map1, 'click', function(a){
		debugMessage('map listener - click');
		myLat = a.latLng.lat();
		myLon = a.latLng.lng();
//		getPlaces();
	});
//	if(userloggedin){
		google.maps.event.addListener(map1, 'rightclick', function(a){
			debugMessage('map listener - rightclick');
			myLat = a.latLng.lat();
			myLon = a.latLng.lng();
			insertPoint(a);
			google.maps.event.trigger(map1, 'resize');
		});
//	}
	google.maps.event.addListener(map1, 'drag', function(){
		updateLatLonTable(map1,'map1latlonTable');
	});

	google.maps.event.addListener(map1, 'idle', function(){
		debugMessage('map listener - idle');
		if(autoSearch){
			debugMessage('map1 listener - idle - autoSearch');
//			autoSearch = false;
			center = map1.getCenter();
			myLat = center.lat();
			myLon = center.lng();
			getPlaces(type);		
			console.log('end of map1 idle listener - getPlaces just fired off for type: ',type);
		};
		updateLatLonTable(map1,'map1latlonTable');
		saveCookies();
//		google.maps.event.trigger(map, 'resize');
	});
	google.maps.event.addListener(map1, 'tilesloaded', function(){
		debugMessage('map: tiles loaded');
		if(firstTime){
			debugMessage('map: tiles loaded - first time');
			firstTime = false;
			if(recordID) {
				debugMessage('recordID '+ recordID + ' detected');
				recordID = recordID.substr(1)*1;
//				getPlace(recordID);
			} else {
//				getPlaces();
			}
		};
	});
	console.log('exiting setupMap1');

}		// setupMap()
	
function setupMap2() {
	console.log('entering setupMap2');
	var myOptions2 = {
			zoom: 19,
			center: latlng,
			mapTypeId: google.maps.MapTypeId.SATELLITE,
			navigationControl: true,
			navigationControlOptions: {
				position: google.maps.ControlPosition.TOP_LEFT
			},
			scaleControl: false,
			scaleControlOptions: {
				position: google.maps.ControlPosition.LEFT
			},
			streetViewControl: false
		};
		map2 = new google.maps.Map(document.getElementById("map2"), myOptions2);
//		google.maps.event.trigger(map2, 'resize');
		google.maps.event.addListener(map2,'resize',function(){
			map2.setCenter(ctr);
		});
		
		google.maps.event.addListener(map2,'idle',function(){
			updateLatLonTable(map2,'map2latlonTable');
//			google.maps.event.trigger(map2, 'resize');
//			map2.setCenter(ctr);			
		});
	console.log('exiting setupMap2');

	}
	
function insertPoint(a) {
	lat = a.latLng.lat();
	lon = a.latLng.lng();
	var marker = createMarker(map1, 'new', lat, lon, 0, markerArray.length, true, '', false);
	$.ajax({
		url: '../boats/addlatlon',
		dateType: 'json',
//		type: 'POST',
		data: {
			name: 'new',
			lat: lat,
			lon: lon,
			type: type
		},
		success: function(data) {
		},
		failure: function(){
		}
	});
	
};

function loggedIn() {
	$.ajax({
		url: '../users/loggedin',
		dateType: 'json',
		success: function(data) {
			userloggedin = false;
			if(data) {
				userloggedin = true;
				username = data;
			}
		},
		failure: function(){
		}
	});
	
};

function updatePoint() {

	id 			= $('#id').val();
	name 		= $('#name').val();
	lat 		= $('#lat').val();
	lon 		= $('#lon').val();
	type 		= $('#type').val();
	town		= $('#town').val();
	state 		= $('#state').val();
	zip 		= $('#zip').val();
	comment 	= $('#comment').val();
	url 		= $('#url').val();
	description = $('#description').val();
	json 		= $('#json').val();
	sources 	= $('#sources').val();

	$.ajax({
		url: '../boats/updatelatlon',
		dateType: 'json',
		data: {
			id:  			id,
			name: 			name,
			lat: 			lat,
			lon: 			lon,
			type: 			type,
			town: 			town,
			state: 			state,
			zip: 			zip,
			comment: 		comment,
			url: 			url,
			description: 	description,
			json: 			json,
			sources: 		sources
		},
		success: function(data) {
		},
		failure: function(){
			alert('ruh roh');
		}
	});
	
};

function deletePoint() {
	id 		= $('#id').val();
	$.ajax({
		url: '../boats/deleteJson',
		dateType: 'json',
		data: {
			id:  id
		},
		success: function(data) {
		},
		failure: function(){
			alert('ruh roh');
		}
	});
	
};
function addLink( linkURI, homepage){
	helpOptions = {
		position: 'center',
		width: '400px'
	};

	$.ajax({
		url: '../addlink.php',
		dateType: 'json',
		type: 'POST',
		data: {
			lat: lat,
			lon: lon,
			state: state,
			county: county,
			city: city,
			linkURI: linkURI,
			homepage: homepage
		},
		success: function(data) {
			$('#helpMapText').html(data);
			$('#helpMapText').dialog(helpOptions);		
		},
		failure: function(){
		}
	});
};

// MAPS


function createMarker(map, name, lat, lon, iconIndex, arrayIndex, saveMarker, pointDetails, editable){
//	debugMessage('createMarker(...,'+name+','+lat+','+lon+',...)');
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
	if(saveMarker) {
		markerArray.push(marker);
		google.maps.event.addListener(marker, 'click', function() {
			debugMessage('marker listener: click');
			displayPoint(arrayIndex);
		});
	};
	return marker;
} // displayPoint()


function clearMarkers(markers) {
	debugMessage('clearMarkers()');
	if (markers) {
		for (i in markers) {
			markers[i].setMap(null);
		}
	markers.length = 0;
	}
}



function getReverseGeocode(latlng){
console.log('entering getReverseGeocode');
	$('#place').append('<table class="table table-striped">');
	geocoder.geocode(
		{
		'location' : latlng
		},
		function(results,status){
			$('#place').append('<tr><th>Type</th><th>Short Name</th><th>Long Name</th></tr>');
			if(status==google.maps.GeocoderStatus.OK) {
				for (i in results[0].address_components) {
					var t = results[0].address_components[i];
//					console.log(t);
					for (x in t.types){
						$('#place').append('<tr><td>'+t.types[x]+'</td><td>'+t.short_name+'</td><td>'+t.long_name+'</td></tr>');
					}
/*						if(t.types[x]=='administrative_area_level_1'){
							$('#place2').append('<tr><td>state</td><td>'+t.long_name+'</td></tr>');
							$('#place2').append('<tr><td>abbr</td><td>'+t.short_name+'</td></tr>');
							//getLinks(state_abbr);
						}
						if(t.types[x]=='administrative_area_level_2'){
							$('#place2').append('<tr><td>county</td><td>'+t.long_name+'</td></tr>');
						}
						if(t.types[x]=='locality'){
							$('#place2').append('<tr><td>city</td><td>'+t.long_name+'</td></tr>');
						}
						if(t.types[x]=='postal_code'){
							$('#place2').append('<tr><td>zip</td><td>'+t.long_name+'</td></tr>');
						}
						if(t.types[x]=='route'){
							$('#place2').append('<tr><td>street</td><td>'+t.long_name+'</td></tr>');
						}
						if(t.types[x]=='county'){
							$('#place2').append('<tr><td>county</td><td>'+t.long_name+'</td></tr>');
						}
						if(t.types[x]=='country'){
							$('#place2').append('<tr><td>country</td><td>'+t.long_name+'</td></tr>');
						} 
					} */
				}
			}
		}
	);
	$('#place').append('</table>');
	console.log('exiting getReverseGeocode');
}

// GETS

function getPlaces(type){
	debugMessage('<h2>getPlaces()</h2>');
	clearMarkers();
	console.log('getPlaces');
	var dataHtml = '';
	bounds = map1.getBounds();
	center = map1.getCenter();
	sw = bounds.getSouthWest();
	ne = bounds.getNorthEast();
	points2 = [];
	$.ajax({
		url: '../boats/json',
		type: 'GET',
		data: {
			ctrlat: center.lat(),
			ctrlon: center.lng(),
			//ctrlat: myLat,
			//ctrlon: myLon,
			swlat: sw.lat(),
			swlon: sw.lng(),
			nelat: ne.lat(),
			nelon: ne.lng(),
			count: maxrows,
			type: type
			},
	  	success: function(data) {
	  		debugMessage('getPlaces - success');
			var points = eval(data);
			clearMarkers(markerArray);
			currentMarkerIndex = -1;		
			dataHtml = '<table class="table table-striped">';
			points.forEach(showRow);
			dataHtml += '</table>';
			displayPoint(0);
			$('#places').html(dataHtml);
			
			$(".displayPoint").click(function(event){
				var ev = event.currentTarget;
				var id = ev.id.substring(7,99);
				var marker = markerArray[ix];
				google.maps.event.trigger(marker,'click');
				$("#tabs1").tabs('select',0);
				$("#tabs2").tabs('select',0);
				
			});			
		}
	});
		function showRow(item) {
			currentMarkerIndex = currentMarkerIndex + 1;
			ix = item.id;
			points2[ix] = item;
			points2[ix].markerID = currentMarkerIndex;
			dataHtml += '<tr>';
			dataHtml += '<td>'+item.name+'</td>';
			dataHtml += '<td>'+item.town+'</td>';
			dataHtml += '<td>'+item.state+'</td>';
			dataHtml += '</tr>';

			createMarker(map1,item.name,item.lat,item.lon, 0, markerArray.length, true, item, false);
		};
	
	google.maps.event.trigger(map2, 'resize');
	//autoSearch = true;
};


/* Weather */
	function getWeather() {
		console.log('entering getWeather');
    	$('#weather').html(''); // clear prior display
	weatherHTML = '';
	$.ajax({
		url: 'getWeather_04.php',
		data: {
			lat: lat,
			lon: lon
			},
	  	success: function(data) {
	  	//	$('#weather').html('ok: '+data);
			data = eval("("+data+")");
			weatherHTML = '<ul>';
			for(var prop in data.data.iconLink) {
				weatherHTML += '<li class=forecast-tombstone>';
				weatherHTML += '<b>'+data.time.startPeriodName[prop]+ '</b><br>';
				weatherHTML += '<img height="42" width="42" src="' + data.data.iconLink[prop]+'"> ';
				weatherHTML += '<br><i>'+data.data.weather[prop]+ '</i><br>';
				weatherHTML += data.data.text[prop];
			//	weatherHTML += '<td>'+data.data.temperature[prop]+'</td>';
				weatherHTML += '</li>';
			}
			weatherHTML += '</ul>';
			$('#weather').html(weatherHTML);
		},
		failure: function(){
			$('#weather').html('ruh roh: ' + data);
		}
	});
		console.log('exiting getWeather');

	};


function tablePairOld(label, value){
//	debugMessage('tablePair()');
	if(value) {
		html += '<tr><td><b>'+label+':</b></td><td class="fred">'+value+'</td></tr>';
	} 
}

function tablePair(label, value){
//	debugMessage('tablePair('+label+','+value+')');
	if(value) {
//		return('<tr><td><b>'+label+':</b></td><p> class="editable_textarea" id="'+label+'"><td>'+value+'</td></p></tr>');
		var $newp = $('<tr><td><b>'+label+':</b></td><td>'+value+'</td></tr>');
		$("#place").append($newp);
		return('');
	} 
}

function tablePair2(label, value){
	if(value) {
		var $newp = $('<tr><td><b>'+label+':</b></td><td>'+value+'</td></tr>');
		//$("#place2").append($newp);
	} 
}

function tablePairEdit(label, value){
//	debugMessage('tablePairEdit('+label+','+value+')');
//	if(value) {
		div = '';
		var $newp = $('<tr><td><b>'+label+':</b></td><td><input id="'+label+'" value="'+value+'"/></td></tr>');
		$("#place").append($newp);
//	} 
}

function buttonGet(label, href){
//	debugMessage('buttonAdd('+label+','+href+')');
	if(href){
//		return( '<button type="button" onclick="window.open('+"'"+href+"'"+')">'+label+'</button>');
		return('<b><a href="'+href+'" target="_blank">' + label + '</a></b>');
	}
}

function buttonAdd(label, href){
//	debugMessage('buttonAdd('+label+','+href+')');
	if(href){
//		html +=  '<button type="button" onclick="window.open('+"'"+href+"'"+')">'+label+'</button>';
		return( '<b><a href="'+href+'" target="_blank">' + label + '</a></b>');
	}
}

function linkAdd(tableLabel,href, linkLabel){
//	debugMessage('linkAdd('+tableLabel+','+href+','+linkLabel+')');
	if(href){
		html += '<tr><td><b>'+tableLabel+':</b></td><td><a href="'+href+'" target="_blank">'+linkLabel+'</a></td></tr>';
	}
}

function getCookies(){
	debugMessage('getCookies');
	if($.cookie('myLat')!==null) {
		myLat = $.cookie('myLat');
		debugMessage('getCookies found myLat: '+myLat);
	}
	if($.cookie('myLon')!==null) {
		myLon = $.cookie('myLon');
		debugMessage('getCookies found myLon: '+myLon);
	}
	if($.cookie('zoom')!==null) {
		zoom = 1 * $.cookie('zoom');
	}
	/*
	if($.cookie('userloggedin')!==null) {
		userloggedin = $.cookie('userloggedin');
		username = $.cookie('username');
		debugMessage('getCookies found userloggedin: '+userloggedin);
		debugMessage('getCookies found username: '+username);
	}
	*/
	debugMessage(getCookies());
	
	function getCookies(){
		var pairs = document.cookie.split(";");
		var cookies = {};
			for (var i=0; i<pairs.length; i++){
			var pair = pairs[i].split("=");
			cookies[pair[0]] = unescape(pair[1]);
		}
		return cookies;
	}}

function saveCookies(){
	debugMessage('saveCookies');
	$.cookie('myLat',map1.getCenter().lat(),{expires:7});
	$.cookie('myLon',map1.getCenter().lng(),{expires:7});
	$.cookie('zoom',map1.getZoom(),{expires:7});
}


function debugMessage(msg) {
	if(debugOn){
		console.log(msg);
	}
}	

  
function getLinks(state){
		console.log('entering getLinks');
	$('#links').html(''); //clear prior display if any
	$.ajax({
		url: 'getlinks.php',
		type: 'POST',
		data: {
			state: state
			},
	  	success: function(data) {
			var links = eval(data);
			var dataHtml = '';
			if(links.total>0){
				for(i=0;i<links.total;i++){
					var tp = links.results[i];
					//	dataHtml += '<div class="box col'+(i%4+1)+'">';
						dataHtml += '<div class="box col3">';
						dataHtml += '<a href="'+tp.url+'" target="_blank">'+tp.name+'</a><br>';
						dataHtml += tp.description+'<br>';
						dataHtml += '</div>';
				}
				$('#links').html(dataHtml);
			}
		}
	});
		console.log('exiting getWeather');

} 


