library angular2.src.core.metadata.view;

import "package:angular2/src/facade/lang.dart" show Type;

/**
 * Defines template and style encapsulation options available for Component's [View].
 *
 * See [ViewMetadata#encapsulation].
 */
enum ViewEncapsulation {
  /**
   * Emulate `Native` scoping of styles by adding an attribute containing surrogate id to the Host
   * Element and pre-processing the style rules provided via
   * [ViewMetadata#styles] or [ViewMetadata#stylesUrls], and adding the new Host Element
   * attribute to all selectors.
   *
   * This is the default option.
   */
  Emulated,
  /**
   * Use the native encapsulation mechanism of the renderer.
   *
   * For the DOM this means using [Shadow DOM](https://w3c.github.io/webcomponents/spec/shadow/) and
   * creating a ShadowRoot for Component's Host Element.
   */
  Native,
  /**
   * Don't provide any template or style encapsulation.
   */
  None
}
var VIEW_ENCAPSULATION_VALUES = [
  ViewEncapsulation.Emulated,
  ViewEncapsulation.Native,
  ViewEncapsulation.None
];

/**
 * Metadata properties available for configuring Views.
 *
 * Each Angular component requires a single `@Component` and at least one `@View` annotation. The
 * `@View` annotation specifies the HTML template to use, and lists the directives that are active
 * within the template.
 *
 * When a component is instantiated, the template is loaded into the component's shadow root, and
 * the expressions and statements in the template are evaluated against the component.
 *
 * For details on the `@Component` annotation, see [ComponentMetadata].
 *
 * ### Example
 *
 * ```
 * @Component({
 *   selector: 'greet',
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
class ViewMetadata {
  /**
   * Specifies a template URL for an Angular component.
   *
   * NOTE: Only one of `templateUrl` or `template` can be defined per View.
   *
   * <!-- TODO: what's the url relative to? -->
   */
  final String templateUrl;
  /**
   * Specifies an inline template for an Angular component.
   *
   * NOTE: Only one of `templateUrl` or `template` can be defined per View.
   */
  final String template;
  /**
   * Specifies stylesheet URLs for an Angular component.
   *
   * <!-- TODO: what's the url relative to? -->
   */
  final List<String> styleUrls;
  /**
   * Specifies an inline stylesheet for an Angular component.
   */
  final List<String> styles;
  /**
   * Specifies a list of directives that can be used within a template.
   *
   * Directives must be listed explicitly to provide proper component encapsulation.
   *
   * ### Example
   *
   * ```javascript
   * @Component({
   *   selector: 'my-component',
   *   directives: [NgFor]
   *   template: '
   *   <ul>
   *     <li *ngFor="#item of items">{{item}}</li>
   *   </ul>'
   * })
   * class MyComponent {
   * }
   * ```
   */
  final List<dynamic /* Type | List < dynamic > */ > directives;
  final List<dynamic /* Type | List < dynamic > */ > pipes;
  /**
   * Specify how the template and the styles should be encapsulated.
   * The default is [ViewEncapsulation#Emulated `ViewEncapsulation.Emulated`] if the view
   * has styles,
   * otherwise [ViewEncapsulation#None `ViewEncapsulation.None`].
   */
  final ViewEncapsulation encapsulation;
  const ViewMetadata(
      {templateUrl,
      template,
      directives,
      pipes,
      encapsulation,
      styles,
      styleUrls})
      : templateUrl = templateUrl,
        template = template,
        styleUrls = styleUrls,
        styles = styles,
        directives = directives,
        pipes = pipes,
        encapsulation = encapsulation;
}
