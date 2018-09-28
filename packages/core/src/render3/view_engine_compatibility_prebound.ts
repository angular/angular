/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {ElementRef as ViewEngine_ElementRef} from '../linker/element_ref';
import {TemplateRef as ViewEngine_TemplateRef} from '../linker/template_ref';
import {ViewContainerRef as ViewEngine_ViewContainerRef} from '../linker/view_container_ref';

import {TContainerNode, TElementContainerNode, TElementNode, TNode, TNodeType} from './interfaces/node';
import {QueryReadType} from './interfaces/query';
import {DIRECTIVES, LViewData} from './interfaces/view';
import {assertNodeOfPossibleTypes} from './node_assert';
import {ReadFromInjectorFn} from './query';
import {createContainerRef, createElementRef, createTemplateRef} from './view_engine_compatibility';



/**
 * Retrieves `TemplateRef` instance from `Injector` when a local reference is placed on the
 * `<ng-template>` element.
 */
export function templateRefExtractor(tNode: TNode, currentView: LViewData) {
  return createTemplateRef(ViewEngine_TemplateRef, ViewEngine_ElementRef, tNode, currentView);
}

export const QUERY_READ_ELEMENT_REF = <QueryReadType<ViewEngine_ElementRef>>(
    new ReadFromInjectorFn<ViewEngine_ElementRef>((tNode: TNode, view: LViewData) => {
      return createElementRef(ViewEngine_ElementRef, tNode, view);
    }) as any);

export const QUERY_READ_TEMPLATE_REF =
    new ReadFromInjectorFn<ViewEngine_TemplateRef<any>>((tNode: TNode, view: LViewData) => {
      return createTemplateRef(ViewEngine_TemplateRef, ViewEngine_ElementRef, tNode, view);
    }) as any;

export const QUERY_READ_CONTAINER_REF = <QueryReadType<ViewEngine_ViewContainerRef>>(
    new ReadFromInjectorFn<ViewEngine_ViewContainerRef>(
        (tNode: TNode, view: LViewData) => createContainerRef(
            ViewEngine_ViewContainerRef, ViewEngine_ElementRef,
            tNode as TElementNode | TContainerNode | TElementContainerNode, view)) as any);

export const QUERY_READ_FROM_NODE =
    new ReadFromInjectorFn<any>((tNode: TNode, view: LViewData, directiveIdx: number) => {
      ngDevMode && assertNodeOfPossibleTypes(
                       tNode, TNodeType.Container, TNodeType.Element, TNodeType.ElementContainer);
      if (directiveIdx > -1) {
        return view[DIRECTIVES] ![directiveIdx];
      }
      if (tNode.type === TNodeType.Element || tNode.type === TNodeType.ElementContainer) {
        return createElementRef(ViewEngine_ElementRef, tNode, view);
      }
      if (tNode.type === TNodeType.Container) {
        return createTemplateRef(ViewEngine_TemplateRef, ViewEngine_ElementRef, tNode, view);
      }
      if (ngDevMode) {
        // should never happen
        throw new Error(`Unexpected node type: ${tNode.type}`);
      }
    }) as any as QueryReadType<any>;
