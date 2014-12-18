var protocol = require('./protocol.json');
var util = require('util');
var events = require('events');
var http = require('http');
var WebSocket = require('ws');
var Q = require('q');

function Chrome(options) {
  this.host = options.host || 'localhost';
  this.port = options.port || 9222;
}

Chrome.prototype = {
  connectToTab: function(tabData) {
    var defer = Q.defer();
    var ws = new WebSocket(tabData.webSocketDebuggerUrl);
    ws.addListener('error', defer.reject);
    ws.on('open', function () {
      ws.removeListener('error', defer.reject);
      defer.resolve(new TabConnection(ws, tabData));
    });
    return defer.promise;
  },
  _get: function(path, parseResult) {
    var defer = Q.defer();
    var httpOptions = {'host': this.host,
                       'port': this.port,
                       'path': path};
    var request = http.get(httpOptions, function (response) {
      var data = '';
      response.on('data', function (chunk) {
          data += chunk;
      });
      response.on('end', function () {
        defer.resolve(parseResult ? JSON.parse(data) : data);
      });
    });
    request.on('error', defer.reject);
    return defer.promise;
  },
  newTab: function() {
    return this._get('/json/new', true);
  },
  activateTab: function(tab) {
    return this._get('/json/activate/'+tab.id, false);
  },
  closeTab: function(tab) {
    return this._get('/json/close/'+tab.id, false);
  },
  listTabs: function () {
    return this._get('/json', true);
  }
};


function TabConnection(ws, tabData) {
  this._ws = ws;
  this._data = tabData;
  this._deferreds = {};
  this._nextCommandId = 1;
  this._domainState = {
    started: {},
    enabled: {}
  };
  this._ws.on('message', this._onMessage.bind(this));
  this._addCommandShorthands(protocol);
};

util.inherits(TabConnection, events.EventEmitter);
merge({
  disconnect: function () {
    this._ws.removeAllListeners();
    this._ws.close();
  },
  _send: function (method, params) {
    var id = this._nextCommandId++;
    var defer = Q.defer();
    this._deferreds[id] = defer;
    this._ws.send(JSON.stringify({
      'id': id, 'method': method, 'params': params
    }));
    return defer.promise;
  },
  _onMessage: function(message) {
    var message = JSON.parse(message);
    if (message.id) {
      // command response
      var deferred = this._deferreds[message.id];
      if (message.result) {
        deferred.resolve(message.result);
      } else if (message.error) {
        deferred.reject(message.error);
      }
      delete this._deferreds[message.id];
    } else if (message.method) {
      // event
      this.emit('event', message);
      this.emit(message.method, message.params);
    }
  },
  _prepareHelp: function(type, object, fields) {
    var help = {
      'type': type
    };
    fields.forEach(function (field) {
      if (field in object) {
        help[field] = object[field];
      }
    });
    return help;
  },
  _addCommand: function(domainName, command) {
    var self = this;
    var sendFn = function (params) {
      return self._send(domainName + '.' + command.name, params);
    };
    var domainFn = sendFn;
    if (command.name === 'start') {
      domainFn = this._wrapStartFn('started', sendFn);
    } else if (command.name === 'enable') {
      domainFn = this._wrapStartFn('enabled', sendFn);
    } else if (command.name === 'stop') {
      domainFn = this._wrapStopFn('started', sendFn);
    } else if (command.name === 'disable') {
      domainFn = this._wrapStopFn('enabled', sendFn);
    }

    self[domainName][command.name] = domainFn;
    var help = this._prepareHelp('command', command, ['description', 'parameters']);
    self[domainName][command.name].help = help;
  },
  _wrapStartFn: function(property, sendFn) {
    var self = this;
    return function(params) {
      self._domainState[property] = 'pending';
      return sendFn(params).then(function(message) {
        self._domainState[property] = true;
      }, function() {
        self._domainState[property] = false;
      });
    }
  },
  _wrapStopFn: function(property, sendFn) {
    var self = this;
    return function(params) {
      self._domainState[property] = false;
      return sendFn(params);
    };
  },
  _addEvent: function(domainName, event) {
    var self = this;
    self[domainName][event.name] = function (handler) {
      self.on(domainName + '.' + event.name, handler);
    };
    var help = this._prepareHelp('event', event, ['parameters']);
    self[domainName][event.name].help = help;
  },
  _addCommandShorthands: function(protocol) {
    var self = this;
    protocol.domains.forEach(function(domain) {
      var domainName = domain.domain;
      self[domainName] = {};
      // add commands
      var commands = domain.commands;
      if (commands) {
        commands.forEach(function(command) {
          self._addCommand(domainName, command);
        });
      }
      // add events
      var events = domain.events;
      if (events) {
        events.forEach(function(event) {
          self._addEvent(domainName, event);
        });
      }
      // add types
      var types = domain.types;
      if (types) {
        types.forEach(function(type) {
          self[domainName][type.id] = type;
        });
      }
    });
  }
}, TabConnection.prototype);


function merge(obj, target) {
  for (var prop in obj) {
    target[prop] = obj[prop];
  }
}

module.exports = Chrome;
