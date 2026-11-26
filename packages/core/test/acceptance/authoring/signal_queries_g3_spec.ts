/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  contentChild,
  contentChildren,
  Directive,
  ElementRef,
  TemplateRef,
  viewChild,
  viewChildren,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('queries as signals (g3-only generic token inference)', () => {
  it('should infer generic type parameter when querying with a generic token', async () => {
    type IsAny<T> = 0 extends 1 & T ? true : false;

    @Directive({
      selector: '[dir]',
    })
    class MyDir<T> {
      value!: T;
      constructor(public el: ElementRef) {}
    }

    @Component({
      selector: 'child-cmp',
      template: '',
    })
    class ChildCmp {
      contentDefaultEl = contentChild(MyDir, {read: ElementRef});
      contentBtnEl = contentChild(MyDir, {read: ElementRef<HTMLButtonElement>});
      contentBtnElReq = contentChild.required(MyDir, {read: ElementRef<HTMLButtonElement>});
      contentDir = contentChild(MyDir<string>);
      contentDirReq = contentChild.required(MyDir<string>);
      contentDirs = contentChildren(MyDir<string>);
      contentBtnEls = contentChildren(MyDir, {read: ElementRef<HTMLButtonElement>});
      contentTpl = contentChild('tpl', {read: TemplateRef<{foo: number}>});
    }

    @Component({
      imports: [MyDir, ChildCmp],
      template: `
        <button dir>Click</button>
        <ng-template #tpl></ng-template>
        <child-cmp>
          <button dir>Projected</button>
          <ng-template #tpl></ng-template>
        </child-cmp>
      `,
    })
    class App {
      child = viewChild.required(ChildCmp);
      defaultEl = viewChild.required(MyDir, {read: ElementRef});
      btnElOpt = viewChild(MyDir, {read: ElementRef<HTMLButtonElement>});
      btnEl = viewChild.required(MyDir, {read: ElementRef<HTMLButtonElement>});
      btnEls = viewChildren(MyDir, {read: ElementRef<HTMLButtonElement>});
      dir = viewChild(MyDir<string>);
      dirReq = viewChild.required(MyDir<string>);
      dirs = viewChildren(MyDir<string>);
      tpl = viewChild('tpl', {read: TemplateRef<{foo: number}>});
    }

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const cmp = fixture.componentInstance;
    const child = cmp.child();

    const defaultNativeEl = cmp.defaultEl().nativeElement;
    const _defaultIsAny: IsAny<typeof defaultNativeEl> = true;
    const nativeEl = cmp.btnEl().nativeElement;
    const _btnType: HTMLButtonElement = nativeEl;
    const _notAny: IsAny<typeof nativeEl> = false;
    const _btnElOptNotAny: IsAny<NonNullable<ReturnType<typeof cmp.btnElOpt>>['nativeElement']> =
      false;
    const _btnElsNotAny: IsAny<ReturnType<typeof cmp.btnEls>[number]['nativeElement']> = false;
    const _dirNotAny: IsAny<NonNullable<ReturnType<typeof cmp.dir>>['value']> = false;
    const _dirReqNotAny: IsAny<ReturnType<typeof cmp.dirReq>['value']> = false;
    const _dirsNotAny: IsAny<ReturnType<typeof cmp.dirs>[number]['value']> = false;
    const _tplNotAny: IsAny<
      Parameters<NonNullable<ReturnType<typeof cmp.tpl>>['createEmbeddedView']>[0]
    > = false;

    const _contentDefaultIsAny: IsAny<
      NonNullable<ReturnType<typeof child.contentDefaultEl>>['nativeElement']
    > = true;
    const _contentBtnElNotAny: IsAny<
      NonNullable<ReturnType<typeof child.contentBtnEl>>['nativeElement']
    > = false;
    const _contentBtnElReqNotAny: IsAny<ReturnType<typeof child.contentBtnElReq>['nativeElement']> =
      false;
    const _contentDirNotAny: IsAny<NonNullable<ReturnType<typeof child.contentDir>>['value']> =
      false;
    const _contentDirReqNotAny: IsAny<ReturnType<typeof child.contentDirReq>['value']> = false;
    const _contentDirsNotAny: IsAny<ReturnType<typeof child.contentDirs>[number]['value']> = false;
    const _contentBtnElsNotAny: IsAny<
      ReturnType<typeof child.contentBtnEls>[number]['nativeElement']
    > = false;
    const _contentTplNotAny: IsAny<
      Parameters<NonNullable<ReturnType<typeof child.contentTpl>>['createEmbeddedView']>[0]
    > = false;

    expect(_defaultIsAny).toBe(true);
    expect(_btnType.tagName).toBe('BUTTON');
    expect(_notAny).toBe(false);
    expect(_btnElOptNotAny).toBe(false);
    expect(_btnElsNotAny).toBe(false);
    expect(_dirNotAny).toBe(false);
    expect(_dirReqNotAny).toBe(false);
    expect(_dirsNotAny).toBe(false);
    expect(_tplNotAny).toBe(false);
    expect(_contentDefaultIsAny).toBe(true);
    expect(_contentBtnElNotAny).toBe(false);
    expect(_contentBtnElReqNotAny).toBe(false);
    expect(_contentDirNotAny).toBe(false);
    expect(_contentDirReqNotAny).toBe(false);
    expect(_contentDirsNotAny).toBe(false);
    expect(_contentBtnElsNotAny).toBe(false);
    expect(_contentTplNotAny).toBe(false);
  });

  it('should reject a single explicit type argument when using the read option', () => {
    @Component({
      template: `<div #el></div>`,
    })
    class App {
      // @ts-expect-error Passing only 1 type argument with `read` must not silently infer Signal<any>
      vc = viewChild<ElementRef>('el', {read: ElementRef});
      // @ts-expect-error Passing only 1 type argument with `read` must not silently infer Signal<any>
      vcReq = viewChild.required<ElementRef>('el', {read: ElementRef});
      // @ts-expect-error Passing only 1 type argument with `read` must not silently infer Signal<any>
      vcs = viewChildren<ElementRef>('el', {read: ElementRef});
      // @ts-expect-error Passing only 1 type argument with `read` must not silently infer Signal<any>
      cc = contentChild<ElementRef>('el', {read: ElementRef});
      // @ts-expect-error Passing only 1 type argument with `read` must not silently infer Signal<any>
      ccReq = contentChild.required<ElementRef>('el', {read: ElementRef});
      // @ts-expect-error Passing only 1 type argument with `read` must not silently infer Signal<any>
      ccs = contentChildren<ElementRef>('el', {read: ElementRef});
    }

    expect(App).toBeDefined();
  });
});
