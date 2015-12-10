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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkX3N0eWxlc19ob3N0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9zaGFyZWRfc3R5bGVzX2hvc3QudHMiXSwibmFtZXMiOlsiU2hhcmVkU3R5bGVzSG9zdCIsIlNoYXJlZFN0eWxlc0hvc3QuY29uc3RydWN0b3IiLCJTaGFyZWRTdHlsZXNIb3N0LmFkZFN0eWxlcyIsIlNoYXJlZFN0eWxlc0hvc3Qub25TdHlsZXNBZGRlZCIsIlNoYXJlZFN0eWxlc0hvc3QuZ2V0QWxsU3R5bGVzIiwiRG9tU2hhcmVkU3R5bGVzSG9zdCIsIkRvbVNoYXJlZFN0eWxlc0hvc3QuY29uc3RydWN0b3IiLCJEb21TaGFyZWRTdHlsZXNIb3N0Ll9hZGRTdHlsZXNUb0hvc3QiLCJEb21TaGFyZWRTdHlsZXNIb3N0LmFkZEhvc3QiLCJEb21TaGFyZWRTdHlsZXNIb3N0LnJlbW92ZUhvc3QiLCJEb21TaGFyZWRTdHlsZXNIb3N0Lm9uU3R5bGVzQWRkZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxHQUFHLEVBQUMsTUFBTSx1Q0FBdUM7T0FDbEQsRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFDLE1BQU0sc0JBQXNCO09BQ2hELEVBQUMsVUFBVSxFQUFDLE1BQU0sZ0NBQWdDO09BQ2xELEVBQUMsUUFBUSxFQUFDLE1BQU0sY0FBYztBQUVyQztJQU9FQTtRQUxBQyxnQkFBZ0JBO1FBQ2hCQSxZQUFPQSxHQUFhQSxFQUFFQSxDQUFDQTtRQUN2QkEsZ0JBQWdCQTtRQUNoQkEsZUFBVUEsR0FBR0EsSUFBSUEsR0FBR0EsRUFBVUEsQ0FBQ0E7SUFFaEJBLENBQUNBO0lBRWhCRCxTQUFTQSxDQUFDQSxNQUFnQkE7UUFDeEJFLElBQUlBLFNBQVNBLEdBQUdBLEVBQUVBLENBQUNBO1FBQ25CQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxLQUFLQTtZQUNsQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzVDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDM0JBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUN6QkEsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFDeEJBLENBQUNBO1FBQ0hBLENBQUNBLENBQUNBLENBQUNBO1FBQ0hBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO0lBQ2hDQSxDQUFDQTtJQUVERixhQUFhQSxDQUFDQSxTQUFtQkEsSUFBR0csQ0FBQ0E7SUFFckNILFlBQVlBLEtBQWVJLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO0FBQ25ESixDQUFDQTtBQXhCRDtJQUFDLFVBQVUsRUFBRTs7cUJBd0JaO0FBRUQsK0NBQ3lDLGdCQUFnQjtJQUV2REssWUFBOEJBLEdBQVFBO1FBQ3BDQyxPQUFPQSxDQUFDQTtRQUZGQSxlQUFVQSxHQUFHQSxJQUFJQSxHQUFHQSxFQUFRQSxDQUFDQTtRQUduQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDaENBLENBQUNBO0lBQ0RELGdCQUFnQkE7SUFDaEJBLGdCQUFnQkEsQ0FBQ0EsTUFBZ0JBLEVBQUVBLElBQVVBO1FBQzNDRSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxNQUFNQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQTtZQUN2Q0EsSUFBSUEsS0FBS0EsR0FBR0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdEJBLEdBQUdBLENBQUNBLFdBQVdBLENBQUNBLElBQUlBLEVBQUVBLEdBQUdBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDdkRBLENBQUNBO0lBQ0hBLENBQUNBO0lBQ0RGLE9BQU9BLENBQUNBLFFBQWNBO1FBQ3BCRyxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLEVBQUVBLFFBQVFBLENBQUNBLENBQUNBO1FBQzlDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxHQUFHQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtJQUNoQ0EsQ0FBQ0E7SUFDREgsVUFBVUEsQ0FBQ0EsUUFBY0EsSUFBSUksVUFBVUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFNUVKLGFBQWFBLENBQUNBLFNBQW1CQTtRQUMvQkssSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsT0FBT0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxTQUFTQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUN6RkEsQ0FBQ0E7QUFDSEwsQ0FBQ0E7QUF2QkQ7SUFBQyxVQUFVLEVBQUU7SUFHQyxXQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQTs7d0JBb0I5QjtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtET019IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX2FkYXB0ZXInO1xuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7U2V0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJy4vZG9tX3Rva2Vucyc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTaGFyZWRTdHlsZXNIb3N0IHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3R5bGVzOiBzdHJpbmdbXSA9IFtdO1xuICAvKiogQGludGVybmFsICovXG4gIF9zdHlsZXNTZXQgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgYWRkU3R5bGVzKHN0eWxlczogc3RyaW5nW10pIHtcbiAgICB2YXIgYWRkaXRpb25zID0gW107XG4gICAgc3R5bGVzLmZvckVhY2goc3R5bGUgPT4ge1xuICAgICAgaWYgKCFTZXRXcmFwcGVyLmhhcyh0aGlzLl9zdHlsZXNTZXQsIHN0eWxlKSkge1xuICAgICAgICB0aGlzLl9zdHlsZXNTZXQuYWRkKHN0eWxlKTtcbiAgICAgICAgdGhpcy5fc3R5bGVzLnB1c2goc3R5bGUpO1xuICAgICAgICBhZGRpdGlvbnMucHVzaChzdHlsZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5vblN0eWxlc0FkZGVkKGFkZGl0aW9ucyk7XG4gIH1cblxuICBvblN0eWxlc0FkZGVkKGFkZGl0aW9uczogc3RyaW5nW10pIHt9XG5cbiAgZ2V0QWxsU3R5bGVzKCk6IHN0cmluZ1tdIHsgcmV0dXJuIHRoaXMuX3N0eWxlczsgfVxufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRG9tU2hhcmVkU3R5bGVzSG9zdCBleHRlbmRzIFNoYXJlZFN0eWxlc0hvc3Qge1xuICBwcml2YXRlIF9ob3N0Tm9kZXMgPSBuZXcgU2V0PE5vZGU+KCk7XG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoRE9DVU1FTlQpIGRvYzogYW55KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9ob3N0Tm9kZXMuYWRkKGRvYy5oZWFkKTtcbiAgfVxuICAvKiogQGludGVybmFsICovXG4gIF9hZGRTdHlsZXNUb0hvc3Qoc3R5bGVzOiBzdHJpbmdbXSwgaG9zdDogTm9kZSkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgc3R5bGUgPSBzdHlsZXNbaV07XG4gICAgICBET00uYXBwZW5kQ2hpbGQoaG9zdCwgRE9NLmNyZWF0ZVN0eWxlRWxlbWVudChzdHlsZSkpO1xuICAgIH1cbiAgfVxuICBhZGRIb3N0KGhvc3ROb2RlOiBOb2RlKSB7XG4gICAgdGhpcy5fYWRkU3R5bGVzVG9Ib3N0KHRoaXMuX3N0eWxlcywgaG9zdE5vZGUpO1xuICAgIHRoaXMuX2hvc3ROb2Rlcy5hZGQoaG9zdE5vZGUpO1xuICB9XG4gIHJlbW92ZUhvc3QoaG9zdE5vZGU6IE5vZGUpIHsgU2V0V3JhcHBlci5kZWxldGUodGhpcy5faG9zdE5vZGVzLCBob3N0Tm9kZSk7IH1cblxuICBvblN0eWxlc0FkZGVkKGFkZGl0aW9uczogc3RyaW5nW10pIHtcbiAgICB0aGlzLl9ob3N0Tm9kZXMuZm9yRWFjaCgoaG9zdE5vZGUpID0+IHsgdGhpcy5fYWRkU3R5bGVzVG9Ib3N0KGFkZGl0aW9ucywgaG9zdE5vZGUpOyB9KTtcbiAgfVxufVxuIl19