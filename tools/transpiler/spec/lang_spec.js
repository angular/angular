import {describe, it, expect} from 'test_lib/test_lib';

export function main() {
  describe('lang', function() {
    it('string interpolation', function() {
      expect(`${123}-'${456}"`).toEqual('123-\'456"');
    });
  });
}
