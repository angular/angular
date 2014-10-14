import {ddescribe, describe, it, iit, expect} from 'test_lib/test_lib';
import {Key, Inject, DependencyAnnotation} from 'di/di';
import {CONST} from 'facade/lang';
import {reflector, Token} from 'di/reflector';

class Parent extends DependencyAnnotation {
  @CONST()
  constructor() {
  }
}

export function main() {
  describe("reflector", function () {
    describe("dependencies", function () {
      it('should collect annotations implementing DependencyAnnotation as properties', function () {
        function f(@Parent() arg:Function) {}

        var dep = reflector.dependencies(f)[0];
        expect(dep.properties[0]).toBeAnInstanceOf(Parent);
      });
    });
  });
}