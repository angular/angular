/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {initializeGraph} from './signal-graph-builder';
import {signalBroker} from './MessageBroker';
import {DebugSignalGraph} from './signal-graph-types';

@Component({
  selector: 'ng-signal-graph',
  template: `
      <span id="graph"></span>
    `,
  standalone: true,
})
export class SignalGraphComponent {
  ngOnInit() {
    initializeGraph(signalBroker);

    const exampleGraphDefinition: DebugSignalGraph<unknown> = {
      edges: [
        {producer: 1, consumer: 0},
        {producer: 2, consumer: 0},
        {producer: 3, consumer: 0},
        {producer: 1, consumer: 2},
        {producer: 4, consumer: 3},
        {producer: 2, consumer: 3},
        {producer: 5, consumer: 3},
        {producer: 1, consumer: 6},
        {producer: 2, consumer: 6},
      ],
      nodes: [
        {label: 'app-sample-properties', /*value: 'ref to Component',*/ type: 'template'},
        {label: 'basicSignal', value: 123, type: 'signal'},
        {label: 'computedSignal', value: 15129, type: 'computed'},
        {label: 'computedObject', value: {value: 123}, type: 'computed'},
        {label: 'signalObject', value: {another: 'value'}, type: 'signal'},
        {label: 'outsideSignal', value: 'signal located outside of the component', type: 'signal'},
        {label: 'effect', /*value: 'ref to Effect',*/ type: 'effect'},
      ],
    };

    signalBroker.publish('nodes-set', exampleGraphDefinition.nodes);
    signalBroker.publish('edges-set', exampleGraphDefinition.edges);
  }
}
