import {ConnectionBackend, Connection} from '../interfaces';
import {ReadyState, RequestMethod, ResponseType} from '../enums';
import {Request} from '../static_request';
import {Response} from '../static_response';
import {ResponseOptions, BaseResponseOptions} from '../base_response_options';
import {Injectable} from 'angular2/core';
import {BrowserJsonp} from './browser_jsonp';
import {makeTypeError} from 'angular2/src/facade/exceptions';
import {StringWrapper, isPresent} from 'angular2/src/facade/lang';
import {Observable} from 'rxjs/Observable';

const JSONP_ERR_NO_CALLBACK = 'JSONP injected script did not invoke callback.';
const JSONP_ERR_WRONG_METHOD = 'JSONP requests must use GET request method.';

export class JSONPConnection extends Observable<Response> {
  request: Request;
  private _id: string;
  private _script: Element;
  private _responseData: any;
  private _finished: boolean;

  constructor(req: Request, _dom: BrowserJsonp, baseResponseOptions?: ResponseOptions) {
    if (req.method !== RequestMethod.Get) {
      throw makeTypeError(JSONP_ERR_WRONG_METHOD);
    }

    const subscriber = responseObserver => {

      const id = _dom.nextRequestID();
      let canceled = false;

      _dom.exposeConnection(id, this);

      // Workaround Dart
      // url = url.replace(/=JSONP_CALLBACK(&|$)/, `generated method`);
      let callback = _dom.requestCallback(id);
      let url: string = req.url;
      if (url.indexOf('=JSONP_CALLBACK&') > -1) {
        url = StringWrapper.replace(url, '=JSONP_CALLBACK&', `=${callback}&`);
      } else if (url.lastIndexOf('=JSONP_CALLBACK') === url.length - '=JSONP_CALLBACK'.length) {
        url = url.substring(0, url.length - '=JSONP_CALLBACK'.length) + `=${callback}`;
      }

      let script = _dom.build(url);

      let onLoad = event => {
        if (canceled) return;
        _dom.cleanup(script);
        _dom.removeConnection(id);
        if (!this._finished) {
          let responseOptions =
              new ResponseOptions({body: JSONP_ERR_NO_CALLBACK, type: ResponseType.Error, url});
          if (isPresent(baseResponseOptions)) {
            responseOptions = baseResponseOptions.merge(responseOptions);
          }
          responseObserver.error(new Response(responseOptions));
          return;
        }

        let responseOptions = new ResponseOptions({body: this._responseData, url});
        if (isPresent(baseResponseOptions)) {
          responseOptions = baseResponseOptions.merge(responseOptions);
        }

        responseObserver.next(new Response(responseOptions));
        responseObserver.complete();
      };

      let onError = error => {
        if (canceled) return;
        _dom.cleanup(script);
        _dom.removeConnection(id);
        let responseOptions = new ResponseOptions({body: error.message, type: ResponseType.Error});
        if (isPresent(baseResponseOptions)) {
          responseOptions = baseResponseOptions.merge(responseOptions);
        }
        responseObserver.error(new Response(responseOptions));
      };

      script.addEventListener('load', onLoad);
      script.addEventListener('error', onError);

      _dom.send(script);

      return () => {
        canceled = true;
        script.removeEventListener('load', onLoad);
        script.removeEventListener('error', onError);
        if (isPresent(script)) {
          _dom.cleanup(script);
          _dom.removeConnection(id);
        }

      };
    };

    super(subscriber);

    this.request = req;
  }

  finished(data?: any) {
    // Don't leak connections
    this._finished = true;
    this._responseData = data;
  }
}

/**
 * A {@link ConnectionBackend} that uses the JSONP strategy of making requests.
 */
@Injectable()
export class JSONPBackend extends ConnectionBackend {
  constructor(private _browserJSONP: BrowserJsonp, private _baseResponseOptions: ResponseOptions) {
    super();
  }

  createConnection(request: Request): JSONPConnection {
    return new JSONPConnection(request, this._browserJSONP, this._baseResponseOptions);
  }
}
