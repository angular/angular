// #docregion
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface SpinnerState {
  show: boolean;
}

@Injectable()
export class SpinnerService {
  private spinnerSubject = new Subject<SpinnerState>();

  spinnerState = this.spinnerSubject.asObservable();

  constructor() { }

  show() {
    this.spinnerSubject.next({ show: true });
  }

  hide() {
    this.spinnerSubject.next({ show: false });
  }
}
