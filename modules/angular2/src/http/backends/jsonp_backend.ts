import {ConnectionBackend, Connection} from '../interfaces';
import {ReadyStates, RequestMethods} from '../enums';
import {Request} from '../static_request';
import {Response} from '../static_response';
import {ResponseOptions, BaseResponseOptions} from '../base_response_options';
import {Injectable} from 'angular2/angular2';
import {BrowserJsonp} from './browser_jsonp';
import {EventEmitter, ObservableWrapper} from 'angular2/src/core/facade/async';
import {makeTypeError} from 'angular2/src/core/facade/exceptions';
import {StringWrapper, isPresent} from 'angular2/src/core/facade/lang';
// todo(robwormald): temporary until https://github.com/angular/angular/issues/4390 decided
var Rx = require('@reactivex/rxjs/dist/cjs/Rx');
var {Observable} = Rx;
export abstract class JSONPConnection implements Connection {
  readyState: ReadyStates;
  request: Request;
  response: any;
  abstract finished(data?: any): void;
}

export class JSONPConnection_ extends JSONPConnection {
  private _id: string;
  private _script: Element;
  private _responseData: any;
  private _finished: boolean = false;

  constructor(req: Request, private _dom: BrowserJsonp,
              private baseResponseOptions?: ResponseOptions) {
    super();
    if (req.method !== RequestMethods.Get) {
      throw makeTypeError("JSONP requests must use GET request method.");
    }
    this.request = req;
    this.response = new Observable(responseObserver => {

      this.readyState = ReadyStates.Loading;
      let id = this._id = _dom.nextRequestID();

      _dom.exposeConnection(id, this);

      // Workaround Dart
      // url = url.replace(/=JSONP_CALLBACK(&|$)/, `generated method`);
      let callback = _dom.requestCallback(this._id);
      let url: string = req.url;
      if (url.indexOf('=JSONP_CALLBACK&') > -1) {
        url = StringWrapper.replace(url, '=JSONP_CALLBACK&', `=${callback}&`);
      } else if (url.lastIndexOf('=JSONP_CALLBACK') === url.length - '=JSONP_CALLBACK'.length) {
        url =
            StringWrapper.substring(url, 0, url.length - '=JSONP_CALLBACK'.length) + `=${callback}`;
      }

      let script = this._script = _dom.build(url);

      let onLoad = event => {
        if (this.readyState === ReadyStates.Cancelled) return;
        this.readyState = ReadyStates.Done;
        _dom.cleanup(script);
        if (!this._finished) {
          responseObserver.error(makeTypeError('JSONP injected script did not invoke callback.'));
          return;
        }

        let responseOptions = new ResponseOptions({body: this._responseData});
        if (isPresent(this.baseResponseOptions)) {
          responseOptions = this.baseResponseOptions.merge(responseOptions);
        }

        responseObserver.next(new Response(responseOptions));
        responseObserver.complete();
      };

      let onError = error => {
        if (this.readyState === ReadyStates.Cancelled) return;
        this.readyState = ReadyStates.Done;
        _dom.cleanup(script);
        responseObserver.error(error);
      };

      script.addEventListener('load', onLoad);
      script.addEventListener('error', onError);

      _dom.send(script);

      return () => {
        this.readyState = ReadyStates.Cancelled;
        script.removeEventListener('load', onLoad);
        script.removeEventListener('error', onError);
        if (isPresent(script)) {
          this._dom.cleanup(script);
        }

      };
    });
  }

  finished(data?: any) {
    // Don't leak connections
    this._finished = true;
    this._dom.removeConnection(this._id);
    if (this.readyState === ReadyStates.Cancelled) return;
    this._responseData = data;
  }
}

export abstract class JSONPBackend extends ConnectionBackend {}

@Injectable()
export class JSONPBackend_ extends JSONPBackend {
  constructor(private _browserJSONP: BrowserJsonp, private _baseResponseOptions: ResponseOptions) {
    super();
  }

  createConnection(request: Request): JSONPConnection {
    return new JSONPConnection_(request, this._browserJSONP, this._baseResponseOptions);
  }
}
