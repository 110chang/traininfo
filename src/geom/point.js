
/*
 *   geom.Point
 */

// external libraries
var extend = require('extend');
var isArray = require('util').isArray;

var sqrt  = Math.sqrt;
var pow   = Math.pow;
var atan2 = Math.atan2;
var PI    = Math.PI;

function Point(x, y) {
  if (!(this instanceof Point)) {
    return new Point(x, y);
  }
  if (isArray(x)) {
    y = x[1];
    x = x[0];
  }
  x = typeof x === 'undefined' ? 0 : x;
  y = typeof y === 'undefined' ? 0 : y;

  if (typeof x !== 'number' || typeof y !== 'number') {
    throw new Error('Invalid arguments.');
  }
  this.x = x;
  this.y = y;
}
extend(Point.prototype, {
  translate: function(x, y) {
    if (typeof x !== 'number' || typeof y !== 'number') {
      throw new Error('Arguments must be Number.');
    }
    this.x += x;
    this.y += y;
    
    return this;
  },
  slopeBetween: function(point) {
    if (!(point instanceof Point)) {
      throw new Error('Arguments must be Point.');
    }
    return (point.y - this.y) / (point.x - this.x);
  },
  angleBetween: function(point, asRadian) {
    asRadian = asRadian == null ? true : asRadian;
    if (!(point instanceof Point)) {
      throw new Error('Arguments must be Point.');
    }
    var radian = atan2(point.y - this.y, point.x - this.x);
    return (asRadian) ? radian : radian * 180 / PI;
  },
  distanceTo: function(point) {
    if (!(point instanceof Point)) {
      throw new Error('Arguments must be Point.');
    }
    return sqrt(pow(point.x - this.x, 2) + pow(point.y - this.y, 2));
  },
  middlePointOf: function(point) {
    if (!(point instanceof Point)) {
      throw new Error('Arguments must be Point.');
    }
    return new Point((this.x + point.x) / 2, (this.y + point.y) / 2);
  },
  toString: function() {
    return '( ' + this.x + ', ' + this.y + ' )';
  }
});

module.exports = Point;
