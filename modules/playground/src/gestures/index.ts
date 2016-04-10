import {bootstrap} from 'angular2/platform/browser';
import {Component} from 'angular2/core';

@Component({selector: 'gestures-app', templateUrl: 'template.html'})
class GesturesCmp {
  swipeDirection: string = '-';
  pinchScale: number = 1;
  rotateAngle: number = 0;

  onSwipe(event): void { this.swipeDirection = event.deltaX > 0 ? 'right' : 'left'; }

  onPinch(event): void { this.pinchScale = event.scale; }

  onRotate(event): void { this.rotateAngle = event.rotation; }
}

export function main() {
  bootstrap(GesturesCmp);
}
