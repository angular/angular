/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Subject } from 'rxjs';
export declare class FileApiService {
    uploadedData: Subject<any>;
    publishFileUpload(parentEvent: Event): void;
    saveObjectAsJSON(object: object): void;
}
