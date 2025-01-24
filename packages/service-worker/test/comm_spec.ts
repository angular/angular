/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, PLATFORM_ID} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  NgswCommChannel,
  NoNewVersionDetectedEvent,
  VersionDetectedEvent,
  VersionEvent,
  VersionReadyEvent,
} from '../src/low_level';
import {ngswCommChannelFactory, SwRegistrationOptions} from '../src/provider';
import {SwPush} from '../src/push';
import {SwUpdate} from '../src/update';
import {
  MockPushManager,
  MockPushSubscription,
  MockServiceWorkerContainer,
  MockServiceWorkerRegistration,
  patchDecodeBase64,
} from '../testing/mock';
import {filter} from 'rxjs/operators';

describe('ServiceWorker library', () => {
  let mock: MockServiceWorkerContainer;
  let comm: NgswCommChannel;

  beforeEach(() => {
    mock = new MockServiceWorkerContainer();
    comm = new NgswCommChannel(mock as any);
  });

  describe('NgswCommsChannel', () => {
    it('can access the registration when it comes before subscription', (done) => {
      const mock = new MockServiceWorkerContainer();
      const comm = new NgswCommChannel(mock as any);
      const regPromise = mock.getRegistration() as any as MockServiceWorkerRegistration;

      mock.setupSw();

      (comm as any).registration.subscribe((reg: any) => {
        done();
      });
    });
    it('can access the registration when it comes after subscription', (done) => {
      const mock = new MockServiceWorkerContainer();
      const comm = new NgswCommChannel(mock as any);
      const regPromise = mock.getRegistration() as any as MockServiceWorkerRegistration;

      (comm as any).registration.subscribe((reg: any) => {
        done();
      });

      mock.setupSw();
    });
  });

  describe('ngswCommChannelFactory', () => {
    describe('server', () => {
      beforeEach(() => {
        globalThis['ngServerMode'] = true;
      });

      afterEach(() => {
        globalThis['ngServerMode'] = undefined;
      });

      it('gives disabled NgswCommChannel for platform-server', () => {
        TestBed.configureTestingModule({
          providers: [
            {provide: PLATFORM_ID, useValue: 'server'},
            {provide: SwRegistrationOptions, useValue: {enabled: true}},
            {
              provide: NgswCommChannel,
              useFactory: ngswCommChannelFactory,
              deps: [SwRegistrationOptions, Injector],
            },
          ],
        });

        expect(TestBed.inject(NgswCommChannel).isEnabled).toEqual(false);
      });
    });

    it("gives disabled NgswCommChannel when 'enabled' option is false", () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: PLATFORM_ID, useValue: 'browser'},
          {provide: SwRegistrationOptions, useValue: {enabled: false}},
          {
            provide: NgswCommChannel,
            useFactory: ngswCommChannelFactory,
            deps: [SwRegistrationOptions, Injector],
          },
        ],
      });

      expect(TestBed.inject(NgswCommChannel).isEnabled).toEqual(false);
    });
    it('gives disabled NgswCommChannel when navigator.serviceWorker is undefined', () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: PLATFORM_ID, useValue: 'browser'},
          {provide: SwRegistrationOptions, useValue: {enabled: true}},
          {
            provide: NgswCommChannel,
            useFactory: ngswCommChannelFactory,
            deps: [SwRegistrationOptions, Injector],
          },
        ],
      });

      const context: any = globalThis;
      const originalDescriptor = Object.getOwnPropertyDescriptor(context, 'navigator');
      const patchedDescriptor = {value: {serviceWorker: undefined}, configurable: true};

      try {
        // Set `navigator` to `{serviceWorker: undefined}`.
        Object.defineProperty(context, 'navigator', patchedDescriptor);
        expect(TestBed.inject(NgswCommChannel).isEnabled).toBe(false);
      } finally {
        if (originalDescriptor) {
          Object.defineProperty(context, 'navigator', originalDescriptor);
        } else {
          delete context.navigator;
        }
      }
    });
    it('gives enabled NgswCommChannel when browser supports SW and enabled option is true', () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: PLATFORM_ID, useValue: 'browser'},
          {provide: SwRegistrationOptions, useValue: {enabled: true}},
          {
            provide: NgswCommChannel,
            useFactory: ngswCommChannelFactory,
            deps: [SwRegistrationOptions, Injector],
          },
        ],
      });

      const context: any = globalThis;
      const originalDescriptor = Object.getOwnPropertyDescriptor(context, 'navigator');
      const patchedDescriptor = {value: {serviceWorker: mock}, configurable: true};

      try {
        // Set `navigator` to `{serviceWorker: mock}`.
        Object.defineProperty(context, 'navigator', patchedDescriptor);
        expect(TestBed.inject(NgswCommChannel).isEnabled).toBe(true);
      } finally {
        if (originalDescriptor) {
          Object.defineProperty(context, 'navigator', originalDescriptor);
        } else {
          delete context.navigator;
        }
      }
    });
  });

  describe('SwPush', () => {
    let unpatchDecodeBase64: () => void;
    let push: SwPush;

    // Patch `SwPush.decodeBase64()` in Node.js (where `atob` is not available).
    beforeAll(() => (unpatchDecodeBase64 = patchDecodeBase64(SwPush.prototype as any)));
    afterAll(() => unpatchDecodeBase64());

    beforeEach(() => {
      push = new SwPush(comm);
      mock.setupSw();
    });

    it('is injectable', () => {
      TestBed.configureTestingModule({
        providers: [SwPush, {provide: NgswCommChannel, useValue: comm}],
      });
      expect(() => TestBed.inject(SwPush)).not.toThrow();
    });

    describe('requestSubscription()', () => {
      it('returns a promise that resolves to the subscription', async () => {
        const promise = push.requestSubscription({serverPublicKey: 'test'});
        expect(promise).toEqual(jasmine.any(Promise));

        const sub = await promise;
        expect(sub).toEqual(jasmine.any(MockPushSubscription));
      });

      it('calls `PushManager.subscribe()` (with appropriate options)', async () => {
        const decode = (charCodeArr: Uint8Array) =>
          Array.from(charCodeArr)
            .map((c) => String.fromCharCode(c))
            .join('');

        // atob('c3ViamVjdHM/') === 'subjects?'
        const serverPublicKey = 'c3ViamVjdHM_';
        const appServerKeyStr = 'subjects?';

        const pmSubscribeSpy = spyOn(MockPushManager.prototype, 'subscribe').and.callThrough();
        await push.requestSubscription({serverPublicKey});

        expect(pmSubscribeSpy).toHaveBeenCalledTimes(1);
        expect(pmSubscribeSpy).toHaveBeenCalledWith({
          applicationServerKey: jasmine.any(Uint8Array) as any,
          userVisibleOnly: true,
        });

        const actualAppServerKey = pmSubscribeSpy.calls.first().args[0]!.applicationServerKey;
        const actualAppServerKeyStr = decode(actualAppServerKey as Uint8Array);
        expect(actualAppServerKeyStr).toBe(appServerKeyStr);
      });

      it('emits the new `PushSubscription` on `SwPush.subscription`', async () => {
        const subscriptionSpy = jasmine.createSpy('subscriptionSpy');
        push.subscription.subscribe(subscriptionSpy);
        const sub = await push.requestSubscription({serverPublicKey: 'test'});

        expect(subscriptionSpy).toHaveBeenCalledWith(sub);
      });
    });

    describe('unsubscribe()', () => {
      let psUnsubscribeSpy: jasmine.Spy;

      beforeEach(() => {
        psUnsubscribeSpy = spyOn(MockPushSubscription.prototype, 'unsubscribe').and.callThrough();
      });

      it('rejects if currently not subscribed to push notifications', async () => {
        try {
          await push.unsubscribe();
          throw new Error('`unsubscribe()` should fail');
        } catch (err) {
          expect((err as Error).message).toContain('Not subscribed to push notifications.');
        }
      });

      it('calls `PushSubscription.unsubscribe()`', async () => {
        await push.requestSubscription({serverPublicKey: 'test'});
        await push.unsubscribe();

        expect(psUnsubscribeSpy).toHaveBeenCalledTimes(1);
      });

      it('rejects if `PushSubscription.unsubscribe()` fails', async () => {
        psUnsubscribeSpy.and.callFake(() => {
          throw new Error('foo');
        });

        try {
          await push.requestSubscription({serverPublicKey: 'test'});
          await push.unsubscribe();
          throw new Error('`unsubscribe()` should fail');
        } catch (err) {
          expect((err as Error).message).toBe('foo');
        }
      });

      it('rejects if `PushSubscription.unsubscribe()` returns false', async () => {
        psUnsubscribeSpy.and.returnValue(Promise.resolve(false));

        try {
          await push.requestSubscription({serverPublicKey: 'test'});
          await push.unsubscribe();
          throw new Error('`unsubscribe()` should fail');
        } catch (err) {
          expect((err as Error).message).toContain('Unsubscribe failed!');
        }
      });

      it('emits `null` on `SwPush.subscription`', async () => {
        const subscriptionSpy = jasmine.createSpy('subscriptionSpy');
        push.subscription.subscribe(subscriptionSpy);

        await push.requestSubscription({serverPublicKey: 'test'});
        await push.unsubscribe();

        expect(subscriptionSpy).toHaveBeenCalledWith(null);
      });

      it('does not emit on `SwPush.subscription` on failure', async () => {
        const subscriptionSpy = jasmine.createSpy('subscriptionSpy');
        const initialSubEmit = new Promise((resolve) => subscriptionSpy.and.callFake(resolve));

        push.subscription.subscribe(subscriptionSpy);
        await initialSubEmit;
        subscriptionSpy.calls.reset();

        // Error due to no subscription.
        await push.unsubscribe().catch(() => undefined);
        expect(subscriptionSpy).not.toHaveBeenCalled();

        // Subscribe.
        await push.requestSubscription({serverPublicKey: 'test'});
        subscriptionSpy.calls.reset();

        // Error due to `PushSubscription.unsubscribe()` error.
        psUnsubscribeSpy.and.callFake(() => {
          throw new Error('foo');
        });
        await push.unsubscribe().catch(() => undefined);
        expect(subscriptionSpy).not.toHaveBeenCalled();

        // Error due to `PushSubscription.unsubscribe()` failure.
        psUnsubscribeSpy.and.returnValue(Promise.resolve(false));
        await push.unsubscribe().catch(() => undefined);
        expect(subscriptionSpy).not.toHaveBeenCalled();
      });
    });

    describe('messages', () => {
      it('receives push messages', () => {
        const sendMessage = (type: string, message: string) =>
          mock.sendMessage({type, data: {message}});

        const receivedMessages: string[] = [];
        push.messages.subscribe((msg: any) => receivedMessages.push(msg.message));

        sendMessage('PUSH', 'this was a push message');
        sendMessage('NOTPUSH', 'this was not a push message');
        sendMessage('PUSH', 'this was a push message too');
        sendMessage('HSUP', 'this was a HSUP message');

        expect(receivedMessages).toEqual([
          'this was a push message',
          'this was a push message too',
        ]);
      });
    });

    describe('notificationClicks', () => {
      it('receives notification clicked messages', () => {
        const sendMessage = (type: string, action: string) =>
          mock.sendMessage({type, data: {action}});

        const receivedMessages: string[] = [];
        push.notificationClicks.subscribe((msg: {action: string}) =>
          receivedMessages.push(msg.action),
        );

        sendMessage('NOTIFICATION_CLICK', 'this was a click');
        sendMessage('NOT_IFICATION_CLICK', 'this was not a click');
        sendMessage('NOTIFICATION_CLICK', 'this was a click too');
        sendMessage('KCILC_NOITACIFITON', 'this was a KCILC_NOITACIFITON message');

        expect(receivedMessages).toEqual(['this was a click', 'this was a click too']);
      });
    });

    describe('subscription', () => {
      let nextSubEmitResolve: () => void;
      let nextSubEmitPromise: Promise<void>;
      let subscriptionSpy: jasmine.Spy;

      beforeEach(() => {
        nextSubEmitPromise = new Promise((resolve) => (nextSubEmitResolve = resolve));
        subscriptionSpy = jasmine.createSpy('subscriptionSpy').and.callFake(() => {
          nextSubEmitResolve();
          nextSubEmitPromise = new Promise((resolve) => (nextSubEmitResolve = resolve));
        });

        push.subscription.subscribe(subscriptionSpy);
      });

      it('emits on worker-driven changes (i.e. when the controller changes)', async () => {
        // Initial emit for the current `ServiceWorkerController`.
        await nextSubEmitPromise;
        expect(subscriptionSpy).toHaveBeenCalledTimes(1);
        expect(subscriptionSpy).toHaveBeenCalledWith(null);

        subscriptionSpy.calls.reset();

        // Simulate a `ServiceWorkerController` change.
        mock.setupSw();
        await nextSubEmitPromise;
        expect(subscriptionSpy).toHaveBeenCalledTimes(1);
        expect(subscriptionSpy).toHaveBeenCalledWith(null);
      });

      it('emits on subscription changes (i.e. when subscribing/unsubscribing)', async () => {
        await nextSubEmitPromise;
        subscriptionSpy.calls.reset();

        // Subscribe.
        await push.requestSubscription({serverPublicKey: 'test'});
        expect(subscriptionSpy).toHaveBeenCalledTimes(1);
        expect(subscriptionSpy).toHaveBeenCalledWith(jasmine.any(MockPushSubscription));

        subscriptionSpy.calls.reset();

        // Subscribe again.
        await push.requestSubscription({serverPublicKey: 'test'});
        expect(subscriptionSpy).toHaveBeenCalledTimes(1);
        expect(subscriptionSpy).toHaveBeenCalledWith(jasmine.any(MockPushSubscription));

        subscriptionSpy.calls.reset();

        // Unsubscribe.
        await push.unsubscribe();
        expect(subscriptionSpy).toHaveBeenCalledTimes(1);
        expect(subscriptionSpy).toHaveBeenCalledWith(null);
      });
    });

    describe('with no SW', () => {
      beforeEach(() => {
        comm = new NgswCommChannel(undefined);
        push = new SwPush(comm);
      });

      it('does not crash on subscription to observables', () => {
        push.messages.toPromise().catch((err) => fail(err));
        push.notificationClicks.toPromise().catch((err) => fail(err));
        push.subscription.toPromise().catch((err) => fail(err));
      });

      it('gives an error when registering', (done) => {
        push.requestSubscription({serverPublicKey: 'test'}).catch((err) => {
          done();
        });
      });

      it('gives an error when unsubscribing', (done) => {
        push.unsubscribe().catch((err) => {
          done();
        });
      });
    });
  });

  describe('SwUpdate', () => {
    let update: SwUpdate;
    beforeEach(() => {
      update = new SwUpdate(comm);
      mock.setupSw();
    });
    it('processes update availability notifications when sent', (done) => {
      update.versionUpdates
        .pipe(filter((evt: VersionEvent): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe((event) => {
          expect(event.currentVersion).toEqual({hash: 'A'});
          expect(event.latestVersion).toEqual({hash: 'B'});
          done();
        });
      mock.sendMessage({
        type: 'VERSION_READY',
        currentVersion: {
          hash: 'A',
        },
        latestVersion: {
          hash: 'B',
        },
      });
    });
    it('processes unrecoverable notifications when sent', (done) => {
      update.unrecoverable.subscribe((event) => {
        expect(event.reason).toEqual('Invalid Resource');
        expect(event.type).toEqual('UNRECOVERABLE_STATE');
        done();
      });
      mock.sendMessage({type: 'UNRECOVERABLE_STATE', reason: 'Invalid Resource'});
    });

    it('processes a no new version event when sent', (done) => {
      update.versionUpdates.subscribe((event) => {
        expect(event.type).toEqual('NO_NEW_VERSION_DETECTED');
        expect((event as NoNewVersionDetectedEvent).version).toEqual({hash: 'A'});
        done();
      });
      mock.sendMessage({
        type: 'NO_NEW_VERSION_DETECTED',
        version: {
          hash: 'A',
        },
      });
    });
    it('process any version update event when sent', (done) => {
      update.versionUpdates.subscribe((event) => {
        expect(event.type).toEqual('VERSION_DETECTED');
        expect((event as VersionDetectedEvent).version).toEqual({hash: 'A'});
        done();
      });
      mock.sendMessage({
        type: 'VERSION_DETECTED',
        version: {
          hash: 'A',
        },
      });
    });
    it('activates updates when requested', async () => {
      mock.messages.subscribe((msg: {action: string; nonce: number}) => {
        expect(msg.action).toEqual('ACTIVATE_UPDATE');
        mock.sendMessage({
          type: 'OPERATION_COMPLETED',
          nonce: msg.nonce,
          result: true,
        });
      });
      expect(await update.activateUpdate()).toBeTruthy();
    });
    it('reports activation failure when requested', async () => {
      mock.messages.subscribe((msg: {action: string; nonce: number}) => {
        expect(msg.action).toEqual('ACTIVATE_UPDATE');
        mock.sendMessage({
          type: 'OPERATION_COMPLETED',
          nonce: msg.nonce,
          error: 'Failed to activate',
        });
      });
      await expectAsync(update.activateUpdate()).toBeRejectedWithError('Failed to activate');
    });
    it('is injectable', () => {
      TestBed.configureTestingModule({
        providers: [SwUpdate, {provide: NgswCommChannel, useValue: comm}],
      });
      expect(() => TestBed.inject(SwUpdate)).not.toThrow();
    });
    describe('with no SW', () => {
      beforeEach(() => {
        comm = new NgswCommChannel(undefined);
      });
      it('can be instantiated', () => {
        update = new SwUpdate(comm);
      });
      it('does not crash on subscription to observables', () => {
        update = new SwUpdate(comm);
        update.unrecoverable.toPromise().catch((err) => fail(err));
        update.versionUpdates.toPromise().catch((err) => fail(err));
      });
      it('gives an error when checking for updates', (done) => {
        update = new SwUpdate(comm);
        update.checkForUpdate().catch((err) => {
          done();
        });
      });
      it('gives an error when activating updates', (done) => {
        update = new SwUpdate(comm);
        update.activateUpdate().catch((err) => {
          done();
        });
      });
    });
  });
});
