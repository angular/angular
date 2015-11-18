import { ConnectionBackend, Connection } from '../interfaces';
import { ReadyStates } from '../enums';
import { Request } from '../static_request';
import { Response } from '../static_response';
import { ResponseOptions } from '../base_response_options';
import { BrowserJsonp } from './browser_jsonp';
import { Observable } from 'angular2/angular2';
export declare abstract class JSONPConnection implements Connection {
    readyState: ReadyStates;
    request: Request;
    response: Observable<Response>;
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
export declare abstract class JSONPBackend extends ConnectionBackend {
}
export declare class JSONPBackend_ extends JSONPBackend {
    private _browserJSONP;
    private _baseResponseOptions;
    constructor(_browserJSONP: BrowserJsonp, _baseResponseOptions: ResponseOptions);
    createConnection(request: Request): JSONPConnection;
}
