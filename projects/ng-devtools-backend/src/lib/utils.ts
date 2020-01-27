export const runOutsideAngular = (f: () => any) => {
  const w = window as any;
  if (!w.Zone || w.Zone.current._name !== 'angular') {
    return;
  }
  w.Zone.current._parent.run(f);
};

export const componentMetadata = (instance: any) => instance.constructor['ɵcmp'];
