/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ParamMap, Params } from './shared';
/**
 * A set of options which specify how to determine if a `UrlTree` is active, given the `UrlTree`
 * for the current router state.
 *
 * @publicApi
 * @see {@link Router#isActive}
 */
export interface IsActiveMatchOptions {
    /**
     * Defines the strategy for comparing the matrix parameters of two `UrlTree`s.
     *
     * The matrix parameter matching is dependent on the strategy for matching the
     * segments. That is, if the `paths` option is set to `'subset'`, only
     * the matrix parameters of the matching segments will be compared.
     *
     * - `'exact'`: Requires that matching segments also have exact matrix parameter
     * matches.
     * - `'subset'`: The matching segments in the router's active `UrlTree` may contain
     * extra matrix parameters, but those that exist in the `UrlTree` in question must match.
     * - `'ignored'`: When comparing `UrlTree`s, matrix params will be ignored.
     */
    matrixParams: 'exact' | 'subset' | 'ignored';
    /**
     * Defines the strategy for comparing the query parameters of two `UrlTree`s.
     *
     * - `'exact'`: the query parameters must match exactly.
     * - `'subset'`: the active `UrlTree` may contain extra parameters,
     * but must match the key and value of any that exist in the `UrlTree` in question.
     * - `'ignored'`: When comparing `UrlTree`s, query params will be ignored.
     */
    queryParams: 'exact' | 'subset' | 'ignored';
    /**
     * Defines the strategy for comparing the `UrlSegment`s of the `UrlTree`s.
     *
     * - `'exact'`: all segments in each `UrlTree` must match.
     * - `'subset'`: a `UrlTree` will be determined to be active if it
     * is a subtree of the active route. That is, the active route may contain extra
     * segments, but must at least have all the segments of the `UrlTree` in question.
     */
    paths: 'exact' | 'subset';
    /**
     * - `'exact'`: indicates that the `UrlTree` fragments must be equal.
     * - `'ignored'`: the fragments will not be compared when determining if a
     * `UrlTree` is active.
     */
    fragment: 'exact' | 'ignored';
}
export declare function containsTree(container: UrlTree, containee: UrlTree, options: IsActiveMatchOptions): boolean;
/**
 * @description
 *
 * Represents the parsed URL.
 *
 * Since a router state is a tree, and the URL is nothing but a serialized state, the URL is a
 * serialized tree.
 * UrlTree is a data structure that provides a lot of affordances in dealing with URLs
 *
 * @usageNotes
 * ### Example
 *
 * ```ts
 * @Component({templateUrl:'template.html'})
 * class MyComponent {
 *   constructor(router: Router) {
 *     const tree: UrlTree =
 *       router.parseUrl('/team/33/(user/victor//support:help)?debug=true#fragment');
 *     const f = tree.fragment; // return 'fragment'
 *     const q = tree.queryParams; // returns {debug: 'true'}
 *     const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
 *     const s: UrlSegment[] = g.segments; // returns 2 segments 'team' and '33'
 *     g.children[PRIMARY_OUTLET].segments; // returns 2 segments 'user' and 'victor'
 *     g.children['support'].segments; // return 1 segment 'help'
 *   }
 * }
 * ```
 *
 * @publicApi
 */
export declare class UrlTree {
    /** The root segment group of the URL tree */
    root: UrlSegmentGroup;
    /** The query params of the URL */
    queryParams: Params;
    /** The fragment of the URL */
    fragment: string | null;
    /** @internal */
    _queryParamMap?: ParamMap;
    constructor(
    /** The root segment group of the URL tree */
    root?: UrlSegmentGroup, 
    /** The query params of the URL */
    queryParams?: Params, 
    /** The fragment of the URL */
    fragment?: string | null);
    get queryParamMap(): ParamMap;
    /** @docsNotRequired */
    toString(): string;
}
/**
 * @description
 *
 * Represents the parsed URL segment group.
 *
 * See `UrlTree` for more information.
 *
 * @publicApi
 */
