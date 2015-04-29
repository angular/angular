import {bootstrap} from 'angular2/angular2';
import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';

// TODO(radokirov): Once the application is transpiled by TS instead of Traceur,
// add those imports back into 'angular2/angular2';
import {Component} from 'angular2/src/core/annotations_impl/annotations';
import {View} from 'angular2/src/core/annotations_impl/view';

@Component({selector: 'gestures-app'})
@View({templateUrl: 'template.html'})
class GesturesCmp {
  swipeDirection: string;
  pinchScale: number;
  rotateAngle: number;

  constructor() {
    this.swipeDirection = '-';
    this.pinchScale = 1;
    this.rotateAngle = 0;
  }

  onSwipe(event) {
    this.swipeDirection = event.deltaX > 0 ? 'right' : 'left';
  }

  onPinch(event) {
    this.pinchScale = event.scale;
  }

  onRotate(event) {
    this.rotateAngle = event.rotation;
  }
}

export function main() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  bootstrap(GesturesCmp);
}
