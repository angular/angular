import {ABSTRACT, CONST, Type} from 'angular2/src/facade/lang';
import {ViewEncapsulation} from 'angular2/src/render/api';

export {ViewEncapsulation} from 'angular2/src/render/api';

/**
 * Declares the available HTML templates for an application.
 *
 * Each angular component requires a single `@Component` and at least one `@View` annotation. The
 * `@View` annotation specifies the HTML template to use, and lists the directives that are active
 * within the template.
 *
 * When a component is instantiated, the template is loaded into the component's shadow root, and
 * the expressions and statements in the template are evaluated against the component.
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
 */
@CONST()
export class View {
  /**
   * Specifies a template URL for an angular component.
   *
   * NOTE: either `templateUrl` or `template` should be used, but not both.
   */
  templateUrl: string;

  /**
   * Specifies an inline template for an angular component.
   *
   * NOTE: either `templateUrl` or `template` should be used, but not both.
   */
  template: string;

  /**
   * Specifies stylesheet URLs for an angular component.
   */
  styleUrls: List<string>;

  /**
   * Specifies an inline stylesheet for an angular component.
   */
  styles: List<string>;

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
   *     <li *ng-for="#item of items">{{item}}</li>
   *   </ul>'
   * })
   * class MyComponent {
   * }
   * ```
   */
  // TODO(tbosch): use Type | Binding | List<any> when Dart supports union types,
  // as otherwise we would need to import Binding type and Dart would warn
  // for an unused import.
  directives: List<Type | any | List<any>>;

  pipes: List<Type | any | List<any>>;

  /**
   * Specify how the template and the styles should be encapsulated.
   * The default is {@link ViewEncapsulation#EMULATED `ViewEncapsulation.EMULATED`} if the view
   * has styles,
   * otherwise {@link ViewEncapsulation#NONE `ViewEncapsulation.NONE`}.
   */
  encapsulation: ViewEncapsulation;

  constructor({templateUrl, template, directives, pipes, encapsulation, styles, styleUrls}: {
    templateUrl?: string,
    template?: string,
    directives?: List<Type | any | List<any>>,
    pipes?: List<Type | any | List<any>>,
    encapsulation?: ViewEncapsulation,
    styles?: List<string>,
    styleUrls?: List<string>,
  } = {}) {
    this.templateUrl = templateUrl;
    this.template = template;
    this.styleUrls = styleUrls;
    this.styles = styles;
    this.directives = directives;
    this.pipes = pipes;
    this.encapsulation = encapsulation;
  }
}
