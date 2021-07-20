declare const ng: any;

export const appIsAngularInDevMode = (): boolean => {
  return appIsAngular() && appHasGlobalNgDebugObject();
};

export const appIsAngularIvy = (): boolean => {
  return typeof (window as any).getAllAngularRootElements?.()?.[0]?.__ngContext__ !== 'undefined';
};

export const appIsAngular = (): boolean => {
  return !!getAngularVersion();
};

export const appIsSupportedAngularVersion = (): boolean => {
  const version = getAngularVersion();
  if (!version) {
    return false;
  }
  const major = parseInt(version.toString().split('.')[0], 10);
  return appIsAngular() && (major >= 9 || major === 0);
};

/**
 * We check if the global `window.ng` is an object and if this object
 * has the `getComponent` or `probe` methods attached to it.
 *
 * `ng.probe` is a view engine method, but to ensure that we correctly
 * detect development mode we need to consider older rendering engines.
 *
 * In some g3 apps processed with Closure, `ng` is a function,
 * which means that `typeof ng !== 'undefined'` is not a sufficient check.
 *
 * @returns if the app has global ng debug object
 */
const appHasGlobalNgDebugObject = (): boolean => {
  return typeof ng === 'object' &&
      (typeof ng.getComponent === 'function' || typeof ng.probe === 'function');
};

export const getAngularVersion = (): string|null => {
  const el = document.querySelector('[ng-version]');
  if (!el) {
    return null;
  }
  return el.getAttribute('ng-version');
};
