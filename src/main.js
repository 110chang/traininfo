
/*
 *    Main
 */

(function(global) {

  // external libraries
  var $ = global.jQuery || require('jquery');
  var Q = require('q');

  require('./mod/trunc');
  require('./mod/reducedresize');

  var Lines             = require('./app/lines');
  var Stations          = require('./app/stations');
  var MapControlFactory = require('./app/mapcontrolfactory');
  var GeoCoords         = require('./app/geocoords');
  var UpdatesVM         = require('./app/updates');
  var RouteMapVM        = require('./app/routemap');
  var Clock             = require('./app/clock');
  var Popup             = require('./app/popup');

  document.addEventListener('DOMContentLoaded', function(e) {
    console.log('dom ready.');

    var geoCoords  = new GeoCoords({
      meet: true
    });
    var mapControl = new MapControlFactory();
    var routeMap   = new RouteMapVM();
    var lines      = new Lines();
    var stations   = new Stations();
    var updates    = new UpdatesVM();
    var clock      = new Clock();
    var popup      = new Popup();

    updates.on('loadFailure', function() {
      console.log('%c%s', 'background:#FF0', 'Main#loadFailure');
    });

    mapControl.on('boundsChanged', function(e) {
      //console.log('Main#changed');
      lines.update();
      routeMap.setSVGAttr.apply(routeMap, mapControl.getSVGAttr());
    });

    lines.on('lineMouseOver', function(data, e) {
      popup.show(data, e);
    });

    lines.on('lineMouseOut', function(data, e) {
      popup.hide();
    });

    clock.on(Clock.STOP, function(e) {
      console.log('Main#clock');
      console.log(e);
      //updates.load();
    });

    Q.all([lines, updates].map(function(vm) {
      var dfd = Q.defer();
      vm.on('loadComplete', function() {
        console.log('Main#loadComplete');
        dfd.resolve();
      });
      return dfd.promise;
    })).then(function() {
      //console.log(lines.getStations());
      stations.initialize(lines.getData());
      geoCoords.initialize(stations.getData());
      //geoCoords.setOffset(10, 10);
      lines.setUp(geoCoords);
      stations.setUp(geoCoords);
      lines.applyUpdates(updates.getUpdates());
      updates.applyLines(lines.getData());
      routeMap.initialize();
      mapControl.initialize();
      clock.start();

      routeMap.setSVGAttr.apply(routeMap, mapControl.getSVGAttr());
      //mapControl.expand(1);
    });

    function resize() {
      console.log('Main#resize');
      geoCoords.resize(window.innerWidth, window.innerHeight);
      mapControl.resize(window.innerWidth, window.innerHeight);
      updates.resize(lines.getData());
      routeMap.setSVGAttr.apply(routeMap, mapControl.getSVGAttr());
    }

    $(window).on('reducedResize', resize);
    $(window).on('orientationchange', resize);
  });

})((this || 0).self || global);
