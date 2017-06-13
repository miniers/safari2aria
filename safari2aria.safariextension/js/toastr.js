;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.miniToastr = factory();
  }
}(this, function() {
  'use strict';

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// eslint-disable-next-line no-unused-vars
  var miniToastr = function () {
    var _ref, _style;

    //fix for server-side rendering
    if (typeof window === 'undefined') {
      return {
        init: function init() {}
      };
    }

    function fadeOut(element, cb) {
      var _this = this;

      if (element.style.opacity && element.style.opacity > 0.05) {
        element.style.opacity = element.style.opacity - 0.05;
      } else if (element.style.opacity && element.style.opacity <= 0.1) {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
          if (cb) cb();
        }
      } else {
        element.style.opacity = 0.9;
      }
      setTimeout(function () {
        return fadeOut.apply(_this, [element, cb]);
      }, 1000 / 30);
    }

    var TYPES = {
      error: 'error',
      warn: 'warn',
      success: 'success',
      info: 'info'
    };

    var CLASSES = {
      container: 'mini-toastr',
      notification: 'mini-toastr__notification',
      title: 'mini-toastr-notification__title',
      icon: 'mini-toastr-notification__icon',
      message: 'mini-toastr-notification__message',
      error: '-' + TYPES.error,
      warn: '-' + TYPES.warn,
      success: '-' + TYPES.success,
      info: '-' + TYPES.info
    };

    function flatten(obj, into, prefix) {
      into = into || {};
      prefix = prefix || '';

      for (var k in obj) {
        if (obj.hasOwnProperty(k)) {
          var prop = obj[k];
          if (prop && (typeof prop === 'undefined' ? 'undefined' : _typeof(prop)) === 'object' && !(prop instanceof Date || prop instanceof RegExp)) {
            flatten(prop, into, prefix + k + ' ');
          } else {
            if (into[prefix] && _typeof(into[prefix]) === 'object') {
              into[prefix][k] = prop;
            } else {
              into[prefix] = {};
              into[prefix][k] = prop;
            }
          }
        }
      }

      return into;
    }

    function makeCss(obj) {
      var flat = flatten(obj);
      var str = JSON.stringify(flat, null, 2);
      str = str.replace(/"([^"]*)": \{/g, '$1 {').replace(/"([^"]*)"/g, '$1').replace(/(\w*-?\w*): ([\w\d .#]*),?/g, '$1: $2;').replace(/},/g, '}\n').replace(/ &([.:])/g, '$1');

      str = str.substr(1, str.lastIndexOf('}') - 1);

      return str;
    }

    function appendStyles(css) {
      var head = document.head || document.getElementsByTagName('head')[0];
      var styleElem = makeNode('style');
      styleElem.id = 'mini-toastr-styles';
      styleElem.type = 'text/css';

      if (styleElem.styleSheet) {
        styleElem.styleSheet.cssText = css;
      } else {
        styleElem.appendChild(document.createTextNode(css));
      }

      head.appendChild(styleElem);
    }

    var config = {
      types: TYPES,
      animation: fadeOut,
      timeout: 3000,
      icons: {},
      appendTarget: document.body,
      node: makeNode(),
      style: (_style = {}, _defineProperty(_style, '.' + CLASSES.container, {
        position: 'fixed',
        'z-index': 99999,
        right: '12px',
        top: '12px'
      }), _defineProperty(_style, '.' + CLASSES.notification, (_ref = {
        cursor: 'pointer',
        padding: '12px 18px',
        margin: '0 0 6px 0',
        'background-color': '#000',
        opacity: 0.8,
        color: '#fff',
        'border-radius': '3px',
        'box-shadow': '#3c3b3b 0 0 12px',
        width: '300px'
      }, _defineProperty(_ref, '&.' + CLASSES.error, {
        'background-color': '#D5122B'
      }), _defineProperty(_ref, '&.' + CLASSES.warn, {
        'background-color': '#F5AA1E'
      }), _defineProperty(_ref, '&.' + CLASSES.success, {
        'background-color': '#7AC13E'
      }), _defineProperty(_ref, '&.' + CLASSES.info, {
        'background-color': '#4196E1'
      }), _defineProperty(_ref, '&:hover', {
        opacity: 1,
        'box-shadow': '#000 0 0 12px'
      }), _ref)), _defineProperty(_style, '.' + CLASSES.title, {
        'font-weight': '500'
      }), _defineProperty(_style, '.' + CLASSES.message, {
        display: 'inline-block',
        'vertical-align': 'middle',
        width: '240px',
        padding: '0 12px'
      }), _style)
    };

    function makeNode() {
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'div';

      return document.createElement(type);
    }

    function createIcon(node, type, config) {
      var iconNode = makeNode(config.icons[type].nodeType);
      var attrs = config.icons[type].attrs;

      for (var k in attrs) {
        if (attrs.hasOwnProperty(k)) {
          iconNode.setAttribute(k, attrs[k]);
        }
      }

      node.appendChild(iconNode);
    }

    function addElem(node, text, className) {
      var elem = makeNode();
      elem.className = className;
      elem.appendChild(document.createTextNode(text));
      node.appendChild(elem);
    }

    var exports = {
      config: config,
      showMessage: function showMessage(message, title, type, timeout, cb, overrideConf) {
        var config = {};
        Object.assign(config, this.config);
        Object.assign(config, overrideConf);

        var notificationElem = makeNode();
        notificationElem.className = CLASSES.notification + ' ' + CLASSES[type];

        notificationElem.onclick = function () {
          config.animation(notificationElem, null);
        };

        if (title) addElem(notificationElem, title, CLASSES.title);
        if (config.icons[type]) createIcon(notificationElem, type, config);
        if (message) addElem(notificationElem, message, CLASSES.message);

        config.node.insertBefore(notificationElem, config.node.firstChild);
        setTimeout(function () {
          return config.animation(notificationElem, cb);
        }, timeout || config.timeout);

        if (cb) cb();
        return this;
      },
      init: function init(aConfig) {
        var _this2 = this;

        var newConfig = {};
        Object.assign(newConfig, config);
        Object.assign(newConfig, aConfig);
        this.config = newConfig;

        var cssStr = makeCss(newConfig.style);
        appendStyles(cssStr);
        newConfig.node.id = '' + CLASSES.container;
        newConfig.node.className = '' + CLASSES.container;
        newConfig.appendTarget.appendChild(newConfig.node);

        Object.keys(newConfig.types).forEach(function (v) {
          exports[newConfig.types[v]] = function (message, title, timeout, cb, config) {
            this.showMessage(message, title, newConfig.types[v], timeout, cb, config);
            return this;
          }.bind(_this2);
        });

        return this;
      },
      setIcon: function setIcon(type) {
        var nodeType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'i';
        var attrs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

        attrs['class'] = attrs['class'] ? attrs['class'] + ' ' + CLASSES.icon : CLASSES.icon;

        this.config.icons[type] = {
          nodeType: nodeType,
          attrs: attrs
        };
      }
    };

    return exports;
  }();
  return miniToastr;
}));