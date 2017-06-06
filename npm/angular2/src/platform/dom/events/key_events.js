'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
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
                zone.runGuarded(function () { return handler(event); });
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
}(event_manager_1.EventManagerPlugin));
exports.KeyEventsPlugin = KeyEventsPlugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5X2V2ZW50cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZXZlbnRzL2tleV9ldmVudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNEJBQWtCLHVDQUF1QyxDQUFDLENBQUE7QUFDMUQscUJBTU8sMEJBQTBCLENBQUMsQ0FBQTtBQUNsQywyQkFBNEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUM3RSw4QkFBaUMsaUJBQWlCLENBQUMsQ0FBQTtBQUVuRCxtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUVoRCxJQUFJLFlBQVksR0FBRyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZELElBQUksa0JBQWtCLEdBQXVEO0lBQzNFLEtBQUssRUFBRSxVQUFDLEtBQW9CLElBQUssT0FBQSxLQUFLLENBQUMsTUFBTSxFQUFaLENBQVk7SUFDN0MsU0FBUyxFQUFFLFVBQUMsS0FBb0IsSUFBSyxPQUFBLEtBQUssQ0FBQyxPQUFPLEVBQWIsQ0FBYTtJQUNsRCxNQUFNLEVBQUUsVUFBQyxLQUFvQixJQUFLLE9BQUEsS0FBSyxDQUFDLE9BQU8sRUFBYixDQUFhO0lBQy9DLE9BQU8sRUFBRSxVQUFDLEtBQW9CLElBQUssT0FBQSxLQUFLLENBQUMsUUFBUSxFQUFkLENBQWM7Q0FDbEQsQ0FBQztBQUdGO0lBQXFDLG1DQUFrQjtJQUNyRDtRQUFnQixpQkFBTyxDQUFDO0lBQUMsQ0FBQztJQUUxQixrQ0FBUSxHQUFSLFVBQVMsU0FBaUI7UUFDeEIsTUFBTSxDQUFDLGdCQUFTLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFRCwwQ0FBZ0IsR0FBaEIsVUFBaUIsT0FBb0IsRUFBRSxTQUFpQixFQUFFLE9BQWlCO1FBQ3pFLElBQUksV0FBVyxHQUFHLGVBQWUsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFNUQsSUFBSSxjQUFjLEdBQUcsZUFBZSxDQUFDLGFBQWEsQ0FDOUMsT0FBTyxFQUFFLDZCQUFnQixDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUU1RixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztZQUM5QyxNQUFNLENBQUMsaUJBQUcsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLDZCQUFnQixDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsY0FBYyxDQUFDLEVBQzFELGNBQWMsQ0FBQyxDQUFDO1FBQ3pDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVNLDhCQUFjLEdBQXJCLFVBQXNCLFNBQWlCO1FBQ3JDLElBQUksS0FBSyxHQUFhLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFekQsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2pDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7WUFDcEIsQ0FBQyxDQUFDLG9CQUFhLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUM7Z0JBQzdDLG9CQUFhLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuRCxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVELElBQUksR0FBRyxHQUFHLGVBQWUsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFFckQsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLFlBQVksQ0FBQyxPQUFPLENBQUMsVUFBQSxZQUFZO1lBQy9CLEVBQUUsQ0FBQyxDQUFDLHdCQUFXLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlDLHdCQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQztnQkFDeEMsT0FBTyxJQUFJLFlBQVksR0FBRyxHQUFHLENBQUM7WUFDaEMsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxJQUFJLEdBQUcsQ0FBQztRQUVmLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQyw2RUFBNkU7WUFDN0UsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNkLENBQUM7UUFDRCxJQUFJLE1BQU0sR0FBRyw2QkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN2Qyw2QkFBZ0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLGNBQWMsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUMzRCw2QkFBZ0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNqRCxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFTSwrQkFBZSxHQUF0QixVQUF1QixLQUFvQjtRQUN6QyxJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDakIsSUFBSSxHQUFHLEdBQUcsaUJBQUcsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN4QixFQUFFLENBQUMsQ0FBQyxvQkFBYSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25DLEdBQUcsR0FBRyxPQUFPLENBQUMsQ0FBRSxrQkFBa0I7UUFDcEMsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxvQkFBYSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFDLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBRSxvREFBb0Q7UUFDcEUsQ0FBQztRQUNELFlBQVksQ0FBQyxPQUFPLENBQUMsVUFBQSxZQUFZO1lBQy9CLEVBQUUsQ0FBQyxDQUFDLFlBQVksSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixJQUFJLGNBQWMsR0FBRyw2QkFBZ0IsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsWUFBWSxDQUFDLENBQUM7Z0JBQzVFLEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzFCLE9BQU8sSUFBSSxZQUFZLEdBQUcsR0FBRyxDQUFDO2dCQUNoQyxDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxJQUFJLEdBQUcsQ0FBQztRQUNmLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDakIsQ0FBQztJQUVNLDZCQUFhLEdBQXBCLFVBQXFCLE9BQW9CLEVBQUUsT0FBWSxFQUFFLE9BQWlCLEVBQ3JELElBQVk7UUFDL0IsTUFBTSxDQUFDLFVBQUMsS0FBSztZQUNYLEVBQUUsQ0FBQyxDQUFDLG9CQUFhLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMxRSxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQU0sT0FBQSxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQWQsQ0FBYyxDQUFDLENBQUM7WUFDeEMsQ0FBQztRQUNILENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRCxnQkFBZ0I7SUFDVCw2QkFBYSxHQUFwQixVQUFxQixPQUFlO1FBQ2xDLDREQUE0RDtRQUM1RCxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLEtBQUssS0FBSztnQkFDUixNQUFNLENBQUMsUUFBUSxDQUFDO1lBQ2xCO2dCQUNFLE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDbkIsQ0FBQztJQUNILENBQUM7SUExRkg7UUFBQyxlQUFVLEVBQUU7O3VCQUFBO0lBMkZiLHNCQUFDO0FBQUQsQ0FBQyxBQTFGRCxDQUFxQyxrQ0FBa0IsR0EwRnREO0FBMUZZLHVCQUFlLGtCQTBGM0IsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RE9NfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9hZGFwdGVyJztcbmltcG9ydCB7XG4gIGlzUHJlc2VudCxcbiAgaXNCbGFuayxcbiAgU3RyaW5nV3JhcHBlcixcbiAgUmVnRXhwV3JhcHBlcixcbiAgTnVtYmVyV3JhcHBlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyLCBMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7RXZlbnRNYW5hZ2VyUGx1Z2lufSBmcm9tICcuL2V2ZW50X21hbmFnZXInO1xuaW1wb3J0IHtOZ1pvbmV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3pvbmUvbmdfem9uZSc7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcblxudmFyIG1vZGlmaWVyS2V5cyA9IFsnYWx0JywgJ2NvbnRyb2wnLCAnbWV0YScsICdzaGlmdCddO1xudmFyIG1vZGlmaWVyS2V5R2V0dGVyczoge1trZXk6IHN0cmluZ106IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4gYm9vbGVhbn0gPSB7XG4gICdhbHQnOiAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IGV2ZW50LmFsdEtleSxcbiAgJ2NvbnRyb2wnOiAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IGV2ZW50LmN0cmxLZXksXG4gICdtZXRhJzogKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiBldmVudC5tZXRhS2V5LFxuICAnc2hpZnQnOiAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IGV2ZW50LnNoaWZ0S2V5XG59O1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgS2V5RXZlbnRzUGx1Z2luIGV4dGVuZHMgRXZlbnRNYW5hZ2VyUGx1Z2luIHtcbiAgY29uc3RydWN0b3IoKSB7IHN1cGVyKCk7IH1cblxuICBzdXBwb3J0cyhldmVudE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBpc1ByZXNlbnQoS2V5RXZlbnRzUGx1Z2luLnBhcnNlRXZlbnROYW1lKGV2ZW50TmFtZSkpO1xuICB9XG5cbiAgYWRkRXZlbnRMaXN0ZW5lcihlbGVtZW50OiBIVE1MRWxlbWVudCwgZXZlbnROYW1lOiBzdHJpbmcsIGhhbmRsZXI6IEZ1bmN0aW9uKTogRnVuY3Rpb24ge1xuICAgIHZhciBwYXJzZWRFdmVudCA9IEtleUV2ZW50c1BsdWdpbi5wYXJzZUV2ZW50TmFtZShldmVudE5hbWUpO1xuXG4gICAgdmFyIG91dHNpZGVIYW5kbGVyID0gS2V5RXZlbnRzUGx1Z2luLmV2ZW50Q2FsbGJhY2soXG4gICAgICAgIGVsZW1lbnQsIFN0cmluZ01hcFdyYXBwZXIuZ2V0KHBhcnNlZEV2ZW50LCAnZnVsbEtleScpLCBoYW5kbGVyLCB0aGlzLm1hbmFnZXIuZ2V0Wm9uZSgpKTtcblxuICAgIHJldHVybiB0aGlzLm1hbmFnZXIuZ2V0Wm9uZSgpLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIHJldHVybiBET00ub25BbmRDYW5jZWwoZWxlbWVudCwgU3RyaW5nTWFwV3JhcHBlci5nZXQocGFyc2VkRXZlbnQsICdkb21FdmVudE5hbWUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0c2lkZUhhbmRsZXIpO1xuICAgIH0pO1xuICB9XG5cbiAgc3RhdGljIHBhcnNlRXZlbnROYW1lKGV2ZW50TmFtZTogc3RyaW5nKToge1trZXk6IHN0cmluZ106IHN0cmluZ30ge1xuICAgIHZhciBwYXJ0czogc3RyaW5nW10gPSBldmVudE5hbWUudG9Mb3dlckNhc2UoKS5zcGxpdCgnLicpO1xuXG4gICAgdmFyIGRvbUV2ZW50TmFtZSA9IHBhcnRzLnNoaWZ0KCk7XG4gICAgaWYgKChwYXJ0cy5sZW5ndGggPT09IDApIHx8XG4gICAgICAgICEoU3RyaW5nV3JhcHBlci5lcXVhbHMoZG9tRXZlbnROYW1lLCAna2V5ZG93bicpIHx8XG4gICAgICAgICAgU3RyaW5nV3JhcHBlci5lcXVhbHMoZG9tRXZlbnROYW1lLCAna2V5dXAnKSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBrZXkgPSBLZXlFdmVudHNQbHVnaW4uX25vcm1hbGl6ZUtleShwYXJ0cy5wb3AoKSk7XG5cbiAgICB2YXIgZnVsbEtleSA9ICcnO1xuICAgIG1vZGlmaWVyS2V5cy5mb3JFYWNoKG1vZGlmaWVyTmFtZSA9PiB7XG4gICAgICBpZiAoTGlzdFdyYXBwZXIuY29udGFpbnMocGFydHMsIG1vZGlmaWVyTmFtZSkpIHtcbiAgICAgICAgTGlzdFdyYXBwZXIucmVtb3ZlKHBhcnRzLCBtb2RpZmllck5hbWUpO1xuICAgICAgICBmdWxsS2V5ICs9IG1vZGlmaWVyTmFtZSArICcuJztcbiAgICAgIH1cbiAgICB9KTtcbiAgICBmdWxsS2V5ICs9IGtleTtcblxuICAgIGlmIChwYXJ0cy5sZW5ndGggIT0gMCB8fCBrZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAvLyByZXR1cm5pbmcgbnVsbCBpbnN0ZWFkIG9mIHRocm93aW5nIHRvIGxldCBhbm90aGVyIHBsdWdpbiBwcm9jZXNzIHRoZSBldmVudFxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHZhciByZXN1bHQgPSBTdHJpbmdNYXBXcmFwcGVyLmNyZWF0ZSgpO1xuICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KHJlc3VsdCwgJ2RvbUV2ZW50TmFtZScsIGRvbUV2ZW50TmFtZSk7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5zZXQocmVzdWx0LCAnZnVsbEtleScsIGZ1bGxLZXkpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBzdGF0aWMgZ2V0RXZlbnRGdWxsS2V5KGV2ZW50OiBLZXlib2FyZEV2ZW50KTogc3RyaW5nIHtcbiAgICB2YXIgZnVsbEtleSA9ICcnO1xuICAgIHZhciBrZXkgPSBET00uZ2V0RXZlbnRLZXkoZXZlbnQpO1xuICAgIGtleSA9IGtleS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChTdHJpbmdXcmFwcGVyLmVxdWFscyhrZXksICcgJykpIHtcbiAgICAgIGtleSA9ICdzcGFjZSc7ICAvLyBmb3IgcmVhZGFiaWxpdHlcbiAgICB9IGVsc2UgaWYgKFN0cmluZ1dyYXBwZXIuZXF1YWxzKGtleSwgJy4nKSkge1xuICAgICAga2V5ID0gJ2RvdCc7ICAvLyBiZWNhdXNlICcuJyBpcyB1c2VkIGFzIGEgc2VwYXJhdG9yIGluIGV2ZW50IG5hbWVzXG4gICAgfVxuICAgIG1vZGlmaWVyS2V5cy5mb3JFYWNoKG1vZGlmaWVyTmFtZSA9PiB7XG4gICAgICBpZiAobW9kaWZpZXJOYW1lICE9IGtleSkge1xuICAgICAgICB2YXIgbW9kaWZpZXJHZXR0ZXIgPSBTdHJpbmdNYXBXcmFwcGVyLmdldChtb2RpZmllcktleUdldHRlcnMsIG1vZGlmaWVyTmFtZSk7XG4gICAgICAgIGlmIChtb2RpZmllckdldHRlcihldmVudCkpIHtcbiAgICAgICAgICBmdWxsS2V5ICs9IG1vZGlmaWVyTmFtZSArICcuJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIGZ1bGxLZXkgKz0ga2V5O1xuICAgIHJldHVybiBmdWxsS2V5O1xuICB9XG5cbiAgc3RhdGljIGV2ZW50Q2FsbGJhY2soZWxlbWVudDogSFRNTEVsZW1lbnQsIGZ1bGxLZXk6IGFueSwgaGFuZGxlcjogRnVuY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgIHpvbmU6IE5nWm9uZSk6IEZ1bmN0aW9uIHtcbiAgICByZXR1cm4gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoU3RyaW5nV3JhcHBlci5lcXVhbHMoS2V5RXZlbnRzUGx1Z2luLmdldEV2ZW50RnVsbEtleShldmVudCksIGZ1bGxLZXkpKSB7XG4gICAgICAgIHpvbmUucnVuR3VhcmRlZCgoKSA9PiBoYW5kbGVyKGV2ZW50KSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgc3RhdGljIF9ub3JtYWxpemVLZXkoa2V5TmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBUT0RPOiBzd2l0Y2ggdG8gYSBTdHJpbmdNYXAgaWYgdGhlIG1hcHBpbmcgZ3Jvd3MgdG9vIG11Y2hcbiAgICBzd2l0Y2ggKGtleU5hbWUpIHtcbiAgICAgIGNhc2UgJ2VzYyc6XG4gICAgICAgIHJldHVybiAnZXNjYXBlJztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBrZXlOYW1lO1xuICAgIH1cbiAgfVxufVxuIl19