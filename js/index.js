/**
  @author Christian Gonzalez
  @date September 7th, 2015
  @update September 8th, 2015
 */

// Actualiza la tabla usando el arreglo de objetos locations
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
    row.css('cursor', 'pointer');
    row.append('<td class="locations-data coords">' +
       location['latitude'] + ',' + location['longitud'] + '</td>');
    row.dblclick(function() {
      if (!geocoder) {
        alert('Imposible conectar con los mapas de Google, verifica tu conección a internet.');
      } else {
        // console.log(row.find('.coords').text()); return;
        var coords = $(this).find('.coords').text().split(',');
        var latlng = {lat: parseFloat(coords[0]), lng: parseFloat(coords[1])}; 
        RouteManager.addMarker(latlng);
      }
    });
    row.mouseenter(function() {
      $(this).find('td').css('background-color', '#CCFFFF');
    })
    row.mouseleave(function() {
      $(this).find('td').css('background-color', '#EAF2D3');
    })
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
          alert('Agregue por lo menos 2 localidades a la base de datos para poder generar una ruta.');
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
    if (!RouteManager) {
      alert('Verifica tu conección a internet');
    } else {
      RouteManager.makeRoute();
    }
  });

  $('clear-routes-button').click(function() {
    if (!RouteManager) {
      alert('Verifica tu coneccion a internet');
    } else {
      RouteManager.clearRoutes();
    }
  });
});