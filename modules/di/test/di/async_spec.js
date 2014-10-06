import {ddescribe, describe, it, iit, xit, expect, beforeEach} from 'test_lib/test_lib';
import {Injector, Inject, InjectFuture, bind, Key} from 'di/di';
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

class AsyncUserController {
  constructor(@InjectFuture(UserList) userList) {
    this.userList = userList;
  }
}

export function main () {
  describe("async injection", function () {

    describe("asyncGet", function () {
      it('should return a future', function() {
        var injector = new Injector([
          bind(UserList).toAsyncFactory([], fetchUsers)
        ]);
        var p = injector.asyncGet(UserList);
        expect(p).toBeFuture();
      });

      it('should return a future when if the binding is sync', function() {
        var injector = new Injector([
          SynchronousUserList
        ]);
        var p = injector.asyncGet(SynchronousUserList);
        expect(p).toBeFuture();
      });

      it('should return the injector', function() {
        var injector = new Injector([]);
        var p = injector.asyncGet(Injector);
        expect(p).toBeFuture();
      });

      it('should return a future when instantiating a sync binding ' +
        'with an async dependency', function(done) {
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

      it("should return a future when the binding is sync from cache", function () {
        var injector = new Injector([
          UserList
        ]);
        expect(injector.get(UserList)).toBeAnInstanceOf(UserList);
        expect(injector.asyncGet(UserList)).toBeFuture();
      });

      it("should create only one instance (async + async)", function (done) {
        var injector = new Injector([
          bind(UserList).toAsyncFactory([], fetchUsers)
        ]);

        var ul1 = injector.asyncGet(UserList);
        var ul2 = injector.asyncGet(UserList);

        FutureWrapper.wait([ul1, ul2]).then(function (uls) {
          expect(uls[0]).toBe(uls[1]);
          done();
        });
      });

      it("should create only one instance (sync + async)", function (done) {
        var injector = new Injector([
          UserList
        ]);

        var future = injector.asyncGet(UserList);
        var ul = injector.get(UserList);

        expect(future).toBeFuture();
        expect(ul).toBeAnInstanceOf(UserList);

        future.then(function (ful) {
          expect(ful).toBe(ul);
          done();
        });
      });
    });

    describe("get", function () {
      it('should throw when instantiating an async binding', function() {
        var injector = new Injector([
          bind(UserList).toAsyncFactory([], fetchUsers)
        ]);

        expect(() => injector.get(UserList))
          .toThrowError('Cannot instantiate UserList synchronously. It is provided as a future!');
      });

      it('should throw when instantiating a sync binding with an dependency', function() {
        var injector = new Injector([
          bind(UserList).toAsyncFactory([], fetchUsers),
          UserController
        ]);

        expect(() => injector.get(UserController))
          .toThrowError('Cannot instantiate UserList synchronously. It is provided as a future! (UserController -> UserList)');
      });

      it('should resolve synchronously when an async dependency requested as a future', function() {
        var injector = new Injector([
          bind(UserList).toAsyncFactory([], fetchUsers),
          AsyncUserController
        ]);
        var controller = injector.get(AsyncUserController);

        expect(controller).toBeAnInstanceOf(AsyncUserController);
        expect(controller.userList).toBeFuture();
      });

      it('should wrap sync dependencies into futures if required', function() {
        var injector = new Injector([
          bind(UserList).toFactory([], () => new UserList()),
          AsyncUserController
        ]);
        var controller = injector.get(AsyncUserController);

        expect(controller).toBeAnInstanceOf(AsyncUserController);
        expect(controller.userList).toBeFuture();
      });
    });
  });
}