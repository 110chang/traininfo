
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
  this.numTrial = 0;
  this.updates = ko.observableArray([]);
  this.load();
}
inherit(UpdatesVM, events.EventEmitter);
extend(UpdatesVM.prototype, {
  getUpdates: function() {
    console.log('UpdatesVM#getUpdates');
    console.log(this.updates().slice());
    return this.updates().slice();
  },
  load: function() {
    console.log('UpdatesVM#load');
    ajax.get('http://192.168.1.11:8002/').end(this.loadComplete.bind(this));
  },
  loadComplete: function(error, response) {
    console.log('UpdatesVM#loadComplete');
    if (error) {
      this.handleError(error);
      return;
    }
    console.log(response.body[0].value.items);
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
  },
  handleError: function(error) {
    console.log('UpdatesVM#handleError');
    this.numTrial++;
    if (this.numTrial < UpdatesVM.MAX_NUMBER_OF_TRIAL) {
      this.load();
    } else {
      this.numTrial = 0;
      this.emit('loadFailure');
    }
  }
});
UpdatesVM.MAX_NUMBER_OF_TRIAL = 5;


module.exports = UpdatesVM;
