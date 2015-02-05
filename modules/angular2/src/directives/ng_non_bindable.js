import {Decorator} from 'angular2/src/core/annotations/annotations';

@Decorator({
  selector: '[ng-non-bindable]',
  compileChildren: false
})
export class NgNonBindable {
}
