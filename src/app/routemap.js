
/*
 * routemap
 */

var extend = require('extend');
var events = require('events');
var inherit = require('util').inherits;
var ko = require('knockout');

var Lines = require('./lines');

var _instance = null;

function RouteMapVM() {
  if (_instance instanceof RouteMapVM) {
    return _instance;
  }
  if (!(this instanceof RouteMapVM)) {
    return new RouteMapVM();
  }

  this.width = ko.observable();
  this.height = ko.observable();
  this.viewBox = ko.observable();
  this.lineData = ko.observable();
}
extend(RouteMapVM.prototype, {
  initialize: function() {
    this.lines = Lines();

    ko.applyBindings(this, document.getElementById('routemap'));
  },
  setSVGAttr: function(width, height, viewBox) {
    this.width(width + 'px');
    this.height(height + 'px');
    this.viewBox(viewBox);
  }
});

module.exports = RouteMapVM;
