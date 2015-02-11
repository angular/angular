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
}

var _SAMPLE_ID = new OpaqueToken('SampleDescription.sampleId');
var _DEFAULT_DESCRIPTION = new OpaqueToken('SampleDescription.defaultDescription');
var _SAMPLE_DESCRIPTION = new OpaqueToken('SampleDescription.sampleDescription');
var _FORCE_GC = new OpaqueToken('Sampler.forceGc');
var _PREPARE = new OpaqueToken('Sampler.prepare');
var _EXECUTE = new OpaqueToken('Sampler.execute');
