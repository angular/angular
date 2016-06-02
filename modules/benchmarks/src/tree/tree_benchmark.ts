import {bootstrap} from 'angular2/platform/browser';
import {benchmarkMain, AppComponent} from './tree_benchmark_common';

export function main() {
  benchmarkMain(() => bootstrap(AppComponent));
}
