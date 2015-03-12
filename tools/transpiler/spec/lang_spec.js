import {describe, it, expect} from 'angular2/test_lib';

export function main() {
  describe('lang', function() {
    it('string interpolation', function() {
      expect(`${123}-'${456}"`).toEqual('123-\'456"');
    });

    it('multiline string', function () {
      expect(`1'
2"`).toEqual('1\'\n2"');
    });
  });
}
