/**
 * Angular dart users should use this library instead of 'dart:html'. 
 */


// TODO(juliemr): split into a separate file in src.
// TODO(juliemr): Also wrap RequestAnimationFrameCallback.

import 'dart:async';
import 'dart:js';
import 'dart:html' as darthtml;
import './src/core/zone/ng_zone_impl.dart' show ZoneExtensions;

export 'dart:html' hide RequestAnimationFrameCallback, HttpRequest;

// We cannot extend HttpRequest because it defines a factory constructor and no generative constructor.
// Instead, we implement its interface.
class HttpRequest implements darthtml.HttpRequest {
  darthtml.HttpRequest xhr;

  HttpRequest() {
    this.xhr = new darthtml.HttpRequest();
  }

  static void _zoneStartHttp() {
    ZoneExtensions.current.startHttpRequest();
  }

  static void _zoneEndHttp() {
    ZoneExtensions.current.endHttpRequest();
  }

  void send([data]) {
    _zoneStartHttp();
    this.xhr.send(data);

    this.xhr.onLoad.listen((e) {
      _zoneEndHttp();
    });
  }

  // Additionally, we wrap the static methods which create a new HttpRequest.

  static Future<String> getString(String url,
      {bool withCredentials, void onProgress(darthtml.ProgressEvent e)}) {
    _zoneStartHttp();
    return darthtml.HttpRequest.getString(url, withCredentials: withCredentials,
        onProgress: onProgress).then((String response) {
          _zoneEndHttp();
          return response;
        }).catchError((e) {
          _zoneEndHttp();
          throw e;  
        });
  }

  static Future<darthtml.HttpRequest> postFormData(String url, Map<String, String> data,
      {bool withCredentials, String responseType,
      Map<String, String> requestHeaders,
      void onProgress(darthtml.ProgressEvent e)}) {

    _zoneStartHttp();
    return darthtml.HttpRequest.postFormData(url, data, withCredentials: withCredentials,
      responseType: responseType, requestHeaders: requestHeaders, onProgress: onProgress)
        .then((darthtml.HttpRequest xhr) {
          _zoneEndHttp();
          return xhr;
        }).catchError((e) {
          _zoneEndHttp();
          throw e;  
        });
  }

  static Future<darthtml.HttpRequest> request(String url,
      {String method, bool withCredentials, String responseType,
      String mimeType, Map<String, String> requestHeaders, sendData,
      void onProgress(darthtml.ProgressEvent e)}) {

    _zoneStartHttp();
    return darthtml.HttpRequest.request(url, method: method, withCredentials: withCredentials,
      responseType: responseType, mimeType: mimeType, requestHeaders: requestHeaders,
      sendData: sendData, onProgress: onProgress)
        .then((darthtml.HttpRequest xhr) {
          _zoneEndHttp();
          return xhr;
        }).catchError((e) {
          _zoneEndHttp();
          throw e;  
        });
  }

  // Every other member simply forwards to the underlying HttpRequest;
  
  JsObject get blink_jsObject => this.xhr.blink_jsObject;
  
  void set blink_jsObject(toSet) {
    this.xhr.blink_jsObject = toSet;
  }
  
  darthtml.Events get on => this.xhr.on;
  
  Stream<darthtml.ProgressEvent> get onAbort  => this.xhr.onAbort;
  
  Stream<darthtml.ProgressEvent> get onError  => this.xhr.onError;
  
  Stream<darthtml.ProgressEvent> get onLoad  => this.xhr.onLoad;
  
  Stream<darthtml.ProgressEvent> get onLoadEnd  => this.xhr.onLoadEnd;
  
  Stream<darthtml.ProgressEvent> get onLoadStart  => this.xhr.onLoadStart;
  
  Stream<darthtml.ProgressEvent> get onProgress  => this.xhr.onProgress;
  
  Stream<darthtml.ProgressEvent> get onReadyStateChange  => this.xhr.onReadyStateChange;
  
  Stream<darthtml.ProgressEvent> get onTimeout  => this.xhr.onTimeout;
  
  int get readyState => this.xhr.readyState;
  
  Object get response => this.xhr.response;
  
  Map<String, String> get responseHeaders => this.xhr.responseHeaders;
  
  String get responseText => this.xhr.responseText;
  
  String get responseType => this.xhr.responseType;
  
  void set responseType(newResponseType) {
    this.xhr.responseType = newResponseType;
  }
  
  String get responseUrl => this.xhr.responseUrl;
  
  darthtml.Document get responseXml => this.xhr.responseXml;
  
  int get status => this.xhr.status;
  
  String get statusText => this.xhr.statusText;
  
  int get timeout => this.xhr.timeout;
  
  void set timeout(newTimeout) {
    this.xhr.timeout = newTimeout;
  }
  
  darthtml.HttpRequestUpload get upload => this.xhr.upload;
  
  bool get withCredentials => this.xhr.withCredentials;
  
  void set withCredentials(newWithCredentials) {
    this.xhr.withCredentials = newWithCredentials;
  }

  void abort() {
    return this.xhr.abort();
  }

  void addEventListener(String type, darthtml.EventListener listener, [bool useCapture]) {
    return this.xhr.addEventListener(type, listener, useCapture);
  }

  bool dispatchEvent(darthtml.Event event) {
    return this.xhr.dispatchEvent(event);
  }

  String getAllResponseHeaders() {
    return this.xhr.getAllResponseHeaders();
  }

  String getResponseHeader(String header) {
    return this.xhr.getResponseHeader(header);
  }
  
  void open(String method, String url, {bool async, String user, String password}) {
    return this.xhr.open(method, url, async: async, user: user, password: password);
  }
  
  void overrideMimeType(String override) {
    return this.xhr.overrideMimeType(override);
  }
  
  void removeEventListener(String type, darthtml.EventListener listener, [bool useCapture]) {
    this.xhr.removeEventListener(type, listener, useCapture);
  }
  
  void setRequestHeader(String header, String value) {
    this.xhr.setRequestHeader(header, value);
  }
}
