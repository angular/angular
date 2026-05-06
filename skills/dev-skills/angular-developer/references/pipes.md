# Pipes

Pipes transform data declaratively inside Angular templates using the `|` operator.

## Using pipes in templates

Import the pipe class and add it to the component's `imports` array.

```ts
import {Component} from '@angular/core';
import {DatePipe, CurrencyPipe} from '@angular/common';

@Component({
  selector: 'app-invoice',
  imports: [DatePipe, CurrencyPipe],
  template: `
    <p>Date: {{ issuedOn | date: 'mediumDate' }}</p>
    <p>Total: {{ amount | currency }}</p>
  `,
})
export class Invoice {
  issuedOn = new Date();
  amount = 49.99;
}
```

## Using pipe logic outside templates

**Do NOT inject pipe classes into services or other classes.** Pipes are template operators, not injectable services. Injecting them causes DI errors in standalone contexts and creates unnecessary coupling.

### Custom pipes — extract the transformation function

Extract the logic into a plain function. The pipe delegates to it; services import the function directly.

```ts
// kebab-case.ts
export function toKebabCase(value: string): string {
  return value.toLowerCase().replace(/ /g, '-');
}
```

```ts
// kebab-case.pipe.ts
import {Pipe, PipeTransform} from '@angular/core';
import {toKebabCase} from './kebab-case';

@Pipe({name: 'kebabCase'})
export class KebabCasePipe implements PipeTransform {
  transform(value: string): string {
    return toKebabCase(value);
  }
}
```

```ts
// formatter.service.ts — import the function, NOT the pipe
import {Injectable} from '@angular/core';
import {toKebabCase} from './kebab-case';

@Injectable({providedIn: 'root'})
export class FormatterService {
  toSlug(title: string): string {
    return toKebabCase(title);
  }
}
```

### Built-in locale-aware pipes — use standalone formatting functions

`@angular/common` exports a standalone function for each locale-aware built-in pipe:

| Pipe           | Standalone function |
| -------------- | ------------------- |
| `DatePipe`     | `formatDate`        |
| `CurrencyPipe` | `formatCurrency`    |
| `DecimalPipe`  | `formatNumber`      |
| `PercentPipe`  | `formatPercent`     |

Inject `LOCALE_ID` to get the current locale and pass it to the function.

```ts
// CORRECT — use formatNumber instead of injecting DecimalPipe
import {Injectable, LOCALE_ID, inject} from '@angular/core';
import {formatNumber} from '@angular/common';

@Injectable({providedIn: 'root'})
export class PriceService {
  private locale = inject(LOCALE_ID);

  formatQuantity(value: number): string {
    return formatNumber(value, this.locale, '1.0-0');
  }
}
```

```ts
// WRONG — do not inject pipe classes
import {Injectable} from '@angular/core';
import {DecimalPipe} from '@angular/common';

@Injectable({providedIn: 'root'})
export class PriceService {
  // ❌ DecimalPipe is not designed to be injected
  private pipe = inject(DecimalPipe);
}
```

## Creating custom pipes

Use the Angular CLI to generate a pipe:

```bash
ng generate pipe path/to/my-pipe
```

A pipe needs a `@Pipe` decorator with a `name` and a `transform` method implementing `PipeTransform`.

```ts
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'truncate'})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 50): string {
    return value.length > limit ? value.slice(0, limit) + '…' : value;
  }
}
```

- **`name`**: camelCase. Do not use hyphens.
- **Class name**: PascalCase version of `name` with `Pipe` appended (e.g., `TruncatePipe`).

## Impure pipes

Mark a pipe `pure: false` only when you need to detect mutations inside arrays or objects. Impure pipes run on every change-detection cycle and can hurt performance.

```ts
@Pipe({name: 'filterItems', pure: false})
export class FilterItemsPipe implements PipeTransform {
  transform(items: string[], query: string): string[] {
    return items.filter((i) => i.includes(query));
  }
}
```

IMPORTANT: Avoid impure pipes unless absolutely necessary.
