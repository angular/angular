import {ConnectionBackend, Connection} from '../interfaces';
import {ReadyStates, RequestMethods} from '../enums';
import {Request} from '../static_request';
import {Response} from '../static_response';
import {Inject} from 'angular2/di';
import {Injectable} from 'angular2/di';
import {BrowserXHR} from './browser_xhr';
import * as Rx from 'rx';

export class XHRConnection implements Connection {
  request: Request;
  response: Rx.Subject<Response>;
  readyState: ReadyStates;
  private _xhr;
  constructor(req: Request, NativeConstruct: any) {
    this.request = req;
    if (Rx.hasOwnProperty('default')) {
      this.response = new (<any>Rx).default.Rx.Subject();
    } else {
      this.response = new Rx.Subject<Response>();
    }
    this._xhr = new NativeConstruct();
    this._xhr.open(RequestMethods[req.method], req.url);
    this._xhr.addEventListener(
        'load',
        () => {this.response.onNext(new Response(this._xhr.response || this._xhr.responseText))});
    // TODO(jeffbcross): make this more dynamic based on body type
    this._xhr.send(this.request.text());
  }

  dispose(): void { this._xhr.abort(); }
}

@Injectable()
export class XHRBackend implements ConnectionBackend {
  constructor(private _NativeConstruct: BrowserXHR) {}
  createConnection(request: Request): XHRConnection {
    return new XHRConnection(request, this._NativeConstruct);
  }
}
