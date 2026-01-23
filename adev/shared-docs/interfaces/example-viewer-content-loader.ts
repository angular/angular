/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Type} from '@angular/core';

/** The service responsible for fetching the type of Component to display in the preview */
export interface ExampleViewerContentLoader {
  /** Returns type of Component to display in the preview */
  loadPreview(id: string): Promise<Type<unknown>>;
}
