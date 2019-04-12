## Injectable annotation on pipes

In ViewEngine it was possible to inject a class that was annotated as a `Pipe`, however this no
longer works in Ivy if the class also doesn't have the `Injectable` decorator. This migration
adds `Injectable` automatically to all `Pipe` classes.

### Before
```ts
import { Pipe } from '@angular/core';

@Pipe({ name: 'myPipe' })
class MyPipe {}
```

### After
```ts
import { Pipe, Injectable } from '@angular/core';

@Injectable()
@Pipe({ name: 'myPipe' })
class MyPipe {}
```
