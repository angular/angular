import {Headers} from './headers';
import {ResponseTypes} from './enums';
import {ResponseOptions} from './interfaces';

export class BaseResponseOptions implements ResponseOptions {
  status: number;
  headers: Headers | Object;
  statusText: string;
  type: ResponseTypes;
  url: string;

  constructor({status = 200, statusText = 'Ok', type = ResponseTypes.Default,
               headers = new Headers(), url = ''}: ResponseOptions = {}) {
    this.status = status;
    this.statusText = statusText;
    this.type = type;
    this.headers = headers;
    this.url = url;
  }
}
;

export var baseResponseOptions = Object.freeze(new BaseResponseOptions());
