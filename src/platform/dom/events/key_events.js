'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
        return this.manager.getZone().runOutsideAngular(function () {
            return dom_adapter_1.DOM.onAndCancel(element, collection_1.StringMapWrapper.get(parsedEvent, 'domEventName'), outsideHandler);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5X2V2ZW50cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZXZlbnRzL2tleV9ldmVudHMudHMiXSwibmFtZXMiOlsiS2V5RXZlbnRzUGx1Z2luIiwiS2V5RXZlbnRzUGx1Z2luLmNvbnN0cnVjdG9yIiwiS2V5RXZlbnRzUGx1Z2luLnN1cHBvcnRzIiwiS2V5RXZlbnRzUGx1Z2luLmFkZEV2ZW50TGlzdGVuZXIiLCJLZXlFdmVudHNQbHVnaW4ucGFyc2VFdmVudE5hbWUiLCJLZXlFdmVudHNQbHVnaW4uZ2V0RXZlbnRGdWxsS2V5IiwiS2V5RXZlbnRzUGx1Z2luLmV2ZW50Q2FsbGJhY2siLCJLZXlFdmVudHNQbHVnaW4uX25vcm1hbGl6ZUtleSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSw0QkFBa0IsdUNBQXVDLENBQUMsQ0FBQTtBQUMxRCxxQkFNTywwQkFBMEIsQ0FBQyxDQUFBO0FBQ2xDLDJCQUE0QyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdFLDhCQUFpQyxpQkFBaUIsQ0FBQyxDQUFBO0FBRW5ELG1CQUF5QixzQkFBc0IsQ0FBQyxDQUFBO0FBRWhELElBQUksWUFBWSxHQUFHLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDdkQsSUFBSSxrQkFBa0IsR0FBdUQ7SUFDM0UsS0FBSyxFQUFFLFVBQUMsS0FBb0IsSUFBSyxPQUFBLEtBQUssQ0FBQyxNQUFNLEVBQVosQ0FBWTtJQUM3QyxTQUFTLEVBQUUsVUFBQyxLQUFvQixJQUFLLE9BQUEsS0FBSyxDQUFDLE9BQU8sRUFBYixDQUFhO0lBQ2xELE1BQU0sRUFBRSxVQUFDLEtBQW9CLElBQUssT0FBQSxLQUFLLENBQUMsT0FBTyxFQUFiLENBQWE7SUFDL0MsT0FBTyxFQUFFLFVBQUMsS0FBb0IsSUFBSyxPQUFBLEtBQUssQ0FBQyxRQUFRLEVBQWQsQ0FBYztDQUNsRCxDQUFDO0FBRUY7SUFD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dUJBQWUsa0JBMEYzQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtET019IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX2FkYXB0ZXInO1xuaW1wb3J0IHtcbiAgaXNQcmVzZW50LFxuICBpc0JsYW5rLFxuICBTdHJpbmdXcmFwcGVyLFxuICBSZWdFeHBXcmFwcGVyLFxuICBOdW1iZXJXcmFwcGVyXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXIsIExpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtFdmVudE1hbmFnZXJQbHVnaW59IGZyb20gJy4vZXZlbnRfbWFuYWdlcic7XG5pbXBvcnQge05nWm9uZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvem9uZS9uZ196b25lJztcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuXG52YXIgbW9kaWZpZXJLZXlzID0gWydhbHQnLCAnY29udHJvbCcsICdtZXRhJywgJ3NoaWZ0J107XG52YXIgbW9kaWZpZXJLZXlHZXR0ZXJzOiB7W2tleTogc3RyaW5nXTogKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiBib29sZWFufSA9IHtcbiAgJ2FsdCc6IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4gZXZlbnQuYWx0S2V5LFxuICAnY29udHJvbCc6IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4gZXZlbnQuY3RybEtleSxcbiAgJ21ldGEnOiAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IGV2ZW50Lm1ldGFLZXksXG4gICdzaGlmdCc6IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4gZXZlbnQuc2hpZnRLZXlcbn07XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBLZXlFdmVudHNQbHVnaW4gZXh0ZW5kcyBFdmVudE1hbmFnZXJQbHVnaW4ge1xuICBjb25zdHJ1Y3RvcigpIHsgc3VwZXIoKTsgfVxuXG4gIHN1cHBvcnRzKGV2ZW50TmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzUHJlc2VudChLZXlFdmVudHNQbHVnaW4ucGFyc2VFdmVudE5hbWUoZXZlbnROYW1lKSk7XG4gIH1cblxuICBhZGRFdmVudExpc3RlbmVyKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBldmVudE5hbWU6IHN0cmluZywgaGFuZGxlcjogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gICAgdmFyIHBhcnNlZEV2ZW50ID0gS2V5RXZlbnRzUGx1Z2luLnBhcnNlRXZlbnROYW1lKGV2ZW50TmFtZSk7XG5cbiAgICB2YXIgb3V0c2lkZUhhbmRsZXIgPSBLZXlFdmVudHNQbHVnaW4uZXZlbnRDYWxsYmFjayhcbiAgICAgICAgZWxlbWVudCwgU3RyaW5nTWFwV3JhcHBlci5nZXQocGFyc2VkRXZlbnQsICdmdWxsS2V5JyksIGhhbmRsZXIsIHRoaXMubWFuYWdlci5nZXRab25lKCkpO1xuXG4gICAgcmV0dXJuIHRoaXMubWFuYWdlci5nZXRab25lKCkucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgcmV0dXJuIERPTS5vbkFuZENhbmNlbChlbGVtZW50LCBTdHJpbmdNYXBXcmFwcGVyLmdldChwYXJzZWRFdmVudCwgJ2RvbUV2ZW50TmFtZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRzaWRlSGFuZGxlcik7XG4gICAgfSk7XG4gIH1cblxuICBzdGF0aWMgcGFyc2VFdmVudE5hbWUoZXZlbnROYW1lOiBzdHJpbmcpOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSB7XG4gICAgdmFyIHBhcnRzOiBzdHJpbmdbXSA9IGV2ZW50TmFtZS50b0xvd2VyQ2FzZSgpLnNwbGl0KCcuJyk7XG5cbiAgICB2YXIgZG9tRXZlbnROYW1lID0gcGFydHMuc2hpZnQoKTtcbiAgICBpZiAoKHBhcnRzLmxlbmd0aCA9PT0gMCkgfHxcbiAgICAgICAgIShTdHJpbmdXcmFwcGVyLmVxdWFscyhkb21FdmVudE5hbWUsICdrZXlkb3duJykgfHxcbiAgICAgICAgICBTdHJpbmdXcmFwcGVyLmVxdWFscyhkb21FdmVudE5hbWUsICdrZXl1cCcpKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIGtleSA9IEtleUV2ZW50c1BsdWdpbi5fbm9ybWFsaXplS2V5KHBhcnRzLnBvcCgpKTtcblxuICAgIHZhciBmdWxsS2V5ID0gJyc7XG4gICAgbW9kaWZpZXJLZXlzLmZvckVhY2gobW9kaWZpZXJOYW1lID0+IHtcbiAgICAgIGlmIChMaXN0V3JhcHBlci5jb250YWlucyhwYXJ0cywgbW9kaWZpZXJOYW1lKSkge1xuICAgICAgICBMaXN0V3JhcHBlci5yZW1vdmUocGFydHMsIG1vZGlmaWVyTmFtZSk7XG4gICAgICAgIGZ1bGxLZXkgKz0gbW9kaWZpZXJOYW1lICsgJy4nO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGZ1bGxLZXkgKz0ga2V5O1xuXG4gICAgaWYgKHBhcnRzLmxlbmd0aCAhPSAwIHx8IGtleS5sZW5ndGggPT09IDApIHtcbiAgICAgIC8vIHJldHVybmluZyBudWxsIGluc3RlYWQgb2YgdGhyb3dpbmcgdG8gbGV0IGFub3RoZXIgcGx1Z2luIHByb2Nlc3MgdGhlIGV2ZW50XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdmFyIHJlc3VsdCA9IFN0cmluZ01hcFdyYXBwZXIuY3JlYXRlKCk7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5zZXQocmVzdWx0LCAnZG9tRXZlbnROYW1lJywgZG9tRXZlbnROYW1lKTtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChyZXN1bHQsICdmdWxsS2V5JywgZnVsbEtleSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHN0YXRpYyBnZXRFdmVudEZ1bGxLZXkoZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiBzdHJpbmcge1xuICAgIHZhciBmdWxsS2V5ID0gJyc7XG4gICAgdmFyIGtleSA9IERPTS5nZXRFdmVudEtleShldmVudCk7XG4gICAga2V5ID0ga2V5LnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKFN0cmluZ1dyYXBwZXIuZXF1YWxzKGtleSwgJyAnKSkge1xuICAgICAga2V5ID0gJ3NwYWNlJzsgIC8vIGZvciByZWFkYWJpbGl0eVxuICAgIH0gZWxzZSBpZiAoU3RyaW5nV3JhcHBlci5lcXVhbHMoa2V5LCAnLicpKSB7XG4gICAgICBrZXkgPSAnZG90JzsgIC8vIGJlY2F1c2UgJy4nIGlzIHVzZWQgYXMgYSBzZXBhcmF0b3IgaW4gZXZlbnQgbmFtZXNcbiAgICB9XG4gICAgbW9kaWZpZXJLZXlzLmZvckVhY2gobW9kaWZpZXJOYW1lID0+IHtcbiAgICAgIGlmIChtb2RpZmllck5hbWUgIT0ga2V5KSB7XG4gICAgICAgIHZhciBtb2RpZmllckdldHRlciA9IFN0cmluZ01hcFdyYXBwZXIuZ2V0KG1vZGlmaWVyS2V5R2V0dGVycywgbW9kaWZpZXJOYW1lKTtcbiAgICAgICAgaWYgKG1vZGlmaWVyR2V0dGVyKGV2ZW50KSkge1xuICAgICAgICAgIGZ1bGxLZXkgKz0gbW9kaWZpZXJOYW1lICsgJy4nO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgZnVsbEtleSArPSBrZXk7XG4gICAgcmV0dXJuIGZ1bGxLZXk7XG4gIH1cblxuICBzdGF0aWMgZXZlbnRDYWxsYmFjayhlbGVtZW50OiBIVE1MRWxlbWVudCwgZnVsbEtleTogYW55LCBoYW5kbGVyOiBGdW5jdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgem9uZTogTmdab25lKTogRnVuY3Rpb24ge1xuICAgIHJldHVybiAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChTdHJpbmdXcmFwcGVyLmVxdWFscyhLZXlFdmVudHNQbHVnaW4uZ2V0RXZlbnRGdWxsS2V5KGV2ZW50KSwgZnVsbEtleSkpIHtcbiAgICAgICAgem9uZS5ydW4oKCkgPT4gaGFuZGxlcihldmVudCkpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIHN0YXRpYyBfbm9ybWFsaXplS2V5KGtleU5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8gVE9ETzogc3dpdGNoIHRvIGEgU3RyaW5nTWFwIGlmIHRoZSBtYXBwaW5nIGdyb3dzIHRvbyBtdWNoXG4gICAgc3dpdGNoIChrZXlOYW1lKSB7XG4gICAgICBjYXNlICdlc2MnOlxuICAgICAgICByZXR1cm4gJ2VzY2FwZSc7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4ga2V5TmFtZTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==