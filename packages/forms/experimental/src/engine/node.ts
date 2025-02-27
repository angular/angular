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

import {computed, linkedSignal, Signal, signal, WritableSignal} from '@angular/core';
import {deepSignal} from './deep_signal';
import {formProxy} from './field';
import {LogicNode} from './logic';

export class FormNode {
  readonly proxy = formProxy(this);

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

  readonly disabled: Signal<boolean> = computed(
    () => (this.parent?.disabled() || this.logic?.disabled?.(this)) ?? false,
  );

  private readonly childrenMap: Signal<Map<PropertyKey, FormNode>>;

  constructor(
    readonly value: WritableSignal<unknown>,
    readonly parent?: FormNode,
    private readonly logic?: LogicNode,
    private readonly wrap = (n: FormNode) => n,
  ) {
    this.childrenMap = linkedSignal<unknown, Map<PropertyKey, FormNode>>({
      source: this.value,
      computation: (data, previous) => {
        const map = previous?.value ?? new Map<PropertyKey, FormNode>();
        if (isObject(data)) {
          for (const key of map.keys()) {
            if (!data.hasOwnProperty(key)) {
              map.delete(key);
            }
          }

          for (const key of Object.keys(data)) {
            if (!map.has(key)) {
              let childLogic: LogicNode | undefined;
              if (Array.isArray(data)) {
                // TODO: other dynamic data
                childLogic = this.logic?.element;
              } else {
                childLogic = this.logic?.children.get(key);
              }
              map.set(key, new FormNode(deepSignal(this.value, key as never), this, childLogic));
            }
          }
        }
        return map;
      },
      equal: () => false,
    });
  }

  markAsTouched(): void {
    this._touched.set(true);
  }

  getChild(key: PropertyKey): FormNode | undefined {
    return this.childrenMap().get(typeof key === 'number' ? key.toString() : key);
  }
}

function isObject(data: unknown): data is Record<PropertyKey, unknown> {
  return typeof data === 'object';
}
