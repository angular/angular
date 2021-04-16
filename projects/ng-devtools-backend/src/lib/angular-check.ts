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

const appHasGlobalNgDebugObject = (): boolean => {
  return typeof ng !== 'undefined';
};

export const getAngularVersion = (): string | null => {
  const el = document.querySelector('[ng-version]');
  if (!el) {
    return null;
  }
  return el.getAttribute('ng-version');
};
