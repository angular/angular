import {AnimationRenderer, BaseAnimationRenderer} from './renderer';
export class AnimationRendererFactory {
  delegate;
  engine;
  _zone;
  _currentId = 0;
  _microtaskId = 1;
  _animationCallbacksBuffer = [];
  _rendererCache = new Map();
  _cdRecurDepth = 0;
  constructor(delegate, engine, _zone) {
    this.delegate = delegate;
    this.engine = engine;
    this._zone = _zone;
    engine.onRemovalComplete = (element, delegate) => {
      delegate?.removeChild(null, element);
    };
  }
  createRenderer(hostElement, type) {
    const EMPTY_NAMESPACE_ID = '';
    // cache the delegates to find out which cached delegate can
    // be used by which cached renderer
    const delegate = this.delegate.createRenderer(hostElement, type);
    if (!hostElement || !type?.data?.['animation']) {
      const cache = this._rendererCache;
      let renderer = cache.get(delegate);
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
    const registerTrigger = (trigger) => {
      if (Array.isArray(trigger)) {
        trigger.forEach(registerTrigger);
      } else {
        this.engine.registerTrigger(componentId, namespaceId, hostElement, trigger.name, trigger);
      }
    };
    const animationTriggers = type.data['animation'];
    animationTriggers.forEach(registerTrigger);
    return new AnimationRenderer(this, namespaceId, delegate, this.engine);
  }
  begin() {
    this._cdRecurDepth++;
    if (this.delegate.begin) {
      this.delegate.begin();
    }
  }
  _scheduleCountTask() {
    queueMicrotask(() => {
      this._microtaskId++;
    });
  }
  /** @internal */
  scheduleListenerCallback(count, fn, data) {
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
  whenRenderingDone() {
    return this.engine.whenRenderingDone();
  }
  /**
   * Used during HMR to clear any cached data about a component.
   * @param componentId ID of the component that is being replaced.
   */
  componentReplaced(componentId) {
    // Flush the engine since the renderer destruction waits for animations to be done.
    this.engine.flush();
    this.delegate.componentReplaced?.(componentId);
  }
}
//# sourceMappingURL=animation_renderer.js.map
