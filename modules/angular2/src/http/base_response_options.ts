import {Injectable} from 'angular2/di';
import {isPresent, isJsObject} from 'angular2/src/facade/lang';
import {Headers} from './headers';
import {ResponseTypes} from './enums';
import {IResponseOptions} from './interfaces';


export class ResponseOptions implements IResponseOptions {
  // TODO: ArrayBuffer | FormData | Blob
  body: string | Object;
  status: number;
  headers: Headers;
  statusText: string;
  type: ResponseTypes;
  url: string;
  constructor({body, status, headers, statusText, type, url}: IResponseOptions = {}) {
    this.body = isPresent(body) ? body : null;
    this.status = isPresent(status) ? status : null;
    this.headers = isPresent(headers) ? headers : null;
    this.statusText = isPresent(statusText) ? statusText : null;
    this.type = isPresent(type) ? type : null;
    this.url = isPresent(url) ? url : null;
  }

  merge(options?: IResponseOptions) {
    return new ResponseOptions({
      body: isPresent(options) && isPresent(options.body) ? options.body : this.body,
      status: isPresent(options) && isPresent(options.status) ? options.status : this.status,
      headers: isPresent(options) && isPresent(options.headers) ? options.headers : this.headers,
      statusText: isPresent(options) && isPresent(options.statusText) ? options.statusText :
                                                                        this.statusText,
      type: isPresent(options) && isPresent(options.type) ? options.type : this.type,
      url: isPresent(options) && isPresent(options.url) ? options.url : this.url,
    });
  }
}

@Injectable()
export class BaseResponseOptions extends ResponseOptions {
  // TODO: Object | ArrayBuffer | JSON | FormData | Blob
  body: string | Object | ArrayBuffer | JSON | FormData | Blob;
  status: number;
  headers: Headers;
  statusText: string;
  type: ResponseTypes;
  url: string;

  constructor() {
    super({status: 200, statusText: 'Ok', type: ResponseTypes.Default, headers: new Headers()});
  }
}
