import {
  describe,
  expect,
  it,
} from 'angular2/testing_internal';

import {ResponseOptions} from 'angular2/src/http/base_response_options';
import {Response} from 'angular2/src/http/static_response';



export function main() {
  describe('Response', () => {
    it('should be ok for 200 statuses', () => {
      expect(new Response(new ResponseOptions({status: 200})).ok).toEqual(true);
      expect(new Response(new ResponseOptions({status: 299})).ok).toEqual(true);
    });

    it('should not be ok for non 200 statuses', () => {
      expect(new Response(new ResponseOptions({status: 199})).ok).toEqual(false);
      expect(new Response(new ResponseOptions({status: 300})).ok).toEqual(false);
    });
  });
}
