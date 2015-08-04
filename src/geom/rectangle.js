/*
 *   geom.Rectangle r1
 */

// external libraries
var extend = require('extend');

// modules
var Point = require('../geom/point');

var isNumber = function(n) {
  return typeof n === 'number';
};

function Rectangle(x, y, width, height) {
  if (!(this instanceof Rectangle)) {
    return new Rectangle(x, y, width, height);
  }
  x = typeof x === 'undefined' ? 0 : x;
  y = typeof y === 'undefined' ? 0 : y;
  width = typeof width === 'undefined' ? 100 : width;
  height = typeof height === 'undefined' ? 100 : height;

  if (!isNumber(x) || !isNumber(y) || !isNumber(width) || !isNumber(height)) {
    throw new Error('Arguments must be Number.');
  }
  this.x      = x;
  this.y      = y;
  this.width  = width;
  this.height = height;
  this.center = new Point(x + width / 2, y + height / 2);
}
extend(Rectangle.prototype, {
  getVertices: function() {
    var LT = new Point(this.x, this.y);
    var RT = new Point(this.x + this.width, this.y);
    var RB = new Point(this.x + this.width, this.y + this.height);
    var LB = new Point(this.x, this.y + this.height);
    return [LT, RT, RB, LB];
  },
  getCenter: function() {
    return this.center;
  },
  translate: function(x, y) {
    if (!isNumber(x) || !isNumber(y)) {
      throw new Error('Arguments must be Number.');
    }
    this.x += x;
    this.y += y;
    this.center.translate(x, y);
  },
  contain: function(point) {
    if (!(point instanceof Point)) {
      throw new Error('Arguments must be Point.');
    }
    var h = this.x <= point.x && point.x <= this.x + this.width;
    var v = this.y <= point.y && point.y <= this.y + this.height;
    return h && v;
  },
  collapse: function(rect) {
    if (!(rect instanceof Rectangle)) {
      throw new Error('Arguments must be Rectangle.');
    }
    var LT = new Point(rect.x, rect.y);
    var RT = new Point(rect.x + rect.width, rect.y);
    var RB = new Point(rect.x + rect.width, rect.y + rect.height);
    var LB = new Point(rect.x, rect.y + rect.height);
    
    return this.contain(LT) || this.contain(RT) || this.contain(RB) || this.contain(LB);
  }
});

module.exports = Rectangle;
