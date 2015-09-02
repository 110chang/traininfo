
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
  this.hovered = null;

  ajax.get('/lines.json').end(this.loadComplete.bind(this));

  _instance = this;
}
inherit(Lines, events.EventEmitter);
extend(Lines.prototype, {
  loadComplete: function(error, response) {
    //console.log('Lines#loadComplete');
    if (error) {
      console.log(error);
    }
    //console.log(response.body);
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
    //console.log('Lines#setUp');
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
      lineVM.on('mouseOver', this.onLineMouseOver.bind(this));
      lineVM.on('mouseOut', this.onLineMouseOut.bind(this));
      this.data.push(lineVM);
    }, this);
  },
  bringToTop: function(e) {
    this.data.splice(this.data.indexOf(e), 1);
    this.data.push(e);
  },
  takeDownBottom: function(e) {
    if (e.status().id === 0) {
      this.data.splice(this.data.indexOf(e), 1);
      this.data.unshift(e);
    }
  },
  update: function() {
    this.data.forEach(function(line) {
      line.update();
    }, this);
  },
  onLineMouseOver: function(data, e) {
    console.log('Lines#onLineMouseOver');
    console.log(this.hovered === e);
    //if (this.hovered === e) {
    //  return;
    //}
    this.bringToTop(data);
    this.emit('lineMouseOver', data);
    this.hovered = data;
  },
  onLineMouseOut: function(data, e) {
    console.log('Lines#onLineMouseOut');
    //if (this.hovered === null) {
    //  return;
    //}
    this.takeDownBottom(data);
    this.emit('lineMouseOut', data);
    this.hovered = null;
  },
  applyUpdates: function(updates) {
    //console.log(updates);
    this.data.forEach(function(line) {
      updates.forEach(function(update) {
        //console.log(update.title + '===' + line.goo_key);
        if (update.title.match(line.goo_key)) {
          //console.log(update);
          line.update(update.status);
          this.bringToTop(line);
        }
      }, this);
    }, this);
  },
  onAfterRender: function(e) {
    console.log(e);
  }
});

module.exports = Lines;
