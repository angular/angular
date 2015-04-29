import {IConnectionBackend, IConnection, IRequest, IResponse} from '../interfaces';
import {ReadyStates, RequestMethods} from '../enums';
import {Request} from '../static_request';
import {Response} from '../static_response';
import {Inject} from 'angular2/di';
import {Injectable} from 'angular2/di';
import {BrowserXHR} from './browser_xhr';
import * as Rx from 'rx';

export class XHRConnection implements IConnection {
  request: Request;
  response: Rx.Subject<Response>;
  readyState: ReadyStates;
  private _xhr;
  constructor(req: Request, nativeConstruct: any) {
    this.request = req;
    if (Rx.hasOwnProperty('default')) {
      this.response = new (<any>Rx).default.Rx.Subject();
    } else {
      this.response = new Rx.Subject<Response>();
    }
    this._xhr = new nativeConstruct();
    this._xhr.open(RequestMethods[req.method], req.url);
    this._xhr.addEventListener(
        'load',
        () => {this.response.onNext(new Response(this._xhr.response || this._xhr.responseText))});
    this._xhr.send(this.request.body);
  }

  dispose(): void { this._xhr.abort(); }
}

@Injectable()
export class XHRBackend implements IConnectionBackend {
  private _nativeConstruct: BrowserXHR;
  constructor(@Inject(BrowserXHR) nativeConstruct: BrowserXHR) {
    this._nativeConstruct = nativeConstruct;
  }
  createConnection(request: Request): IConnection {
    return new XHRConnection(request, this._nativeConstruct);
  }
}
