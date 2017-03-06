import { Injectable } from '@angular/core';

@Injectable()
export class MockLogger {

  output = {
    log: [],
    error: [],
    warn: []
  };

  log(value: any, ...rest) {
    this.output.log.push([value, ...rest]);
  }

  error(value: any, ...rest) {
    this.output.error.push([value, ...rest]);
  }

  warn(value: any, ...rest) {
    this.output.warn.push([value, ...rest]);
  }
}
