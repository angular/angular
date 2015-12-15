import { ChangeDetectorRef } from '../change_detector_ref';
import { Provider } from 'angular2/src/core/di';
/**
 * A strategy for tracking changes over time to an iterable. Used for {@link NgFor} to
 * respond to changes in an iterable by effecting equivalent changes in the DOM.
 */
export interface IterableDiffer {
    diff(object: Object): any;
    onDestroy(): any;
}
/**
 * Provides a factory for {@link IterableDiffer}.
 */
export interface IterableDifferFactory {
    supports(objects: Object): boolean;
    create(cdRef: ChangeDetectorRef): IterableDiffer;
}
/**
 * A repository of different iterable diffing strategies used by NgFor, NgClass, and others.
 */
export declare class IterableDiffers {
    factories: IterableDifferFactory[];
    constructor(factories: IterableDifferFactory[]);
    static create(factories: IterableDifferFactory[], parent?: IterableDiffers): IterableDiffers;
    /**
     * Takes an array of {@link IterableDifferFactory} and returns a provider used to extend the
     * inherited {@link IterableDiffers} instance with the provided factories and return a new
     * {@link IterableDiffers} instance.
     *
     * The following example shows how to extend an existing list of factories,
           * which will only be applied to the injector for this component and its children.
           * This step is all that's required to make a new {@link IterableDiffer} available.
     *
     * ### Example
     *
     * ```
     * @Component({
     *   viewProviders: [
     *     IterableDiffers.extend([new ImmutableListDiffer()])
     *   ]
     * })
     * ```
     */
    static extend(factories: IterableDifferFactory[]): Provider;
    find(iterable: Object): IterableDifferFactory;
}
