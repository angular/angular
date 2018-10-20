// #docregion
import { Injectable } from '@angular/core';

@Injectable()
export class Logger {
  logs: string[] = []; // 테스트하기 위해 로그를 저장합니다.

  log(message: string) {
    this.logs.push(message);
    console.log(message);
  }
}
