
/*
 * geocoords
 */

var extend = require('extend');
var events = require('events');
var inherit = require('util').inherits;
var ko = require('knockout');
var ajax = require('superagent');
var Q = require('q');

var LatLng = require('./latlng');
var Point = require('../geom/point');
var Rectangle = require('../geom/rectangle');

var _instance = null;

function GeoCoords(appWidth, appHeight) {
  if (_instance instanceof GeoCoords) {
    return _instance;
  }
  if (!(this instanceof GeoCoords)) {
    return new GeoCoords();
  }
  this.appWidth = appWidth;
  this.appHeight = appHeight;
  this.home = new LatLng(35.685326, 139.7531); // ホームポジション
  this.coords = new LatLng(this.home);
  this.offset = new Point(0, 0);
  this.bounds = null;

  _instance = this;
}
inherit(GeoCoords, events.EventEmitter);
extend(GeoCoords.prototype, {
  initialize: function(points) {
    this._getEdge(points);
    this._getScale();
    this._getBounds();
  },
  resize: function(appWidth, appHeight) {
    this.appWidth = appWidth;
    this.appHeight = appHeight;
    
    this._getEdge();
    this._getScale();
    this._getBounds();
  },
  update: function() {
    //console.log('GeoCoords#update');
    //console.log(navigator.geolocation);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._onGeoLocationAPI.bind(this));
    }
    this._getScale();
    this._getBounds();
  },
  applyOffset: function(point) {
    return point.translate(
      this.offset.x,
      this.offset.y
    );
  },
  setOffset: function(x, y) {
    this.offset = new Point(x, y);
  },
  getHome: function(screen) {
    var point = this.latLngToScreen(this.home.lat, this.home.lng);
    point = new Point(point.x + this.offset.x, point.y + this.offset.y);
      
    return screen ? point : this.home;
  },
  setCoords: function(_coords) {
    if (compare(LatLng, _coords)) {
      this.coords = _coords;
    }
  },
  getCoords: function(screen) {
    var point = this.latLngToScreen(this.coords.lat, this.coords.lng);
    point = new Point(point.x + this.offset.x, point.y + this.offset.y);
    
    return screen ? point : this.coords;
  },
  latLngToScreen: function(lat, lng) {
    var x = this.bounds.x + (lng - this.edge.west) * this.scale,
      y = this.appHeight - (this.bounds.y + (lat - this.edge.south) * this.scale);
      
    return new Point(x, y);
  },
  screenToLatLng: function(x, y) {
    var lat = (this.appHeight - y) / this.scale + this.edge.south * 1,
      lng = (x - this.bounds.x) / this.scale + this.edge.west * 1;
      //lng * scale = x - this.bounds.x + this.edge.west * scale;
    return new LatLng(lat, lng);
  },
  _onGeoLocationAPI: function(pos, error, options) {
    //console.log('GeoCoords#_onGeoLocationAPI');
    if (pos) {
      if (this._edgeContain(pos.coords.latitude, pos.coords.longitude)) {
        this.coords = new LatLng(pos.coords.latitude, pos.coords.longitude);
        this.fire(GeoCoords.API_SUCCESS);
      } else {
        this.fire(GeoCoords.API_OUT_RANGE);
      }
    }
    if (error) {
      this.publish(GeoCoords.API_ERROR);
    }
  },
  _getEdge: function(points) {
    var north, east, west, south, line, len, i;
    
    points.forEach(function(point) {
      //console.log(line.stations.length);
      if (north === undefined) {
        north = south = point.y;
        east = west = point.x;
      }
      north = (north < point.y) ? north = point.y : north = north;
      south = (south > point.y) ? south = point.y : south = south;
      east  = (east  < point.x) ? east  = point.x : east  = east;
      west  = (west  > point.x) ? west  = point.x : west  = west;
    });
    
    this.edge = {
      north: north,
      east : east,
      west : west,
      south: south
    };
    //console.log(this.edge)
  },
  _edgeContain: function(lat, lng) {
    var edge = this.edge;
    //console.log(edge.north +"<"+ lat +"<"+ edge.south);
    return edge.south < lat && lat < edge.north && edge.west < lng && lng < edge.east;
  },
  _getScale: function() {
    var lngRange = (this.edge.east - this.edge.west);
    var latRange = (this.edge.north - this.edge.south);
    var xratio = this.appWidth / lngRange;
    var yratio = this.appHeight / latRange;
    
    this.scale = (xratio > yratio) ? xratio : yratio;
    //console.log(this.scale);
  },
  _getBounds: function() {
    var lngRange = (this.edge.east - this.edge.west);
    var latRange = (this.edge.north - this.edge.south);
    var left = (this.appWidth - lngRange * this.scale) / 2;
    var top = (this.appHeight - latRange * this.scale) / 2;

    this.bounds = new Rectangle(
      left,                  //x
      top,                   //y
      lngRange * this.scale, //width
      latRange * this.scale  //height
    );
  }
});
GeoCoords.CHANGE        = 'onChange'                ;
GeoCoords.API_SUCCESS   = 'onGeoLocationAPISuccess' ;
GeoCoords.API_ERROR     = 'onGeoLocationAPIError'   ;
GeoCoords.API_OUT_RANGE = 'onGeoLocationAPIOutRange';

module.exports = GeoCoords;
