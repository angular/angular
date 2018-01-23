
import {DirectiveDef, LifecycleHooksMap} from './interfaces/definition';
import {LNodeFlags} from './interfaces/node';
import {HookData, LView, TView} from './interfaces/view';



/**
 * Enum used by the lifecycle (l) instruction to determine which lifecycle hook is requesting
 * processing.
 */
export const enum LifecycleHook {ON_INIT = 0b00, ON_CHECK = 0b01, ON_CHANGES = 0b10}

/** Constants used by lifecycle hooks to determine when and how a hook should be called. */
export const enum LifecycleHookUtils {
  /* Mask used to get the type of the lifecycle hook from flags in hook queue */
  TYPE_MASK = 0b00000000000000000000000000000001,

  /* Shift needed to get directive index from flags in hook queue */
  INDX_SHIFT = 1
}

/**
 * Loops through the directives on a node and queues their all hooks except ngOnInit
 * and ngDoCheck, which are queued separately in E.
 */
export function queueLifecycleHooks(flags: number, currentView: LView): void {
  const tView = currentView.tView;
  if (tView.firstTemplatePass === true) {
    const size = (flags & LNodeFlags.SIZE_MASK) >> LNodeFlags.SIZE_SHIFT;
    const start = flags >> LNodeFlags.INDX_SHIFT;

    // It's necessary to loop through the directives at elementEnd() (rather than storing
    // the hooks at creation time) so we can preserve the current hook order. All hooks
    // for projected components and directives must be called *before* their hosts.
    for (let i = start, end = start + size; i < end; i++) {
      const hooks = (tView.data[i] as DirectiveDef<any>).lifecycleHooks;
      queueContentHooks(hooks, tView, i);
      queueViewHooks(hooks, tView, i);
    }
  }

  const size = (flags & LNodeFlags.SIZE_MASK) >> LNodeFlags.SIZE_SHIFT;
  const start = flags >> LNodeFlags.INDX_SHIFT;
  let cleanup = currentView.cleanup;

  for (let i = start, end = start + size; i < end; i++) {
    const instance = currentView.data[i];
    if (instance.ngOnDestroy != null) {
      (cleanup || (currentView.cleanup = cleanup = [])).push(instance.ngOnDestroy, instance);
    }
  }
}

function queueContentHooks(hooks: LifecycleHooksMap, tView: TView, i: number): void {
  if (hooks.afterContentInit != null) {
    (tView.contentHooks || (tView.contentHooks = [])).push(getInitFlags(i), hooks.afterContentInit);
  }

  if (hooks.afterContentChecked != null) {
    (tView.contentHooks || (tView.contentHooks = [
     ])).push(getCheckFlags(i), hooks.afterContentChecked);
  }
}
function queueViewHooks(hooks: LifecycleHooksMap, tView: TView, i: number): void {
  if (hooks.afterViewInit != null) {
    (tView.viewHooks || (tView.viewHooks = [])).push(getInitFlags(i), hooks.afterViewInit);
  }

  if (hooks.afterViewChecked != null) {
    (tView.viewHooks || (tView.viewHooks = [])).push(getCheckFlags(i), hooks.afterViewChecked);
  }
}

/** Generates flags for init-only hooks */
function getInitFlags(index: number): number {
  return index << LifecycleHookUtils.INDX_SHIFT;
}

/** Generates flags for hooks called every change detection run */
function getCheckFlags(index: number): number {
  return (index << LifecycleHookUtils.INDX_SHIFT) | LifecycleHook.ON_CHECK;
}

/**
 * If this is the first template pass, any ngOnInit or ngDoCheck hooks on the current directive
 * will be queued on TView.initHooks.
 *
 * The directive index and hook type are encoded into one number (1st bit: type, remaining bits:
 * directive index), then saved in the even indices of the initHooks array. The odd indices
 * hold the hook functions themselves.
 *
 * @param index The index of the directive in LView.data
 * @param hooks The static hooks map on the directive def
 * @param tView The current TView
 */
export function queueInitHooks(index: number, hooks: LifecycleHooksMap, tView: TView): void {
  if (tView.firstTemplatePass === true && hooks.onInit != null) {
    const hookFlags = index << LifecycleHookUtils.INDX_SHIFT;
    (tView.initHooks || (tView.initHooks = [])).push(hookFlags, hooks.onInit);
  }

  if (tView.firstTemplatePass === true && hooks.doCheck != null) {
    const hookFlags = (index << LifecycleHookUtils.INDX_SHIFT) | LifecycleHook.ON_CHECK;
    (tView.initHooks || (tView.initHooks = [])).push(hookFlags, hooks.doCheck);
  }
}

/**
 * Calls onInit and doCheck calls if they haven't already been called.
 *
 * @param currentView The current view
 * @param initHooks The init hooks for this view
 */
export function executeInitHooks(currentView: LView): void {
  const initHooks = currentView.tView.initHooks;

  if (currentView.initHooksCalled === false && initHooks != null) {
    executeLifecycleHooks(currentView, initHooks);
    currentView.initHooksCalled = true;
  }
}

/** Iterates over view hook functions and calls them. */
export function executeViewHooks(currentView: LView): void {
  const viewHooks = currentView.tView.viewHooks;

  if (viewHooks != null) {
    executeLifecycleHooks(currentView, viewHooks);
  }
}

/**
 * Calls all afterContentInit and afterContentChecked hooks for the view, then splices
 * out afterContentInit hooks to prep for the next run in update mode.
 */
export function executeContentHooks(currentView: LView): void {
  const contentHooks = currentView.tView.contentHooks;

  if (currentView.contentHooksCalled === false && contentHooks != null) {
    executeLifecycleHooks(currentView, contentHooks);
    currentView.contentHooksCalled = true;
  }
}

/**
 * Calls lifecycle hooks with their contexts, skipping init hooks if it's not
 * creation mode.
 *
 * @param currentView The current view
 * @param arr The array in which the hooks are found
 */
function executeLifecycleHooks(currentView: LView, arr: HookData): void {
  const data = currentView.data;
  const creationMode = currentView.creationMode;

  for (let i = 0; i < arr.length; i += 2) {
    const flags = arr[i] as number;
    const hook = arr[i | 1] as() => void;
    const initOnly = (flags & LifecycleHookUtils.TYPE_MASK) === LifecycleHook.ON_INIT;
    const instance = data[flags >> LifecycleHookUtils.INDX_SHIFT];
    if (initOnly === false || creationMode) {
      hook.call(instance);
    }
  }
}
