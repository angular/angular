/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ComponentRef, Injectable} from '@angular/core';
import {DebugDomRootRenderer} from '@angular/core/src/debug/debug_renderer';
import {RootRenderer} from '@angular/core/src/render/api';
import {TestBed} from '@angular/core/testing';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {DomRootRenderer, DomRootRenderer_} from '@angular/platform-browser/src/dom/dom_renderer';
import {BrowserTestingModule} from '@angular/platform-browser/testing';
import {expect} from '@angular/platform-browser/testing/matchers';
import {ClientMessageBrokerFactory, ClientMessageBrokerFactory_} from '@angular/platform-webworker/src/web_workers/shared/client_message_broker';
import {RenderStore} from '@angular/platform-webworker/src/web_workers/shared/render_store';
import {Serializer} from '@angular/platform-webworker/src/web_workers/shared/serializer';
import {ServiceMessageBrokerFactory_} from '@angular/platform-webworker/src/web_workers/shared/service_message_broker';
import {MessageBasedRenderer} from '@angular/platform-webworker/src/web_workers/ui/renderer';
import {WebWorkerRootRenderer} from '@angular/platform-webworker/src/web_workers/worker/renderer';

import {platformBrowserDynamicTesting} from '../../../../platform-browser-dynamic/testing';
import {dispatchEvent} from '../../../../platform-browser/testing/browser_util';
import {PairedMessageBuses, createPairedMessageBuses} from '../shared/web_worker_test_util';

