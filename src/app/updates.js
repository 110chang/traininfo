
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

  var Lines = require('./lines');

  function UpdatesVM() {
    this.$el = $('#footer');
    this.isShow = ko.observable(false);
    this.close();

    this.lines = Lines();
    this.lines.data.subscribe(function() {
      this.filtered(this.filterHasInfo());
    }, this);
    this.keyword = ko.observable('');
    this.keyword.subscribe(function(val) {
      if (val) {
        var filtered = this.filterKeyword(val);
        console.log(filtered);
        if (filtered.length > 0) {
          this.filtered(filtered);
        } else {

        }
      } else {
        this.all();
      }
    }, this);
    this.filtered = ko.observableArray([]);

    ko.applyBindings(this, this.$el.get(0));
  }
  inherit(UpdatesVM, events.EventEmitter);
  extend(UpdatesVM.prototype, {
    initialize: function() {
      this.filtered(this.filterHasInfo());
    },
    all: function() {
      this.filtered(this.filterAll());
    },
    hasInfo: function() {
      this.filtered(this.filterHasInfo());
    },
    match: function() {
      this.filtered(this.filterKeyword());
    },
    toggle: function(e) {
      //console.log('UpdatesVM#toggle');
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
    },
    filterAll: function() {
      return this.lines.data().slice().sort(function(a, b) {
        return a.id() - b.id();
      }, this);
    },
    filterHasInfo: function() {
      return this.lines.data().slice().filter(function(e) {
        return e.status().key !== 'normal';
      }, this).sort(function(a, b) {
        return a.id() - b.id();
      }, this);
    },
    filterKeyword: function(keyword) {
      keyword = this.keyword();
      console.log(keyword);
      return this.lines.data().slice().filter(function(e) {
        var matchName = e.name().match(keyword);
        var matchInfo = e.content().match(keyword);
        var matchStation = e.stationNameStr.match(keyword);
        //console.log(e.name(), keyword);
        //console.log(e.content(), keyword);
        //console.log(matchName, matchInfo);
        return matchName || matchInfo || matchStation;
      }, this);
    }
  });

  module.exports = UpdatesVM;

})((this || 0).self || global);