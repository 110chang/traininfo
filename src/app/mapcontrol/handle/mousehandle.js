
/*
 * MapControl/MouseHandle
 */

var extend = require('extend');
var inherit = require('util').inherits;

var Vector = require('../../../geom/vector');
var Handle = require('./handle');

var abs = Math.abs;
var floor = Math.floor;
var pow = Math.pow;

function MouseHandle() {
  if (!(this instanceof MouseHandle)) {
    return new MouseHandle();
  }
  Handle.call(this);

  this.$el.on('mousedown._MapControlHandle', this.onMouseDown.bind(this));
  this.$el.on('mouseup._MapControlHandle', this.onMouseUp.bind(this));
}
inherit(MouseHandle, Handle);
extend(MouseHandle.prototype, {
  onMouseDown: function(e) {
    //console.log('MouseHandle#onMouseDown');
    e.preventDefault();

    this.$el.on('mousemove._MapControlHandle', this.onMouseMove.bind(this));
    this.M = new Vector(e.clientX, e.clientY);
    this.N = new Vector(this.$handle.position().left, this.$handle.position().top);

    return false;
  },
  onMouseUp: function(e) {
    //console.log('MouseHandle#onMouseUp');
    this.$el.off('mousemove._MapControlHandle');

    if (document.selection) {
      document.selection.empty();
    } else if (window.getSelection) {
      window.getSelection().removeAllRanges();
    }
  },
  onMouseMove: function(e) {
    //console.log('MouseHandle#onMouseMove');
    var D = (new Vector(e.clientX, e.clientY)).sub(this.M).add(this.N);
    this.emit('handleMove', { x: D.x, y: D.y });
  }
});
module.exports = MouseHandle;
