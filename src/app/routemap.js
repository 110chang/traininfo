
/*
 * routemap
 */

var extend = require('extend');
var events = require('events');
var inherit = require('util').inherits;
var ko = require('knockout');

var Lines = require('./lines');
var Stations = require('./stations');

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
  this.viewBox = ko.observable('0 0 0 0');
  this.lineData = ko.observable();

  //this.viewBox.subscribe(function(val) {
  //  console.log(val);
  //});
}
extend(RouteMapVM.prototype, {
  initialize: function() {
    this.lines = Lines();
    this.stations = Stations();

    ko.applyBindings(this, document.getElementById('routemap'));
  },
  setSVGAttr: function(width, height, viewBox) {
    this.width(width + 'px');
    this.height(height + 'px');
    this.viewBox(viewBox);
  },
  getViewWidth: function() {
    return this.viewBox().split(' ')[2];
  },
  getViewHeight: function() {
    return this.viewBox().split(' ')[3];
  },
  dumpViewBox: function() {
    var x = this.viewBox().split(' ')[0];
    var y = this.viewBox().split(' ')[1];
    var w = this.viewBox().split(' ')[2];
    var h = this.viewBox().split(' ')[3];
    return '(' + ~~x + ',' + ~~y + ') (' + w + ',' + h + ')';
  },
  dumpDevicePixelRatio: function() {
    return window.devicePixelRatio || 1;
  },
  dumpInnerWindow: function() {
    return '(' + window.innerWidth + ',' + window.innerHeight + ')';
  }
});

module.exports = RouteMapVM;
