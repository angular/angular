import { UrlTree } from './segments';
export declare abstract class RouterUrlSerializer {
    abstract parse(url: string): UrlTree;
    abstract serialize(tree: UrlTree): string;
}
export declare class DefaultRouterUrlSerializer extends RouterUrlSerializer {
    parse(url: string): UrlTree;
    serialize(tree: UrlTree): string;
}
