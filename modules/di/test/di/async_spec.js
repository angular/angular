import {ddescribe, describe, it, iit, xit, expect, beforeEach} from 'test_lib/test_lib';
import {Injector, Inject, bind, Key} from 'di/di';
import {Future, FutureWrapper} from 'facade/async';

class UserList {}

function fetchUsers() {
  return FutureWrapper.value(new UserList());
}

class SynchronousUserList {}


class UserController {
  constructor(list:UserList) {
    this.list = list;
  }
}

export function main () {
  describe("async injection", function () {
    it('should return a future', function() {
      var injector = new Injector([
        bind(UserList).toAsyncFactory([], fetchUsers)
      ]);
      var p = injector.asyncGet(UserList);
      expect(p).toBeFuture();
    });

    it('should throw when instantiating async provider synchronously', function() {
      var injector = new Injector([
        bind(UserList).toAsyncFactory([], fetchUsers)
      ]);

      expect(() => injector.get(UserList))
        .toThrowError('Cannot instantiate UserList synchronously. It is provided as a future!');
    });

    it('should return a future even if the provider is sync', function() {
      var injector = new Injector([
        SynchronousUserList
      ]);
      var p = injector.asyncGet(SynchronousUserList);
      expect(p).toBeFuture();
    });

    it('should provide itself', function() {
      var injector = new Injector([]);
      var p = injector.asyncGet(Injector);
      expect(p).toBeFuture();
    });

    it('should return a future when a dependency is async', function(done) {
      var injector = new Injector([
        bind(UserList).toAsyncFactory([], fetchUsers),
        UserController
      ]);

      injector.asyncGet(UserController).then(function(userController) {
        expect(userController).toBeAnInstanceOf(UserController);
        expect(userController.list).toBeAnInstanceOf(UserList);
        done();
      });
    });

    it('should throw when a dependency is async', function() {
      var injector = new Injector([
        bind(UserList).toAsyncFactory([], fetchUsers),
        UserController
      ]);

      expect(() => injector.get(UserController))
        .toThrowError('Cannot instantiate UserList synchronously. It is provided as a future! (UserController -> UserList)');
    });

    // resolve exceptions and async
  });
}