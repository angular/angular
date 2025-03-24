## Remove `TestBed.get` migration
Replaces the usages of the deprecated `TestBed.get` method with the non-deprecated `TestBed.inject`:

### Before
```typescript
import { TestBed } from '@angular/core/testing';

describe('test', () => {
  it('should inject', () => {
    console.log(TestBed.get(SOME_TOKEN));
  });
});
```

### After
```typescript
import { TestBed } from '@angular/core/testing';

describe('test', () => {
  it('should inject', () => {
    console.log(TestBed.inject(SOME_TOKEN));
  });
});
```
