/*
 *   Clock
 */

var extend = require('extend');
var inherit = require('util').inherits;

var Timer = require('../mod/timer');

function Clock() {
  Timer.call(this);

}
inherit(Clock, Timer);

Clock.START =  'onStart';
Clock.STOP =  'onStop';

extend(Clock.prototype, {
  start: function() {
    this.timer.init(60000, 6);
    this.timer.subscribe(Timer.TIMER_LAP, '_onTimer', this);
    this.timer.subscribe(Timer.TIMER_STOP, '_onTimerStop', this);
    this.timer.start();
    this.publish(Clock.START);
  },
  reset: function() {
    this.rewind = true;
    this.timer.init(250, 61);
    this.timer.subscribe(Timer.TIMER_LAP, '_onTimer', this);
    this.timer.subscribe(Timer.TIMER_STOP, '_onTimerStop', this);
    this.timer.start();
  }
});

module.exports = Clock;