/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AUTO_STYLE, AnimationTransitionEvent, Component, Injector, ViewChild, animate, state, style, transition, trigger} from '@angular/core';
import {DebugDomRootRenderer} from '@angular/core/src/debug/debug_renderer';
import {ElementRef} from '@angular/core/src/linker/element_ref';
import {RootRenderer} from '@angular/core/src/render/api';
import {TestBed, fakeAsync, flushMicrotasks} from '@angular/core/testing';
import {MockAnimationPlayer} from '@angular/core/testing/testing_internal';
import {AnimationDriver} from '@angular/platform-browser/src/dom/animation_driver';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {DomRootRenderer, DomRootRenderer_} from '@angular/platform-browser/src/dom/dom_renderer';
import {BrowserTestingModule} from '@angular/platform-browser/testing';
import {expect} from '@angular/platform-browser/testing/matchers';
import {MockAnimationDriver} from '@angular/platform-browser/testing/mock_animation_driver';
import {ClientMessageBrokerFactory, ClientMessageBrokerFactory_} from '@angular/platform-webworker/src/web_workers/shared/client_message_broker';
import {RenderStore} from '@angular/platform-webworker/src/web_workers/shared/render_store';
import {Serializer} from '@angular/platform-webworker/src/web_workers/shared/serializer';
import {ServiceMessageBrokerFactory_} from '@angular/platform-webworker/src/web_workers/shared/service_message_broker';
import {MessageBasedRenderer} from '@angular/platform-webworker/src/web_workers/ui/renderer';
import {WebWorkerRootRenderer} from '@angular/platform-webworker/src/web_workers/worker/renderer';

