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
export let BrowserJsonp = class BrowserJsonp {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlcl9qc29ucC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtZ3RNN1FoRW4udG1wL2FuZ3VsYXIyL3NyYy9odHRwL2JhY2tlbmRzL2Jyb3dzZXJfanNvbnAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlO09BQ2pDLEVBQUMsTUFBTSxFQUFDLE1BQU0sMEJBQTBCO0FBRS9DLElBQUksY0FBYyxHQUFHLENBQUMsQ0FBQztBQUN2QixPQUFPLE1BQU0sVUFBVSxHQUFHLGNBQWMsQ0FBQztBQUN6QyxJQUFJLGlCQUFpQixHQUF5QixJQUFJLENBQUM7QUFFbkQ7SUFDRSxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQy9CLGlCQUFpQixHQUEwQixNQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ3RFLENBQUM7SUFDRCxNQUFNLENBQUMsaUJBQWlCLENBQUM7QUFDM0IsQ0FBQztBQUVELCtEQUErRDtBQUUvRDtJQUNFLHNEQUFzRDtJQUN0RCxLQUFLLENBQUMsR0FBVztRQUNmLElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELGFBQWEsS0FBYSxNQUFNLENBQUMsUUFBUSxjQUFjLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUU5RCxlQUFlLENBQUMsRUFBVSxJQUFZLE1BQU0sQ0FBQyxHQUFHLFVBQVUsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7SUFFOUUsZ0JBQWdCLENBQUMsRUFBVSxFQUFFLFVBQWU7UUFDMUMsSUFBSSxXQUFXLEdBQUcsb0JBQW9CLEVBQUUsQ0FBQztRQUN6QyxXQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDO0lBQy9CLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxFQUFVO1FBQ3pCLElBQUksV0FBVyxHQUFHLG9CQUFvQixFQUFFLENBQUM7UUFDekMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQztJQUN6QixDQUFDO0lBRUQseUNBQXlDO0lBQ3pDLElBQUksQ0FBQyxJQUFTLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUU1RCx1Q0FBdUM7SUFDdkMsT0FBTyxDQUFDLElBQVM7UUFDZixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUNwQixJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDNUMsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDO0FBaENEO0lBQUMsVUFBVSxFQUFFOztnQkFBQTtBQWdDWiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge2dsb2JhbH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxubGV0IF9uZXh0UmVxdWVzdElkID0gMDtcbmV4cG9ydCBjb25zdCBKU09OUF9IT01FID0gJ19fbmdfanNvbnBfXyc7XG52YXIgX2pzb25wQ29ubmVjdGlvbnM6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0gbnVsbDtcblxuZnVuY3Rpb24gX2dldEpzb25wQ29ubmVjdGlvbnMoKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICBpZiAoX2pzb25wQ29ubmVjdGlvbnMgPT09IG51bGwpIHtcbiAgICBfanNvbnBDb25uZWN0aW9ucyA9ICg8e1trZXk6IHN0cmluZ106IGFueX0+Z2xvYmFsKVtKU09OUF9IT01FXSA9IHt9O1xuICB9XG4gIHJldHVybiBfanNvbnBDb25uZWN0aW9ucztcbn1cblxuLy8gTWFrZSBzdXJlIG5vdCB0byBldmFsdWF0ZSB0aGlzIGluIGEgbm9uLWJyb3dzZXIgZW52aXJvbm1lbnQhXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQnJvd3Nlckpzb25wIHtcbiAgLy8gQ29uc3RydWN0IGEgPHNjcmlwdD4gZWxlbWVudCB3aXRoIHRoZSBzcGVjaWZpZWQgVVJMXG4gIGJ1aWxkKHVybDogc3RyaW5nKTogYW55IHtcbiAgICBsZXQgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgIG5vZGUuc3JjID0gdXJsO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgbmV4dFJlcXVlc3RJRCgpOiBzdHJpbmcgeyByZXR1cm4gYF9fcmVxJHtfbmV4dFJlcXVlc3RJZCsrfWA7IH1cblxuICByZXF1ZXN0Q2FsbGJhY2soaWQ6IHN0cmluZyk6IHN0cmluZyB7IHJldHVybiBgJHtKU09OUF9IT01FfS4ke2lkfS5maW5pc2hlZGA7IH1cblxuICBleHBvc2VDb25uZWN0aW9uKGlkOiBzdHJpbmcsIGNvbm5lY3Rpb246IGFueSkge1xuICAgIGxldCBjb25uZWN0aW9ucyA9IF9nZXRKc29ucENvbm5lY3Rpb25zKCk7XG4gICAgY29ubmVjdGlvbnNbaWRdID0gY29ubmVjdGlvbjtcbiAgfVxuXG4gIHJlbW92ZUNvbm5lY3Rpb24oaWQ6IHN0cmluZykge1xuICAgIHZhciBjb25uZWN0aW9ucyA9IF9nZXRKc29ucENvbm5lY3Rpb25zKCk7XG4gICAgY29ubmVjdGlvbnNbaWRdID0gbnVsbDtcbiAgfVxuXG4gIC8vIEF0dGFjaCB0aGUgPHNjcmlwdD4gZWxlbWVudCB0byB0aGUgRE9NXG4gIHNlbmQobm9kZTogYW55KSB7IGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoPE5vZGU+KG5vZGUpKTsgfVxuXG4gIC8vIFJlbW92ZSA8c2NyaXB0PiBlbGVtZW50IGZyb20gdGhlIERPTVxuICBjbGVhbnVwKG5vZGU6IGFueSkge1xuICAgIGlmIChub2RlLnBhcmVudE5vZGUpIHtcbiAgICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCg8Tm9kZT4obm9kZSkpO1xuICAgIH1cbiAgfVxufVxuIl19