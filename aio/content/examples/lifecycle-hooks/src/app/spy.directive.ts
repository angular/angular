// #docregion
import { Directive, OnInit, OnDestroy } from '@angular/core';

import { LoggerService } from './logger.service';

let nextId = 1;

// #docregion spy-directive
// 엘리먼트에 스파이 디렉티브를 자유롭게 적용합니다.
// 사용방법: <div mySpy>...</div>
@Directive({selector: '[mySpy]'})
export class SpyDirective implements OnInit, OnDestroy {

  constructor(private logger: LoggerService) { }

  ngOnInit()    { this.logIt(`onInit`); }

  ngOnDestroy() { this.logIt(`onDestroy`); }

  private logIt(msg: string) {
    this.logger.log(`Spy #${nextId++} ${msg}`);
  }
}
// #enddocregion spy-directive
