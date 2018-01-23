
import {LifecycleHooksMap} from './interfaces/definition';
import {LNodeFlags} from './interfaces/node';
import {HookData, LView, TView} from './interfaces/view';


/**
 * Enum used by the lifecycle (l) instruction to determine which lifecycle hook is requesting
 * processing.
 */
export const enum LifecycleHook {
  ON_INIT = 0b00,
  ON_CHECK = 0b01,
  ON_CHANGES = 0b10
}

/** Constants used by lifecycle hooks to determine when and how a hook should be called. */
export const enum LifecycleHookUtils {
  /* Mask used to get the type of the lifecycle hook from flags in hook queue */
  TYPE_MASK = 0b00000000000000000000000000000001,

  /* Shift needed to get directive index from flags in hook queue */
  INDX_SHIFT = 1
}

/**
 * Loops through the directives on a node and queues their afterContentInit,
 * afterContentChecked, and onDestroy hooks, if they exist.
 */
export function queueLifecycleHooks(flags: number, currentView: LView): void {
  // It's necessary to loop through the directives at elementEnd() (rather than storing
  // the hooks at creation time) so we can preserve the current hook order. All hooks
  // for projected components and directives must be called *before* their hosts.
  const size = (flags & LNodeFlags.SIZE_MASK) >> LNodeFlags.SIZE_SHIFT;
  const start = flags >> LNodeFlags.INDX_SHIFT;
  let contentHooks = currentView.contentHooks;
  let cleanup = currentView.cleanup;

  for (let i = start, end = start + size; i < end; i++) {
    const instance = currentView.data[i];
    if (instance.ngAfterContentInit != null) {
      (contentHooks || (currentView.contentHooks = contentHooks = [
       ])).push(LifecycleHook.ON_INIT, instance.ngAfterContentInit, instance);
    }
    if (instance.ngAfterContentChecked != null) {
      (contentHooks || (currentView.contentHooks = contentHooks = [
       ])).push(LifecycleHook.ON_CHECK, instance.ngAfterContentChecked, instance);
    }
    if (instance.ngOnDestroy != null) {
      (cleanup || (currentView.cleanup = cleanup = [])).push(instance.ngOnDestroy, instance);
    }
  }
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
  if (tView.firstTemplatePass && hooks.onInit != null) {
    const hookFlags = index << LifecycleHookUtils.INDX_SHIFT;
    (tView.initHooks || (tView.initHooks = [])).push(hookFlags, hooks.onInit);
  }

  if (tView.firstTemplatePass && hooks.doCheck != null) {
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
    const data = currentView.data;
    const creationMode = currentView.creationMode;

    for (let i = 0; i < initHooks.length; i += 2) {
      const flags = initHooks[i] as number;
      const hook = initHooks[i | 1] as() => void;
      const onInit = (flags & LifecycleHookUtils.TYPE_MASK) === LifecycleHook.ON_INIT;
      const instance = data[flags >> LifecycleHookUtils.INDX_SHIFT];
      if (onInit === false || creationMode) {
        hook.call(instance);
      }
    }
    currentView.initHooksCalled = true;
  }
}

/** Iterates over view hook functions and calls them. */
export function executeViewHooks(data: any[], viewHookStartIndex: number | null): void {
  if (viewHookStartIndex == null) return;
  executeHooksAndRemoveInits(data, viewHookStartIndex);
}

/**
 * Calls all afterContentInit and afterContentChecked hooks for the view, then splices
 * out afterContentInit hooks to prep for the next run in update mode.
 */
export function executeContentHooks(currentView: LView): void {
  if (currentView.contentHooks != null && currentView.contentHooksCalled === false) {
    executeHooksAndRemoveInits(currentView.contentHooks, 0);
    currentView.contentHooksCalled = true;
  }
}

/**
 * Calls lifecycle hooks with their contexts, then splices out any init-only hooks
 * to prep for the next run in update mode.
 *
 * @param arr The array in which the hooks are found
 * @param startIndex The index at which to start calling hooks
 */
function executeHooksAndRemoveInits(arr: any[], startIndex: number): void {
  // Instead of using splice to remove init hooks after their first run (expensive), we
  // shift over the AFTER_CHECKED hooks as we call them and truncate once at the end.
  let checkIndex = startIndex;
  let writeIndex = startIndex;
  while (checkIndex < arr.length) {
    // Call lifecycle hook with its context
    arr[checkIndex + 1].call(arr[checkIndex + 2]);

    if (arr[checkIndex] === LifecycleHook.ON_CHECK) {
      // We know if the writeIndex falls behind that there is an init that needs to
      // be overwritten.
      if (writeIndex < checkIndex) {
        arr[writeIndex] = arr[checkIndex];
        arr[writeIndex + 1] = arr[checkIndex + 1];
        arr[writeIndex + 2] = arr[checkIndex + 2];
      }
      writeIndex += 3;
    }
    checkIndex += 3;
  }

  // Truncate once at the writeIndex
  arr.length = writeIndex;
}
