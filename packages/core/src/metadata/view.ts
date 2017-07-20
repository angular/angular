/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Defines template and style encapsulation options available for Component's {@link Component}.
 *
 * See {@link Component#encapsulation}.
 * @stable
 */
export enum ViewEncapsulation {
  /**
   * Emulate `Native` scoping of styles by adding an attribute containing surrogate id to the Host
   * Element and pre-processing the style rules provided via
   * {@link Component#styles} or {@link Component#styleUrls}, and adding the new Host Element
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

/**
 * Metadata properties available for configuring Views.
 *
 * For details on the `@Component` annotation, see {@link Component}.
 *
 * ### Example
 *
 * ```
 * @Component({
 *   selector: 'greet',
 *   template: 'Hello {{name}}!',
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
 * @deprecated Use Component instead.
 *
 * {@link Component}
 */
export class ViewMetadata {
  /** {@link Component#templateUrl} */
  templateUrl: string|undefined;
  /** {@link Component#template} */
  template: string|undefined;
  /** {@link Component#stylesUrl} */
  styleUrls: string[]|undefined;
  /** {@link Component#styles} */
  styles: string[]|undefined;
  /** {@link Component#encapsulation} */
  encapsulation: ViewEncapsulation|undefined;
  /** {@link Component#animation} */
  animations: any[]|undefined;
  /** {@link Component#interpolation} */
  interpolation: [string, string]|undefined;

  constructor(
      {templateUrl, template, encapsulation, styles, styleUrls, animations, interpolation}: {
        templateUrl?: string,
        template?: string,
        encapsulation?: ViewEncapsulation,
        styles?: string[],
        styleUrls?: string[],
        animations?: any[],
        interpolation?: [string, string]
      } = {}) {
    this.templateUrl = templateUrl;
    this.template = template;
    this.styleUrls = styleUrls;
    this.styles = styles;
    this.encapsulation = encapsulation;
    this.animations = animations;
    this.interpolation = interpolation;
  }
}
