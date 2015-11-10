
/*
 * MapControl/TouchHandle
 */

var extend = require('extend');
var inherit = require('util').inherits;
var $ = require('jQuery');

var Vector = require('../../../geom/vector');
var Handle = require('./handle');

var abs = Math.abs;
var floor = Math.floor;
var pow = Math.pow;

function TouchHandle() {
  if (!(this instanceof TouchHandle)) {
    return new TouchHandle();
  }
  Handle.call(this);

  this.$el.on('touchstart._MapControlHandle', this.onTouchStart.bind(this));
  this.$el.on('touchcancel._MapControlHandle', this.onTouchCancel.bind(this));
  //this.$el.off('touchcancel');
  $('*').on('touchmove', function(e) {
    e.preventDefault();
  });
}
inherit(TouchHandle, Handle);
extend(TouchHandle.prototype, {
  onTouchStart: function(e) {
    //console.log('TouchHandle#onTouchStart');
    e.preventDefault();

    var touch = e.originalEvent.touches[0];

    this.M = new Vector(touch.clientX, touch.clientY);
    this.N = new Vector(this.$handle.position().left, this.$handle.position().top);

    if (this.collisionHandle(touch.clientX, touch.clientY)) {
      this.$el.on('touchmove._MapControlHandle', this.onTouchMove.bind(this));
    }

    return false;
  },
  onTouchEnd: function(e) {
    //console.log('TouchHandle#onTouchEnd');
    this.$el.off('touchmove._MapControlHandle');
  },
  onTouchCancel: function(e) {
    //console.log('TouchHandle#onTouchCancel');
    //console.log(e.currentTarget.className);
  },
  onTouchMove: function(e) {
    //console.log('TouchHandle#onTouchMove');
    e.preventDefault();
    var touch = e.originalEvent.touches[0];
    var D = (new Vector(touch.clientX, touch.clientY)).sub(this.M).add(this.N);

    this.emit('handleMove', { x: D.x, y: D.y });

  },
  collisionHandle: function(x, y) {
    var left = this.$handle.offset().left;
    var top = this.$handle.offset().top;
    var right = left + this.$handle.width();
    var bottom = top + this.$handle.height();
    //console.log(left , right , top , bottom);
    return left < x && x < right && top < y && y < bottom;
  }
});
module.exports = TouchHandle;
