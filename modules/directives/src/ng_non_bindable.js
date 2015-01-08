import {Decorator} from 'core/annotations/annotations';

@Decorator({
  selector: '[ng-non-bindable]',
  compileChildren: false
})
export class NgNonBindable {
}
