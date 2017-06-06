import { ConnectionBackend, Connection } from '../interfaces';
import { ReadyState } from '../enums';
import { Request } from '../static_request';
import { Response } from '../static_response';
import { ResponseOptions } from '../base_response_options';
import { BrowserJsonp } from './browser_jsonp';
import { Observable } from 'rxjs/Observable';
/**
 * Abstract base class for an in-flight JSONP request.
 */
export declare abstract class JSONPConnection implements Connection {
    /**
     * The {@link ReadyState} of this request.
     */
    readyState: ReadyState;
    /**
     * The outgoing HTTP request.
     */
    request: Request;
    /**
     * An observable that completes with the response, when the request is finished.
     */
    response: Observable<Response>;
    /**
     * Callback called when the JSONP request completes, to notify the application
     * of the new data.
     */
    abstract finished(data?: any): void;
}
export declare class JSONPConnection_ extends JSONPConnection {
    private _dom;
    private baseResponseOptions;
    private _id;
    private _script;
    private _responseData;
    private _finished;
    constructor(req: Request, _dom: BrowserJsonp, baseResponseOptions?: ResponseOptions);
    finished(data?: any): void;
}
/**
 * A {@link ConnectionBackend} that uses the JSONP strategy of making requests.
 */
export declare abstract class JSONPBackend extends ConnectionBackend {
}
export declare class JSONPBackend_ extends JSONPBackend {
    private _browserJSONP;
    private _baseResponseOptions;
    constructor(_browserJSONP: BrowserJsonp, _baseResponseOptions: ResponseOptions);
    createConnection(request: Request): JSONPConnection;
}
