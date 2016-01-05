import { isPresent } from 'angular2/src/facade/lang';
import { unimplemented } from 'angular2/src/facade/exceptions';
// This is a workaround for privacy in Dart as we don't have library parts
export function internalView(viewRef) {
    return viewRef._view;
}
// This is a workaround for privacy in Dart as we don't have library parts
export function internalProtoView(protoViewRef) {
    return isPresent(protoViewRef) ? protoViewRef._protoView : null;
}
/**
 * Represents an Angular View.
 *
 * <!-- TODO: move the next two paragraphs to the dev guide -->
 * A View is a fundamental building block of the application UI. It is the smallest grouping of
 * Elements which are created and destroyed together.
 *
 * Properties of elements in a View can change, but the structure (number and order) of elements in
 * a View cannot. Changing the structure of Elements can only be done by inserting, moving or
 * removing nested Views via a {@link ViewContainerRef}. Each View can contain many View Containers.
 * <!-- /TODO -->
 *
 * ### Example
 *
 * Given this template...
 *
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <li *ngFor="var item of items">{{item}}</li>
 * </ul>
 * ```
 *
 * ... we have two {@link ProtoViewRef}s:
 *
 * Outer {@link ProtoViewRef}:
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <template ngFor var-item [ngForOf]="items"></template>
 * </ul>
 * ```
 *
 * Inner {@link ProtoViewRef}:
 * ```
 *   <li>{{item}}</li>
 * ```
 *
 * Notice that the original template is broken down into two separate {@link ProtoViewRef}s.
 *
 * The outer/inner {@link ProtoViewRef}s are then assembled into views like so:
 *
 * ```
 * <!-- ViewRef: outer-0 -->
 * Count: 2
 * <ul>
 *   <template view-container-ref></template>
 *   <!-- ViewRef: inner-1 --><li>first</li><!-- /ViewRef: inner-1 -->
 *   <!-- ViewRef: inner-2 --><li>second</li><!-- /ViewRef: inner-2 -->
 * </ul>
 * <!-- /ViewRef: outer-0 -->
 * ```
 */
export class ViewRef {
    get changeDetectorRef() { return unimplemented(); }
    set changeDetectorRef(value) {
        unimplemented(); // TODO: https://github.com/Microsoft/TypeScript/issues/12
    }
}
export class ViewRef_ extends ViewRef {
    constructor(_view) {
        super();
        this._changeDetectorRef = null;
        this._view = _view;
    }
    /**
     * Return `RenderViewRef`
     */
    get render() { return this._view.render; }
    /**
     * Return `RenderFragmentRef`
     */
    get renderFragment() { return this._view.renderFragment; }
    /**
     * Return `ChangeDetectorRef`
     */
    get changeDetectorRef() {
        if (this._changeDetectorRef === null) {
            this._changeDetectorRef = this._view.changeDetector.ref;
        }
        return this._changeDetectorRef;
    }
    setLocal(variableName, value) { this._view.setLocal(variableName, value); }
}
/**
 * Represents an Angular ProtoView.
 *
 * A ProtoView is a prototypical {@link ViewRef View} that is the result of Template compilation and
 * is used by Angular to efficiently create an instance of this View based on the compiled Template.
 *
 * Most ProtoViews are created and used internally by Angular and you don't need to know about them,
 * except in advanced use-cases where you compile components yourself via the low-level
 * {@link Compiler#compileInHost} API.
 *
 *
 * ### Example
 *
 * Given this template:
 *
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <li *ngFor="var item of items">{{item}}</li>
 * </ul>
 * ```
 *
 * Angular desugars and compiles the template into two ProtoViews:
 *
 * Outer ProtoView:
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <template ngFor var-item [ngForOf]="items"></template>
 * </ul>
 * ```
 *
 * Inner ProtoView:
 * ```
 *   <li>{{item}}</li>
 * ```
 *
 * Notice that the original template is broken down into two separate ProtoViews.
 */
