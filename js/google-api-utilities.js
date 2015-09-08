/**
  @author Christian Gonzalez
  @date September 7th, 2015
 */


var geocoder;
var map;

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
}