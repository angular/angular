import {Injectable, NgZone} from '@angular/core';
import {fromByteArray} from 'base64-js';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {ConnectableObservable} from 'rxjs/observable/ConnectableObservable';

function chain<T>(src: Observable<any>, ...specs: any[][]): Observable<T> {
  return specs.reduce((obs: Observable<any>, next: any[]) => {
    const op: Function = next.shift();
    return op.apply(obs, next);
  }, src);
}

import {concat} from 'rxjs/observable/concat';
import {defer} from 'rxjs/observable/defer';
import {from} from 'rxjs/observable/from';
import {fromEvent} from 'rxjs/observable/fromEvent';
import {of } from 'rxjs/observable/of';

import {concatMap} from 'rxjs/operator/concatMap';
import {expand} from 'rxjs/operator/expand';
import {filter} from 'rxjs/operator/filter';
import {letProto} from 'rxjs/operator/let';
import {map} from 'rxjs/operator/map';
import {publishReplay} from 'rxjs/operator/publishReplay';
import {reduce} from 'rxjs/operator/reduce';
import {share} from 'rxjs/operator/share';
import {switchMap} from 'rxjs/operator/switchMap';
import {take} from 'rxjs/operator/take';
import {takeWhile} from 'rxjs/operator/takeWhile';

/**
 * @experimental
 */
export interface PushOptions { applicationServerKey?: string; }

function fromPromise<T>(promiseFn: (() => Promise<T>)): Observable<T> {
  return Observable.create((observer: Observer<T>) => {
    promiseFn()
        .then(v => observer.next(v))
        .then(() => observer.complete())
        .catch(err => observer.error(err));
  });
}

/**
 * @experimental
 */
export interface UpdateEvent {
  type: 'pending'|'activation';
  version?: string;
}

/**
 * A push notification registration, including the endpoint URL and encryption keys.
 *
 * @experimental
 */ 
export class NgPushRegistration {
  private ps: PushSubscription;

  /**
   * @internal
   */
  constructor(ps: any) { this.ps = ps; }

  // Get the authentication key
  auth(): string { return this.key('auth'); }

  key(method: string = 'p256dh'): string {
    return fromByteArray(new Uint8Array(this.ps.getKey(method as PushEncryptionKeyName) !));
  }

  get url(): string { return this.ps.endpoint; }

  toJSON(): Object { return this.ps.toJSON(); }

  unsubscribe(): Observable<boolean> {
    // TODO: switch to Observable.fromPromise when it's not broken.
    return fromPromise(() => this.ps.unsubscribe());
  }
}

/**
 * @experimental
 */
@Injectable()
export class NgServiceWorker {
  // Typed reference to navigator.serviceWorker.
  private container: ServiceWorkerContainer|undefined;

  // Always returns the current controlling worker, or undefined if there isn't one.
  private controllingWorker = new BehaviorSubject<ServiceWorker|undefined>(undefined);

  // Always returns the current controlling worker, and waits for one to exist
  // if it does not.
  private awaitSingleControllingWorker: Observable<ServiceWorker>;

  push: Observable<any>;

  updates: Observable<UpdateEvent>;

  constructor(private zone: NgZone) {
    // Extract a typed version of navigator.serviceWorker.
    this.container =
        (typeof navigator === 'object') && navigator['serviceWorker'] as ServiceWorkerContainer ||
        undefined;

    if (!!this.container) {
      // Final Observable that will always give back the current controlling worker,
      // and follow changes over time.

      // Combine current and future controllers.
      concat(
          // Current controlling worker (if any).
          of (this.container.controller),
          // Future changes of the controlling worker.
          chain<ServiceWorker>(
              // Track changes of the controlling worker via the controllerchange event.
              fromEvent(this.container, 'controllerchange'),
              // Read the new controller when it changes.
              [map, (_: any) => this.container !.controller], ))
          // Cache the latest controller for immediate delivery.
          .subscribe(
              worker => this.controllingWorker.next(worker !),
              err => this.controllingWorker.error(err), () => this.controllingWorker.complete(), );
    }

    // To make one-off calls to the worker, awaitSingleControllingWorker waits for
    // a controlling worker to exist.
    this.awaitSingleControllingWorker = chain<ServiceWorker>(
        this.controllingWorker, [filter, (worker: ServiceWorker | undefined) => !!worker],
        [take, 1]);

    // Setup the push Observable as a broadcast mechanism for push notifications.
    this.push = this.runCmd('push');

    // Setup the updates Observable as a broadcast mechanism for update notifications.
    this.updates = this.runCmd('update');
  }

  private runCmd(cmd: string): Observable<any> {
    return chain<any>(defer(() => this.send({cmd})), [share]);
  }

  private registrationForWorker():
      ((obs: Observable<ServiceWorker>) => Observable<ServiceWorkerRegistration>) {
    return (obs: Observable<ServiceWorker>) => chain<ServiceWorkerRegistration>(obs, [
             switchMap,
             (worker: ServiceWorker) => chain<ServiceWorkerRegistration>(
                 fromPromise(
                     () => <Promise<ServiceWorkerRegistration[]>>(
                         this.container !.getRegistrations())),
                 [expand, (regs: ServiceWorkerRegistration[]) => from(regs)],
                 [filter, (reg: ServiceWorkerRegistration) => reg.active === worker], [take, 1])
           ]);
  }

