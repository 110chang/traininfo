
/*
 * TouchMapControl
 */

var extend = require('extend');
var inherit = require('util').inherits;

var AbstructMapControl = require('./abstructmapcontrol');

var _instance = null;

var sqrt = Math.sqrt;
var trunc = Math.trunc;

function TouchMapControl() {
  if (_instance instanceof TouchMapControl) {
    return _instance;
  }
  if (!(this instanceof TouchMapControl)) {
    return new TouchMapControl();
  }
  AbstructMapControl.call(this);

  this.memDest = null;
  this.memScale = null;

  this.$el.on('touchstart._MapControl', this.onTouchStart.bind(this));
  this.$el.on('touchend._MapControl', this.onTouchEnd.bind(this));

  _instance = this;
}
inherit(TouchMapControl, AbstructMapControl);
extend(TouchMapControl.prototype, {
  onTouchStart: function(e) {
    //console.log('TouchMapControl#onTouchStart');
    var touches = e.originalEvent.touches;
    if (touches.length === 1) {
      this.beforeTranslate(touches[0].clientX, touches[0].clientY);
      this.$el.on('touchmove._MapControl', this.onTouchMove.bind(this));
    } else if (touches.length === 2) {
      this.memDest = this.getPinchDestination(touches);
      this.memScale = this.scale();
      this.$el.on('touchmove._MapControl', this.onPinchMove.bind(this));
    }
  },
  onTouchEnd: function(e) {
    //console.log('TouchMapControl#onTouchEnd');
    var touches = e.originalEvent.changedTouches;
    if (touches.length === 1) {
      var mag = this.translater.d().magnitude;
      if (this.isSVGElement(e.target) && mag < 2) {
        this.expand(trunc(this.scale() + 1, 2));
      } else {
        this.translate(touches[0].clientX, touches[0].clientY);
      }
      this.$el.off('touchmove._MapControl');
    } else if (touches.length === 2) {
      var d = this.getPinchDestination(touches) - this.memDest;
      this.expand(trunc(this.memScale + d * 0.01, 2));
      this.$el.off('touchmove._MapControl');
    }
  },
  onTouchMove: function(e) {
    //console.log('MapControl#onTouchMove');
    var touches = e.originalEvent.touches;
    this.translate(touches[0].clientX, touches[0].clientY);
  },
  onPinchMove: function(e) {
    //console.log('MapControl#onPinchMove');
    var touches = e.originalEvent.touches;
    var d = this.getPinchDestination(touches) - this.memDest;
    this.expand(trunc(this.memScale + d * 0.01, 2));
  },
  getPinchDestination: function(touches) {
    var x = touches[1].clientX - touches[0].clientX;
    var y = touches[1].clientY - touches[0].clientY;
    return sqrt(x * x + y * y);
  }
});

module.exports = TouchMapControl;
