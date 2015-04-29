import {global} from 'angular2/src/facade/lang';

// HACK: workaround for Traceur behavior.
// It expects all transpiled modules to contain this marker.
// TODO: remove this when we no longer use traceur
export var __esModule = true;

export var Math = global.Math;
export var NaN = global.NaN;
