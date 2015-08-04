
/*
 *  geom.Line
 */

// external libraries
var extend = require('extend');
var inherit = require('util').inherits;

// modules
var Point = require('./point');
var Segment = require('./segment');
var Triangle = require('./triangle');

function Line() {
  Segment.apply(this, arguments);
}
inherit(Line, Segment);
extend(Line.prototype, {
  contain: function (point) {
    if (!(point instanceof Point)) {
      throw new Error('Arguments must be Point.');
    }
    var x0 = this.start.x;
    var y0 = this.start.y;
    var x1 = this.end.x;
    var y1 = this.end.y;
    
    return (y1 - y0) * point.x - (x1 - x0) * point.y - x0 * y1 + x1 * y0 === 0;
  },
  intersection: function (segment) {
    if (!(segment instanceof Segment)) {
      throw new Error('Arguments must be Segment.');
    }
    var t1 = new Triangle(this.start, this.end, segment.start);
    var t2 = new Triangle(this.start, this.end, segment.end);
    var I = false;
    
    if (t1.getArea() * t2.getArea() < 0) {
      I = this._getIntersection(segment);
    }
    return I;
  },
  distance: function () {
    return Infinity;
  },
  middlePoint: function () {
    return false;
  },
  toString: function () {
    return '-> ( ' + this.start.x + ', ' + this.start.y + ' ) -> ( ' + this.end.x + ', ' + this.end.y + ' ) ->';
  }
});

module.exports = Line;
