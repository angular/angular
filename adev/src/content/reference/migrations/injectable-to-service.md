# Migration from `@Injectable` to `@Service`

This schematic converts eligible `@Injectable` classes to the [`@Service`](/api/core/Service) decorator, an ergonomic shorthand for `@Injectable({providedIn: 'root'})`.
It is available as of v22.1, and only migrates classes that are considered safe to migrate.

Run the schematic using the following command:

```bash
ng generate @angular/core:service
```

A class declared with `providedIn: 'root'` becomes a `@Service` with no options.

#### Before

```ts
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class MyService {}
```

#### After

```ts
import {Service} from '@angular/core';

@Service()
export class MyService {}
```

A class declared without options is not provided automatically, so the migration keeps that behavior with `autoProvided: false`.
You remain responsible for adding it to a `providers` array, as before.

#### Before {#no-options-before}

```ts
import {Injectable} from '@angular/core';

@Injectable()
export class MyService {}
```

#### After {#no-options-after}

```ts
import {Service} from '@angular/core';

@Service({autoProvided: false})
export class MyService {}
```

For more details, see [Opting out of automatic provisioning](guide/di/creating-and-using-services#opting-out-of-automatic-provisioning).

## Configuration options

### `--path`

By default, the migration updates your whole Angular CLI workspace, including test files.
You can limit the migration to a specific sub-directory using this option.

```bash
ng generate @angular/core:service --path src/app/sub-component
```

## Limitations

To avoid introducing breakages into your app, the schematic skips a class when:

- The class, or the closest ancestor in your own source that defines a constructor, injects dependencies through its constructor.
- The `@Injectable` decorator receives any option other than `providedIn`.
- The `providedIn` option is set to anything other than `'root'`.

When every `@Injectable` in a file migrates, the migration removes the `Injectable` import.
A file with both migrated and skipped classes keeps both imports.

If the migration reports that it did not find any files to migrate, it did not change any file.
Either it found no `@Injectable` class it could convert, or the code is already migrated.
Constructor injection is the most common reason for a skip, and you can run the [migration to the `inject` function](reference/migrations/inject-function) first, then run this one again.
