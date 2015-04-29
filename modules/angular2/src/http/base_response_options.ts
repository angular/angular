import {Headers} from './Headers';
import {ResponseTypes} from './enums';
import {IResponseOptions} from './interfaces';

export class BaseResponseOptions implements IResponseOptions {
  status: number;
  headers: Headers | Object;
  statusText: string;
  type: ResponseTypes;
  url: string;

  constructor({status = 200, statusText = 'Ok', type = ResponseTypes.Default,
               headers = new Headers(), url = ''}: IResponseOptions = {}) {
    this.status = status;
    this.statusText = statusText;
    this.type = type;
    this.headers = headers;
    this.url = url;
  }
}
;

export var baseResponseOptions = Object.freeze(new BaseResponseOptions());
