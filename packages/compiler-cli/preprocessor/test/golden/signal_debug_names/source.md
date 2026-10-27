# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.ts"]
}
```

# /app.ts
```typescript
import {
  Component,
  computed,
  contentChild,
  effect,
  Injectable,
  InjectionToken,
  Input,
  input,
  linkedSignal,
  model,
  NgModule,
  resource,
  signal,
  viewChild,
} from '@angular/core';
import {httpResource} from '@angular/common/http';
import {signal as aliasedSignal} from '@angular/core';

export const topLevel = signal(0);
export const TOKEN = new InjectionToken<{s: unknown}>('TOKEN');

@Injectable({
  providedIn: 'root',
  useFactory: () => {
    const factoryState = signal('from-injectable');
    const factoryWithOpts = signal(0, {equal: (a, b) => a === b});
    return new MyService(factoryState, factoryWithOpts);
  },
})
export class MyService {
  constructor(
    readonly s: unknown,
    readonly opts: unknown,
  ) {}
}

@Component({
  selector: 'signal-debug-names',
  template: `<div #el>{{ count() }}</div>`,
  providers: [
    {
      provide: TOKEN,
      useFactory: () => {
        const providerSignal = signal(42);
        return {s: providerSignal};
      },
    },
  ],
})
export class SignalDebugNamesComponent {
  @Input({
    transform: (v: string) => {
      const transformed = signal(v);
      return transformed();
    },
  })
  val = '';

  // No options argument: one is appended, after `undefined` when there are no arguments.
  count = signal(0);
  noInitial = input();
  typedNoInitial = input<string>();
  twoWay = model(0);
  required = input.required<string>();
  el = viewChild('el');
  projected = contentChild.required<string>('x');

  // An options object literal: the name is spread into it.
  withEqual = signal(0, {equal: (a, b) => a === b});
  aliased = input(0, {alias: 'renamed'});
  empty = computed(() => this.count() * 2, {});
  requiredWithOptions = model.required<number>({alias: 'req'});

  // The options come first.
  linked = linkedSignal({source: this.count, computation: (count) => count + 1});
  loaded = resource({loader: async () => 1});
  fetched = httpResource(() => '/api');

  // Left alone: already named, opaque options, not an Angular import under its own name.
  named = signal(0, {debugName: 'custom'});
  opaque = signal(0, this.options());
  notRecognized = aliasedSignal(0);

  'quoted-name' = signal('');
  #secret = signal(1);
  assigned;

  constructor() {
    this.assigned = computed(() => this.#secret() + 1);
    effect(() => console.log(this.count()));
    const local = signal(false);
    const outer = computed(() => {
      // Not named: ngtsc does not descend into a call it already rewrote.
      const inner = signal(1);
      return inner() + Number(local());
    });
    void outer;
  }

  private options() {
    return {};
  }
}

@NgModule({
  providers: [
    {
      provide: TOKEN,
      useFactory: () => {
        const moduleSignal = signal(true);
        return {s: moduleSignal};
      },
    },
  ],
})
export class AppModule {}
```
