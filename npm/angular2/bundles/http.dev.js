"format register";
System.register("angular2/src/http/interfaces", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var ConnectionBackend = (function() {
    function ConnectionBackend() {}
    return ConnectionBackend;
  }());
  exports.ConnectionBackend = ConnectionBackend;
  var Connection = (function() {
    function Connection() {}
    return Connection;
  }());
  exports.Connection = Connection;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/http/headers", ["angular2/src/facade/lang", "angular2/src/facade/exceptions", "angular2/src/facade/collection"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var lang_1 = require("angular2/src/facade/lang");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var collection_1 = require("angular2/src/facade/collection");
  var Headers = (function() {
    function Headers(headers) {
      var _this = this;
      if (headers instanceof Headers) {
        this._headersMap = headers._headersMap;
        return ;
      }
      this._headersMap = new collection_1.Map();
      if (lang_1.isBlank(headers)) {
        return ;
      }
      collection_1.StringMapWrapper.forEach(headers, function(v, k) {
        _this._headersMap.set(k, collection_1.isListLikeIterable(v) ? v : [v]);
      });
    }
    Headers.fromResponseHeaderString = function(headersString) {
      return headersString.trim().split('\n').map(function(val) {
        return val.split(':');
      }).map(function(_a) {
        var key = _a[0],
            parts = _a.slice(1);
        return ([key.trim(), parts.join(':').trim()]);
      }).reduce(function(headers, _a) {
        var key = _a[0],
            value = _a[1];
        return !headers.set(key, value) && headers;
      }, new Headers());
    };
    Headers.prototype.append = function(name, value) {
      var mapName = this._headersMap.get(name);
      var list = collection_1.isListLikeIterable(mapName) ? mapName : [];
      list.push(value);
      this._headersMap.set(name, list);
    };
    Headers.prototype.delete = function(name) {
      this._headersMap.delete(name);
    };
    Headers.prototype.forEach = function(fn) {
      this._headersMap.forEach(fn);
    };
    Headers.prototype.get = function(header) {
      return collection_1.ListWrapper.first(this._headersMap.get(header));
    };
    Headers.prototype.has = function(header) {
      return this._headersMap.has(header);
    };
    Headers.prototype.keys = function() {
      return collection_1.MapWrapper.keys(this._headersMap);
    };
    Headers.prototype.set = function(header, value) {
      var list = [];
      if (collection_1.isListLikeIterable(value)) {
        var pushValue = value.join(',');
        list.push(pushValue);
      } else {
        list.push(value);
      }
      this._headersMap.set(header, list);
    };
    Headers.prototype.values = function() {
      return collection_1.MapWrapper.values(this._headersMap);
    };
    Headers.prototype.toJSON = function() {
      var serializableHeaders = {};
      this._headersMap.forEach(function(values, name) {
        var list = [];
        collection_1.iterateListLike(values, function(val) {
          return list = collection_1.ListWrapper.concat(list, val.split(','));
        });
        serializableHeaders[name] = list;
      });
      return serializableHeaders;
    };
    Headers.prototype.getAll = function(header) {
      var headers = this._headersMap.get(header);
      return collection_1.isListLikeIterable(headers) ? headers : [];
    };
    Headers.prototype.entries = function() {
      throw new exceptions_1.BaseException('"entries" method is not implemented on Headers class');
    };
    return Headers;
  }());
  exports.Headers = Headers;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/http/enums", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  (function(RequestMethod) {
    RequestMethod[RequestMethod["Get"] = 0] = "Get";
    RequestMethod[RequestMethod["Post"] = 1] = "Post";
    RequestMethod[RequestMethod["Put"] = 2] = "Put";
    RequestMethod[RequestMethod["Delete"] = 3] = "Delete";
    RequestMethod[RequestMethod["Options"] = 4] = "Options";
    RequestMethod[RequestMethod["Head"] = 5] = "Head";
    RequestMethod[RequestMethod["Patch"] = 6] = "Patch";
  })(exports.RequestMethod || (exports.RequestMethod = {}));
  var RequestMethod = exports.RequestMethod;
  (function(ReadyState) {
    ReadyState[ReadyState["Unsent"] = 0] = "Unsent";
    ReadyState[ReadyState["Open"] = 1] = "Open";
    ReadyState[ReadyState["HeadersReceived"] = 2] = "HeadersReceived";
    ReadyState[ReadyState["Loading"] = 3] = "Loading";
    ReadyState[ReadyState["Done"] = 4] = "Done";
    ReadyState[ReadyState["Cancelled"] = 5] = "Cancelled";
  })(exports.ReadyState || (exports.ReadyState = {}));
  var ReadyState = exports.ReadyState;
  (function(ResponseType) {
    ResponseType[ResponseType["Basic"] = 0] = "Basic";
    ResponseType[ResponseType["Cors"] = 1] = "Cors";
    ResponseType[ResponseType["Default"] = 2] = "Default";
    ResponseType[ResponseType["Error"] = 3] = "Error";
    ResponseType[ResponseType["Opaque"] = 4] = "Opaque";
  })(exports.ResponseType || (exports.ResponseType = {}));
  var ResponseType = exports.ResponseType;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/http/url_search_params", ["angular2/src/facade/lang", "angular2/src/facade/collection"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var lang_1 = require("angular2/src/facade/lang");
  var collection_1 = require("angular2/src/facade/collection");
  function paramParser(rawParams) {
    if (rawParams === void 0) {
      rawParams = '';
    }
    var map = new collection_1.Map();
    if (rawParams.length > 0) {
      var params = rawParams.split('&');
      params.forEach(function(param) {
        var split = param.split('=');
        var key = split[0];
        var val = split[1];
        var list = lang_1.isPresent(map.get(key)) ? map.get(key) : [];
        list.push(val);
        map.set(key, list);
      });
    }
    return map;
  }
  var URLSearchParams = (function() {
    function URLSearchParams(rawParams) {
      if (rawParams === void 0) {
        rawParams = '';
      }
      this.rawParams = rawParams;
      this.paramsMap = paramParser(rawParams);
    }
    URLSearchParams.prototype.clone = function() {
      var clone = new URLSearchParams();
      clone.appendAll(this);
      return clone;
    };
    URLSearchParams.prototype.has = function(param) {
      return this.paramsMap.has(param);
    };
    URLSearchParams.prototype.get = function(param) {
      var storedParam = this.paramsMap.get(param);
      if (collection_1.isListLikeIterable(storedParam)) {
        return collection_1.ListWrapper.first(storedParam);
      } else {
        return null;
      }
    };
    URLSearchParams.prototype.getAll = function(param) {
      var mapParam = this.paramsMap.get(param);
      return lang_1.isPresent(mapParam) ? mapParam : [];
    };
    URLSearchParams.prototype.set = function(param, val) {
      var mapParam = this.paramsMap.get(param);
      var list = lang_1.isPresent(mapParam) ? mapParam : [];
      collection_1.ListWrapper.clear(list);
      list.push(val);
      this.paramsMap.set(param, list);
    };
    URLSearchParams.prototype.setAll = function(searchParams) {
      var _this = this;
      searchParams.paramsMap.forEach(function(value, param) {
        var mapParam = _this.paramsMap.get(param);
        var list = lang_1.isPresent(mapParam) ? mapParam : [];
        collection_1.ListWrapper.clear(list);
        list.push(value[0]);
        _this.paramsMap.set(param, list);
      });
    };
    URLSearchParams.prototype.append = function(param, val) {
      var mapParam = this.paramsMap.get(param);
      var list = lang_1.isPresent(mapParam) ? mapParam : [];
      list.push(val);
      this.paramsMap.set(param, list);
    };
    URLSearchParams.prototype.appendAll = function(searchParams) {
      var _this = this;
      searchParams.paramsMap.forEach(function(value, param) {
        var mapParam = _this.paramsMap.get(param);
        var list = lang_1.isPresent(mapParam) ? mapParam : [];
        for (var i = 0; i < value.length; ++i) {
          list.push(value[i]);
        }
        _this.paramsMap.set(param, list);
      });
    };
    URLSearchParams.prototype.replaceAll = function(searchParams) {
      var _this = this;
      searchParams.paramsMap.forEach(function(value, param) {
        var mapParam = _this.paramsMap.get(param);
        var list = lang_1.isPresent(mapParam) ? mapParam : [];
        collection_1.ListWrapper.clear(list);
        for (var i = 0; i < value.length; ++i) {
          list.push(value[i]);
        }
        _this.paramsMap.set(param, list);
      });
    };
    URLSearchParams.prototype.toString = function() {
      var paramsList = [];
      this.paramsMap.forEach(function(values, k) {
        values.forEach(function(v) {
          return paramsList.push(k + '=' + v);
        });
      });
      return paramsList.join('&');
    };
    URLSearchParams.prototype.delete = function(param) {
      this.paramsMap.delete(param);
    };
    return URLSearchParams;
  }());
  exports.URLSearchParams = URLSearchParams;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/http/static_response", ["angular2/src/facade/lang", "angular2/src/facade/exceptions", "angular2/src/http/http_utils"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var lang_1 = require("angular2/src/facade/lang");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var http_utils_1 = require("angular2/src/http/http_utils");
  var Response = (function() {
    function Response(responseOptions) {
      this._body = responseOptions.body;
      this.status = responseOptions.status;
      this.ok = (this.status >= 200 && this.status <= 299);
      this.statusText = responseOptions.statusText;
      this.headers = responseOptions.headers;
      this.type = responseOptions.type;
      this.url = responseOptions.url;
    }
    Response.prototype.blob = function() {
      throw new exceptions_1.BaseException('"blob()" method not implemented on Response superclass');
    };
    Response.prototype.json = function() {
      var jsonResponse;
      if (http_utils_1.isJsObject(this._body)) {
        jsonResponse = this._body;
      } else if (lang_1.isString(this._body)) {
        jsonResponse = lang_1.Json.parse(this._body);
      }
      return jsonResponse;
    };
    Response.prototype.text = function() {
      return this._body.toString();
    };
    Response.prototype.arrayBuffer = function() {
      throw new exceptions_1.BaseException('"arrayBuffer()" method not implemented on Response superclass');
    };
    return Response;
  }());
  exports.Response = Response;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/http/base_response_options", ["angular2/core", "angular2/src/facade/lang", "angular2/src/http/headers", "angular2/src/http/enums"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var __extends = (this && this.__extends) || function(d, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d[p] = b[p];
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if (d = decorators[i])
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var __metadata = (this && this.__metadata) || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
  var core_1 = require("angular2/core");
  var lang_1 = require("angular2/src/facade/lang");
  var headers_1 = require("angular2/src/http/headers");
  var enums_1 = require("angular2/src/http/enums");
  var ResponseOptions = (function() {
    function ResponseOptions(_a) {
      var _b = _a === void 0 ? {} : _a,
          body = _b.body,
          status = _b.status,
          headers = _b.headers,
          statusText = _b.statusText,
          type = _b.type,
          url = _b.url;
      this.body = lang_1.isPresent(body) ? body : null;
      this.status = lang_1.isPresent(status) ? status : null;
      this.headers = lang_1.isPresent(headers) ? headers : null;
      this.statusText = lang_1.isPresent(statusText) ? statusText : null;
      this.type = lang_1.isPresent(type) ? type : null;
      this.url = lang_1.isPresent(url) ? url : null;
    }
    ResponseOptions.prototype.merge = function(options) {
      return new ResponseOptions({
        body: lang_1.isPresent(options) && lang_1.isPresent(options.body) ? options.body : this.body,
        status: lang_1.isPresent(options) && lang_1.isPresent(options.status) ? options.status : this.status,
        headers: lang_1.isPresent(options) && lang_1.isPresent(options.headers) ? options.headers : this.headers,
        statusText: lang_1.isPresent(options) && lang_1.isPresent(options.statusText) ? options.statusText : this.statusText,
        type: lang_1.isPresent(options) && lang_1.isPresent(options.type) ? options.type : this.type,
        url: lang_1.isPresent(options) && lang_1.isPresent(options.url) ? options.url : this.url
      });
    };
    return ResponseOptions;
  }());
  exports.ResponseOptions = ResponseOptions;
  var BaseResponseOptions = (function(_super) {
    __extends(BaseResponseOptions, _super);
    function BaseResponseOptions() {
      _super.call(this, {
        status: 200,
        statusText: 'Ok',
        type: enums_1.ResponseType.Default,
        headers: new headers_1.Headers()
      });
    }
    BaseResponseOptions = __decorate([core_1.Injectable(), __metadata('design:paramtypes', [])], BaseResponseOptions);
    return BaseResponseOptions;
  }(ResponseOptions));
  exports.BaseResponseOptions = BaseResponseOptions;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/http/backends/browser_xhr", ["angular2/core"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if (d = decorators[i])
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var __metadata = (this && this.__metadata) || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
  var core_1 = require("angular2/core");
  var BrowserXhr = (function() {
    function BrowserXhr() {}
    BrowserXhr.prototype.build = function() {
      return (new XMLHttpRequest());
    };
    BrowserXhr = __decorate([core_1.Injectable(), __metadata('design:paramtypes', [])], BrowserXhr);
    return BrowserXhr;
  }());
  exports.BrowserXhr = BrowserXhr;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/http/backends/browser_jsonp", ["angular2/core", "angular2/src/facade/lang"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if (d = decorators[i])
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var __metadata = (this && this.__metadata) || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
  var core_1 = require("angular2/core");
  var lang_1 = require("angular2/src/facade/lang");
  var _nextRequestId = 0;
  exports.JSONP_HOME = '__ng_jsonp__';
  var _jsonpConnections = null;
  function _getJsonpConnections() {
    if (_jsonpConnections === null) {
      _jsonpConnections = lang_1.global[exports.JSONP_HOME] = {};
    }
    return _jsonpConnections;
  }
  var BrowserJsonp = (function() {
    function BrowserJsonp() {}
    BrowserJsonp.prototype.build = function(url) {
      var node = document.createElement('script');
      node.src = url;
      return node;
    };
    BrowserJsonp.prototype.nextRequestID = function() {
      return "__req" + _nextRequestId++;
    };
    BrowserJsonp.prototype.requestCallback = function(id) {
      return exports.JSONP_HOME + "." + id + ".finished";
    };
    BrowserJsonp.prototype.exposeConnection = function(id, connection) {
      var connections = _getJsonpConnections();
      connections[id] = connection;
    };
    BrowserJsonp.prototype.removeConnection = function(id) {
      var connections = _getJsonpConnections();
      connections[id] = null;
    };
    BrowserJsonp.prototype.send = function(node) {
      document.body.appendChild((node));
    };
    BrowserJsonp.prototype.cleanup = function(node) {
      if (node.parentNode) {
        node.parentNode.removeChild((node));
      }
    };
    BrowserJsonp = __decorate([core_1.Injectable(), __metadata('design:paramtypes', [])], BrowserJsonp);
    return BrowserJsonp;
  }());
  exports.BrowserJsonp = BrowserJsonp;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/http/http_utils", ["angular2/src/facade/lang", "angular2/src/http/enums", "angular2/src/facade/exceptions", "angular2/src/facade/lang"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var lang_1 = require("angular2/src/facade/lang");
  var enums_1 = require("angular2/src/http/enums");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  function normalizeMethodName(method) {
    if (lang_1.isString(method)) {
      var originalMethod = method;
      method = method.replace(/(\w)(\w*)/g, function(g0, g1, g2) {
        return g1.toUpperCase() + g2.toLowerCase();
      });
      method = enums_1.RequestMethod[method];
      if (typeof method !== 'number')
        throw exceptions_1.makeTypeError("Invalid request method. The method \"" + originalMethod + "\" is not supported.");
    }
    return method;
  }
  exports.normalizeMethodName = normalizeMethodName;
  exports.isSuccess = function(status) {
    return (status >= 200 && status < 300);
  };
  function getResponseURL(xhr) {
    if ('responseURL' in xhr) {
      return xhr.responseURL;
    }
    if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
      return xhr.getResponseHeader('X-Request-URL');
    }
    return ;
  }
  exports.getResponseURL = getResponseURL;
  var lang_2 = require("angular2/src/facade/lang");
  exports.isJsObject = lang_2.isJsObject;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/http/base_request_options", ["angular2/src/facade/lang", "angular2/src/http/headers", "angular2/src/http/enums", "angular2/core", "angular2/src/http/url_search_params", "angular2/src/http/http_utils"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var __extends = (this && this.__extends) || function(d, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d[p] = b[p];
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if (d = decorators[i])
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var __metadata = (this && this.__metadata) || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
  var lang_1 = require("angular2/src/facade/lang");
  var headers_1 = require("angular2/src/http/headers");
  var enums_1 = require("angular2/src/http/enums");
  var core_1 = require("angular2/core");
  var url_search_params_1 = require("angular2/src/http/url_search_params");
  var http_utils_1 = require("angular2/src/http/http_utils");
  var RequestOptions = (function() {
    function RequestOptions(_a) {
      var _b = _a === void 0 ? {} : _a,
          method = _b.method,
          headers = _b.headers,
          body = _b.body,
          url = _b.url,
          search = _b.search;
      this.method = lang_1.isPresent(method) ? http_utils_1.normalizeMethodName(method) : null;
      this.headers = lang_1.isPresent(headers) ? headers : null;
      this.body = lang_1.isPresent(body) ? body : null;
      this.url = lang_1.isPresent(url) ? url : null;
      this.search = lang_1.isPresent(search) ? (lang_1.isString(search) ? new url_search_params_1.URLSearchParams((search)) : (search)) : null;
    }
    RequestOptions.prototype.merge = function(options) {
      return new RequestOptions({
        method: lang_1.isPresent(options) && lang_1.isPresent(options.method) ? options.method : this.method,
        headers: lang_1.isPresent(options) && lang_1.isPresent(options.headers) ? options.headers : this.headers,
        body: lang_1.isPresent(options) && lang_1.isPresent(options.body) ? options.body : this.body,
        url: lang_1.isPresent(options) && lang_1.isPresent(options.url) ? options.url : this.url,
        search: lang_1.isPresent(options) && lang_1.isPresent(options.search) ? (lang_1.isString(options.search) ? new url_search_params_1.URLSearchParams((options.search)) : (options.search).clone()) : this.search
      });
    };
    return RequestOptions;
  }());
  exports.RequestOptions = RequestOptions;
  var BaseRequestOptions = (function(_super) {
    __extends(BaseRequestOptions, _super);
    function BaseRequestOptions() {
      _super.call(this, {
        method: enums_1.RequestMethod.Get,
        headers: new headers_1.Headers()
      });
    }
    BaseRequestOptions = __decorate([core_1.Injectable(), __metadata('design:paramtypes', [])], BaseRequestOptions);
    return BaseRequestOptions;
  }(RequestOptions));
  exports.BaseRequestOptions = BaseRequestOptions;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/http/backends/xhr_backend", ["angular2/src/http/enums", "angular2/src/http/static_response", "angular2/src/http/headers", "angular2/src/http/base_response_options", "angular2/core", "angular2/src/http/backends/browser_xhr", "angular2/src/facade/lang", "rxjs/Observable", "angular2/src/http/http_utils"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if (d = decorators[i])
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var __metadata = (this && this.__metadata) || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
  var enums_1 = require("angular2/src/http/enums");
  var static_response_1 = require("angular2/src/http/static_response");
  var headers_1 = require("angular2/src/http/headers");
  var base_response_options_1 = require("angular2/src/http/base_response_options");
  var core_1 = require("angular2/core");
  var browser_xhr_1 = require("angular2/src/http/backends/browser_xhr");
  var lang_1 = require("angular2/src/facade/lang");
  var Observable_1 = require("rxjs/Observable");
  var http_utils_1 = require("angular2/src/http/http_utils");
  var XHRConnection = (function() {
    function XHRConnection(req, browserXHR, baseResponseOptions) {
      var _this = this;
      this.request = req;
      this.response = new Observable_1.Observable(function(responseObserver) {
        var _xhr = browserXHR.build();
        _xhr.open(enums_1.RequestMethod[req.method].toUpperCase(), req.url);
        var onLoad = function() {
          var body = lang_1.isPresent(_xhr.response) ? _xhr.response : _xhr.responseText;
          var headers = headers_1.Headers.fromResponseHeaderString(_xhr.getAllResponseHeaders());
          var url = http_utils_1.getResponseURL(_xhr);
          var status = _xhr.status === 1223 ? 204 : _xhr.status;
          if (status === 0) {
            status = body ? 200 : 0;
          }
          var responseOptions = new base_response_options_1.ResponseOptions({
            body: body,
            status: status,
            headers: headers,
            url: url
          });
          if (lang_1.isPresent(baseResponseOptions)) {
            responseOptions = baseResponseOptions.merge(responseOptions);
          }
          var response = new static_response_1.Response(responseOptions);
          if (http_utils_1.isSuccess(status)) {
            responseObserver.next(response);
            responseObserver.complete();
            return ;
          }
          responseObserver.error(response);
        };
        var onError = function(err) {
          var responseOptions = new base_response_options_1.ResponseOptions({
            body: err,
            type: enums_1.ResponseType.Error
          });
          if (lang_1.isPresent(baseResponseOptions)) {
            responseOptions = baseResponseOptions.merge(responseOptions);
          }
          responseObserver.error(new static_response_1.Response(responseOptions));
        };
        if (lang_1.isPresent(req.headers)) {
          req.headers.forEach(function(values, name) {
            return _xhr.setRequestHeader(name, values.join(','));
          });
        }
        _xhr.addEventListener('load', onLoad);
        _xhr.addEventListener('error', onError);
        _xhr.send(_this.request.text());
        return function() {
          _xhr.removeEventListener('load', onLoad);
          _xhr.removeEventListener('error', onError);
          _xhr.abort();
        };
      });
    }
    return XHRConnection;
  }());
  exports.XHRConnection = XHRConnection;
  var XHRBackend = (function() {
    function XHRBackend(_browserXHR, _baseResponseOptions) {
      this._browserXHR = _browserXHR;
      this._baseResponseOptions = _baseResponseOptions;
    }
    XHRBackend.prototype.createConnection = function(request) {
      return new XHRConnection(request, this._browserXHR, this._baseResponseOptions);
    };
    XHRBackend = __decorate([core_1.Injectable(), __metadata('design:paramtypes', [browser_xhr_1.BrowserXhr, base_response_options_1.ResponseOptions])], XHRBackend);
    return XHRBackend;
  }());
  exports.XHRBackend = XHRBackend;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/http/backends/jsonp_backend", ["angular2/src/http/interfaces", "angular2/src/http/enums", "angular2/src/http/static_response", "angular2/src/http/base_response_options", "angular2/core", "angular2/src/http/backends/browser_jsonp", "angular2/src/facade/exceptions", "angular2/src/facade/lang", "rxjs/Observable"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var __extends = (this && this.__extends) || function(d, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d[p] = b[p];
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if (d = decorators[i])
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var __metadata = (this && this.__metadata) || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
  var interfaces_1 = require("angular2/src/http/interfaces");
  var enums_1 = require("angular2/src/http/enums");
  var static_response_1 = require("angular2/src/http/static_response");
  var base_response_options_1 = require("angular2/src/http/base_response_options");
  var core_1 = require("angular2/core");
  var browser_jsonp_1 = require("angular2/src/http/backends/browser_jsonp");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var lang_1 = require("angular2/src/facade/lang");
  var Observable_1 = require("rxjs/Observable");
  var JSONP_ERR_NO_CALLBACK = 'JSONP injected script did not invoke callback.';
  var JSONP_ERR_WRONG_METHOD = 'JSONP requests must use GET request method.';
  var JSONPConnection = (function() {
    function JSONPConnection() {}
    return JSONPConnection;
  }());
  exports.JSONPConnection = JSONPConnection;
  var JSONPConnection_ = (function(_super) {
    __extends(JSONPConnection_, _super);
    function JSONPConnection_(req, _dom, baseResponseOptions) {
      var _this = this;
      _super.call(this);
      this._dom = _dom;
      this.baseResponseOptions = baseResponseOptions;
      this._finished = false;
      if (req.method !== enums_1.RequestMethod.Get) {
        throw exceptions_1.makeTypeError(JSONP_ERR_WRONG_METHOD);
      }
      this.request = req;
      this.response = new Observable_1.Observable(function(responseObserver) {
        _this.readyState = enums_1.ReadyState.Loading;
        var id = _this._id = _dom.nextRequestID();
        _dom.exposeConnection(id, _this);
        var callback = _dom.requestCallback(_this._id);
        var url = req.url;
        if (url.indexOf('=JSONP_CALLBACK&') > -1) {
          url = lang_1.StringWrapper.replace(url, '=JSONP_CALLBACK&', "=" + callback + "&");
        } else if (url.lastIndexOf('=JSONP_CALLBACK') === url.length - '=JSONP_CALLBACK'.length) {
          url = url.substring(0, url.length - '=JSONP_CALLBACK'.length) + ("=" + callback);
        }
        var script = _this._script = _dom.build(url);
        var onLoad = function(event) {
          if (_this.readyState === enums_1.ReadyState.Cancelled)
            return ;
          _this.readyState = enums_1.ReadyState.Done;
          _dom.cleanup(script);
          if (!_this._finished) {
            var responseOptions_1 = new base_response_options_1.ResponseOptions({
              body: JSONP_ERR_NO_CALLBACK,
              type: enums_1.ResponseType.Error,
              url: url
            });
            if (lang_1.isPresent(baseResponseOptions)) {
              responseOptions_1 = baseResponseOptions.merge(responseOptions_1);
            }
            responseObserver.error(new static_response_1.Response(responseOptions_1));
            return ;
          }
          var responseOptions = new base_response_options_1.ResponseOptions({
            body: _this._responseData,
            url: url
          });
          if (lang_1.isPresent(_this.baseResponseOptions)) {
            responseOptions = _this.baseResponseOptions.merge(responseOptions);
          }
          responseObserver.next(new static_response_1.Response(responseOptions));
          responseObserver.complete();
        };
        var onError = function(error) {
          if (_this.readyState === enums_1.ReadyState.Cancelled)
            return ;
          _this.readyState = enums_1.ReadyState.Done;
          _dom.cleanup(script);
          var responseOptions = new base_response_options_1.ResponseOptions({
            body: error.message,
            type: enums_1.ResponseType.Error
          });
          if (lang_1.isPresent(baseResponseOptions)) {
            responseOptions = baseResponseOptions.merge(responseOptions);
          }
          responseObserver.error(new static_response_1.Response(responseOptions));
        };
        script.addEventListener('load', onLoad);
        script.addEventListener('error', onError);
        _dom.send(script);
        return function() {
          _this.readyState = enums_1.ReadyState.Cancelled;
          script.removeEventListener('load', onLoad);
          script.removeEventListener('error', onError);
          if (lang_1.isPresent(script)) {
            _this._dom.cleanup(script);
          }
        };
      });
    }
    JSONPConnection_.prototype.finished = function(data) {
      this._finished = true;
      this._dom.removeConnection(this._id);
      if (this.readyState === enums_1.ReadyState.Cancelled)
        return ;
      this._responseData = data;
    };
    return JSONPConnection_;
  }(JSONPConnection));
  exports.JSONPConnection_ = JSONPConnection_;
  var JSONPBackend = (function(_super) {
    __extends(JSONPBackend, _super);
    function JSONPBackend() {
      _super.apply(this, arguments);
    }
    return JSONPBackend;
  }(interfaces_1.ConnectionBackend));
  exports.JSONPBackend = JSONPBackend;
  var JSONPBackend_ = (function(_super) {
    __extends(JSONPBackend_, _super);
    function JSONPBackend_(_browserJSONP, _baseResponseOptions) {
      _super.call(this);
      this._browserJSONP = _browserJSONP;
      this._baseResponseOptions = _baseResponseOptions;
    }
    JSONPBackend_.prototype.createConnection = function(request) {
      return new JSONPConnection_(request, this._browserJSONP, this._baseResponseOptions);
    };
    JSONPBackend_ = __decorate([core_1.Injectable(), __metadata('design:paramtypes', [browser_jsonp_1.BrowserJsonp, base_response_options_1.ResponseOptions])], JSONPBackend_);
    return JSONPBackend_;
  }(JSONPBackend));
  exports.JSONPBackend_ = JSONPBackend_;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/http/static_request", ["angular2/src/http/headers", "angular2/src/http/http_utils", "angular2/src/facade/lang"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var headers_1 = require("angular2/src/http/headers");
  var http_utils_1 = require("angular2/src/http/http_utils");
  var lang_1 = require("angular2/src/facade/lang");
  var Request = (function() {
    function Request(requestOptions) {
      var url = requestOptions.url;
      this.url = requestOptions.url;
      if (lang_1.isPresent(requestOptions.search)) {
        var search = requestOptions.search.toString();
        if (search.length > 0) {
          var prefix = '?';
          if (lang_1.StringWrapper.contains(this.url, '?')) {
            prefix = (this.url[this.url.length - 1] == '&') ? '' : '&';
          }
          this.url = url + prefix + search;
        }
      }
      this._body = requestOptions.body;
      this.method = http_utils_1.normalizeMethodName(requestOptions.method);
      this.headers = new headers_1.Headers(requestOptions.headers);
    }
    Request.prototype.text = function() {
      return lang_1.isPresent(this._body) ? this._body.toString() : '';
    };
    return Request;
  }());
  exports.Request = Request;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/http/http", ["angular2/src/facade/lang", "angular2/src/facade/exceptions", "angular2/core", "angular2/src/http/interfaces", "angular2/src/http/static_request", "angular2/src/http/base_request_options", "angular2/src/http/enums"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var __extends = (this && this.__extends) || function(d, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d[p] = b[p];
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if (d = decorators[i])
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var __metadata = (this && this.__metadata) || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
  var lang_1 = require("angular2/src/facade/lang");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var core_1 = require("angular2/core");
  var interfaces_1 = require("angular2/src/http/interfaces");
  var static_request_1 = require("angular2/src/http/static_request");
  var base_request_options_1 = require("angular2/src/http/base_request_options");
  var enums_1 = require("angular2/src/http/enums");
  function httpRequest(backend, request) {
    return backend.createConnection(request).response;
  }
  function mergeOptions(defaultOpts, providedOpts, method, url) {
    var newOptions = defaultOpts;
    if (lang_1.isPresent(providedOpts)) {
      return newOptions.merge(new base_request_options_1.RequestOptions({
        method: providedOpts.method || method,
        url: providedOpts.url || url,
        search: providedOpts.search,
        headers: providedOpts.headers,
        body: providedOpts.body
      }));
    }
    if (lang_1.isPresent(method)) {
      return newOptions.merge(new base_request_options_1.RequestOptions({
        method: method,
        url: url
      }));
    } else {
      return newOptions.merge(new base_request_options_1.RequestOptions({url: url}));
    }
  }
  var Http = (function() {
    function Http(_backend, _defaultOptions) {
      this._backend = _backend;
      this._defaultOptions = _defaultOptions;
    }
    Http.prototype.request = function(url, options) {
      var responseObservable;
      if (lang_1.isString(url)) {
        responseObservable = httpRequest(this._backend, new static_request_1.Request(mergeOptions(this._defaultOptions, options, enums_1.RequestMethod.Get, url)));
      } else if (url instanceof static_request_1.Request) {
        responseObservable = httpRequest(this._backend, url);
      } else {
        throw exceptions_1.makeTypeError('First argument must be a url string or Request instance.');
      }
      return responseObservable;
    };
    Http.prototype.get = function(url, options) {
      return httpRequest(this._backend, new static_request_1.Request(mergeOptions(this._defaultOptions, options, enums_1.RequestMethod.Get, url)));
    };
    Http.prototype.post = function(url, body, options) {
      return httpRequest(this._backend, new static_request_1.Request(mergeOptions(this._defaultOptions.merge(new base_request_options_1.RequestOptions({body: body})), options, enums_1.RequestMethod.Post, url)));
    };
    Http.prototype.put = function(url, body, options) {
      return httpRequest(this._backend, new static_request_1.Request(mergeOptions(this._defaultOptions.merge(new base_request_options_1.RequestOptions({body: body})), options, enums_1.RequestMethod.Put, url)));
    };
    Http.prototype.delete = function(url, options) {
      return httpRequest(this._backend, new static_request_1.Request(mergeOptions(this._defaultOptions, options, enums_1.RequestMethod.Delete, url)));
    };
    Http.prototype.patch = function(url, body, options) {
      return httpRequest(this._backend, new static_request_1.Request(mergeOptions(this._defaultOptions.merge(new base_request_options_1.RequestOptions({body: body})), options, enums_1.RequestMethod.Patch, url)));
    };
    Http.prototype.head = function(url, options) {
      return httpRequest(this._backend, new static_request_1.Request(mergeOptions(this._defaultOptions, options, enums_1.RequestMethod.Head, url)));
    };
    Http = __decorate([core_1.Injectable(), __metadata('design:paramtypes', [interfaces_1.ConnectionBackend, base_request_options_1.RequestOptions])], Http);
    return Http;
  }());
  exports.Http = Http;
  var Jsonp = (function(_super) {
    __extends(Jsonp, _super);
    function Jsonp(backend, defaultOptions) {
      _super.call(this, backend, defaultOptions);
    }
    Jsonp.prototype.request = function(url, options) {
      var responseObservable;
      if (lang_1.isString(url)) {
        url = new static_request_1.Request(mergeOptions(this._defaultOptions, options, enums_1.RequestMethod.Get, url));
      }
      if (url instanceof static_request_1.Request) {
        if (url.method !== enums_1.RequestMethod.Get) {
          exceptions_1.makeTypeError('JSONP requests must use GET request method.');
        }
        responseObservable = httpRequest(this._backend, url);
      } else {
        throw exceptions_1.makeTypeError('First argument must be a url string or Request instance.');
      }
      return responseObservable;
    };
    Jsonp = __decorate([core_1.Injectable(), __metadata('design:paramtypes', [interfaces_1.ConnectionBackend, base_request_options_1.RequestOptions])], Jsonp);
    return Jsonp;
  }(Http));
  exports.Jsonp = Jsonp;
  global.define = __define;
  return module.exports;
});

