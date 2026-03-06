# Инкрементная Гидратация {#incremental-hydration}

**Инкрементная Гидратация** — продвинутый вид [Гидратации](guide/hydration), позволяющий оставлять отдельные части приложения дегидратированными и _постепенно_ запускать их Гидратацию по мере необходимости.

## Зачем использовать инкрементную Гидратацию? {#why-use-incremental-hydration}

Инкрементная Гидратация — это улучшение производительности, надстроенное поверх полной Гидратации приложения. Она позволяет создавать меньшие начальные бандлы, при этом обеспечивая конечному пользователю опыт, сопоставимый с полной Гидратацией. Меньшие бандлы улучшают время начальной загрузки, снижая [First Input Delay (FID)](https://web.dev/fid) и [Cumulative Layout Shift (CLS)](https://web.dev/cls).

Инкрементная Гидратация также позволяет использовать deferrable views (`@defer`) для контента, который раньше не мог быть отложен. В частности, теперь можно использовать deferrable views для контента, расположенного в верхней части экрана (above the fold). До инкрементной Гидратации размещение блока `@defer` в верхней части экрана приводило к рендерингу placeholder-контента, который затем заменялся основным контентом блока `@defer`. Это вызывало сдвиг компоновки. Инкрементная Гидратация означает, что основной Шаблон блока `@defer` рендерится без сдвига компоновки при Гидратации.

## Как включить инкрементную Гидратацию в Angular? {#how-do-you-enable-incremental-hydration-in-angular}

Инкрементную Гидратацию можно включить в приложениях, уже использующих SSR с Гидратацией. Сначала следуйте [руководству по Angular SSR](guide/ssr), чтобы включить рендеринг на стороне сервера, и [руководству по Гидратации Angular](guide/hydration), чтобы включить Гидратацию.

Включите инкрементную Гидратацию, добавив функцию `withIncrementalHydration()` в провайдер `provideClientHydration`.

```typescript
import {
  bootstrapApplication,
  provideClientHydration,
  withIncrementalHydration,
} from '@angular/platform-browser';
...

bootstrapApplication(App, {
  providers: [provideClientHydration(withIncrementalHydration())]
});
```

Инкрементная Гидратация автоматически зависит от и включает [воспроизведение событий](guide/hydration#capturing-and-replaying-events). Если в вашем списке уже есть `withEventReplay()`, его можно безопасно удалить после включения инкрементной Гидратации.

## Как работает инкрементная Гидратация? {#how-does-incremental-hydration-work}

Инкрементная Гидратация строится поверх полной [Гидратации](guide/hydration) приложения, [deferrable views](/guide/templates/defer) и [воспроизведения событий](guide/hydration#capturing-and-replaying-events). При инкрементной Гидратации можно добавлять дополнительные триггеры к блокам `@defer`, определяя границы инкрементной Гидратации. Добавление триггера `hydrate` к defer-блоку сообщает Angular, что нужно загрузить зависимости этого блока во время SSR и отрендерить основной Шаблон вместо `@placeholder`. При CSR зависимости всё равно откладываются, и содержимое defer-блока остаётся дегидратированным до срабатывания триггера `hydrate`. Этот триггер даёт блоку команду получить зависимости и гидратировать контент. Браузерные события — в частности, те, что соответствуют слушателям, зарегистрированным в вашем Компоненте, — инициированные пользователем до Гидратации, ставятся в очередь и воспроизводятся после завершения процесса Гидратации.

## Управление Гидратацией контента с помощью триггеров {#controlling-hydration-of-content-with-triggers}

Можно указывать **триггеры гидратации**, управляющие моментом загрузки и гидратации отложенного контента. Это дополнительные триггеры, используемые совместно с обычными триггерами `@defer`.

Каждый блок `@defer` может иметь несколько триггеров гидратации, разделённых точкой с запятой (`;`). Angular запускает Гидратацию при срабатывании _любого_ из триггеров.

Существует три типа триггеров гидратации: `hydrate on`, `hydrate when` и `hydrate never`.

### `hydrate on` {#hydrate-on}

`hydrate on` задаёт условие запуска Гидратации для блока `@defer`.

Доступные триггеры:

| Триггер                                             | Описание                                                                              |
| --------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [`hydrate on idle`](#hydrate-on-idle)               | Срабатывает, когда браузер находится в режиме ожидания                                |
| [`hydrate on viewport`](#hydrate-on-viewport)       | Срабатывает, когда указанный контент появляется в области просмотра                   |
| [`hydrate on interaction`](#hydrate-on-interaction) | Срабатывает при взаимодействии пользователя с указанным элементом                    |
| [`hydrate on hover`](#hydrate-on-hover)             | Срабатывает при наведении мыши на указанную область                                  |
| [`hydrate on immediate`](#hydrate-on-immediate)     | Срабатывает сразу после завершения рендеринга не-отложенного контента                |
| [`hydrate on timer`](#hydrate-on-timer)             | Срабатывает по истечении заданного времени                                            |

#### `hydrate on idle` {#hydrate-on-idle}

Триггер `hydrate on idle` загружает зависимости deferrable view и гидратирует контент, когда браузер переходит в режим ожидания на основе `requestIdleCallback`.

```angular-html
@defer (hydrate on idle) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

#### `hydrate on viewport` {#hydrate-on-viewport}

Триггер `hydrate on viewport` загружает зависимости deferrable view и гидратирует соответствующую страницу приложения, когда указанный контент появляется в области просмотра с использованием
[Intersection Observer API](https://developer.mozilla.org/docs/Web/API/Intersection_Observer_API).

```angular-html
@defer (hydrate on viewport) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

#### `hydrate on interaction` {#hydrate-on-interaction}

Триггер `hydrate on interaction` загружает зависимости deferrable view и гидратирует контент при взаимодействии пользователя с указанным элементом через события
`click` или `keydown`.

```angular-html
@defer (hydrate on interaction) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

#### `hydrate on hover` {#hydrate-on-hover}

Триггер `hydrate on hover` загружает зависимости deferrable view и гидратирует контент при наведении мыши на указанную область через события
`mouseover` и `focusin`.

```angular-html
@defer (hydrate on hover) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

#### `hydrate on immediate` {#hydrate-on-immediate}

Триггер `hydrate on immediate` загружает зависимости deferrable view и немедленно гидратирует контент. Это означает, что отложенный блок загружается сразу
после завершения рендеринга всего не-отложенного контента.

```angular-html
@defer (hydrate on immediate) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

#### `hydrate on timer` {#hydrate-on-timer}

Триггер `hydrate on timer` загружает зависимости deferrable view и гидратирует контент по истечении заданного времени.

```angular-html
@defer (hydrate on timer(500ms)) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

Параметр длительности должен быть указан в миллисекундах (`ms`) или секундах (`s`).

### `hydrate when` {#hydrate-when}

Триггер `hydrate when` принимает произвольное условное выражение и загружает зависимости deferrable view и гидратирует контент, когда
условие становится истинным.

```angular-html
@defer (hydrate when condition) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

NOTE: Условия `hydrate when` срабатывают только тогда, когда они являются верхним дегидратированным блоком `@defer`. Условие, заданное для триггера,
указывается в родительском Компоненте, который должен существовать до момента срабатывания. Если родительский блок дегидратирован, это выражение ещё не может быть разрешено Angular.

### `hydrate never` {#hydrate-never}

`hydrate never` позволяет указать, что содержимое defer-блока должно оставаться дегидратированным бессрочно, фактически становясь статическим
контентом. Обратите внимание, что это применяется только к начальному рендерингу. При последующем CSR блок `@defer` с `hydrate never` всё равно
загрузит зависимости, поскольку Гидратация применяется только к начальной загрузке контента, отрендеренного на сервере. В приведённом ниже примере при последующем CSR
зависимости блока `@defer` загружаются по событию viewport.

```angular-html
@defer (on viewport; hydrate never) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

NOTE: Использование `hydrate never` предотвращает Гидратацию всего вложенного поддерева данного блока `@defer`. Никакие другие триггеры `hydrate` не срабатывают для контента, вложенного в этот блок.

## Триггеры гидратации и обычные триггеры {#hydrate-triggers-alongside-regular-triggers}

Триггеры гидратации — это дополнительные триггеры, используемые совместно с обычными триггерами на блоке `@defer`. Гидратация является оптимизацией начальной загрузки, поэтому триггеры гидратации применяются только к этой начальной загрузке. При любом последующем CSR по-прежнему будет использоваться обычный триггер.

```angular-html
@defer (on idle; hydrate on interaction) {
  <example-cmp />
} @placeholder {
  <div>Example Placeholder</div>
}
```

В этом примере при начальной загрузке применяется `hydrate on interaction`. Гидратация запускается при взаимодействии с Компонентом `<example-cmp />`. При любой последующей загрузке страницы через CSR — например, когда пользователь нажимает routerLink, ведущий на страницу с этим Компонентом, — применится `on idle`.

## Как инкрементная Гидратация работает с вложенными блоками `@defer`? {#how-does-incremental-hydration-work-with-nested-defer-blocks}

Система Компонентов и зависимостей Angular является иерархической, что означает: гидратация любого Компонента требует предварительной гидратации всех его родителей. Поэтому если Гидратация запускается для дочернего блока `@defer` в наборе вложенных дегидратированных блоков `@defer`, Гидратация запускается от самого верхнего дегидратированного блока `@defer` вниз до целевого дочернего и выполняется в этом порядке.

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

В приведённом выше примере наведение на вложенный блок `@defer` запускает Гидратацию. Сначала гидратируется родительский блок `@defer` с `<parent-block-cmp />`, затем — дочерний блок `@defer` с `<child-block-cmp />`.

## Ограничения {#constraints}

Инкрементная Гидратация имеет те же ограничения, что и полная Гидратация приложения: запрет на прямое манипулирование DOM и требование валидной HTML-структуры. Подробнее: [раздел ограничений руководства по Гидратации](guide/hydration#constraints).

## Нужно ли по-прежнему указывать блоки `@placeholder`? {#do-i-still-need-to-specify-placeholder-blocks}

Да. Контент блока `@placeholder` не используется при инкрементной Гидратации, однако `@placeholder` по-прежнему необходим для последующих случаев CSR. Если контент не был на маршруте начальной загрузки, любая навигация к маршруту с блоком `@defer` рендерится как обычный блок `@defer`. Поэтому `@placeholder` отображается в этих случаях CSR.
