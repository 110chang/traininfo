
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
  this.selected = ko.observableArray([]);
  this.updates = ko.observableArray([]);
  this.origUpdates = [];
  this.load();
}
inherit(UpdatesVM, events.EventEmitter);
extend(UpdatesVM.prototype, {
  hasSelected: function() {
    return this.selected().length > 0;
  },
  hasUpdates: function() {
    return this.updates().length > 0;
  },
  getUpdates: function() {
    //console.log('UpdatesVM#getUpdates');
    //console.log(this.updates().slice());
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
  },
  applyLines: function(data) {
    console.log('UpdatesVM#applyLines');
    //console.log(data);
    var updates = this.getUpdates();
    data.forEach(function(line) {
      //console.log(line.goo_key);
      updates.forEach(function(update) {
        //console.log(update.title.match(line.goo_key));
        if (update.title.match(line.goo_key)) {
          console.log(update.title + '===' + line.goo_key);
          update.color = line.color;
        }
      }, this);
    }, this);
    console.log(updates);
    this.updates(updates);
    this.origUpdates = this.getUpdates();

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
  },
  popup: function(e) {
    console.log('UpdatesVM#popup');
    this.selected([]);
    var filtered = this.updates().filter(function(update) {
      //console.log(updates.title +'==='+ e.goo_key);
      return update.title.match(e.goo_key);
    }, this);
    console.log(filtered);
    if (filtered && filtered.length > 0) {
      this.updates([]);
      this.selected(filtered);
    } else {
      this.popout();
    }
  },
  popout: function() {
    console.log('UpdatesVM#popout');
    console.log(this.origUpdates);
    this.updates(this.origUpdates);
    this.selected([]);
  },
  animationDelay: function(e) {
    console.log('UpdatesVM#animationDelay');
    if (e.nodeType === 1) {
      var _self = this;
      setTimeout(function() {
        e.parentNode.removeChild(e);
      }, 500);
    }
  }
});
UpdatesVM.MAX_NUMBER_OF_TRIAL = 5;


module.exports = UpdatesVM;
