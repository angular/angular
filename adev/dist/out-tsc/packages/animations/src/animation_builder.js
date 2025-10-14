import {__esDecorate, __runInitializers} from 'tslib';
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  ANIMATION_MODULE_TYPE,
  inject,
  Injectable,
  ViewEncapsulation,
  ɵRuntimeError as RuntimeError,
} from '@angular/core';
import {sequence} from './animation_metadata';
/**
 * An injectable service that produces an animation sequence programmatically within an
 * Angular component or directive.
 * Provided by the `BrowserAnimationsModule` or `NoopAnimationsModule`.
 *
 * @usageNotes
 *
 * To use this service, add it to your component or directive as a dependency.
 * The service is instantiated along with your component.
 *
 * Apps do not typically need to create their own animation players, but if you
 * do need to, follow these steps:
 *
 * 1. Use the <code>[AnimationBuilder.build](api/animations/AnimationBuilder#build)()</code> method
 * to create a programmatic animation. The method returns an `AnimationFactory` instance.
 *
 * 2. Use the factory object to create an `AnimationPlayer` and attach it to a DOM element.
 *
 * 3. Use the player object to control the animation programmatically.
 *
 * For example:
 *
 * ```ts
 * // import the service from BrowserAnimationsModule
 * import {AnimationBuilder} from '@angular/animations';
 * // require the service as a dependency
 * class MyCmp {
 *   constructor(private _builder: AnimationBuilder) {}
 *
 *   makeAnimation(element: any) {
 *     // first define a reusable animation
 *     const myAnimation = this._builder.build([
 *       style({ width: 0 }),
 *       animate(1000, style({ width: '100px' }))
 *     ]);
 *
 *     // use the returned factory object to create a player
 *     const player = myAnimation.create(element);
 *
 *     player.play();
 *   }
 * }
 * ```
 *
 * @publicApi
 *
 * @deprecated 20.2 Use `animate.enter` or `animate.leave` instead. Intent to remove in v23
 */
let AnimationBuilder = (() => {
  let _classDecorators = [
    Injectable({providedIn: 'root', useFactory: () => inject(BrowserAnimationBuilder)}),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var AnimationBuilder = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      AnimationBuilder = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
  };
  return (AnimationBuilder = _classThis);
})();
export {AnimationBuilder};
/**
 * A factory object returned from the
 * <code>[AnimationBuilder.build](api/animations/AnimationBuilder#build)()</code>
 * method.
 *
 * @publicApi
 *
 * @deprecated 20.2 Use `animate.enter` or `animate.leave` instead. Intent to remove in v23
 */
export class AnimationFactory {}
let BrowserAnimationBuilder = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _classSuper = AnimationBuilder;
  var BrowserAnimationBuilder = class extends _classSuper {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata
          ? Object.create(_classSuper[Symbol.metadata] ?? null)
          : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      BrowserAnimationBuilder = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    animationModuleType = inject(ANIMATION_MODULE_TYPE, {optional: true});
    _nextAnimationId = 0;
    _renderer;
    constructor(rootRenderer, doc) {
      super();
      const typeData = {
        id: '0',
        encapsulation: ViewEncapsulation.None,
        styles: [],
        data: {animation: []},
      };
      this._renderer = rootRenderer.createRenderer(doc.body, typeData);
      if (this.animationModuleType === null && !isAnimationRenderer(this._renderer)) {
        // We only support AnimationRenderer & DynamicDelegationRenderer for this AnimationBuilder
        throw new RuntimeError(
          3600 /* RuntimeErrorCode.BROWSER_ANIMATION_BUILDER_INJECTED_WITHOUT_ANIMATIONS */,
          (typeof ngDevMode === 'undefined' || ngDevMode) &&
            'Angular detected that the `AnimationBuilder` was injected, but animation support was not enabled. ' +
              'Please make sure that you enable animations in your application by calling `provideAnimations()` or `provideAnimationsAsync()` function.',
        );
      }
    }
    build(animation) {
      const id = this._nextAnimationId;
      this._nextAnimationId++;
      const entry = Array.isArray(animation) ? sequence(animation) : animation;
      issueAnimationCommand(this._renderer, null, id, 'register', [entry]);
      return new BrowserAnimationFactory(id, this._renderer);
    }
  };
  return (BrowserAnimationBuilder = _classThis);
})();
export {BrowserAnimationBuilder};
class BrowserAnimationFactory extends AnimationFactory {
  _id;
  _renderer;
  constructor(_id, _renderer) {
    super();
    this._id = _id;
    this._renderer = _renderer;
  }
  create(element, options) {
    return new RendererAnimationPlayer(this._id, element, options || {}, this._renderer);
  }
}
class RendererAnimationPlayer {
  id;
  element;
  _renderer;
  parentPlayer = null;
  _started = false;
  constructor(id, element, options, _renderer) {
    this.id = id;
    this.element = element;
    this._renderer = _renderer;
    this._command('create', options);
  }
  _listen(eventName, callback) {
    return this._renderer.listen(this.element, `@@${this.id}:${eventName}`, callback);
  }
  _command(command, ...args) {
    issueAnimationCommand(this._renderer, this.element, this.id, command, args);
  }
  onDone(fn) {
    this._listen('done', fn);
  }
  onStart(fn) {
    this._listen('start', fn);
  }
  onDestroy(fn) {
    this._listen('destroy', fn);
  }
  init() {
    this._command('init');
  }
  hasStarted() {
    return this._started;
  }
  play() {
    this._command('play');
    this._started = true;
  }
  pause() {
    this._command('pause');
  }
  restart() {
    this._command('restart');
  }
  finish() {
    this._command('finish');
  }
  destroy() {
    this._command('destroy');
  }
  reset() {
    this._command('reset');
    this._started = false;
  }
  setPosition(p) {
    this._command('setPosition', p);
  }
  getPosition() {
    return unwrapAnimationRenderer(this._renderer)?.engine?.players[this.id]?.getPosition() ?? 0;
  }
  totalTime = 0;
}
function issueAnimationCommand(renderer, element, id, command, args) {
  renderer.setProperty(element, `@@${id}:${command}`, args);
}
/**
 * The following 2 methods cannot reference their correct types (AnimationRenderer &
 * DynamicDelegationRenderer) since this would introduce a import cycle.
 */
function unwrapAnimationRenderer(renderer) {
  const type = renderer.ɵtype;
  if (type === 0 /* AnimationRendererType.Regular */) {
    return renderer;
  } else if (type === 1 /* AnimationRendererType.Delegated */) {
    return renderer.animationRenderer;
  }
  return null;
}
function isAnimationRenderer(renderer) {
  const type = renderer.ɵtype;
  return (
    type === 0 /* AnimationRendererType.Regular */ ||
    type === 1 /* AnimationRendererType.Delegated */
  );
}
//# sourceMappingURL=animation_builder.js.map
