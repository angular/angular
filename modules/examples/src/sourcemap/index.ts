import {BaseException} from 'angular2/src/facade/lang';
import {bootstrap, Component, View} from 'angular2/angular2';
import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';

@Component({
  selector: 'error-app',
})
@View({
  template: `
           <button class="errorButton" (click)="createError()">create error</button>`
})
export class ErrorComponent {
  createError(): void { throw new BaseException('Sourcemap test'); }
}

export function main() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();  // for the Dart version
  bootstrap(ErrorComponent);
}
