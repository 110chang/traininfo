
/*
 * geocoords
 */

/*
Heartrailsの駅座標は国土数値情報鉄道データに基づく
座標系JGD2000 / (B, L)　別称：日本測地系2000/緯度,経度,高さ

*/

var extend = require('extend');
var events = require('events');
var inherit = require('util').inherits;
var ko = require('knockout');
var ajax = require('superagent');
var Q = require('q');

var Decimal = require('decimal.js');

var LatLng = require('./latlng');
var Point = require('../geom/point');
var Rectangle = require('../geom/rectangle');

var sqrt = Math.sqrt;
var sin = Math.sin;
var cos = Math.cos;

function deg2rad(deg) {
  return deg * Math.PI / 180;
}

var _instance = null;

function GeoCoords(options) {
  if (_instance instanceof GeoCoords) {
    return _instance;
  }
  if (!(this instanceof GeoCoords)) {
    return new GeoCoords(options);
  }
  this.options = extend({}, GeoCoords.defaults, options);
  this.appWidth = window.innerWidth;
  this.appHeight = window.innerHeight;
  this.home = new LatLng(35.685326, 139.7531); // ホームポジション
  this.coords = new LatLng(this.home);
  this.bounds = null;

  //console.log(this.getDestination(new LatLng(36.10056, 140.09111), new LatLng(35.65500, 139.74472)));

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
  getHome: function(asScreen) {
    var point = this.latLngToScreen(this.home.lat, this.home.lng);
    point = new Point(point.x, point.y);
      
    return asScreen ? point : this.home;
  },
  setCoords: function(coords) {
    if (!(coords instanceof LatLng)) {
      this.coords = coords;
    }
  },
  getCoords: function(asScreen) {
    var point = this.latLngToScreen(this.coords.lat, this.coords.lng);
    point = new Point(point.x, point.y);
    
    return asScreen ? point : this.coords;
  },
  latLngToScreen: function(lat, lng) {
    var x = this.bounds.x + (lng - this.edge.west) * this.scale;
    var y = this.appHeight - (this.bounds.y + (lat - this.edge.south) * this.scale);
      
    return new Point(x, y);
  },
  screenToLatLng: function(x, y) {
    var lat = (this.appHeight - y) / this.scale + this.edge.south * 1;
    var lng = (x - this.bounds.x) / this.scale + this.edge.west * 1;
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
  _getScale: function() {
    var lngRange = (this.edge.east - this.edge.west);
    var latRange = (this.edge.north - this.edge.south);
    var viewRatio = this.appWidth / this.appHeight;
    var latLngRatio = lngRange / latRange;
    if (this.options.meet) {
      if (viewRatio < latLngRatio) {
        this.appWidth = this.appHeight * lngRange / latRange;
      } else if (viewRatio > latLngRatio) {
        this.appHeight = this.appWidth * latRange / lngRange;
      }
    }
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
    //console.log(this.bounds);
  },
  _edgeContain: function(lat, lng) {
    var edge = this.edge;
    //console.log(edge.north +"<"+ lat +"<"+ edge.south);
    return edge.south < lat && lat < edge.north && edge.west < lng && lng < edge.east;
  },
  getDestination: function(g0, g1) {
    //http://yamadarake.jp/trdi/report000001.html
    if (!(g0 instanceof LatLng) || !(g1 instanceof LatLng)) {
      throw new Error('Arguments must be LatLng');
    }
    var dy = deg2rad(g0.lat - g1.lat);//緯度の差（ラジアン）
    var dx = deg2rad(g0.lng - g1.lng);//経度の差（ラジアン）
    var μy = (g0.lat + g1.lat) / 2;//緯度の平均値
    var a = 6378137.0;//長半径（赤道半径） a (m) GRS80（世界測地系）
    var b = 6356752.314140;//短半径（極半径） b (m) GRS80（世界測地系）
    //var e = sqrt((a * a - b * b) / a * a);//第一離心率
    var e2 = 0.00669438002301188;//第一離心率の二乗
    console.log(e2);
    console.log(new Decimal(e2).toExponential(15));
    var sinμy = sin(μy).toExponential(15);
    var cosμy = cos(μy).toExponential(15);
    console.log(sinμy);
    console.log(Decimal.ONE.minus(new Decimal(e2).toExponential(15)).times(sinμy));
    var W = Decimal.ONE.minus(new Decimal(e2).toExponential(15)).times(sinμy).times(sinμy).sqrt();
    var a1e2 = 6335439.32708317;
    console.log(a1e2);
    console.log(W * W * W);
    var WWW = (W * W * W).toExponential(15);
    //var M = a * (1 - e2) / W * W * W;//子午線曲率半径
    var M = (new Decimal(a1e2)).div(WWW).toExponential(15);//子午線曲率半径
    console.log(M);
    var N = (new Decimal(a)).div(W).toExponential(15);//卯酉線曲率半径
    console.log(N);
    var dyM = (new Decimal(dy.toExponential(15))).times(M);
    var dxNcos = (new Decimal(dx.toExponential(15))).times(N).times(cosμy);

    return dyM.pow(2).plus(dxNcos.pow(2)).sqrt().toFixed(15);
  }
});
GeoCoords.defaults      = {
  meet: false
};
GeoCoords.CHANGE        = 'onChange'                ;
GeoCoords.API_SUCCESS   = 'onGeoLocationAPISuccess' ;
GeoCoords.API_ERROR     = 'onGeoLocationAPIError'   ;
GeoCoords.API_OUT_RANGE = 'onGeoLocationAPIOutRange';

module.exports = GeoCoords;
