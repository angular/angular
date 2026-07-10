# Инкрементальная гидратация

**Инкрементальная гидратация** — продвинутый тип [гидратации](guide/hydration), при котором части приложения могут оставаться дегидратированными и _постепенно_ гидратироваться по мере необходимости.

## Зачем использовать инкрементальную гидратацию? {#why-use-incremental-hydration}

Инкрементальная гидратация — улучшение производительности поверх полной гидратации приложения. Она может давать меньшие начальные бандлы при UX, сопоставимом с полной гидратацией. Меньшие бандлы ускоряют начальную загрузку, снижая [First Input Delay (FID)](https://web.dev/fid) и [Cumulative Layout Shift (CLS)](https://web.dev/cls).

Инкрементальная гидратация также позволяет использовать откладываемые views (`@defer`) для контента, который раньше нельзя было откладывать. В частности, теперь можно использовать `@defer` для контента above the fold. До инкрементальной гидратации размещение `@defer` above the fold приводило к рендеру placeholder и последующей замене основным шаблоном блока `@defer` — это вызывало сдвиг макета. С инкрементальной гидратацией основной шаблон блока `@defer` рендерится без сдвига макета при гидратации.

## Как включить инкрементальную гидратацию в Angular? {#how-do-you-enable-incremental-hydration-in-angular}

Инкрементальную гидратацию можно включить для приложений, которые уже используют SSR с гидратацией. Сначала следуйте [руководству по Angular SSR](guide/ssr) для включения серверного рендеринга и [руководству по гидратации](guide/hydration) для включения гидратации.

Инкрементальная гидратация включена по умолчанию при использовании `provideClientHydration()`.

```ts
import {bootstrapApplication, provideClientHydration} from '@angular/platform-browser';

bootstrapApplication(App, {
  providers: [provideClientHydration()],
});
```

NOTE: Инкрементальная гидратация зависит от [повтора событий](guide/hydration#capturing-and-replaying-events) и включает его автоматически. Если у вас уже есть `withEventReplay()` в списке, его можно безопасно удалить.

Чтобы отказаться от инкрементальной гидратации, используйте `withNoIncrementalHydration()`:

```ts
import {
  bootstrapApplication,
  provideClientHydration,
  withNoIncrementalHydration,
} from '@angular/platform-browser';

bootstrapApplication(App, {
  providers: [provideClientHydration(withNoIncrementalHydration())],
});
```

## Как работает инкрементальная гидратация? {#how-does-incremental-hydration-work}

Инкрементальная гидратация строится поверх полной [гидратации](guide/hydration) приложения, [откладываемых views](/guide/templates/defer) и [повтора событий](guide/hydration#capturing-and-replaying-events). С инкрементальной гидратацией к блокам `@defer` можно добавлять дополнительные триггеры, задающие границы инкрементальной гидратации. Добавление триггера `hydrate` к defer-блоку говорит Angular загрузить зависимости этого блока при SSR и отрендерить основной шаблон вместо `@placeholder`. При клиентском рендеринге зависимости по-прежнему откладываются, а контент defer-блока остаётся дегидратированным, пока не сработает триггер `hydrate`. Этот триггер заставляет defer-блок загрузить зависимости и гидратировать контент. Любые события браузера — в частности те, что соответствуют слушателям, зарегистрированным в компоненте, — вызванные пользователем до гидратации, ставятся в очередь и воспроизводятся после завершения гидратации.

## Управление гидратацией контента с помощью триггеров {#controlling-hydration-of-content-with-triggers}

Можно задать **hydrate-триггеры**, которые контролируют, когда Angular загружает и гидратирует отложенный контент. Это дополнительные триггеры наряду с обычными триггерами `@defer`.

У каждого блока `@defer` может быть несколько hydrate-триггеров, разделённых точкой с запятой (`;`). Angular запускает гидратацию, когда срабатывает _любой_ из триггеров.

Есть три типа hydrate-триггеров: `hydrate on`, `hydrate when` и `hydrate never`.

### `hydrate on` {#hydrate-on}

`hydrate on` задаёт условие, при котором запускается гидратация блока `@defer`.

Доступные триггеры:

| Триггер                                             | Описание                                                                 |
| --------------------------------------------------- | ------------------------------------------------------------------------ |
| [`hydrate on idle`](#hydrate-on-idle)               | Срабатывает, когда браузер простаивает. Поддерживает опциональный timeout. |
| [`hydrate on viewport`](#hydrate-on-viewport)       | Срабатывает, когда указанный контент попадает во viewport                |
| [`hydrate on interaction`](#hydrate-on-interaction) | Срабатывает при взаимодействии пользователя с указанным элементом        |
| [`hydrate on hover`](#hydrate-on-hover)             | Срабатывает при наведении мыши на указанную область                      |
| [`hydrate on immediate`](#hydrate-on-immediate)     | Срабатывает сразу после рендера не-отложенного контента                  |
| [`hydrate on timer`](#hydrate-on-timer)             | Срабатывает через заданный интервал                                      |

#### `hydrate on idle` {#hydrate-on-idle}

Триггер `hydrate on idle` загружает зависимости откладываемого view и гидратирует контент, когда браузер переходит в idle-состояние на основе `requestIdleCallback`.

Опционально можно указать timeout в миллисекундах, который передаётся в [`requestIdleCallback`](https://developer.mozilla.org/docs/Web/API/Window/requestIdleCallback). Если браузер не запланирует callback достаточно быстро, работа выполнится не позже указанного timeout.

```angular-html
@defer (hydrate on idle) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}

<!-- With a 500ms timeout -->
@defer (hydrate on idle(500)) {
  <large-cmp />
}
```

#### `hydrate on viewport` {#hydrate-on-viewport}

Триггер `hydrate on viewport` загружает зависимости откладываемого view и гидратирует соответствующую часть приложения, когда указанный контент попадает во viewport, используя
[Intersection Observer API](https://developer.mozilla.org/docs/Web/API/Intersection_Observer_API).

```angular-html
@defer (hydrate on viewport) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

#### `hydrate on interaction` {#hydrate-on-interaction}

Триггер `hydrate on interaction` загружает зависимости откладываемого view и гидратирует контент, когда пользователь взаимодействует с указанным элементом через события `click` или `keydown`.

```angular-html
@defer (hydrate on interaction) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

#### `hydrate on hover` {#hydrate-on-hover}

Триггер `hydrate on hover` загружает зависимости откладываемого view и гидратирует контент, когда мышь наведена на область триггера через события `mouseover` и `focusin`.

```angular-html
@defer (hydrate on hover) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

#### `hydrate on immediate` {#hydrate-on-immediate}

Триггер `hydrate on immediate` загружает зависимости откладываемого view и гидратирует контент немедленно. То есть отложенный блок загружается сразу после того, как весь остальной не-отложенный контент закончил рендериться.

```angular-html
@defer (hydrate on immediate) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

#### `hydrate on timer` {#hydrate-on-timer}

Триггер `hydrate on timer` загружает зависимости откладываемого view и гидратирует контент через заданный интервал.

```angular-html
@defer (hydrate on timer(500ms)) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

Параметр длительности должен быть указан в миллисекундах (`ms`) или секундах (`s`).

### `hydrate when` {#hydrate-when}

Триггер `hydrate when` принимает пользовательское условное выражение и загружает зависимости откладываемого view и гидратирует контент, когда условие становится truthy.

```angular-html
@defer (hydrate when condition) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

NOTE: Условия `hydrate when` срабатывают только для самого верхнего дегидратированного блока `@defer`. Условие триггера задаётся в родительском компоненте, который должен существовать до срабатывания. Если родительский блок дегидратирован, Angular ещё не сможет разрешить это выражение.

### `hydrate never` {#hydrate-never}

`hydrate never` позволяет указать, что контент в defer-блоке должен оставаться дегидратированным бесконечно, фактически становясь статическим контентом. Это относится только к начальному рендеру. При последующем клиентском рендере блок `@defer` с `hydrate never` всё равно загрузит зависимости, так как гидратация применяется только к начальной загрузке SSR-контента. В примере ниже при последующих клиентских рендерах зависимости блока `@defer` загрузятся по viewport.

```angular-html
@defer (on viewport; hydrate never) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

NOTE: Использование `hydrate never` предотвращает гидратацию всего вложенного поддерева данного блока `@defer`. Другие `hydrate`-триггеры для контента внутри этого блока не сработают.

## Hydrate-триггеры вместе с обычными триггерами {#hydrate-triggers-alongside-regular-triggers}

Hydrate-триггеры — дополнительные триггеры наряду с обычными триггерами блока `@defer`. Гидратация — оптимизация начальной загрузки, поэтому hydrate-триггеры применяются только к ней. Любой последующий клиентский рендер по-прежнему использует обычный триггер.

```angular-html
@defer (on idle; hydrate on interaction) {
  <example-cmp />
} @placeholder {
  <div>Example Placeholder</div>
}
```

В этом примере при начальной загрузке применяется `hydrate on interaction`. Гидратация запустится при взаимодействии с компонентом `<example-cmp />`. При любой последующей загрузке страницы с клиентским рендерингом — например, когда пользователь кликает по routerLink, загружающему страницу с этим компонентом, — применится `on idle`.

## Как инкрементальная гидратация работает со вложенными блоками `@defer`? {#how-does-incremental-hydration-work-with-nested-defer-blocks}

Система компонентов и зависимостей Angular иерархична: для гидратации любого компонента нужно гидратировать и всех его родителей. Поэтому если гидратация запускается для дочернего блока `@defer` во вложенном наборе дегидратированных блоков `@defer`, гидратация идёт сверху вниз — от самого верхнего дегидратированного блока `@defer` к сработавшему дочернему — в этом порядке.

```angular-html
@defer (hydrate on interaction) {
  <parent-block-cmp />
  @defer (hydrate on hover) {
    <child-block-cmp />
  } @placeholder {
    <div>Child placeholder</div>
  }
} @placeholder {
  <div>Parent Placeholder</div>
}
```

В примере выше наведение на вложенный блок `@defer` запускает гидратацию. Сначала гидратируется родительский блок `@defer` с `<parent-block-cmp />`, затем — дочерний блок `@defer` с `<child-block-cmp />`.

## Ограничения {#constraints}

У инкрементальной гидратации те же ограничения, что и у полной гидратации приложения, включая ограничения на прямую манипуляцию DOM и требование валидной HTML-структуры. Подробнее — в разделе [Ограничения руководства по гидратации](guide/hydration#constraints).

## Нужно ли по-прежнему указывать блоки `@placeholder`? {#do-i-still-need-to-specify-placeholder-blocks}

Да. Контент блока `@placeholder` не используется для инкрементальной гидратации, но `@placeholder` всё равно нужен для последующих случаев клиентского рендеринга. Если контент не был на маршруте начальной загрузки, любая навигация к маршруту с вашим блоком `@defer` отрендерит его как обычный блок `@defer`. Поэтому в таких случаях клиентского рендеринга рендерится `@placeholder`.
