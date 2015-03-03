import { bind, OpaqueToken } from 'angular2/di';

export class Options {
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
  /**
   * Number of iterations that run inside the browser by user code.
   * Used for micro benchmarks.
   **/
  static get MICRO_ITERATIONS() { return _MICRO_ITERATIONS; }
}

var _SAMPLE_ID = new OpaqueToken('Options.sampleId');
var _DEFAULT_DESCRIPTION = new OpaqueToken('Options.defaultDescription');
var _SAMPLE_DESCRIPTION = new OpaqueToken('Options.sampleDescription');
var _FORCE_GC = new OpaqueToken('Options.forceGc');
var _PREPARE = new OpaqueToken('Options.prepare');
var _EXECUTE = new OpaqueToken('Options.execute');
var _CAPABILITIES = new OpaqueToken('Options.capabilities');
var _USER_AGENT = new OpaqueToken('Options.userAgent');
var _MICRO_ITERATIONS = new OpaqueToken('Options.microIterations');
