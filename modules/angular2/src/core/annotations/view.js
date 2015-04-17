import {ABSTRACT, CONST, Type} from 'angular2/src/facade/lang';

/**
 * Declares the available HTML templates for an application.
 *
 * Each angular component requires a single `@Component` and at least one `@View` annotation. The @View
 * annotation specifies the HTML template to use, and lists the directives that are active within the template.
 *
 * When a component is instantiated, the template is loaded into the component's shadow root, and the
 * expressions and statements in the template are evaluated against the component.
 *
 * For details on the `@Component` annotation, see {@link Component}.
 *
 * ## Example
 *
 * ```
 * @Component({
 *   selector: 'greet'
 * })
 * @View({
 *   template: 'Hello {{name}}!',
 *   directives: [GreetUser, Bold]
 * })
 * class Greet {
 *   name: string;
 *
 *   constructor() {
 *     this.name = 'World';
 *   }
 * }
 * ```
 *
 * @exportedAs angular2/annotations
 */
export class View {
  /**
   * Specifies a template URL for an angular component.
   *
   * NOTE: either `templateURL` or `template` should be used, but not both.
   */
  templateUrl:any; //string;

  /**
   * Specifies an inline template for an angular component.
   *
   * NOTE: either `templateURL` or `template` should be used, but not both.
   */
  template:any; //string;

  /**
   * Specifies a list of directives that can be used within a template.
   *
   * Directives must be listed explicitly to provide proper component encapsulation.
   *
   * ## Example
   *
   * ```javascript
   * @Component({
   *     selector: 'my-component'
   *   })
   * @View({
   *   directives: [For]
   *   template: '
   *   <ul>
   *     <li *for="item in items">{{item}}</li>
   *   </ul>'
   * })
   * class MyComponent {
   * }
   * ```
   */
  directives:any; //List<Type>;

  @CONST()
  constructor({
      templateUrl,
      template,
      directives
    }: {
      templateUrl: string,
      template: string,
      directives: List<Type>
    })
  {
    this.templateUrl = templateUrl;
    this.template = template;
    this.directives = directives;
  }
}
