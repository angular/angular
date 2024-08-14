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

@Component({
  selector: 'ng-signal-graph',
  template: `
      SIGNAL GRAPH GOES HERE
      <span id="graph"></span>
    `,
  styles: [``],
  standalone: true,
  imports: [],
})
export class SignalGraphComponent {
  ngOnInit() {
    initializeGraph(signalBroker);

    const exampleGraphDefinition = {
      edges: [
        {from: 0, to: 1},
        {from: 0, to: 2},
        {from: 0, to: 3},
        {from: 2, to: 1},
        {from: 3, to: 4},
        {from: 3, to: 2},
        {from: 3, to: 5},
        {from: 6, to: 1},
        {from: 6, to: 2},
      ],
      nodes: [
        {label: 'app-sample-properties', value: 'ref to Component', type: 'TEMPLATE'},
        {label: 'basicSignal', value: 123, type: 'SIGNAL'},
        {label: 'computedSignal', value: 15129, type: 'COMPUTED'},
        {label: 'computedObject', value: {value: 123}, type: 'COMPUTED'},
        {label: 'signalObject', value: {another: 'value'}, type: 'SIGNAL'},
        {label: 'outsideSignal', value: 'signal located outside of the component', type: 'SIGNAL'},
        {label: 'effect', value: 'ref to Effect', type: 'EFFECT'},
      ],
    };

    signalBroker.publish('nodes-set', exampleGraphDefinition.nodes);
    signalBroker.publish('edges-set', exampleGraphDefinition.edges);
  }
}
