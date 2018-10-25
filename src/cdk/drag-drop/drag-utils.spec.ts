import {moveItemInArray, transferArrayItem, copyArrayItem} from './drag-utils';

describe('dragging utilities', () => {
  describe('moveItemInArray', () => {
    let array: number[];

    beforeEach(() => array = [0, 1, 2, 3]);

    it('should be able to move an item inside an array', () => {
      moveItemInArray(array, 1, 3);
      expect(array).toEqual([0, 2, 3, 1]);
    });

    it('should not do anything if the index is the same', () => {
      moveItemInArray(array, 2, 2);
      expect(array).toEqual([0, 1, 2, 3]);
    });

    it('should handle an index greater than the length', () => {
      moveItemInArray(array, 0, 7);
      expect(array).toEqual([1, 2, 3, 0]);
    });

    it('should handle an index less than zero', () => {
      moveItemInArray(array, 3, -1);
      expect(array).toEqual([3, 0, 1, 2]);
    });
  });

  describe('transferArrayItem', () => {
    it('should be able to move an item from one array to another', () => {
      const a = [0, 1, 2];
      const b = [3, 4, 5];

      transferArrayItem(a, b, 1, 2);
      expect(a).toEqual([0, 2]);
      expect(b).toEqual([3, 4, 1, 5]);
    });

    it('should handle an index greater than the target array length', () => {
      const a = [0, 1, 2];
      const b = [3, 4, 5];

      transferArrayItem(a, b, 0, 7);

      expect(a).toEqual([1, 2]);
      expect(b).toEqual([3, 4, 5, 0]);
    });

    it('should handle an index less than zero', () => {
      const a = [0, 1, 2];
      const b = [3, 4, 5];

      transferArrayItem(a, b, 2, -1);
      expect(a).toEqual([0, 1]);
      expect(b).toEqual([2, 3, 4, 5]);
    });

    it('should not do anything if the source array is empty', () => {
      const a: number[] = [];
      const b = [3, 4, 5];

      transferArrayItem(a, b, 0, 0);
      expect(a).toEqual([]);
      expect(b).toEqual([3, 4, 5]);
    });

  });

  describe('copyArrayItem', () => {
    it('should be able to copy an item from one array to another', () => {
      const a = [0, 1, 2];
      const b = [3, 4, 5];

      copyArrayItem(a, b, 1, 2);
      expect(a).toEqual([0, 1, 2 ]);
      expect(b).toEqual([3, 4, 1, 5]);
    });

    it('should handle an index greater than the target array length', () => {
      const a = [0, 1, 2];
      const b = [3, 4, 5];

      copyArrayItem(a, b, 0, 7);

      expect(a).toEqual([0, 1, 2]);
      expect(b).toEqual([3, 4, 5, 0]);
    });

    it('should handle an index less than zero', () => {
      const a = [0, 1, 2];
      const b = [3, 4, 5];

      copyArrayItem(a, b, 2, -1);
      expect(a).toEqual([0, 1, 2]);
      expect(b).toEqual([2, 3, 4, 5]);
    });

    it('should not do anything if the source array is empty', () => {
      const a: number[] = [];
      const b = [3, 4, 5];

      copyArrayItem(a, b, 0, 0);
      expect(a).toEqual([]);
      expect(b).toEqual([3, 4, 5]);
    });

  });

});
