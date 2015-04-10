import {Decorator} from 'angular2/src/core/annotations/annotations';

/**
 * The `NonBindable` directive tells Angular not to compile or bind the contents of the current
 * DOM element. This is useful if the element contains what appears to be Angular directives and
 * bindings but which should be ignored by Angular. This could be the case if you have a site that
 * displays snippets of code, for instance.
 *
 * Example:
 *
 * ```
 * <div>Normal: {{1 + 2}}</div> // output "Normal: 3"
 * <div non-bindable>Ignored: {{1 + 2}}</div> // output "Ignored: {{1 + 2}}"
 * ```
 *
 * @exportedAs angular2/directives
 */
@Decorator({
  selector: '[non-bindable]',
  compileChildren: false
})
export class NonBindable {
}
