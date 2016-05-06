import {
  ddescribe,
  describe,
  expect,
  inject,
  beforeEachProviders,
  it,
} from '@angular/core/testing/testing_internal';
import {TestComponentBuilder} from '@angular/compiler/testing';
import {AsyncTestCompleter} from '@angular/core/testing/testing_internal';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {PromiseWrapper} from '../../src/facade/async';
import {provide, Injectable, OpaqueToken} from '@angular/core';
import {CompilerConfig} from '@angular/compiler';
import {Component, ViewMetadata} from '@angular/core/src/metadata';
import {IS_DART} from '../../src/facade/lang';
import {el} from '@angular/platform-browser/testing';

import {DomSanitizationService} from '@angular/platform-browser';

const ANCHOR_ELEMENT = /*@ts2dart_const*/ new OpaqueToken('AnchorElement');

export function main() {
  if (IS_DART) {
    declareTests(false);
  } else {
    describe('jit', () => {
      beforeEachProviders(
          () => [provide(CompilerConfig, {useValue: new CompilerConfig(true, false, true)})]);
      declareTests(true);
    });

    describe('no jit', () => {
      beforeEachProviders(
          () => [provide(CompilerConfig, {useValue: new CompilerConfig(true, false, false)})]);
      declareTests(false);
    });
  }
}

@Component({selector: 'my-comp', directives: []})
@Injectable()
class SecuredComponent {
  ctxProp: string;
  constructor() { this.ctxProp = 'some value'; }
}

function itAsync(msg: string, injections: Function[], f: Function);
function itAsync(msg: string, f: (tcb: TestComponentBuilder, atc: AsyncTestCompleter) => void);
function itAsync(msg: string,
                 f: Function[] | ((tcb: TestComponentBuilder, atc: AsyncTestCompleter) => void),
                 fn?: Function) {
  if (f instanceof Function) {
    it(msg, inject([TestComponentBuilder, AsyncTestCompleter], <Function>f));
  } else {
    let injections = f;
    it(msg, inject(injections, fn));
  }
}

function declareTests(isJit: boolean) {
  describe('security integration tests', function() {

    beforeEachProviders(() => [provide(ANCHOR_ELEMENT, {useValue: el('<div></div>')})]);

    describe('safe HTML values', function() {
      itAsync('should disallow binding on*', (tcb: TestComponentBuilder, async) => {
        let tpl = `<div [attr.onclick]="ctxProp"></div>`;
        tcb = tcb.overrideView(SecuredComponent, new ViewMetadata({template: tpl}));
        PromiseWrapper.catchError(tcb.createAsync(SecuredComponent), (e) => {
          expect(e.message).toContain(`Template parse errors:\n` +
                                      `Binding to event attribute 'onclick' is disallowed ` +
                                      `for security reasons, please use (click)=... `);
          async.done();
          return null;
        });
      });

      itAsync('should escape unsafe attributes', (tcb: TestComponentBuilder, async) => {
        let tpl = `<a [href]="ctxProp">Link Title</a>`;
        tcb.overrideView(SecuredComponent, new ViewMetadata({template: tpl, directives: []}))
            .createAsync(SecuredComponent)
            .then((fixture) => {
              let e = fixture.debugElement.children[0].nativeElement;
              fixture.debugElement.componentInstance.ctxProp = 'hello';
              fixture.detectChanges();
              // In the browser, reading href returns an absolute URL. On the server side,
              // it just echoes back the property.
              expect(getDOM().getProperty(e, 'href')).toMatch(/.*\/?hello$/);

              fixture.debugElement.componentInstance.ctxProp = 'javascript:alert(1)';
              fixture.detectChanges();
              expect(getDOM().getProperty(e, 'href')).toEqual('unsafe:javascript:alert(1)');

              async.done();
            });
      });

      itAsync('should not escape values marked as trusted',
              [TestComponentBuilder, AsyncTestCompleter, DomSanitizationService],
              (tcb: TestComponentBuilder, async, sanitizer: DomSanitizationService) => {
                let tpl = `<a [href]="ctxProp">Link Title</a>`;
                tcb.overrideView(SecuredComponent,
                                 new ViewMetadata({template: tpl, directives: []}))
                    .createAsync(SecuredComponent)
                    .then((fixture) => {
                      let e = fixture.debugElement.children[0].nativeElement;
                      let trusted = sanitizer.bypassSecurityTrustUrl('javascript:alert(1)');
                      fixture.debugElement.componentInstance.ctxProp = trusted;
                      fixture.detectChanges();
                      expect(getDOM().getProperty(e, 'href')).toEqual('javascript:alert(1)');

                      async.done();
                    });
              });

      itAsync('should error when using the wrong trusted value',
              [TestComponentBuilder, AsyncTestCompleter, DomSanitizationService],
              (tcb: TestComponentBuilder, async, sanitizer: DomSanitizationService) => {
                let tpl = `<a [href]="ctxProp">Link Title</a>`;
                tcb.overrideView(SecuredComponent,
                                 new ViewMetadata({template: tpl, directives: []}))
                    .createAsync(SecuredComponent)
                    .then((fixture) => {
                      let trusted = sanitizer.bypassSecurityTrustScript('javascript:alert(1)');
                      fixture.debugElement.componentInstance.ctxProp = trusted;
                      expect(() => fixture.detectChanges())
                          .toThrowErrorWith('Required a safe URL, got a Script');

                      async.done();
                    });
              });

      itAsync('should escape unsafe style values', (tcb: TestComponentBuilder, async) => {
        let tpl = `<div [style.background]="ctxProp">Text</div>`;
        tcb.overrideView(SecuredComponent, new ViewMetadata({template: tpl, directives: []}))
            .createAsync(SecuredComponent)
            .then((fixture) => {
              let e = fixture.debugElement.children[0].nativeElement;
              // Make sure binding harmless values works.
              fixture.debugElement.componentInstance.ctxProp = 'red';
              fixture.detectChanges();
              // In some browsers, this will contain the full background specification, not just
              // the color.
              expect(getDOM().getStyle(e, 'background')).toMatch(/red.*/);

              fixture.debugElement.componentInstance.ctxProp = 'url(javascript:evil())';
              fixture.detectChanges();
              // Updated value gets rejected, no value change.
              expect(getDOM().getStyle(e, 'background')).not.toContain('javascript');

              async.done();
            });
      });
    });
  });
}