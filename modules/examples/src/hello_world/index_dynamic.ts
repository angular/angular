import {HelloCmp} from './index_common';
import {bootstrap} from 'angular2/bootstrap';

// This entry point is not transformed and exists for testing dynamic runtime
// mode.
export function main() {
  bootstrap(HelloCmp);
}
