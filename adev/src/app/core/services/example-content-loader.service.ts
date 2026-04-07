/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, Type, inject} from '@angular/core';
import {PREVIEWS_COMPONENTS} from '@angular/docs';

@Injectable()
export class ExampleContentLoader {
  private readonly previewsComponents = inject(PREVIEWS_COMPONENTS);

  loadPreview(id: string): Promise<Type<unknown>> {
    return this.previewsComponents[id]();
  }
}
