/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {AnimationTriggerMetadata} from '../../../src/animations';
import type {NgZone, Renderer2, RendererFactory2, RendererType2} from '@angular/core';

import {AnimationEngine} from './animation_engine_next';
import {AnimationRenderer, BaseAnimationRenderer} from './renderer';

// Define a recursive type to allow for nested arrays of `AnimationTriggerMetadata`. Note that an
// interface declaration is used as TypeScript prior to 3.7 does not support recursive type
// references, see https://github.com/microsoft/TypeScript/pull/33050 for details.
type NestedAnimationTriggerMetadata = AnimationTriggerMetadata | RecursiveAnimationTriggerMetadata;
interface RecursiveAnimationTriggerMetadata extends Array<NestedAnimationTriggerMetadata> {}

export class AnimationRendererFactory implements RendererFactory2 {
  private _currentId: number = 0;
  private _microtaskId: number = 1;
  private _animationCallbacksBuffer: [(e: any) => any, any][] = [];
  private _rendererCache = new Map<Renderer2, BaseAnimationRenderer>();
  private _cdRecurDepth = 0;

  constructor(
    private delegate: RendererFactory2,
    private engine: AnimationEngine,
    private _zone: NgZone,
  ) {
    engine.onRemovalComplete = (element: any, delegate: Renderer2 | null) => {
      delegate?.removeChild(null, element);
    };
  }

  createRenderer(hostElement: any, type: RendererType2): BaseAnimationRenderer {
    const EMPTY_NAMESPACE_ID = '';

    // cache the delegates to find out which cached delegate can
    // be used by which cached renderer
    const delegate = this.delegate.createRenderer(hostElement, type);
    if (!hostElement || !type?.data?.['animation']) {
      const cache = this._rendererCache;
      let renderer: BaseAnimationRenderer | undefined = cache.get(delegate);
      if (!renderer) {
        // Ensure that the renderer is removed from the cache on destroy
        // since it may contain references to detached DOM nodes.
        const onRendererDestroy = () => cache.delete(delegate);
        renderer = new BaseAnimationRenderer(
          EMPTY_NAMESPACE_ID,
          delegate,
          this.engine,
          onRendererDestroy,
        );
        // only cache this result when the base renderer is used
        cache.set(delegate, renderer);
      }
      return renderer;
    }

    const componentId = type.id;
    const namespaceId = type.id + '-' + this._currentId;
    this._currentId++;

    this.engine.register(namespaceId, hostElement);

    const registerTrigger = (trigger: NestedAnimationTriggerMetadata) => {
      if (Array.isArray(trigger)) {
        trigger.forEach(registerTrigger);
      } else {
        this.engine.registerTrigger(componentId, namespaceId, hostElement, trigger.name, trigger);
      }
    };
    const animationTriggers = type.data['animation'] as NestedAnimationTriggerMetadata[];
    animationTriggers.forEach(registerTrigger);

    return new AnimationRenderer(this, namespaceId, delegate, this.engine);
  }

  begin() {
    this._cdRecurDepth++;
    if (this.delegate.begin) {
      this.delegate.begin();
    }
  }

  private _scheduleCountTask() {
    queueMicrotask(() => {
      this._microtaskId++;
    });
  }

  /** @internal */
  scheduleListenerCallback(count: number, fn: (e: any) => any, data: any) {
    if (count >= 0 && count < this._microtaskId) {
      this._zone.run(() => fn(data));
      return;
    }

    const animationCallbacksBuffer = this._animationCallbacksBuffer;
    if (animationCallbacksBuffer.length == 0) {
      queueMicrotask(() => {
        this._zone.run(() => {
          animationCallbacksBuffer.forEach((tuple) => {
            const [fn, data] = tuple;
            fn(data);
          });
          this._animationCallbacksBuffer = [];
        });
      });
    }
    animationCallbacksBuffer.push([fn, data]);
  }

  end() {
    this._cdRecurDepth--;

    // this is to prevent animations from running twice when an inner
    // component does CD when a parent component instead has inserted it
    if (this._cdRecurDepth == 0) {
      this._zone.runOutsideAngular(() => {
        this._scheduleCountTask();
        this.engine.flush(this._microtaskId);
      });
    }
    if (this.delegate.end) {
      this.delegate.end();
    }
  }

  whenRenderingDone(): Promise<any> {
    return this.engine.whenRenderingDone();
  }

  /**
   * Used during HMR to clear any cached data about a component.
   * @param componentId ID of the component that is being replaced.
   */
  protected componentReplaced(componentId: string) {
    // Flush the engine since the renderer destruction waits for animations to be done.
    this.engine.flush();
    (this.delegate as {componentReplaced?: (id: string) => void}).componentReplaced?.(componentId);
  }
}
