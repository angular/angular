var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { DOM } from 'angular2/src/platform/dom/dom_adapter';
import { isPresent, StringWrapper } from 'angular2/src/facade/lang';
import { StringMapWrapper, ListWrapper } from 'angular2/src/facade/collection';
import { EventManagerPlugin } from './event_manager';
import { Injectable } from 'angular2/src/core/di';
var modifierKeys = ['alt', 'control', 'meta', 'shift'];
var modifierKeyGetters = {
    'alt': (event) => event.altKey,
    'control': (event) => event.ctrlKey,
    'meta': (event) => event.metaKey,
    'shift': (event) => event.shiftKey
};
let KeyEventsPlugin_1;
export let KeyEventsPlugin = KeyEventsPlugin_1 = class KeyEventsPlugin extends EventManagerPlugin {
    constructor() {
        super();
    }
    supports(eventName) {
        return isPresent(KeyEventsPlugin_1.parseEventName(eventName));
    }
    addEventListener(element, eventName, handler) {
        var parsedEvent = KeyEventsPlugin_1.parseEventName(eventName);
        var outsideHandler = KeyEventsPlugin_1.eventCallback(element, StringMapWrapper.get(parsedEvent, 'fullKey'), handler, this.manager.getZone());
        return this.manager.getZone().runOutsideAngular(() => {
            return DOM.onAndCancel(element, StringMapWrapper.get(parsedEvent, 'domEventName'), outsideHandler);
        });
    }
    static parseEventName(eventName) {
        var parts = eventName.toLowerCase().split('.');
        var domEventName = parts.shift();
        if ((parts.length === 0) ||
            !(StringWrapper.equals(domEventName, 'keydown') ||
                StringWrapper.equals(domEventName, 'keyup'))) {
            return null;
        }
        var key = KeyEventsPlugin_1._normalizeKey(parts.pop());
        var fullKey = '';
        modifierKeys.forEach(modifierName => {
            if (ListWrapper.contains(parts, modifierName)) {
                ListWrapper.remove(parts, modifierName);
                fullKey += modifierName + '.';
            }
        });
        fullKey += key;
        if (parts.length != 0 || key.length === 0) {
            // returning null instead of throwing to let another plugin process the event
            return null;
        }
        var result = StringMapWrapper.create();
        StringMapWrapper.set(result, 'domEventName', domEventName);
        StringMapWrapper.set(result, 'fullKey', fullKey);
        return result;
    }
    static getEventFullKey(event) {
        var fullKey = '';
        var key = DOM.getEventKey(event);
        key = key.toLowerCase();
        if (StringWrapper.equals(key, ' ')) {
            key = 'space'; // for readability
        }
        else if (StringWrapper.equals(key, '.')) {
            key = 'dot'; // because '.' is used as a separator in event names
        }
        modifierKeys.forEach(modifierName => {
            if (modifierName != key) {
                var modifierGetter = StringMapWrapper.get(modifierKeyGetters, modifierName);
                if (modifierGetter(event)) {
                    fullKey += modifierName + '.';
                }
            }
        });
        fullKey += key;
        return fullKey;
    }
    static eventCallback(element, fullKey, handler, zone) {
        return (event) => {
            if (StringWrapper.equals(KeyEventsPlugin_1.getEventFullKey(event), fullKey)) {
                zone.runGuarded(() => handler(event));
            }
        };
    }
    /** @internal */
    static _normalizeKey(keyName) {
        // TODO: switch to a StringMap if the mapping grows too much
        switch (keyName) {
            case 'esc':
                return 'escape';
            default:
                return keyName;
        }
    }
};
KeyEventsPlugin = KeyEventsPlugin_1 = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], KeyEventsPlugin);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5X2V2ZW50cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtZ3RNN1FoRW4udG1wL2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZXZlbnRzL2tleV9ldmVudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxHQUFHLEVBQUMsTUFBTSx1Q0FBdUM7T0FDbEQsRUFDTCxTQUFTLEVBRVQsYUFBYSxFQUdkLE1BQU0sMEJBQTBCO09BQzFCLEVBQUMsZ0JBQWdCLEVBQUUsV0FBVyxFQUFDLE1BQU0sZ0NBQWdDO09BQ3JFLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxpQkFBaUI7T0FFM0MsRUFBQyxVQUFVLEVBQUMsTUFBTSxzQkFBc0I7QUFFL0MsSUFBSSxZQUFZLEdBQUcsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN2RCxJQUFJLGtCQUFrQixHQUF1RDtJQUMzRSxLQUFLLEVBQUUsQ0FBQyxLQUFvQixLQUFLLEtBQUssQ0FBQyxNQUFNO0lBQzdDLFNBQVMsRUFBRSxDQUFDLEtBQW9CLEtBQUssS0FBSyxDQUFDLE9BQU87SUFDbEQsTUFBTSxFQUFFLENBQUMsS0FBb0IsS0FBSyxLQUFLLENBQUMsT0FBTztJQUMvQyxPQUFPLEVBQUUsQ0FBQyxLQUFvQixLQUFLLEtBQUssQ0FBQyxRQUFRO0NBQ2xELENBQUM7QUFHRjsrRUFBcUMsa0JBQWtCO0lBQ3JEO1FBQWdCLE9BQU8sQ0FBQztJQUFDLENBQUM7SUFFMUIsUUFBUSxDQUFDLFNBQWlCO1FBQ3hCLE1BQU0sQ0FBQyxTQUFTLENBQUMsaUJBQWUsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRUQsZ0JBQWdCLENBQUMsT0FBb0IsRUFBRSxTQUFpQixFQUFFLE9BQWlCO1FBQ3pFLElBQUksV0FBVyxHQUFHLGlCQUFlLENB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RUFBRTs7bUJBQUE7QUEyRloiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RPTX0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fYWRhcHRlcic7XG5pbXBvcnQge1xuICBpc1ByZXNlbnQsXG4gIGlzQmxhbmssXG4gIFN0cmluZ1dyYXBwZXIsXG4gIFJlZ0V4cFdyYXBwZXIsXG4gIE51bWJlcldyYXBwZXJcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7U3RyaW5nTWFwV3JhcHBlciwgTGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge0V2ZW50TWFuYWdlclBsdWdpbn0gZnJvbSAnLi9ldmVudF9tYW5hZ2VyJztcbmltcG9ydCB7Tmdab25lfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS96b25lL25nX3pvbmUnO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5cbnZhciBtb2RpZmllcktleXMgPSBbJ2FsdCcsICdjb250cm9sJywgJ21ldGEnLCAnc2hpZnQnXTtcbnZhciBtb2RpZmllcktleUdldHRlcnM6IHtba2V5OiBzdHJpbmddOiAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IGJvb2xlYW59ID0ge1xuICAnYWx0JzogKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiBldmVudC5hbHRLZXksXG4gICdjb250cm9sJzogKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiBldmVudC5jdHJsS2V5LFxuICAnbWV0YSc6IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4gZXZlbnQubWV0YUtleSxcbiAgJ3NoaWZ0JzogKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiBldmVudC5zaGlmdEtleVxufTtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEtleUV2ZW50c1BsdWdpbiBleHRlbmRzIEV2ZW50TWFuYWdlclBsdWdpbiB7XG4gIGNvbnN0cnVjdG9yKCkgeyBzdXBlcigpOyB9XG5cbiAgc3VwcG9ydHMoZXZlbnROYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaXNQcmVzZW50KEtleUV2ZW50c1BsdWdpbi5wYXJzZUV2ZW50TmFtZShldmVudE5hbWUpKTtcbiAgfVxuXG4gIGFkZEV2ZW50TGlzdGVuZXIoZWxlbWVudDogSFRNTEVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBoYW5kbGVyOiBGdW5jdGlvbik6IEZ1bmN0aW9uIHtcbiAgICB2YXIgcGFyc2VkRXZlbnQgPSBLZXlFdmVudHNQbHVnaW4ucGFyc2VFdmVudE5hbWUoZXZlbnROYW1lKTtcblxuICAgIHZhciBvdXRzaWRlSGFuZGxlciA9IEtleUV2ZW50c1BsdWdpbi5ldmVudENhbGxiYWNrKFxuICAgICAgICBlbGVtZW50LCBTdHJpbmdNYXBXcmFwcGVyLmdldChwYXJzZWRFdmVudCwgJ2Z1bGxLZXknKSwgaGFuZGxlciwgdGhpcy5tYW5hZ2VyLmdldFpvbmUoKSk7XG5cbiAgICByZXR1cm4gdGhpcy5tYW5hZ2VyLmdldFpvbmUoKS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICByZXR1cm4gRE9NLm9uQW5kQ2FuY2VsKGVsZW1lbnQsIFN0cmluZ01hcFdyYXBwZXIuZ2V0KHBhcnNlZEV2ZW50LCAnZG9tRXZlbnROYW1lJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHNpZGVIYW5kbGVyKTtcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXRpYyBwYXJzZUV2ZW50TmFtZShldmVudE5hbWU6IHN0cmluZyk6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9IHtcbiAgICB2YXIgcGFydHM6IHN0cmluZ1tdID0gZXZlbnROYW1lLnRvTG93ZXJDYXNlKCkuc3BsaXQoJy4nKTtcblxuICAgIHZhciBkb21FdmVudE5hbWUgPSBwYXJ0cy5zaGlmdCgpO1xuICAgIGlmICgocGFydHMubGVuZ3RoID09PSAwKSB8fFxuICAgICAgICAhKFN0cmluZ1dyYXBwZXIuZXF1YWxzKGRvbUV2ZW50TmFtZSwgJ2tleWRvd24nKSB8fFxuICAgICAgICAgIFN0cmluZ1dyYXBwZXIuZXF1YWxzKGRvbUV2ZW50TmFtZSwgJ2tleXVwJykpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIga2V5ID0gS2V5RXZlbnRzUGx1Z2luLl9ub3JtYWxpemVLZXkocGFydHMucG9wKCkpO1xuXG4gICAgdmFyIGZ1bGxLZXkgPSAnJztcbiAgICBtb2RpZmllcktleXMuZm9yRWFjaChtb2RpZmllck5hbWUgPT4ge1xuICAgICAgaWYgKExpc3RXcmFwcGVyLmNvbnRhaW5zKHBhcnRzLCBtb2RpZmllck5hbWUpKSB7XG4gICAgICAgIExpc3RXcmFwcGVyLnJlbW92ZShwYXJ0cywgbW9kaWZpZXJOYW1lKTtcbiAgICAgICAgZnVsbEtleSArPSBtb2RpZmllck5hbWUgKyAnLic7XG4gICAgICB9XG4gICAgfSk7XG4gICAgZnVsbEtleSArPSBrZXk7XG5cbiAgICBpZiAocGFydHMubGVuZ3RoICE9IDAgfHwga2V5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgLy8gcmV0dXJuaW5nIG51bGwgaW5zdGVhZCBvZiB0aHJvd2luZyB0byBsZXQgYW5vdGhlciBwbHVnaW4gcHJvY2VzcyB0aGUgZXZlbnRcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB2YXIgcmVzdWx0ID0gU3RyaW5nTWFwV3JhcHBlci5jcmVhdGUoKTtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChyZXN1bHQsICdkb21FdmVudE5hbWUnLCBkb21FdmVudE5hbWUpO1xuICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KHJlc3VsdCwgJ2Z1bGxLZXknLCBmdWxsS2V5KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgc3RhdGljIGdldEV2ZW50RnVsbEtleShldmVudDogS2V5Ym9hcmRFdmVudCk6IHN0cmluZyB7XG4gICAgdmFyIGZ1bGxLZXkgPSAnJztcbiAgICB2YXIga2V5ID0gRE9NLmdldEV2ZW50S2V5KGV2ZW50KTtcbiAgICBrZXkgPSBrZXkudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAoU3RyaW5nV3JhcHBlci5lcXVhbHMoa2V5LCAnICcpKSB7XG4gICAgICBrZXkgPSAnc3BhY2UnOyAgLy8gZm9yIHJlYWRhYmlsaXR5XG4gICAgfSBlbHNlIGlmIChTdHJpbmdXcmFwcGVyLmVxdWFscyhrZXksICcuJykpIHtcbiAgICAgIGtleSA9ICdkb3QnOyAgLy8gYmVjYXVzZSAnLicgaXMgdXNlZCBhcyBhIHNlcGFyYXRvciBpbiBldmVudCBuYW1lc1xuICAgIH1cbiAgICBtb2RpZmllcktleXMuZm9yRWFjaChtb2RpZmllck5hbWUgPT4ge1xuICAgICAgaWYgKG1vZGlmaWVyTmFtZSAhPSBrZXkpIHtcbiAgICAgICAgdmFyIG1vZGlmaWVyR2V0dGVyID0gU3RyaW5nTWFwV3JhcHBlci5nZXQobW9kaWZpZXJLZXlHZXR0ZXJzLCBtb2RpZmllck5hbWUpO1xuICAgICAgICBpZiAobW9kaWZpZXJHZXR0ZXIoZXZlbnQpKSB7XG4gICAgICAgICAgZnVsbEtleSArPSBtb2RpZmllck5hbWUgKyAnLic7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICBmdWxsS2V5ICs9IGtleTtcbiAgICByZXR1cm4gZnVsbEtleTtcbiAgfVxuXG4gIHN0YXRpYyBldmVudENhbGxiYWNrKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBmdWxsS2V5OiBhbnksIGhhbmRsZXI6IEZ1bmN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICB6b25lOiBOZ1pvbmUpOiBGdW5jdGlvbiB7XG4gICAgcmV0dXJuIChldmVudCkgPT4ge1xuICAgICAgaWYgKFN0cmluZ1dyYXBwZXIuZXF1YWxzKEtleUV2ZW50c1BsdWdpbi5nZXRFdmVudEZ1bGxLZXkoZXZlbnQpLCBmdWxsS2V5KSkge1xuICAgICAgICB6b25lLnJ1bkd1YXJkZWQoKCkgPT4gaGFuZGxlcihldmVudCkpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIHN0YXRpYyBfbm9ybWFsaXplS2V5KGtleU5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8gVE9ETzogc3dpdGNoIHRvIGEgU3RyaW5nTWFwIGlmIHRoZSBtYXBwaW5nIGdyb3dzIHRvbyBtdWNoXG4gICAgc3dpdGNoIChrZXlOYW1lKSB7XG4gICAgICBjYXNlICdlc2MnOlxuICAgICAgICByZXR1cm4gJ2VzY2FwZSc7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4ga2V5TmFtZTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==