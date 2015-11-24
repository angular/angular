import { isBlank } from 'angular2/src/facade/lang';
export var DOM = null;
export function setRootDomAdapter(adapter) {
    if (isBlank(DOM)) {
        DOM = adapter;
    }
}
/* tslint:disable:requireParameterType */
/**
 * Provides DOM operations in an environment-agnostic way.
 */
export class DomAdapter {
}
