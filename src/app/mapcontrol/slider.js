
/*
 * Slider
 */

var extend = require('extend');
var events = require('events');
var inherit = require('util').inherits;

//var Handle = require('./handle');
var HandleFactory = require('./handlefactory');

var HANDLE_INIT = 30;
var HANDLE_WIDTH = 24;
var SLIDER_WIDTH = 240;

function Slider() {
  if (!(this instanceof Slider)) {
    return new Slider();
  }
  this.direction = Slider.DIRECTION_VERTICAL;

  // Handle instance
  this.handle = new HandleFactory();
  this.handle.on('handleMove', this.onHandleMove.bind(this));

  _instance = this;
}
inherit(Slider, events.EventEmitter);
extend(Slider.prototype, {
  getHandlePos: function(scale) {
    var left = this.scaleToHandlePos(scale);
    var top = 0;

    if (this.isVertical()) {
      top = left;
      left = 0;
    }
    return { left: left + 'px', top: top + 'px' };
  },
  handlePosToScale: function(pos) {
    return (HANDLE_INIT + SLIDER_WIDTH - pos) / HANDLE_WIDTH;
  },
  scaleToHandlePos: function(scale) {
    return HANDLE_INIT + SLIDER_WIDTH - scale * HANDLE_WIDTH;
  },
  onHandleMove: function(data) {
    //console.log('Slider#onHandleMove');
    var axis = this.isVertical() ? 'y' : 'x';
    this.emit('change', { scale: this.handlePosToScale(data[axis]) });
  },
  isVertical: function() {
    return this.direction === Slider.DIRECTION_VERTICAL;
  },
  isHorizontal: function() {
    return this.direction === Slider.DIRECTION_HORIZONTAL;
  }
});
Slider.DIRECTION_VERTICAL = 'directionVertical';
Slider.DIRECTION_HORIZONTAL = 'directionHorizontal';

module.exports = Slider;