import {platformBrowserDynamicTesting} from '../../../../platform-browser-dynamic/testing';
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

  describe('Web Worker Renderer Animations', () => {
    // Don't run on server...
    if (!getDOM().supportsDOMEvents()) return;

    let uiTestBed: TestBed;
    let uiRenderStore: RenderStore;
    let workerRenderStore: RenderStore;

    beforeEach(() => {
      uiRenderStore = new RenderStore();
      uiTestBed = new TestBed();
      uiTestBed.platform = platformBrowserDynamicTesting();
      uiTestBed.ngModule = BrowserTestingModule;
      uiTestBed.configureTestingModule({
        providers: [
          {provide: AnimationDriver, useClass: MockAnimationDriver}, Serializer,
          {provide: RenderStore, useValue: uiRenderStore},
          {provide: DomRootRenderer, useClass: DomRootRenderer_},
          {provide: RootRenderer, useExisting: DomRootRenderer}
        ]
      });
      const uiSerializer = uiTestBed.get(Serializer);
      const domRootRenderer = uiTestBed.get(DomRootRenderer);
      workerRenderStore = new RenderStore();

      TestBed.configureTestingModule({
        declarations: [AnimationCmp, MultiAnimationCmp, ContainerAnimationCmp],
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

    let uiDriver: MockAnimationDriver;
    beforeEach(() => { uiDriver = uiTestBed.get(AnimationDriver) as MockAnimationDriver; });

    function retrieveFinalAnimationStepStyles(keyframes: any[]) { return keyframes[1][1]; }

    it('should trigger an animation and animate styles', fakeAsync(() => {
         const fixture = TestBed.createComponent(AnimationCmp);
         const cmp = fixture.componentInstance;

         cmp.state = 'on';
         fixture.detectChanges();
         flushMicrotasks();

         const step1 = uiDriver.log.shift();
         const step2 = uiDriver.log.shift();

         const step1Styles = retrieveFinalAnimationStepStyles(step1['keyframeLookup']);
         const step2Styles = retrieveFinalAnimationStepStyles(step2['keyframeLookup']);

         expect(step1Styles).toEqual({fontSize: '20px'});
         expect(step2Styles).toEqual({opacity: '1', fontSize: '50px'});

         cmp.state = 'off';

         fixture.detectChanges();
         flushMicrotasks();

         const step3 = uiDriver.log.shift();
         const step3Styles = retrieveFinalAnimationStepStyles(step3['keyframeLookup']);

         expect(step3Styles).toEqual({opacity: '0', fontSize: AUTO_STYLE});
       }));

    it('should fire the onStart callback when the animation starts', fakeAsync(() => {
         const fixture = TestBed.createComponent(AnimationCmp);
         const cmp = fixture.componentInstance;

         let capturedEvent: AnimationTransitionEvent = null;
         cmp.stateStartFn = event => { capturedEvent = event; };

         cmp.state = 'on';

         expect(capturedEvent).toBe(null);

         fixture.detectChanges();
         flushMicrotasks();

         expect(capturedEvent instanceof AnimationTransitionEvent).toBe(true);

         expect(capturedEvent.toState).toBe('on');
       }));

    it('should fire the onDone callback when the animation ends', fakeAsync(() => {
         const fixture = TestBed.createComponent(AnimationCmp);
         const cmp = fixture.componentInstance;

         let capturedEvent: AnimationTransitionEvent = null;
         cmp.stateDoneFn = event => { capturedEvent = event; };

         cmp.state = 'off';

         expect(capturedEvent).toBe(null);

         fixture.detectChanges();
         flushMicrotasks();

         expect(capturedEvent).toBe(null);

         const step = uiDriver.log.shift();
         step['player'].finish();

         expect(capturedEvent instanceof AnimationTransitionEvent).toBe(true);

         expect(capturedEvent.toState).toBe('off');
       }));

    it('should handle multiple animations on the same element that contain refs to .start and .done callbacks',
       fakeAsync(() => {
         const fixture = TestBed.createComponent(MultiAnimationCmp);
         const cmp = fixture.componentInstance;

         let log: {[triggerName: string]: AnimationTransitionEvent[]} = {};
         cmp.callback = (triggerName: string, event: AnimationTransitionEvent) => {
           log[triggerName] = log[triggerName] || [];
           log[triggerName].push(event);
         };

         cmp.oneTriggerState = 'a';
         cmp.twoTriggerState = 'c';

         fixture.detectChanges();
         flushMicrotasks();

         // clear any animation logs that were collected when
         // the component was rendered (void => *)
         log = {};

         cmp.oneTriggerState = 'b';
         cmp.twoTriggerState = 'd';

         fixture.detectChanges();
         flushMicrotasks();

         uiDriver.log.shift()['player'].finish();

         const [triggerOneStart, triggerOneDone] = log['one'];
         expect(triggerOneStart.triggerName).toEqual('one');
         expect(triggerOneStart.fromState).toEqual('a');
         expect(triggerOneStart.toState).toEqual('b');
         expect(triggerOneStart.totalTime).toEqual(500);
         expect(triggerOneStart.phaseName).toEqual('start');
         expect(triggerOneStart.element instanceof ElementRef).toEqual(true);

         expect(triggerOneDone.triggerName).toEqual('one');
         expect(triggerOneDone.fromState).toEqual('a');
         expect(triggerOneDone.toState).toEqual('b');
         expect(triggerOneDone.totalTime).toEqual(500);
         expect(triggerOneDone.phaseName).toEqual('done');
         expect(triggerOneDone.element instanceof ElementRef).toEqual(true);

         uiDriver.log.shift()['player'].finish();

         const [triggerTwoStart, triggerTwoDone] = log['two'];
         expect(triggerTwoStart.triggerName).toEqual('two');
         expect(triggerTwoStart.fromState).toEqual('c');
         expect(triggerTwoStart.toState).toEqual('d');
         expect(triggerTwoStart.totalTime).toEqual(1000);
         expect(triggerTwoStart.phaseName).toEqual('start');
         expect(triggerTwoStart.element instanceof ElementRef).toEqual(true);

         expect(triggerTwoDone.triggerName).toEqual('two');
         expect(triggerTwoDone.fromState).toEqual('c');
         expect(triggerTwoDone.toState).toEqual('d');
         expect(triggerTwoDone.totalTime).toEqual(1000);
         expect(triggerTwoDone.phaseName).toEqual('done');
         expect(triggerTwoDone.element instanceof ElementRef).toEqual(true);
       }));

    it('should handle .start and .done callbacks for mutliple elements that contain animations that are fired at the same time',
       fakeAsync(() => {
         function logFactory(
             log: {[phaseName: string]: AnimationTransitionEvent},
             phaseName: string): (event: AnimationTransitionEvent) => any {
           return (event: AnimationTransitionEvent) => log[phaseName] = event;
         }

         const fixture = TestBed.createComponent(ContainerAnimationCmp);
         const cmp1 = fixture.componentInstance.compOne;
         const cmp2 = fixture.componentInstance.compTwo;

         const cmp1Log: {[phaseName: string]: AnimationTransitionEvent} = {};
         const cmp2Log: {[phaseName: string]: AnimationTransitionEvent} = {};

         cmp1.stateStartFn = logFactory(cmp1Log, 'start');
         cmp1.stateDoneFn = logFactory(cmp1Log, 'done');
         cmp2.stateStartFn = logFactory(cmp2Log, 'start');
         cmp2.stateDoneFn = logFactory(cmp2Log, 'done');

         cmp1.state = 'off';
         cmp2.state = 'on';
         fixture.detectChanges();
         flushMicrotasks();

         uiDriver.log.shift()['player'].finish();

         const start1 = cmp1Log['start'];
         expect(start1.triggerName).toEqual('myTrigger');
         expect(start1.fromState).toEqual('void');
         expect(start1.toState).toEqual('off');
         expect(start1.totalTime).toEqual(500);
         expect(start1.phaseName).toEqual('start');
         expect(start1.element instanceof ElementRef).toBe(true);

         const done1 = cmp1Log['done'];
         expect(done1.triggerName).toEqual('myTrigger');
         expect(done1.fromState).toEqual('void');
         expect(done1.toState).toEqual('off');
         expect(done1.totalTime).toEqual(500);
         expect(done1.phaseName).toEqual('done');
         expect(done1.element instanceof ElementRef).toBe(true);

         // the * => on transition has two steps
         uiDriver.log.shift()['player'].finish();
         uiDriver.log.shift()['player'].finish();

         const start2 = cmp2Log['start'];
         expect(start2.triggerName).toEqual('myTrigger');
         expect(start2.fromState).toEqual('void');
         expect(start2.toState).toEqual('on');
         expect(start2.totalTime).toEqual(1000);
         expect(start2.phaseName).toEqual('start');
         expect(start2.element instanceof ElementRef).toBe(true);

         const done2 = cmp2Log['done'];
         expect(done2.triggerName).toEqual('myTrigger');
         expect(done2.fromState).toEqual('void');
         expect(done2.toState).toEqual('on');
         expect(done2.totalTime).toEqual(1000);
         expect(done2.phaseName).toEqual('done');
         expect(done2.element instanceof ElementRef).toBe(true);
       }));

    it('should destroy the player when the animation is complete', fakeAsync(() => {
         const fixture = TestBed.createComponent(AnimationCmp);
         const cmp = fixture.componentInstance;

         cmp.state = 'off';
         fixture.detectChanges();

         const player = <MockAnimationPlayer>uiDriver.log.shift()['player'];
         expect(player.log.indexOf('destroy') >= 0).toBe(false);

         cmp.state = 'on';
         fixture.detectChanges();
         flushMicrotasks();

         expect(player.log.indexOf('destroy') >= 0).toBe(true);
       }));

    it('should properly transition to the next animation if the current one is cancelled',
       fakeAsync(() => {
         const fixture = TestBed.createComponent(AnimationCmp);
         const cmp = fixture.componentInstance;

         cmp.state = 'on';
         fixture.detectChanges();
         flushMicrotasks();

         let player = <MockAnimationPlayer>uiDriver.log.shift()['player'];
         player.finish();
         player = <MockAnimationPlayer>uiDriver.log.shift()['player'];
         player.setPosition(0.5);

         uiDriver.log = [];

         cmp.state = 'off';
         fixture.detectChanges();
         flushMicrotasks();

         const step = uiDriver.log.shift();
         expect(step['previousStyles']).toEqual({opacity: AUTO_STYLE, fontSize: AUTO_STYLE});
       }));
  });
}

@Component({
  selector: 'container-comp',
  template: `
    <my-comp #one></my-comp>
    <my-comp #two></my-comp>
  `
})
class ContainerAnimationCmp {
  @ViewChild('one') public compOne: AnimationCmp;

  @ViewChild('two') public compTwo: AnimationCmp;
}

@Component({
  selector: 'my-comp',
  template: `
    <div *ngIf="state"
         #ref
         [@myTrigger]="state"
         (@myTrigger.start)="stateStartFn($event)"
         (@myTrigger.done)="stateDoneFn($event)">...</div>
  `,
  animations: [trigger(
      'myTrigger',
      [
        state('void, off', style({opacity: '0'})),
        state('on', style({opacity: '1', fontSize: '50px'})),
        transition('* => on', [animate(500, style({fontSize: '20px'})), animate(500)]),
        transition('* => off', [animate(500)])
      ])]
})
class AnimationCmp {
  state = 'off';
  stateStartFn = (event: AnimationTransitionEvent): any => {};
  stateDoneFn = (event: AnimationTransitionEvent): any => {};

  @ViewChild('ref') public elmRef: ElementRef;
}

@Component({
  selector: 'my-multi-comp',
  template: `
    <div [@one]="oneTriggerState"
         (@one.start)="callback('one', $event)"
         (@one.done)="callback('one', $event)" #one>...</div>
    <div [@two]="twoTriggerState"
         (@two.start)="callback('two', $event)"
         (@two.done)="callback('two', $event)" #two>...</div>
  `,
  animations: [
    trigger(
        'one',
        [
          state('a', style({width: '0px'})), state('b', style({width: '100px'})),
          transition('a => b', animate(500))
        ]),
    trigger(
        'two',
        [
          state('c', style({height: '0px'})), state('d', style({height: '100px'})),
          transition('c => d', animate(1000))
        ])
  ]
})
class MultiAnimationCmp {
  oneTriggerState: string;
  twoTriggerState: string;

  @ViewChild('one') public elmRef1: ElementRef;

  @ViewChild('two') public elmRef2: ElementRef;

  callback = (triggerName: string, event: AnimationTransitionEvent): any => {};
}
