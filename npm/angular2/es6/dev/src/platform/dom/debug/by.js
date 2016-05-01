import { isPresent } from 'angular2/src/facade/lang';
import { DOM } from 'angular2/src/platform/dom/dom_adapter';
/**
 * Predicates for use with {@link DebugElement}'s query functions.
 */
export class By {
    /**
     * Match all elements.
     *
     * ## Example
     *
     * {@example platform/dom/debug/ts/by/by.ts region='by_all'}
     */
    static all() { return (debugElement) => true; }
    /**
     * Match elements by the given CSS selector.
     *
     * ## Example
     *
     * {@example platform/dom/debug/ts/by/by.ts region='by_css'}
     */
    static css(selector) {
        return (debugElement) => {
            return isPresent(debugElement.nativeElement) ?
                DOM.elementMatches(debugElement.nativeElement, selector) :
                false;
        };
    }
    /**
     * Match elements that have the given directive present.
     *
     * ## Example
     *
     * {@example platform/dom/debug/ts/by/by.ts region='by_directive'}
     */
    static directive(type) {
        return (debugElement) => { return debugElement.providerTokens.indexOf(type) !== -1; };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWd0TTdRaEVuLnRtcC9hbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RlYnVnL2J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJPQUFPLEVBQU8sU0FBUyxFQUFVLE1BQU0sMEJBQTBCO09BRTFELEVBQUMsR0FBRyxFQUFDLE1BQU0sdUNBQXVDO0FBR3pEOztHQUVHO0FBQ0g7SUFDRTs7Ozs7O09BTUc7SUFDSCxPQUFPLEdBQUcsS0FBOEIsTUFBTSxDQUFDLENBQUMsWUFBWSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7SUFFeEU7Ozs7OztPQU1HO0lBQ0gsT0FBTyxHQUFHLENBQUMsUUFBZ0I7UUFDekIsTUFBTSxDQUFDLENBQUMsWUFBWTtZQUNsQixNQUFNLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUM7Z0JBQ2pDLEdBQUcsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUM7Z0JBQ3hELEtBQUssQ0FBQztRQUNuQixDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsT0FBTyxTQUFTLENBQUMsSUFBVTtRQUN6QixNQUFNLENBQUMsQ0FBQyxZQUFZLE9BQU8sTUFBTSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3hGLENBQUM7QUFDSCxDQUFDO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1R5cGUsIGlzUHJlc2VudCwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7UHJlZGljYXRlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtET019IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX2FkYXB0ZXInO1xuaW1wb3J0IHtEZWJ1Z0VsZW1lbnR9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG4vKipcbiAqIFByZWRpY2F0ZXMgZm9yIHVzZSB3aXRoIHtAbGluayBEZWJ1Z0VsZW1lbnR9J3MgcXVlcnkgZnVuY3Rpb25zLlxuICovXG5leHBvcnQgY2xhc3MgQnkge1xuICAvKipcbiAgICogTWF0Y2ggYWxsIGVsZW1lbnRzLlxuICAgKlxuICAgKiAjIyBFeGFtcGxlXG4gICAqXG4gICAqIHtAZXhhbXBsZSBwbGF0Zm9ybS9kb20vZGVidWcvdHMvYnkvYnkudHMgcmVnaW9uPSdieV9hbGwnfVxuICAgKi9cbiAgc3RhdGljIGFsbCgpOiBQcmVkaWNhdGU8RGVidWdFbGVtZW50PiB7IHJldHVybiAoZGVidWdFbGVtZW50KSA9PiB0cnVlOyB9XG5cbiAgLyoqXG4gICAqIE1hdGNoIGVsZW1lbnRzIGJ5IHRoZSBnaXZlbiBDU1Mgc2VsZWN0b3IuXG4gICAqXG4gICAqICMjIEV4YW1wbGVcbiAgICpcbiAgICoge0BleGFtcGxlIHBsYXRmb3JtL2RvbS9kZWJ1Zy90cy9ieS9ieS50cyByZWdpb249J2J5X2Nzcyd9XG4gICAqL1xuICBzdGF0aWMgY3NzKHNlbGVjdG9yOiBzdHJpbmcpOiBQcmVkaWNhdGU8RGVidWdFbGVtZW50PiB7XG4gICAgcmV0dXJuIChkZWJ1Z0VsZW1lbnQpID0+IHtcbiAgICAgIHJldHVybiBpc1ByZXNlbnQoZGVidWdFbGVtZW50Lm5hdGl2ZUVsZW1lbnQpID9cbiAgICAgICAgICAgICAgICAgRE9NLmVsZW1lbnRNYXRjaGVzKGRlYnVnRWxlbWVudC5uYXRpdmVFbGVtZW50LCBzZWxlY3RvcikgOlxuICAgICAgICAgICAgICAgICBmYWxzZTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIE1hdGNoIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgZ2l2ZW4gZGlyZWN0aXZlIHByZXNlbnQuXG4gICAqXG4gICAqICMjIEV4YW1wbGVcbiAgICpcbiAgICoge0BleGFtcGxlIHBsYXRmb3JtL2RvbS9kZWJ1Zy90cy9ieS9ieS50cyByZWdpb249J2J5X2RpcmVjdGl2ZSd9XG4gICAqL1xuICBzdGF0aWMgZGlyZWN0aXZlKHR5cGU6IFR5cGUpOiBQcmVkaWNhdGU8RGVidWdFbGVtZW50PiB7XG4gICAgcmV0dXJuIChkZWJ1Z0VsZW1lbnQpID0+IHsgcmV0dXJuIGRlYnVnRWxlbWVudC5wcm92aWRlclRva2Vucy5pbmRleE9mKHR5cGUpICE9PSAtMTsgfTtcbiAgfVxufVxuIl19