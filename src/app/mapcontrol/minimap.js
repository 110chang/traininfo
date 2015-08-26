
/*
 * Minimap
 */

var extend = require('extend');
var ko = require('knockout');

var _instance = null;

var abs = Math.abs;
var trunc = Math.trunc;

function Minimap(scale) {
  console.log('Minimap#constructor');
  if (_instance instanceof Minimap) {
    return _instance;
  }
  if (!(this instanceof Minimap)) {
    return new Minimap();
  }
  this.scale = typeof scale === 'number' ? scale : 10;

  this.x = ko.observable(0);
  this.y = ko.observable(0);
  this.width = ko.observable(0);
  this.height = ko.observable(0);

  _instance = this;
}
extend(Minimap.prototype, {
  initialize: function(w, h) {
    console.log('Minimap#initialize');
    this.svgWidth = ko.observable(w / this.scale);
    this.svgHeight = ko.observable(h / this.scale);
  },
  update: function(x, y, w, h) {
    this.x(x / this.scale);
    this.y(y / this.scale);
    this.width(w / this.scale);
    this.height(h / this.scale);
  }
});

module.exports = Minimap;

