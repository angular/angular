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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5X2V2ZW50cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZXZlbnRzL2tleV9ldmVudHMudHMiXSwibmFtZXMiOlsiS2V5RXZlbnRzUGx1Z2luIiwiS2V5RXZlbnRzUGx1Z2luLmNvbnN0cnVjdG9yIiwiS2V5RXZlbnRzUGx1Z2luLnN1cHBvcnRzIiwiS2V5RXZlbnRzUGx1Z2luLmFkZEV2ZW50TGlzdGVuZXIiLCJLZXlFdmVudHNQbHVnaW4ucGFyc2VFdmVudE5hbWUiLCJLZXlFdmVudHNQbHVnaW4uZ2V0RXZlbnRGdWxsS2V5IiwiS2V5RXZlbnRzUGx1Z2luLmV2ZW50Q2FsbGJhY2siLCJLZXlFdmVudHNQbHVnaW4uX25vcm1hbGl6ZUtleSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSw0QkFBa0IsdUNBQXVDLENBQUMsQ0FBQTtBQUMxRCxxQkFNTywwQkFBMEIsQ0FBQyxDQUFBO0FBQ2xDLDJCQUE0QyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdFLDhCQUFpQyxpQkFBaUIsQ0FBQyxDQUFBO0FBRW5ELG1CQUF5QixzQkFBc0IsQ0FBQyxDQUFBO0FBRWhELElBQUksWUFBWSxHQUFHLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDdkQsSUFBSSxrQkFBa0IsR0FBdUQ7SUFDM0UsS0FBSyxFQUFFLFVBQUMsS0FBb0IsSUFBSyxPQUFBLEtBQUssQ0FBQyxNQUFNLEVBQVosQ0FBWTtJQUM3QyxTQUFTLEVBQUUsVUFBQyxLQUFvQixJQUFLLE9BQUEsS0FBSyxDQUFDLE9BQU8sRUFBYixDQUFhO0lBQ2xELE1BQU0sRUFBRSxVQUFDLEtBQW9CLElBQUssT0FBQSxLQUFLLENBQUMsT0FBTyxFQUFiLENBQWE7SUFDL0MsT0FBTyxFQUFFLFVBQUMsS0FBb0IsSUFBSyxPQUFBLEtBQUssQ0FBQyxRQUFRLEVBQWQsQ0FBYztDQUNsRCxDQUFDO0FBRUY7SUFD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Y2VzQ29udGVudCI6WyJpbXBvcnQge0RPTX0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fYWRhcHRlcic7XG5pbXBvcnQge1xuICBpc1ByZXNlbnQsXG4gIGlzQmxhbmssXG4gIFN0cmluZ1dyYXBwZXIsXG4gIFJlZ0V4cFdyYXBwZXIsXG4gIE51bWJlcldyYXBwZXJcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7U3RyaW5nTWFwV3JhcHBlciwgTGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge0V2ZW50TWFuYWdlclBsdWdpbn0gZnJvbSAnLi9ldmVudF9tYW5hZ2VyJztcbmltcG9ydCB7Tmdab25lfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS96b25lL25nX3pvbmUnO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5cbnZhciBtb2RpZmllcktleXMgPSBbJ2FsdCcsICdjb250cm9sJywgJ21ldGEnLCAnc2hpZnQnXTtcbnZhciBtb2RpZmllcktleUdldHRlcnM6IHtba2V5OiBzdHJpbmddOiAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IGJvb2xlYW59ID0ge1xuICAnYWx0JzogKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiBldmVudC5hbHRLZXksXG4gICdjb250cm9sJzogKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiBldmVudC5jdHJsS2V5LFxuICAnbWV0YSc6IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4gZXZlbnQubWV0YUtleSxcbiAgJ3NoaWZ0JzogKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiBldmVudC5zaGlmdEtleVxufTtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEtleUV2ZW50c1BsdWdpbiBleHRlbmRzIEV2ZW50TWFuYWdlclBsdWdpbiB7XG4gIGNvbnN0cnVjdG9yKCkgeyBzdXBlcigpOyB9XG5cbiAgc3VwcG9ydHMoZXZlbnROYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaXNQcmVzZW50KEtleUV2ZW50c1BsdWdpbi5wYXJzZUV2ZW50TmFtZShldmVudE5hbWUpKTtcbiAgfVxuXG4gIGFkZEV2ZW50TGlzdGVuZXIoZWxlbWVudDogSFRNTEVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBoYW5kbGVyOiAoRXZlbnQ6IGFueSkgPT4gYW55KSB7XG4gICAgdmFyIHBhcnNlZEV2ZW50ID0gS2V5RXZlbnRzUGx1Z2luLnBhcnNlRXZlbnROYW1lKGV2ZW50TmFtZSk7XG5cbiAgICB2YXIgb3V0c2lkZUhhbmRsZXIgPSBLZXlFdmVudHNQbHVnaW4uZXZlbnRDYWxsYmFjayhcbiAgICAgICAgZWxlbWVudCwgU3RyaW5nTWFwV3JhcHBlci5nZXQocGFyc2VkRXZlbnQsICdmdWxsS2V5JyksIGhhbmRsZXIsIHRoaXMubWFuYWdlci5nZXRab25lKCkpO1xuXG4gICAgdGhpcy5tYW5hZ2VyLmdldFpvbmUoKS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICBET00ub24oZWxlbWVudCwgU3RyaW5nTWFwV3JhcHBlci5nZXQocGFyc2VkRXZlbnQsICdkb21FdmVudE5hbWUnKSwgb3V0c2lkZUhhbmRsZXIpO1xuICAgIH0pO1xuICB9XG5cbiAgc3RhdGljIHBhcnNlRXZlbnROYW1lKGV2ZW50TmFtZTogc3RyaW5nKToge1trZXk6IHN0cmluZ106IHN0cmluZ30ge1xuICAgIHZhciBwYXJ0czogc3RyaW5nW10gPSBldmVudE5hbWUudG9Mb3dlckNhc2UoKS5zcGxpdCgnLicpO1xuXG4gICAgdmFyIGRvbUV2ZW50TmFtZSA9IHBhcnRzLnNoaWZ0KCk7XG4gICAgaWYgKChwYXJ0cy5sZW5ndGggPT09IDApIHx8XG4gICAgICAgICEoU3RyaW5nV3JhcHBlci5lcXVhbHMoZG9tRXZlbnROYW1lLCAna2V5ZG93bicpIHx8XG4gICAgICAgICAgU3RyaW5nV3JhcHBlci5lcXVhbHMoZG9tRXZlbnROYW1lLCAna2V5dXAnKSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBrZXkgPSBLZXlFdmVudHNQbHVnaW4uX25vcm1hbGl6ZUtleShwYXJ0cy5wb3AoKSk7XG5cbiAgICB2YXIgZnVsbEtleSA9ICcnO1xuICAgIG1vZGlmaWVyS2V5cy5mb3JFYWNoKG1vZGlmaWVyTmFtZSA9PiB7XG4gICAgICBpZiAoTGlzdFdyYXBwZXIuY29udGFpbnMocGFydHMsIG1vZGlmaWVyTmFtZSkpIHtcbiAgICAgICAgTGlzdFdyYXBwZXIucmVtb3ZlKHBhcnRzLCBtb2RpZmllck5hbWUpO1xuICAgICAgICBmdWxsS2V5ICs9IG1vZGlmaWVyTmFtZSArICcuJztcbiAgICAgIH1cbiAgICB9KTtcbiAgICBmdWxsS2V5ICs9IGtleTtcblxuICAgIGlmIChwYXJ0cy5sZW5ndGggIT0gMCB8fCBrZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAvLyByZXR1cm5pbmcgbnVsbCBpbnN0ZWFkIG9mIHRocm93aW5nIHRvIGxldCBhbm90aGVyIHBsdWdpbiBwcm9jZXNzIHRoZSBldmVudFxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHZhciByZXN1bHQgPSBTdHJpbmdNYXBXcmFwcGVyLmNyZWF0ZSgpO1xuICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KHJlc3VsdCwgJ2RvbUV2ZW50TmFtZScsIGRvbUV2ZW50TmFtZSk7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5zZXQocmVzdWx0LCAnZnVsbEtleScsIGZ1bGxLZXkpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBzdGF0aWMgZ2V0RXZlbnRGdWxsS2V5KGV2ZW50OiBLZXlib2FyZEV2ZW50KTogc3RyaW5nIHtcbiAgICB2YXIgZnVsbEtleSA9ICcnO1xuICAgIHZhciBrZXkgPSBET00uZ2V0RXZlbnRLZXkoZXZlbnQpO1xuICAgIGtleSA9IGtleS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChTdHJpbmdXcmFwcGVyLmVxdWFscyhrZXksICcgJykpIHtcbiAgICAgIGtleSA9ICdzcGFjZSc7ICAvLyBmb3IgcmVhZGFiaWxpdHlcbiAgICB9IGVsc2UgaWYgKFN0cmluZ1dyYXBwZXIuZXF1YWxzKGtleSwgJy4nKSkge1xuICAgICAga2V5ID0gJ2RvdCc7ICAvLyBiZWNhdXNlICcuJyBpcyB1c2VkIGFzIGEgc2VwYXJhdG9yIGluIGV2ZW50IG5hbWVzXG4gICAgfVxuICAgIG1vZGlmaWVyS2V5cy5mb3JFYWNoKG1vZGlmaWVyTmFtZSA9PiB7XG4gICAgICBpZiAobW9kaWZpZXJOYW1lICE9IGtleSkge1xuICAgICAgICB2YXIgbW9kaWZpZXJHZXR0ZXIgPSBTdHJpbmdNYXBXcmFwcGVyLmdldChtb2RpZmllcktleUdldHRlcnMsIG1vZGlmaWVyTmFtZSk7XG4gICAgICAgIGlmIChtb2RpZmllckdldHRlcihldmVudCkpIHtcbiAgICAgICAgICBmdWxsS2V5ICs9IG1vZGlmaWVyTmFtZSArICcuJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIGZ1bGxLZXkgKz0ga2V5O1xuICAgIHJldHVybiBmdWxsS2V5O1xuICB9XG5cbiAgc3RhdGljIGV2ZW50Q2FsbGJhY2soZWxlbWVudDogSFRNTEVsZW1lbnQsIGZ1bGxLZXk6IGFueSwgaGFuZGxlcjogKGU6IEV2ZW50KSA9PiBhbnksXG4gICAgICAgICAgICAgICAgICAgICAgIHpvbmU6IE5nWm9uZSk6IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4gdm9pZCB7XG4gICAgcmV0dXJuIChldmVudCkgPT4ge1xuICAgICAgaWYgKFN0cmluZ1dyYXBwZXIuZXF1YWxzKEtleUV2ZW50c1BsdWdpbi5nZXRFdmVudEZ1bGxLZXkoZXZlbnQpLCBmdWxsS2V5KSkge1xuICAgICAgICB6b25lLnJ1bigoKSA9PiBoYW5kbGVyKGV2ZW50KSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgc3RhdGljIF9ub3JtYWxpemVLZXkoa2V5TmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBUT0RPOiBzd2l0Y2ggdG8gYSBTdHJpbmdNYXAgaWYgdGhlIG1hcHBpbmcgZ3Jvd3MgdG9vIG11Y2hcbiAgICBzd2l0Y2ggKGtleU5hbWUpIHtcbiAgICAgIGNhc2UgJ2VzYyc6XG4gICAgICAgIHJldHVybiAnZXNjYXBlJztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBrZXlOYW1lO1xuICAgIH1cbiAgfVxufVxuIl19