# Асинхронная реактивность с resources

Все signal API синхронны — `signal`, `computed`, `input` и т.д. Однако приложениям часто нужно работать с данными, доступными асинхронно. `Resource` даёт способ включить async-данные в signal-based код приложения и при этом обращаться к ним синхронно.

`Resource` можно использовать для любой async-операции, но самый частый сценарий — получение данных с сервера. Следующий пример создаёт resource для получения данных пользователя.

Самый простой способ создать `Resource` — функция `resource`.

```typescript
import {computed, resource, Signal} from '@angular/core';

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
    // - It protects against reading a throwing `value` when the resource is in error state
    return userResource.value().firstName;
  }

  // fallback in case the resource value is `undefined` or if the resource is in error state
  return undefined;
});
```

Функция `resource` принимает объект `ResourceOptions` с двумя основными свойствами: `params` и `loader`.

Свойство `params` определяет реактивное вычисление, производящее значение параметра. Когда сигналы, прочитанные в этом вычислении, меняются, resource производит новое значение параметра — подобно `computed`.

Свойство `loader` определяет `ResourceLoader` — async-функцию, которая получает некоторое состояние. Resource вызывает loader каждый раз, когда вычисление `params` производит новое значение, передавая это значение в loader. Подробнее — в [Resource loaders](#resource-loaders).

У `Resource` есть сигнал `value`, содержащий результаты loader.

## Resource loaders {#resource-loaders}

При создании resource вы указываете `ResourceLoader`. Это async-функция, принимающая один параметр — объект `ResourceLoaderParams` — и возвращающая значение.

Объект `ResourceLoaderParams` содержит три свойства: `params`, `previous` и `abortSignal`.

| Свойство      | Описание                                                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `params`      | Значение вычисления `params` resource.                                                                                                           |
| `previous`    | Объект со свойством `status`, содержащим предыдущий `ResourceStatus`.                                                                            |
| `abortSignal` | [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal). Подробнее — в [Aborting requests](#aborting-requests).             |

Если вычисление `params` возвращает `undefined`, функция loader не выполняется, и статус resource становится `'idle'`.

### Streaming resources {#streaming-resources}

Некоторые асинхронные источники данных производят несколько значений со временем вместо одного результата. Примеры — WebSockets, Server-Sent Events (SSE) и слушатели Firestore `onSnapshot`.

Для таких непрерывно обновляющихся источников используйте `stream`. В отличие от `loader`, который разрешается один раз для каждого запроса, `stream` возвращает сигнал, значение которого может продолжать обновляться по мере появления новых данных.

Используйте `loader` для одноразовых асинхронных операций, например получения данных с HTTP endpoint.

```typescript
const userUpdates = signal({value: 'Alice'});

const userResource = resource({
  stream: () => userUpdates,
});

// Later, when new data arrives:
userUpdates.set({value: 'Bob'});
```

### Отмена запросов {#aborting-requests}

Resource отменяет незавершённую операцию загрузки, если вычисление `params` меняется, пока resource загружается.

Можно использовать `abortSignal` в `ResourceLoaderParams`, чтобы реагировать на отменённые запросы. Например, нативная функция `fetch` принимает `AbortSignal`:

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

Подробнее об отмене запросов с `AbortSignal` — в [`AbortSignal` на MDN](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).

### Перезагрузка {#reloading}

Можно программно запустить `loader` resource, вызвав метод `reload`.

```typescript
const userId: Signal<string> = getUserId();

const userResource = resource({
  params: () => ({id: userId()}),
  loader: ({params}) => fetchUser(params),
});

// ...

userResource.reload();
```

## Статус Resource {#resource-status}

Объект resource имеет несколько signal-свойств для чтения статуса асинхронного loader.

| Свойство    | Описание                                                                                                        |
| ----------- | --------------------------------------------------------------------------------------------------------------- |
| `value`     | Самое недавнее значение resource или `undefined`, если значение ещё не получено.                                |
| `hasValue`  | Есть ли у resource значение.                                                                                    |
| `error`     | Самая недавняя ошибка при выполнении loader resource или `undefined`, если ошибок не было.                      |
| `isLoading` | Выполняется ли сейчас loader resource.                                                                          |
| `status`    | Конкретный `ResourceStatus` resource, как описано ниже.                                                         |

Сигнал `status` предоставляет конкретный `ResourceStatus`, описывающий состояние resource строковой константой.

| Статус        | `value()`         | Описание                                                                         |
| ------------- | :---------------- | -------------------------------------------------------------------------------- |
| `'idle'`      | `undefined`       | У resource нет валидного запроса, и loader не выполнялся.                        |
| `'error'`     | `undefined`       | Loader столкнулся с ошибкой.                                                     |
| `'loading'`   | `undefined`       | Loader выполняется из‑за изменения значения `params`.                            |
| `'reloading'` | Previous value    | Loader выполняется из‑за вызова метода `reload` resource.                        |
| `'resolved'`  | Resolved value    | Loader завершился.                                                               |
| `'local'`     | Locally set value | Значение resource задано локально через `.set()` или `.update()`                 |

Эту информацию о статусе можно использовать для условного отображения элементов UI — индикаторов загрузки и сообщений об ошибках.

## Кэширование данных `resource` с SSR {#caching-resource-data-with-ssr}

Когда приложение рендерится на сервере, loader resource выполняется один раз для создания начального HTML. Во время гидратации браузер обычно снова запускает тот же loader.

Чтобы переиспользовать результат сервера, предоставьте `id` для resource. Angular сохраняет разрешённое значение в `TransferState` на сервере и использует его на клиенте для инициализации resource в состоянии `'resolved'`.

```ts
const userId: Signal<string> = getUserId();

const userResource = resource({
  params: () => ({id: userId()}),
  loader: ({params}) => fetchUser(params),
  id: 'user-unique-id',
});
```

Значение `id` должно быть уникальным в приложении и одинаковым на сервере и клиенте, чтобы Angular мог сопоставить кэшированную запись с resource, который её запросил.

IMPORTANT: Поскольку кэшированное значение сериализуется в HTML страницы, избегайте установки `id` на resources, загружающих данные, специфичные для пользователя, вызвавшего server-side render — особенно если отрендеренный HTML может кэшироваться или разделяться между пользователями.

## Цепочки resources {#chaining-resources}

Иногда один resource зависит от результата другого. Эту зависимость можно выразить через функцию `chain`, доступную в объекте контекста `params`.

```typescript
import {resource} from '@angular/core';

const userResource = resource({
  params: () => ({id: getUserId()}),
  loader: ({params}) => fetchUser(params),
});

const companyResource = resource({
  params: ({chain}) => chain(userResource)?.companyId,
  loader: ({params: companyId}) => fetchCompany(companyId),
});
```

Здесь `companyResource` зависит от `companyId` пользователя, который известен только после загрузки `userResource`. `chain(userResource)` читает значение `userResource` и автоматически распространяет его статус на `companyResource`:

- Если `userResource` **idle**, `companyResource` тоже становится `idle`.
- Если `userResource` **loading** или **reloading**, `companyResource` входит в состояние `loading`, и его loader не выполняется. Обратите внимание: во время `reloading` `chain` не возвращает ранее разрешённое значение.
- Если `userResource` в состоянии **error**, `companyResource` тоже входит в состояние `error`.
- Если `userResource` **resolved** или **local**, `chain` возвращает его текущее значение, которое `companyResource` затем использует как params.

Когда `chain` распространяет статус из `userResource` (`idle`, `loading`, `reloading` или `error`), функция params не продолжается. Когда `userResource` — `resolved` или `local`, `chain` возвращает его значение, которое само может быть `undefined`. Пример обрабатывает это через `chain(userResource)?.companyId`, так что значение `undefined` приводит к `undefined` params, и `companyResource` становится `idle`.

NOTE: Передавайте chained-значение напрямую как значение params, а не оборачивайте его в объект. Значение params вроде `{companyId: undefined}` всё ещё является определённым значением, поэтому loader выполнится с `undefined` `companyId` вместо того, чтобы resource стал `idle`.

### Chaining vs. прямое чтение значений resource {#chaining-vs-reading-resource-values-directly}

Может возникнуть желание прочитать значение resource напрямую внутри `params`:

```typescript {avoid, header: 'reads value() directly without status propagation'}
const companyResource = resource({
  params: () => {
    const user = userResource.value(); // may be undefined
    return user ? {companyId: user.companyId} : undefined;
  },
  loader: ({params}) => fetchCompany(params.companyId),
});
```

Хотя это работает, возврат `undefined` из `params` делает resource `idle`, а не отражает фактическое состояние upstream resource. Предпочтительнее использовать `chain`, потому что он корректно зеркалирует состояния `loading` и `error`.

Обращайтесь к `chain` только когда downstream resource выполняет собственную async-работу, зависящую от upstream-значения. Если нужно только синхронно вывести значение из resource, используйте `computed`.

## Реактивное получение данных с `httpResource` {#reactive-data-fetching-with-httpresource}

[`httpResource`](/guide/http/http-resource) — обёртка над `HttpClient`, дающая статус запроса и ответ как сигналы. Она делает HTTP-запросы через Angular HTTP stack, включая interceptors.

## Композиция Resource со snapshots {#resource-composition-with-snapshots}

`ResourceSnapshot` — структурированное представление текущего состояния resource. У каждого resource есть свойство `snapshot`, предоставляющее сигнал его текущего состояния.

```ts
const userId: Signal<string> = getUserId();

const userResource = resource({
  params: () => ({id: userId()}),
  loader: ({params}) => fetchUser(params),
});

const userSnapshot = userResource.snapshot;
```

Каждый snapshot содержит `status` и либо `value`, либо `error`.

### Композиция resources со snapshots {#composing-resources-with-snapshots}

Новые resources можно создавать из snapshots через `resourceFromSnapshots`. Это позволяет композицию с signal API вроде `computed` и `linkedSignal` для трансформации поведения resource.

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
