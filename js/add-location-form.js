/**
  @author Christian Gonzalez
  @date September 6th, 2015
 */

var countries; 
var geocoder;
var map;
var latlng;

// Sacado de http://www.etnassoft.com/2011/03/03/eliminar-tildes-con-javascript/
var normalizeString = (function() {
  var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç"; 
  var to   = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc";
  var mapping = {};
 
  for(var i = 0, j = from.length; i < j; i++ )
    mapping[ from.charAt( i ) ] = to.charAt( i );
 
  return function( str ) {
    var ret = [];
    for( var i = 0, j = str.length; i < j; i++ ) {
      var c = str.charAt( i );
      if( mapping.hasOwnProperty( str.charAt( i ) ) )
        ret.push( mapping[ c ] );
      else
        ret.push( c );
    }      
    return ret.join( '' );
  }
})();

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
            setAddressComponents(results[0].address_components);
          }
        }
      });
    });
  }
}

// Verifica alguno de los elementos de elems esta dentro de array
function containsSome(array, elems) {
  for (var i = 0; i < elems.length; i++) {
    if (array.indexOf(elems[i]) != -1) return true;
  }
  return false;
}

// Establece el valor de los campos del formulario usando 
// los componenetes de direccion regresados por la Google API
function setAddressComponents(address_components) {
  var country;
  var region;
  var streetAddress;
  for (var i = 0; i < address_components.length; i++) {
    var component = address_components[i];
    if (containsSome(component.types, ['country'])) {
      country = normalizeString(component.long_name);
    } else if (containsSome(component.types, ['administrative_area_level_1'])) {
      region = normalizeString(component.long_name);
    } else if (containsSome(component.types, ['street_address', 'route', 'neighborhood'])) {
      streetAddress = normalizeString(component.long_name);
    }
  }
  if (countries[country] != undefined) {
    if (countries[country].indexOf(region) == -1) {
      countries[country].push(region);
      $('#region').append('<option>' + region + '</option>');
    }
  } else {
    countries[country] = [region];
    $('#country').append('<option>' + country + '</option>');
    $('#region').append('<option>' + region + '</option>');
  }
  $('#country').val(country);
  updateRegions(country);
  $('#region').val(region);
  $('#address').val(streetAddress);
}

// Establece la posicion y zoom del mapa con base en una direccion
function geocodeAddress(address, zoomLevel) {
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      var result = results[0]; 
      latlng = result.geometry.location; 
      map.setCenter(latlng);
      if (zoomLevel) {
        map.setZoom(zoomLevel);
      }
    } else {
      alert('No se pudo encontrar el lugar, intente cambiar el formato de la ubicacion');
    }
  });
  return latlng;
}

// Checa si una cadena contiene solo caracteres ascii
function isAsciiOnly(str) {
  return !str.split('').some(function(symbol) { symbol.charCodeAt(0) > 127 });
}

// Realiza una peticion xmlhttp para cargar los paises en "resources/countries-states.json"
function loadCountries() {  
  $.ajax({
    dataType: "json",
    url: "resources/countries-states.json",
    success: function(data) {
      countries = data;
      var countryList = Object.keys(countries).sort();
      var countrySelect = $('#country');
      for (var i = 0; i < countryList.length; i++) {
        var country = countryList[i];
        if (country != null && country !== '' && isAsciiOnly(country)) {
          countrySelect.append('<option>' + country + '</option>')
        }
      }
      updateRegions(countrySelect.find(':selected').text());
    }
  });
}

// Actualiza las opciones del select "region" con base en el pais seleccionado
function updateRegions(country, regionCount) {
  var regions = countries[country];
  var regionsSlice = regions.slice(0, 
    regionCount && regionCount < regions.length ? regionCount : regions.length).sort();
  var regionSelect = $('#region');
  regionSelect.empty();
  for (var i = 0; i < regionsSlice.length; i++) {
    var region = regionsSlice[i];
    if (region != null && region != '' && isAsciiOnly(region)) {
      regionSelect.append('<option>' + region + '</option>');
    }
  }
}

$(document).ready(function() {
  loadCountries();

  var countrySelect = $('#country');
  var regionSelect = $('#region');
  var addressInput = $('#address');

  countrySelect.change(function() {
    var selectedCountry = countrySelect.find(':selected').text();
    var selectedRegion = regionSelect.find(':selected').text();
    geocodeAddress(selectedRegion + ',' + selectedCountry, 11);
    updateRegions(selectedCountry, 50);
  });
  
  regionSelect.change(function() {
    var selectedCountry = countrySelect.find(':selected').text();
    var selectedRegion = regionSelect.find(':selected').text();
    geocodeAddress(selectedRegion + ',' + selectedCountry, 12);
  });

  var updateMap = function() {
    var selectedCountry = countrySelect.find(':selected').text();
    var selectedRegion = regionSelect.find(':selected').text();
    var address = addressInput.val();
    return geocodeAddress(address + ',' + selectedRegion + ',' + selectedCountry, 14);
  };

  addressInput.change(function() {
    updateMap();
  });

  var isEmptyString = function(str) { return str == null || str == ''; }

  $('form').submit(function(event) {
    event.preventDefault();

    latlng = updateMap();
    if (!latlng) return;

    // console.log($('form').serialize() + '&lat=' + latlng.lat() + '&lng=' + latlng.lng());

    $.ajax({
      type: 'POST',
      url: 'scripts/add-location.php',
      data: $('form').serialize() + '&lat=' + latlng.lat() + '&lng=' + latlng.lng(),
      success: function(response) {
        console.log(response);
        var data = JSON.parse(response);
        if (data['response'] == true || data['response'] == 'true') {
          alert('Registro agregado');
        } else {
          alert('Error de registro: ' + data['error']);
        }
      },
      error: function(error) {
        alert('Error, intenete de nuevo');
      }
    });
    return false;
  }); 



});

