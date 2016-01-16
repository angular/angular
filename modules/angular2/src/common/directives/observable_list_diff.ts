// TS does not have Observables

// I need to be here to make TypeScript think this is a module.
import {} from 'angular2/src/facade/lang';

/**
 * This module exists in Dart, but not in Typescript. This exported symbol
 * is only here to help Typescript think this is a module.
 */
export var workaround_empty_observable_list_diff: any;
