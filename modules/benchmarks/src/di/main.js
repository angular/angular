import * as injector_get_benchmark from './injector_get_benchmark';
import * as injector_get_by_key_benchmark from './injector_get_by_key_benchmark';
import * as injector_get_child_benchmark from './injector_get_child_benchmark';
import * as injector_instantiate_benchmark from './injector_instantiate_benchmark';

import {benchmark, benchmarkStep} from 'benchpress/benchpress';

export function main() {
  benchmark(`Injector.get (token)`, function() {
    benchmarkStep('run', injector_get_benchmark.run);
  });

  benchmark(`Injector.get (key)`, function() {
    benchmarkStep('run', injector_get_by_key_benchmark.run);
  });

  benchmark(`Injector.get (grand x 5 child)`, function() {
    benchmarkStep('run', injector_get_child_benchmark.run);
  });

  benchmark(`Injector.instantiate`, function() {
    benchmarkStep('run', injector_instantiate_benchmark.run);
  });
}
