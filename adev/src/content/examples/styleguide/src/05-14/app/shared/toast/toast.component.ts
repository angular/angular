// #docregion
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'toh-toast',
  template: `...`
})
// #docregion example
export class ToastComponent implements OnInit {
  // public properties
  message = '';
  title = '';

  // private fields
  private defaults = {
    title: '',
    message: 'May the Force be with you'
  };
  private toastElement: any;

  // public methods
  activate(message = this.defaults.message, title = this.defaults.title) {
    this.title = title;
    this.message = message;
    this.show();
  }

  ngOnInit() {
    this.toastElement = document.getElementById('toh-toast');
  }

  // private methods
  private hide() {
    this.toastElement.style.opacity = 0;
    setTimeout(() => this.toastElement.style.zIndex = 0, 400);
  }

  private show() {
    console.log(this.message);
    this.toastElement.style.opacity = 1;
    this.toastElement.style.zIndex = 9999;
    setTimeout(() => this.hide(), 2500);
  }
}
// #enddocregion example
