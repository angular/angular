
## DebugElement query migration

As of Angular v16, the type of `DebugElement.query` can return null. 
This migration automatically identifies usages and adds non-null assertions.

#### Before

```ts
    const input = fixture.debugElement.query(By.css('input'));
    expect(input.nativeElement.value).toEqual('value');
```

#### After

```ts
    const input = fixture.debugElement.query(By.css('input'));
    expect(input!.nativeElement.value).toEqual('value');  // <- Non-null assertion added during the migration.
```