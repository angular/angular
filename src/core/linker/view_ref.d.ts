import { ChangeDetectorRef } from '../change_detection/change_detector_ref';
import { AppView, HostViewFactory } from './view';
export declare abstract class ViewRef {
    destroyed: boolean;
}
/**
 * Represents a View containing a single Element that is the Host Element of a {@link Component}
 * instance.
 *
 * A Host View is created for every dynamically created Component that was compiled on its own (as
 * opposed to as a part of another Component's Template) via {@link Compiler#compileInHost} or one
 * of the higher-level APIs: {@link AppViewManager#createRootHostView},
 * {@link AppViewManager#createHostViewInContainer}, {@link ViewContainerRef#createHostView}.
 */
export declare abstract class HostViewRef extends ViewRef {
    rootNodes: any[];
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
export declare abstract class EmbeddedViewRef extends ViewRef {
    /**
     * Sets `value` of local variable called `variableName` in this View.
     */
    abstract setLocal(variableName: string, value: any): void;
    /**
     * Checks whether this view has a local variable called `variableName`.
     */
    abstract hasLocal(variableName: string): boolean;
    rootNodes: any[];
}
export declare class ViewRef_ implements EmbeddedViewRef, HostViewRef {
    private _view;
    constructor(_view: AppView);
    internalView: AppView;
    /**
     * Return `ChangeDetectorRef`
     */
    changeDetectorRef: ChangeDetectorRef;
    rootNodes: any[];
    setLocal(variableName: string, value: any): void;
    hasLocal(variableName: string): boolean;
    destroyed: boolean;
}
export declare abstract class HostViewFactoryRef {
}
export declare class HostViewFactoryRef_ implements HostViewFactoryRef {
    private _hostViewFactory;
    constructor(_hostViewFactory: HostViewFactory);
    internalHostViewFactory: HostViewFactory;
}
