### RxJS Usage
When dealing with RxJS operators it is important to be aware that using the "patch" imports will
pollute the global Observable object (e.g. `import "rxjs/add/operator/map"`).  When creating a
component library, it is highly recommended to import the operator functions directly (e.g.
`import "rxjs/operator/map"`):

```ts
// NO
import 'rxjs/add/operator/map';
someObservable.map(...).subscribe(...);

// YES
import {map} from 'rxjs/operator/map';
map.call(someObservable, ...).subscribe(...);
```

#### RxChain
Because this approach can be inflexible when dealing with long chains of operators. You should use
the `RxChain` class to help with it:

```ts
// Before
someObservable.filter(...).map(...).do(...);

// After
RxChain.from(someObservable).call(filter, ...).call(map, ...).subscribe(...);
```
