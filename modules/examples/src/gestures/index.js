import {bootstrap, Component, TemplateConfig} from 'angular2/core';
import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';

@Component({
  selector: 'gestures-app',
  template: new TemplateConfig({
    url: 'template.html'
  })
})
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
