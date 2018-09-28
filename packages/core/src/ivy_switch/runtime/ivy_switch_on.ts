/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {injectChangeDetectorRef, injectElementRef, injectTemplateRef, injectViewContainerRef} from '../../render3/view_engine_compatibility';

export const R3_ELEMENT_REF_FACTORY = injectElementRef;
export const R3_TEMPLATE_REF_FACTORY = injectTemplateRef;
export const R3_CHANGE_DETECTOR_REF_FACTORY = injectChangeDetectorRef;
export const R3_VIEW_CONTAINER_REF_FACTORY = injectViewContainerRef;
