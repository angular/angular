/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Observable } from 'rxjs';
/** replacement for firstValueFrom in rxjs 7. We must support rxjs v6 so we cannot use it */
export declare function firstValueFrom<T>(source: Observable<T>): Promise<T>;
