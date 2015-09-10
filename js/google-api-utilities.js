/**
  @author Christian Gonzalez
  @date September 7th, 2015
 */


// Google Masp api reference: https://developers.google.com/maps/documentation/javascript/reference

var geocoder;
var map;

var RouteManager; 

// Inicializa el mapa con la ubicacion del dispositivo
function initMap() {
  geocoder = new google.maps.Geocoder();
  var latlng = new google.maps.LatLng(0, 0);
  var mapOptions = {
    zoom: 1,
    center: latlng 
  }
  map = new google.maps.Map(document.getElementById("map"), mapOptions);
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      map.setCenter(latlng);  
      map.setZoom(14);
      geocoder.geocode({'location': latlng}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            if (typeof(setAddressComponents) == 'function') {
              setAddressComponents(results[0].address_components);
            }
          }
        }
      });
    });
  }

  RouteManager = (function() {
    var markers = [undefined, undefined];
    var current = 0; // Index where the next marker will be put.
    var directionsService = new google.maps.DirectionsService();
    var directionsRenderers = [];

    var travelModes = {
      'Bicicleta': google.maps.DirectionsTravelMode.BICYCLING,
      'Coche': google.maps.DirectionsTravelMode.DRIVING,
      'Transporte público': google.maps.DirectionsTravelMode.TRANSIT,
      'Caminando': google.maps.DirectionsTravelMode.WALKING
    };
    
    var addMarker = function(latlng) {
      map.setCenter(latlng);
      if (markers[current]) {
        markers[current].setMap(null);
      }
      markers[current] = new google.maps.Marker({
        map: map,
        position: latlng,
        animation: google.maps.Animation.DROP
      });
      if (current < 1) { // Only two markers allowed
        current++; 
      } else {
        current = 0;
      }
    }

    var clearMarkers = function() {
      markers.forEach(function(value, index, array) {
        value.setMap(null);
        array[index] = undefined;
      });
      current = 0;
    }

    var clearRoutes = function() {
      directionsRenderers.forEach(function(value, index, array) {
        value.setMap(null);
      });
      directionsRenderers.length = 0;
    }

    var markerCount = function() {
      return markers[0] != undefined ? (markers[1] != undefined ? 2 : 1) : 0;
    } 

    // Referencia: http://www.sitepoint.com/find-a-route-using-the-geolocation-and-the-google-maps-api/
    var makeRoute = function() {
      if (markerCount() < 2) {
        $('#status-bar-div').text('Selecciona dos localidades');
      } else {
        var travelMode = $('#travel-mode').val();
        if (travelModes.hasOwnProperty(travelMode)) {
          travelMode = travelModes[travelMode];
          var directionsRequest = {
            origin: markers[0].getPosition(),
            destination: markers[1].getPosition(),
            travelMode: travelMode,
            unitSystem: google.maps.UnitSystem.METRIC
          };
          directionsService.route(directionsRequest, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
              directionsRenderers.push(new google.maps.DirectionsRenderer({
                map: map,
                directions: response
              }));
              $('#status-bar-div').text('');
            } else {
              $('#status-bar-div').text('Imposible generar ruta, intente con otro medio de transporte');
            }
          });
        } else {
          $('#status-bar-div').text('Modo de viaje desconocido');
        }
      }
    }

    return {
      addMarker: addMarker, 
      markerCount: markerCount, 
      makeRoute: makeRoute,
      clearRoutes: clearRoutes
    };
  })(); // RouteManager end
}