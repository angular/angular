# /tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["host_binding_accessor_type_check.ts"]
}
```

# /host_binding_accessor_type_check.ts

```ts
import { Directive, HostBinding, signal } from '@angular/core';

@Directive({
  selector: '[appDisableWhenBusy]',
})
export class DisableWhenBusyDirective {
  readonly busy = signal(false);

  @HostBinding('disabled')
  get isDisabled(): boolean {
    return this.busy();
  }
}

@Directive({
  selector: '[appValue]',
})
export class ValueDirective {
  private _value = '';

  @HostBinding('value')
  set value(v: string) {
    this._value = v;
  }
  get value(): string {
    return this._value;
  }
}

@Directive({
  selector: '[appDisabledProperty]',
})
export class DisabledPropertyDirective {
  @HostBinding('disabled') isDisabled = false;
}
```
