import {Signal, signal} from '../core_reactivity_export_internal';

export interface InputOptions {
  required?: boolean;
  alias?: string;
  // TODO: transform
}

export interface InputOptionsWithInitialValue<T> extends InputOptions {
  initialValue?: T;
}

// it transforms our specific types into primitive origins
type toPrimitive<T> =
    T extends string ? string : T extends number ? number : T extends boolean ? boolean : T;

type primitiveValue = string|number|boolean|BigInt|undefined|null|Symbol

export function input<T>(): Signal<T|undefined>;
export function input<T>(opts: InputOptionsWithInitialValue<T>): Signal<T>;
export function input<T extends primitiveValue>(
    defaultVal: T, opts?: InputOptions): Signal<toPrimitive<T>>;

export function input<T extends primitiveValue|InputOptionsWithInitialValue<Y>, Y>(
    defaultValOrOpts?: T, opts?: InputOptions): Signal<T> {
  // TODO(signals): implement
  return signal(
             typeof defaultValOrOpts === 'object' ?
                 (defaultValOrOpts as InputOptionsWithInitialValue<T>).initialValue :
                 defaultValOrOpts) as unknown as Signal<T>;
}
