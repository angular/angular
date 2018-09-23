/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef} from './change_detection/change_detector_ref';
import {ElementRef} from './linker/element_ref';
import {TemplateRef} from './linker/template_ref';
import {ViewContainerRef} from './linker/view_container_ref';
import {injectChangeDetectorRef, injectElementRef, injectTemplateRef, injectViewContainerRef} from './render3/di';
import {NG_ELEMENT_ID} from './render3/fields';
import {compileComponent, compileDirective} from './render3/jit/directive';
import {compileInjectable} from './render3/jit/injectable';
import {compileNgModule} from './render3/jit/module';
import {compilePipe} from './render3/jit/pipe';

export const ivyEnabled = true;
export const R3_COMPILE_COMPONENT = compileComponent;
export const R3_COMPILE_DIRECTIVE = compileDirective;
export const R3_COMPILE_INJECTABLE = compileInjectable;
export const R3_COMPILE_NGMODULE = compileNgModule;
export const R3_COMPILE_PIPE = compilePipe;

export const R3_ELEMENT_REF_FACTORY = injectElementRef;
export const R3_TEMPLATE_REF_FACTORY = injectTemplateRef;
export const R3_CHANGE_DETECTOR_REF_FACTORY = injectChangeDetectorRef;
export const R3_VIEW_CONTAINER_REF_FACTORY = injectViewContainerRef;

/**
 *  Switches between Render2 version of special objects like ElementRef and the Ivy version
 *  of these objects. It's necessary to keep them separate so that we don't pull in fns
 *  like injectElementRef() prematurely.
 */
export function enableIvyInjectableFactories() {
  (ElementRef as any)[NG_ELEMENT_ID] = R3_ELEMENT_REF_FACTORY;
  (TemplateRef as any)[NG_ELEMENT_ID] = R3_TEMPLATE_REF_FACTORY;
  (ViewContainerRef as any)[NG_ELEMENT_ID] = R3_VIEW_CONTAINER_REF_FACTORY;
  (ChangeDetectorRef as any)[NG_ELEMENT_ID] = R3_CHANGE_DETECTOR_REF_FACTORY;
}
