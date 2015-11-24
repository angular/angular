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
 * removing nested Views via a {@link ViewContainer}. Each View can contain many View Containers.
 * <!-- /TODO -->
 *
 * ### Example
 *
 * Given this template...
 *
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <li *ng-for="var item of items">{{item}}</li>
 * </ul>
 * ```
 *
 * ... we have two {@link ProtoViewRef}s:
 *
 * Outer {@link ProtoViewRef}:
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <template ng-for var-item [ng-for-of]="items"></template>
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
 *   <li *ng-for="var item of items">{{item}}</li>
 * </ul>
 * ```
 *
 * Angular desugars and compiles the template into two ProtoViews:
 *
 * Outer ProtoView:
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <template ng-for var-item [ng-for-of]="items"></template>
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlld19yZWYudHMiXSwibmFtZXMiOlsiaW50ZXJuYWxWaWV3IiwiaW50ZXJuYWxQcm90b1ZpZXciLCJWaWV3UmVmIiwiVmlld1JlZi5jaGFuZ2VEZXRlY3RvclJlZiIsIlZpZXdSZWZfIiwiVmlld1JlZl8uY29uc3RydWN0b3IiLCJWaWV3UmVmXy5yZW5kZXIiLCJWaWV3UmVmXy5yZW5kZXJGcmFnbWVudCIsIlZpZXdSZWZfLmNoYW5nZURldGVjdG9yUmVmIiwiVmlld1JlZl8uc2V0TG9jYWwiLCJQcm90b1ZpZXdSZWYiLCJQcm90b1ZpZXdSZWZfIiwiUHJvdG9WaWV3UmVmXy5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ik9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSwwQkFBMEI7T0FDM0MsRUFBQyxhQUFhLEVBQUMsTUFBTSxnQ0FBZ0M7QUFLNUQsMEVBQTBFO0FBQzFFLDZCQUE2QixPQUFnQjtJQUMzQ0EsTUFBTUEsQ0FBWUEsT0FBUUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7QUFDbkNBLENBQUNBO0FBRUQsMEVBQTBFO0FBQzFFLGtDQUFrQyxZQUEwQjtJQUMxREMsTUFBTUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsR0FBbUJBLFlBQWFBLENBQUNBLFVBQVVBLEdBQUdBLElBQUlBLENBQUNBO0FBQ25GQSxDQUFDQTtBQW1CRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW9ERztBQUNIO0lBTUVDLElBQUlBLGlCQUFpQkEsS0FBd0JDLE1BQU1BLENBQUNBLGFBQWFBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBQ3RFRCxJQUFJQSxpQkFBaUJBLENBQUNBLEtBQXdCQTtRQUM1Q0MsYUFBYUEsRUFBRUEsQ0FBQ0EsQ0FBRUEsMERBQTBEQTtJQUM5RUEsQ0FBQ0E7QUFDSEQsQ0FBQ0E7QUFFRCw4QkFBOEIsT0FBTztJQUluQ0UsWUFBWUEsS0FBeUJBO1FBQ25DQyxPQUFPQSxDQUFDQTtRQUpGQSx1QkFBa0JBLEdBQXNCQSxJQUFJQSxDQUFDQTtRQUtuREEsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0E7SUFDckJBLENBQUNBO0lBRUREOztPQUVHQTtJQUNIQSxJQUFJQSxNQUFNQSxLQUFvQkUsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFekRGOztPQUVHQTtJQUNIQSxJQUFJQSxjQUFjQSxLQUF3QkcsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFN0VIOztPQUVHQTtJQUNIQSxJQUFJQSxpQkFBaUJBO1FBQ25CSSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxrQkFBa0JBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ3JDQSxJQUFJQSxDQUFDQSxrQkFBa0JBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLGNBQWNBLENBQUNBLEdBQUdBLENBQUNBO1FBQzFEQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxrQkFBa0JBLENBQUNBO0lBQ2pDQSxDQUFDQTtJQUVESixRQUFRQSxDQUFDQSxZQUFvQkEsRUFBRUEsS0FBVUEsSUFBVUssSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsWUFBWUEsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDaEdMLENBQUNBO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHO0FBQ0g7QUFBb0NNLENBQUNBO0FBRXJDLG1DQUFtQyxZQUFZO0lBRzdDQyxZQUFZQSxVQUFtQ0E7UUFDN0NDLE9BQU9BLENBQUNBO1FBQ1JBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLFVBQVVBLENBQUNBO0lBQy9CQSxDQUFDQTtBQUNIRCxDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge3VuaW1wbGVtZW50ZWR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQgKiBhcyB2aWV3TW9kdWxlIGZyb20gJy4vdmlldyc7XG5pbXBvcnQge0NoYW5nZURldGVjdG9yUmVmfSBmcm9tICcuLi9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rvcl9yZWYnO1xuaW1wb3J0IHtSZW5kZXJWaWV3UmVmLCBSZW5kZXJGcmFnbWVudFJlZn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVuZGVyL2FwaSc7XG5cbi8vIFRoaXMgaXMgYSB3b3JrYXJvdW5kIGZvciBwcml2YWN5IGluIERhcnQgYXMgd2UgZG9uJ3QgaGF2ZSBsaWJyYXJ5IHBhcnRzXG5leHBvcnQgZnVuY3Rpb24gaW50ZXJuYWxWaWV3KHZpZXdSZWY6IFZpZXdSZWYpOiB2aWV3TW9kdWxlLkFwcFZpZXcge1xuICByZXR1cm4gKDxWaWV3UmVmXz52aWV3UmVmKS5fdmlldztcbn1cblxuLy8gVGhpcyBpcyBhIHdvcmthcm91bmQgZm9yIHByaXZhY3kgaW4gRGFydCBhcyB3ZSBkb24ndCBoYXZlIGxpYnJhcnkgcGFydHNcbmV4cG9ydCBmdW5jdGlvbiBpbnRlcm5hbFByb3RvVmlldyhwcm90b1ZpZXdSZWY6IFByb3RvVmlld1JlZik6IHZpZXdNb2R1bGUuQXBwUHJvdG9WaWV3IHtcbiAgcmV0dXJuIGlzUHJlc2VudChwcm90b1ZpZXdSZWYpID8gKDxQcm90b1ZpZXdSZWZfPnByb3RvVmlld1JlZikuX3Byb3RvVmlldyA6IG51bGw7XG59XG5cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgVmlldyBjb250YWluaW5nIGEgc2luZ2xlIEVsZW1lbnQgdGhhdCBpcyB0aGUgSG9zdCBFbGVtZW50IG9mIGEge0BsaW5rIENvbXBvbmVudH1cbiAqIGluc3RhbmNlLlxuICpcbiAqIEEgSG9zdCBWaWV3IGlzIGNyZWF0ZWQgZm9yIGV2ZXJ5IGR5bmFtaWNhbGx5IGNyZWF0ZWQgQ29tcG9uZW50IHRoYXQgd2FzIGNvbXBpbGVkIG9uIGl0cyBvd24gKGFzXG4gKiBvcHBvc2VkIHRvIGFzIGEgcGFydCBvZiBhbm90aGVyIENvbXBvbmVudCdzIFRlbXBsYXRlKSB2aWEge0BsaW5rIENvbXBpbGVyI2NvbXBpbGVJbkhvc3R9IG9yIG9uZVxuICogb2YgdGhlIGhpZ2hlci1sZXZlbCBBUElzOiB7QGxpbmsgQXBwVmlld01hbmFnZXIjY3JlYXRlUm9vdEhvc3RWaWV3fSxcbiAqIHtAbGluayBBcHBWaWV3TWFuYWdlciNjcmVhdGVIb3N0Vmlld0luQ29udGFpbmVyfSwge0BsaW5rIFZpZXdDb250YWluZXJSZWYjY3JlYXRlSG9zdFZpZXd9LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEhvc3RWaWV3UmVmIHtcbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmO1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYW4gQW5ndWxhciBWaWV3LlxuICpcbiAqIDwhLS0gVE9ETzogbW92ZSB0aGUgbmV4dCB0d28gcGFyYWdyYXBocyB0byB0aGUgZGV2IGd1aWRlIC0tPlxuICogQSBWaWV3IGlzIGEgZnVuZGFtZW50YWwgYnVpbGRpbmcgYmxvY2sgb2YgdGhlIGFwcGxpY2F0aW9uIFVJLiBJdCBpcyB0aGUgc21hbGxlc3QgZ3JvdXBpbmcgb2ZcbiAqIEVsZW1lbnRzIHdoaWNoIGFyZSBjcmVhdGVkIGFuZCBkZXN0cm95ZWQgdG9nZXRoZXIuXG4gKlxuICogUHJvcGVydGllcyBvZiBlbGVtZW50cyBpbiBhIFZpZXcgY2FuIGNoYW5nZSwgYnV0IHRoZSBzdHJ1Y3R1cmUgKG51bWJlciBhbmQgb3JkZXIpIG9mIGVsZW1lbnRzIGluXG4gKiBhIFZpZXcgY2Fubm90LiBDaGFuZ2luZyB0aGUgc3RydWN0dXJlIG9mIEVsZW1lbnRzIGNhbiBvbmx5IGJlIGRvbmUgYnkgaW5zZXJ0aW5nLCBtb3Zpbmcgb3JcbiAqIHJlbW92aW5nIG5lc3RlZCBWaWV3cyB2aWEgYSB7QGxpbmsgVmlld0NvbnRhaW5lcn0uIEVhY2ggVmlldyBjYW4gY29udGFpbiBtYW55IFZpZXcgQ29udGFpbmVycy5cbiAqIDwhLS0gL1RPRE8gLS0+XG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBHaXZlbiB0aGlzIHRlbXBsYXRlLi4uXG4gKlxuICogYGBgXG4gKiBDb3VudDoge3tpdGVtcy5sZW5ndGh9fVxuICogPHVsPlxuICogICA8bGkgKm5nLWZvcj1cInZhciBpdGVtIG9mIGl0ZW1zXCI+e3tpdGVtfX08L2xpPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIC4uLiB3ZSBoYXZlIHR3byB7QGxpbmsgUHJvdG9WaWV3UmVmfXM6XG4gKlxuICogT3V0ZXIge0BsaW5rIFByb3RvVmlld1JlZn06XG4gKiBgYGBcbiAqIENvdW50OiB7e2l0ZW1zLmxlbmd0aH19XG4gKiA8dWw+XG4gKiAgIDx0ZW1wbGF0ZSBuZy1mb3IgdmFyLWl0ZW0gW25nLWZvci1vZl09XCJpdGVtc1wiPjwvdGVtcGxhdGU+XG4gKiA8L3VsPlxuICogYGBgXG4gKlxuICogSW5uZXIge0BsaW5rIFByb3RvVmlld1JlZn06XG4gKiBgYGBcbiAqICAgPGxpPnt7aXRlbX19PC9saT5cbiAqIGBgYFxuICpcbiAqIE5vdGljZSB0aGF0IHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZSBpcyBicm9rZW4gZG93biBpbnRvIHR3byBzZXBhcmF0ZSB7QGxpbmsgUHJvdG9WaWV3UmVmfXMuXG4gKlxuICogVGhlIG91dGVyL2lubmVyIHtAbGluayBQcm90b1ZpZXdSZWZ9cyBhcmUgdGhlbiBhc3NlbWJsZWQgaW50byB2aWV3cyBsaWtlIHNvOlxuICpcbiAqIGBgYFxuICogPCEtLSBWaWV3UmVmOiBvdXRlci0wIC0tPlxuICogQ291bnQ6IDJcbiAqIDx1bD5cbiAqICAgPHRlbXBsYXRlIHZpZXctY29udGFpbmVyLXJlZj48L3RlbXBsYXRlPlxuICogICA8IS0tIFZpZXdSZWY6IGlubmVyLTEgLS0+PGxpPmZpcnN0PC9saT48IS0tIC9WaWV3UmVmOiBpbm5lci0xIC0tPlxuICogICA8IS0tIFZpZXdSZWY6IGlubmVyLTIgLS0+PGxpPnNlY29uZDwvbGk+PCEtLSAvVmlld1JlZjogaW5uZXItMiAtLT5cbiAqIDwvdWw+XG4gKiA8IS0tIC9WaWV3UmVmOiBvdXRlci0wIC0tPlxuICogYGBgXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBWaWV3UmVmIGltcGxlbWVudHMgSG9zdFZpZXdSZWYge1xuICAvKipcbiAgICogU2V0cyBgdmFsdWVgIG9mIGxvY2FsIHZhcmlhYmxlIGNhbGxlZCBgdmFyaWFibGVOYW1lYCBpbiB0aGlzIFZpZXcuXG4gICAqL1xuICBhYnN0cmFjdCBzZXRMb2NhbCh2YXJpYWJsZU5hbWU6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQ7XG5cbiAgZ2V0IGNoYW5nZURldGVjdG9yUmVmKCk6IENoYW5nZURldGVjdG9yUmVmIHsgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTsgfVxuICBzZXQgY2hhbmdlRGV0ZWN0b3JSZWYodmFsdWU6IENoYW5nZURldGVjdG9yUmVmKSB7XG4gICAgdW5pbXBsZW1lbnRlZCgpOyAgLy8gVE9ETzogaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8xMlxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBWaWV3UmVmXyBleHRlbmRzIFZpZXdSZWYge1xuICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYgPSBudWxsO1xuICAvKiogQGludGVybmFsICovXG4gIHB1YmxpYyBfdmlldzogdmlld01vZHVsZS5BcHBWaWV3O1xuICBjb25zdHJ1Y3Rvcihfdmlldzogdmlld01vZHVsZS5BcHBWaWV3KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl92aWV3ID0gX3ZpZXc7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGBSZW5kZXJWaWV3UmVmYFxuICAgKi9cbiAgZ2V0IHJlbmRlcigpOiBSZW5kZXJWaWV3UmVmIHsgcmV0dXJuIHRoaXMuX3ZpZXcucmVuZGVyOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBgUmVuZGVyRnJhZ21lbnRSZWZgXG4gICAqL1xuICBnZXQgcmVuZGVyRnJhZ21lbnQoKTogUmVuZGVyRnJhZ21lbnRSZWYgeyByZXR1cm4gdGhpcy5fdmlldy5yZW5kZXJGcmFnbWVudDsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYENoYW5nZURldGVjdG9yUmVmYFxuICAgKi9cbiAgZ2V0IGNoYW5nZURldGVjdG9yUmVmKCk6IENoYW5nZURldGVjdG9yUmVmIHtcbiAgICBpZiAodGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmID0gdGhpcy5fdmlldy5jaGFuZ2VEZXRlY3Rvci5yZWY7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZjtcbiAgfVxuXG4gIHNldExvY2FsKHZhcmlhYmxlTmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7IHRoaXMuX3ZpZXcuc2V0TG9jYWwodmFyaWFibGVOYW1lLCB2YWx1ZSk7IH1cbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGFuIEFuZ3VsYXIgUHJvdG9WaWV3LlxuICpcbiAqIEEgUHJvdG9WaWV3IGlzIGEgcHJvdG90eXBpY2FsIHtAbGluayBWaWV3UmVmIFZpZXd9IHRoYXQgaXMgdGhlIHJlc3VsdCBvZiBUZW1wbGF0ZSBjb21waWxhdGlvbiBhbmRcbiAqIGlzIHVzZWQgYnkgQW5ndWxhciB0byBlZmZpY2llbnRseSBjcmVhdGUgYW4gaW5zdGFuY2Ugb2YgdGhpcyBWaWV3IGJhc2VkIG9uIHRoZSBjb21waWxlZCBUZW1wbGF0ZS5cbiAqXG4gKiBNb3N0IFByb3RvVmlld3MgYXJlIGNyZWF0ZWQgYW5kIHVzZWQgaW50ZXJuYWxseSBieSBBbmd1bGFyIGFuZCB5b3UgZG9uJ3QgbmVlZCB0byBrbm93IGFib3V0IHRoZW0sXG4gKiBleGNlcHQgaW4gYWR2YW5jZWQgdXNlLWNhc2VzIHdoZXJlIHlvdSBjb21waWxlIGNvbXBvbmVudHMgeW91cnNlbGYgdmlhIHRoZSBsb3ctbGV2ZWxcbiAqIHtAbGluayBDb21waWxlciNjb21waWxlSW5Ib3N0fSBBUEkuXG4gKlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogR2l2ZW4gdGhpcyB0ZW1wbGF0ZTpcbiAqXG4gKiBgYGBcbiAqIENvdW50OiB7e2l0ZW1zLmxlbmd0aH19XG4gKiA8dWw+XG4gKiAgIDxsaSAqbmctZm9yPVwidmFyIGl0ZW0gb2YgaXRlbXNcIj57e2l0ZW19fTwvbGk+XG4gKiA8L3VsPlxuICogYGBgXG4gKlxuICogQW5ndWxhciBkZXN1Z2FycyBhbmQgY29tcGlsZXMgdGhlIHRlbXBsYXRlIGludG8gdHdvIFByb3RvVmlld3M6XG4gKlxuICogT3V0ZXIgUHJvdG9WaWV3OlxuICogYGBgXG4gKiBDb3VudDoge3tpdGVtcy5sZW5ndGh9fVxuICogPHVsPlxuICogICA8dGVtcGxhdGUgbmctZm9yIHZhci1pdGVtIFtuZy1mb3Itb2ZdPVwiaXRlbXNcIj48L3RlbXBsYXRlPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIElubmVyIFByb3RvVmlldzpcbiAqIGBgYFxuICogICA8bGk+e3tpdGVtfX08L2xpPlxuICogYGBgXG4gKlxuICogTm90aWNlIHRoYXQgdGhlIG9yaWdpbmFsIHRlbXBsYXRlIGlzIGJyb2tlbiBkb3duIGludG8gdHdvIHNlcGFyYXRlIFByb3RvVmlld3MuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBQcm90b1ZpZXdSZWYge31cblxuZXhwb3J0IGNsYXNzIFByb3RvVmlld1JlZl8gZXh0ZW5kcyBQcm90b1ZpZXdSZWYge1xuICAvKiogQGludGVybmFsICovXG4gIHB1YmxpYyBfcHJvdG9WaWV3OiB2aWV3TW9kdWxlLkFwcFByb3RvVmlldztcbiAgY29uc3RydWN0b3IoX3Byb3RvVmlldzogdmlld01vZHVsZS5BcHBQcm90b1ZpZXcpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX3Byb3RvVmlldyA9IF9wcm90b1ZpZXc7XG4gIH1cbn1cbiJdfQ==