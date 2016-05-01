/**
 * An interface for retrieving documents by URL that the compiler uses
 * to load templates.
 */
export declare class XHR {
    get(url: string): Promise<string>;
}
