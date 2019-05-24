import { Injectable } from '@angular/core';

@Injectable()
export class MockLogger {

  output: { log: any[], error: any[], warn: any[] } = {
    log: [],
    error: [],
    warn: []
  };

  log(value: any, ...rest: any[]) {
    this.output.log.push([value, ...rest]);
  }

  error(value: any, ...rest: any[]) {
    this.output.error.push([value, ...rest]);
  }

  warn(value: any, ...rest: any[]) {
    this.output.warn.push([value, ...rest]);
  }
}
