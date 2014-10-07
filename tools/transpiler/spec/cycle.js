import {foo} from './cycle_spec';

export function cycle() {
  return foo;
}
