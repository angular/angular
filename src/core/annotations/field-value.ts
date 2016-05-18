/**
 * Annotation Factory that allows HTML style boolean attributes. For example,
 * a field declared like this:

 * @Directive({ selector: 'component' }) class MyComponent {
 *   @Input() @BooleanFieldValueFactory() myField: boolean;
 * }
 *
 * You could set it up this way:
 *   <component myField>
 * or:
 *   <component myField="">
 */
function booleanFieldValueFactory() {
  return function booleanFieldValueMetadata(target: any, key: string): void {
    const defaultValue = target[key];
    const localKey = `__md_private_symbol_${key}`;
    target[localKey] = defaultValue;

    Object.defineProperty(target, key, {
      get() { return (<any>this)[localKey]; },
      set(value: boolean) {
        (<any>this)[localKey] = value != null && `${value}` !== 'false';
      }
    });
  };
}


export { booleanFieldValueFactory as BooleanFieldValue };
