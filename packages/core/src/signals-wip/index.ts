import {Signal, signal} from '../core_reactivity_export_internal';

export interface InputOptions {
  required?: boolean;
  alias?: string;
  // TODO: transform
}

// WIP starting point
export function input<T>(defaultVal: T, opts?: InputOptions): Signal<T> {
  return signal(defaultVal);
}