  // Sends a single message to the worker, and awaits one (or more) responses.
  private sendToWorker(worker: ServiceWorker, message: Object): Observable<any> {
    // A MessageChannel is sent with the message so responses can be correlated.
    const channel = new MessageChannel();
    // Observe replies.
    const start = new Observable<any>((observer: Observer<any>) => {
      let cancelId: any = null;
      const listener = (event: MessageEvent) => {
        const data = event.data;
        if (!!data && typeof data === 'object' && data.hasOwnProperty('$ngsw') &&
            data.hasOwnProperty('id')) {
          cancelId = data['id'];
        } else if (data === null) {
          observer.complete();
          channel.port1.removeEventListener('message', listener);
          return;
        } else {
          observer.next(data);
        }
      };
      channel.port1.addEventListener('message', listener);
      return () => {
        channel.port1.removeEventListener('message', listener);
        this.sendToWorker(worker, {cmd: 'cancel', id: cancelId});
      };
    });
    const result: ConnectableObservable<any> = chain<any>(
        start,
        // Instead of complicating this with 'close' events, complete on a null value.
        [takeWhile, (v: any) => !!v],
        // The message will be sent before the consumer has a chance to subscribe to
        // the response Observable, so publishReplay() records any responses and ensures
        // they arrive properly.
        [publishReplay], ) as ConnectableObservable<any>;

    // Connecting actually creates the event subscription and starts recording
    // for replay.
    result.connect();

    // Start receiving message(s).
    channel.port1.start();

    // Set a magic value in the message.
    (message as any)['$ngsw'] = true;

    worker.postMessage(message, [channel.port2]);
    return result;
  }

  // Send a message to the current controlling worker, waiting for one if needed.
  private send(message: Object): Observable<any> {
    return chain<any>(
        // Wait for a controlling worker to exist.
        this.awaitSingleControllingWorker,
        // Send the message and await any replies. switchMap is chosen so if a new
        // controlling worker arrives somehow, the message will still get through.
        [switchMap, (worker: ServiceWorker) => this.sendToWorker(worker, message)], );
  }

  // Send a 'ping' to the worker. The returned Observable will complete when the worker
  // acknowledges the message. This provides a test that the worker is alive and listening.
  ping(): Observable<any> { return this.send({cmd: 'ping'}); }

  log(): Observable<string> { return this.send({cmd: 'log'}); }

  activateUpdate(version: string): Observable<boolean> {
    return this.send({
      cmd: 'activateUpdate',
      version,
    });
  }

  registerForPush(pushOptions: PushOptions = {}): Observable<NgPushRegistration> {
    return chain<NgPushRegistration>(
        this
            // Wait for a controlling worker to exist.
            .awaitSingleControllingWorker,
        // Get the ServiceWorkerRegistration for the worker.
        [letProto, this.registrationForWorker()],
        // Access the PushManager used to control push notifications.
        [map, (worker: ServiceWorkerRegistration) => worker.pushManager], [
          switchMap,
          (pushManager: PushManager) => {
            // Create an Observable to wrap the Promises of the PushManager API.
            // TODO: switch to Observable.fromPromise when it's not broken.
            // This is extracted as a variable so Typescript infers types correctly.
            let reg: Observable<NgPushRegistration> =
                Observable.create((observer: Observer<NgPushRegistration>) => {
                  // Function that maps subscriptions to an Angular-specific representation.
                  let regFromSub = (sub: PushSubscription) => new NgPushRegistration(sub);

                  pushManager
                      // First, check for an existing subscription.
                      .getSubscription()
                      .then(sub => {
                        // If there is one, we don't need to register, just return it.
                        if (!!sub) {
                          return regFromSub(sub);
                        }
                        // No existing subscription, register (with userVisibleOnly: true).
                        let options = {
                          userVisibleOnly: true,
                        } as Object;
                        if (pushOptions.applicationServerKey) {
                          let key =
                              atob(pushOptions.applicationServerKey.replace(/_/g, '/').replace(
                                  /-/g, '+'));
                          let applicationServerKey = new Uint8Array(new ArrayBuffer(key.length));
                          for (let i = 0; i < key.length; i++) {
                            applicationServerKey[i] = key.charCodeAt(i);
                          }
                          (options as any)['applicationServerKey'] = applicationServerKey;
                        }
                        return pushManager.subscribe(options).then(regFromSub);
                      })
                      // Map from promises to the Observable being returned.
                      .then(sub => this.zone.run(() => observer.next(sub)))
                      .then(() => this.zone.run(() => observer.complete()))
                      .catch(err => this.zone.run(() => observer.error(err)));
                });
            return reg;
          }
        ]);
  }

  checkForUpdate(): Observable<boolean> { return this.send({cmd: 'checkUpdate'}); }
}
