# Управление асинхронными данными с помощью сигналов и Resources API

Теперь, когда вы
узнали, [как выводить состояние с помощью linked-сигналов](/tutorials/signals/3-deriving-state-with-linked-signals),
давайте разберемся, как работать с асинхронными данными, используя Resource API. Этот API предоставляет мощный
инструмент для управления асинхронными операциями с помощью сигналов, включая встроенную поддержку состояний загрузки,
обработку ошибок и управление запросами.

В этом уроке вы научитесь использовать функцию `resource()` для асинхронной загрузки данных и обрабатывать различные
состояния операций. Мы создадим загрузчик профиля пользователя, чтобы увидеть Resource API в действии.

<hr />

<docs-workflow>

<docs-step title="Импорт функции resource и API">
Добавьте `resource` в список импортов и импортируйте функцию-заглушку API.

```ts
// Add resource to existing imports
import {Component, signal, computed, resource, ChangeDetectionStrategy} from '@angular/core';
// Import mock API function
import {loadUser} from './user-api';
```

</docs-step>

<docs-step title="Создание ресурса для данных пользователя">
Добавьте в класс компонента свойство, создающее ресурс для загрузки данных пользователя на основе сигнала с ID пользователя.

```ts
userId = signal(1);

userResource = resource({
  params: () => ({ id: this.userId() }),
  loader: (params) => loadUser(params.params.id)
});
```

</docs-step>

<docs-step title="Добавление методов для взаимодействия с ресурсом">
Добавьте методы для изменения ID пользователя и перезагрузки ресурса.

```ts
loadUser(id: number) {
  this.userId.set(id);
}

reloadUser() {
  this.userResource.reload();
}
```

Изменение сигнала параметров автоматически запускает перезагрузку, либо вы можете выполнить её вручную с помощью
`reload()`.
</docs-step>

<docs-step title="Создание вычисляемых сигналов для состояний ресурса">
Добавьте вычисляемые (computed) сигналы для доступа к различным состояниям ресурса.

```ts
isLoading = computed(() => this.userResource.status() === 'loading');
hasError = computed(() => this.userResource.status() === 'error');
```

Ресурсы предоставляют сигнал `status()`, который может принимать значения 'loading', 'success' или 'error', сигнал
`value()` для загруженных данных и метод `hasValue()`, который безопасно проверяет наличие данных.
</docs-step>

<docs-step title="Подключение кнопок и отображение состояний ресурса">
Структура шаблона уже готова. Теперь свяжите всё воедино:

Часть 1. **Добавьте обработчики клика для кнопок:**

```html
<button (click)="loadUser(1)">Load User 1</button>
<button (click)="loadUser(2)">Load User 2</button>
<button (click)="loadUser(999)">Load Invalid User</button>
<button (click)="reloadUser()">Reload</button>
```

Часть 2. **Замените заполнитель (placeholder) на логику обработки состояний ресурса:**

```angular-html
@if (isLoading()) {
  <p>Loading user...</p>
} @else if (hasError()) {
  <p class="error">Error: {{ userResource.error()?.message }}</p>
} @else if (userResource.hasValue()) {
  <div class="user-info">
    <h3>{{ userResource.value().name }}</h3>
    <p>{{ userResource.value().email }}</p>
  </div>
}
```

Ресурс предоставляет различные методы для проверки своего состояния:

- `isLoading()` - true во время получения данных
- `hasError()` - true, если произошла ошибка
- `userResource.hasValue()` - true, когда данные доступны
- `userResource.value()` - доступ к загруженным данным
- `userResource.error()` - доступ к информации об ошибке

</docs-step>

</docs-workflow>

Отлично! Вы научились использовать Resource API с сигналами. Ключевые моменты:

- **Ресурсы реактивны**: они автоматически перезагружаются при изменении параметров.
- **Встроенное управление состоянием**: ресурсы предоставляют сигналы `status()`, `value()` и `error()`.
- **Автоматическая очистка**: ресурсы автоматически обрабатывают отмену запросов и очистку.
- **Ручное управление**: при необходимости вы можете вручную перезагружать или прерывать запросы.

В следующем уроке вы
узнаете, [как передавать данные в компоненты с помощью input-сигналов](/tutorials/signals/5-component-communication-with-signals)!
