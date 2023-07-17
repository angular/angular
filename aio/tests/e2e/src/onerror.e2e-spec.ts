import { browser } from 'protractor';
import { SitePage } from './app.po';

/* eslint-disable max-len */

describe('onerror handler', () => {
  let page: SitePage;

  beforeAll(async () => {
    page = new SitePage();
    await page.navigateTo('');
  });


  it('(called without an error object) should call ga with a payload based on the message, url, row and column arguments', async () => {
    const message1 = await callOnError('Error: some error message', 'some-file.js', 12, 3, undefined);
    expect(message1).toEqual('some error message\nsome-file.js:12:3');
    const message2 = await callOnError('Error: some error message', undefined, undefined, undefined, undefined);
    expect(message2).toEqual('some error message\nnull:?:?');
  });

  it('(called without an error object) should call ga with a payload that is no longer that 150 characters', async () => {
    const message = await callOnError(
      'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz' +
      'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz',
      'some-file.js', 12, 3, undefined);
    expect(message).toEqual(
      'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz' +
      'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrst');
  });

  it('(called with a Firefox on android style error) should call ga with a payload based on the error object', async () => {
    const message = await callOnError('Error: something terrible has happened. oh no. oh no.', undefined, undefined, undefined, {
      message: 'something terrible has happened. oh no. oh no.',
      stack: `AppComponent@https://example.com/app/app.component.ts:31:29
createClass@https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:12200:20
createDirectiveInstance@https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:12049:37
createViewNodes@https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:13487:53
createRootView@https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:13377:5
callWithDebugContext@https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:14778:39
debugCreateRootView@https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:14079:12
ComponentFactory_.prototype.create@https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:10998:37
ComponentFactoryBoundToModule.prototype.create@https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:3958:16
ApplicationRef.prototype.bootstrap@https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:5769:40
PlatformRef.prototype._moduleDoBootstrap/<@https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:5496:74
PlatformRef.prototype._moduleDoBootstrap@https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:5496:13
PlatformRef.prototype.bootstrapModuleFactory/</</<@https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:5417:21
ZoneDelegate.prototype.invoke@https://example.com/packages/zone.js@0.8.18/dist/zone.js:392:17
forkInnerZoneWithAngularBehavior/zone._inner<.onInvoke@https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:4665:24
ZoneDelegate.prototype.invoke@https://example.com/packages/zone.js@0.8.18/dist/zone.js:391:17
Zone.prototype.run@https://example.com/packages/zone.js@0.8.18/dist/zone.js:142:24
scheduleResolveOrReject/<@https://example.com/packages/zone.js@0.8.18/dist/zone.js:873:52
ZoneDelegate.prototype.invokeTask@https://example.com/packages/zone.js@0.8.18/dist/zone.js:425:17
forkInnerZoneWithAngularBehavior/zone._inner<.onInvokeTask@https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:4656:24
ZoneDelegate.prototype.invokeTask@https://example.com/packages/zone.js@0.8.18/dist/zone.js:424:17
Zone.prototype.runTask@https://example.com/packages/zone.js@0.8.18/dist/zone.js:192:28
drainMicroTaskQueue@https://example.com/packages/zone.js@0.8.18/dist/zone.js:602:25` });

    expect(message).toEqual(`something terrible has happened. oh no. oh no.
AppComponent@app.component.ts:31:29
createClass@core.umd.js:12200:20
createDirectiveInstance@core.umd.j`);
  });

  it('(called with a Safari 11 style error) should call ga with a payload based on the error object', async () => {
    const message = await callOnError('Error: something terrible has happened. oh no. oh no.', undefined, undefined, undefined, {
      message: 'something terrible has happened. oh no. oh no.',
      stack: `AppComponent
      createClass
      createDirectiveInstance
      createViewNodes
      createRootView
      callWithDebugContext
      create
      bootstrap
      forEach@[native code]
      _moduleDoBootstrap

      onInvoke
      run

      onInvokeTask
      runTask
      drainMicroTaskQueue
      promiseReactionJob@[native code]` });

    expect(message).toEqual(`something terrible has happened. oh no. oh no.
AppComponent
createClass
createDirectiveInstance
createViewNodes
createRootView
callWithDebugContext
cr`);
  });

  it('(called with a Opera 50 style error) should call ga with a payload based on the error object', async () => {
    const message = await callOnError('Error: something terrible has happened. oh no. oh no.', undefined, undefined, undefined, {
      message: 'something terrible has happened. oh no. oh no.',
      stack: `Error: something terrible has happened. oh no. oh no.
      at new AppComponent (https://example.com/app/app.component.ts:31:29)
      at createClass (https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:12200:20)
      at createDirectiveInstance (https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:12049:37)
      at createViewNodes (https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:13487:53)
      at createRootView (https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:13377:5)
      at callWithDebugContext (https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:14778:42)
      at Object.debugCreateRootView [as createRootView] (https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:14079:12)
      at ComponentFactory_.create (https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:10998:46)
      at ComponentFactoryBoundToModule.create (https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:3958:29)
      at ApplicationRef.bootstrap (https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:5769:57)` });

    expect(message).toEqual(`something terrible has happened. oh no. oh no.
new AppComponent@app.component.ts:31:29
createClass@core.umd.js:12200:20
createDirectiveInstance@core.u`);
  });

  it('(called with a Chrome 64 style error) should call ga with a payload based on the error object', async () => {
    const message = await callOnError('Error: something terrible has happened. oh no. oh no.', undefined, undefined, undefined, {
      message: 'something terrible has happened. oh no. oh no.',
      stack: `Error: something terrible has happened. oh no. oh no.
      at new AppComponent (https://example.com/app/app.component.ts:31:29)
      at createClass (https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:12200:20)
      at createDirectiveInstance (https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:12049:37)
      at createViewNodes (https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:13487:53)
      at createRootView (https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:13377:5)
      at callWithDebugContext (https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:14778:42)
      at Object.debugCreateRootView [as createRootView] (https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:14079:12)
      at ComponentFactory_.create (https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:10998:46)
      at ComponentFactoryBoundToModule.create (https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:3958:29)
      at ApplicationRef.bootstrap (https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:5769:57)` });

    expect(message).toEqual(`something terrible has happened. oh no. oh no.
new AppComponent@app.component.ts:31:29
createClass@core.umd.js:12200:20
createDirectiveInstance@core.u`);
  });

  it('(called with a Firefox 58 style error) should call ga with a payload based on the error object', async () => {
    const message = await callOnError('Error: something terrible has happened. oh no. oh no.', undefined, undefined, undefined, {
      message: 'something terrible has happened. oh no. oh no.',
      stack: `AppComponent@https://example.com/app/app.component.ts:31:29
createClass@https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:12200:20
createDirectiveInstance@https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:12049:37
createViewNodes@https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:13487:53
createRootView@https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:13377:5
callWithDebugContext@https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:14778:39
debugCreateRootView@https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:14079:12
ComponentFactory_.prototype.create@https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:10998:37
ComponentFactoryBoundToModule.prototype.create@https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:3958:16
ApplicationRef.prototype.bootstrap@https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:5769:40
PlatformRef.prototype._moduleDoBootstrap/<@https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:5496:74
PlatformRef.prototype._moduleDoBootstrap@https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:5496:13
PlatformRef.prototype.bootstrapModuleFactory/</</<@https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:5417:21
ZoneDelegate.prototype.invoke@https://example.com/packages/zone.js@0.8.18/dist/zone.js:392:17
onInvoke@https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:4665:24
ZoneDelegate.prototype.invoke@https://example.com/packages/zone.js@0.8.18/dist/zone.js:391:17
Zone.prototype.run@https://example.com/packages/zone.js@0.8.18/dist/zone.js:142:24
scheduleResolveOrReject/<@https://example.com/packages/zone.js@0.8.18/dist/zone.js:873:52
ZoneDelegate.prototype.invokeTask@https://example.com/packages/zone.js@0.8.18/dist/zone.js:425:17
onInvokeTask@https://example.com/packages/@angular/core@5.0.0/bundles/core.umd.js:4656:24
ZoneDelegate.prototype.invokeTask@https://example.com/packages/zone.js@0.8.18/dist/zone.js:424:17
Zone.prototype.runTask@https://example.com/packages/zone.js@0.8.18/dist/zone.js:192:28
drainMicroTaskQueue@https://example.com/packages/zone.js@0.8.18/dist/zone.js:602:25` });

    expect(message).toEqual(`something terrible has happened. oh no. oh no.
AppComponent@app.component.ts:31:29
createClass@core.umd.js:12200:20
createDirectiveInstance@core.umd.j`);
  });

  it('(called with a Edge 16 style error) should call ga with a payload based on the error object', async () => {
    const message = await callOnError('Error: something terrible has happened. oh no. oh no.', undefined, undefined, undefined, {
      message: 'something terrible has happened. oh no. oh no.',
      stack: `Error: something terrible has happened. oh no. oh no.
      at AppComponent (eval code:31:21)
      at createClass (eval code:12200:13)
      at createDirectiveInstance (eval code:12049:5)
      at createViewNodes (eval code:13487:21)
      at createRootView (eval code:13377:5)
      at callWithDebugContext (eval code:14778:9)
      at debugCreateRootView (eval code:14079:5)
      at ComponentFactory_.prototype.create (eval code:10998:9)
      at ComponentFactoryBoundToModule.prototype.create (eval code:3958:9)
      at ApplicationRef.prototype.bootstrap (eval code:5769:9)` });

    expect(message).toEqual(`something terrible has happened. oh no. oh no.
AppComponent@???:31:21
createClass@???:12200:13
createDirectiveInstance@???:12049:5
createViewNodes@???`);
  });

  async function callOnError(
      message: string, filename?: string, lineno?: number, colno?: number, error?: {message: string, stack?: string}) {
    await browser.executeScript(() => {
      // reset the ga and gtag queue
      (window as any).ga.q.length = 0;
      (window as any).dataLayer = [];
      // create the error instance if provided
      // we cannot pass the `Error` instance from the e2e tests as that one
      // might fail an `instanceof Error` check.
      let errorObj;
      if (arguments[4]) {
        errorObj = new Error(arguments[4].message);
        errorObj.stack = arguments[4].stack;
      }
      // post the error to the handler
      window.dispatchEvent(new ErrorEvent('error', {
        message: arguments[0],
        filename: arguments[1],
        lineno: arguments[2],
        colno: arguments[3],
        error: errorObj,
      }));
    }, message, filename, lineno, colno, error);

    const legacyGaCalls = await page.legacyGa();
    const gtagCalls = await page.gtagQueue();

    const legacyExceptionCall = legacyGaCalls.find(call => call[0] === 'send' && call[1] === 'exception');
    const gtagExceptionCall = gtagCalls.find(call => call[0] === 'event' && call[1] === 'exception');

    if (gtagExceptionCall && legacyExceptionCall) {
      const legacyPayload = legacyExceptionCall[2];
      const payload = gtagExceptionCall[2];

      expect(legacyPayload.exFatal).toBe(true);
      expect(payload.fatal).toBe(true);

      return payload.description;
    }
  }
});
