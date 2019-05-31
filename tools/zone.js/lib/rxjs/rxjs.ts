/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable, Subscriber, Subscription} from 'rxjs';

(Zone as any).__load_patch('rxjs', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
  const symbol: (symbolString: string) => string = (Zone as any).__symbol__;
  const nextSource = 'rxjs.Subscriber.next';
  const errorSource = 'rxjs.Subscriber.error';
  const completeSource = 'rxjs.Subscriber.complete';

  const ObjectDefineProperties = Object.defineProperties;

  const patchObservable = function() {
    const ObservablePrototype: any = Observable.prototype;
    const _symbolSubscribe = symbol('_subscribe');
    const _subscribe = ObservablePrototype[_symbolSubscribe] = ObservablePrototype._subscribe;

    ObjectDefineProperties(Observable.prototype, {
      _zone: {value: null, writable: true, configurable: true},
      _zoneSource: {value: null, writable: true, configurable: true},
      _zoneSubscribe: {value: null, writable: true, configurable: true},
      source: {
        configurable: true,
        get: function(this: Observable<any>) {
          return (this as any)._zoneSource;
        },
        set: function(this: Observable<any>, source: any) {
          (this as any)._zone = Zone.current;
          (this as any)._zoneSource = source;
        }
      },
      _subscribe: {
        configurable: true,
        get: function(this: Observable<any>) {
          if ((this as any)._zoneSubscribe) {
            return (this as any)._zoneSubscribe;
          } else if (this.constructor === Observable) {
            return _subscribe;
          }
          const proto = Object.getPrototypeOf(this);
          return proto && proto._subscribe;
        },
        set: function(this: Observable<any>, subscribe: any) {
          (this as any)._zone = Zone.current;
          (this as any)._zoneSubscribe = function() {
            if (this._zone && this._zone !== Zone.current) {
              const tearDown = this._zone.run(subscribe, this, arguments);
              if (tearDown && typeof tearDown === 'function') {
                const zone = this._zone;
                return function() {
                  if (zone !== Zone.current) {
                    return zone.run(tearDown, this, arguments);
                  }
                  return tearDown.apply(this, arguments);
                };
              }
              return tearDown;
            }
            return subscribe.apply(this, arguments);
          };
        }
      },
      subjectFactory: {
        get: function() {
          return (this as any)._zoneSubjectFactory;
        },
        set: function(factory: any) {
          const zone = this._zone;
          this._zoneSubjectFactory = function() {
            if (zone && zone !== Zone.current) {
              return zone.run(factory, this, arguments);
            }
            return factory.apply(this, arguments);
          };
        }
      }
    });
  };

  api.patchMethod(Observable.prototype, 'lift', (delegate: any) => (self: any, args: any[]) => {
    const observable: any = delegate.apply(self, args);
    if (observable.operator) {
      observable.operator._zone = Zone.current;
      api.patchMethod(
          observable.operator, 'call',
          (operatorDelegate: any) => (operatorSelf: any, operatorArgs: any[]) => {
            if (operatorSelf._zone && operatorSelf._zone !== Zone.current) {
              return operatorSelf._zone.run(operatorDelegate, operatorSelf, operatorArgs);
            }
            return operatorDelegate.apply(operatorSelf, operatorArgs);
          });
    }
    return observable;
  });

  const patchSubscription = function() {
    ObjectDefineProperties(Subscription.prototype, {
      _zone: {value: null, writable: true, configurable: true},
      _zoneUnsubscribe: {value: null, writable: true, configurable: true},
      _unsubscribe: {
        get: function(this: Subscription) {
          if ((this as any)._zoneUnsubscribe) {
            return (this as any)._zoneUnsubscribe;
          }
          const proto = Object.getPrototypeOf(this);
          return proto && proto._unsubscribe;
        },
        set: function(this: Subscription, unsubscribe: any) {
          (this as any)._zone = Zone.current;
          (this as any)._zoneUnsubscribe = function() {
            if (this._zone && this._zone !== Zone.current) {
              return this._zone.run(unsubscribe, this, arguments);
            }
            return unsubscribe.apply(this, arguments);
          };
        }
      }
    });
  };

  const patchSubscriber = function() {
    const next = Subscriber.prototype.next;
    const error = Subscriber.prototype.error;
    const complete = Subscriber.prototype.complete;

    Object.defineProperty(Subscriber.prototype, 'destination', {
      configurable: true,
      get: function(this: Subscriber<any>) {
        return (this as any)._zoneDestination;
      },
      set: function(this: Subscriber<any>, destination: any) {
        (this as any)._zone = Zone.current;
        (this as any)._zoneDestination = destination;
      }
    });

    // patch Subscriber.next to make sure it run
    // into SubscriptionZone
    Subscriber.prototype.next = function() {
      const currentZone = Zone.current;
      const subscriptionZone = this._zone;

      // for performance concern, check Zone.current
      // equal with this._zone(SubscriptionZone) or not
      if (subscriptionZone && subscriptionZone !== currentZone) {
        return subscriptionZone.run(next, this, arguments, nextSource);
      } else {
        return next.apply(this, arguments as any);
      }
    };

    Subscriber.prototype.error = function() {
      const currentZone = Zone.current;
      const subscriptionZone = this._zone;

      // for performance concern, check Zone.current
      // equal with this._zone(SubscriptionZone) or not
      if (subscriptionZone && subscriptionZone !== currentZone) {
        return subscriptionZone.run(error, this, arguments, errorSource);
      } else {
        return error.apply(this, arguments as any);
      }
    };

    Subscriber.prototype.complete = function() {
      const currentZone = Zone.current;
      const subscriptionZone = this._zone;

      // for performance concern, check Zone.current
      // equal with this._zone(SubscriptionZone) or not
      if (subscriptionZone && subscriptionZone !== currentZone) {
        return subscriptionZone.run(complete, this, arguments, completeSource);
      } else {
        return complete.call(this);
      }
    };
  };

  patchObservable();
  patchSubscription();
  patchSubscriber();
});
