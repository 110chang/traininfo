
/*
 *    Main
 */

// external libraries
var Q = require('q');

require('./mod/trunc');

var Lines = require('./app/lines');
var MapControlFactory = require('./app/mapcontrolfactory');
var GeoCoords = require('./app/geocoords');
var UpdatesVM = require('./app/updates');
var RouteMapVM = require('./app/routemap');

document.addEventListener('DOMContentLoaded', function(e) {
  console.log('dom ready.');

  var geoCoords = new GeoCoords(window.innerWidth, window.innerHeight);
  var mapControl = new MapControlFactory();
  var routeMap = new RouteMapVM();
  var lines = new Lines();
  var updates = new UpdatesVM();

  lines.on('changed', function(e) {
    //console.log('Main#changed');
    routeMap.updateLines(lines.get());
  });

  mapControl.on('boundsChanged', function(e) {
    //console.log('Main#changed');
    lines.update();
    routeMap.setSVGAttr.apply(routeMap, mapControl.getSVGAttr());
  });

  Q.all([lines, updates].map(function(vm) {
    var dfd = Q.defer();
    vm.on('loadComplete', function() {
      dfd.resolve();
    });
    return dfd.promise;
  })).then(function() {
    //console.log(lines.getStations());
    geoCoords.initialize(lines.getStations());
    //geoCoords.setOffset(10, 10);
    lines.setUp(geoCoords);
    lines.applyUpdates(updates.getUpdates());
    mapControl.initialize();

    routeMap.setSVGAttr.apply(routeMap, mapControl.getSVGAttr());

    //mapControl.expand(1);
  });
});

