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
