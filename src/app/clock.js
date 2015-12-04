
/*
 *   App/Clock
 */

(function(global) {

  var ko = require('knockout');
  var extend = require('extend');
  var events = require('events');
  var inherit = require('util').inherits;

  var numberf = require('../mod/numberf');
  var Timer = require('../mod/timer');
  var Point = require('../geom/point');

  var trunc = Math.trunc;
  var floor = Math.floor;
  var ceil = Math.ceil;
  var sin = Math.sin;
  var cos = Math.cos;
  var PI = Math.PI;

  function Clock() {
    this.measureTime = 60000;
    this.measureFps = 12;
    this.recoveryTime = 250;
    this.recoveryFps = 61;
    this.size = 40;
    this.thickness = 4;

    this.timer = new Timer(this.measureTime, 6, 1);
    this.timer.on(Timer.TIMER_START, this._onTimerStart.bind(this));
    this.timer.on(Timer.TIMER_TICK, this._onTimer.bind(this));
    this.timer.on(Timer.TIMER_STOP, this._onTimerStop.bind(this));

    this.isRewind = false;

    this.ratio = ko.observable('0');

    ko.applyBindings(this, document.getElementById('clock'));
  }
  inherit(Clock, events.EventEmitter);

  Clock.START = 'onClockStart';
  Clock.CLOCK = 'onClock'     ;
  Clock.STOP  = 'onClockStop' ;

  extend(Clock.prototype, {
    start: function() {
      this.isRewind = false;
      this.timer.initialize(this.measureTime, 12, 1);
      this.timer.start();
    },
    rewind: function() {
      this.isRewind = true;
      this.timer.initialize(this.recoveryTime, 61, 1);
      this.timer.start();
    },
    getDisplayTime: function() {
      var m = this.measureTime / 1000;
      return ceil(m - m * this.ratio());
    },
    getDisplayRatio: function(frame) {
      var ratio = 0;

      if (this.isRewind) {
        ratio = 1 - frame / (this.recoveryTime / 1000 * 61);
      } else {
        ratio = frame / (this.measureTime / 1000 * 12);
      }
      return trunc(ratio, 4);
    },
    getPath: function() {
      var path = '';
      var r = (this.size - this.thickness) / 2;
      var pad = this.thickness / 2;
      var P = new Point(r + pad, 0 + pad);
      var C = new Point(r + pad, r + pad);
      var dx = sin(2 * PI * this.ratio());
      var dy = 1 - cos(2 * PI * this.ratio());
      var larc = dx > 0 ? 0 : 1;
      var sweep = 1;
      //console.log(dx, dy);
      path += 'M ';
      path += P.x + ',' + P.y + ' ';
      //path += 'L ';
      //path += (P.x + dx * r) + ',' + (P.y + dy * r) + '';
      path += 'A ';
      path += r + ',' + r + ' ';
      path += '0 ' + larc + ',' + sweep + ' ';
      path += (P.x + dx * r) + ',' + (P.y + dy * r) + '';
      //console.log(path);
      return path;
    },
    _onTimerStart: function(e) {
      this.emit(Clock.START, e);
    },
    _onTimer: function(e) {
      this.ratio(this.getDisplayRatio(e.frame));
      this.emit(Clock.CLOCK, e);
    },
    _onTimerStop: function(e) {
      if (this.isRewind) {
        this.start();
      } else {
        this.rewind();
        this.emit(Clock.STOP, e);
      }
    }
  });

  module.exports = Clock;

})((this || 0).self || global);