import {bind, provide, Provider, OpaqueToken} from 'angular2/src/core/di';
import {DateWrapper} from 'angular2/src/core/facade/lang';

export class Options {
  static get DEFAULT_PROVIDERS(): Provider[] { return _DEFAULT_PROVIDERS; }
  // TODO(tbosch): use static initializer when our transpiler supports it
  static get SAMPLE_ID() { return _SAMPLE_ID; }
  // TODO(tbosch): use static initializer when our transpiler supports it
  static get DEFAULT_DESCRIPTION() { return _DEFAULT_DESCRIPTION; }
  // TODO(tbosch): use static initializer when our transpiler supports it
  static get SAMPLE_DESCRIPTION() { return _SAMPLE_DESCRIPTION; }
  // TODO(tbosch): use static initializer when our transpiler supports it
  static get FORCE_GC() { return _FORCE_GC; }
  // TODO(tbosch): use static initializer when our transpiler supports it
  static get PREPARE() { return _PREPARE; }
  // TODO(tbosch): use static initializer when our transpiler supports it
  static get EXECUTE() { return _EXECUTE; }
  // TODO(tbosch): use static initializer when our transpiler supports it
  static get CAPABILITIES() { return _CAPABILITIES; }
  // TODO(tbosch): use static initializer when our transpiler supports it
  static get USER_AGENT() { return _USER_AGENT; }
  // TODO(tbosch): use static initializer when our transpiler supports it
  static get NOW() { return _NOW; }
  // TODO(tbosch): use static values when our transpiler supports them
  static get WRITE_FILE() { return _WRITE_FILE; }
  // TODO(tbosch): use static values when our transpiler supports them
  static get MICRO_METRICS() { return _MICRO_METRICS; }
  // TODO(tbosch): use static values when our transpiler supports them
  static get CAPTURE_FRAMES() { return _CAPTURE_FRAMES; }
}

var _SAMPLE_ID = new OpaqueToken('Options.sampleId');
var _DEFAULT_DESCRIPTION = new OpaqueToken('Options.defaultDescription');
var _SAMPLE_DESCRIPTION = new OpaqueToken('Options.sampleDescription');
var _FORCE_GC = new OpaqueToken('Options.forceGc');
var _PREPARE = new OpaqueToken('Options.prepare');
var _EXECUTE = new OpaqueToken('Options.execute');
var _CAPABILITIES = new OpaqueToken('Options.capabilities');
var _USER_AGENT = new OpaqueToken('Options.userAgent');
var _MICRO_METRICS = new OpaqueToken('Options.microMetrics');
var _NOW = new OpaqueToken('Options.now');
var _WRITE_FILE = new OpaqueToken('Options.writeFile');
var _CAPTURE_FRAMES = new OpaqueToken('Options.frameCapture');

var _DEFAULT_PROVIDERS = [
  bind(_DEFAULT_DESCRIPTION)
      .toValue({}),
  provide(_SAMPLE_DESCRIPTION, {asValue: {}}),
  provide(_FORCE_GC, {asValue: false}),
  provide(_PREPARE, {asValue: false}),
  provide(_MICRO_METRICS, {asValue: {}}),
  provide(_NOW, {asValue: () => DateWrapper.now()}),
  provide(_CAPTURE_FRAMES, {asValue: false})
];
