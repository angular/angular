/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AUTO_STYLE, AnimationTransitionEvent, Component, Injector, animate, state, style, transition, trigger} from '@angular/core';
import {DebugDomRootRenderer} from '@angular/core/src/debug/debug_renderer';
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
    var uiMessageBus = messageBuses.ui;
    var workerMessageBus = messageBuses.worker;

    // set up the worker side
    var webWorkerBrokerFactory =
        new ClientMessageBrokerFactory_(workerMessageBus, workerSerializer);

    // set up the ui side
    var uiMessageBrokerFactory = new ServiceMessageBrokerFactory_(uiMessageBus, uiSerializer);
    var renderer = new MessageBasedRenderer(
        uiMessageBrokerFactory, uiMessageBus, uiSerializer, uiRenderStore, domRootRenderer);
    renderer.start();

    return webWorkerBrokerFactory;
  }

  function createWorkerRenderer(
      workerSerializer: Serializer, uiSerializer: Serializer, domRootRenderer: DomRootRenderer,
      uiRenderStore: RenderStore, workerRenderStore: RenderStore): RootRenderer {
    var messageBuses = createPairedMessageBuses();
    var brokerFactory = createWebWorkerBrokerFactory(
        messageBuses, workerSerializer, uiSerializer, domRootRenderer, uiRenderStore);
    var workerRootRenderer = new WebWorkerRootRenderer(
        brokerFactory, messageBuses.worker, workerSerializer, workerRenderStore);
    return new DebugDomRootRenderer(workerRootRenderer);
  }

  describe('Web Worker Renderer Animations', () => {
    // Don't run on server...
    if (!getDOM().supportsDOMEvents()) return;

    var uiTestBed: TestBed;
    var uiRenderStore: RenderStore;
    var workerRenderStore: RenderStore;

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
      var uiSerializer = uiTestBed.get(Serializer);
      var domRootRenderer = uiTestBed.get(DomRootRenderer);
      workerRenderStore = new RenderStore();

      TestBed.configureTestingModule({
        declarations: [AnimationCmp, MultiAnimationCmp],
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

    var uiDriver: MockAnimationDriver;
    beforeEach(() => { uiDriver = uiTestBed.get(AnimationDriver) as MockAnimationDriver; });

    function retrieveFinalAnimationStepStyles(keyframes: any[]) { return keyframes[1][1]; }

    it('should trigger an animation and animate styles', fakeAsync(() => {
         const fixture = TestBed.createComponent(AnimationCmp);
         const cmp = fixture.componentInstance;

         cmp.state = 'on';
         fixture.detectChanges();
         flushMicrotasks();

         var step1 = uiDriver.log.shift();
         var step2 = uiDriver.log.shift();

         var step1Styles = retrieveFinalAnimationStepStyles(step1['keyframeLookup']);
         var step2Styles = retrieveFinalAnimationStepStyles(step2['keyframeLookup']);

         expect(step1Styles).toEqual({fontSize: '20px'});
         expect(step2Styles).toEqual({opacity: '1', fontSize: '50px'});

         cmp.state = 'off';

         fixture.detectChanges();
         flushMicrotasks();

         var step3 = uiDriver.log.shift();
         var step3Styles = retrieveFinalAnimationStepStyles(step3['keyframeLookup']);

         expect(step3Styles).toEqual({opacity: '0', fontSize: AUTO_STYLE});
       }));

    it('should fire the onStart callback when the animation starts', fakeAsync(() => {
         const fixture = TestBed.createComponent(AnimationCmp);
         const cmp = fixture.componentInstance;

         var capturedEvent: AnimationTransitionEvent = null;
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

         var capturedEvent: AnimationTransitionEvent = null;
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
         expect(triggerOneStart)
             .toEqual(new AnimationTransitionEvent(
                 {fromState: 'a', toState: 'b', totalTime: 500, phaseName: 'start'}));

         expect(triggerOneDone)
             .toEqual(new AnimationTransitionEvent(
                 {fromState: 'a', toState: 'b', totalTime: 500, phaseName: 'done'}));

         uiDriver.log.shift()['player'].finish();
         const [triggerTwoStart, triggerTwoDone] = log['two'];
         expect(triggerTwoStart)
             .toEqual(new AnimationTransitionEvent(
                 {fromState: 'c', toState: 'd', totalTime: 1000, phaseName: 'start'}));

         expect(triggerTwoDone)
             .toEqual(new AnimationTransitionEvent(
                 {fromState: 'c', toState: 'd', totalTime: 1000, phaseName: 'done'}));
       }));

    it('should handle .start and .done callbacks for mutliple elements that contain animations that are fired at the same time',
       fakeAsync(() => {
         function logFactory(
             log: {[phaseName: string]: AnimationTransitionEvent},
             phaseName: string): (event: AnimationTransitionEvent) => any {
           return (event: AnimationTransitionEvent) => { log[phaseName] = event; };
         }

         const f1 = TestBed.createComponent(AnimationCmp);
         const f2 = TestBed.createComponent(AnimationCmp);
         const cmp1 = f1.componentInstance;
         const cmp2 = f2.componentInstance;

         var cmp1Log: {[phaseName: string]: AnimationTransitionEvent} = {};
         var cmp2Log: {[phaseName: string]: AnimationTransitionEvent} = {};

         cmp1.stateStartFn = logFactory(cmp1Log, 'start');
         cmp1.stateDoneFn = logFactory(cmp1Log, 'done');
         cmp2.stateStartFn = logFactory(cmp2Log, 'start');
         cmp2.stateDoneFn = logFactory(cmp2Log, 'done');

         cmp1.state = 'off';
         cmp2.state = 'on';
         f1.detectChanges();
         f2.detectChanges();
         flushMicrotasks();

         uiDriver.log.shift()['player'].finish();

         expect(cmp1Log['start'])
             .toEqual(new AnimationTransitionEvent(
                 {fromState: 'void', toState: 'off', totalTime: 500, phaseName: 'start'}));

         expect(cmp1Log['done'])
             .toEqual(new AnimationTransitionEvent(
                 {fromState: 'void', toState: 'off', totalTime: 500, phaseName: 'done'}));

         // the * => on transition has two steps
         uiDriver.log.shift()['player'].finish();
         uiDriver.log.shift()['player'].finish();

         expect(cmp2Log['start'])
             .toEqual(new AnimationTransitionEvent(
                 {fromState: 'void', toState: 'on', totalTime: 1000, phaseName: 'start'}));

         expect(cmp2Log['done'])
             .toEqual(new AnimationTransitionEvent(
                 {fromState: 'void', toState: 'on', totalTime: 1000, phaseName: 'done'}));
       }));

    it('should destroy the player when the animation is complete', fakeAsync(() => {
         const fixture = TestBed.createComponent(AnimationCmp);
         const cmp = fixture.componentInstance;

         cmp.state = 'off';
         fixture.detectChanges();

         var player = <MockAnimationPlayer>uiDriver.log.shift()['player'];
         expect(player.log.indexOf('destroy') >= 0).toBe(false);

         cmp.state = 'on';
         fixture.detectChanges();
         flushMicrotasks();

         expect(player.log.indexOf('destroy') >= 0).toBe(true);
       }));
  });
}


@Component({
  selector: 'my-comp',
  template: `
    <div *ngIf="state"
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
}

@Component({
  selector: 'my-multi-comp',
  template: `
    <div [@one]="oneTriggerState"
         (@one.start)="callback('one', $event)"
         (@one.done)="callback('one', $event)">...</div>
    <div [@two]="twoTriggerState"
         (@two.start)="callback('two', $event)"
         (@two.done)="callback('two', $event)">...</div>
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
  callback = (triggerName: string, event: AnimationTransitionEvent): any => {};
}
