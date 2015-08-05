
/*
 * routemap
 */

var extend = require('extend');
var events = require('events');
var inherit = require('util').inherits;
var ko = require('knockout');

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
  this.lines = ko.observableArray();

  ko.applyBindings(this, document.getElementById('routemap'));
}
extend(RouteMapVM.prototype, {
  updateBounds: function(width, height, viewBox) {
    this.width(width + 'px');
    this.height(height + 'px');
    this.viewBox(viewBox);
  },
  updateLines: function(lines) {
    this.lines(lines);
  }
});

module.exports = RouteMapVM;
