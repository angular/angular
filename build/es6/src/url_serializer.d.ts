import { UrlTree, UrlSegment } from './url_tree';
export declare abstract class UrlSerializer {
    abstract parse(url: string): UrlTree;
    abstract serialize(tree: UrlTree): string;
}
export declare class DefaultUrlSerializer implements UrlSerializer {
    parse(url: string): UrlTree;
    serialize(tree: UrlTree): string;
}
export declare function serializeSegment(segment: UrlSegment): string;
