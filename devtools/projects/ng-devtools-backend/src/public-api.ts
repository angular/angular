/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/*
 * Public API Surface of ng-devtools-backend
 */

export * from './lib';
export {findNodeFromSerializedPosition} from './lib/component-tree/component-tree';
export {viewSourceFromRouter} from './lib/client-event-subscribers';
export {RoutePropertyType} from './lib/router-tree';
