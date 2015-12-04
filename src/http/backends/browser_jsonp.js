'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
var core_1 = require('angular2/core');
var lang_1 = require('angular2/src/facade/lang');
var _nextRequestId = 0;
exports.JSONP_HOME = '__ng_jsonp__';
var _jsonpConnections = null;
function _getJsonpConnections() {
    if (_jsonpConnections === null) {
        _jsonpConnections = lang_1.global[exports.JSONP_HOME] = {};
    }
    return _jsonpConnections;
}
// Make sure not to evaluate this in a non-browser environment!
var BrowserJsonp = (function () {
    function BrowserJsonp() {
    }
    // Construct a <script> element with the specified URL
    BrowserJsonp.prototype.build = function (url) {
        var node = document.createElement('script');
        node.src = url;
        return node;
    };
    BrowserJsonp.prototype.nextRequestID = function () { return "__req" + _nextRequestId++; };
    BrowserJsonp.prototype.requestCallback = function (id) { return exports.JSONP_HOME + "." + id + ".finished"; };
    BrowserJsonp.prototype.exposeConnection = function (id, connection) {
        var connections = _getJsonpConnections();
        connections[id] = connection;
    };
    BrowserJsonp.prototype.removeConnection = function (id) {
        var connections = _getJsonpConnections();
        connections[id] = null;
    };
    // Attach the <script> element to the DOM
    BrowserJsonp.prototype.send = function (node) { document.body.appendChild((node)); };
    // Remove <script> element from the DOM
    BrowserJsonp.prototype.cleanup = function (node) {
        if (node.parentNode) {
            node.parentNode.removeChild((node));
        }
    };
    BrowserJsonp = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], BrowserJsonp);
    return BrowserJsonp;
})();
exports.BrowserJsonp = BrowserJsonp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlcl9qc29ucC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9odHRwL2JhY2tlbmRzL2Jyb3dzZXJfanNvbnAudHMiXSwibmFtZXMiOlsiX2dldEpzb25wQ29ubmVjdGlvbnMiLCJCcm93c2VySnNvbnAiLCJCcm93c2VySnNvbnAuY29uc3RydWN0b3IiLCJCcm93c2VySnNvbnAuYnVpbGQiLCJCcm93c2VySnNvbnAubmV4dFJlcXVlc3RJRCIsIkJyb3dzZXJKc29ucC5yZXF1ZXN0Q2FsbGJhY2siLCJCcm93c2VySnNvbnAuZXhwb3NlQ29ubmVjdGlvbiIsIkJyb3dzZXJKc29ucC5yZW1vdmVDb25uZWN0aW9uIiwiQnJvd3Nlckpzb25wLnNlbmQiLCJCcm93c2VySnNvbnAuY2xlYW51cCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxxQkFBeUIsZUFBZSxDQUFDLENBQUE7QUFDekMscUJBQXFCLDBCQUEwQixDQUFDLENBQUE7QUFFaEQsSUFBSSxjQUFjLEdBQUcsQ0FBQyxDQUFDO0FBQ1Ysa0JBQVUsR0FBRyxjQUFjLENBQUM7QUFDekMsSUFBSSxpQkFBaUIsR0FBRyxJQUFJLENBQUM7QUFFN0I7SUFDRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsaUJBQWlCQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMvQkEsaUJBQWlCQSxHQUFHQSxhQUFNQSxDQUFDQSxrQkFBVUEsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0E7SUFDOUNBLENBQUNBO0lBQ0RBLE1BQU1BLENBQUNBLGlCQUFpQkEsQ0FBQ0E7QUFDM0JBLENBQUNBO0FBRUQsK0RBQStEO0FBQy9EO0lBQUFDO0lBZ0NBQyxDQUFDQTtJQTlCQ0Qsc0RBQXNEQTtJQUN0REEsNEJBQUtBLEdBQUxBLFVBQU1BLEdBQVdBO1FBQ2ZFLElBQUlBLElBQUlBLEdBQUdBLFFBQVFBLENBQUNBLGFBQWFBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBO1FBQzVDQSxJQUFJQSxDQUFDQSxHQUFHQSxHQUFHQSxHQUFHQSxDQUFDQTtRQUNmQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNkQSxDQUFDQTtJQUVERixvQ0FBYUEsR0FBYkEsY0FBMEJHLE1BQU1BLENBQUNBLFVBQVFBLGNBQWNBLEVBQUlBLENBQUNBLENBQUNBLENBQUNBO0lBRTlESCxzQ0FBZUEsR0FBZkEsVUFBZ0JBLEVBQVVBLElBQVlJLE1BQU1BLENBQUlBLGtCQUFVQSxTQUFJQSxFQUFFQSxjQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUU5RUosdUNBQWdCQSxHQUFoQkEsVUFBaUJBLEVBQVVBLEVBQUVBLFVBQWVBO1FBQzFDSyxJQUFJQSxXQUFXQSxHQUFHQSxvQkFBb0JBLEVBQUVBLENBQUNBO1FBQ3pDQSxXQUFXQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxVQUFVQSxDQUFDQTtJQUMvQkEsQ0FBQ0E7SUFFREwsdUNBQWdCQSxHQUFoQkEsVUFBaUJBLEVBQVVBO1FBQ3pCTSxJQUFJQSxXQUFXQSxHQUFHQSxvQkFBb0JBLEVBQUVBLENBQUNBO1FBQ3pDQSxXQUFXQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtJQUN6QkEsQ0FBQ0E7SUFFRE4seUNBQXlDQTtJQUN6Q0EsMkJBQUlBLEdBQUpBLFVBQUtBLElBQVNBLElBQUlPLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQU9BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRTVEUCx1Q0FBdUNBO0lBQ3ZDQSw4QkFBT0EsR0FBUEEsVUFBUUEsSUFBU0E7UUFDZlEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcEJBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLFdBQVdBLENBQU9BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1FBQzVDQSxDQUFDQTtJQUNIQSxDQUFDQTtJQS9CSFI7UUFBQ0EsaUJBQVVBLEVBQUVBOztxQkFnQ1pBO0lBQURBLG1CQUFDQTtBQUFEQSxDQUFDQSxBQWhDRCxJQWdDQztBQS9CWSxvQkFBWSxlQStCeEIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge2dsb2JhbH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxubGV0IF9uZXh0UmVxdWVzdElkID0gMDtcbmV4cG9ydCBjb25zdCBKU09OUF9IT01FID0gJ19fbmdfanNvbnBfXyc7XG52YXIgX2pzb25wQ29ubmVjdGlvbnMgPSBudWxsO1xuXG5mdW5jdGlvbiBfZ2V0SnNvbnBDb25uZWN0aW9ucygpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gIGlmIChfanNvbnBDb25uZWN0aW9ucyA9PT0gbnVsbCkge1xuICAgIF9qc29ucENvbm5lY3Rpb25zID0gZ2xvYmFsW0pTT05QX0hPTUVdID0ge307XG4gIH1cbiAgcmV0dXJuIF9qc29ucENvbm5lY3Rpb25zO1xufVxuXG4vLyBNYWtlIHN1cmUgbm90IHRvIGV2YWx1YXRlIHRoaXMgaW4gYSBub24tYnJvd3NlciBlbnZpcm9ubWVudCFcbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBCcm93c2VySnNvbnAge1xuICAvLyBDb25zdHJ1Y3QgYSA8c2NyaXB0PiBlbGVtZW50IHdpdGggdGhlIHNwZWNpZmllZCBVUkxcbiAgYnVpbGQodXJsOiBzdHJpbmcpOiBhbnkge1xuICAgIGxldCBub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgbm9kZS5zcmMgPSB1cmw7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBuZXh0UmVxdWVzdElEKCk6IHN0cmluZyB7IHJldHVybiBgX19yZXEke19uZXh0UmVxdWVzdElkKyt9YDsgfVxuXG4gIHJlcXVlc3RDYWxsYmFjayhpZDogc3RyaW5nKTogc3RyaW5nIHsgcmV0dXJuIGAke0pTT05QX0hPTUV9LiR7aWR9LmZpbmlzaGVkYDsgfVxuXG4gIGV4cG9zZUNvbm5lY3Rpb24oaWQ6IHN0cmluZywgY29ubmVjdGlvbjogYW55KSB7XG4gICAgbGV0IGNvbm5lY3Rpb25zID0gX2dldEpzb25wQ29ubmVjdGlvbnMoKTtcbiAgICBjb25uZWN0aW9uc1tpZF0gPSBjb25uZWN0aW9uO1xuICB9XG5cbiAgcmVtb3ZlQ29ubmVjdGlvbihpZDogc3RyaW5nKSB7XG4gICAgdmFyIGNvbm5lY3Rpb25zID0gX2dldEpzb25wQ29ubmVjdGlvbnMoKTtcbiAgICBjb25uZWN0aW9uc1tpZF0gPSBudWxsO1xuICB9XG5cbiAgLy8gQXR0YWNoIHRoZSA8c2NyaXB0PiBlbGVtZW50IHRvIHRoZSBET01cbiAgc2VuZChub2RlOiBhbnkpIHsgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCg8Tm9kZT4obm9kZSkpOyB9XG5cbiAgLy8gUmVtb3ZlIDxzY3JpcHQ+IGVsZW1lbnQgZnJvbSB0aGUgRE9NXG4gIGNsZWFudXAobm9kZTogYW55KSB7XG4gICAgaWYgKG5vZGUucGFyZW50Tm9kZSkge1xuICAgICAgbm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKDxOb2RlPihub2RlKSk7XG4gICAgfVxuICB9XG59XG4iXX0=