System.register("angular2/http", ["angular2/core", "angular2/src/http/http", "angular2/src/http/backends/xhr_backend", "angular2/src/http/backends/jsonp_backend", "angular2/src/http/backends/browser_xhr", "angular2/src/http/backends/browser_jsonp", "angular2/src/http/base_request_options", "angular2/src/http/base_response_options", "angular2/src/http/static_request", "angular2/src/http/static_response", "angular2/src/http/interfaces", "angular2/src/http/backends/browser_xhr", "angular2/src/http/base_request_options", "angular2/src/http/base_response_options", "angular2/src/http/backends/xhr_backend", "angular2/src/http/backends/jsonp_backend", "angular2/src/http/http", "angular2/src/http/headers", "angular2/src/http/enums", "angular2/src/http/url_search_params"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var core_1 = require("angular2/core");
  var http_1 = require("angular2/src/http/http");
  var xhr_backend_1 = require("angular2/src/http/backends/xhr_backend");
  var jsonp_backend_1 = require("angular2/src/http/backends/jsonp_backend");
  var browser_xhr_1 = require("angular2/src/http/backends/browser_xhr");
  var browser_jsonp_1 = require("angular2/src/http/backends/browser_jsonp");
  var base_request_options_1 = require("angular2/src/http/base_request_options");
  var base_response_options_1 = require("angular2/src/http/base_response_options");
  var static_request_1 = require("angular2/src/http/static_request");
  exports.Request = static_request_1.Request;
  var static_response_1 = require("angular2/src/http/static_response");
  exports.Response = static_response_1.Response;
  var interfaces_1 = require("angular2/src/http/interfaces");
  exports.Connection = interfaces_1.Connection;
  exports.ConnectionBackend = interfaces_1.ConnectionBackend;
  var browser_xhr_2 = require("angular2/src/http/backends/browser_xhr");
  exports.BrowserXhr = browser_xhr_2.BrowserXhr;
  var base_request_options_2 = require("angular2/src/http/base_request_options");
  exports.BaseRequestOptions = base_request_options_2.BaseRequestOptions;
  exports.RequestOptions = base_request_options_2.RequestOptions;
  var base_response_options_2 = require("angular2/src/http/base_response_options");
  exports.BaseResponseOptions = base_response_options_2.BaseResponseOptions;
  exports.ResponseOptions = base_response_options_2.ResponseOptions;
  var xhr_backend_2 = require("angular2/src/http/backends/xhr_backend");
  exports.XHRBackend = xhr_backend_2.XHRBackend;
  exports.XHRConnection = xhr_backend_2.XHRConnection;
  var jsonp_backend_2 = require("angular2/src/http/backends/jsonp_backend");
  exports.JSONPBackend = jsonp_backend_2.JSONPBackend;
  exports.JSONPConnection = jsonp_backend_2.JSONPConnection;
  var http_2 = require("angular2/src/http/http");
  exports.Http = http_2.Http;
  exports.Jsonp = http_2.Jsonp;
  var headers_1 = require("angular2/src/http/headers");
  exports.Headers = headers_1.Headers;
  var enums_1 = require("angular2/src/http/enums");
  exports.ResponseType = enums_1.ResponseType;
  exports.ReadyState = enums_1.ReadyState;
  exports.RequestMethod = enums_1.RequestMethod;
  var url_search_params_1 = require("angular2/src/http/url_search_params");
  exports.URLSearchParams = url_search_params_1.URLSearchParams;
  exports.HTTP_PROVIDERS = [core_1.provide(http_1.Http, {
    useFactory: function(xhrBackend, requestOptions) {
      return new http_1.Http(xhrBackend, requestOptions);
    },
    deps: [xhr_backend_1.XHRBackend, base_request_options_1.RequestOptions]
  }), browser_xhr_1.BrowserXhr, core_1.provide(base_request_options_1.RequestOptions, {useClass: base_request_options_1.BaseRequestOptions}), core_1.provide(base_response_options_1.ResponseOptions, {useClass: base_response_options_1.BaseResponseOptions}), xhr_backend_1.XHRBackend];
  exports.HTTP_BINDINGS = exports.HTTP_PROVIDERS;
  exports.JSONP_PROVIDERS = [core_1.provide(http_1.Jsonp, {
    useFactory: function(jsonpBackend, requestOptions) {
      return new http_1.Jsonp(jsonpBackend, requestOptions);
    },
    deps: [jsonp_backend_1.JSONPBackend, base_request_options_1.RequestOptions]
  }), browser_jsonp_1.BrowserJsonp, core_1.provide(base_request_options_1.RequestOptions, {useClass: base_request_options_1.BaseRequestOptions}), core_1.provide(base_response_options_1.ResponseOptions, {useClass: base_response_options_1.BaseResponseOptions}), core_1.provide(jsonp_backend_1.JSONPBackend, {useClass: jsonp_backend_1.JSONPBackend_})];
  exports.JSON_BINDINGS = exports.JSONP_PROVIDERS;
  global.define = __define;
  return module.exports;
});

//# sourceMappingURLDisabled=http.dev.js.map