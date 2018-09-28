/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ivyOn from './ivy_switch_on';

function noopFactory(...tokens: any[]): any {}

type FactoryFunction<T = any> = (...tokens: any[]) => T;

export const R3_ELEMENT_REF_FACTORY__POST_NGCC__: FactoryFunction = ivyOn.R3_ELEMENT_REF_FACTORY;
export const R3_TEMPLATE_REF_FACTORY__POST_NGCC__: FactoryFunction = ivyOn.R3_TEMPLATE_REF_FACTORY;
export const R3_CHANGE_DETECTOR_REF_FACTORY__POST_NGCC__: FactoryFunction =
    ivyOn.R3_CHANGE_DETECTOR_REF_FACTORY;
export const R3_VIEW_CONTAINER_REF_FACTORY__POST_NGCC__: FactoryFunction =
    ivyOn.R3_VIEW_CONTAINER_REF_FACTORY;


export const R3_ELEMENT_REF_FACTORY__PRE_NGCC__ = noopFactory;
export const R3_TEMPLATE_REF_FACTORY__PRE_NGCC__ = noopFactory;
export const R3_CHANGE_DETECTOR_REF_FACTORY__PRE_NGCC__ = noopFactory;
export const R3_VIEW_CONTAINER_REF_FACTORY__PRE_NGCC__ = noopFactory;

export let R3_ELEMENT_REF_FACTORY = R3_ELEMENT_REF_FACTORY__PRE_NGCC__;
export let R3_TEMPLATE_REF_FACTORY = R3_TEMPLATE_REF_FACTORY__PRE_NGCC__;
export let R3_CHANGE_DETECTOR_REF_FACTORY = R3_CHANGE_DETECTOR_REF_FACTORY__PRE_NGCC__;
export let R3_VIEW_CONTAINER_REF_FACTORY = R3_VIEW_CONTAINER_REF_FACTORY__PRE_NGCC__;
