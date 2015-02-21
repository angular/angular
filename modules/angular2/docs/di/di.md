# DI

The DI module/library is a port of [di.js](https://github.com/angular/di.js) (+ the best parts of [di.dart](https://github.com/angular/di.dart)) to ES6+A.

## Core Abstractions

The library is built on top of the following core abstractions: `Injector`, `Binding`, and `Dependency`.

* An injector resolves dependencies and creates objects.
* A binding maps a token to a factory function and a list of dependencies. So a binding defines how to create an object. A binding can be synchronous or asynchronous.
* A dependency points to a token and contains extra information on how the object corresponding to that token should be injected.

```
[Injector]
    |
    |
    |*
[Binding]
   |----------|-----------------|
   |          |                 |*
[Token]    [FactoryFn]     [Dependency]
                               |---------|
                               |         |
                            [Token]   [Flags]
```



#### Key and Token

Any object can be a token. For performance reasons, however, DI does not deal with tokens directly, and, instead, wraps every token into a Key. See the section on "Key" to learn more.



## Example

```
class Engine {
}

class Car {
	constructor(@Inject(Engine) engine) {
	}
}

var inj = new Injector([
	bind(Car).toClass(Car),
	bind(Engine).toClass(Engine)
]);
var car = inj.get(Car);
```

In this example we create two bindings: one for Car and one for Engine. `@Inject(Engine)` declares that Car depends on Engine.



## Injector

An injector instantiates objects lazily, only when needed, and then caches them.

Compare

```
var car = inj.get(Car); //instantiates both an Engine and a Car
```

with

```
var engine = inj.get(Engine); //instantiates an Engine
var car = inj.get(Car); //instantiates a Car
```

and with

```
var car = inj.get(Car); //instantiates both an Engine and a Car
var engine = inj.get(Engine); //reads the Engine from the cache
```

To avoid bugs make sure the registered objects have side-effect-free constructors. If it is the case, an injector acts like a hash map with all of the registered objects created at once.


### Child Injector

Injectors are hierarchical.

```
var child = injector.createChild([
	bind(Engine).toClass(TurboEngine)
]);

var car = child.get(Car); // uses the Car binding from the parent injector and Engine from the child injector
```


## Bindings

You can bind to a class, a value, or a factory. It is also possible to alias existing bindings.

```
var inj = new Injector([
	bind(Car).toClass(Car)
	bind(Engine).toClass(Engine);
]);

var inj = new Injector([
	Car,  // syntax sugar for bind(Car).toClass(Car)
	Engine
]);

var inj = new Injector([
	bind(Car).toValue(new Car(new Engine()))
]);

var inj = new Injector([
	bind(Car).toFactory((e) => new Car(e), [Engine]),
	bind(Engine).toFactory(() => new Engine())
]);
```

You can bind any token.

```
var inj = new Injector([
	bind(Car).toFactory((e) => new Car(), ["engine!"]),
	bind("engine!").toClass(Engine);
]);
```

If you want to alias an existing binding, you can do so using `toAlias`:

```
var inj = new Injector([
	bind(Engine).toClass(Engine),
	bind("engine!").toAlias(Engine)
]);
```
which implies `inj.get(Engine) === inj.get("engine!")`.

Note that tokens and factory functions are decoupled.

```
bind("some token").toFactory(someFactory);
```

The `someFactory` function does not have to know that it creates an object for `some token`.


### Default Bindings

Injector can create binding on the fly if we enable default bindings.

```
var inj = new Injector([], {defaultBindings: true});
var car = inj.get(Car); //this works as if `bind(Car).toClass(Car)` and `bind(Engine).toClass(Engine)` were present.
```

This can be useful in tests, but highly discouraged in production.


## Dependencies

A dependency can be synchronous, asynchronous, or lazy.

```
class Car {
	constructor(@Inject(Engine) engine) {} // sync
}

class Car {
	constructor(engine:Engine) {} // syntax sugar for `constructor(@Inject(Engine) engine:Engine)`
}

class Car {
	constructor(@InjectPromise(Engine) engine:Promise) {} //async
}

class Car {
	constructor(@InjectLazy(Engine) engineFactory:Function) {} //lazy
}
```

* The type annotation is used by DI only when no @Inject annotations are present.
* `InjectPromise` tells DI to inject a promise (see the section on async for more information).
* `InjectLazy` enables deferring the instantiation of a dependency by injecting a factory function.



## Async

Asynchronicity makes code hard to understand and unit test. DI provides two mechanisms to help with it: asynchronous bindings and asynchronous dependencies.

Suppose we have an object that requires some data from the server.

This is one way to implement it:

```
class UserList {
	loadUsers() {
		this.usersLoaded = fetchUsersUsingHttp();
		this.usersLoaded.then((users) => this.users = users);
	}
}

class UserController {
	constructor(ul:UserList){
		this.ul.usersLoaded.then((_) => someLogic(ul.users));
	}
}
```

Both the UserList and UserController classes have to deal with asynchronicity. This is not ideal. UserList should only be responsible for dealing with the list of users (e.g., filtering). And UserController should make ui-related decisions based on the list. Neither should be aware of the fact that the list of users comes from the server. In addition, it clutters unit tests with dummy promises that we are forced to provide.

The DI library supports asynchronous bindings, which can be used to clean up UserList and UserController.

```
class UserList {
	constructor(users:List){
		this.users = users;
	}
}

class UserController {
	constructor(ul:UserList){
	}
}

var inj = new Injector([
	bind(UserList).toAsyncFactory(() => fetchUsersUsingHttp().then((u) => new UserList(u))),
	UserController
])

var uc:Promise = inj.asyncGet(UserController);
```

Both UserList, UserController are now async-free. As a result, they are easy to reason about and unit test. We pushed the async code to the edge of our system, where the initialization happens. The initialization code tends to be declarative and relatively simple. And it should be tested with integration tests, not unit tests.

Note that asynchronicity have not disappeared. We just pushed out it of services.

DI also supports asynchronous dependencies, so we can make some of our services responsible for dealing with async.

```
class UserList {
	constructor(users:List){
		this.users = users;
	}
}

class UserController {
	constructor(@InjectPromise(UserList) ul:Promise){
	}
}

var inj = new Injector([
	bind(UserList).toAsyncFactory(() => fetchUsersUsingHttp().then((u) => new UserList(u))),
	UserController
])

var uc = inj.get(UserController);
```

We can get an instance of UserController synchronously. It is possible because we made UserController responsible for dealing with asynchronicity, so the initialization code does not have to.



### Cheat Sheet

#### Sync Binding + Sync Dependency:

```
class UserList {
}

class UserController {
	constructor(ul:UserList){}
}

var inj = new Injector([UserList, UserController]);
var ctrl:UserController = inj.get(UserController);
```

#### Sync Binding + Async Dependency:

```
class UserList {
}

class UserController {
	constructor(@InjectPromise(UserList) ul){}
}

var inj = new Injector([UserList, UserController]);
var ctrl:UserController = inj.get(UserController); //ctr.ul instanceof Promise;
```

#### Async Binding + Sync Dependency:

```
class UserList {
}

class UserController {
	constructor(ul:UserList){}
}

var inj = new Injector([
	bind(UserList).toAsyncFactory(() => fetchUsersUsingHttp().then((u) => new UserList(u))),
	UserController
]);
var ctrl:Promise = inj.asyncGet(UserController); //ctr.ul instanceof UserList;
```


#### Async Binding + Async Dependency:

```
class UserList {
}

class UserController {
	constructor(@InjectPromise(UserList) ul){}
}

var inj = new Injector([
	bind(UserList).toAsyncFactory(() => fetchUsersUsingHttp().then((u) => new UserList(u))),
	UserController
]);
var ctrl = inj.get(UserController); //ctr.ul instanceof UserList;
```



## Everything is Singleton

```
inj.get(MyClass) === inj.get(MyClass); //always holds
```

This holds even when we try to get the same token synchronously and asynchronously.

```
var p = inj.asyncGet(MyClass);
var mc = inj.get(MyClass);
p.then((mc2) => mc2 === mc); // always holds
```

### Transient Dependencies

If we need a transient dependency, something that we want a new instance of every single time, we have two options.

We can create a child injector:

```
var child = inj.createChild([MyClass]);
child.get(MyClass);
```

Or we can register a factory function:

```
var inj = new Injector([
  bind('MyClassFactory').toFactory(dep => () => new MyClass(dep), [SomeDependency]);
]);

var inj.get('MyClassFactory')();
```



## Key

Most of the time we do not have to deal with keys.

```
var inj = new Injector([
  bind(Engine).toFactory(() => new TurboEngine()); //the passed in token Engine gets mapped to a key
]);
var engine = inj.get(Engine); //the passed in token Engine gets mapped to a key
```

Now, the same example, but with keys

```
var ENGINE_KEY = Key.get(Engine);

var inj = new Injector([
  bind(ENGINE_KEY).toFactory(() => new TurboEngine()); // no mapping
]);
var engine = inj.get(ENGINE_KEY);  // no mapping
```

Every key has an id, which we utilize to store bindings and instances. Essentially, `inj.get(ENGINE_KEY)` is an array read, which is very fast.