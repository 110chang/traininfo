/*
 *   Timer
 */

var extend = require('extend');
var events = require('events');
var inherit = require('util').inherits;

function Timer(duration, fps, repeat) {
  if (!(this instanceof Timer)) {
    return new Timer(duration, repeat);
  }
  duration = typeof duration === 'undefined' ? 10000 : duration;
  fps = typeof fps === 'undefined' ? 61 : fps;
  repeat = typeof repeat === 'undefined' ? 0 : repeat;

  if (typeof duration !== 'number') {
    throw new Error('Arguments must be Number.');
  }
  if (typeof fps !== 'number') {
    throw new Error('Arguments must be Number.');
  }
  if (typeof repeat !== 'number') {
    throw new Error('Arguments must be Number.');
  }
  this.duration = duration;//ms
  this.fps = fps;
  this.repeat = repeat;
  this.count = -1;
  this.tick = 1000 / this.fps;
  this.frame = 0;

  this.timer = null;
  this.startTime = 0;
  this.currentTime = 0;
  this.stopTime = 0;
}
inherit(Timer, events.EventEmitter);
  
Timer.TIMER       = 'onTimer';
Timer.TIMER_START = 'onTimerStart';
Timer.TIMER_STOP  = 'onTimerStop';
Timer.TIMER_TICK  = 'onTimerTick';

extend(Timer.prototype, {
  start: function() {
    clearInterval(this.timer);

    this.count = this.repeat;
    this.stopTime = null;
    this.timer = setInterval(this._onTimerHandler.bind(this), this.tick);
    
    this.startTime = (new Date()).getTime();
    this.emit(Timer.TIMER_START, { time: this.startTime });
    
    return this;
  },
  stop: function() {
    clearInterval(this.timer);
    
    this.timer = null;
    //this.currentTime = (new Date()).getTime();
    this.stopTime = this.currentTime;
    
    this.emit(Timer.TIMER_STOP, { time: this.currentTime });
    
    return this;
  },
  _onTimerHandler: function() {
    this.frame++;
    this.currentTime = (new Date()).getTime();
    this.emit(Timer.TIMER_TICK, { time: this.currentTime });

    if (this.tick * this.frame >= this.duration - this.fps) {
      this.count--;
      this.frame = 0;
      this.emit(Timer.TIMER, { count: this.count, time: this.currentTime });
    }
    if (this.repeat > -1 && this.count < 1) {
      this.stop();
    }
  },
  _getLapTime: function() {
    return this.currentTime - this.startTime;
  }
});

module.exports = Timer;
