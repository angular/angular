/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TemplateRef, ViewContainerRef} from '../../src/core';
import {defineComponent, defineDirective, injectTemplateRef, injectViewContainerRef} from '../../src/render3/index';
import {bind, container, containerRefreshEnd, containerRefreshStart, directiveRefresh, load, text, textBinding} from '../../src/render3/instructions';

import {renderComponent, toHtml} from './render_util';

describe('ViewContainerRef', () => {
  class TestDirective {
    constructor(public viewContainer: ViewContainerRef, public template: TemplateRef<any>, ) {}

    static ngDirectiveDef = defineDirective({
      type: TestDirective,
      factory: () => new TestDirective(injectViewContainerRef(), injectTemplateRef(), ),
    });
  }

  class TestComponent {
    testDir: TestDirective;

    static ngComponentDef = defineComponent({
      type: TestComponent,
      tag: 'test-cmp',
      factory: () => new TestComponent(),
      template: (cmp: TestComponent, cm: boolean) => {
        if (cm) {
          const subTemplate = (ctx: any, cm: boolean) => {
            if (cm) {
              text(0);
            }
            textBinding(0, bind(ctx.$implicit));
          };
          container(0, [TestDirective], subTemplate);
        }
        containerRefreshStart(0);
        cmp.testDir = load<TestDirective>(1);
        TestDirective.ngDirectiveDef.h(1, 0);
        directiveRefresh(1, 0);
        containerRefreshEnd();
      },
    });
  }


  it('should add embedded view into container', () => {
    const testCmp = renderComponent(TestComponent);
    expect(toHtml(testCmp)).toEqual('');
    const dir = testCmp.testDir;
    const childCtx = {$implicit: 'works'};
    const viewRef = dir.viewContainer.createEmbeddedView(dir.template, childCtx);
    expect(toHtml(testCmp)).toEqual('works');
  });
});
