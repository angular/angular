import {describe, ddescribe, it, iit, xit, xdescribe, expect, beforeEach} from 'angular2/test_lib';
import {Testability} from 'angular2/src/core/testability/testability';


export function main() {
  describe('Testability', () => {
    var testability, executed;

    beforeEach(() => {
      testability = new Testability();
      executed = false;
    });

    it('should start with a pending count of 0',
       () => { expect(testability.getPendingCount()).toEqual(0); });

    it('should fire whenstable callbacks if pending count is 0', () => {
      testability.whenStable(() => executed = true);
      expect(executed).toBe(true);
    });

    it('should not call whenstable callbacks when there are pending counts', () => {
      testability.increaseCount(2);
      testability.whenStable(() => executed = true);

      expect(executed).toBe(false);
      testability.increaseCount(-1);
      expect(executed).toBe(false);
    });

    it('should fire whenstable callbacks when pending drops to 0', () => {
      testability.increaseCount(2);
      testability.whenStable(() => executed = true);

      expect(executed).toBe(false);

      testability.increaseCount(-2);
      expect(executed).toBe(true);
    });
  });
}
