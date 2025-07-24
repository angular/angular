export function CustomClassDecorator(): ClassDecorator {
  return (clazz) => clazz;
}

export function CustomPropDecorator(): PropertyDecorator {
  return () => {};
}

export function CustomParamDecorator(): (target: Object, ...rest: any[]) => void {
  return () => {};
}
