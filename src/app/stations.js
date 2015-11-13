
/*
 * stations
 */

var $ = window.jQuery || require('jquery');
require('jquery.easing');

var extend = require('extend');
var events = require('events');
var inherit = require('util').inherits;
var ko = require('knockout');

var GeoCoords = require('./geocoords');
var LineVM = require('./line');
var StationVM = require('./station');
var Status = require('./status');

var _instance = null;

function Stations() {
  if (_instance instanceof Stations) {
    return _instance;
  }
  if (!(this instanceof Stations)) {
    return new Stations();
  }

  this.data = ko.observableArray([]);
  this.priorityRange = {
    max: 0,
    min: 99999
  };

  _instance = this;
}
inherit(Stations, events.EventEmitter);
extend(Stations.prototype, {
  getData:function() {
    return this.originalData;
  },
  initialize: function(lines) {
    console.log('Stations#initialize');
    var stations = [];
    lines.forEach(function(line) {
      stations = stations.concat(line.stations);
    }, this);
    this.originalData = stations.slice();
  },
  setUp: function(geoCoords) {
    var stations = [];
    var duplicates = [];
    var point;
    this.originalData.forEach(function(station) {
      //console.log(station);
      //console.log(station.name);
      var target;
      registered = stations.filter(function(s) {
        return s.name === station.name;
      });
      //console.log(registered);
      if (registered.length === 0) {
        target = new StationVM(station);
        stations.push(target);
      } else {
        target = registered[0];
      }
      //console.log(target);
      duplicates = this.originalData.filter(function(orig) {
        return orig.name === station.name;
      });
      //console.log(duplicates.length);
      duplicates.forEach(function(dup) {
        target.averageLatLng(dup.lat * 1, dup.lng * 1);
        target.averagePos(dup.x, dup.y);
        target.addLine(dup.line);
        target.addNext(dup.next);
        target.addPrev(dup.prev);
      });
    }, this);
    console.log(stations.length, this.originalData.length);
    this.data(stations);
    this.getStationPriorityRange();
  },
  getStationPriorityRange: function() {
    this.data().forEach(function(station) {
      if (station.priority > this.priorityRange.max) {
        this.priorityRange.max = station.priority;
      }
      if (station.priority < this.priorityRange.min) {
        this.priorityRange.min = station.priority;
      }
    }, this);
    this.data().forEach(function(station) {
      station.setThreshold(this.priorityRange.min, this.priorityRange.max);
      console.log(station);
    }, this);
  }
});

module.exports = Stations;
