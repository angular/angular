'use strict';"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
}());
exports.BrowserJsonp = BrowserJsonp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlcl9qc29ucC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9odHRwL2JhY2tlbmRzL2Jyb3dzZXJfanNvbnAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLHFCQUF5QixlQUFlLENBQUMsQ0FBQTtBQUN6QyxxQkFBcUIsMEJBQTBCLENBQUMsQ0FBQTtBQUVoRCxJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUM7QUFDVixrQkFBVSxHQUFHLGNBQWMsQ0FBQztBQUN6QyxJQUFJLGlCQUFpQixHQUF5QixJQUFJLENBQUM7QUFFbkQ7SUFDRSxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQy9CLGlCQUFpQixHQUEwQixhQUFPLENBQUMsa0JBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUN0RSxDQUFDO0lBQ0QsTUFBTSxDQUFDLGlCQUFpQixDQUFDO0FBQzNCLENBQUM7QUFFRCwrREFBK0Q7QUFFL0Q7SUFBQTtJQStCQSxDQUFDO0lBOUJDLHNEQUFzRDtJQUN0RCw0QkFBSyxHQUFMLFVBQU0sR0FBVztRQUNmLElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELG9DQUFhLEdBQWIsY0FBMEIsTUFBTSxDQUFDLFVBQVEsY0FBYyxFQUFJLENBQUMsQ0FBQyxDQUFDO0lBRTlELHNDQUFlLEdBQWYsVUFBZ0IsRUFBVSxJQUFZLE1BQU0sQ0FBSSxrQkFBVSxTQUFJLEVBQUUsY0FBVyxDQUFDLENBQUMsQ0FBQztJQUU5RSx1Q0FBZ0IsR0FBaEIsVUFBaUIsRUFBVSxFQUFFLFVBQWU7UUFDMUMsSUFBSSxXQUFXLEdBQUcsb0JBQW9CLEVBQUUsQ0FBQztRQUN6QyxXQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDO0lBQy9CLENBQUM7SUFFRCx1Q0FBZ0IsR0FBaEIsVUFBaUIsRUFBVTtRQUN6QixJQUFJLFdBQVcsR0FBRyxvQkFBb0IsRUFBRSxDQUFDO1FBQ3pDLFdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDekIsQ0FBQztJQUVELHlDQUF5QztJQUN6QywyQkFBSSxHQUFKLFVBQUssSUFBUyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFNUQsdUNBQXVDO0lBQ3ZDLDhCQUFPLEdBQVAsVUFBUSxJQUFTO1FBQ2YsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDcEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzVDLENBQUM7SUFDSCxDQUFDO0lBL0JIO1FBQUMsaUJBQVUsRUFBRTs7b0JBQUE7SUFnQ2IsbUJBQUM7QUFBRCxDQUFDLEFBL0JELElBK0JDO0FBL0JZLG9CQUFZLGVBK0J4QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7Z2xvYmFsfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5sZXQgX25leHRSZXF1ZXN0SWQgPSAwO1xuZXhwb3J0IGNvbnN0IEpTT05QX0hPTUUgPSAnX19uZ19qc29ucF9fJztcbnZhciBfanNvbnBDb25uZWN0aW9uczoge1trZXk6IHN0cmluZ106IGFueX0gPSBudWxsO1xuXG5mdW5jdGlvbiBfZ2V0SnNvbnBDb25uZWN0aW9ucygpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gIGlmIChfanNvbnBDb25uZWN0aW9ucyA9PT0gbnVsbCkge1xuICAgIF9qc29ucENvbm5lY3Rpb25zID0gKDx7W2tleTogc3RyaW5nXTogYW55fT5nbG9iYWwpW0pTT05QX0hPTUVdID0ge307XG4gIH1cbiAgcmV0dXJuIF9qc29ucENvbm5lY3Rpb25zO1xufVxuXG4vLyBNYWtlIHN1cmUgbm90IHRvIGV2YWx1YXRlIHRoaXMgaW4gYSBub24tYnJvd3NlciBlbnZpcm9ubWVudCFcbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBCcm93c2VySnNvbnAge1xuICAvLyBDb25zdHJ1Y3QgYSA8c2NyaXB0PiBlbGVtZW50IHdpdGggdGhlIHNwZWNpZmllZCBVUkxcbiAgYnVpbGQodXJsOiBzdHJpbmcpOiBhbnkge1xuICAgIGxldCBub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgbm9kZS5zcmMgPSB1cmw7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBuZXh0UmVxdWVzdElEKCk6IHN0cmluZyB7IHJldHVybiBgX19yZXEke19uZXh0UmVxdWVzdElkKyt9YDsgfVxuXG4gIHJlcXVlc3RDYWxsYmFjayhpZDogc3RyaW5nKTogc3RyaW5nIHsgcmV0dXJuIGAke0pTT05QX0hPTUV9LiR7aWR9LmZpbmlzaGVkYDsgfVxuXG4gIGV4cG9zZUNvbm5lY3Rpb24oaWQ6IHN0cmluZywgY29ubmVjdGlvbjogYW55KSB7XG4gICAgbGV0IGNvbm5lY3Rpb25zID0gX2dldEpzb25wQ29ubmVjdGlvbnMoKTtcbiAgICBjb25uZWN0aW9uc1tpZF0gPSBjb25uZWN0aW9uO1xuICB9XG5cbiAgcmVtb3ZlQ29ubmVjdGlvbihpZDogc3RyaW5nKSB7XG4gICAgdmFyIGNvbm5lY3Rpb25zID0gX2dldEpzb25wQ29ubmVjdGlvbnMoKTtcbiAgICBjb25uZWN0aW9uc1tpZF0gPSBudWxsO1xuICB9XG5cbiAgLy8gQXR0YWNoIHRoZSA8c2NyaXB0PiBlbGVtZW50IHRvIHRoZSBET01cbiAgc2VuZChub2RlOiBhbnkpIHsgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCg8Tm9kZT4obm9kZSkpOyB9XG5cbiAgLy8gUmVtb3ZlIDxzY3JpcHQ+IGVsZW1lbnQgZnJvbSB0aGUgRE9NXG4gIGNsZWFudXAobm9kZTogYW55KSB7XG4gICAgaWYgKG5vZGUucGFyZW50Tm9kZSkge1xuICAgICAgbm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKDxOb2RlPihub2RlKSk7XG4gICAgfVxuICB9XG59XG4iXX0=