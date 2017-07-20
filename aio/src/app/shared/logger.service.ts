import { Injectable } from '@angular/core';

@Injectable()
export class Logger {

  log(value: any, ...rest) {
    console.log(value, ...rest);
  }

  error(value: any, ...rest) {
    console.error(value, ...rest);
  }

  warn(value: any, ...rest) {
    console.warn(value, ...rest);
  }
}
