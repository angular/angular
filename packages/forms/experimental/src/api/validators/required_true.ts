/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FieldPath, metadata, REQUIRED, validate} from '@angular/forms/experimental';
import {BaseValidatorConfig} from '@angular/forms/experimental/src/api/validators/types';

/**
 * Validator requiring a field value to be true, generally is used for checkboxes that must be checked.
 * @param path Path to the target field
 * @param config Optional, currently allows providing custom errors function.
 */
export function requiredTrue(path: FieldPath<boolean>, config?: BaseValidatorConfig<boolean>) {
  metadata(path, REQUIRED, () => true);

  validate(path, ctx => {
    if (!ctx.value()) {
      if (config?.errors) {
        return config.errors(ctx);
      } else {
        return {kind: 'requiredTrue'};
      }
    }

    return undefined;
  });
}
