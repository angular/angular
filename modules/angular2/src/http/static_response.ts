import {Response as IResponse, ResponseOptions} from './interfaces';
import {ResponseTypes} from './enums';
import {baseResponseOptions} from './base_response_options';
import {BaseException, isJsObject, isString, global} from 'angular2/src/facade/lang';
import {Headers} from './headers';

// TODO: make this injectable so baseResponseOptions can be overridden
export class Response implements IResponse {
  type: ResponseTypes;
  ok: boolean;
  url: string;
  status: number;
  statusText: string;
  bytesLoaded: number;
  totalBytes: number;
  headers: Headers;
  constructor(private body?: string | Object | ArrayBuffer | JSON | FormData | Blob,
              {status, statusText, headers, type, url}: ResponseOptions = baseResponseOptions) {
    if (isJsObject(headers)) {
      headers = new Headers(headers);
    }
    this.body = body;
    this.status = status;
    this.statusText = statusText;
    this.headers = <Headers>headers;
    this.type = type;
    this.url = url;
  }

  blob(): Blob {
    throw new BaseException('"blob()" method not implemented on Response superclass');
  }

  json(): JSON {
    if (isJsObject(this.body)) {
      return <JSON>this.body;
    } else if (isString(this.body)) {
      return global.JSON.parse(<string>this.body);
    }
  }

  text(): string { return this.body.toString(); }

  arrayBuffer(): ArrayBuffer {
    throw new BaseException('"arrayBuffer()" method not implemented on Response superclass');
  }
}
