import {
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  expect,
  iit,
  inject,
  beforeEachProviders,
  it,
  xit,
} from '@angular/core/testing/testing_internal';
import {containsRegexp, fakeAsync, tick, clearPendingTimers} from '@angular/core/testing';
import {TestComponentBuilder, ComponentFixture} from '@angular/compiler/testing';
import {AsyncTestCompleter} from '@angular/core/testing/testing_internal';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {
  Type,
  isPresent,
  assertionsEnabled,
  isJsObject,
  global,
  stringify,
  isBlank,
} from '../../src/facade/lang';
import {BaseException, WrappedException} from '../../src/facade/exceptions';
import {
  PromiseWrapper,
  EventEmitter,
  ObservableWrapper,
  PromiseCompleter,
} from '../../src/facade/async';

import {
  Injector,
  bind,
  provide,
  Injectable,
  Provider,
  forwardRef,
  OpaqueToken,
  Inject,
  Host,
  SkipSelf,
  SkipSelfMetadata,
  OnDestroy,
  ReflectiveInjector
} from '@angular/core';

import {NgIf, NgFor, AsyncPipe} from '@angular/common';

import {
  PipeTransform,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core/src/change_detection/change_detection';

import {CompilerConfig} from '@angular/compiler';

import {
  Directive,
  Component,
  ViewMetadata,
  Attribute,
  Query,
  Pipe,
  Input,
  Output,
  HostBinding,
  HostListener
} from '@angular/core/src/metadata';

import {QueryList} from '@angular/core/src/linker/query_list';

import {ViewContainerRef} from '@angular/core/src/linker/view_container_ref';
import {EmbeddedViewRef} from '@angular/core/src/linker/view_ref';

import {ComponentResolver} from '@angular/core/src/linker/component_resolver';
import {ElementRef} from '@angular/core/src/linker/element_ref';
import {TemplateRef, TemplateRef_} from '@angular/core/src/linker/template_ref';

import {Renderer} from '@angular/core/src/render';
import {IS_DART} from '../../src/facade/lang';
import {el, dispatchEvent} from '@angular/platform-browser/testing';

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

function itAsync(msg: string, f: (tcb: TestComponentBuilder, atc: AsyncTestCompleter) => void) {
  it(msg, inject([TestComponentBuilder, AsyncTestCompleter], f));
}

function declareTests(isJit: boolean) {
  describe('security integration tests', function() {

    beforeEachProviders(() => [provide(ANCHOR_ELEMENT, {useValue: el('<div></div>')})]);

    ddescribe('safe HTML values', function() {
      itAsync('should disallow binding on*', (tcb: TestComponentBuilder, async) => {
        let tpl = `<div [attr.onclick]="ctxProp"></div>`;
        tcb = tcb.overrideView(SecuredComponent, new ViewMetadata({template: tpl}));
        PromiseWrapper.catchError(tcb.createAsync(SecuredComponent), (e) => {
          expect(e.message).toEqual(
              `Template parse errors:\n` + `Binding to event attribute 'onclick' is disallowed, ` +
              `please use (click)=... ` +
              `("<div [ERROR ->][attr.onclick]="ctxProp"></div>"): SecuredComponent@0:5`);
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
              expect(getDOM().getAttribute(e, 'href')).toEqual('hello');

              fixture.debugElement.componentInstance.ctxProp = 'javascript:alert(1)';
              fixture.detectChanges();
              expect(getDOM().getAttribute(e, 'href')).toEqual('unsafe:javascript:alert(1)');

              async.done();
            });
      });

      itAsync('should escape unsafe style values', (tcb: TestComponentBuilder, async) => {
        let tpl = `<div [style.background]="ctxProp">Text</div>`;
        tcb.overrideView(SecuredComponent, new ViewMetadata({template: tpl, directives: []}))
            .createAsync(SecuredComponent)
            .then((fixture) => {
              let e = fixture.debugElement.children[0].nativeElement;
              fixture.debugElement.componentInstance.ctxProp = 'red';
              fixture.detectChanges();
              expect(getDOM().getStyle(e, 'background')).toEqual('red');

              fixture.debugElement.componentInstance.ctxProp = 'url(javascript:evil())';
              fixture.detectChanges();
              // Updated value gets rejected, no value change.
              expect(getDOM().getStyle(e, 'background')).toEqual('red');

              async.done();
            });
      });
    });
  });
}