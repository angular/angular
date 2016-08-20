/**
 * Converts a given target to a path relative to cwd.
 */
export function targetToPath(target: string): string {
  if (target.substr(0, '//'.length) === '//') {
    target = target.substr(2);
  }

  if (target[0] === ':') {
    target = target.substr(1);
  }

  return target.replace(':', '/');
}

export function isMainWorkspace(target: string): boolean {
  return MAIN_WORKSPACE_PATTERN.test(target);
}

const MAIN_WORKSPACE_PATTERN = /^\/\//;

export function debounce(fn: Function, delay: number = 200): DebouncedFunction {
  let timeout: number = null;
  const ret = <DebouncedFunction>function debouncer() {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(fn.bind(this), delay);
  };

  ret.cancel = function cancel() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return ret;
}

export interface DebouncedFunction {
  (...args: any[]): any;
  cancel(): void;
}

/**
 * Find the difference between the two input arrays, considering them as sets of
 * strings.
 */
export function difference(
    oldArray: string[], newArray: string[]): {removed: string[], added: string[]} {
  const newMap: {[key: string]: boolean} = {};
  for (const i of oldArray) {
    newMap[i] = false;
  }

  const added: string[] = [];
  const removed: string[] = [];

  for (const i of newArray) {
    if (!(i in newMap)) {
      added.push(i);
    }
    newMap[i] = true;
  }

  for (const i in newMap) {
    if (!newMap[i]) {
      removed.push(i);
    }
  }

  return {removed, added};
}
