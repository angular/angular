/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../src/output/output_ast';
import {I18nContext} from '../../../src/render3/view/i18n';

describe('I18nContext', () => {
  it('should support i18n content collection', () => {
    const ctx = new I18nContext(5, null, 'myRef');

    // basic checks
    expect(ctx.isRoot()).toBe(true);
    expect(ctx.isResolved()).toBe(true);
    expect(ctx.getId()).toBe(0);
    expect(ctx.getIndex()).toBe(5);
    expect(ctx.getTemplateIndex()).toBeNull();
    expect(ctx.getRef()).toBe('myRef');

    // data collection checks
    expect(ctx.getContent()).toBe('');
    ctx.appendText('Foo');
    ctx.appendElement(1);
    ctx.appendText('Bar');
    ctx.appendElement(1, true);
    expect(ctx.getContent()).toBe('Foo�#1�Bar�/#1�');

    // binding collection checks
    expect(ctx.getBindings().size).toBe(0);
    ctx.appendBinding(o.literal(1));
    ctx.appendBinding(o.literal(2));
    expect(ctx.getBindings().size).toBe(2);
  });

  it('should support nested contexts', () => {
    const ctx = new I18nContext(5, null, 'myRef');
    const templateIndex = 1;

    // set some data for root ctx
    ctx.appendText('Foo');
    ctx.appendBinding(o.literal(1));
    ctx.appendTemplate(templateIndex);
    expect(ctx.isResolved()).toBe(false);

    // create child context
    const childCtx = ctx.forkChildContext(6, templateIndex);
    expect(childCtx.getContent()).toBe('');
    expect(childCtx.getBindings().size).toBe(0);
    expect(childCtx.getRef()).toBe(ctx.getRef());  // ref should be passed into child ctx
    expect(childCtx.isRoot()).toBe(false);

    childCtx.appendText('Bar');
    childCtx.appendElement(2);
    childCtx.appendText('Baz');
    childCtx.appendElement(2, true);
    childCtx.appendBinding(o.literal(2));
    childCtx.appendBinding(o.literal(3));

    expect(childCtx.getContent()).toBe('Bar�#2:1�Baz�/#2:1�');
    expect(childCtx.getBindings().size).toBe(2);

    // reconcile
    ctx.reconcileChildContext(childCtx);
    expect(ctx.getContent()).toBe('Foo�*1:1�Bar�#2:1�Baz�/#2:1��/*1:1�');
  });
});