# Отложенная загрузка с `@defer`

Откладываемые представления, также известные как блоки `@defer`, уменьшают начальный размер бандла приложения, откладывая загрузку кода, который не является строго необходимым для первоначального рендеринга страницы. Это часто приводит к более быстрой начальной загрузке и улучшению Core Web Vitals (CWV), прежде всего Largest Contentful Paint (LCP) и Time to First Byte (TTFB).

Для использования этой функции можно декларативно обернуть секцию шаблона в блок `@defer`:

```angular-html
@defer {
  <large-component />
}
```

Код для компонентов, директив и пайпов внутри блока `@defer` выделяется в отдельный JavaScript-файл и загружается только при необходимости, после того как остальная часть шаблона была отрендерена.

Откладываемые представления поддерживают различные триггеры, параметры предварительной загрузки и вложенные блоки для управления состояниями заполнителя, загрузки и ошибки.

## Какие зависимости откладываются? {#which-dependencies-are-deferred}

Компоненты, директивы, пайпы и CSS-стили компонентов могут быть отложены при загрузке приложения.

Чтобы зависимости внутри блока `@defer` могли быть отложены, они должны соответствовать двум условиям:

1. **Они должны быть standalone.** Не-standalone зависимости не могут быть отложены и загружаются нетерпеливо, даже если находятся внутри блоков `@defer`.
1. **На них не должно быть ссылок за пределами блоков `@defer` в том же файле.** Если на них ссылаются за пределами блока `@defer` или в запросах ViewChild, зависимости будут загружены нетерпеливо.

_Транзитивные_ зависимости компонентов, директив и пайпов, используемых в блоке `@defer`, не обязательно должны быть standalone; транзитивные зависимости могут быть объявлены в `NgModule` и участвовать в отложенной загрузке.

Компилятор Angular создаёт оператор [динамического импорта](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) для каждого компонента, директивы и пайпа, используемых в блоке `@defer`. Основное содержимое блока рендерится после разрешения всех импортов. Angular не гарантирует какой-либо конкретный порядок этих импортов.

## Управление различными стадиями отложенной загрузки {#how-to-manage-different-stages-of-deferred-loading}

Блоки `@defer` имеют несколько вложенных блоков для корректной обработки различных стадий процесса отложенной загрузки.

### `@defer`