export declare class UrlSegmentGroup {
    /** The URL segments of this group. See `UrlSegment` for more information */
    segments: UrlSegment[];
    /** The list of children of this group */
    children: {
        [key: string]: UrlSegmentGroup;
    };
    /** The parent node in the url tree */
    parent: UrlSegmentGroup | null;
    constructor(
    /** The URL segments of this group. See `UrlSegment` for more information */
    segments: UrlSegment[], 
    /** The list of children of this group */
    children: {
        [key: string]: UrlSegmentGroup;
    });
    /** Whether the segment has child segments */
    hasChildren(): boolean;
    /** Number of child segments */
    get numberOfChildren(): number;
    /** @docsNotRequired */
    toString(): string;
}
/**
 * @description
 *
 * Represents a single URL segment.
 *
 * A UrlSegment is a part of a URL between the two slashes. It contains a path and the matrix
 * parameters associated with the segment.
 *
 * @usageNotes
 * ### Example
 *
 * ```ts
 * @Component({templateUrl:'template.html'})
 * class MyComponent {
 *   constructor(router: Router) {
 *     const tree: UrlTree = router.parseUrl('/team;id=33');
 *     const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
 *     const s: UrlSegment[] = g.segments;
 *     s[0].path; // returns 'team'
 *     s[0].parameters; // returns {id: 33}
 *   }
 * }
 * ```
 *
 * @publicApi
 */
export declare class UrlSegment {
    /** The path part of a URL segment */
    path: string;
    /** The matrix parameters associated with a segment */
    parameters: {
        [name: string]: string;
    };
    /** @internal */
    _parameterMap?: ParamMap;
    constructor(
    /** The path part of a URL segment */
    path: string, 
    /** The matrix parameters associated with a segment */
    parameters: {
        [name: string]: string;
    });
    get parameterMap(): ParamMap;
    /** @docsNotRequired */
    toString(): string;
}
export declare function equalSegments(as: UrlSegment[], bs: UrlSegment[]): boolean;
export declare function equalPath(as: UrlSegment[], bs: UrlSegment[]): boolean;
export declare function mapChildrenIntoArray<T>(segment: UrlSegmentGroup, fn: (v: UrlSegmentGroup, k: string) => T[]): T[];
/**
 * @description
 *
 * Serializes and deserializes a URL string into a URL tree.
 *
 * The url serialization strategy is customizable. You can
 * make all URLs case insensitive by providing a custom UrlSerializer.
 *
 * See `DefaultUrlSerializer` for an example of a URL serializer.
 *
 * @publicApi
 */
export declare abstract class UrlSerializer {
    /** Parse a url into a `UrlTree` */
    abstract parse(url: string): UrlTree;
    /** Converts a `UrlTree` into a url */
    abstract serialize(tree: UrlTree): string;
}
/**
 * @description
 *
 * A default implementation of the `UrlSerializer`.
 *
 * Example URLs:
 *
 * ```
 * /inbox/33(popup:compose)
 * /inbox/33;open=true/messages/44
 * ```
 *
 * DefaultUrlSerializer uses parentheses to serialize secondary segments (e.g., popup:compose), the
 * colon syntax to specify the outlet, and the ';parameter=value' syntax (e.g., open=true) to
 * specify route specific parameters.
 *
 * @publicApi
 */
export declare class DefaultUrlSerializer implements UrlSerializer {
    /** Parses a url into a `UrlTree` */
    parse(url: string): UrlTree;
    /** Converts a `UrlTree` into a url */
    serialize(tree: UrlTree): string;
}
export declare function serializePaths(segment: UrlSegmentGroup): string;
/**
 * This function should be used to encode both keys and values in a query string key/value. In
 * the following URL, you need to call encodeUriQuery on "k" and "v":
 *
 * http://www.site.org/html;mk=mv?k=v#f
 */
export declare function encodeUriQuery(s: string): string;
/**
 * This function should be used to encode a URL fragment. In the following URL, you need to call
 * encodeUriFragment on "f":
 *
 * http://www.site.org/html;mk=mv?k=v#f
 */
export declare function encodeUriFragment(s: string): string;
/**
 * This function should be run on any URI segment as well as the key and value in a key/value
 * pair for matrix params. In the following URL, you need to call encodeUriSegment on "html",
 * "mk", and "mv":
 *
 * http://www.site.org/html;mk=mv?k=v#f
 */
export declare function encodeUriSegment(s: string): string;
export declare function decode(s: string): string;
export declare function decodeQuery(s: string): string;
export declare function serializePath(path: UrlSegment): string;
export declare function createRoot(rootCandidate: UrlSegmentGroup): UrlSegmentGroup;
/**
 * Recursively
 * - merges primary segment children into their parents
 * - drops empty children (those which have no segments and no children themselves). This latter
 * prevents serializing a group into something like `/a(aux:)`, where `aux` is an empty child
 * segment.
 * - merges named outlets without a primary segment sibling into the children. This prevents
 * serializing a URL like `//(a:a)(b:b) instead of `/(a:a//b:b)` when the aux b route lives on the
 * root but the `a` route lives under an empty path primary route.
 */
export declare function squashSegmentGroup(segmentGroup: UrlSegmentGroup): UrlSegmentGroup;
export declare function isUrlTree(v: any): v is UrlTree;
