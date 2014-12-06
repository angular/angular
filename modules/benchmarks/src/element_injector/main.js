import * as instantiate_benchmark from './instantiate_benchmark';
import * as instantiate_directive_benchmark from './instantiate_directive_benchmark';
import * as instantiate_benchmark_codegen from './instantiate_benchmark_codegen';

import {benchmark, benchmarkStep} from 'benchpress/benchpress';

export function main() {
  benchmark(`ElementInjector.instantiate + instantiateDirectives`, function() {
    benchmarkStep('run', instantiate_benchmark.run);
  });

  benchmark(`ElementInjector.instantiateDirectives`, function() {
    benchmarkStep('run', instantiate_directive_benchmark.run);
  });

  benchmark(`ElementInjector.instantiate + instantiateDirectives (codegen)`, function() {
    benchmarkStep('run', instantiate_benchmark_codegen.run);
  });
}
