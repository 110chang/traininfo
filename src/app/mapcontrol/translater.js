
/*
 * Translater
 */

// external libraries
var extend = require('extend');

var Vector = require('../../geom/vector');

function Translater() {
  this.startVector = new Vector(0, 0);
  this.endVector = new Vector(0, 0);
}
extend(Translater.prototype, {
  start: function(x, y) {
    //console.log('Translater#start');
    //console.log(x, y);
    this.startVector = new Vector(x, y);
    this.endVector = new Vector(x, y);
  },
  update: function(x, y) {
    //console.log('Translater#update');
    //console.log(x, y);
    this.endVector = new Vector(x, y);
  },
  d: function() {
    return this.endVector.sub(this.startVector);
  }
});

module.exports = Translater;

