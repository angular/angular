import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';


@Injectable()
export class Logger {

  log(value: any, ...rest: any[]) {
    if (!environment.production) {
      console.log(value, ...rest);
    }
  }

  error(value: any, ...rest: any[]) {
    console.error(value, ...rest);
  }

  warn(value: any, ...rest: any[]) {
    console.warn(value, ...rest);
  }
}
