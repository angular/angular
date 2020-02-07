declare const ng: any;

export const appIsAngularInDevMode = (): boolean => {
  return appIsAngular() && appHasGlobalNgDebugObject();
};

export const appIsAngularInProdMode = (): boolean => {
  return appIsAngular() && !appHasGlobalNgDebugObject();
};

export const appIsAngular = (): boolean => {
  return !!getAngularVersion();
};

export const appIsSupportedAngularVersion = (): boolean => {
  return appIsAngular() && +getAngularVersion().toString().split('.')[0] >= 9;
};

const appHasGlobalNgDebugObject = (): boolean => {
  return typeof ng !== 'undefined';
};

export const getAngularVersion = (): string | null | boolean => {
  const el = document.querySelector('[ng-version]');
  if (!el) {
    return false;
  }
  return el.getAttribute('ng-version');
};
