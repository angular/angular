/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NgForOf} from '@angular/common';
import {NgForOf as NgForOfPatched} from '@angular/common/src/directives/ng_for_of_patched';
import {ElementRef, EmbeddedViewRef, Injector, NgModuleRef, TemplateRef, ViewContainerRef, ViewRef} from '@angular/core/src/core';
import {ComponentFactory, ComponentRef} from '@angular/core/src/render3';

import {DefaultIterableDifferFactory, DefaultKeyValueDifferFactory, TrackByFunction} from '../../../../src/change_detection/change_detection';

const KV_DIFFER_FACTORY = new DefaultKeyValueDifferFactory();
const ITERABLE_DIFFER_FACTORY = new DefaultIterableDifferFactory();

export function createFakeNgFor<T>(usePatched: any, trackByFn: TrackByFunction<T>|null) {
  const container = new FakeContainerRef();
  const template = new FakeTemplateRef();
  const differs: any = {
    find: (iterable: any) => {
      return ITERABLE_DIFFER_FACTORY.supports(iterable) ? ITERABLE_DIFFER_FACTORY :
                                                          KV_DIFFER_FACTORY;
    }
  };

  const ngFor = usePatched ? new NgForOfPatched<T>(container, template, differs) :
                             new NgForOf<T>(container, template, differs)
  if (trackByFn !== null) {
    ngFor.ngForTrackBy = trackByFn;
  }
  return ngFor;
}

class FakeContainerRef extends ViewContainerRef {
  get element(): ElementRef<any> {
    throw new Error('Method not implemented.');
  }
  get injector(): Injector {
    return {} as any;
  }
  get parentInjector(): Injector {
    return {} as any;
  }
  clear(): void {}
  get(index: number): ViewRef|null {
    return {context: {}} as any;
  }
  get length(): number {
    return 0;
  }
  createEmbeddedView<C>(
      templateRef: TemplateRef<C>, context?: C|undefined,
      index?: number|undefined): EmbeddedViewRef<C> {
    return {context: {}} as any;
  }
  createComponent<C>(
      componentFactory: ComponentFactory<C>, index?: number|undefined,
      injector?: Injector|undefined, projectableNodes?: any[][]|undefined,
      ngModule?: NgModuleRef<any>|undefined): ComponentRef<C> {
    return {} as any;
  }
  insert(viewRef: ViewRef, index?: number|undefined): ViewRef {
    return {} as any;
  }
  move(viewRef: ViewRef, currentIndex: number): ViewRef {
    return {} as any;
  }
  indexOf(viewRef: ViewRef): number {
    return {} as any;
  }
  remove(index?: number|undefined): void {
    return {} as any;
  }
  detach(index?: number|undefined): ViewRef|null {
    return {} as any;
  }
}

class FakeTemplateRef extends TemplateRef<any> {
  get elementRef(): ElementRef<any> {
    return {} as any;
  }
  createEmbeddedView(context: any): EmbeddedViewRef<any> {
    return {} as any;
  }
}
