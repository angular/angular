# Отложенная загрузка с `@defer`

Deferrable views, также известные как блоки `@defer`, уменьшают начальный размер бандла приложения, откладывая загрузку кода, который не строго необходим для начальной отрисовки страницы. Это часто приводит к более быстрой начальной загрузке и улучшению Core Web Vitals (CWV), в первую очередь Largest Contentful Paint (LCP) и Time to First Byte (TTFB).

Чтобы использовать эту возможность, можно декларативно обернуть секцию шаблона в блок @defer:

```angular-html
@defer {
  <large-component />
}
```

Код любых компонентов, директив и pipes внутри блока `@defer` разделяется в отдельный JavaScript-файл и загружается только когда необходимо — после отрисовки остальной части шаблона.

Deferrable views поддерживают различные triggers, опции prefetching и sub-блоки для управления состояниями placeholder, loading и error.

## Какие зависимости откладываются? {#which-dependencies-are-deferred}

Компоненты, директивы, pipes и любые CSS-стили компонентов могут быть отложены при загрузке приложения.

Чтобы зависимости внутри блока `@defer` были отложены, они должны соответствовать двум условиям:

1. **Они должны быть standalone.** Non-standalone зависимости не могут быть отложены и всё ещё загружаются eagerly, даже если они внутри блоков `@defer`.
1. **На них нельзя ссылаться вне блоков `@defer` в том же файле.** Если на них ссылаются вне блока `@defer` или внутри ViewChild queries, зависимости будут загружены eagerly.

_Транзитивные_ зависимости компонентов, директив и pipes, используемых в блоке `@defer`, не обязаны строго быть standalone; транзитивные зависимости всё ещё могут быть объявлены в `NgModule` и участвовать в отложенной загрузке.

Компилятор Angular производит оператор [dynamic import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) для каждого компонента, директивы и pipe, используемых в блоке `@defer`. Основной контент блока отрисовывается после разрешения всех imports. Angular не гарантирует какой-либо конкретный порядок этих imports.

## Как управлять разными стадиями отложенной загрузки {#how-to-manage-different-stages-of-deferred-loading}

Блоки `@defer` имеют несколько sub-блоков, позволяющих корректно обрабатывать разные стадии процесса отложенной загрузки.

### `@defer` {#defer}

