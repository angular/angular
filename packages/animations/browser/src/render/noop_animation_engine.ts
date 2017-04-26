/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationEvent, AnimationPlayer, AnimationTriggerMetadata, ɵStyleData} from '@angular/animations';

import {AnimationEngine} from '../animation_engine';
import {TriggerAst} from '../dsl/animation_ast';
import {buildAnimationAst} from '../dsl/animation_ast_builder';
import {buildTrigger} from '../dsl/animation_trigger';
import {AnimationStyleNormalizer} from '../dsl/style_normalization/animation_style_normalizer';
import {copyStyles, eraseStyles, normalizeStyles, setStyles} from '../util';

import {AnimationDriver} from './animation_driver';
import {parseTimelineCommand} from './shared';
import {TimelineAnimationEngine} from './timeline_animation_engine';

interface ListenerTuple {
  eventPhase: string;
  triggerName: string;
  namespacedName: string;
  callback: (event: any) => any;
  doRemove?: boolean;
}

interface ChangeTuple {
  element: any;
  namespacedName: string;
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

  private _timelineEngine: TimelineAnimationEngine;

  // this method is designed to be overridden by the code that uses this engine
  public onRemovalComplete = (element: any, context: any) => {};

  constructor(driver: AnimationDriver, normalizer: AnimationStyleNormalizer) {
    super();
    this._timelineEngine = new TimelineAnimationEngine(driver, normalizer);
  }

  registerTrigger(
      componentId: string, namespaceId: string, hostElement: any, name: string,
      metadata: AnimationTriggerMetadata): void {
    name = name || metadata.name;
    name = namespaceId + '#' + name;
    if (this._triggerStyles[name]) {
      return;
    }

    const errors: any[] = [];
    const ast = buildAnimationAst(metadata, errors) as TriggerAst;
    const trigger = buildTrigger(name, ast);
    this._triggerStyles[name] = trigger.states;
  }

  onInsert(namespaceId: string, element: any, parent: any, insertBefore: boolean): void {}

  onRemove(namespaceId: string, element: any, context: any): void {
    this.onRemovalComplete(element, context);
    if (element['nodeType'] == 1) {
      this._flaggedRemovals.add(element);
    }
  }

  setProperty(namespaceId: string, element: any, property: string, value: any): boolean {
    if (property.charAt(0) == '@') {
      const [id, action] = parseTimelineCommand(property);
      const args = value as any[];
      this._timelineEngine.command(id, element, action, args);
      return false;
    }

    const namespacedName = namespaceId + '#' + property;
    const storageProp = makeStorageProp(namespacedName);
    const oldValue = element[storageProp] || DEFAULT_STATE_VALUE;
    this._changes.push(
        <ChangeTuple>{element, oldValue, newValue: value, triggerName: property, namespacedName});

    const triggerStateStyles = this._triggerStyles[namespacedName] || {};
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

    return true;
  }

  listen(
      namespaceId: string, element: any, eventName: string, eventPhase: string,
      callback: (event: any) => any): () => any {
    if (eventName.charAt(0) == '@') {
      const [id, action] = parseTimelineCommand(eventName);
      return this._timelineEngine.listen(id, element, action, callback);
    }

    let listeners = this._listeners.get(element);
    if (!listeners) {
      this._listeners.set(element, listeners = []);
    }

    const tuple = <ListenerTuple>{
      namespacedName: namespaceId + '#' + eventName,
      triggerName: eventName, eventPhase, callback
    };
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
          if (listener.namespacedName == change.namespacedName) {
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
          const namespacedName = listener.namespacedName;
          const storageProp = makeStorageProp(namespacedName);
          handleListener(listener, <ChangeTuple>{
            element,
            triggerName,
            namespacedName: listener.namespacedName,
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

  get players(): AnimationPlayer[] { return []; }

  destroy(namespaceId: string) {}
}

function makeAnimationEvent(
    element: any, triggerName: string, fromState: string, toState: string, phaseName: string,
    totalTime: number): AnimationEvent {
  return <AnimationEvent>{element, triggerName, fromState, toState, phaseName, totalTime};
}

function makeStorageProp(property: string): string {
  return '_@_' + property;
}
