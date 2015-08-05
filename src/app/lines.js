
/*
 * lines
 */

var extend = require('extend');
var events = require('events');
var inherit = require('util').inherits;
var ajax = require('superagent');

var LineVM = require('./line');

var _instance = null;

function Lines() {
  if (_instance instanceof Lines) {
    return _instance;
  }
  if (!(this instanceof Lines)) {
    return new Lines();
  }

  this.data = [];

  ajax.get('/lines.json').end(this.loadComplete.bind(this));

  _instance = this;
}
inherit(Lines, events.EventEmitter);
extend(Lines.prototype, {
  loadComplete: function(error, response) {
    //console.log('Lines#loadComplete');
    console.log(response.body);
    var stations = [];
    response.body.forEach(function(line) {
      stations = stations.concat(line.stations);
    }, this);
    this.originalData = response.body;
    this.stations = stations;
    this.emit('loadComplete');
  },
  get:function() {
    return this.data;
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
      this.data.push(lineVM);
    }, this);
  },
  bringToTop: function(e) {
    this.data.splice(this.data.indexOf(e), 1);
    this.data.push(e);
    this.emit('changed');
  },
  update: function() {
    this.data.forEach(function(line) {
      line.update();
    }, this);
  },
  applyUpdates: function(updates) {
    //console.log(updates);
    this.data.forEach(function(line) {
      updates.forEach(function(update) {
        //console.log(update.title + '===' + line.goo_key);
        if (update.title === line.goo_key) {
          //console.log(update);
          line.update(update.status.key);
          this.bringToTop(line);
        }
      }, this);
    }, this);

    this.emit('changed');
  }
});

module.exports = Lines;
