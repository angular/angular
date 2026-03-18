# Асинхронная реактивность с ресурсами {#async-reactivity-with-resources}

IMPORTANT: `resource` является [экспериментальной](reference/releases#experimental) функцией. Она готова к использованию, но может измениться до стабилизации.

Все API сигналов синхронны — `signal`, `computed`, `input` и др. Однако приложениям часто нужно работать с данными, доступными асинхронно. `Resource` даёт способ встроить асинхронные данные в сигнальный код приложения, сохраняя возможность синхронного доступа к ним.

`Resource` можно использовать для любых асинхронных операций, но наиболее распространённый сценарий — загрузка данных с сервера. Следующий пример создаёт ресурс для загрузки данных пользователя.

Самый простой способ создать `Resource` — это функция `resource`.

```typescript
import {resource, Signal} from '@angular/core';

const userId: Signal<string> = getUserId();

const userResource = resource({
  // Define a reactive computation.
  // The params value recomputes whenever any read signals change.
  params: () => ({id: userId()}),

  // Define an async loader that retrieves data.
  // The resource calls this function every time the `params` value changes.
  loader: ({params}) => fetchUser(params),
});

// Create a computed signal based on the result of the resource's loader function.
const firstName = computed(() => {
  if (userResource.hasValue()) {
    // `hasValue` serves 2 purposes:
    // - It acts as type guard to strip `undefined` from the type
    // - If protects against reading a throwing `value` when the resource is in error state
    return userResource.value().firstName;
  }

  // fallback in case the resource value is `undefined` or if the resource is in error state
  return undefined;
});
```

Функция `resource` принимает объект `ResourceOptions` с двумя основными свойствами: `params` и `loader`.

Свойство `params` определяет реактивное вычисление, которое производит значение параметра. Всякий раз когда сигналы, читаемые в этом вычислении, изменяются, ресурс производит новое значение параметра, аналогично `computed`.

Свойство `loader` определяет `ResourceLoader` — асинхронную функцию, которая получает некоторое состояние. Ресурс вызывает загрузчик каждый раз, когда вычисление `params` производит новое значение, передавая это значение в загрузчик. Подробнее см. в разделе [Загрузчики ресурсов](#resource-loaders) ниже.

`Resource` имеет сигнал `value`, содержащий результаты загрузчика.

## Загрузчики ресурсов {#resource-loaders}

При создании ресурса указывается `ResourceLoader`. Это асинхронная функция, принимающая единственный параметр — объект `ResourceLoaderParams` — и возвращающая значение.

Объект `ResourceLoaderParams` содержит три свойства: `params`, `previous` и `abortSignal`.

| Свойство      | Описание                                                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `params`      | Значение вычисления `params` ресурса.                                                                                                                   |
| `previous`    | Объект со свойством `status`, содержащим предыдущий `ResourceStatus`.                                                                                  |
| `abortSignal` | [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal). Подробнее см. в разделе [Отмена запросов](#aborting-requests) ниже. |

Если вычисление `params` возвращает `undefined`, функция-загрузчик не запускается, а статус ресурса становится `'idle'`.

### Отмена запросов {#aborting-requests}

Ресурс отменяет текущую операцию загрузки, если вычисление `params` изменяется во время загрузки.

Можно использовать `abortSignal` из `ResourceLoaderParams` для обработки отменённых запросов. Например, нативная функция `fetch` принимает `AbortSignal`:

```typescript
const userId: Signal<string> = getUserId();

const userResource = resource({
  params: () => ({id: userId()}),
  loader: ({params, abortSignal}): Promise<User> => {
    // fetch cancels any outstanding HTTP requests when the given `AbortSignal`
    // indicates that the request has been aborted.
    return fetch(`users/${params.id}`, {signal: abortSignal});
  },
});
```

Подробнее об отмене запросов с помощью `AbortSignal` см. на странице [`AbortSignal` в MDN](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).

### Перезагрузка {#reloading}

Можно программно запустить `loader` ресурса, вызвав метод `reload`.

```typescript
const userId: Signal<string> = getUserId();

const userResource = resource({
  params: () => ({id: userId()}),
  loader: ({params}) => fetchUser(params),
});

// ...

userResource.reload();
```

## Статус ресурса {#resource-status}

Объект ресурса имеет несколько сигнальных свойств для чтения статуса асинхронного загрузчика.

| Свойство    | Описание                                                                                                             |
| ----------- | -------------------------------------------------------------------------------------------------------------------- |
| `value`     | Последнее значение ресурса, или `undefined`, если значение ещё не получено.                                          |
| `hasValue`  | Имеет ли ресурс значение.                                                                                            |
| `error`     | Последняя ошибка, возникшая при выполнении загрузчика ресурса, или `undefined`, если ошибок не было.                 |
| `isLoading` | Выполняется ли в данный момент загрузчик ресурса.                                                                    |
| `status`    | Конкретный `ResourceStatus` ресурса, описанный ниже.                                                                 |

Сигнал `status` предоставляет конкретный `ResourceStatus`, описывающий состояние ресурса с помощью строковой константы.

| Статус        | `value()`               | Описание                                                                           |
| ------------- | :---------------------- | ---------------------------------------------------------------------------------- |
| `'idle'`      | `undefined`             | У ресурса нет действительного запроса, и загрузчик не запускался.                  |
| `'error'`     | `undefined`             | Загрузчик столкнулся с ошибкой.                                                    |
| `'loading'`   | `undefined`             | Загрузчик выполняется в результате изменения значения `params`.                    |
| `'reloading'` | Предыдущее значение     | Загрузчик выполняется в результате вызова метода `reload` ресурса.                 |
| `'resolved'`  | Разрешённое значение    | Загрузчик завершил работу.                                                         |
| `'local'`     | Локально заданное значение | Значение ресурса было задано локально через `.set()` или `.update()`.           |

Эту информацию о статусе можно использовать для условного отображения элементов интерфейса, таких как индикаторы загрузки и сообщения об ошибках.

## Реактивная загрузка данных с `httpResource` {#reactive-data-fetching-with-httpresource}

[`httpResource`](guide/http/http-resource) — это обёртка вокруг `HttpClient`, предоставляющая статус запроса и ответ в виде сигналов. Она выполняет HTTP-запросы через стек HTTP Angular, включая перехватчики.

## Компоновка ресурсов со снимками {#resource-composition-with-snapshots}

`ResourceSnapshot` — это структурированное представление текущего состояния ресурса. У каждого ресурса есть свойство `snapshot`, предоставляющее сигнал его текущего состояния.

```ts
const userId: Signal<string> = getUserId();

const userResource = resource({
  params: () => ({id: userId()}),
  loader: ({params}) => fetchUser(params),
});

const userSnapshot = userResource.snapshot;
```

Каждый снимок содержит `status` и либо `value`, либо `error`.

### Компоновка ресурсов со снимками {#composing-resources-with-snapshots}

Новые ресурсы можно создавать из снимков с помощью `resourceFromSnapshots`. Это позволяет выполнять компоновку с API сигналов, такими как `computed` и `linkedSignal`, для преобразования поведения ресурсов.

```ts
import {linkedSignal, resourceFromSnapshots, Resource, ResourceSnapshot} from '@angular/core';

function withPreviousValue<T>(input: Resource<T>): Resource<T> {
  const derived = linkedSignal<ResourceSnapshot<T>, ResourceSnapshot<T>>({
    source: input.snapshot,
    computation: (snap, previous) => {
      if (snap.status === 'loading' && previous && previous.value.status !== 'error') {
        // When the input resource enters loading state, we keep the value
        // from its previous state, if any.
        return {status: 'loading' as const, value: previous.value.value};
      }

      // Otherwise we simply forward the state of the input resource.
      return snap;
    },
  });

  return resourceFromSnapshots(derived);
}

@Component({
  /*... */
})
export class AwesomeProfile {
  userId = input.required<number>();
  user = withPreviousValue(httpResource(() => `/user/${this.userId()}`));
  // When userId changes, user.value() keeps the old user data until the new one loads
}
```
