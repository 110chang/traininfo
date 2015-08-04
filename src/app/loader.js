
/*
 * loader
 */

var extend = require('extend');
var events = require('events');
var inherit = require('util').inherits;
var ajax = require('superagent');
var Q = require('q');

function Loader(urls) {
  this.dfd = Q.defer();
}
inherit(Loader, events.EventEmitter);
extend(Loader.prototype, {
  getLines: function() {
    console.log('UpdatesVM#getLines');
    ajax.get('http://192.168.1.11:8002/').end(this.getLinesSuccess.bind(this));
  },
  getLinesSuccess: function(error, response) {
    console.log('UpdatesVM#getLinesSuccess');
    console.log(response.body);
    this.lines(response.body);
    this.emit('loadComplete');

    //ko.applyBindings(this);
  }
});

module.exports = Loader;
