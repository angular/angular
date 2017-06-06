import { ReadyState, RequestMethod, ResponseType } from './enums';
import { Headers } from './headers';
import { Request } from './static_request';
import { URLSearchParams } from './url_search_params';
/**
 * Abstract class from which real backends are derived.
 *
 * The primary purpose of a `ConnectionBackend` is to create new connections to fulfill a given
 * {@link Request}.
 */
export declare abstract class ConnectionBackend {
    abstract createConnection(request: any): Connection;
}
/**
 * Abstract class from which real connections are derived.
 */
export declare abstract class Connection {
    readyState: ReadyState;
    request: Request;
    response: any;
}
/**
 * Interface for options to construct a RequestOptions, based on
 * [RequestInit](https://fetch.spec.whatwg.org/#requestinit) from the Fetch spec.
 */
export interface RequestOptionsArgs {
    url?: string;
    method?: string | RequestMethod;
    search?: string | URLSearchParams;
    headers?: Headers;
    body?: string;
}
/**
 * Required structure when constructing new Request();
 */
export interface RequestArgs extends RequestOptionsArgs {
    url: string;
}
/**
 * Interface for options to construct a Response, based on
 * [ResponseInit](https://fetch.spec.whatwg.org/#responseinit) from the Fetch spec.
 */
export declare type ResponseOptionsArgs = {
    body?: string | Object | FormData;
    status?: number;
    statusText?: string;
    headers?: Headers;
    type?: ResponseType;
    url?: string;
};
