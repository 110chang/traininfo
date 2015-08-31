
/*
 * MouseMapControl
 */

var extend = require('extend');
var inherit = require('util').inherits;

var MapControl = require('./mapcontrol');

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
  MapControl.call(this);

  this.dblClicked = false;
  this.timer = null;

  this.$el.on('mousedown._MouseMapControl', this.onMouseDown.bind(this));
  this.$el.on('mouseup._MouseMapControl', this.onMouseUp.bind(this));
  this.$el.on('dblclick._MouseMapControl', this.onMouseDblClick.bind(this));
  this.$el.on('wheel._MouseMapControl', this.onMouseWheel.bind(this));

  _instance = this;
}
inherit(MouseMapControl, MapControl);
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
    this.dblClicked = false;
    // マウスダウン位置とマウスアップ位置が近い場合はクリック扱い
    var mag = this.translater.d().magnitude;
    if (this.isSVGElement(e.target) && mag < 2) {
    //if (true && true) {
      this.waitDblClick(e);
    } else {
      console.log('translate');
      this.translate(e.clientX, e.clientY);
    }
  },
  onMouseDblClick: function() {
    //console.log('MouseMapControl#onMouseDblClick');
    this.dblClicked = true;
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
  },
  waitDblClick: function(e) {
    var self = this;
    if (self.timer) {
      return;
    }
    self.timer = setTimeout(function() {
      if (self.dblClicked) {
        self.dblClickCallback.call(self, e);
      } else {
        self.singleClickCallback.call(self, e);
      }
      self.dblClicked = false;
      clearTimeout(self.timer);
      self.timer = null;
    }, 333);
  },
  singleClickCallback: function(e) {
    //console.log('MouseMapControl#singleClickCallback');
    this.center(e.clientX, e.clientY);
  },
  dblClickCallback: function(e) {
    //console.log('MouseMapControl#dblClickCallback');
    this.expand(trunc(this.scale() + 1, 2), e.clientX, e.clientY);
  }
});

module.exports = MouseMapControl;

