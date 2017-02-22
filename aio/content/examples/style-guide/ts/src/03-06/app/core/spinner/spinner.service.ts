import { Injectable } from '@angular/core';

export interface ISpinnerState { }

@Injectable()
export class SpinnerService {
  spinnerState: any;

  show() { }

  hide() { }
}
