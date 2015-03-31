import {Decorator} from 'angular2/src/core/annotations/annotations';

/**
 * @publicModule angular2/directives
 */
@Decorator({
  selector: '[non-bindable]',
  compileChildren: false
})
export class NonBindable {
}