export function main() {
  function createWebWorkerBrokerFactory(
      messageBuses: PairedMessageBuses, workerSerializer: Serializer, uiSerializer: Serializer,
      domRootRenderer: DomRootRenderer, uiRenderStore: RenderStore): ClientMessageBrokerFactory {
    const uiMessageBus = messageBuses.ui;
    const workerMessageBus = messageBuses.worker;

    // set up the worker side
    const webWorkerBrokerFactory =
        new ClientMessageBrokerFactory_(workerMessageBus, workerSerializer);

    // set up the ui side
    const uiMessageBrokerFactory = new ServiceMessageBrokerFactory_(uiMessageBus, uiSerializer);
    const renderer = new MessageBasedRenderer(
        uiMessageBrokerFactory, uiMessageBus, uiSerializer, uiRenderStore, domRootRenderer);
    renderer.start();

    return webWorkerBrokerFactory;
  }

  function createWorkerRenderer(
      workerSerializer: Serializer, uiSerializer: Serializer, domRootRenderer: DomRootRenderer,
      uiRenderStore: RenderStore, workerRenderStore: RenderStore): RootRenderer {
    const messageBuses = createPairedMessageBuses();
    const brokerFactory = createWebWorkerBrokerFactory(
        messageBuses, workerSerializer, uiSerializer, domRootRenderer, uiRenderStore);
    const workerRootRenderer = new WebWorkerRootRenderer(
        brokerFactory, messageBuses.worker, workerSerializer, workerRenderStore);
    return new DebugDomRootRenderer(workerRootRenderer);
  }

  describe('Web Worker Renderer', () => {
    // Don't run on server...
    if (!getDOM().supportsDOMEvents()) return;

    let uiRenderStore: RenderStore;
    let workerRenderStore: RenderStore;

    beforeEach(() => {
      uiRenderStore = new RenderStore();
      const testUiInjector = new TestBed();
      testUiInjector.platform = platformBrowserDynamicTesting();
      testUiInjector.ngModule = BrowserTestingModule;
      testUiInjector.configureTestingModule({
        providers: [
          Serializer, {provide: RenderStore, useValue: uiRenderStore},
          {provide: DomRootRenderer, useClass: DomRootRenderer_},
          {provide: RootRenderer, useExisting: DomRootRenderer}
        ]
      });
      const uiSerializer = testUiInjector.get(Serializer);
      const domRootRenderer = testUiInjector.get(DomRootRenderer);
      workerRenderStore = new RenderStore();

      TestBed.configureTestingModule({
        declarations: [MyComp2],
        providers: [
          Serializer, {provide: RenderStore, useValue: workerRenderStore}, {
            provide: RootRenderer,
            useFactory: (workerSerializer: Serializer) => {
              return createWorkerRenderer(
                  workerSerializer, uiSerializer, domRootRenderer, uiRenderStore,
                  workerRenderStore);
            },
            deps: [Serializer]
          }
        ]
      });
    });

    function getRenderElement(workerEl: any) {
      const id = workerRenderStore.serialize(workerEl);
      return uiRenderStore.deserialize(id);
    }

    function getRenderer(componentRef: ComponentRef<any>) {
      return (<any>componentRef.hostView).internalView.renderer;
    }

    it('should update text nodes', () => {
      TestBed.overrideComponent(MyComp2, {set: {template: '<div>{{ctxProp}}</div>'}});
      const fixture = TestBed.createComponent(MyComp2);

      const renderEl = getRenderElement(fixture.nativeElement);
      expect(renderEl).toHaveText('');

      fixture.componentInstance.ctxProp = 'Hello World!';
      fixture.detectChanges();
      expect(renderEl).toHaveText('Hello World!');
    });

    it('should update any element property/attributes/class/style(s) independent of the compilation on the root element and other elements',
       () => {
         TestBed.overrideComponent(
             MyComp2, {set: {template: '<input [title]="y" style="position:absolute">'}});
         const fixture = TestBed.createComponent(MyComp2);

         const checkSetters =
             (componentRef: any /** TODO #9100 */, workerEl: any /** TODO #9100 */) => {
               const renderer = getRenderer(componentRef);
               const el = getRenderElement(workerEl);
               renderer.setElementProperty(workerEl, 'tabIndex', 1);
               expect((<HTMLInputElement>el).tabIndex).toEqual(1);

               renderer.setElementClass(workerEl, 'a', true);
               expect(getDOM().hasClass(el, 'a')).toBe(true);
               renderer.setElementClass(workerEl, 'a', false);
               expect(getDOM().hasClass(el, 'a')).toBe(false);

               renderer.setElementStyle(workerEl, 'width', '10px');
               expect(getDOM().getStyle(el, 'width')).toEqual('10px');
               renderer.setElementStyle(workerEl, 'width', null);
               expect(getDOM().getStyle(el, 'width')).toEqual('');

               renderer.setElementAttribute(workerEl, 'someattr', 'someValue');
               expect(getDOM().getAttribute(el, 'someattr')).toEqual('someValue');
             };

         // root element
         checkSetters(fixture.componentRef, fixture.nativeElement);
         // nested elements
         checkSetters(fixture.componentRef, fixture.debugElement.children[0].nativeElement);
       });

    it('should update any template comment property/attributes', () => {

      TestBed.overrideComponent(
          MyComp2, {set: {template: '<ng-container *ngIf="ctxBoolProp"></ng-container>'}});
      const fixture = TestBed.createComponent(MyComp2);

      (<MyComp2>fixture.componentInstance).ctxBoolProp = true;
      fixture.detectChanges();
      const el = getRenderElement(fixture.nativeElement);
      expect(getDOM().getInnerHTML(el)).toContain('"ng-reflect-ng-if": "true"');
    });

    it('should add and remove fragments', () => {
      TestBed.overrideComponent(
          MyComp2, {set: {template: '<ng-container *ngIf="ctxBoolProp">hello</ng-container>'}});
      const fixture = TestBed.createComponent(MyComp2);

      const rootEl = getRenderElement(fixture.nativeElement);
      expect(rootEl).toHaveText('');

      fixture.componentInstance.ctxBoolProp = true;
      fixture.detectChanges();
      expect(rootEl).toHaveText('hello');

      fixture.componentInstance.ctxBoolProp = false;
      fixture.detectChanges();
      expect(rootEl).toHaveText('');
    });

    if (getDOM().supportsDOMEvents()) {
      it('should call actions on the element', () => {
        TestBed.overrideComponent(MyComp2, {set: {template: '<input [title]="y">'}});
        const fixture = TestBed.createComponent(MyComp2);
        const el = fixture.debugElement.children[0];
        getRenderer(fixture.componentRef).invokeElementMethod(el.nativeElement, 'setAttribute', [
          'a', 'b'
        ]);

        expect(getDOM().getAttribute(getRenderElement(el.nativeElement), 'a')).toEqual('b');

      });

      it('should listen to events', () => {
        TestBed.overrideComponent(MyComp2, {set: {template: '<input (change)="ctxNumProp = 1">'}});
        const fixture = TestBed.createComponent(MyComp2);

        const el = fixture.debugElement.children[0];
        dispatchEvent(getRenderElement(el.nativeElement), 'change');
        expect(fixture.componentInstance.ctxNumProp).toBe(1);

        fixture.destroy();
      });
    }
  });
}


@Component({selector: 'my-comp'})
@Injectable()
class MyComp2 {
  ctxProp: string;
  ctxNumProp: any /** TODO #9100 */;
  ctxBoolProp: boolean;
  constructor() {
    this.ctxProp = 'initial value';
    this.ctxNumProp = 0;
    this.ctxBoolProp = false;
  }

  throwError() { throw 'boom'; }
}
