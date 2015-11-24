var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/angular2';
import { global } from 'angular2/src/facade/lang';
let _nextRequestId = 0;
export const JSONP_HOME = '__ng_jsonp__';
var _jsonpConnections = null;
function _getJsonpConnections() {
    if (_jsonpConnections === null) {
        _jsonpConnections = global[JSONP_HOME] = {};
    }
    return _jsonpConnections;
}
// Make sure not to evaluate this in a non-browser environment!
export let BrowserJsonp = class {
    // Construct a <script> element with the specified URL
    build(url) {
        let node = document.createElement('script');
        node.src = url;
        return node;
    }
    nextRequestID() { return `__req${_nextRequestId++}`; }
    requestCallback(id) { return `${JSONP_HOME}.${id}.finished`; }
    exposeConnection(id, connection) {
        let connections = _getJsonpConnections();
        connections[id] = connection;
    }
    removeConnection(id) {
        var connections = _getJsonpConnections();
        connections[id] = null;
    }
    // Attach the <script> element to the DOM
    send(node) { document.body.appendChild((node)); }
    // Remove <script> element from the DOM
    cleanup(node) {
        if (node.parentNode) {
            node.parentNode.removeChild((node));
        }
    }
};
BrowserJsonp = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], BrowserJsonp);
//# sourceMappingURL=browser_jsonp.js.map