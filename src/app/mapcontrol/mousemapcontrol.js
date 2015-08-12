
/*
 * MouseMapControl
 */

var extend = require('extend');
var inherit = require('util').inherits;

var AbstructMapControl = require('./abstructmapcontrol');

var _instance = null;

var abs = Math.abs;
var trunc = Math.trunc;

function MouseMapControl() {
  if (_instance instanceof MouseMapControl) {
    return _instance;
  }
  if (!(this instanceof MouseMapControl)) {
    return new MouseMapControl();
  }
  AbstructMapControl.call(this);

  this.$el.on('mousedown._MouseMapControl', this.onMouseDown.bind(this));
  this.$el.on('mouseup._MouseMapControl', this.onMouseUp.bind(this));
  this.$el.on('wheel._MouseMapControl', this.onMouseWheel.bind(this));

  _instance = this;
}
inherit(MouseMapControl, AbstructMapControl);
extend(MouseMapControl.prototype, {
  onMouseDown: function(e) {
    //console.log('MouseMapControl#onMouseDown');
    e.preventDefault();

    this.beforeTranslate(e.clientX, e.clientY);
    this.$el.on('mousemove._MouseMapControl', this.onMouseMove.bind(this));

    return false;
  },
  onMouseUp: function(e) {
    //console.log('MouseMapControl#onMouseUp');
    this.$el.off('mousemove._MouseMapControl');
    // マウスダウン位置とマウスアップ位置が近い場合はクリック扱い
    var mag = this.translater.d().magnitude;
    if (this.isSVGElement(e.target) && mag < 2) {
    //if (true && true) {
      console.log('expand');
      this.expand(trunc(this.scale() + 1, 2));
    } else {
      console.log('translate');
      this.translate(e.clientX, e.clientY);
    }
  },
  onMouseMove: function(e) {
    //console.log('MouseMapControl#onMouseMove');
    this.translate(e.clientX, e.clientY);
  },
  onMouseWheel: function(e) {
    //console.log('MouseMapControl#onMouseWheel');
    e.preventDefault();

    var dy = e.originalEvent.deltaY;
    var iy = dy * dy > 0 ? dy / abs(dy) : 0;
    this.expand(trunc(this.scale() - iy * 0.2, 2));

    return false;
  }
});

module.exports = MouseMapControl;

