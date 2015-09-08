/**
  @author Christian Gonzalez
  @date September 7th, 2015
 */

// Actualiza la tabla usando el arreglo de objetos locations



var MarkerManager = (function() {
  var markers = [undefined, undefined];
  var current = 0;
  var addMarker = function(latlng) {
    map.setCenter(latlng);
    if (markers[current]) {
      markers[current].setMap(null);
    }
    markers[current] = new google.maps.Marker({
      map: map,
      position: latlng
    });
    if (current < 1) { // Only two markers allowed
      current++; 
    } else {
      current = 0;
    }
  }

  var markerCount = function() {
    return markers[0] != undefined ? (markers[1] != undefined ? 2 : 1) : 0;
  } 

  return {addMarker: addMarker, markerCount: markerCount};
})();

function updateTable(locations) {
  var locationsTable = $('#locations-table');
  for (var i = 0; i < locations.length; i++) {
    var location = locations[i];
    locationsTable.append('<tr id="' + location['id'] +'"></tr>');
    var row = $('#' + location['id']);
    for (var attr in location) {
      if (['id', 'latitude', 'longitud'].indexOf(attr) == -1) {
        row.append('<td class="locations-data">' + location[attr] + '</td>');
      }
    }
    row.append('<td class="locations-data coords">' +
       location['latitude'] + ',' + location['longitud'] + '</td>');
    row.dblclick(function() {
      if (!geocoder) {
        alert('Imposible conectar con los mapas de Google, verifica tu conección a internet.');
      } else {
        // console.log(row.find('.coords').text()); return;
        var coords = $(this).find('.coords').text().split(',');
        var latlng = {lat: parseFloat(coords[0]), lng: parseFloat(coords[1])}; 
        MarkerManager.addMarker(latlng);
      }
    });
  }
}

$(document).ready(function() {
  $.ajax({
    type: 'GET',
    url: 'scripts/get-locations.php',
    success: function(response) {
      // console.log(response);
      var data = JSON.parse(response);
      if (data['response'] == true || data['response'] == 'true') {
        var locations = data['locations'];
        updateTable(locations);
        if (locations.length < 2) {
          alert('Agregue por lo menos 2 localidades para generar una ruta.');
        }
      } else {
        alert(data['error']);
      }
    },
    error: function(error) {
      alert('Error, intenete de nuevo');
    }
  });

  $('#ok-button').click(function() {
    if (MarkerManager.markerCount() != 2) {
      alert('Debes seleccionar dos ubicaciones');
    }
  });

});