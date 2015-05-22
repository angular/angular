import {bootstrap, Component, View} from 'angular2/angular2';
import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';

@Component({selector: 'gestures-app'})
@View({templateUrl: 'template.html'})
class GesturesCmp {
  swipeDirection: string = '-';
  pinchScale: number = 1;
  rotateAngle: number = 0;

  onSwipe(event): void { this.swipeDirection = event.deltaX > 0 ? 'right' : 'left'; }

  onPinch(event): void { this.pinchScale = event.scale; }

  onRotate(event): void { this.rotateAngle = event.rotation; }
}

export function main() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  bootstrap(GesturesCmp);
}
