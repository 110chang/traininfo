
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
  this.scale = typeof scale === 'number' ? scale : 20;

  this.x = ko.observable(0);
  this.y = ko.observable(0);
  this.width = ko.observable(0);
  this.height = ko.observable(0);
  this.svgWidth = ko.observable(0);
  this.svgHeight = ko.observable(0);


  _instance = this;
}
extend(Minimap.prototype, {
  initialize: function(w, h) {
    console.log('Minimap#initialize');
    this.svgWidth(w / this.scale);
    this.svgHeight(h / this.scale);
  },
  resize: function(w, h) {
    console.log('Minimap#resize');
    this.svgWidth(w / this.scale);
    this.svgHeight(h / this.scale);
  },
  update: function(x, y, w, h) {
    this.x(x / this.scale);
    this.y(y / this.scale);
    this.width(w / this.scale);
    this.height(h / this.scale);
  }
});

module.exports = Minimap;

