// #docplaster
// #docregion
// #docregion example
import { Injectable } from '@angular/core';

@Injectable()
export class ToastService {
  message: string;

  private toastCount: number;

  hide() {
    this.toastCount--;
    this.log();
  }

  show() {
    this.toastCount++;
    this.log();
  }

  private log() {
    console.log(this.message);
  }
  // #enddocregion example
  // testing harness
  activate(message: string) {
    this.message = message;
  }
  // #docregion example
}
// #enddocregion example
