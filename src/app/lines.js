
/*
 * lines
 */

var extend = require('extend');
var events = require('events');
var inherit = require('util').inherits;
var ko = require('knockout');
var ajax = require('superagent');
var Q = require('q');
var ko = require('knockout');

var LineVM = require('./line');
var _instance = null;

function LinesVM() {
  if (_instance instanceof LinesVM) {
    return _instance;
  }
  if (!(this instanceof LinesVM)) {
    return new LinesVM();
  }
  ajax.get('/lines.json').end(this.loadComplete.bind(this));

  _instance = this;
}
inherit(LinesVM, events.EventEmitter);
extend(LinesVM.prototype, {
  loadComplete: function(error, response) {
    //console.log('LinesVM#loadComplete');
    console.log(response.body);
    var stations = [];
    response.body.forEach(function(line) {
      stations = stations.concat(line.stations);
    }, this);
    this.originalData = response.body;
    this.stations = stations;
    this.emit('loadComplete');
  },
  getStations: function() {
    return this.stations;
  },
  getData: function() {
    return this.originalData.slice();
  },
  setUp: function(geoCoords) {
    var point;
    var lineVM;
    var lines = [];

    this.originalData.forEach(function(line) {
      line.stations.forEach(function(station) {
        point = geoCoords.latLngToScreen(station.y, station.x);
        station.lat = station.y;
        station.lng = station.x;
        station.x = point.x;
        station.y = point.y;
      });
      lineVM = new LineVM(line);
      lineVM.on('mouseOver', this.bringToTop.bind(this));
      lines.push(lineVM);
    }, this);

    this.lines = ko.observableArray(lines);
    ko.applyBindings(this, document.getElementById('lines'));
  },
  bringToTop: function(e) {
    this.lines.splice(this.lines.indexOf(e), 1);
    this.lines.push(e);
  },
  applyUpdates: function(updates) {
    console.log(updates);
    var _self = this;
    ko.utils.arrayForEach(this.lines(), function(line) {
      updates.forEach(function(update) {
        console.log(update.title + '===' + line.goo_key);
        if (update.title === line.goo_key) {
          console.log(update);
          line.update(update.status.key);
          _self.bringToTop(line);
        }
      });
    });
  }
});

module.exports = LinesVM;
