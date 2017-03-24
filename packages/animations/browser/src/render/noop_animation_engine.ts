/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationEvent, AnimationMetadataType, AnimationPlayer, AnimationStateMetadata, AnimationTriggerMetadata, ɵStyleData} from '@angular/animations';

import {AnimationEngine} from '../animation_engine';
import {copyStyles, eraseStyles, normalizeStyles, setStyles} from '../util';

interface ListenerTuple {
  eventPhase: string;
  triggerName: string;
  callback: (event: any) => any;
  doRemove?: boolean;
}

interface ChangeTuple {
  element: any;
  triggerName: string;
  oldValue: string;
  newValue: string;
}

const DEFAULT_STATE_VALUE = 'void';
const DEFAULT_STATE_STYLES = '*';

export class NoopAnimationEngine extends AnimationEngine {
  private _listeners = new Map<any, ListenerTuple[]>();
  private _changes: ChangeTuple[] = [];
  private _flaggedRemovals = new Set<any>();
  private _onDoneFns: (() => any)[] = [];
  private _triggerStyles: {[triggerName: string]: {[stateName: string]: ɵStyleData}} =
      Object.create(null);

  registerTrigger(trigger: AnimationTriggerMetadata, name?: string): void {
    name = name || trigger.name;
    if (this._triggerStyles[name]) {
      return;
    }
    const stateMap: {[stateName: string]: ɵStyleData} = {};
    trigger.definitions.forEach(def => {
      if (def.type === AnimationMetadataType.State) {
        const stateDef = def as AnimationStateMetadata;
        stateMap[stateDef.name] = normalizeStyles(stateDef.styles.styles);
      }
    });
    this._triggerStyles[name] = stateMap;
  }

  onInsert(element: any, domFn: () => any): void { domFn(); }

  onRemove(element: any, domFn: () => any): void {
    domFn();
    if (element['nodeType'] == 1) {
      this._flaggedRemovals.add(element);
    }
  }

  setProperty(element: any, property: string, value: any): void {
    const storageProp = makeStorageProp(property);
    const oldValue = element[storageProp] || DEFAULT_STATE_VALUE;
    this._changes.push(<ChangeTuple>{element, oldValue, newValue: value, triggerName: property});

    const triggerStateStyles = this._triggerStyles[property] || {};
    const fromStateStyles =
        triggerStateStyles[oldValue] || triggerStateStyles[DEFAULT_STATE_STYLES];
    if (fromStateStyles) {
      eraseStyles(element, fromStateStyles);
    }

    element[storageProp] = value;
    this._onDoneFns.push(() => {
      const toStateStyles = triggerStateStyles[value] || triggerStateStyles[DEFAULT_STATE_STYLES];
      if (toStateStyles) {
        setStyles(element, toStateStyles);
      }
    });
  }

  listen(element: any, eventName: string, eventPhase: string, callback: (event: any) => any):
      () => any {
    let listeners = this._listeners.get(element);
    if (!listeners) {
      this._listeners.set(element, listeners = []);
    }

    const tuple = <ListenerTuple>{triggerName: eventName, eventPhase, callback};
    listeners.push(tuple);

    return () => tuple.doRemove = true;
  }

  flush(): void {
    const onStartCallbacks: (() => any)[] = [];
    const onDoneCallbacks: (() => any)[] = [];

    function handleListener(listener: ListenerTuple, data: ChangeTuple) {
      const phase = listener.eventPhase;
      const event = makeAnimationEvent(
          data.element, data.triggerName, data.oldValue, data.newValue, phase, 0);
      if (phase == 'start') {
        onStartCallbacks.push(() => listener.callback(event));
      } else if (phase == 'done') {
        onDoneCallbacks.push(() => listener.callback(event));
      }
    }

    this._changes.forEach(change => {
      const element = change.element;
      const listeners = this._listeners.get(element);
      if (listeners) {
        listeners.forEach(listener => {
          if (listener.triggerName == change.triggerName) {
            handleListener(listener, change);
          }
        });
      }
    });

    // upon removal ALL the animation triggers need to get fired
    this._flaggedRemovals.forEach(element => {
      const listeners = this._listeners.get(element);
      if (listeners) {
        listeners.forEach(listener => {
          const triggerName = listener.triggerName;
          const storageProp = makeStorageProp(triggerName);
          handleListener(listener, <ChangeTuple>{
            element: element,
            triggerName: triggerName,
            oldValue: element[storageProp] || DEFAULT_STATE_VALUE,
            newValue: DEFAULT_STATE_VALUE
          });
        });
      }
    });

    // remove all the listeners after everything is complete
    Array.from(this._listeners.keys()).forEach(element => {
      const listenersToKeep = this._listeners.get(element) !.filter(l => !l.doRemove);
      if (listenersToKeep.length) {
        this._listeners.set(element, listenersToKeep);
      } else {
        this._listeners.delete(element);
      }
    });

    onStartCallbacks.forEach(fn => fn());
    onDoneCallbacks.forEach(fn => fn());
    this._flaggedRemovals.clear();
    this._changes = [];

    this._onDoneFns.forEach(doneFn => doneFn());
    this._onDoneFns = [];
  }

  get activePlayers(): AnimationPlayer[] { return []; }
  get queuedPlayers(): AnimationPlayer[] { return []; }
}

function makeAnimationEvent(
    element: any, triggerName: string, fromState: string, toState: string, phaseName: string,
    totalTime: number): AnimationEvent {
  return <AnimationEvent>{element, triggerName, fromState, toState, phaseName, totalTime};
}

function makeStorageProp(property: string): string {
  return '_@_' + property;
}
