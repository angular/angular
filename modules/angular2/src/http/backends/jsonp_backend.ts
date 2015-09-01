import {ConnectionBackend, Connection} from '../interfaces';
import {ReadyStates, RequestMethods} from '../enums';
import {Request} from '../static_request';
import {Response} from '../static_response';
import {ResponseOptions, BaseResponseOptions} from '../base_response_options';
import {Injectable} from 'angular2/di';
import {BrowserJsonp} from './browser_jsonp';
import {EventEmitter, ObservableWrapper} from 'angular2/src/core/facade/async';
import {StringWrapper, isPresent, makeTypeError} from 'angular2/src/core/facade/lang';

export class JSONPConnection implements Connection {
  readyState: ReadyStates;
  request: Request;
  response: EventEmitter;
  private _id: string;
  private _script: Element;
  private _responseData: any;
  private _finished: boolean = false;

  constructor(req: Request, private _dom: BrowserJsonp,
              private baseResponseOptions?: ResponseOptions) {
    if (req.method !== RequestMethods.Get) {
      throw makeTypeError("JSONP requests must use GET request method.");
    }
    this.request = req;
    this.response = new EventEmitter();
    this.readyState = ReadyStates.Loading;
    this._id = _dom.nextRequestID();

    _dom.exposeConnection(this._id, this);

    // Workaround Dart
    // url = url.replace(/=JSONP_CALLBACK(&|$)/, `generated method`);
    let callback = _dom.requestCallback(this._id);
    let url: string = req.url;
    if (url.indexOf('=JSONP_CALLBACK&') > -1) {
      url = StringWrapper.replace(url, '=JSONP_CALLBACK&', `=${callback}&`);
    } else if (url.lastIndexOf('=JSONP_CALLBACK') === url.length - '=JSONP_CALLBACK'.length) {
      url = StringWrapper.substring(url, 0, url.length - '=JSONP_CALLBACK'.length) + `=${callback}`;
    }

    let script = this._script = _dom.build(url);

    script.addEventListener('load', (event) => {
      if (this.readyState === ReadyStates.Cancelled) return;
      this.readyState = ReadyStates.Done;
      _dom.cleanup(script);
      if (!this._finished) {
        ObservableWrapper.callThrow(
            this.response, makeTypeError('JSONP injected script did not invoke callback.'));
        return;
      }

      let responseOptions = new ResponseOptions({body: this._responseData});
      if (isPresent(this.baseResponseOptions)) {
        responseOptions = this.baseResponseOptions.merge(responseOptions);
      }

      ObservableWrapper.callNext(this.response, new Response(responseOptions));
    });

    script.addEventListener('error', (error) => {
      if (this.readyState === ReadyStates.Cancelled) return;
      this.readyState = ReadyStates.Done;
      _dom.cleanup(script);
      ObservableWrapper.callThrow(this.response, error);
    });

    _dom.send(script);
  }

  finished(data?: any) {
    // Don't leak connections
    this._finished = true;
    this._dom.removeConnection(this._id);
    if (this.readyState === ReadyStates.Cancelled) return;
    this._responseData = data;
  }

  dispose(): void {
    this.readyState = ReadyStates.Cancelled;
    let script = this._script;
    this._script = null;
    if (isPresent(script)) {
      this._dom.cleanup(script);
    }
    ObservableWrapper.callReturn(this.response);
  }
}

@Injectable()
export class JSONPBackend implements ConnectionBackend {
  constructor(private _browserJSONP: BrowserJsonp, private _baseResponseOptions: ResponseOptions) {}
  createConnection(request: Request): JSONPConnection {
    return new JSONPConnection(request, this._browserJSONP, this._baseResponseOptions);
  }
}
