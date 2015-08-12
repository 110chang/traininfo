
/*
 * updates
 */

var extend = require('extend');
var events = require('events');
var inherit = require('util').inherits;
var ko = require('knockout');
var ajax = require('superagent');

var Status = require('./status');

function UpdatesVM() {
  this.updates = ko.observableArray([]);
  ajax.get('http://192.168.1.11:8002/').end(this.loadComplete.bind(this));
}
inherit(UpdatesVM, events.EventEmitter);
extend(UpdatesVM.prototype, {
  getUpdates: function() {
    return this.updates().slice();
  },
  loadComplete: function(error, response) {
    //console.log('UpdatesVM#getLinesSuccess');
    //console.log(response.body[0].value.items);
    var updates = response.body[0].value.items;
    updates.map(function(update) {
      return extend(update, {
        status: Status().convert(update.content)
      });
    }, this);
    //console.log(updates);
    this.updates(updates);
    this.emit('loadComplete');

    ko.applyBindings(this, document.getElementById('updates'));
  }
});

module.exports = UpdatesVM;
