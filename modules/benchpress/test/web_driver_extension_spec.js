import {ddescribe, describe, it, iit, xit, expect, beforeEach, afterEach} from 'angular2/test_lib';

import { StringMap, ListWrapper } from 'angular2/src/facade/collection';
import { isPresent, StringWrapper } from 'angular2/src/facade/lang';
import { PromiseWrapper } from 'angular2/src/facade/async';

import { WebDriverExtension, bind, Injector, Options } from 'benchpress/common';

export function main() {
  function createExtension(ids, userAgent) {
    return new Injector([
      ListWrapper.map(ids, (id) => bind(id).toValue(new MockExtension(id)) ),
      bind(Options.USER_AGENT).toValue(userAgent),
      WebDriverExtension.bindTo(ids)
    ]).asyncGet(WebDriverExtension);
  }

  describe('WebDriverExtension.bindTo', () => {

    it('should bind the extension that matches the userAgent', (done) => {
      createExtension(['m1', 'm2', 'm3'], 'm2').then( (m) => {
        expect(m.id).toEqual('m2');
        done();
      });
    });

    it('should throw if there is no match', (done) => {
      PromiseWrapper.catchError(
        createExtension(['m1'], 'm2'),
        (err) => {
          expect(isPresent(err)).toBe(true);
          done();
        }
      );
    });

  });
}

class MockExtension extends WebDriverExtension {
  id:string;

  constructor(id) {
    super();
    this.id = id;
  }

  supports(userAgent:string):boolean {
    return StringWrapper.equals(userAgent, this.id);
  }
}
