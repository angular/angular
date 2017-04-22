import { Component, EventEmitter } from '@angular/core';

// #docregion
export class ConfirmComponent {
  constructor(){
    this.ok    = new EventEmitter();
    this.notOk = new EventEmitter();
  }
  onOkClick() {
    this.ok.emit(true);
  }
  onNotOkClick() {
    this.notOk.emit(true);
  }
}

ConfirmComponent.annotations = [
  new Component({
    selector: 'app-confirm',
    templateUrl: './confirm.component.html',
    inputs: [
      'okMsg',
      'notOkMsg: cancelMsg'
    ],
    outputs: [
      'ok',
      'notOk: cancel'
    ]
  })
];
// #enddocregion
