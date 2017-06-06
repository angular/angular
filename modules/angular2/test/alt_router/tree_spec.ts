import {
  ComponentFixture,
  AsyncTestCompleter,
  TestComponentBuilder,
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  beforeEachProviders,
  it,
  xit
} from 'angular2/testing_internal';

import {Tree} from 'angular2/src/alt_router/segments';

export function main() {
  describe('tree', () => {
    it("should return the root of the tree", () => {
      let t = new Tree<any>([1, 2, 3]);
      expect(t.root).toEqual(1);
    });

    it("should return the parent of a node", () => {
      let t = new Tree<any>([1, 2, 3]);
      expect(t.parent(1)).toEqual(null);
      expect(t.parent(2)).toEqual(1);
    });

    it("should return the children of a node", () => {
      let t = new Tree<any>([1, 2, 3]);
      expect(t.children(1)).toEqual([2]);
    });

    it("should return the path to the root", () => {
      let t = new Tree<any>([1, 2, 3]);
      expect(t.pathToRoot(2)).toEqual([1, 2]);
    });
  });
}