export const runOutsideAngular = (f: () => any): void => {
  const w = window as any;
  if (!w.Zone || w.Zone.current._name !== 'angular') {
    return;
  }
  w.Zone.current._parent.run(f);
};

export const componentMetadata = (instance: any) => instance.constructor.ɵcmp;

export const patchTemplate = (instance: any, fn: () => void) => {
  const metadata = componentMetadata(instance);
  const original = metadata.template;

  metadata.tView.template = metadata.template = function(): any {
    const result = original.apply(this, arguments);
    fn();
    return result;
  };

  return original;
};
