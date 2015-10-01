import {Component, View, EventEmitter} from 'angular2/angular2';
import {ObservableWrapper} from 'angular2/src/core/facade/async';

@Component(
    {selector: 'zippy', inputs: ['title'], outputs: ['openHandler: open', 'closeHandler: close']})
@View({templateUrl: 'zippy.html'})
export class Zippy {
  visible: boolean = true;
  title: string = '';
  openHandler: EventEmitter = new EventEmitter();
  closeHandler: EventEmitter = new EventEmitter();

  toggle() {
    this.visible = !this.visible;
    if (this.visible) {
      ObservableWrapper.callNext(this.openHandler, null);
    } else {
      ObservableWrapper.callNext(this.closeHandler, null);
    }
  }
}
