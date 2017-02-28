/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ComponentRef, RendererFactoryV2, RendererTypeV2, RendererV2, RootRenderer} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {platformBrowserDynamicTesting} from '@angular/platform-browser-dynamic/testing';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {DomRendererFactoryV2} from '@angular/platform-browser/src/dom/dom_renderer';
import {BrowserTestingModule} from '@angular/platform-browser/testing';
import {dispatchEvent} from '@angular/platform-browser/testing/browser_util';
import {expect} from '@angular/platform-browser/testing/matchers';

import {ClientMessageBrokerFactory, ClientMessageBrokerFactory_} from '../../../src/web_workers/shared/client_message_broker';
import {RenderStore} from '../../../src/web_workers/shared/render_store';
import {Serializer} from '../../../src/web_workers/shared/serializer';
import {ServiceMessageBrokerFactory_} from '../../../src/web_workers/shared/service_message_broker';
import {MessageBasedRendererV2} from '../../../src/web_workers/ui/renderer';
import {WebWorkerRendererFactoryV2} from '../../../src/web_workers/worker/renderer';
import {PairedMessageBuses, createPairedMessageBuses} from '../shared/web_worker_test_util';

let lastCreatedRenderer: RendererV2;

export function main() {
  describe('Web Worker Renderer v2', () => {
    // Don't run on server...
    if (!getDOM().supportsDOMEvents()) return;

    let uiRenderStore: RenderStore;
    let wwRenderStore: RenderStore;

    beforeEach(() => {
      // UI side
      uiRenderStore = new RenderStore();
      const uiInjector = new TestBed();
      uiInjector.platform = platformBrowserDynamicTesting();
      uiInjector.ngModule = BrowserTestingModule;
      uiInjector.configureTestingModule({
        providers: [
          Serializer,
          {provide: RenderStore, useValue: uiRenderStore},
          DomRendererFactoryV2,
          {provide: RendererFactoryV2, useExisting: DomRendererFactoryV2},
        ]
      });
      const uiSerializer = uiInjector.get(Serializer);
      const domRendererFactory = uiInjector.get(RendererFactoryV2);

      // Worker side
      lastCreatedRenderer = null;

      wwRenderStore = new RenderStore();

      TestBed.configureTestingModule({
        declarations: [MyComp2],
        providers: [
          Serializer,
          {provide: RenderStore, useValue: wwRenderStore},
          {
            provide: RendererFactoryV2,
            useFactory:
                (wwSerializer: Serializer) => createWebWorkerRendererFactoryV2(
                    wwSerializer, uiSerializer, domRendererFactory, uiRenderStore, wwRenderStore),
            deps: [Serializer],
          },
        ],
      });
    });

    function getRenderElement(workerEl: any): any {
      const id = wwRenderStore.serialize(workerEl);
      return uiRenderStore.deserialize(id);
    }

    it('should update text nodes', () => {
      const fixture =
          TestBed.overrideTemplate(MyComp2, '<div>{{ctxProp}}</div>').createComponent(MyComp2);
      const renderEl = getRenderElement(fixture.nativeElement);
      expect(renderEl).toHaveText('');

      fixture.componentInstance.ctxProp = 'Hello World!';
      fixture.detectChanges();
      expect(renderEl).toHaveText('Hello World!');
    });

    it('should update any element property/attributes/class/style(s) independent of the compilation on the root element and other elements',
       () => {
         const fixture =
             TestBed.overrideTemplate(MyComp2, '<input [title]="y" style="position:absolute">')
                 .createComponent(MyComp2);

         const checkSetters = (componentRef: ComponentRef<any>, workerEl: any) => {
           expect(lastCreatedRenderer).not.toEqual(null);

           const el = getRenderElement(workerEl);
           lastCreatedRenderer.setProperty(workerEl, 'tabIndex', 1);
           expect(el.tabIndex).toEqual(1);

           lastCreatedRenderer.addClass(workerEl, 'a');
           expect(getDOM().hasClass(el, 'a')).toBe(true);

           lastCreatedRenderer.removeClass(workerEl, 'a');
           expect(getDOM().hasClass(el, 'a')).toBe(false);

           lastCreatedRenderer.setStyle(workerEl, 'width', '10px', false, false);
           expect(getDOM().getStyle(el, 'width')).toEqual('10px');

           lastCreatedRenderer.removeStyle(workerEl, 'width', false);
           expect(getDOM().getStyle(el, 'width')).toEqual('');

           lastCreatedRenderer.setAttribute(workerEl, 'someattr', 'someValue');
           expect(getDOM().getAttribute(el, 'someattr')).toEqual('someValue');
         };

         // root element
         checkSetters(fixture.componentRef, fixture.nativeElement);
         // nested elements
         checkSetters(fixture.componentRef, fixture.debugElement.children[0].nativeElement);
       });

    it('should update any template comment property/attributes', () => {
      const fixture =
          TestBed.overrideTemplate(MyComp2, '<ng-container *ngIf="ctxBoolProp"></ng-container>')
              .createComponent(MyComp2);
      fixture.componentInstance.ctxBoolProp = true;
      fixture.detectChanges();
      const el = getRenderElement(fixture.nativeElement);
      expect(getDOM().getInnerHTML(el)).toContain('"ng-reflect-ng-if": "true"');
    });

    it('should add and remove fragments', () => {
      const fixture =
          TestBed
              .overrideTemplate(MyComp2, '<ng-container *ngIf="ctxBoolProp">hello</ng-container>')
              .createComponent(MyComp2);

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
      it('should listen to events', () => {
        const fixture = TestBed.overrideTemplate(MyComp2, '<input (change)="ctxNumProp = 1">')
                            .createComponent(MyComp2);

        const el = fixture.debugElement.children[0];
        dispatchEvent(getRenderElement(el.nativeElement), 'change');
        expect(fixture.componentInstance.ctxNumProp).toBe(1);

        fixture.destroy();
      });
    }
  });
}

@Component({selector: 'my-comp'})
class MyComp2 {
  ctxProp = 'initial value';
  ctxNumProp = 0;
  ctxBoolProp = false;
}

function createWebWorkerBrokerFactory(
    messageBuses: PairedMessageBuses, wwSerializer: Serializer, uiSerializer: Serializer,
    domRendererFactory: DomRendererFactoryV2,
    uiRenderStore: RenderStore): ClientMessageBrokerFactory {
  const uiMessageBus = messageBuses.ui;
  const wwMessageBus = messageBuses.worker;

  // set up the worker side
  const wwBrokerFactory = new ClientMessageBrokerFactory_(wwMessageBus, wwSerializer);

  // set up the ui side
  const uiBrokerFactory = new ServiceMessageBrokerFactory_(uiMessageBus, uiSerializer);
  const renderer = new MessageBasedRendererV2(
      uiBrokerFactory, uiMessageBus, uiSerializer, uiRenderStore, domRendererFactory);
  renderer.start();

  return wwBrokerFactory;
}

function createWebWorkerRendererFactoryV2(
    workerSerializer: Serializer, uiSerializer: Serializer,
    domRendererFactory: DomRendererFactoryV2, uiRenderStore: RenderStore,
    workerRenderStore: RenderStore): RendererFactoryV2 {
  const messageBuses = createPairedMessageBuses();
  const brokerFactory = createWebWorkerBrokerFactory(
      messageBuses, workerSerializer, uiSerializer, domRendererFactory, uiRenderStore);

  const rendererFactory =
      new RenderFactory(brokerFactory, messageBuses.worker, workerSerializer, workerRenderStore);

  return rendererFactory;
}

class RenderFactory extends WebWorkerRendererFactoryV2 {
  createRenderer(element: any, type: RendererTypeV2): RendererV2 {
    lastCreatedRenderer = super.createRenderer(element, type);
    return lastCreatedRenderer;
  }
}
