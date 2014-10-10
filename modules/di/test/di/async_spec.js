import {ddescribe, describe, it, iit, xit, expect, beforeEach} from 'test_lib/test_lib';
import {Injector, Inject, InjectPromise, bind, Key} from 'di/di';
import {Promise, PromiseWrapper} from 'facade/async';

class UserList {
}

function fetchUsers() {
  return PromiseWrapper.resolve(new UserList());
}

class SynchronousUserList {
}

class UserController {
  constructor(list:UserList) {
    this.list = list;
  }
}

class AsyncUserController {
  constructor(@InjectPromise(UserList) userList) {
    this.userList = userList;
  }
}

export function main() {
  describe("async injection", function () {

    describe("asyncGet", function () {
      it('should return a promise', function () {
        var injector = new Injector([
          bind(UserList).toAsyncFactory(fetchUsers)
        ]);
        var p = injector.asyncGet(UserList);
        expect(p).toBePromise();
      });

      it('should return a promise when the binding is sync', function () {
        var injector = new Injector([
          SynchronousUserList
        ]);
        var p = injector.asyncGet(SynchronousUserList);
        expect(p).toBePromise();
      });

      it("should return a promise when the binding is sync (from cache)", function () {
        var injector = new Injector([
          UserList
        ]);
        expect(injector.get(UserList)).toBeAnInstanceOf(UserList);
        expect(injector.asyncGet(UserList)).toBePromise();
      });

      it('should return the injector', function (done) {
        var injector = new Injector([]);
        var p = injector.asyncGet(Injector);
        p.then(function (injector) {
          expect(injector).toBe(injector);
          done();
        });
      });

      it('should return a promise when instantiating a sync binding ' +
      'with an async dependency', function (done) {
        var injector = new Injector([
          bind(UserList).toAsyncFactory(fetchUsers),
          UserController
        ]);

        injector.asyncGet(UserController).then(function (userController) {
          expect(userController).toBeAnInstanceOf(UserController);
          expect(userController.list).toBeAnInstanceOf(UserList);
          done();
        });
      });

      it("should create only one instance (async + async)", function (done) {
        var injector = new Injector([
          bind(UserList).toAsyncFactory(fetchUsers)
        ]);

        var ul1 = injector.asyncGet(UserList);
        var ul2 = injector.asyncGet(UserList);

        PromiseWrapper.all([ul1, ul2]).then(function (uls) {
          expect(uls[0]).toBe(uls[1]);
          done();
        });
      });

      it("should create only one instance (sync + async)", function (done) {
        var injector = new Injector([
          UserList
        ]);

        var promise = injector.asyncGet(UserList);
        var ul = injector.get(UserList);

        expect(promise).toBePromise();
        expect(ul).toBeAnInstanceOf(UserList);

        promise.then(function (ful) {
          expect(ful).toBe(ul);
          done();
        });
      });

      it('should show the full path when error happens in a constructor', function (done) {
        var injector = new Injector([
          UserController,
          bind(UserList).toAsyncFactory(function () {
            throw "Broken UserList";
          })
        ]);

        var promise = injector.asyncGet(UserController);
        PromiseWrapper.then(promise, null, function (e) {
          expect(e.message).toContain("Error during instantiation of UserList! (UserController -> UserList)");
          done();
        });
      });
    });

    describe("get", function () {
      it('should throw when instantiating an async binding', function () {
        var injector = new Injector([
          bind(UserList).toAsyncFactory(fetchUsers)
        ]);

        expect(() => injector.get(UserList))
          .toThrowError('Cannot instantiate UserList synchronously. It is provided as a promise!');
      });

      it('should throw when instantiating a sync binding with an dependency', function () {
        var injector = new Injector([
          bind(UserList).toAsyncFactory(fetchUsers),
          UserController
        ]);

        expect(() => injector.get(UserController))
          .toThrowError('Cannot instantiate UserList synchronously. It is provided as a promise! (UserController -> UserList)');
      });

      it('should resolve synchronously when an async dependency requested as a promise', function () {
        var injector = new Injector([
          bind(UserList).toAsyncFactory(fetchUsers),
          AsyncUserController
        ]);
        var controller = injector.get(AsyncUserController);

        expect(controller).toBeAnInstanceOf(AsyncUserController);
        expect(controller.userList).toBePromise();
      });

      it('should wrap sync dependencies into promises if required', function () {
        var injector = new Injector([
          bind(UserList).toFactory(() => new UserList()),
          AsyncUserController
        ]);
        var controller = injector.get(AsyncUserController);

        expect(controller).toBeAnInstanceOf(AsyncUserController);
        expect(controller.userList).toBePromise();
      });
    });
  });
}