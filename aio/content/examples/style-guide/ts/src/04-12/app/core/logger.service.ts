// #docregion
import { Injectable } from '@angular/core';

@Injectable()
export class LoggerService {
  log(msg: string) {
    console.log(msg);
  }

  error(msg: string) {
    console.error(msg);
  }
}
