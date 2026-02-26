/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵMockSharedStylesHost as MockSharedStylesHost} from '@angular/core/testing';

describe('MockSharedStylesHost', () => {
  it('should track active hosts added', () => {
    const host = new MockSharedStylesHost();
    const nodeA = document.createElement('div');
    const nodeB = document.createElement('span');

    host.addHost(nodeA);
    expect(host.getActiveHosts()).toEqual([nodeA]);

    host.addHost(nodeB);
    expect(host.getActiveHosts()).toEqual([nodeA, nodeB]);

    host.removeHost(nodeA);
    expect(host.getActiveHosts()).toEqual([nodeB]);

    host.removeHost(nodeB);
    expect(host.getActiveHosts()).toEqual([]);
  });

  it('should store multiple references of same host', () => {
    const host = new MockSharedStylesHost();
    const node = document.createElement('div');

    host.addHost(node);
    host.addHost(node);
    expect(host.getActiveHosts()).toEqual([node, node]);

    host.removeHost(node);
    expect(host.getActiveHosts()).toEqual([node]);

    host.removeHost(node);
    expect(host.getActiveHosts()).toEqual([]);
  });
});
