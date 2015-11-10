
/*
 * MapControl/Handle
 */

var extend = require('extend');
var events = require('events');
var inherit = require('util').inherits;
var $ = require('jQuery');

function Handle() {
  if (!(this instanceof Handle)) {
    return new Handle();
  }
  this.$el = $('.scale-slider');
  this.$handle = $('.scale-slider-handle');
  this.M = null;
  this.N = null;
}
inherit(Handle, events.EventEmitter);
module.exports = Handle;
