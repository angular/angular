/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentFactory, ComponentRef, Injector, NgModuleRef, Type} from '@angular/core';
import {Subject} from 'rxjs/Subject';

import {ComponentFactoryNgElementStrategy} from '../src/component-factory-strategy';

describe('ComponentFactoryNgElementStrategy', () => {
  let factory: FakeComponentFactory;
  let component: FakeComponent;
  let strategy: ComponentFactoryNgElementStrategy;
  let injector;

  beforeEach(() => {
    factory = new FakeComponentFactory();
    component = factory.componentRef;

    injector = jasmine.createSpyObj('injector', ['get']);
    const applicationRef = jasmine.createSpyObj('applicationRef', ['attachView']);
    injector.get.and.returnValue(applicationRef);

    strategy = new ComponentFactoryNgElementStrategy(factory, injector);
  });

  describe('connect', () => {
    beforeEach(() => {
      const element = document.createElement('div');
      strategy.connect(element);
    });

    // TODO(andrewseguin): Test everything
  });
});

export class FakeComponent {
  output1 = new Subject();
  output2 = new Subject();
}

export class FakeComponentFactory extends ComponentFactory<any> {
  componentRef = jasmine.createSpyObj('componentRef', ['instance', 'changeDetectorRef']);

  constructor() {
    super();
    this.componentRef.instance = new FakeComponent();
    this.componentRef.changeDetectorRef =
        jasmine.createSpyObj('changeDetectorRef', ['detectChanges']);
  }

  get selector(): string { return 'fake-component'; }
  get componentType(): Type<any> { return FakeComponent; }
  get ngContentSelectors(): string[] { return ['content-1', 'content-2']; }
  get inputs(): {propName: string; templateName: string}[] {
    return [
      {propName: 'input1', templateName: 'templateInput1'},
      {propName: 'input1', templateName: 'templateInput2'},
    ];
  }

  get outputs(): {propName: string; templateName: string}[] {
    return [
      {propName: 'output1', templateName: 'templateOutput1'},
      {propName: 'output2', templateName: 'templateOutput2'},
    ];
  }

  create(
      injector: Injector, projectableNodes?: any[][], rootSelectorOrNode?: string|any,
      ngModule?: NgModuleRef<any>): ComponentRef<any> {
    return this.componentRef;
  }
}
