
/*
 * updates
 */

(function(global) {

  var $ = global.jQuery || require('jquery');

  require('jquery.easing');

  var extend = require('extend');
  var events = require('events');
  var inherit = require('util').inherits;
  var ko = require('knockout');
  var ajax = require('superagent');

  var Status = require('./status');

  var escapeLineName = /([\\\*\+\.\?\{\}\(\)\[\]\^\$\-\|\/])/g;

  function UpdatesVM() {
    this.$el = $('#updates');
    this.$list = $('#updates-list');
    this.numTrial = 0;
    this.isShow = ko.observable(false);
    this.updates = ko.observableArray([]);
    this.origUpdates = [];
    this.load();
  }
  inherit(UpdatesVM, events.EventEmitter);
  extend(UpdatesVM.prototype, {
    hasUpdates: function() {
      //console.log('UpdatesVM#hasUpdates');
      return this.updates().length > 0;
    },
    getUpdates: function() {
      //console.log('UpdatesVM#getUpdates');
      return this.updates().slice();
    },
    load: function() {
      //console.log('UpdatesVM#load');
      ajax.get(global.UPDATE_SRC).end(this.loadComplete.bind(this));
    },
    loadComplete: function(error, response) {
      //console.log('UpdatesVM#loadComplete');
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
    handleError: function(error) {
      //console.log('UpdatesVM#handleError');
      this.numTrial++;
      if (this.numTrial < UpdatesVM.MAX_NUMBER_OF_TRIAL) {
        this.load();
      } else {
        this.numTrial = 0;
        this.emit('loadFailure');
      }
    },
    applyLines: function(data) {
      //console.log('UpdatesVM#applyLines');
      var updates = this.getUpdates();
      data.forEach(function(line) {
        //console.log(line.goo_key);
        var regTitle = new RegExp(line.goo_key.replace(escapeLineName, '\\$1'));
        //console.log(regTitle);
        this.updates().map(function(update) {
          //console.log(update.title + '===' + line.goo_key);
          if (regTitle.test(update.title)) {
            //console.log(update.title + '===' + line.goo_key);
            update.color = line.color;
            update.name = line.name;
          }
        }, this);
      }, this);
      //console.log(updates);
      this.updates(updates);
      this.origUpdates = this.getUpdates();

      ko.applyBindings(this, this.$el.get(0));

      this.close();
    },
    toggle: function() {
      if (this.isShow()) {
        this.close();
      } else {
        this.open();
      }
      this.isShow(!this.isShow());
    },
    open: function(data, e) {
      //console.log('UpdatesVM#open');
      this.$el.stop().animate({
        'bottom': 0
      }, 250, 'easeInOutExpo');
    },
    close: function() {
      //console.log('UpdatesVM#close');
      this.$el.stop().animate({
        'bottom': -this.$el.height() - 44
      }, 250, 'easeInOutExpo');
    },
    resize: function() {
      //console.log('UpdatesVM#resize');
      this.$el.css({
        'bottom': -this.$el.height() - 44
      });
    }
  });
  UpdatesVM.MAX_NUMBER_OF_TRIAL = 5;


  module.exports = UpdatesVM;

})((this || 0).self || global);