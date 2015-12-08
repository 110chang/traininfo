
/*
 * lines
 */

(function(global) {

  var extend = require('extend');
  var events = require('events');
  var inherit = require('util').inherits;
  var ajax = require('superagent');
  var ko = require('knockout');
  var Q = require('q');

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
    this.updates = ko.observableArray([]);
    this.focused = ko.observableArray([]);

    Q.all([this.loadLineData(), this.loadUpdateData()])
      .then(this.loadComplete.bind(this));

    _instance = this;
  }
  inherit(Lines, events.EventEmitter);
  extend(Lines.prototype, {
    loadLineData: function() {
      var dfd = Q.defer();
      ajax.get('./lines.json').end(function(error, response) {
        if (error) {
          dfd.reject();
        }
        dfd.resolve(response.body || JSON.parse(response.text));
      });
      return dfd.promise;
    },
    loadUpdateData: function() {
      var dfd = Q.defer();
      ajax.get(global.UPDATE_SRC).end(function(error, response) {
        if (error) {
          dfd.reject();
        }
        dfd.resolve(response && response.body[0].value.items.map(function(update) {
          return extend(update, {
            status: Status().convert(update.content)
          });
        }, this));
      });
      return dfd.promise;
    },
    loadComplete: function(responces) {
      console.log('Lines#loadComplete');
      var data = responces[0];
      var updates = responces[1];
      //console.log(data);
      //console.log(updates);
      this.originalData = data.slice();
      //this.data(data);
      this.updates(updates);
      this.emit('loadComplete');
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
      //console.log(this.data());
    },
    applyUpdates: function() {
      console.log('Lines#applyUpdates');
      var targets = [];
      this.data().forEach(function(line) {
        this.updates().forEach(function(update) {
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
    },
    getOriginalData: function() {
      return this.originalData.slice();
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
      Q.when(this.loadUpdateData()).then(this.updateComplete.bind(this));
    },
    updateComplete: function(responce) {
      console.log('Lines#updateComplete');
      console.log(responce);
      this.updates(responce);
    },
    draw: function() {
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
    }
  });

  module.exports = Lines;

})((this || 0).self || global);