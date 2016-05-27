import { Tree, TreeNode } from './utils/tree';
export declare function createEmptyUrlTree(): UrlTree;
export declare class UrlTree extends Tree<UrlSegment> {
    queryParameters: {
        [key: string]: string;
    };
    fragment: string | null;
    constructor(root: TreeNode<UrlSegment>, queryParameters: {
        [key: string]: string;
    }, fragment: string | null);
}
export declare class UrlSegment {
    path: string;
    parameters: {
        [key: string]: string;
    };
    outlet: string;
    constructor(path: string, parameters: {
        [key: string]: string;
    }, outlet: string);
    toString(): string;
}
export declare function equalUrlSegments(a: UrlSegment[], b: UrlSegment[]): boolean;
