var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { DOM } from 'angular2/src/platform/dom/dom_adapter';
import { Inject, Injectable } from 'angular2/src/core/di';
import { SetWrapper } from 'angular2/src/facade/collection';
import { DOCUMENT } from './dom_tokens';
export let SharedStylesHost = class {
    constructor() {
        /** @internal */
        this._styles = [];
        /** @internal */
        this._stylesSet = new Set();
    }
    addStyles(styles) {
        var additions = [];
        styles.forEach(style => {
            if (!SetWrapper.has(this._stylesSet, style)) {
                this._stylesSet.add(style);
                this._styles.push(style);
                additions.push(style);
            }
        });
        this.onStylesAdded(additions);
    }
    onStylesAdded(additions) { }
    getAllStyles() { return this._styles; }
};
SharedStylesHost = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], SharedStylesHost);
export let DomSharedStylesHost = class extends SharedStylesHost {
    constructor(doc) {
        super();
        this._hostNodes = new Set();
        this._hostNodes.add(doc.head);
    }
    /** @internal */
    _addStylesToHost(styles, host) {
        for (var i = 0; i < styles.length; i++) {
            var style = styles[i];
            DOM.appendChild(host, DOM.createStyleElement(style));
        }
    }
    addHost(hostNode) {
        this._addStylesToHost(this._styles, hostNode);
        this._hostNodes.add(hostNode);
    }
    removeHost(hostNode) { SetWrapper.delete(this._hostNodes, hostNode); }
    onStylesAdded(additions) {
        this._hostNodes.forEach((hostNode) => { this._addStylesToHost(additions, hostNode); });
    }
};
DomSharedStylesHost = __decorate([
    Injectable(),
    __param(0, Inject(DOCUMENT)), 
    __metadata('design:paramtypes', [Object])
], DomSharedStylesHost);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkX3N0eWxlc19ob3N0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9zaGFyZWRfc3R5bGVzX2hvc3QudHMiXSwibmFtZXMiOlsiU2hhcmVkU3R5bGVzSG9zdCIsIlNoYXJlZFN0eWxlc0hvc3QuY29uc3RydWN0b3IiLCJTaGFyZWRTdHlsZXNIb3N0LmFkZFN0eWxlcyIsIlNoYXJlZFN0eWxlc0hvc3Qub25TdHlsZXNBZGRlZCIsIlNoYXJlZFN0eWxlc0hvc3QuZ2V0QWxsU3R5bGVzIiwiRG9tU2hhcmVkU3R5bGVzSG9zdCIsIkRvbVNoYXJlZFN0eWxlc0hvc3QuY29uc3RydWN0b3IiLCJEb21TaGFyZWRTdHlsZXNIb3N0Ll9hZGRTdHlsZXNUb0hvc3QiLCJEb21TaGFyZWRTdHlsZXNIb3N0LmFkZEhvc3QiLCJEb21TaGFyZWRTdHlsZXNIb3N0LnJlbW92ZUhvc3QiLCJEb21TaGFyZWRTdHlsZXNIb3N0Lm9uU3R5bGVzQWRkZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztPQUFPLEVBQUMsR0FBRyxFQUFDLE1BQU0sdUNBQXVDO09BQ2xELEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBQyxNQUFNLHNCQUFzQjtPQUNoRCxFQUFDLFVBQVUsRUFBQyxNQUFNLGdDQUFnQztPQUNsRCxFQUFDLFFBQVEsRUFBQyxNQUFNLGNBQWM7QUFFckM7SUFPRUE7UUFMQUMsZ0JBQWdCQTtRQUNoQkEsWUFBT0EsR0FBYUEsRUFBRUEsQ0FBQ0E7UUFDdkJBLGdCQUFnQkE7UUFDaEJBLGVBQVVBLEdBQUdBLElBQUlBLEdBQUdBLEVBQVVBLENBQUNBO0lBRWhCQSxDQUFDQTtJQUVoQkQsU0FBU0EsQ0FBQ0EsTUFBZ0JBO1FBQ3hCRSxJQUFJQSxTQUFTQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUNuQkEsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsS0FBS0E7WUFDbEJBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLFVBQVVBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUM1Q0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzNCQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDekJBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1lBQ3hCQSxDQUFDQTtRQUNIQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNIQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtJQUNoQ0EsQ0FBQ0E7SUFFREYsYUFBYUEsQ0FBQ0EsU0FBbUJBLElBQUdHLENBQUNBO0lBRXJDSCxZQUFZQSxLQUFlSSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUNuREosQ0FBQ0E7QUF4QkQ7SUFBQyxVQUFVLEVBQUU7O3FCQXdCWjtBQUVELCtDQUN5QyxnQkFBZ0I7SUFFdkRLLFlBQThCQSxHQUFRQTtRQUNwQ0MsT0FBT0EsQ0FBQ0E7UUFGRkEsZUFBVUEsR0FBR0EsSUFBSUEsR0FBR0EsRUFBUUEsQ0FBQ0E7UUFHbkNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO0lBQ2hDQSxDQUFDQTtJQUNERCxnQkFBZ0JBO0lBQ2hCQSxnQkFBZ0JBLENBQUNBLE1BQWdCQSxFQUFFQSxJQUFVQTtRQUMzQ0UsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsTUFBTUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0E7WUFDdkNBLElBQUlBLEtBQUtBLEdBQUdBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RCQSxHQUFHQSxDQUFDQSxXQUFXQSxDQUFDQSxJQUFJQSxFQUFFQSxHQUFHQSxDQUFDQSxrQkFBa0JBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO1FBQ3ZEQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUNERixPQUFPQSxDQUFDQSxRQUFjQTtRQUNwQkcsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQTtRQUM5Q0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7SUFDaENBLENBQUNBO0lBQ0RILFVBQVVBLENBQUNBLFFBQWNBLElBQUlJLFVBQVVBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLEVBQUVBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRTVFSixhQUFhQSxDQUFDQSxTQUFtQkE7UUFDL0JLLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLFFBQVFBLE9BQU9BLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsU0FBU0EsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDekZBLENBQUNBO0FBQ0hMLENBQUNBO0FBdkJEO0lBQUMsVUFBVSxFQUFFO0lBR0MsV0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUE7O3dCQW9COUI7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RE9NfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9hZGFwdGVyJztcbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1NldFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICcuL2RvbV90b2tlbnMnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgU2hhcmVkU3R5bGVzSG9zdCB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3N0eWxlczogc3RyaW5nW10gPSBbXTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3R5bGVzU2V0ID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIGFkZFN0eWxlcyhzdHlsZXM6IHN0cmluZ1tdKSB7XG4gICAgdmFyIGFkZGl0aW9ucyA9IFtdO1xuICAgIHN0eWxlcy5mb3JFYWNoKHN0eWxlID0+IHtcbiAgICAgIGlmICghU2V0V3JhcHBlci5oYXModGhpcy5fc3R5bGVzU2V0LCBzdHlsZSkpIHtcbiAgICAgICAgdGhpcy5fc3R5bGVzU2V0LmFkZChzdHlsZSk7XG4gICAgICAgIHRoaXMuX3N0eWxlcy5wdXNoKHN0eWxlKTtcbiAgICAgICAgYWRkaXRpb25zLnB1c2goc3R5bGUpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMub25TdHlsZXNBZGRlZChhZGRpdGlvbnMpO1xuICB9XG5cbiAgb25TdHlsZXNBZGRlZChhZGRpdGlvbnM6IHN0cmluZ1tdKSB7fVxuXG4gIGdldEFsbFN0eWxlcygpOiBzdHJpbmdbXSB7IHJldHVybiB0aGlzLl9zdHlsZXM7IH1cbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIERvbVNoYXJlZFN0eWxlc0hvc3QgZXh0ZW5kcyBTaGFyZWRTdHlsZXNIb3N0IHtcbiAgcHJpdmF0ZSBfaG9zdE5vZGVzID0gbmV3IFNldDxOb2RlPigpO1xuICBjb25zdHJ1Y3RvcihASW5qZWN0KERPQ1VNRU5UKSBkb2M6IGFueSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5faG9zdE5vZGVzLmFkZChkb2MuaGVhZCk7XG4gIH1cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYWRkU3R5bGVzVG9Ib3N0KHN0eWxlczogc3RyaW5nW10sIGhvc3Q6IE5vZGUpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHN0eWxlID0gc3R5bGVzW2ldO1xuICAgICAgRE9NLmFwcGVuZENoaWxkKGhvc3QsIERPTS5jcmVhdGVTdHlsZUVsZW1lbnQoc3R5bGUpKTtcbiAgICB9XG4gIH1cbiAgYWRkSG9zdChob3N0Tm9kZTogTm9kZSkge1xuICAgIHRoaXMuX2FkZFN0eWxlc1RvSG9zdCh0aGlzLl9zdHlsZXMsIGhvc3ROb2RlKTtcbiAgICB0aGlzLl9ob3N0Tm9kZXMuYWRkKGhvc3ROb2RlKTtcbiAgfVxuICByZW1vdmVIb3N0KGhvc3ROb2RlOiBOb2RlKSB7IFNldFdyYXBwZXIuZGVsZXRlKHRoaXMuX2hvc3ROb2RlcywgaG9zdE5vZGUpOyB9XG5cbiAgb25TdHlsZXNBZGRlZChhZGRpdGlvbnM6IHN0cmluZ1tdKSB7XG4gICAgdGhpcy5faG9zdE5vZGVzLmZvckVhY2goKGhvc3ROb2RlKSA9PiB7IHRoaXMuX2FkZFN0eWxlc1RvSG9zdChhZGRpdGlvbnMsIGhvc3ROb2RlKTsgfSk7XG4gIH1cbn1cbiJdfQ==