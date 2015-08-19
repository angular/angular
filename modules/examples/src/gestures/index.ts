import {bootstrap, Component, BaseView} from 'angular2/bootstrap';

@Component({selector: 'gestures-app'})
@BaseView({templateUrl: 'template.html'})
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
