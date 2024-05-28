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
    const nodes = [1, 2, 3, 4, 5].map((ID) => ({
      type: 'SIGNAL',
      ID,
      innerValue: 'the value',
      getValue: undefined,
      setValue: undefined,
      dependents: new Set(),
      signalHandle: undefined,
    }));
    for (const node of nodes) {
      signalBroker.publish('node-add', node);
    }

    signalBroker.publish('link-add', {provider: nodes[0], consumer: nodes[1]});
    signalBroker.publish('link-add', {provider: nodes[0], consumer: nodes[2]});
    signalBroker.publish('link-add', {provider: nodes[2], consumer: nodes[3]});
    signalBroker.publish('link-add', {provider: nodes[2], consumer: nodes[4]});

    initializeGraph(signalBroker);
  }
}