Это основной блок, определяющий секцию контента, которая загружается лениво. Он не рендерится изначально — отложенный контент загружается и рендерится после наступления указанного [триггера](#controlling-deferred-content-loading-with-triggers) или выполнения условия `when`.

По умолчанию блок `@defer` активируется, когда браузер переходит в состояние [idle](guide/templates/defer#idle).

```angular-html
@defer {
  <large-component />
}
```

### Отображение содержимого-заполнителя с `@placeholder` {#show-placeholder-content-with-placeholder}

По умолчанию блоки `@defer` не рендерят никакого содержимого до момента активации.

`@placeholder` — необязательный блок, объявляющий содержимое, отображаемое до активации блока `@defer`.

```angular-html
@defer {
  <large-component />
} @placeholder {
  <p>Placeholder content</p>
}
```

Хотя блок является необязательным, некоторые триггеры могут требовать наличия `@placeholder` или [переменной ссылки на шаблон](guide/templates/variables#template-reference-variables) для функционирования. Подробнее см. в разделе [Триггеры](#controlling-deferred-content-loading-with-triggers).

Angular заменяет содержимое заполнителя основным содержимым после завершения загрузки. В секции заполнителя можно использовать любой контент: простой HTML, компоненты, директивы и пайпы. Следует помнить, что _зависимости блока заполнителя загружаются нетерпеливо_.

Блок `@placeholder` принимает необязательный параметр для указания минимального времени (`minimum`) отображения заполнителя после его первоначального рендеринга.

```angular-html
@defer {
  <large-component />
} @placeholder (minimum 500ms) {
  <p>Placeholder content</p>
}
```

Параметр `minimum` указывается в единицах времени: миллисекундах (ms) или секундах (s). Этот параметр позволяет предотвратить быстрое мерцание содержимого заполнителя в случае быстрой загрузки отложенных зависимостей.

### Отображение содержимого загрузки с `@loading` {#show-loading-content-with-loading}

Блок `@loading` — необязательный блок, позволяющий объявить контент, отображаемый во время загрузки отложенных зависимостей. Он заменяет блок `@placeholder` после начала загрузки.

```angular-html
@defer {
  <large-component />
} @loading {
  <img alt="loading..." src="loading.gif" />
} @placeholder {
  <p>Placeholder content</p>
}
```

Его зависимости загружаются нетерпеливо (аналогично `@placeholder`).

Блок `@loading` принимает два необязательных параметра для предотвращения быстрого мерцания контента, которое может возникать при быстрой загрузке отложенных зависимостей:

- `minimum` — минимальное время отображения заполнителя
- `after` — время ожидания после начала загрузки перед отображением шаблона загрузки

```angular-html
@defer {
  <large-component />
} @loading (after 100ms; minimum 1s) {
  <img alt="loading..." src="loading.gif" />
}
```

Оба параметра указываются в единицах времени: миллисекундах (ms) или секундах (s). Кроме того, таймеры для обоих параметров начинают отсчёт сразу после начала загрузки.

### Отображение состояния ошибки при сбое отложенной загрузки с `@error` {#show-error-state-when-deferred-loading-fails-with-error}

Блок `@error` — необязательный блок, отображаемый при сбое отложенной загрузки. Аналогично `@placeholder` и `@loading`, зависимости блока `@error` загружаются нетерпеливо.

```angular-html
@defer {
  <large-component />
} @error {
  <p>Failed to load large component.</p>
}
```

## Управление загрузкой отложенного контента с помощью триггеров {#controlling-deferred-content-loading-with-triggers}

Можно указать **триггеры**, управляющие тем, когда Angular загружает и отображает отложенный контент.

При активации блока `@defer` содержимое заполнителя заменяется лениво загруженным контентом.

Несколько триггеров событий можно определить, разделив их точкой с запятой `;`; они будут вычисляться как условия ИЛИ.

Существует два типа триггеров: `on` и `when`.

### `on` {#on}

`on` задаёт условие активации блока `@defer`.

Доступные триггеры:

| Триггер                       | Описание                                                                      |
| ----------------------------- | ----------------------------------------------------------------------------- |
| [`idle`](#idle)               | Активируется, когда браузер простаивает. Поддерживает необязательный таймаут. |
| [`viewport`](#viewport)       | Активируется, когда указанный контент входит в область просмотра              |
| [`interaction`](#interaction) | Активируется при взаимодействии пользователя с указанным элементом            |
| [`hover`](#hover)             | Активируется при наведении мыши на указанную область                          |
| [`immediate`](#immediate)     | Активируется сразу после завершения рендеринга неотложенного контента          |
| [`timer`](#timer)             | Активируется после указанной задержки                                         |

#### `idle` {#idle}

Триггер `idle` загружает отложенный контент, когда браузер достигает состояния простоя, основываясь на `requestIdleCallback`. Это поведение по умолчанию для блока `@defer`.

Опционально можно указать таймаут в миллисекундах, передаваемый в [`requestIdleCallback`](https://developer.mozilla.org/docs/Web/API/Window/requestIdleCallback). Если браузер не запланирует колбэк достаточно быстро, работа выполнится не позднее указанного таймаута.

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

Поведение триггера `idle` можно настроить, предоставив собственную реализацию `IdleService` и зарегистрировав её с помощью `provideIdleServiceWith` в провайдерах приложения.

```ts
@Injectable({providedIn: 'root'})
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

Триггер `viewport` загружает отложенный контент, когда указанный контент входит в область просмотра с помощью [Intersection Observer API](https://developer.mozilla.org/docs/Web/API/Intersection_Observer_API). Наблюдаемым контентом может быть содержимое `@placeholder` или явная ссылка на элемент.

По умолчанию `@defer` отслеживает вход заполнителя в область просмотра. Заполнители, используемые таким образом, должны иметь единственный корневой элемент.

```angular-html
@defer (on viewport) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

Альтернативно можно указать [переменную ссылки на шаблон](guide/templates/variables) в том же шаблоне, что и блок `@defer`, как элемент, отслеживаемый для входа в область просмотра. Эта переменная передаётся в качестве параметра триггера viewport.

```angular-html
<div #greeting>Hello!</div>
@defer (on viewport(greeting)) {
  <greetings-cmp />
}
```

Для настройки параметров `IntersectionObserver` триггер `viewport` поддерживает передачу объектного литерала. Литерал поддерживает все свойства второго параметра `IntersectionObserver`, кроме `root`. При использовании объектного литерала нужно передавать триггер через свойство `trigger`.

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

Триггер `interaction` загружает отложенный контент при взаимодействии пользователя с указанным элементом через события `click` или `keydown`.

По умолчанию заполнитель выступает в роли элемента взаимодействия. Заполнители, используемые таким образом, должны иметь единственный корневой элемент.

```angular-html
@defer (on interaction) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

Альтернативно можно указать [переменную ссылки на шаблон](guide/templates/variables) в том же шаблоне, что и блок `@defer`, как элемент, отслеживаемый для взаимодействий. Эта переменная передаётся в качестве параметра триггера viewport.

```angular-html
<div #greeting>Hello!</div>
@defer (on interaction(greeting)) {
  <greetings-cmp />
}
```

#### `hover` {#hover}

Триггер `hover` загружает отложенный контент при наведении мыши на область триггера через события `mouseover` и `focusin`.

По умолчанию заполнитель выступает в роли элемента взаимодействия. Заполнители, используемые таким образом, должны иметь единственный корневой элемент.

```angular-html
@defer (on hover) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

Альтернативно можно указать [переменную ссылки на шаблон](guide/templates/variables) в том же шаблоне, что и блок `@defer`, как элемент, отслеживаемый для входа в область просмотра. Эта переменная передаётся в качестве параметра триггера viewport.

```angular-html
<div #greeting>Hello!</div>
@defer (on hover(greeting)) {
  <greetings-cmp />
}
```

#### `immediate` {#immediate}

Триггер `immediate` загружает отложенный контент немедленно. Это означает, что блок `@defer` загружается сразу после того, как весь остальной неотложенный контент завершит рендеринг.

```angular-html
@defer (on immediate) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

#### `timer` {#timer}

Триггер `timer` загружает отложенный контент после указанной задержки.

```angular-html
@defer (on timer(500ms)) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

Параметр длительности должен быть указан в миллисекундах (`ms`) или секундах (`s`).

### `when` {#when}

Триггер `when` принимает пользовательское условное выражение и загружает отложенный контент, когда условие становится истинным.

```angular-html
@defer (when condition) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

Это однократная операция — блок `@defer` не возвращается к заполнителю, если условие впоследствии становится ложным после того, как было истинным.

## Предварительная загрузка данных с `prefetch` {#prefetching-data-with-prefetch}

Помимо указания условия, определяющего, когда отображается отложенный контент, можно опционально указать **триггер предварительной загрузки**. Этот триггер позволяет загрузить JavaScript, связанный с блоком `@defer`, до отображения отложенного контента.

Предварительная загрузка обеспечивает более продвинутые сценарии поведения, например позволяя начать загрузку ресурсов до того, как пользователь увидел или взаимодействовал с блоком `@defer`, делая ресурсы доступными быстрее.

Триггер предварительной загрузки указывается аналогично основному триггеру блока, но с префиксом `prefetch`. Основной триггер и триггер предварительной загрузки разделяются точкой с запятой (`;`).

В примере ниже предварительная загрузка начинается, когда браузер простаивает, а содержимое блока рендерится только после взаимодействия пользователя с заполнителем.

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

Angular предоставляет API TestBed для упрощения тестирования блоков `@defer` и активации различных состояний во время тестирования. По умолчанию блоки `@defer` в тестах работают так же, как в реальном приложении. Для ручного перехода по состояниям можно переключить поведение блока `@defer` на `Manual` в конфигурации TestBed.

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

## Совместимость `@defer` с `NgModule`? {#does-defer-work-with-ngmodule}

Блоки `@defer` совместимы как со standalone, так и с NgModule-компонентами, директивами и пайпами. Однако **откладываться могут только standalone-компоненты, директивы и пайпы**. NgModule-зависимости не откладываются и включаются в нетерпеливо загружаемый бандл.

## Совместимость блоков `@defer` с Hot Module Reload (HMR) {#compatibility-between-defer-blocks-and-hot-module-reload-hmr}

Когда активна замена горячих модулей (HMR), все чанки блоков `@defer` загружаются нетерпеливо, переопределяя настроенные триггеры. Для восстановления стандартного поведения триггеров необходимо отключить HMR, запустив приложение с флагом `--no-hmr`.

## Как `@defer` работает с серверным рендерингом (SSR) и генерацией статических сайтов (SSG)? {#how-does-defer-work-with-server-side-rendering-ssr-and-static-site-generation-ssg}

По умолчанию при рендеринге приложения на сервере (через SSR или SSG) блоки `@defer` всегда рендерят свой `@placeholder` (или ничего, если заполнитель не указан), а триггеры не активируются. На клиенте содержимое `@placeholder` гидратируется, и триггеры активируются.

Для рендеринга основного содержимого блоков `@defer` на сервере (как SSR, так и SSG) можно включить [функцию инкрементальной гидратации](guide/incremental-hydration) и настроить триггеры `hydrate` для необходимых блоков.

## Лучшие практики для откладывания представлений {#best-practices-for-deferring-views}

### Избегайте каскадных загрузок с вложенными блоками `@defer` {#avoid-cascading-loads-with-nested-defer-blocks}

При наличии вложенных блоков `@defer` у них должны быть разные триггеры, чтобы избежать одновременной загрузки, которая вызывает каскадные запросы и может негативно влиять на производительность загрузки страницы.

### Избегайте сдвигов макета {#avoid-layout-shifts}

Избегайте откладывания компонентов, видимых в области просмотра пользователя при первоначальной загрузке. Это может негативно влиять на Core Web Vitals, вызывая увеличение совокупного сдвига макета (CLS).

Если это всё же необходимо, избегайте триггеров `immediate`, `timer`, `viewport` и пользовательских `when`, которые вызывают загрузку контента при первоначальном рендеринге страницы.

### Помните о доступности {#keep-accessibility-in-mind}

При использовании блоков `@defer` учитывайте влияние на пользователей вспомогательных технологий, таких как программы чтения с экрана.
Программы чтения с экрана, фокусирующиеся на откладываемом разделе, изначально будут читать содержимое заполнителя или загрузки, но могут не объявлять об изменениях при загрузке отложенного контента.

Чтобы изменения в отложенном контенте были объявлены программам чтения с экрана, можно обернуть блок `@defer` в элемент с живой областью:

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

Это обеспечивает объявление изменений пользователю при переходах (заполнитель &rarr; загрузка &rarr; контент/ошибка).
