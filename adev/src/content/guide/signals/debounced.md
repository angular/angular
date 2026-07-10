# Debounce сигналов с `debounced`

IMPORTANT: `debounced` — [экспериментальная](reference/releases#experimental) функция. Её можно пробовать, но до стабилизации API может измениться.

Используйте `debounced`, чтобы отложить реакцию на значение сигнала, пока оно не перестанет меняться. Функция возвращает `Resource`, значение которого отражает debounced-значение исходного сигнала.

```angular-ts
import {debounced, resource, signal} from '@angular/core';

@Component({
  template: `
    <input (input)="query.set($event.target.value)" />

    @if (results.isLoading()) {
      <p>Searching…</p>
    }
    @for (item of results.value(); track item.id) {
      <li>{{ item.name }}</li>
    }
  `,
})
export class Search {
  query = signal('');

  debouncedQuery = debounced(this.query, 300);

  results = resource({
    params: () => this.debouncedQuery.value(),
    loader: ({params}) => fetchResults(params),
  });
}
```

`debounced` принимает исходный сигнал и длительность ожидания в миллисекундах. `value()` возвращённого resource всегда содержит последнее «установившееся» значение, а `status()` показывает, ожидается ли ещё новое значение.

## Статус во время debounce {#status-during-debounce}

Пока идёт отсчёт debounce-таймера, `status()` равен `'loading'`, а `value()` возвращает ранее разрешённое значение. Когда таймер истекает, resource переходит в `'resolved'`. Если исходный сигнал выбрасывает ошибку, resource сразу переходит в `'error'`; таймер не запускается.

Полный список статусов и поведение `value()` см. в [Resource status](/guide/signals/resource#resource-status).

## Пользовательская функция ожидания {#custom-wait-function}

Вместо длительности в миллисекундах можно передать функцию, возвращающую `Promise<void>`. Resource разрешается, когда промис разрешается. Если исходный сигнал изменится до завершения промиса, Angular отбрасывает предыдущий промис и запускает новый.

```ts
debouncedQuery = debounced(query, (value, lastSnapshot) => {
  // Retry immediately after an error rather than making the user wait again.
  if (lastSnapshot.status === 'error') return;
  // Short queries get a longer delay—the user is likely still typing.
  const ms = value.length < 3 ? 500 : 200;
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
});
```

Подробности см. в типе `DebounceTimer` в API reference.

## Equality {#equality}

По умолчанию `debounced` сравнивает значения через `Object.is`.

Передайте пользовательскую функцию equality через опцию `equal`, если проверка по идентичности слишком строгая:

```ts
debouncedFilter = debounced(filter, 200, {
  equal: (a, b) => a.category === b.category && a.minPrice === b.minPrice,
});
```

## Контекст внедрения {#injection-context}

`debounced` нужно вызывать внутри [контекста внедрения](guide/di/dependency-injection-context). Angular автоматически уничтожает debounced resource и отменяет ожидающий таймер при уничтожении injector.

Чтобы использовать `debounced` вне контекста внедрения, передайте явный `Injector` через опции:

```ts
@Service()
export class SearchService {
  private injector = inject(Injector);

  createDebouncedQuery(query: Signal<string>): Resource<string> {
    return debounced(query, 300, {injector: this.injector});
  }
}
```
