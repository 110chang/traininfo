
/*
 * stations
 */

var extend = require('extend');
var ko = require('knockout');

var StationVM = require('./station');

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
        return s.name === station.name && s.prefecture === station.prefecture;
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
        return orig.name === station.name && orig.prefecture === station.prefecture;
      });
      //console.log(duplicates.length);
      duplicates.forEach(function(dup) {
        target.averageLatLng(dup.lat * 1, dup.lng * 1);
        target.averagePos(dup.x, dup.y);
        target.addPoint(dup.x, dup.y);
        target.addLine(dup.line);
        target.addNext(dup.next);
        target.addPrev(dup.prev);
      });
      target.setPriority();
    }, this);
    this.data(stations);
    this.getStationPriorityRange();
    //console.log(stations);
  },
  getStationPriorityRange: function() {
    this.data().forEach(function(station) {
      if (station.priority() > this.priorityRange.max) {
        this.priorityRange.max = station.priority();
      }
      if (station.priority() < this.priorityRange.min) {
        this.priorityRange.min = station.priority();
      }
    }, this);
    this.data().forEach(function(station) {
      station.setThreshold(this.priorityRange.min, this.priorityRange.max);
      //console.log(station);
    }, this);
  }
});

module.exports = Stations;
