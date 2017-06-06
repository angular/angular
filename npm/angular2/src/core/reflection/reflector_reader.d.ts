/**
 * Provides read-only access to reflection data about symbols. Used internally by Angular
 * to power dependency injection and compilation.
 */
export declare abstract class ReflectorReader {
    abstract parameters(typeOrFunc: any): any[][];
    abstract annotations(typeOrFunc: any): any[];
    abstract propMetadata(typeOrFunc: any): {
        [key: string]: any[];
    };
    abstract importUri(typeOrFunc: any): string;
}
