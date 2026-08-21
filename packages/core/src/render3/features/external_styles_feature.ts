/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DirectiveDef, DirectiveDefFeature} from '../interfaces/definition';

/**
 * A feature that adds support for external runtime styles for a directive or component.
 * An external runtime style is a URL to a CSS stylesheet that contains the styles
 * for a given directive or component. For browsers, this URL will be used in an appended `link` element
 * when the component or directive is rendered. This feature is typically used for Hot Module Replacement
 * (HMR) of stylesheets by leveraging preexisting global stylesheet HMR available
 * in most development servers.
 *
 * @codeGenApi
 */
export function ɵɵExternalStylesFeature(styleUrls: string[]): DirectiveDefFeature {
  return (definition: DirectiveDef<unknown>) => {
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
