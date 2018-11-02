/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$} from 'protractor';

export const CreateBtn = '#createDom';
export const DestroyBtn = '#destroyDom';
export const DetectChangesBtn = '#detectChanges';
export const RootEl = '#root';
export const NumberOfChecksEl = '#numberOfChecks';

export interface Benchmark {
  id: string;
  url: string;
  buttons: string[];
  ignoreBrowserSynchronization?: boolean;
  extraParams?: {name: string, value: any}[];
}

const CreateDestroyButtons: string[] = [CreateBtn, DestroyBtn];
const CreateDestroyDetectChangesButtons: string[] = [...CreateDestroyButtons, DetectChangesBtn];

export const Benchmarks: Benchmark[] = [
  {
    id: `deepTree.ng2`,
    url: 'all/benchmarks/src/tree/ng2/index.html',
    buttons: CreateDestroyDetectChangesButtons,
  },
  {
    id: `deepTree.ng2.next`,
    url: 'all/benchmarks/src/tree/ng2_next/index.html',
    buttons: CreateDestroyDetectChangesButtons,
    ignoreBrowserSynchronization: true,
    // Can't use bundles as we use non exported code
    extraParams: [{name: 'bundles', value: false}]
  },
  {
    id: `deepTree.ng2.static`,
    url: 'all/benchmarks/src/tree/ng2_static/index.html',
    buttons: CreateDestroyButtons,
  },
  {
    id: `deepTree.ng2_switch`,
    url: 'all/benchmarks/src/tree/ng2_switch/index.html',
    buttons: CreateDestroyButtons,
  },
  {
    id: `deepTree.ng2.render3_function`,
    url: 'all/benchmarks/src/tree/render3_function/index.html',
    buttons: CreateDestroyDetectChangesButtons,
    ignoreBrowserSynchronization: true,
  },
  {
    id: `deepTree.iv`,
    url: 'all/benchmarks/src/tree/iv/index.html',
    buttons: CreateDestroyDetectChangesButtons,
    ignoreBrowserSynchronization: true,
  },
  {
    id: `deepTree.baseline`,
    url: 'all/benchmarks/src/tree/baseline/index.html',
    buttons: CreateDestroyButtons,
    ignoreBrowserSynchronization: true,
  },
  {
    id: `deepTree.incremental_dom`,
    url: 'all/benchmarks/src/tree/incremental_dom/index.html',
    buttons: CreateDestroyButtons,
    ignoreBrowserSynchronization: true,
  },
  {
    id: `deepTree.polymer`,
    url: 'all/benchmarks/src/tree/polymer/index.html',
    buttons: CreateDestroyButtons,
    ignoreBrowserSynchronization: true,
  },
  {
    id: `deepTree.polymer_leaves`,
    url: 'all/benchmarks/src/tree/polymer_leaves/index.html',
    buttons: CreateDestroyButtons,
    ignoreBrowserSynchronization: true,
  },
  {
    id: `deepTree.ng1`,
    url: 'all/benchmarks/src/tree/ng1/index.html',
    buttons: CreateDestroyDetectChangesButtons,
  }
];
