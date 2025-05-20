/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentDef, ComponentDefFeature} from '../interfaces/definition';

/**
 * A feature that adds support for external runtime styles for a component.
 * An external runtime style is a URL to a CSS stylesheet that contains the styles
 * for a given component. For browsers, this URL will be used in an appended `link` element
 * when the component is rendered. This feature is typically used for Hot Module Replacement
 * (HMR) of component stylesheets by leveraging preexisting global stylesheet HMR available
 * in most development servers.
 *
 * @codeGenApi
 */
export function ɵɵExternalStylesFeature(styleUrls: string[]): ComponentDefFeature {
  return (definition: ComponentDef<unknown>) => {
    if (styleUrls.length < 1) {
      return;
    }

    definition.getExternalStyles = (encapsulationId) => {
      // Add encapsulation ID search parameter `ngcomp` to support external style encapsulation as well as the encapsulation mode
      // for usage tracking.
      const urls = styleUrls.map(
        (value) =>
          value +
          '?ngcomp' +
          (encapsulationId ? '=' + encodeURIComponent(encapsulationId) : '') +
          '&e=' +
          definition.encapsulation,
      );

      return urls;
    };
  };
}
