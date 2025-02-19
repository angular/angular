/*

- Tree of form nodes

     *     (form root) 
    / \
   *   *   (children of the root)
  / \
 *   *     (their children)

- What is a node then?

  - 1:1 with "values" in the user's data model

  model: {
    passwords: {
      pw: '',
      confirm: '',
    }
    addresses: [ // disabled
      // disabled = computed(() => parent().elementLogic.disabled(this))
      {id: 456, street: 'broadway', city: 'ny'}    * node B
      {id: 123, street: 'market', city: 'sf'},     * node A
      ],
      staleAddresses: [
    ]
    birthday: new Date()
  }

  disable the first address

  rule(addr[0] // not a node).
  rule(elementWithIndex(addr, 0), disable(() => true));


  - aggregates and presents derived state (validity, disabled, etc.)
  - owns its own UI state (touched, dirty)

  - manage / give access to their children
    - container for children
    - tracking child nodes
    - 

*/

import {computed, signal, WritableSignal} from '@angular/core';
import {deepSignal} from './deep_signal';

export class FormNode {
  private _touched = signal(false);

  // touched = my touched touched state + any(my children touched state)
  readonly touched = computed(() => {
    if (this._touched()) {
      return true;
    }

    for (const node of this.childrenMap().values()) {
      if (node.touched()) {
        return true;
      }
    }

    return false;
  });
  // TODO(kirjs): ReactiveMap?

  // private readonly childrenMap = signal(new Map<PropertyKey, FormNode>(), {equal: () => false});
  private readonly childrenMap = computed(() => {
    const map = new Map<PropertyKey, FormNode>();
    // TODO: add child nodes to the map
    return map;
  });

  constructor(readonly value: WritableSignal<unknown>) {}

  markAsTouched(): void {
    this._touched.set(true);
  }

  getChild(key: PropertyKey): FormNode | undefined {
    const data = this.value();
    if (isObject(data) && data.hasOwnProperty(key)) {
      return this.childrenMap().get(key);
    } else {
      return undefined;
    }
  }
}

function isObject(data: unknown): data is Record<PropertyKey, unknown> {
  return typeof data === 'object';
}
