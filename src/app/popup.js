
/*
 * popup
 */

(function(global) {

  var $ = global.jQuery || require('jquery');
  require('jquery.easing');

  var extend = require('extend');
  var events = require('events');
  var inherit = require('util').inherits;
  var ko = require('knockout');

  var Status = require('./status');
  var Screen = require('../mod/screen');

  var _instance = null;

  function Popup() {
    if (_instance instanceof Popup) {
      return _instance;
    }
    if (!(this instanceof Popup)) {
      return new Popup();
    }

    this.$el = $('#popup');
    this.$wrapper = this.$el.children('.popup-container-wrapper');

    this.name    = ko.observable('');
    this.content = ko.observable('');
    this.color   = ko.observable();
    this.status  = ko.observable(Status().decode(0));

    this.left    = ko.observable(0);
    this.top     = ko.observable(0);

    this.memVM = null;

    ko.applyBindings(this, this.$el.get(0));

    _instance = this;
  }
  inherit(Popup, events.EventEmitter);
  extend(Popup.prototype, {
    show: function(lineVM, e) {
      //console.log('Popup#show');
      this.memVM = lineVM;

      this.name(lineVM.name());
      this.content(lineVM.content());
      this.color(lineVM.color);
      this.status(lineVM.status());

      var ww = this.$wrapper.width();
      var wh = this.$wrapper.height();
      var left = e.clientX - ww / 2;
      var top = e.clientY;

      if (Screen.clientWidth() < left + ww) {
        left = Screen.clientWidth() - ww - 10;
      }
      if (left < 10) {
        left = 10;
      }

      this.left(left + 'px');
      this.top(top - wh - 10 + 'px');
      this.$el.addClass('popup--show');
    },
    hide: function() {
      //console.log('Popup#hide');
      this.$el.removeClass('popup--show');
      this.emit('popupClose', this.memVM);
    },
    onClick: function() {
      this.hide();
    }
  });

  module.exports = Popup;

})((this || 0).self || global);