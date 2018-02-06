import { ErrorHandler, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';


@Injectable()
export class Logger {

  constructor(private errorHandler: ErrorHandler) {}

  log(value: any, ...rest: any[]) {
    if (!environment.production) {
      console.log(value, ...rest);
    }
  }

  error(value: any, ...rest: any[]) {
    const message = [value, ...rest].join(' ');
    this.errorHandler.handleError(message);
  }

  warn(value: any, ...rest: any[]) {
    console.warn(value, ...rest);
  }
}
