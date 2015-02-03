import {Decorator} from 'core/src/annotations/annotations';

@Decorator({
  selector: '[ng-non-bindable]',
  compileChildren: false
})
export class NgNonBindable {
}
