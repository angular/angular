import {CONST, Type} from 'angular2/src/core/facade/lang';
import {ViewEncapsulation} from 'angular2/src/core/render/api';

export {ViewEncapsulation} from 'angular2/src/core/render/api';

/**
 * Metadata properties available for configuring Views.
 *
 * Each Angular component requires a single `@Component` and at least one `@View` annotation. The
 * `@View` annotation specifies the HTML template to use, and lists the directives, pipes and styles that are active
 * within the template.
 *
 * When a component is instantiated, the template is loaded, and the expressions and statements 
 * in the template are evaluated against the component.
 *
 * For details on the `@Component` annotation, see {@link ComponentMetadata}.
 *
 * ## Example
 *
 * ```typescript
 * import {Bold, Component, GreetUser, View} from 'angular2/angular2'
 * 
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
export class ViewMetadata {
  /**
   * Specifies a template URL for an Angular component.
   *
   * NOTE: Only one of `templateUrl` or `template` can be defined per View.
   *
   * ## Example
   *
   * ```typescript
   * import {Component, NgFor, View} from 'angular2/angular2'
   * 
   * @Component({
   *     selector: 'my-component'
   *   })
   * @View({
   *   styleUrls: ['my-component.css'],
   *   templateUrl: 'my-component.html'
   * })
   * class MyComponent {
   * }
   * ```
   * 
   * <!-- TODO: what's the url relative to? -->
   */
  templateUrl: string;

  /**
   * Specifies an inline template for an Angular component.
   *
   * NOTE: Only one of `templateUrl` or `template` can be defined per View.
   * 
   * ## Example
   *
   * ```typescript
   * import {Component, NgFor, View} from 'angular2/angular2'
   * 
   * @Component({
   *     selector: 'my-component'
   *   })
   * @View({
   *   template: `<p>
   *                  {{title}}
   *              </p>`
   * })
   * class MyComponent {
   * }
   * ```
   */
  template: string;

  /**
   * Specifies stylesheet URLs for an Angular component.
   * 
   * ## Example
   *
   * ```typescript
   * import {Component, NgFor, View} from 'angular2/angular2'
   * 
   * @Component({
   *     selector: 'my-component'
   *   })
   * @View({
   *   styleUrls: ['my-component.css'],
   *   template: '<p>{{title}}</p>'
   * })
   * class MyComponent {
   * }
   * ```
   *
   * <!-- TODO: what's the url relative to? -->
   */
  styleUrls: string[];

  /**
   * Specifies an inline stylesheet for an Angular component.
   *
   * ## Example
   *
   * ```typescript
   * import {Component, NgFor, View} from 'angular2/angular2'
   * 
   * @Component({
   *     selector: 'my-component'
   *   })
   * @View({
   *   styles: [`
   *    p {
   *      background: green;
   *    }
  `*   ],
   *   template: '<p>{{title}}</p>'
   * })
   * class MyComponent {
   * }
   * ```
   */
  styles: string[];

  /**
   * Specifies a list of directives that can be used within a template.
   *
   * Directives must be listed explicitly to provide proper component encapsulation.
   *
   * ## Example
   *
   * ```typescript
   * import {Component, NgFor, View} from 'angular2/angular2'
   * 
   * @Component({
   *     selector: 'my-component'
   *   })
   * @View({
   *   directives: [NgFor]
   *   template: '
   *   <ul>
   *     <li *ng-for="#item of items">{{item}}</li>
   *   </ul>'
   * })
   * class MyComponent {
   * }
   * ```
   */
  directives: Array<Type | any[]>;
  
  /**
   * Specifies a list of pipes that can be used within a template.
   *
   * ## Example
   *
   * ```typescript
   * import {Component, View, UpperCasePipe} from 'angular2/angular2'
   * 
   * @Component({
   *     selector: 'my-component'
   *   })
   * @View({
   *   pipes: [UpperCasePipe],
   *   template: '{{title | uppercase}}'
   * })
   * class MyComponent {
   * }
   * ```
   */  
  pipes: Array<Type | any[]>;

  /**
   * Specify how the template and the styles should be encapsulated.
   * The default is {@link ViewEncapsulation#Emulated `ViewEncapsulation.Emulated`} if the view
   * has styles,
   * otherwise {@link ViewEncapsulation#None `ViewEncapsulation.None`}.
   * 
   * ## Example
   *
   * ```typescript
   * import {Component, View, ViewEncapsulation} from 'angular2/angular2'
   * 
   * @Component({
   *     selector: 'my-component'
   *   })
   * @View({
   *   template: '{{title}}',
   *   encapsulation: ViewEncapsulation.None
   * })
   * class MyComponent {
   * }
   * ```
   */
  encapsulation: ViewEncapsulation;

  constructor({templateUrl, template, directives, pipes, encapsulation, styles, styleUrls}: {
    templateUrl?: string,
    template?: string,
    directives?: Array<Type | any[]>,
    pipes?: Array<Type | any[]>,
    encapsulation?: ViewEncapsulation,
    styles?: string[],
    styleUrls?: string[],
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
