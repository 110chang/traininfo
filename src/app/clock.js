
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

  function Clock(duration, rwDuration, repeat) {

    this.timer = new Timer(60000, 6, 1);
    this.timer.on(Timer.TIMER_START, this._onTimerStart.bind(this));
    this.timer.on(Timer.TIMER_TICK, this._onTimer.bind(this));
    this.timer.on(Timer.TIMER_STOP, this._onTimerStop.bind(this));

    this.isRewind = false;

    this.disp = ko.observable('0');

    ko.applyBindings(this, document.getElementById('clock'));
  }
  inherit(Clock, events.EventEmitter);

  Clock.START = 'onClockStart';
  Clock.CLOCK = 'onClock'     ;
  Clock.STOP  = 'onClockStop' ;

  extend(Clock.prototype, {
    start: function() {
      this.timer.initialize(60000, 12, 1);
      this.timer.start();
    },
    rewind: function() {
      this.isRewind = true;
      this.timer.initialize(250, 61, 1);
      this.timer.start();
    },
    _onTimerStart: function(e) {
      this.emit(Clock.START, e);
    },
    _onTimer: function(e) {
      this.disp(e.frame);
      this.emit(Clock.CLOCK, e);
    },
    _onTimerStop: function(e) {
      this.emit(Clock.STOP, e);
    }
  });

  module.exports = Clock;

})((this || 0).self || global);