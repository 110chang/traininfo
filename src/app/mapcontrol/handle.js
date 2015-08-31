
/*
 * MapControl/Handle
 */

var extend = require('extend');
var events = require('events');
var inherit = require('util').inherits;
var ko = require('knockout');
var $ = require('jQuery');

var Vector = require('../../geom/vector');

var abs = Math.abs;
var floor = Math.floor;
var pow = Math.pow;
var isToushDevice = 'ontouchstart' in document.documentElement;

var $doc = $(document);

function Handle() {
  if (!(this instanceof Handle)) {
    return new Handle();
  }
  this.$el = $('.scale-slider-handle');
  this.$parent = this.$el.parent();
  this.M = null;
  this.N = null;

  if (isToushDevice) {
    this.$el.on('touchstart._MapControlHandle', this.onTouchStart.bind(this));
    $doc.on('touchend._MapControlHandle', this.onTouchEnd.bind(this));
  } else {
    this.$el.on('mousedown._MapControlHandle', this.onMouseDown.bind(this));
    $doc.on('mouseup._MapControlHandle', this.onMouseUp.bind(this));
  }
}
inherit(Handle, events.EventEmitter);
extend(Handle.prototype, {
  onMouseDown: function(e) {
    //console.log('Handle#onMouseDown');
    e.preventDefault();

    $doc.on('mousemove._MapControlHandle', this.onMouseMove.bind(this));
    this.M = new Vector(e.clientX, e.clientY);
    this.N = new Vector(this.$el.position().left, this.$el.position().top);

    return false;
  },
  onMouseUp: function(e) {
    //console.log('Handle#onMouseUp');
    $doc.off('mousemove._MapControlHandle');

    if (document.selection) {
      document.selection.empty();
    } else if (window.getSelection) {
      window.getSelection().removeAllRanges();
    }
  },
  onMouseMove: function(e) {
    //console.log('Handle#onMouseMove');
    var D = (new Vector(e.clientX, e.clientY)).sub(this.M).add(this.N);
    this.emit('handleMove', { x: D.x, y: D.y });
  },
  onTouchStart: function(e) {
    //console.log('Handle#onTouchStart');
    e.preventDefault();

    var touch = e.originalEvent.touches[0];
    $doc.on('touchmove._MapControlHandle', this.onTouchMove.bind(this));
    this.M = new Vector(touch.clientX, touch.clientY);
    this.N = new Vector(this.$el.position().left, this.$el.position().top);

    return false;
  },
  onTouchEnd: function(e) {
    //console.log('Handle#onMouseUp');
    $doc.off('touchmove._MapControlHandle');
  },
  onTouchMove: function(e) {
    var touch = e.originalEvent.touches[0];
    //console.log(touch);
    var D = (new Vector(touch.clientX, touch.clientY)).sub(this.M).add(this.N);
    this.emit('handleMove', { x: D.x, y: D.y });
  }
});
module.exports = Handle;
