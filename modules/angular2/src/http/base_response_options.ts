import {Headers} from './headers';
import {ResponseTypes} from './enums';
import {ResponseOptions} from './interfaces';

export class BaseResponseOptions implements ResponseOptions {
  body: string | Object | ArrayBuffer | JSON | FormData | Blob;
  status: number;
  headers: Headers;
  statusText: string;
  type: ResponseTypes;
  url: string;

  constructor() {
    this.status = 200;
    this.statusText = 'Ok';
    this.type = ResponseTypes.Default;
    this.headers = new Headers();
  }
}

export var baseResponseOptions = new BaseResponseOptions();
