
/*
 *    Main
 */

// external libraries
var Q = require('q');

var Lines = require('./app/lines');
var MapControl = require('./app/mapcontrol');
var GeoCoords = require('./app/geocoords');
var UpdatesVM = require('./app/updates');
var RouteMapVM = require('./app/routemap');

document.addEventListener('DOMContentLoaded', function(e) {
  console.log('dom ready.');

  var mapControl = new MapControl();
  var routeMap = new RouteMapVM();
  var lines = new Lines();
  var updates = new UpdatesVM();
  var geoCoords;

  lines.on('changed', function(e) {
    //console.log('Main#changed');
    routeMap.updateLines(lines.get());
  });

  mapControl.on('boundsChanged', function(e) {
    //console.log('Main#changed');
    lines.update();
    routeMap.updateBounds.apply(routeMap, mapControl.getBounds());
  });

  Q.all([lines, updates].map(function(vm) {
    var dfd = Q.defer();
    vm.on('loadComplete', function() {
      dfd.resolve();
    });
    return dfd.promise;
  })).then(function() {
    //console.log(lines.getStations());
    geoCoords = new GeoCoords(600, 400, lines.getStations());
    geoCoords.setOffset(10, 10);
    lines.setUp(geoCoords);
    lines.applyUpdates(updates.getUpdates());

    routeMap.updateBounds.apply(routeMap, mapControl.getBounds());
  });

});

