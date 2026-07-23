# @Injectable to @Service migration

This schematic converts eligible `@Injectable` classes to the `@Service` decorator.

## How to run this migration?

The migration can be run using the following command:

```bash
ng generate @angular/core:service
```

By default, the migration will go over the entire application. If you want to apply this migration
to a subset of the files, you can pass the path argument as shown below:

```bash
ng generate @angular/core:service --path src/app/sub-component
```

### Example

```ts
// Before
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class MyService {}

// After
import {Service} from '@angular/core';

@Service()
export class MyService {}
```

### Limitations

To avoid introducing breakages into your app, the schematic will skip the following classes:

- Using constructor-based dependency injection.
- Passing any options into `@Injectable` aside from `providedIn`.
- Passing anything aside from `root` into `providedIn`.
