/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export {SIGNAL as ɵSIGNAL} from '../primitives/signals';

export {isSignal, Signal, ValueEqualityFn} from './render3/reactivity/api';
export {computed, CreateComputedOptions} from './render3/reactivity/computed';
export {
  deepSignal as ɵdeepSignal,
  DeepSignalOptions as ɵDeepSignalOptions,
} from './render3/reactivity/deep_signal/deep_signal';
export {
  structuralSignal as ɵstructuralSignal,
  StructuralSignalOptions as ɵStructuralSignalOptions,
} from './render3/reactivity/deep_signal/structural_signal';
export {
  CreateSignalOptions,
  signal,
  WritableSignal,
  ɵunwrapWritableSignal,
} from './render3/reactivity/signal';
export {linkedSignal} from './render3/reactivity/linked_signal';
export {untracked} from './render3/reactivity/untracked';
export {
  CreateEffectOptions,
  effect,
  EffectRef,
  EffectCleanupFn,
  EffectCleanupRegisterFn,
} from './render3/reactivity/effect';
export {EffectScheduler as ɵEffectScheduler} from './render3/reactivity/root_effect_scheduler';
export {afterRenderEffect, ɵFirstAvailableSignal} from './render3/reactivity/after_render_effect';
export {assertNotInReactiveContext} from './render3/reactivity/asserts';
