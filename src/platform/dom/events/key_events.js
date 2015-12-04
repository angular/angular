'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var dom_adapter_1 = require('angular2/src/platform/dom/dom_adapter');
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var event_manager_1 = require('./event_manager');
var di_1 = require('angular2/src/core/di');
var modifierKeys = ['alt', 'control', 'meta', 'shift'];
var modifierKeyGetters = {
    'alt': function (event) { return event.altKey; },
    'control': function (event) { return event.ctrlKey; },
    'meta': function (event) { return event.metaKey; },
    'shift': function (event) { return event.shiftKey; }
};
var KeyEventsPlugin = (function (_super) {
    __extends(KeyEventsPlugin, _super);
    function KeyEventsPlugin() {
        _super.call(this);
    }
    KeyEventsPlugin.prototype.supports = function (eventName) {
        return lang_1.isPresent(KeyEventsPlugin.parseEventName(eventName));
    };
    KeyEventsPlugin.prototype.addEventListener = function (element, eventName, handler) {
        var parsedEvent = KeyEventsPlugin.parseEventName(eventName);
        var outsideHandler = KeyEventsPlugin.eventCallback(element, collection_1.StringMapWrapper.get(parsedEvent, 'fullKey'), handler, this.manager.getZone());
        this.manager.getZone().runOutsideAngular(function () {
            dom_adapter_1.DOM.on(element, collection_1.StringMapWrapper.get(parsedEvent, 'domEventName'), outsideHandler);
        });
    };
    KeyEventsPlugin.parseEventName = function (eventName) {
        var parts = eventName.toLowerCase().split('.');
        var domEventName = parts.shift();
        if ((parts.length === 0) ||
            !(lang_1.StringWrapper.equals(domEventName, 'keydown') ||
                lang_1.StringWrapper.equals(domEventName, 'keyup'))) {
            return null;
        }
        var key = KeyEventsPlugin._normalizeKey(parts.pop());
        var fullKey = '';
        modifierKeys.forEach(function (modifierName) {
            if (collection_1.ListWrapper.contains(parts, modifierName)) {
                collection_1.ListWrapper.remove(parts, modifierName);
                fullKey += modifierName + '.';
            }
        });
        fullKey += key;
        if (parts.length != 0 || key.length === 0) {
            // returning null instead of throwing to let another plugin process the event
            return null;
        }
        var result = collection_1.StringMapWrapper.create();
        collection_1.StringMapWrapper.set(result, 'domEventName', domEventName);
        collection_1.StringMapWrapper.set(result, 'fullKey', fullKey);
        return result;
    };
    KeyEventsPlugin.getEventFullKey = function (event) {
        var fullKey = '';
        var key = dom_adapter_1.DOM.getEventKey(event);
        key = key.toLowerCase();
        if (lang_1.StringWrapper.equals(key, ' ')) {
            key = 'space'; // for readability
        }
        else if (lang_1.StringWrapper.equals(key, '.')) {
            key = 'dot'; // because '.' is used as a separator in event names
        }
        modifierKeys.forEach(function (modifierName) {
            if (modifierName != key) {
                var modifierGetter = collection_1.StringMapWrapper.get(modifierKeyGetters, modifierName);
                if (modifierGetter(event)) {
                    fullKey += modifierName + '.';
                }
            }
        });
        fullKey += key;
        return fullKey;
    };
    KeyEventsPlugin.eventCallback = function (element, fullKey, handler, zone) {
        return function (event) {
            if (lang_1.StringWrapper.equals(KeyEventsPlugin.getEventFullKey(event), fullKey)) {
                zone.run(function () { return handler(event); });
            }
        };
    };
    /** @internal */
    KeyEventsPlugin._normalizeKey = function (keyName) {
        // TODO: switch to a StringMap if the mapping grows too much
        switch (keyName) {
            case 'esc':
                return 'escape';
            default:
                return keyName;
        }
    };
    KeyEventsPlugin = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], KeyEventsPlugin);
    return KeyEventsPlugin;
})(event_manager_1.EventManagerPlugin);
exports.KeyEventsPlugin = KeyEventsPlugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5X2V2ZW50cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZXZlbnRzL2tleV9ldmVudHMudHMiXSwibmFtZXMiOlsiS2V5RXZlbnRzUGx1Z2luIiwiS2V5RXZlbnRzUGx1Z2luLmNvbnN0cnVjdG9yIiwiS2V5RXZlbnRzUGx1Z2luLnN1cHBvcnRzIiwiS2V5RXZlbnRzUGx1Z2luLmFkZEV2ZW50TGlzdGVuZXIiLCJLZXlFdmVudHNQbHVnaW4ucGFyc2VFdmVudE5hbWUiLCJLZXlFdmVudHNQbHVnaW4uZ2V0RXZlbnRGdWxsS2V5IiwiS2V5RXZlbnRzUGx1Z2luLmV2ZW50Q2FsbGJhY2siLCJLZXlFdmVudHNQbHVnaW4uX25vcm1hbGl6ZUtleSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDRCQUFrQix1Q0FBdUMsQ0FBQyxDQUFBO0FBQzFELHFCQU1PLDBCQUEwQixDQUFDLENBQUE7QUFDbEMsMkJBQTRDLGdDQUFnQyxDQUFDLENBQUE7QUFDN0UsOEJBQWlDLGlCQUFpQixDQUFDLENBQUE7QUFFbkQsbUJBQXlCLHNCQUFzQixDQUFDLENBQUE7QUFFaEQsSUFBSSxZQUFZLEdBQUcsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN2RCxJQUFJLGtCQUFrQixHQUF1RDtJQUMzRSxLQUFLLEVBQUUsVUFBQyxLQUFvQixJQUFLLE9BQUEsS0FBSyxDQUFDLE1BQU0sRUFBWixDQUFZO0lBQzdDLFNBQVMsRUFBRSxVQUFDLEtBQW9CLElBQUssT0FBQSxLQUFLLENBQUMsT0FBTyxFQUFiLENBQWE7SUFDbEQsTUFBTSxFQUFFLFVBQUMsS0FBb0IsSUFBSyxPQUFBLEtBQUssQ0FBQyxPQUFPLEVBQWIsQ0FBYTtJQUMvQyxPQUFPLEVBQUUsVUFBQyxLQUFvQixJQUFLLE9BQUEsS0FBSyxDQUFDLFFBQVEsRUFBZCxDQUFjO0NBQ2xELENBQUM7QUFFRjtJ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dXJjZXNDb250ZW50IjpbImltcG9ydCB7RE9NfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9hZGFwdGVyJztcbmltcG9ydCB7XG4gIGlzUHJlc2VudCxcbiAgaXNCbGFuayxcbiAgU3RyaW5nV3JhcHBlcixcbiAgUmVnRXhwV3JhcHBlcixcbiAgTnVtYmVyV3JhcHBlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyLCBMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7RXZlbnRNYW5hZ2VyUGx1Z2lufSBmcm9tICcuL2V2ZW50X21hbmFnZXInO1xuaW1wb3J0IHtOZ1pvbmV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3pvbmUvbmdfem9uZSc7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcblxudmFyIG1vZGlmaWVyS2V5cyA9IFsnYWx0JywgJ2NvbnRyb2wnLCAnbWV0YScsICdzaGlmdCddO1xudmFyIG1vZGlmaWVyS2V5R2V0dGVyczoge1trZXk6IHN0cmluZ106IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4gYm9vbGVhbn0gPSB7XG4gICdhbHQnOiAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IGV2ZW50LmFsdEtleSxcbiAgJ2NvbnRyb2wnOiAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IGV2ZW50LmN0cmxLZXksXG4gICdtZXRhJzogKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiBldmVudC5tZXRhS2V5LFxuICAnc2hpZnQnOiAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IGV2ZW50LnNoaWZ0S2V5XG59O1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgS2V5RXZlbnRzUGx1Z2luIGV4dGVuZHMgRXZlbnRNYW5hZ2VyUGx1Z2luIHtcbiAgY29uc3RydWN0b3IoKSB7IHN1cGVyKCk7IH1cblxuICBzdXBwb3J0cyhldmVudE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBpc1ByZXNlbnQoS2V5RXZlbnRzUGx1Z2luLnBhcnNlRXZlbnROYW1lKGV2ZW50TmFtZSkpO1xuICB9XG5cbiAgYWRkRXZlbnRMaXN0ZW5lcihlbGVtZW50OiBIVE1MRWxlbWVudCwgZXZlbnROYW1lOiBzdHJpbmcsIGhhbmRsZXI6IChFdmVudDogYW55KSA9PiBhbnkpIHtcbiAgICB2YXIgcGFyc2VkRXZlbnQgPSBLZXlFdmVudHNQbHVnaW4ucGFyc2VFdmVudE5hbWUoZXZlbnROYW1lKTtcblxuICAgIHZhciBvdXRzaWRlSGFuZGxlciA9IEtleUV2ZW50c1BsdWdpbi5ldmVudENhbGxiYWNrKFxuICAgICAgICBlbGVtZW50LCBTdHJpbmdNYXBXcmFwcGVyLmdldChwYXJzZWRFdmVudCwgJ2Z1bGxLZXknKSwgaGFuZGxlciwgdGhpcy5tYW5hZ2VyLmdldFpvbmUoKSk7XG5cbiAgICB0aGlzLm1hbmFnZXIuZ2V0Wm9uZSgpLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIERPTS5vbihlbGVtZW50LCBTdHJpbmdNYXBXcmFwcGVyLmdldChwYXJzZWRFdmVudCwgJ2RvbUV2ZW50TmFtZScpLCBvdXRzaWRlSGFuZGxlcik7XG4gICAgfSk7XG4gIH1cblxuICBzdGF0aWMgcGFyc2VFdmVudE5hbWUoZXZlbnROYW1lOiBzdHJpbmcpOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSB7XG4gICAgdmFyIHBhcnRzOiBzdHJpbmdbXSA9IGV2ZW50TmFtZS50b0xvd2VyQ2FzZSgpLnNwbGl0KCcuJyk7XG5cbiAgICB2YXIgZG9tRXZlbnROYW1lID0gcGFydHMuc2hpZnQoKTtcbiAgICBpZiAoKHBhcnRzLmxlbmd0aCA9PT0gMCkgfHxcbiAgICAgICAgIShTdHJpbmdXcmFwcGVyLmVxdWFscyhkb21FdmVudE5hbWUsICdrZXlkb3duJykgfHxcbiAgICAgICAgICBTdHJpbmdXcmFwcGVyLmVxdWFscyhkb21FdmVudE5hbWUsICdrZXl1cCcpKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIGtleSA9IEtleUV2ZW50c1BsdWdpbi5fbm9ybWFsaXplS2V5KHBhcnRzLnBvcCgpKTtcblxuICAgIHZhciBmdWxsS2V5ID0gJyc7XG4gICAgbW9kaWZpZXJLZXlzLmZvckVhY2gobW9kaWZpZXJOYW1lID0+IHtcbiAgICAgIGlmIChMaXN0V3JhcHBlci5jb250YWlucyhwYXJ0cywgbW9kaWZpZXJOYW1lKSkge1xuICAgICAgICBMaXN0V3JhcHBlci5yZW1vdmUocGFydHMsIG1vZGlmaWVyTmFtZSk7XG4gICAgICAgIGZ1bGxLZXkgKz0gbW9kaWZpZXJOYW1lICsgJy4nO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGZ1bGxLZXkgKz0ga2V5O1xuXG4gICAgaWYgKHBhcnRzLmxlbmd0aCAhPSAwIHx8IGtleS5sZW5ndGggPT09IDApIHtcbiAgICAgIC8vIHJldHVybmluZyBudWxsIGluc3RlYWQgb2YgdGhyb3dpbmcgdG8gbGV0IGFub3RoZXIgcGx1Z2luIHByb2Nlc3MgdGhlIGV2ZW50XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdmFyIHJlc3VsdCA9IFN0cmluZ01hcFdyYXBwZXIuY3JlYXRlKCk7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5zZXQocmVzdWx0LCAnZG9tRXZlbnROYW1lJywgZG9tRXZlbnROYW1lKTtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChyZXN1bHQsICdmdWxsS2V5JywgZnVsbEtleSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHN0YXRpYyBnZXRFdmVudEZ1bGxLZXkoZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiBzdHJpbmcge1xuICAgIHZhciBmdWxsS2V5ID0gJyc7XG4gICAgdmFyIGtleSA9IERPTS5nZXRFdmVudEtleShldmVudCk7XG4gICAga2V5ID0ga2V5LnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKFN0cmluZ1dyYXBwZXIuZXF1YWxzKGtleSwgJyAnKSkge1xuICAgICAga2V5ID0gJ3NwYWNlJzsgIC8vIGZvciByZWFkYWJpbGl0eVxuICAgIH0gZWxzZSBpZiAoU3RyaW5nV3JhcHBlci5lcXVhbHMoa2V5LCAnLicpKSB7XG4gICAgICBrZXkgPSAnZG90JzsgIC8vIGJlY2F1c2UgJy4nIGlzIHVzZWQgYXMgYSBzZXBhcmF0b3IgaW4gZXZlbnQgbmFtZXNcbiAgICB9XG4gICAgbW9kaWZpZXJLZXlzLmZvckVhY2gobW9kaWZpZXJOYW1lID0+IHtcbiAgICAgIGlmIChtb2RpZmllck5hbWUgIT0ga2V5KSB7XG4gICAgICAgIHZhciBtb2RpZmllckdldHRlciA9IFN0cmluZ01hcFdyYXBwZXIuZ2V0KG1vZGlmaWVyS2V5R2V0dGVycywgbW9kaWZpZXJOYW1lKTtcbiAgICAgICAgaWYgKG1vZGlmaWVyR2V0dGVyKGV2ZW50KSkge1xuICAgICAgICAgIGZ1bGxLZXkgKz0gbW9kaWZpZXJOYW1lICsgJy4nO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgZnVsbEtleSArPSBrZXk7XG4gICAgcmV0dXJuIGZ1bGxLZXk7XG4gIH1cblxuICBzdGF0aWMgZXZlbnRDYWxsYmFjayhlbGVtZW50OiBIVE1MRWxlbWVudCwgZnVsbEtleTogYW55LCBoYW5kbGVyOiAoZTogRXZlbnQpID0+IGFueSxcbiAgICAgICAgICAgICAgICAgICAgICAgem9uZTogTmdab25lKTogKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB2b2lkIHtcbiAgICByZXR1cm4gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoU3RyaW5nV3JhcHBlci5lcXVhbHMoS2V5RXZlbnRzUGx1Z2luLmdldEV2ZW50RnVsbEtleShldmVudCksIGZ1bGxLZXkpKSB7XG4gICAgICAgIHpvbmUucnVuKCgpID0+IGhhbmRsZXIoZXZlbnQpKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBzdGF0aWMgX25vcm1hbGl6ZUtleShrZXlOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIFRPRE86IHN3aXRjaCB0byBhIFN0cmluZ01hcCBpZiB0aGUgbWFwcGluZyBncm93cyB0b28gbXVjaFxuICAgIHN3aXRjaCAoa2V5TmFtZSkge1xuICAgICAgY2FzZSAnZXNjJzpcbiAgICAgICAgcmV0dXJuICdlc2NhcGUnO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGtleU5hbWU7XG4gICAgfVxuICB9XG59XG4iXX0=