var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/core';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlcl9qc29ucC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9odHRwL2JhY2tlbmRzL2Jyb3dzZXJfanNvbnAudHMiXSwibmFtZXMiOlsiX2dldEpzb25wQ29ubmVjdGlvbnMiLCJCcm93c2VySnNvbnAiLCJCcm93c2VySnNvbnAuYnVpbGQiLCJCcm93c2VySnNvbnAubmV4dFJlcXVlc3RJRCIsIkJyb3dzZXJKc29ucC5yZXF1ZXN0Q2FsbGJhY2siLCJCcm93c2VySnNvbnAuZXhwb3NlQ29ubmVjdGlvbiIsIkJyb3dzZXJKc29ucC5yZW1vdmVDb25uZWN0aW9uIiwiQnJvd3Nlckpzb25wLnNlbmQiLCJCcm93c2VySnNvbnAuY2xlYW51cCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlO09BQ2pDLEVBQUMsTUFBTSxFQUFDLE1BQU0sMEJBQTBCO0FBRS9DLElBQUksY0FBYyxHQUFHLENBQUMsQ0FBQztBQUN2QixhQUFhLFVBQVUsR0FBRyxjQUFjLENBQUM7QUFDekMsSUFBSSxpQkFBaUIsR0FBRyxJQUFJLENBQUM7QUFFN0I7SUFDRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsaUJBQWlCQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMvQkEsaUJBQWlCQSxHQUFHQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQTtJQUM5Q0EsQ0FBQ0E7SUFDREEsTUFBTUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQTtBQUMzQkEsQ0FBQ0E7QUFFRCwrREFBK0Q7QUFDL0Q7SUFFRUMsc0RBQXNEQTtJQUN0REEsS0FBS0EsQ0FBQ0EsR0FBV0E7UUFDZkMsSUFBSUEsSUFBSUEsR0FBR0EsUUFBUUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7UUFDNUNBLElBQUlBLENBQUNBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBO1FBQ2ZBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0lBQ2RBLENBQUNBO0lBRURELGFBQWFBLEtBQWFFLE1BQU1BLENBQUNBLFFBQVFBLGNBQWNBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBRTlERixlQUFlQSxDQUFDQSxFQUFVQSxJQUFZRyxNQUFNQSxDQUFDQSxHQUFHQSxVQUFVQSxJQUFJQSxFQUFFQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUU5RUgsZ0JBQWdCQSxDQUFDQSxFQUFVQSxFQUFFQSxVQUFlQTtRQUMxQ0ksSUFBSUEsV0FBV0EsR0FBR0Esb0JBQW9CQSxFQUFFQSxDQUFDQTtRQUN6Q0EsV0FBV0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsVUFBVUEsQ0FBQ0E7SUFDL0JBLENBQUNBO0lBRURKLGdCQUFnQkEsQ0FBQ0EsRUFBVUE7UUFDekJLLElBQUlBLFdBQVdBLEdBQUdBLG9CQUFvQkEsRUFBRUEsQ0FBQ0E7UUFDekNBLFdBQVdBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO0lBQ3pCQSxDQUFDQTtJQUVETCx5Q0FBeUNBO0lBQ3pDQSxJQUFJQSxDQUFDQSxJQUFTQSxJQUFJTSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUU1RE4sdUNBQXVDQTtJQUN2Q0EsT0FBT0EsQ0FBQ0EsSUFBU0E7UUFDZk8sRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcEJBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLFdBQVdBLENBQU9BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1FBQzVDQSxDQUFDQTtJQUNIQSxDQUFDQTtBQUNIUCxDQUFDQTtBQWhDRDtJQUFDLFVBQVUsRUFBRTs7aUJBZ0NaO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtnbG9iYWx9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbmxldCBfbmV4dFJlcXVlc3RJZCA9IDA7XG5leHBvcnQgY29uc3QgSlNPTlBfSE9NRSA9ICdfX25nX2pzb25wX18nO1xudmFyIF9qc29ucENvbm5lY3Rpb25zID0gbnVsbDtcblxuZnVuY3Rpb24gX2dldEpzb25wQ29ubmVjdGlvbnMoKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICBpZiAoX2pzb25wQ29ubmVjdGlvbnMgPT09IG51bGwpIHtcbiAgICBfanNvbnBDb25uZWN0aW9ucyA9IGdsb2JhbFtKU09OUF9IT01FXSA9IHt9O1xuICB9XG4gIHJldHVybiBfanNvbnBDb25uZWN0aW9ucztcbn1cblxuLy8gTWFrZSBzdXJlIG5vdCB0byBldmFsdWF0ZSB0aGlzIGluIGEgbm9uLWJyb3dzZXIgZW52aXJvbm1lbnQhXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQnJvd3Nlckpzb25wIHtcbiAgLy8gQ29uc3RydWN0IGEgPHNjcmlwdD4gZWxlbWVudCB3aXRoIHRoZSBzcGVjaWZpZWQgVVJMXG4gIGJ1aWxkKHVybDogc3RyaW5nKTogYW55IHtcbiAgICBsZXQgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgIG5vZGUuc3JjID0gdXJsO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgbmV4dFJlcXVlc3RJRCgpOiBzdHJpbmcgeyByZXR1cm4gYF9fcmVxJHtfbmV4dFJlcXVlc3RJZCsrfWA7IH1cblxuICByZXF1ZXN0Q2FsbGJhY2soaWQ6IHN0cmluZyk6IHN0cmluZyB7IHJldHVybiBgJHtKU09OUF9IT01FfS4ke2lkfS5maW5pc2hlZGA7IH1cblxuICBleHBvc2VDb25uZWN0aW9uKGlkOiBzdHJpbmcsIGNvbm5lY3Rpb246IGFueSkge1xuICAgIGxldCBjb25uZWN0aW9ucyA9IF9nZXRKc29ucENvbm5lY3Rpb25zKCk7XG4gICAgY29ubmVjdGlvbnNbaWRdID0gY29ubmVjdGlvbjtcbiAgfVxuXG4gIHJlbW92ZUNvbm5lY3Rpb24oaWQ6IHN0cmluZykge1xuICAgIHZhciBjb25uZWN0aW9ucyA9IF9nZXRKc29ucENvbm5lY3Rpb25zKCk7XG4gICAgY29ubmVjdGlvbnNbaWRdID0gbnVsbDtcbiAgfVxuXG4gIC8vIEF0dGFjaCB0aGUgPHNjcmlwdD4gZWxlbWVudCB0byB0aGUgRE9NXG4gIHNlbmQobm9kZTogYW55KSB7IGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoPE5vZGU+KG5vZGUpKTsgfVxuXG4gIC8vIFJlbW92ZSA8c2NyaXB0PiBlbGVtZW50IGZyb20gdGhlIERPTVxuICBjbGVhbnVwKG5vZGU6IGFueSkge1xuICAgIGlmIChub2RlLnBhcmVudE5vZGUpIHtcbiAgICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCg8Tm9kZT4obm9kZSkpO1xuICAgIH1cbiAgfVxufVxuIl19