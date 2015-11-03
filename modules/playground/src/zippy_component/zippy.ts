import {Component, EventEmitter, Input, Output} from 'angular2/angular2';
import {ObservableWrapper} from 'angular2/src/core/facade/async';

@Component({selector: 'zippy', templateUrl: 'zippy.html'})
export class Zippy {
  visible: boolean = true;
  @Input() title: string = '';
  @Output() open: EventEmitter<any> = new EventEmitter();
  @Output() close: EventEmitter<any> = new EventEmitter();

  toggle() {
    this.visible = !this.visible;
    if (this.visible) {
      ObservableWrapper.callNext(this.open, null);
    } else {
      ObservableWrapper.callNext(this.close, null);
    }
  }
}
