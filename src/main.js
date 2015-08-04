
/*
 *    Main
 */

// external libraries
var Q = require('q');
var ajax = require('superagent');

var LinesVM = require('./app/lines');
var GeoCoords = require('./app/geocoords');
var UpdatesVM = require('./app/updates');

var linesVM = new LinesVM();
var updatesVM = new UpdatesVM();
var geoCoords;

Q.all([linesVM, updatesVM].map(function(vm) {
  var dfd = Q.defer();
  vm.on('loadComplete', function() {
    dfd.resolve();
  });
  return dfd.promise;
})).then(function() {
  //console.log(linesVM.getStations());
  geoCoords = new GeoCoords(600, 400, linesVM.getStations());
  geoCoords.setOffset(10, 10);
  linesVM.setUp(geoCoords);
  linesVM.applyUpdates(updatesVM.getUpdates());
});

