import { Component, OnInit } from '@angular/core';

import { ExceptionService } from './core';

@Component({
  selector: 'sg-app',
  template: '<div>The expected error is {{errorCode}}</div>',
  providers: [ExceptionService]
})
export class AppComponent implements OnInit {
  errorCode: number;

  constructor(private exceptionService: ExceptionService) { }

  ngOnInit() {
    this.errorCode = this.exceptionService.getException();
  }
}
