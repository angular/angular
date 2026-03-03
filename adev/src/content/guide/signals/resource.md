# Асинхронная реактивность с resource {#async-reactivity-with-resources}

IMPORTANT: `resource` является [экспериментальным](reference/releases#experimental). Вы можете попробовать его, но он может измениться до выхода стабильной версии.

Все API сигналов являются синхронными — `signal`, `computed`, `input` и т.д. Однако приложениям часто приходится работать с данными, доступными асинхронно. `Resource` даёт вам возможность включить асинхронные данные в код приложения, основанный на сигналах, и при этом обращаться к данным синхронно.

Вы можете использовать `Resource` для выполнения любых асинхронных операций, но наиболее распространённый случай использования `Resource` — это получение данных с сервера. Следующий пример создаёт resource для получения данных пользователя.

Самый простой способ создать `Resource` — использовать функцию `resource`.

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

Свойство `params` определяет реактивное вычисление, которое создаёт значение параметра. Когда сигналы, прочитанные в этом вычислении, изменяются, resource генерирует новое значение параметра, аналогично `computed`.

Свойство `loader` определяет `ResourceLoader` — асинхронную функцию, которая получает некоторое состояние. Resource вызывает loader каждый раз, когда вычисление `params` создаёт новое значение, передавая это значение в loader. Подробнее см. в разделе [Загрузчики resource](#resource-loaders) ниже.

`Resource` имеет сигнал `value`, содержащий результаты работы loader.

## Загрузчики resource {#resource-loaders}

При создании resource вы указываете `ResourceLoader`. Это асинхронная функция, которая принимает один параметр — объект `ResourceLoaderParams` — и возвращает значение.

Объект `ResourceLoaderParams` содержит три свойства: `params`, `previous` и `abortSignal`.

| Свойство      | Описание                                                                                                                                              |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `params`      | Значение вычисления `params` для resource.                                                                                                            |
| `previous`    | Объект со свойством `status`, содержащим предыдущий `ResourceStatus`.                                                                                 |
| `abortSignal` | [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal). Подробнее см. в разделе [Отмена запросов](#aborting-requests) ниже.    |

Если вычисление `params` возвращает `undefined`, функция loader не запускается, и статус resource становится `'idle'`.

### Отмена запросов {#aborting-requests}

Resource отменяет текущую операцию загрузки, если вычисление `params` изменяется во время загрузки.

Вы можете использовать `abortSignal` из `ResourceLoaderParams` для обработки отменённых запросов. Например, нативная функция `fetch` принимает `AbortSignal`:

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

Подробнее об отмене запросов с помощью `AbortSignal` см. [`AbortSignal` на MDN](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).

### Перезагрузка {#reloading}

Вы можете программно вызвать `loader` resource, вызвав метод `reload`.

```typescript
const userId: Signal<string> = getUserId();

const userResource = resource({
  params: () => ({id: userId()}),
  loader: ({params}) => fetchUser(params),
});

// ...

userResource.reload();
```

## Статус resource {#resource-status}

Объект resource имеет несколько сигнальных свойств для чтения статуса асинхронного loader.

| Свойство    | Описание                                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| `value`     | Последнее значение resource или `undefined`, если значение ещё не получено.                                        |
| `hasValue`  | Имеет ли resource значение.                                                                                        |
| `error`     | Последняя ошибка, возникшая при выполнении loader resource, или `undefined`, если ошибок не было.                  |
| `isLoading` | Выполняется ли в данный момент loader resource.                                                                    |
| `status`    | Конкретный `ResourceStatus` ресурса, описанный ниже.                                                               |

Сигнал `status` предоставляет конкретный `ResourceStatus`, описывающий состояние resource с помощью строковой константы.

| Статус        | `value()`               | Описание                                                                              |
| ------------- | :---------------------- | ------------------------------------------------------------------------------------- |
| `'idle'`      | `undefined`             | У resource нет допустимого запроса, и loader не выполнялся.                            |
| `'error'`     | `undefined`             | Loader столкнулся с ошибкой.                                                          |
| `'loading'`   | `undefined`             | Loader выполняется в результате изменения значения `params`.                           |
| `'reloading'` | Предыдущее значение     | Loader выполняется в результате вызова метода `reload` resource.                       |
| `'resolved'`  | Разрешённое значение    | Loader завершил работу.                                                               |
| `'local'`     | Локально заданное значение | Значение resource было задано локально через `.set()` или `.update()`.               |

Вы можете использовать эту информацию о статусе для условного отображения элементов пользовательского интерфейса, таких как индикаторы загрузки и сообщения об ошибках.

## Реактивное получение данных с `httpResource` {#reactive-data-fetching-with-httpresource}

[`httpResource`](guide/http/http-resource) — это обёртка вокруг `HttpClient`, которая предоставляет статус запроса и ответ в виде сигналов. Он выполняет HTTP-запросы через стек HTTP Angular, включая перехватчики.

## Композиция resource с помощью снимков {#resource-composition-with-snapshots}

`ResourceSnapshot` — это структурированное представление текущего состояния resource. Каждый resource имеет свойство `snapshot`, предоставляющее сигнал его текущего состояния.

```ts
const userId: Signal<string> = getUserId();

const userResource = resource({
  params: () => ({id: userId()}),
  loader: ({params}) => fetchUser(params),
});

const userSnapshot = userResource.snapshot;
```

Каждый снимок содержит `status` и либо `value`, либо `error`.

### Композиция resource с помощью снимков {#composing-resources-with-snapshots}

Вы можете создавать новые resource из снимков с помощью `resourceFromSnapshots`. Это позволяет комбинировать их с API сигналов, такими как `computed` и `linkedSignal`, для трансформации поведения resource.

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
