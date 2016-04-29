import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ObservableWrapper} from '@angular/facade';

@Component({selector: 'zippy', templateUrl: 'zippy.html'})
export class Zippy {
  visible: boolean = true;
  @Input() title: string = '';
  @Output() open: EventEmitter<any> = new EventEmitter();
  @Output() close: EventEmitter<any> = new EventEmitter();

  toggle() {
    this.visible = !this.visible;
    if (this.visible) {
      ObservableWrapper.callEmit(this.open, null);
    } else {
      ObservableWrapper.callEmit(this.close, null);
    }
  }
}