Это основной блок, определяющий секцию контента, которая загружается лениво. Изначально он не отрисовывается — отложенный контент загружается и отрисовывается, когда происходит указанный [trigger](#controlling-deferred-content-loading-with-triggers) или выполняется условие `when`.

По умолчанию блок `@defer` запускается, когда состояние браузера становится [idle](/guide/templates/defer#idle).

```angular-html
@defer {
  <large-component />
}
```

### Показ placeholder-контента с `@placeholder` {#show-placeholder-content-with-placeholder}

По умолчанию defer-блоки не отрисовывают никакой контент до запуска.

`@placeholder` — опциональный блок, объявляющий, какой контент показывать до запуска блока `@defer`.

```angular-html
@defer {
  <large-component />
} @placeholder {
  <p>Placeholder content</p>
}
```

Хотя он опционален, определённые triggers могут требовать присутствия либо `@placeholder`, либо [template reference variable](/guide/templates/variables#template-reference-variables) для работы. См. раздел [Triggers](#controlling-deferred-content-loading-with-triggers) для дополнительных деталей.

Angular заменяет placeholder-контент основным контентом после завершения загрузки. В секции placeholder можно использовать любой контент, включая обычный HTML, компоненты, директивы и pipes. Имейте в виду, что _зависимости блока placeholder загружаются eagerly_.

Блок `@placeholder` принимает опциональный параметр для указания `minimum` количества времени, в течение которого этот placeholder должен показываться после начальной отрисовки placeholder-контента.

```angular-html
@defer {
  <large-component />
} @placeholder (minimum 500ms) {
  <p>Placeholder content</p>
}
```

Этот параметр `minimum` указывается в приращениях времени миллисекунд (ms) или секунд (s). Можно использовать этот параметр, чтобы предотвратить быстрое мерцание placeholder-контента в случае, когда отложенные зависимости загружаются быстро.

### Показ loading-контента с `@loading` {#show-loading-content-with-loading}

Блок `@loading` — опциональный блок, позволяющий объявить контент, который показывается, пока загружаются отложенные зависимости. Он заменяет блок `@placeholder`, как только загрузка запущена.

```angular-html
@defer {
  <large-component />
} @loading {
  <img alt="loading..." src="loading.gif" />
} @placeholder {
  <p>Placeholder content</p>
}
```

Его зависимости загружаются eagerly (аналогично `@placeholder`).

Блок `@loading` принимает два опциональных параметра, чтобы помочь предотвратить быстрое мерцание контента, которое может произойти, когда отложенные зависимости загружаются быстро:

- `minimum` — минимальное количество времени, в течение которого этот placeholder должен показываться
- `after` — количество времени ожидания после начала загрузки перед показом loading-шаблона

```angular-html
@defer {
  <large-component />
} @loading (after 100ms; minimum 1s) {
  <img alt="loading..." src="loading.gif" />
}
```

Оба параметра указываются в приращениях времени миллисекунд (ms) или секунд (s). Кроме того, таймеры для обоих параметров начинаются сразу после запуска загрузки.

### Показ состояния ошибки при сбое отложенной загрузки с `@error` {#show-error-state-when-deferred-loading-fails-with-error}

Блок `@error` — опциональный блок, который отображается, если отложенная загрузка не удалась. Аналогично `@placeholder` и `@loading`, зависимости блока @error загружаются eagerly.

```angular-html
@defer {
  <large-component />
} @error {
  <p>Failed to load large component.</p>
}
```

## Управление загрузкой отложенного контента с triggers {#controlling-deferred-content-loading-with-triggers}

Можно указать **triggers**, которые контролируют, когда Angular загружает и отображает отложенный контент.

Когда блок `@defer` запускается, он заменяет placeholder-контент лениво загруженным контентом.

Несколько event triggers можно определить, разделяя их точкой с запятой `;`, и они будут оцениваться как условия OR.

Есть два типа triggers: `on` и `when`.

### `on` {#on}

`on` указывает условие, когда запускается блок `@defer`.

Доступные triggers следующие:

| Trigger                       | Описание                                                               |
| ----------------------------- | ---------------------------------------------------------------------- |
| [`idle`](#idle)               | Запускается, когда браузер idle. Поддерживает опциональный timeout.    |
| [`viewport`](#viewport)       | Запускается, когда указанный контент входит в viewport                 |
| [`interaction`](#interaction) | Запускается, когда пользователь взаимодействует с указанным элементом  |
| [`hover`](#hover)             | Запускается, когда мышь наводится на указанную область                 |
| [`immediate`](#immediate)     | Запускается сразу после завершения отрисовки non-deferred контента     |
| [`timer`](#timer)             | Запускается после конкретной длительности                              |

#### `idle` {#idle}

Trigger `idle` загружает отложенный контент, как только браузер достиг idle-состояния, на основе requestIdleCallback. Это поведение по умолчанию для defer-блока.

Можно опционально указать timeout в миллисекундах, который передаётся в [`requestIdleCallback`](https://developer.mozilla.org/docs/Web/API/Window/requestIdleCallback). Если браузер не запланирует callback достаточно скоро, работа выполнится не позже указанного timeout.

```angular-html
<!-- @defer (on idle) -->
@defer {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}

<!-- With a 500ms timeout -->
@defer (on idle(500)) {
  <large-cmp />
}
```

##### Настройка поведения `idle` {#customizing-idle-behavior}

Можно настроить trigger `idle`, предоставив собственную реализацию `IdleService` и зарегистрировав её с `provideIdleServiceWith` в providers приложения.

```ts
@Service()
class CustomIdleService implements IdleService {
  requestOnIdle(callback: (deadline?: IdleDeadline) => void, options?: IdleRequestOptions) {
    // Custom idle scheduling logic can be implemented here.
  }

  cancelOnIdle(id: number) {
    // Implement custom idle cancellation here.
  }
}

bootstrapApplication(App, {
  providers: [provideIdleServiceWith(CustomIdleService)],
});
```

#### `viewport` {#viewport}

Trigger `viewport` загружает отложенный контент, когда указанный контент входит в viewport, используя [Intersection Observer API](https://developer.mozilla.org/docs/Web/API/Intersection_Observer_API). Наблюдаемый контент может быть контентом `@placeholder` или явной ссылкой на элемент.

По умолчанию `@defer` следит за входом placeholder в viewport. Placeholders, используемые таким образом, должны иметь один корневой элемент.

```angular-html
@defer (on viewport) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

Альтернативно можно указать [template reference variable](/guide/templates/variables) в том же шаблоне, что и блок `@defer`, как элемент, за входом которого в viewport следят. Эта переменная передаётся как параметр trigger viewport.

```angular-html
<div #greeting>Hello!</div>
@defer (on viewport(greeting)) {
  <greetings-cmp />
}
```

Если хотите настроить опции `IntersectionObserver`, trigger `viewport` поддерживает передачу object literal. Literal поддерживает все свойства из второго параметра `IntersectionObserver`, кроме `root`. При использовании нотации object literal нужно передать trigger через свойство `trigger`.

```angular-html
<div #greeting>Hello!</div>

<!-- With options and a trigger -->
@defer (on viewport({trigger: greeting, rootMargin: '100px', threshold: 0.5})) {
  <greetings-cmp />
}

<!-- With options and an implied trigger -->
@defer (on viewport({rootMargin: '100px', threshold: 0.5})) {
  <greetings-cmp />
} @placeholder {
  <div>Implied trigger</div>
}
```

#### `interaction` {#interaction}

Trigger `interaction` загружает отложенный контент, когда пользователь взаимодействует с указанным элементом через события `click` или `keydown`.

По умолчанию placeholder выступает как элемент взаимодействия. Placeholders, используемые таким образом, должны иметь один корневой элемент.

```angular-html
@defer (on interaction) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

Альтернативно можно указать [template reference variable](/guide/templates/variables) в том же шаблоне, что и блок `@defer`, как элемент, за взаимодействиями с которым следят. Эта переменная передаётся как параметр trigger interaction.

```angular-html
<div #greeting>Hello!</div>
@defer (on interaction(greeting)) {
  <greetings-cmp />
}
```

#### `hover` {#hover}

Trigger `hover` загружает отложенный контент, когда мышь наведена на triggered-область через события `mouseover` и `focusin`.

По умолчанию placeholder выступает как элемент взаимодействия. Placeholders, используемые таким образом, должны иметь один корневой элемент.

```angular-html
@defer (on hover) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

Альтернативно можно указать [template reference variable](/guide/templates/variables) в том же шаблоне, что и блок `@defer`, как элемент, над которым наводится мышь. Эта переменная передаётся как параметр trigger hover.

```angular-html
<div #greeting>Hello!</div>
@defer (on hover(greeting)) {
  <greetings-cmp />
}
```

#### `immediate` {#immediate}

Trigger `immediate` загружает отложенный контент немедленно. Это значит, что отложенный блок загружается, как только весь остальной non-deferred контент закончил отрисовку.

```angular-html
@defer (on immediate) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

#### `timer` {#timer}

Trigger `timer` загружает отложенный контент после указанной длительности.

```angular-html
@defer (on timer(500ms)) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

Параметр длительности должен быть указан в миллисекундах (`ms`) или секундах (`s`).

### `when` {#when}

Trigger `when` принимает пользовательское условное выражение и загружает отложенный контент, когда условие становится truthy.

```angular-html
@defer (when condition) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

Это одноразовая операция — блок `@defer` не возвращается к placeholder, если условие меняется на falsy-значение после того, как стало truthy.

## Prefetching данных с `prefetch` {#prefetching-data-with-prefetch}

В дополнение к указанию условия, определяющего, когда показывается отложенный контент, можно опционально указать **prefetch trigger**. Этот trigger позволяет загрузить JavaScript, ассоциированный с блоком `@defer`, до показа отложенного контента.

Prefetching включает более продвинутые поведения — например, позволяет начать prefetch ресурсов до того, как пользователь реально увидел или взаимодействовал с defer-блоком, но может взаимодействовать с ним скоро, делая ресурсы доступными быстрее.

Можно указать prefetch trigger аналогично основному trigger блока, но с префиксом ключевого слова `prefetch`. Основной trigger блока и prefetch trigger разделяются символом точки с запятой (`;`).

В примере ниже prefetching начинается, когда браузер становится idle, а содержимое блока отрисовывается только когда пользователь взаимодействует с placeholder.

```angular-html
@defer (on interaction; prefetch on idle) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}

<!-- Prefetching with a 500ms idle timeout -->
@defer (on interaction; prefetch on idle(500)) {
  <large-cmp />
}
```

## Тестирование блоков `@defer` {#testing-defer-blocks}

Angular предоставляет TestBed API для упрощения процесса тестирования блоков `@defer` и запуска разных состояний во время тестирования. По умолчанию блоки `@defer` в тестах проигрываются так, как defer-блок вёл бы себя в реальном приложении. Если хотите вручную проходить по состояниям, можно переключить поведение defer-блока на `Manual` в конфигурации TestBed.

```angular-ts
it('should render a defer block in different states', async () => {
  // configures the defer block behavior to start in "paused" state for manual control.
  TestBed.configureTestingModule({deferBlockBehavior: DeferBlockBehavior.Manual});
  @Component({
    // ...
    template: `
      @defer {
        <large-component />
      } @placeholder {
        Placeholder
      } @loading {
        Loading...
      }
    `,
  })
  class ExampleA {}
  // Create component fixture.
  const componentFixture = TestBed.createComponent(ExampleA);
  // Retrieve the list of all defer block fixtures and get the first block.
  const deferBlockFixture = (await componentFixture.getDeferBlocks())[0];
  // Renders placeholder state by default.
  expect(componentFixture.nativeElement.innerHTML).toContain('Placeholder');
  // Render loading state and verify rendered output.
  await deferBlockFixture.render(DeferBlockState.Loading);
  expect(componentFixture.nativeElement.innerHTML).toContain('Loading');
  // Render final state and verify the output.
  await deferBlockFixture.render(DeferBlockState.Complete);
  expect(componentFixture.nativeElement.innerHTML).toContain('large works!');
});
```

## Работает ли `@defer` с `NgModule`? {#does-defer-work-with-ngmodule}

Блоки `@defer` совместимы и со standalone, и с NgModule-based компонентами, директивами и pipes. Однако **только standalone компоненты, директивы и pipes могут быть отложены**. NgModule-based зависимости не откладываются и включаются в eagerly loaded бандл.

## Совместимость между блоками `@defer` и Hot Module Reload (HMR) {#compatibility-between-defer-blocks-and-hot-module-reload-hmr}

Когда активен Hot Module Replacement (HMR), все chunks блоков `@defer` загружаются eagerly, переопределяя любые настроенные triggers. Чтобы восстановить стандартное поведение triggers, нужно отключить HMR, обслуживая приложение с флагом `--no-hmr`.

## Как `@defer` работает с server-side rendering (SSR) и static-site generation (SSG)? {#how-does-defer-work-with-server-side-rendering-ssr-and-static-site-generation-ssg}

По умолчанию при отрисовке приложения на сервере (либо с SSR, либо с SSG) defer-блоки всегда отрисовывают свой `@placeholder` (или ничего, если placeholder не указан), и triggers не вызываются. На клиенте контент `@placeholder` гидратируется, и triggers активируются.

Чтобы отрисовать основной контент блоков `@defer` на сервере (и SSR, и SSG), можно включить [возможность Incremental Hydration](/guide/incremental-hydration) и настроить triggers `hydrate` для необходимых блоков.

## Barrel-файлы и lazy chunks {#barrel-files-and-lazy-chunks}

Если используете `@defer`, но не видите отдельный lazy chunk в выводе сборки, проверьте, как импортируете отложенный компонент. Импорт через barrel-файл (`index.ts`) — распространённая причина: бандлеры видят barrel как один модуль и держат все его exports вместе, поэтому ваш компонент оказывается в основном бандле независимо от `@defer`.

```typescript
// index.ts
export {HeavyComponent} from './heavy.component';
export {OtherComponent} from './other.component';
```

```typescript
// parent.component.ts
import {HeavyComponent} from './index'; // pulls in OtherComponent too

@Component({
  imports: [HeavyComponent],
  template: `@defer {
    <heavy-component />
  }`,
})
export class ParentComponent {}
```

Исправление прямолинейно — импортируйте напрямую из собственного файла компонента:

```typescript
import {HeavyComponent} from './heavy.component';
```

Этого достаточно, чтобы бандлер выделил его в собственный chunk и загрузил лениво, когда сработает trigger.

## Лучшие практики для отложенных views {#best-practices-for-deferring-views}

### Избегайте каскадных загрузок с вложенными блоками `@defer` {#avoid-cascading-loads-with-nested-defer-blocks}

Когда у вас вложенные блоки `@defer`, у них должны быть разные triggers, чтобы избежать одновременной загрузки, которая вызывает каскадные запросы и может негативно влиять на производительность загрузки страницы.

### Избегайте layout shifts {#avoid-layout-shifts}

Избегайте откладывания компонентов, видимых в viewport пользователя при начальной загрузке. Это может негативно влиять на Core Web Vitals, вызывая увеличение cumulative layout shift (CLS).

Если это необходимо, избегайте triggers `immediate`, `timer`, `viewport` и пользовательских `when`, которые заставляют контент загружаться во время начальной отрисовки страницы.

### Учитывайте accessibility {#keep-accessibility-in-mind}

При использовании блоков `@defer` учитывайте влияние на пользователей со вспомогательными технологиями вроде screen readers.
Screen readers, фокусирующиеся на отложенной секции, изначально прочитают placeholder или loading-контент, но могут не объявить изменения, когда загружается отложенный контент.

Чтобы гарантировать, что изменения отложенного контента объявляются screen readers, можно обернуть блок `@defer` в элемент с live region:

```angular-html
<div aria-live="polite" aria-atomic="true">
  @defer (on timer(2000)) {
    <user-profile [user]="currentUser" />
  } @placeholder {
    Loading user profile...
  } @loading {
    Please wait...
  } @error {
    Failed to load profile
  }
</div>
```

Это гарантирует, что изменения объявляются пользователю, когда происходят переходы (placeholder &rarr; loading &rarr; content/error).