export class ProtoViewRef {
}
export class ProtoViewRef_ extends ProtoViewRef {
    constructor(_protoView) {
        super();
        this._protoView = _protoView;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlld19yZWYudHMiXSwibmFtZXMiOlsiaW50ZXJuYWxWaWV3IiwiaW50ZXJuYWxQcm90b1ZpZXciLCJWaWV3UmVmIiwiVmlld1JlZi5jaGFuZ2VEZXRlY3RvclJlZiIsIlZpZXdSZWZfIiwiVmlld1JlZl8uY29uc3RydWN0b3IiLCJWaWV3UmVmXy5yZW5kZXIiLCJWaWV3UmVmXy5yZW5kZXJGcmFnbWVudCIsIlZpZXdSZWZfLmNoYW5nZURldGVjdG9yUmVmIiwiVmlld1JlZl8uc2V0TG9jYWwiLCJQcm90b1ZpZXdSZWYiLCJQcm90b1ZpZXdSZWZfIiwiUHJvdG9WaWV3UmVmXy5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ik9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSwwQkFBMEI7T0FDM0MsRUFBQyxhQUFhLEVBQUMsTUFBTSxnQ0FBZ0M7QUFLNUQsMEVBQTBFO0FBQzFFLDZCQUE2QixPQUFnQjtJQUMzQ0EsTUFBTUEsQ0FBWUEsT0FBUUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7QUFDbkNBLENBQUNBO0FBRUQsMEVBQTBFO0FBQzFFLGtDQUFrQyxZQUEwQjtJQUMxREMsTUFBTUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsR0FBbUJBLFlBQWFBLENBQUNBLFVBQVVBLEdBQUdBLElBQUlBLENBQUNBO0FBQ25GQSxDQUFDQTtBQW1CRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW9ERztBQUNIO0lBTUVDLElBQUlBLGlCQUFpQkEsS0FBd0JDLE1BQU1BLENBQUNBLGFBQWFBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBQ3RFRCxJQUFJQSxpQkFBaUJBLENBQUNBLEtBQXdCQTtRQUM1Q0MsYUFBYUEsRUFBRUEsQ0FBQ0EsQ0FBRUEsMERBQTBEQTtJQUM5RUEsQ0FBQ0E7QUFDSEQsQ0FBQ0E7QUFFRCw4QkFBOEIsT0FBTztJQUluQ0UsWUFBWUEsS0FBeUJBO1FBQ25DQyxPQUFPQSxDQUFDQTtRQUpGQSx1QkFBa0JBLEdBQXNCQSxJQUFJQSxDQUFDQTtRQUtuREEsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0E7SUFDckJBLENBQUNBO0lBRUREOztPQUVHQTtJQUNIQSxJQUFJQSxNQUFNQSxLQUFvQkUsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFekRGOztPQUVHQTtJQUNIQSxJQUFJQSxjQUFjQSxLQUF3QkcsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFN0VIOztPQUVHQTtJQUNIQSxJQUFJQSxpQkFBaUJBO1FBQ25CSSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxrQkFBa0JBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ3JDQSxJQUFJQSxDQUFDQSxrQkFBa0JBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLGNBQWNBLENBQUNBLEdBQUdBLENBQUNBO1FBQzFEQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxrQkFBa0JBLENBQUNBO0lBQ2pDQSxDQUFDQTtJQUVESixRQUFRQSxDQUFDQSxZQUFvQkEsRUFBRUEsS0FBVUEsSUFBVUssSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsWUFBWUEsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDaEdMLENBQUNBO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHO0FBQ0g7QUFBb0NNLENBQUNBO0FBRXJDLG1DQUFtQyxZQUFZO0lBRzdDQyxZQUFZQSxVQUFtQ0E7UUFDN0NDLE9BQU9BLENBQUNBO1FBQ1JBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLFVBQVVBLENBQUNBO0lBQy9CQSxDQUFDQTtBQUNIRCxDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge3VuaW1wbGVtZW50ZWR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQgKiBhcyB2aWV3TW9kdWxlIGZyb20gJy4vdmlldyc7XG5pbXBvcnQge0NoYW5nZURldGVjdG9yUmVmfSBmcm9tICcuLi9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rvcl9yZWYnO1xuaW1wb3J0IHtSZW5kZXJWaWV3UmVmLCBSZW5kZXJGcmFnbWVudFJlZn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVuZGVyL2FwaSc7XG5cbi8vIFRoaXMgaXMgYSB3b3JrYXJvdW5kIGZvciBwcml2YWN5IGluIERhcnQgYXMgd2UgZG9uJ3QgaGF2ZSBsaWJyYXJ5IHBhcnRzXG5leHBvcnQgZnVuY3Rpb24gaW50ZXJuYWxWaWV3KHZpZXdSZWY6IFZpZXdSZWYpOiB2aWV3TW9kdWxlLkFwcFZpZXcge1xuICByZXR1cm4gKDxWaWV3UmVmXz52aWV3UmVmKS5fdmlldztcbn1cblxuLy8gVGhpcyBpcyBhIHdvcmthcm91bmQgZm9yIHByaXZhY3kgaW4gRGFydCBhcyB3ZSBkb24ndCBoYXZlIGxpYnJhcnkgcGFydHNcbmV4cG9ydCBmdW5jdGlvbiBpbnRlcm5hbFByb3RvVmlldyhwcm90b1ZpZXdSZWY6IFByb3RvVmlld1JlZik6IHZpZXdNb2R1bGUuQXBwUHJvdG9WaWV3IHtcbiAgcmV0dXJuIGlzUHJlc2VudChwcm90b1ZpZXdSZWYpID8gKDxQcm90b1ZpZXdSZWZfPnByb3RvVmlld1JlZikuX3Byb3RvVmlldyA6IG51bGw7XG59XG5cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgVmlldyBjb250YWluaW5nIGEgc2luZ2xlIEVsZW1lbnQgdGhhdCBpcyB0aGUgSG9zdCBFbGVtZW50IG9mIGEge0BsaW5rIENvbXBvbmVudH1cbiAqIGluc3RhbmNlLlxuICpcbiAqIEEgSG9zdCBWaWV3IGlzIGNyZWF0ZWQgZm9yIGV2ZXJ5IGR5bmFtaWNhbGx5IGNyZWF0ZWQgQ29tcG9uZW50IHRoYXQgd2FzIGNvbXBpbGVkIG9uIGl0cyBvd24gKGFzXG4gKiBvcHBvc2VkIHRvIGFzIGEgcGFydCBvZiBhbm90aGVyIENvbXBvbmVudCdzIFRlbXBsYXRlKSB2aWEge0BsaW5rIENvbXBpbGVyI2NvbXBpbGVJbkhvc3R9IG9yIG9uZVxuICogb2YgdGhlIGhpZ2hlci1sZXZlbCBBUElzOiB7QGxpbmsgQXBwVmlld01hbmFnZXIjY3JlYXRlUm9vdEhvc3RWaWV3fSxcbiAqIHtAbGluayBBcHBWaWV3TWFuYWdlciNjcmVhdGVIb3N0Vmlld0luQ29udGFpbmVyfSwge0BsaW5rIFZpZXdDb250YWluZXJSZWYjY3JlYXRlSG9zdFZpZXd9LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEhvc3RWaWV3UmVmIHtcbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmO1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYW4gQW5ndWxhciBWaWV3LlxuICpcbiAqIDwhLS0gVE9ETzogbW92ZSB0aGUgbmV4dCB0d28gcGFyYWdyYXBocyB0byB0aGUgZGV2IGd1aWRlIC0tPlxuICogQSBWaWV3IGlzIGEgZnVuZGFtZW50YWwgYnVpbGRpbmcgYmxvY2sgb2YgdGhlIGFwcGxpY2F0aW9uIFVJLiBJdCBpcyB0aGUgc21hbGxlc3QgZ3JvdXBpbmcgb2ZcbiAqIEVsZW1lbnRzIHdoaWNoIGFyZSBjcmVhdGVkIGFuZCBkZXN0cm95ZWQgdG9nZXRoZXIuXG4gKlxuICogUHJvcGVydGllcyBvZiBlbGVtZW50cyBpbiBhIFZpZXcgY2FuIGNoYW5nZSwgYnV0IHRoZSBzdHJ1Y3R1cmUgKG51bWJlciBhbmQgb3JkZXIpIG9mIGVsZW1lbnRzIGluXG4gKiBhIFZpZXcgY2Fubm90LiBDaGFuZ2luZyB0aGUgc3RydWN0dXJlIG9mIEVsZW1lbnRzIGNhbiBvbmx5IGJlIGRvbmUgYnkgaW5zZXJ0aW5nLCBtb3Zpbmcgb3JcbiAqIHJlbW92aW5nIG5lc3RlZCBWaWV3cyB2aWEgYSB7QGxpbmsgVmlld0NvbnRhaW5lclJlZn0uIEVhY2ggVmlldyBjYW4gY29udGFpbiBtYW55IFZpZXcgQ29udGFpbmVycy5cbiAqIDwhLS0gL1RPRE8gLS0+XG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBHaXZlbiB0aGlzIHRlbXBsYXRlLi4uXG4gKlxuICogYGBgXG4gKiBDb3VudDoge3tpdGVtcy5sZW5ndGh9fVxuICogPHVsPlxuICogICA8bGkgKm5nRm9yPVwidmFyIGl0ZW0gb2YgaXRlbXNcIj57e2l0ZW19fTwvbGk+XG4gKiA8L3VsPlxuICogYGBgXG4gKlxuICogLi4uIHdlIGhhdmUgdHdvIHtAbGluayBQcm90b1ZpZXdSZWZ9czpcbiAqXG4gKiBPdXRlciB7QGxpbmsgUHJvdG9WaWV3UmVmfTpcbiAqIGBgYFxuICogQ291bnQ6IHt7aXRlbXMubGVuZ3RofX1cbiAqIDx1bD5cbiAqICAgPHRlbXBsYXRlIG5nRm9yIHZhci1pdGVtIFtuZ0Zvck9mXT1cIml0ZW1zXCI+PC90ZW1wbGF0ZT5cbiAqIDwvdWw+XG4gKiBgYGBcbiAqXG4gKiBJbm5lciB7QGxpbmsgUHJvdG9WaWV3UmVmfTpcbiAqIGBgYFxuICogICA8bGk+e3tpdGVtfX08L2xpPlxuICogYGBgXG4gKlxuICogTm90aWNlIHRoYXQgdGhlIG9yaWdpbmFsIHRlbXBsYXRlIGlzIGJyb2tlbiBkb3duIGludG8gdHdvIHNlcGFyYXRlIHtAbGluayBQcm90b1ZpZXdSZWZ9cy5cbiAqXG4gKiBUaGUgb3V0ZXIvaW5uZXIge0BsaW5rIFByb3RvVmlld1JlZn1zIGFyZSB0aGVuIGFzc2VtYmxlZCBpbnRvIHZpZXdzIGxpa2Ugc286XG4gKlxuICogYGBgXG4gKiA8IS0tIFZpZXdSZWY6IG91dGVyLTAgLS0+XG4gKiBDb3VudDogMlxuICogPHVsPlxuICogICA8dGVtcGxhdGUgdmlldy1jb250YWluZXItcmVmPjwvdGVtcGxhdGU+XG4gKiAgIDwhLS0gVmlld1JlZjogaW5uZXItMSAtLT48bGk+Zmlyc3Q8L2xpPjwhLS0gL1ZpZXdSZWY6IGlubmVyLTEgLS0+XG4gKiAgIDwhLS0gVmlld1JlZjogaW5uZXItMiAtLT48bGk+c2Vjb25kPC9saT48IS0tIC9WaWV3UmVmOiBpbm5lci0yIC0tPlxuICogPC91bD5cbiAqIDwhLS0gL1ZpZXdSZWY6IG91dGVyLTAgLS0+XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFZpZXdSZWYgaW1wbGVtZW50cyBIb3N0Vmlld1JlZiB7XG4gIC8qKlxuICAgKiBTZXRzIGB2YWx1ZWAgb2YgbG9jYWwgdmFyaWFibGUgY2FsbGVkIGB2YXJpYWJsZU5hbWVgIGluIHRoaXMgVmlldy5cbiAgICovXG4gIGFic3RyYWN0IHNldExvY2FsKHZhcmlhYmxlTmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZDtcblxuICBnZXQgY2hhbmdlRGV0ZWN0b3JSZWYoKTogQ2hhbmdlRGV0ZWN0b3JSZWYgeyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9XG4gIHNldCBjaGFuZ2VEZXRlY3RvclJlZih2YWx1ZTogQ2hhbmdlRGV0ZWN0b3JSZWYpIHtcbiAgICB1bmltcGxlbWVudGVkKCk7ICAvLyBUT0RPOiBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzEyXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFZpZXdSZWZfIGV4dGVuZHMgVmlld1JlZiB7XG4gIHByaXZhdGUgX2NoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZiA9IG51bGw7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIF92aWV3OiB2aWV3TW9kdWxlLkFwcFZpZXc7XG4gIGNvbnN0cnVjdG9yKF92aWV3OiB2aWV3TW9kdWxlLkFwcFZpZXcpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX3ZpZXcgPSBfdmlldztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYFJlbmRlclZpZXdSZWZgXG4gICAqL1xuICBnZXQgcmVuZGVyKCk6IFJlbmRlclZpZXdSZWYgeyByZXR1cm4gdGhpcy5fdmlldy5yZW5kZXI7IH1cblxuICAvKipcbiAgICogUmV0dXJuIGBSZW5kZXJGcmFnbWVudFJlZmBcbiAgICovXG4gIGdldCByZW5kZXJGcmFnbWVudCgpOiBSZW5kZXJGcmFnbWVudFJlZiB7IHJldHVybiB0aGlzLl92aWV3LnJlbmRlckZyYWdtZW50OyB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBgQ2hhbmdlRGV0ZWN0b3JSZWZgXG4gICAqL1xuICBnZXQgY2hhbmdlRGV0ZWN0b3JSZWYoKTogQ2hhbmdlRGV0ZWN0b3JSZWYge1xuICAgIGlmICh0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZiA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYgPSB0aGlzLl92aWV3LmNoYW5nZURldGVjdG9yLnJlZjtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmO1xuICB9XG5cbiAgc2V0TG9jYWwodmFyaWFibGVOYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkIHsgdGhpcy5fdmlldy5zZXRMb2NhbCh2YXJpYWJsZU5hbWUsIHZhbHVlKTsgfVxufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYW4gQW5ndWxhciBQcm90b1ZpZXcuXG4gKlxuICogQSBQcm90b1ZpZXcgaXMgYSBwcm90b3R5cGljYWwge0BsaW5rIFZpZXdSZWYgVmlld30gdGhhdCBpcyB0aGUgcmVzdWx0IG9mIFRlbXBsYXRlIGNvbXBpbGF0aW9uIGFuZFxuICogaXMgdXNlZCBieSBBbmd1bGFyIHRvIGVmZmljaWVudGx5IGNyZWF0ZSBhbiBpbnN0YW5jZSBvZiB0aGlzIFZpZXcgYmFzZWQgb24gdGhlIGNvbXBpbGVkIFRlbXBsYXRlLlxuICpcbiAqIE1vc3QgUHJvdG9WaWV3cyBhcmUgY3JlYXRlZCBhbmQgdXNlZCBpbnRlcm5hbGx5IGJ5IEFuZ3VsYXIgYW5kIHlvdSBkb24ndCBuZWVkIHRvIGtub3cgYWJvdXQgdGhlbSxcbiAqIGV4Y2VwdCBpbiBhZHZhbmNlZCB1c2UtY2FzZXMgd2hlcmUgeW91IGNvbXBpbGUgY29tcG9uZW50cyB5b3Vyc2VsZiB2aWEgdGhlIGxvdy1sZXZlbFxuICoge0BsaW5rIENvbXBpbGVyI2NvbXBpbGVJbkhvc3R9IEFQSS5cbiAqXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBHaXZlbiB0aGlzIHRlbXBsYXRlOlxuICpcbiAqIGBgYFxuICogQ291bnQ6IHt7aXRlbXMubGVuZ3RofX1cbiAqIDx1bD5cbiAqICAgPGxpICpuZ0Zvcj1cInZhciBpdGVtIG9mIGl0ZW1zXCI+e3tpdGVtfX08L2xpPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIEFuZ3VsYXIgZGVzdWdhcnMgYW5kIGNvbXBpbGVzIHRoZSB0ZW1wbGF0ZSBpbnRvIHR3byBQcm90b1ZpZXdzOlxuICpcbiAqIE91dGVyIFByb3RvVmlldzpcbiAqIGBgYFxuICogQ291bnQ6IHt7aXRlbXMubGVuZ3RofX1cbiAqIDx1bD5cbiAqICAgPHRlbXBsYXRlIG5nRm9yIHZhci1pdGVtIFtuZ0Zvck9mXT1cIml0ZW1zXCI+PC90ZW1wbGF0ZT5cbiAqIDwvdWw+XG4gKiBgYGBcbiAqXG4gKiBJbm5lciBQcm90b1ZpZXc6XG4gKiBgYGBcbiAqICAgPGxpPnt7aXRlbX19PC9saT5cbiAqIGBgYFxuICpcbiAqIE5vdGljZSB0aGF0IHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZSBpcyBicm9rZW4gZG93biBpbnRvIHR3byBzZXBhcmF0ZSBQcm90b1ZpZXdzLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUHJvdG9WaWV3UmVmIHt9XG5cbmV4cG9ydCBjbGFzcyBQcm90b1ZpZXdSZWZfIGV4dGVuZHMgUHJvdG9WaWV3UmVmIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwdWJsaWMgX3Byb3RvVmlldzogdmlld01vZHVsZS5BcHBQcm90b1ZpZXc7XG4gIGNvbnN0cnVjdG9yKF9wcm90b1ZpZXc6IHZpZXdNb2R1bGUuQXBwUHJvdG9WaWV3KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9wcm90b1ZpZXcgPSBfcHJvdG9WaWV3O1xuICB9XG59XG4iXX0=