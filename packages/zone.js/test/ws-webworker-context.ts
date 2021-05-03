/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

declare function importScripts(path: string): void;

importScripts('/base/build/lib/zone.js');
importScripts('/base/node_modules/systemjs/dist/system.src.js');
importScripts('/base/build/test/zone_worker_entry_point.js');
