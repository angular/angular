import { isPresent } from 'angular2/src/facade/lang';
import { DOM } from 'angular2/src/platform/dom/dom_adapter';
export class By {
    static all() { return (debugElement) => true; }
    static css(selector) {
        return (debugElement) => {
            return isPresent(debugElement.nativeElement) ?
                DOM.elementMatches(debugElement.nativeElement, selector) :
                false;
        };
    }
    static directive(type) {
        return (debugElement) => { return debugElement.hasDirective(type); };
    }
}
//# sourceMappingURL=by.js.map