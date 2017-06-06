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
var lang_1 = require("angular2/src/facade/lang");
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require("angular2/src/facade/collection");
var api_1 = require("angular2/src/core/render/api");
var di_1 = require("angular2/src/core/di");
var render_store_1 = require('angular2/src/web_workers/shared/render_store');
var view_1 = require('angular2/src/core/metadata/view');
var serialized_types_1 = require('./serialized_types');
// PRIMITIVE is any type that does not need to be serialized (string, number, boolean)
// We set it to String so that it is considered a Type.
exports.PRIMITIVE = String;
var Serializer = (function () {
    function Serializer(_renderStore) {
        this._renderStore = _renderStore;
    }
    Serializer.prototype.serialize = function (obj, type) {
        var _this = this;
        if (!lang_1.isPresent(obj)) {
            return null;
        }
        if (lang_1.isArray(obj)) {
            return obj.map(function (v) { return _this.serialize(v, type); });
        }
        if (type == exports.PRIMITIVE) {
            return obj;
        }
        if (type == RenderStoreObject) {
            return this._renderStore.serialize(obj);
        }
        else if (type === api_1.RenderComponentType) {
            return this._serializeRenderComponentType(obj);
        }
        else if (type === view_1.ViewEncapsulation) {
            return lang_1.serializeEnum(obj);
        }
        else if (type === serialized_types_1.LocationType) {
            return this._serializeLocation(obj);
        }
        else {
            throw new exceptions_1.BaseException("No serializer for " + type.toString());
        }
    };
    Serializer.prototype.deserialize = function (map, type, data) {
        var _this = this;
        if (!lang_1.isPresent(map)) {
            return null;
        }
        if (lang_1.isArray(map)) {
            var obj = [];
            map.forEach(function (val) { return obj.push(_this.deserialize(val, type, data)); });
            return obj;
        }
        if (type == exports.PRIMITIVE) {
            return map;
        }
        if (type == RenderStoreObject) {
            return this._renderStore.deserialize(map);
        }
        else if (type === api_1.RenderComponentType) {
            return this._deserializeRenderComponentType(map);
        }
        else if (type === view_1.ViewEncapsulation) {
            return view_1.VIEW_ENCAPSULATION_VALUES[map];
        }
        else if (type === serialized_types_1.LocationType) {
            return this._deserializeLocation(map);
        }
        else {
            throw new exceptions_1.BaseException("No deserializer for " + type.toString());
        }
    };
    Serializer.prototype.mapToObject = function (map, type) {
        var _this = this;
        var object = {};
        var serialize = lang_1.isPresent(type);
        map.forEach(function (value, key) {
            if (serialize) {
                object[key] = _this.serialize(value, type);
            }
            else {
                object[key] = value;
            }
        });
        return object;
    };
    /*
     * Transforms a Javascript object (StringMap) into a Map<string, V>
     * If the values need to be deserialized pass in their type
     * and they will be deserialized before being placed in the map
     */
    Serializer.prototype.objectToMap = function (obj, type, data) {
        var _this = this;
        if (lang_1.isPresent(type)) {
            var map = new collection_1.Map();
            collection_1.StringMapWrapper.forEach(obj, function (val, key) { map.set(key, _this.deserialize(val, type, data)); });
            return map;
        }
        else {
            return collection_1.MapWrapper.createFromStringMap(obj);
        }
    };
    Serializer.prototype._serializeLocation = function (loc) {
        return {
            'href': loc.href,
            'protocol': loc.protocol,
            'host': loc.host,
            'hostname': loc.hostname,
            'port': loc.port,
            'pathname': loc.pathname,
            'search': loc.search,
            'hash': loc.hash,
            'origin': loc.origin
        };
    };
    Serializer.prototype._deserializeLocation = function (loc) {
        return new serialized_types_1.LocationType(loc['href'], loc['protocol'], loc['host'], loc['hostname'], loc['port'], loc['pathname'], loc['search'], loc['hash'], loc['origin']);
    };
    Serializer.prototype._serializeRenderComponentType = function (obj) {
        return {
            'id': obj.id,
            'templateUrl': obj.templateUrl,
            'slotCount': obj.slotCount,
            'encapsulation': this.serialize(obj.encapsulation, view_1.ViewEncapsulation),
            'styles': this.serialize(obj.styles, exports.PRIMITIVE)
        };
    };
    Serializer.prototype._deserializeRenderComponentType = function (map) {
        return new api_1.RenderComponentType(map['id'], map['templateUrl'], map['slotCount'], this.deserialize(map['encapsulation'], view_1.ViewEncapsulation), this.deserialize(map['styles'], exports.PRIMITIVE));
    };
    Serializer = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [render_store_1.RenderStore])
    ], Serializer);
    return Serializer;
}());
exports.Serializer = Serializer;
var RenderStoreObject = (function () {
    function RenderStoreObject() {
    }
    return RenderStoreObject;
}());
exports.RenderStoreObject = RenderStoreObject;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWFsaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvc2VyaWFsaXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEscUJBQXVFLDBCQUEwQixDQUFDLENBQUE7QUFDbEcsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFFL0UsMkJBQWdELGdDQUFnQyxDQUFDLENBQUE7QUFDakYsb0JBQWtDLDhCQUE4QixDQUFDLENBQUE7QUFDakUsbUJBQXlCLHNCQUFzQixDQUFDLENBQUE7QUFDaEQsNkJBQTBCLDhDQUE4QyxDQUFDLENBQUE7QUFDekUscUJBQTJELGlDQUFpQyxDQUFDLENBQUE7QUFDN0YsaUNBQTJCLG9CQUFvQixDQUFDLENBQUE7QUFFaEQsc0ZBQXNGO0FBQ3RGLHVEQUF1RDtBQUMxQyxpQkFBUyxHQUE0QixNQUFNLENBQUM7QUFHekQ7SUFDRSxvQkFBb0IsWUFBeUI7UUFBekIsaUJBQVksR0FBWixZQUFZLENBQWE7SUFBRyxDQUFDO0lBRWpELDhCQUFTLEdBQVQsVUFBVSxHQUFRLEVBQUUsSUFBUztRQUE3QixpQkFxQkM7UUFwQkMsRUFBRSxDQUFDLENBQUMsQ0FBQyxnQkFBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLGNBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakIsTUFBTSxDQUFTLEdBQUksQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxLQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBdkIsQ0FBdUIsQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxJ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LENBQUM7SUFDSixDQUFDO0lBRU8sb0RBQStCLEdBQXZDLFVBQXdDLEdBQXlCO1FBQy9ELE1BQU0sQ0FBQyxJQUFJLHlCQUFtQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLEVBQUUsR0FBRyxDQUFDLFdBQVcsQ0FBQyxFQUMvQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsRUFBRSx3QkFBaUIsQ0FBQyxFQUN6RCxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxpQkFBUyxDQUFDLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBcEhIO1FBQUMsZUFBVSxFQUFFOztrQkFBQTtJQXFIYixpQkFBQztBQUFELENBQUMsQUFwSEQsSUFvSEM7QUFwSFksa0JBQVUsYUFvSHRCLENBQUE7QUFHRDtJQUFBO0lBQWdDLENBQUM7SUFBRCx3QkFBQztBQUFELENBQUMsQUFBakMsSUFBaUM7QUFBcEIseUJBQWlCLG9CQUFHLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1R5cGUsIGlzQXJyYXksIGlzUHJlc2VudCwgc2VyaWFsaXplRW51bSwgZGVzZXJpYWxpemVFbnVtfSBmcm9tIFwiYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nXCI7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5cbmltcG9ydCB7TWFwLCBTdHJpbmdNYXBXcmFwcGVyLCBNYXBXcmFwcGVyfSBmcm9tIFwiYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uXCI7XG5pbXBvcnQge1JlbmRlckNvbXBvbmVudFR5cGV9IGZyb20gXCJhbmd1bGFyMi9zcmMvY29yZS9yZW5kZXIvYXBpXCI7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gXCJhbmd1bGFyMi9zcmMvY29yZS9kaVwiO1xuaW1wb3J0IHtSZW5kZXJTdG9yZX0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9yZW5kZXJfc3RvcmUnO1xuaW1wb3J0IHtWaWV3RW5jYXBzdWxhdGlvbiwgVklFV19FTkNBUFNVTEFUSU9OX1ZBTFVFU30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEvdmlldyc7XG5pbXBvcnQge0xvY2F0aW9uVHlwZX0gZnJvbSAnLi9zZXJpYWxpemVkX3R5cGVzJztcblxuLy8gUFJJTUlUSVZFIGlzIGFueSB0eXBlIHRoYXQgZG9lcyBub3QgbmVlZCB0byBiZSBzZXJpYWxpemVkIChzdHJpbmcsIG51bWJlciwgYm9vbGVhbilcbi8vIFdlIHNldCBpdCB0byBTdHJpbmcgc28gdGhhdCBpdCBpcyBjb25zaWRlcmVkIGEgVHlwZS5cbmV4cG9ydCBjb25zdCBQUklNSVRJVkU6IFR5cGUgPSAvKkB0czJkYXJ0X2NvbnN0Ki8gU3RyaW5nO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgU2VyaWFsaXplciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3JlbmRlclN0b3JlOiBSZW5kZXJTdG9yZSkge31cblxuICBzZXJpYWxpemUob2JqOiBhbnksIHR5cGU6IGFueSk6IE9iamVjdCB7XG4gICAgaWYgKCFpc1ByZXNlbnQob2JqKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAgIHJldHVybiAoPGFueVtdPm9iaikubWFwKHYgPT4gdGhpcy5zZXJpYWxpemUodiwgdHlwZSkpO1xuICAgIH1cbiAgICBpZiAodHlwZSA9PSBQUklNSVRJVkUpIHtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICAgIGlmICh0eXBlID09IFJlbmRlclN0b3JlT2JqZWN0KSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVuZGVyU3RvcmUuc2VyaWFsaXplKG9iaik7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBSZW5kZXJDb21wb25lbnRUeXBlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fc2VyaWFsaXplUmVuZGVyQ29tcG9uZW50VHlwZShvYmopO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gVmlld0VuY2Fwc3VsYXRpb24pIHtcbiAgICAgIHJldHVybiBzZXJpYWxpemVFbnVtKG9iaik7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBMb2NhdGlvblR5cGUpIHtcbiAgICAgIHJldHVybiB0aGlzLl9zZXJpYWxpemVMb2NhdGlvbihvYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcIk5vIHNlcmlhbGl6ZXIgZm9yIFwiICsgdHlwZS50b1N0cmluZygpKTtcbiAgICB9XG4gIH1cblxuICBkZXNlcmlhbGl6ZShtYXA6IGFueSwgdHlwZTogYW55LCBkYXRhPzogYW55KTogYW55IHtcbiAgICBpZiAoIWlzUHJlc2VudChtYXApKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKGlzQXJyYXkobWFwKSkge1xuICAgICAgdmFyIG9iajogYW55W10gPSBbXTtcbiAgICAgICg8YW55W10+bWFwKS5mb3JFYWNoKHZhbCA9PiBvYmoucHVzaCh0aGlzLmRlc2VyaWFsaXplKHZhbCwgdHlwZSwgZGF0YSkpKTtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICAgIGlmICh0eXBlID09IFBSSU1JVElWRSkge1xuICAgICAgcmV0dXJuIG1hcDtcbiAgICB9XG5cbiAgICBpZiAodHlwZSA9PSBSZW5kZXJTdG9yZU9iamVjdCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlbmRlclN0b3JlLmRlc2VyaWFsaXplKG1hcCk7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBSZW5kZXJDb21wb25lbnRUeXBlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZGVzZXJpYWxpemVSZW5kZXJDb21wb25lbnRUeXBlKG1hcCk7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBWaWV3RW5jYXBzdWxhdGlvbikge1xuICAgICAgcmV0dXJuIFZJRVdfRU5DQVBTVUxBVElPTl9WQUxVRVNbbWFwXTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IExvY2F0aW9uVHlwZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2Rlc2VyaWFsaXplTG9jYXRpb24obWFwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXCJObyBkZXNlcmlhbGl6ZXIgZm9yIFwiICsgdHlwZS50b1N0cmluZygpKTtcbiAgICB9XG4gIH1cblxuICBtYXBUb09iamVjdChtYXA6IE1hcDxzdHJpbmcsIGFueT4sIHR5cGU/OiBUeXBlKTogT2JqZWN0IHtcbiAgICB2YXIgb2JqZWN0ID0ge307XG4gICAgdmFyIHNlcmlhbGl6ZSA9IGlzUHJlc2VudCh0eXBlKTtcblxuICAgIG1hcC5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICBpZiAoc2VyaWFsaXplKSB7XG4gICAgICAgIG9iamVjdFtrZXldID0gdGhpcy5zZXJpYWxpemUodmFsdWUsIHR5cGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gb2JqZWN0O1xuICB9XG5cbiAgLypcbiAgICogVHJhbnNmb3JtcyBhIEphdmFzY3JpcHQgb2JqZWN0IChTdHJpbmdNYXApIGludG8gYSBNYXA8c3RyaW5nLCBWPlxuICAgKiBJZiB0aGUgdmFsdWVzIG5lZWQgdG8gYmUgZGVzZXJpYWxpemVkIHBhc3MgaW4gdGhlaXIgdHlwZVxuICAgKiBhbmQgdGhleSB3aWxsIGJlIGRlc2VyaWFsaXplZCBiZWZvcmUgYmVpbmcgcGxhY2VkIGluIHRoZSBtYXBcbiAgICovXG4gIG9iamVjdFRvTWFwKG9iajoge1trZXk6IHN0cmluZ106IGFueX0sIHR5cGU/OiBUeXBlLCBkYXRhPzogYW55KTogTWFwPHN0cmluZywgYW55PiB7XG4gICAgaWYgKGlzUHJlc2VudCh0eXBlKSkge1xuICAgICAgdmFyIG1hcCA9IG5ldyBNYXA8c3RyaW5nLCBhbnk+KCk7XG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2gob2JqLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh2YWwsIGtleSkgPT4geyBtYXAuc2V0KGtleSwgdGhpcy5kZXNlcmlhbGl6ZSh2YWwsIHR5cGUsIGRhdGEpKTsgfSk7XG4gICAgICByZXR1cm4gbWFwO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gTWFwV3JhcHBlci5jcmVhdGVGcm9tU3RyaW5nTWFwKG9iaik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfc2VyaWFsaXplTG9jYXRpb24obG9jOiBMb2NhdGlvblR5cGUpOiBPYmplY3Qge1xuICAgIHJldHVybiB7XG4gICAgICAnaHJlZic6IGxvYy5ocmVmLFxuICAgICAgJ3Byb3RvY29sJzogbG9jLnByb3RvY29sLFxuICAgICAgJ2hvc3QnOiBsb2MuaG9zdCxcbiAgICAgICdob3N0bmFtZSc6IGxvYy5ob3N0bmFtZSxcbiAgICAgICdwb3J0JzogbG9jLnBvcnQsXG4gICAgICAncGF0aG5hbWUnOiBsb2MucGF0aG5hbWUsXG4gICAgICAnc2VhcmNoJzogbG9jLnNlYXJjaCxcbiAgICAgICdoYXNoJzogbG9jLmhhc2gsXG4gICAgICAnb3JpZ2luJzogbG9jLm9yaWdpblxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIF9kZXNlcmlhbGl6ZUxvY2F0aW9uKGxvYzoge1trZXk6IHN0cmluZ106IGFueX0pOiBMb2NhdGlvblR5cGUge1xuICAgIHJldHVybiBuZXcgTG9jYXRpb25UeXBlKGxvY1snaHJlZiddLCBsb2NbJ3Byb3RvY29sJ10sIGxvY1snaG9zdCddLCBsb2NbJ2hvc3RuYW1lJ10sIGxvY1sncG9ydCddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY1sncGF0aG5hbWUnXSwgbG9jWydzZWFyY2gnXSwgbG9jWydoYXNoJ10sIGxvY1snb3JpZ2luJ10pO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2VyaWFsaXplUmVuZGVyQ29tcG9uZW50VHlwZShvYmo6IFJlbmRlckNvbXBvbmVudFR5cGUpOiBPYmplY3Qge1xuICAgIHJldHVybiB7XG4gICAgICAnaWQnOiBvYmouaWQsXG4gICAgICAndGVtcGxhdGVVcmwnOiBvYmoudGVtcGxhdGVVcmwsXG4gICAgICAnc2xvdENvdW50Jzogb2JqLnNsb3RDb3VudCxcbiAgICAgICdlbmNhcHN1bGF0aW9uJzogdGhpcy5zZXJpYWxpemUob2JqLmVuY2Fwc3VsYXRpb24sIFZpZXdFbmNhcHN1bGF0aW9uKSxcbiAgICAgICdzdHlsZXMnOiB0aGlzLnNlcmlhbGl6ZShvYmouc3R5bGVzLCBQUklNSVRJVkUpXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgX2Rlc2VyaWFsaXplUmVuZGVyQ29tcG9uZW50VHlwZShtYXA6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogUmVuZGVyQ29tcG9uZW50VHlwZSB7XG4gICAgcmV0dXJuIG5ldyBSZW5kZXJDb21wb25lbnRUeXBlKG1hcFsnaWQnXSwgbWFwWyd0ZW1wbGF0ZVVybCddLCBtYXBbJ3Nsb3RDb3VudCddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlc2VyaWFsaXplKG1hcFsnZW5jYXBzdWxhdGlvbiddLCBWaWV3RW5jYXBzdWxhdGlvbiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVzZXJpYWxpemUobWFwWydzdHlsZXMnXSwgUFJJTUlUSVZFKSk7XG4gIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgUmVuZGVyU3RvcmVPYmplY3Qge31cbiJdfQ==