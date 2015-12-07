
/*
 * lines
 */

(function(global) {

  var extend = require('extend');
  var events = require('events');
  var inherit = require('util').inherits;
  var ajax = require('superagent');
  var ko = require('knockout');

  var LineVM = require('./line');
  var Status = require('./status');

  var _instance = null;

  function Lines() {
    if (_instance instanceof Lines) {
      return _instance;
    }
    if (!(this instanceof Lines)) {
      return new Lines();
    }

    this.data = ko.observableArray([]);
    this.focused = ko.observableArray([]);

    ajax.get('./lines.json').end(this.loadComplete.bind(this));

    _instance = this;
  }
  inherit(Lines, events.EventEmitter);
  extend(Lines.prototype, {
    loadComplete: function(error, response) {
      console.log('Lines#loadComplete');
      if (error) {
        console.log(error);
      }
      var res = response.body || JSON.parse(response.text);
      this.originalData = res.slice();
      this.emit('loadComplete');
    },
    get: function() {
      return this.data();
    },
    getData: function() {
      return this.originalData.slice();
    },
    setUp: function(geoCoords) {
      console.log('Lines#setUp');
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
        this.data().push(lineVM);
      }, this);
    },
    bringToTop: function(e) {
      this.data().splice(this.data.indexOf(e), 1);
      this.data.push(e);
    },
    takeDownBottom: function(e) {
      if (e.status().id === 0) {
        var _self = this;
        setTimeout(function() {
          _self.data().splice(_self.data.indexOf(e), 1);
          _self.data.unshift(e);
        }, 250);
      }
    },
    update: function() {
      this.data().forEach(function(line) {
        line.update();
      }, this);
    },
    onLineMouseOver: function(data, e) {
      //console.log('Lines#onLineMouseOver');
      this.bringToTop(data);
      this.emit('lineMouseOver', data, e);
      this.focused(data);
    },
    onLineMouseOut: function(data, e) {
      //console.log('Lines#onLineMouseOut');
      this.takeDownBottom(data);
      this.emit('lineMouseOut', data, e);
      this.focused([]);
    },
    applyUpdates: function(updates) {
      //console.log(updates);
      var targets = [];
      this.data().forEach(function(line) {
        updates.forEach(function(update) {
          //console.log(update.title + '===' + line.goo_key);
          if (update.title.match(line.goo_key)) {
            //console.log(update);
            line.update(update.status, update.content);
            //this.bringToTop(line);
          } else {
            //line.update(Status().decode(0));
          }
        }, this);
      }, this);

      this.data().forEach(function(line) {
        if (line.status().id > 0) {
          this.bringToTop(line);
        }
      }, this);
    }
  });

  module.exports = Lines;

})((this || 0).self || global);