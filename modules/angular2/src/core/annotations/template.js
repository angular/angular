import {ABSTRACT, CONST, Type} from 'angular2/src/facade/lang';

/**
 * Declare the available HTML templates for an application.
 *
 * Each angular component requires a single `@Component` and at least one `@Template` annotation. The @Template
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
 * @Template({
 *   inline: 'Hello {{name}}!'
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
export class Template {
  url:any; //string;
  inline:any; //string;
  directives:any; //List<Type>;
  formatters:any; //List<Type>;
  source:any;//List<Template>;
  locale:any; //string
  device:any; //string
  @CONST()
  constructor({
      url,
      inline,
      directives,
      formatters,
      source,
      locale,
      device
    }: {
      url: string,
      inline: string,
      directives: List<Type>,
      formatters: List<Type>,
      source: List<Template>,
      locale: string,
      device: string
    })
  {
    this.url = url;
    this.inline = inline;
    this.directives = directives;
    this.formatters = formatters;
    this.source = source;
    this.locale = locale;
    this.device = device;
  }
}
