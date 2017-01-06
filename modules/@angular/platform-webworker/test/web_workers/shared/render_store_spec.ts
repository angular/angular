/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RenderStore} from '@angular/platform-webworker/src/web_workers/shared/render_store';

export function main() {
  describe('RenderStoreSpec', () => {
    let store: RenderStore;
    beforeEach(() => { store = new RenderStore(); });

    it('should allocate ids', () => {
      expect(store.allocateId()).toBe(0);
      expect(store.allocateId()).toBe(1);
    });

    it('should serialize objects', () => {
      const id = store.allocateId();
      const obj = 'testObject';
      store.store(obj, id);
      expect(store.serialize(obj)).toBe(id);
    });

    it('should deserialize objects', () => {
      const id = store.allocateId();
      const obj = 'testObject';
      store.store(obj, id);
      expect(store.deserialize(id)).toBe(obj);
    });

  });
}
