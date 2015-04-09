import {ABSTRACT, CONST, Type} from 'angular2/src/facade/lang';

/**
 * Declare the available HTML templates for an application.
 *
 * Each angular component requires a single `@Component` and at least one `@View` annotation. The @View
 * annotation specifies the HTML template to use, and lists the directives that are active within the template.
 *
 * When a component is instantiated, the template is loaded into the component's shadow root, and the
 * expressions and statements in the template are evaluated against the component.
 *
 * For details on the `@Component` annotation, see [Component].
 *
 * ## Example
 *
 * ```
 * @Component({
 *   selector: 'greet'
 * })
 * @View({
 *   template: 'Hello {{name}}!'
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
 * @publicModule angular2/annotations
 */
export class View {
  templateUrl:any; //string;
  template:any; //string;
  directives:any; //List<Type>;
  formatters:any; //List<Type>;
  source:any;//List<View>;
  locale:any; //string
  device:any; //string
  @CONST()
  constructor({
      templateUrl,
      template,
      directives,
      formatters,
      source,
      locale,
      device
    }: {
      templateUrl: string,
      template: string,
      directives: List<Type>,
      formatters: List<Type>,
      source: List<View>,
      locale: string,
      device: string
    })
  {
    this.templateUrl = templateUrl;
    this.template = template;
    this.directives = directives;
    this.formatters = formatters;
    this.source = source;
    this.locale = locale;
    this.device = device;
  }
}
