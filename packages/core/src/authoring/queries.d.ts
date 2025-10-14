/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ProviderToken } from '../di/provider_token';
import { Signal } from '../render3/reactivity/api';
/**
 * Type of the `viewChild` function. The viewChild function creates a singular view query.
 *
 * It is a special function that also provides access to required query results via the `.required`
 * property.
 *
 * @publicApi
 * @docsPrivate Ignored because `viewChild` is the canonical API entry.
 */
export interface ViewChildFunction {
    /**
     * Initializes a view child query. Consider using `viewChild.required` for queries that should
     * always match.
     *
     * @publicAPI
     */
    <LocatorT, ReadT>(locator: ProviderToken<LocatorT> | string, opts: {
        read: ProviderToken<ReadT>;
        debugName?: string;
    }): Signal<ReadT | undefined>;
    <LocatorT>(locator: ProviderToken<LocatorT> | string, opts?: {
        debugName?: string;
    }): Signal<LocatorT | undefined>;
    /**
     * Initializes a view child query that is expected to always match an element.
     *
     * @publicAPI
     */
    required: {
        <LocatorT>(locator: ProviderToken<LocatorT> | string, opts?: {
            debugName?: string;
        }): Signal<LocatorT>;
        <LocatorT, ReadT>(locator: ProviderToken<LocatorT> | string, opts: {
            read: ProviderToken<ReadT>;
            debugName?: string;
        }): Signal<ReadT>;
    };
}
/**
 * Initializes a view child query.
 *
 * Consider using `viewChild.required` for queries that should always match.
 *
 * @usageNotes
 * Create a child query in your component by declaring a
 * class field and initializing it with the `viewChild()` function.
 *
 * ```angular-ts
 * @Component({template: '<div #el></div><my-component #cmp />'})
 * export class TestComponent {
 *   divEl = viewChild<ElementRef>('el');                   // Signal<ElementRef|undefined>
 *   divElRequired = viewChild.required<ElementRef>('el');  // Signal<ElementRef>
 *   cmp = viewChild(MyComponent);                          // Signal<MyComponent|undefined>
 *   cmpRequired = viewChild.required(MyComponent);         // Signal<MyComponent>
 * }
 * ```
 *
 * @publicApi 19.0
 * @initializerApiFunction
 */
export declare const viewChild: ViewChildFunction;
export declare function viewChildren<LocatorT>(locator: ProviderToken<LocatorT> | string, opts?: {
    debugName?: string;
}): Signal<ReadonlyArray<LocatorT>>;
export declare function viewChildren<LocatorT, ReadT>(locator: ProviderToken<LocatorT> | string, opts: {
    read: ProviderToken<ReadT>;
    debugName?: string;
}): Signal<ReadonlyArray<ReadT>>;
export declare function contentChildFn<LocatorT, ReadT>(locator: ProviderToken<LocatorT> | string, opts?: {
    descendants?: boolean;
    read?: ProviderToken<ReadT>;
    debugName?: string;
}): Signal<ReadT | undefined>;
/**
 * Type of the `contentChild` function.
 *
 * The contentChild function creates a singular content query. It is a special function that also
 * provides access to required query results via the `.required` property.
 *
 * @publicApi 19.0
 * @docsPrivate Ignored because `contentChild` is the canonical API entry.
 */
export interface ContentChildFunction {
    /**
     * Initializes a content child query.
     *
     * Consider using `contentChild.required` for queries that should always match.
     * @publicAPI
     */
    <LocatorT>(locator: ProviderToken<LocatorT> | string, opts?: {
        descendants?: boolean;
        read?: undefined;
        debugName?: string;
    }): Signal<LocatorT | undefined>;
    <LocatorT, ReadT>(locator: ProviderToken<LocatorT> | string, opts: {
        descendants?: boolean;
        read: ProviderToken<ReadT>;
        debugName?: string;
    }): Signal<ReadT | undefined>;
    /**
     * Initializes a content child query that is always expected to match.
     */
    required: {
        <LocatorT>(locator: ProviderToken<LocatorT> | string, opts?: {
            descendants?: boolean;
            read?: undefined;
            debugName?: string;
        }): Signal<LocatorT>;
        <LocatorT, ReadT>(locator: ProviderToken<LocatorT> | string, opts: {
            descendants?: boolean;
            read: ProviderToken<ReadT>;
            debugName?: string;
        }): Signal<ReadT>;
    };
}
/**
 * Initializes a content child query. Consider using `contentChild.required` for queries that should
 * always match.
 *
 * @usageNotes
 * Create a child query in your component by declaring a
 * class field and initializing it with the `contentChild()` function.
 *
 * ```ts
 * @Component({...})
 * export class TestComponent {
 *   headerEl = contentChild<ElementRef>('h');                    // Signal<ElementRef|undefined>
 *   headerElElRequired = contentChild.required<ElementRef>('h'); // Signal<ElementRef>
 *   header = contentChild(MyHeader);                             // Signal<MyHeader|undefined>
 *   headerRequired = contentChild.required(MyHeader);            // Signal<MyHeader>
 * }
 * ```
 *
 * Note: By default `descendants` is `true` which means the query will traverse all descendants in the same template.
 *
 * @initializerApiFunction
 * @publicApi 19.0
 */
export declare const contentChild: ContentChildFunction;
export declare function contentChildren<LocatorT>(locator: ProviderToken<LocatorT> | string, opts?: {
    descendants?: boolean;
    read?: undefined;
    debugName?: string;
}): Signal<ReadonlyArray<LocatorT>>;
export declare function contentChildren<LocatorT, ReadT>(locator: ProviderToken<LocatorT> | string, opts: {
    descendants?: boolean;
    read: ProviderToken<ReadT>;
    debugName?: string;
}): Signal<ReadonlyArray<ReadT>>;
