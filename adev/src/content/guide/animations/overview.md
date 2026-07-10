# Введение в анимации Angular

IMPORTANT: Пакет `@angular/animations` теперь устарел. Команда Angular рекомендует использовать нативный CSS с `animate.enter` и `animate.leave` для анимаций во всём новом коде. Подробнее в новом руководстве по enter и leave [анимациям](guide/animations). Также см. [Migrating away from Angular's Animations package](guide/animations/migration), чтобы узнать, как начать миграцию на чистые CSS-анимации в приложениях.

Анимация создаёт иллюзию движения: HTML-элементы меняют стили со временем.
Хорошо спроектированные анимации могут сделать приложение более интуитивным и engaging, но они не только косметика.
Анимации могут улучшить приложение и пользовательский опыт несколькими способами:

- Без анимаций переходы веб-страниц могут казаться резкими и jarring
- Движение сильно улучшает пользовательский опыт, поэтому анимации дают пользователям шанс заметить реакцию приложения на их действия
- Хорошие анимации интуитивно привлекают внимание пользователя туда, где оно нужно

Обычно анимации включают несколько _преобразований_ стилей со временем.
HTML-элемент может перемещаться, менять цвет, расти или уменьшаться, затухать или ускользать со страницы.
Эти изменения могут происходить одновременно или последовательно. Можно контролировать timing каждого преобразования.

Система анимаций Angular построена на функциональности CSS, что означает, что можно анимировать любое свойство, которое браузер считает animatable.
Это включает позиции, размеры, transforms, цвета, borders и многое другое.
W3C поддерживает список animatable-свойств на странице [CSS Transitions](https://www.w3.org/TR/css-transitions-1).

## Об этом руководстве {#about-this-guide}

Это руководство охватывает базовые возможности анимаций Angular, чтобы помочь начать добавлять анимации Angular в проект.

## Начало работы {#getting-started}

Основные модули Angular для анимаций — `@angular/animations` и `@angular/platform-browser`.

Чтобы начать добавлять анимации Angular в проект, импортируйте animation-специфичные модули вместе со стандартной функциональностью Angular.

<docs-workflow>
<docs-step title="Enabling the animations module">
Импортируйте `provideAnimationsAsync` из `@angular/platform-browser/animations/async` и добавьте его в список providers в вызове функции `bootstrapApplication`.

```ts {header: "Enabling Animations", linenums}
bootstrapApplication(AppComponent, {
  providers: [provideAnimationsAsync()],
});
```

<docs-callout important title="If you need immediate animations in your application">
  Если нужно, чтобы анимация произошла сразу при загрузке приложения,
  переключитесь на eagerly loaded модуль анимаций. Импортируйте `provideAnimations`
  из `@angular/platform-browser/animations` вместо этого и используйте `provideAnimations` **вместо**
  `provideAnimationsAsync` в вызове функции `bootstrapApplication`.
</docs-callout>

Для приложений на основе `NgModule` импортируйте `BrowserAnimationsModule`, который вводит возможности анимации в корневой модуль приложения Angular.

<docs-code header="app.module.ts" path="adev/src/content/examples/animations/src/app/app.module.1.ts"/>
</docs-step>
<docs-step title="Importing animation functions into component files">
Если планируете использовать конкретные функции анимации в файлах компонентов, импортируйте эти функции из `@angular/animations`.

<docs-code header="app.ts" path="adev/src/content/examples/animations/src/app/app.ts" region="imports"/>

См. все [доступные функции анимации](guide/legacy-animations#animations-api-summary) в конце этого руководства.

</docs-step>
<docs-step title="Adding the animation metadata property">
В файле компонента добавьте свойство метаданных `animations:` внутри декоратора `@Component()`.
Trigger, определяющий анимацию, помещается в свойство метаданных `animations`.

<docs-code header="app.ts" path="adev/src/content/examples/animations/src/app/app.ts" region="decorator"/>
</docs-step>
</docs-workflow>

## Анимация перехода {#animating-a-transition}

Давайте анимируем переход, который меняет один HTML-элемент из одного состояния в другое.
Например, можно указать, что кнопка отображает либо **Open**, либо **Closed** на основе последнего действия пользователя.
Когда кнопка в состоянии `open`, она видима и жёлтая.
Когда в состоянии `closed`, она полупрозрачная и синяя.

В HTML эти атрибуты задаются обычными CSS-стилями, такими как color и opacity.
В Angular используйте функцию `style()`, чтобы указать набор CSS-стилей для использования с анимациями.
Соберите набор стилей в состоянии анимации и дайте состоянию имя, например `open` или `closed`.

HELPFUL: Создадим новый компонент `open-close` для анимации с простыми переходами.

Выполните следующую команду в терминале для генерации компонента:

```shell
ng g component open-close
```

Это создаст компонент в `src/app/open-close.ts`.

### Состояние анимации и стили {#animation-state-and-styles}

Используйте функцию Angular [`state()`](api/animations/state), чтобы определить разные состояния для вызова в конце каждого перехода.
Эта функция принимает два аргумента:
Уникальное имя вроде `open` или `closed` и функцию `style()`.

Используйте функцию `style()`, чтобы определить набор стилей, ассоциированных с данным именем состояния.
Нужно использовать _camelCase_ для атрибутов стиля, содержащих дефисы, например `backgroundColor`, или обернуть их в кавычки, например `'background-color'`.

Посмотрим, как функция Angular [`state()`](api/animations/state) работает с функцией `style⁣­(⁠)` для установки CSS-атрибутов стиля.
В этом фрагменте кода несколько атрибутов стиля задаются одновременно для состояния.
В состоянии `open` у кнопки высота 200 пикселей, opacity 1 и жёлтый цвет фона.

<docs-code header="open-close.ts" path="adev/src/content/examples/animations/src/app/open-close.ts" region="state1"/>

В следующем состоянии `closed` у кнопки высота 100 пикселей, opacity 0.8 и синий цвет фона.

<docs-code header="open-close.ts" path="adev/src/content/examples/animations/src/app/open-close.ts" region="state2"/>

### Transitions и timing {#transitions-and-timing}

В Angular можно задать несколько стилей без какой-либо анимации.
Однако без дальнейшей доработки кнопка мгновенно преобразуется без fade, без уменьшения или другого видимого индикатора, что происходит изменение.

Чтобы сделать изменение менее резким, нужно определить _transition_ анимации, чтобы указать изменения, происходящие между одним состоянием и другим за период времени.
Функция `transition()` принимает два аргумента:
Первый аргумент принимает выражение, определяющее направление между двумя состояниями перехода, а второй принимает один или серию шагов `animate()`.

Используйте функцию `animate()`, чтобы определить length, delay и easing перехода, и чтобы назначить функцию style для определения стилей во время переходов.
Используйте функцию `animate()`, чтобы определить функцию `keyframes()` для многошаговых анимаций.
Эти определения помещаются во второй аргумент функции `animate()`.

#### Метаданные анимации: duration, delay и easing {#animation-metadata-duration-delay-and-easing}

Функция `animate()` \(второй аргумент функции transition\) принимает входные параметры `timings` и `styles`.

Параметр `timings` принимает либо число, либо строку, определённую в трёх частях.

```ts
animate(duration);
```

или

```ts
animate('duration delay easing');
```

Первая часть, `duration`, обязательна.
Duration можно выразить в миллисекундах как число без кавычек или в секундах с кавычками и спецификатором времени.
Например, duration в одну десятую секунды можно выразить так:

- Как обычное число, в миллисекундах:
  `100`

- В строке, как миллисекунды:
  `'100ms'`

- В строке, как секунды:
  `'0.1s'`

Второй аргумент, `delay`, имеет тот же синтаксис, что и `duration`.
Например:

- Подождать 100ms, затем выполнить 200ms: `'0.2s 100ms'`

Третий аргумент, `easing`, контролирует, как анимация [ускоряется и замедляется](https://easings.net) во время выполнения.
Например, `ease-in` заставляет анимацию начинаться медленно и набирать скорость по мере прогресса.

- Подождать 100ms, выполнить 200ms.
  Использовать кривую deceleration, чтобы начать быстро и медленно замедлиться до точки покоя:
  `'0.2s 100ms ease-out'`

- Выполнить 200ms без delay.
  Использовать стандартную кривую, чтобы начать медленно, ускориться в середине, затем медленно замедлиться в конце:
  `'0.2s ease-in-out'`

- Начать сразу, выполнить 200ms.
  Использовать кривую acceleration, чтобы начать медленно и закончить на полной скорости:
  `'0.2s ease-in'`

HELPFUL: См. тему сайта Material Design о [Natural easing curves](https://material.io/design/motion/speed.html#easing) для общей информации о кривых easing.

Этот пример предоставляет переход состояния из `open` в `closed` с 1-секундным переходом между состояниями.

<docs-code header="open-close.ts" path="adev/src/content/examples/animations/src/app/open-close.ts" region="transition1"/>

В предыдущем фрагменте кода оператор `=>` указывает однонаправленные переходы, а `<=>` — двунаправленные.
Внутри перехода `animate()` указывает, сколько времени занимает переход.
В этом случае изменение состояния из `open` в `closed` занимает 1 секунду, выраженную здесь как `1s`.

Этот пример добавляет переход состояния из `closed` в `open` с 0.5-секундной дугой анимации перехода.

<docs-code header="open-close.ts" path="adev/src/content/examples/animations/src/app/open-close.ts" region="transition2"/>

HELPFUL: Некоторые дополнительные заметки об использовании стилей внутри функций [`state`](api/animations/state) и `transition`.

- Используйте [`state()`](api/animations/state) для определения стилей, применяемых в конце каждого перехода — они сохраняются после завершения анимации
- Используйте `transition()` для определения промежуточных стилей, которые создают иллюзию движения во время анимации
- Когда анимации отключены, стили `transition()` можно пропустить, но стили [`state()`](api/animations/state) — нельзя
- Включайте несколько пар состояний в один аргумент `transition()`:

  ```ts
  transition('on => off, off => void');
  ```

### Запуск анимации {#triggering-the-animation}

Анимации нужен _trigger_, чтобы знать, когда начинать.
Функция `trigger()` собирает состояния и переходы и даёт анимации имя, чтобы можно было прикрепить её к triggering-элементу в HTML-шаблоне.

Функция `trigger()` описывает имя свойства для отслеживания изменений.
Когда происходит изменение, trigger инициирует действия, включённые в его определение.
Эти действия могут быть переходами или другими функциями, как увидим позже.

В этом примере назовём trigger `openClose` и прикрепим его к элементу `button`.
Trigger описывает состояния open и closed и timings для двух переходов.

HELPFUL: Внутри каждого вызова функции `trigger()` элемент может быть только в одном состоянии в любой момент времени.
Однако возможно, что несколько triggers активны одновременно.

### Определение анимаций и прикрепление их к HTML-шаблону {#defining-animations-and-attaching-them-to-the-html-template}

Анимации определяются в метаданных компонента, который контролирует HTML-элемент для анимации.
Поместите код, определяющий анимации, в свойство `animations:` внутри декоратора `@Component()`.

<docs-code header="open-close.ts" path="adev/src/content/examples/animations/src/app/open-close.ts" region="component"/>

Когда определён animation trigger для компонента, прикрепите его к элементу в шаблоне этого компонента, обернув имя trigger в скобки и предварив символом `@`.
Затем можно привязать trigger к выражению шаблона, используя стандартный синтаксис property binding Angular, как показано ниже, где `triggerName` — имя trigger, а `expression` вычисляется в определённое состояние анимации.

```angular-html
<div [@triggerName]="expression">…</div>
```

Анимация выполняется или запускается, когда значение выражения меняется на новое состояние.

Следующий фрагмент кода привязывает trigger к значению свойства `isOpen`.

<docs-code header="open-close.html" path="adev/src/content/examples/animations/src/app/open-close.1.html" region="trigger"/>

В этом примере, когда выражение `isOpen` вычисляется в определённое состояние `open` или `closed`, оно уведомляет trigger `openClose` об изменении состояния.
Затем код `openClose` обрабатывает изменение состояния и запускает анимацию изменения состояния.

Для элементов, входящих на страницу или покидающих её \(вставленных или удалённых из DOM\), можно сделать анимации условными.
Например, используйте `*ngIf` с animation trigger в HTML-шаблоне.

HELPFUL: В файле компонента задайте trigger, определяющий анимации, как значение свойства `animations:` в декораторе `@Component()`.

В файле HTML-шаблона используйте имя trigger, чтобы прикрепить определённые анимации к HTML-элементу для анимации.

### Обзор кода {#code-review}

Вот файлы кода, обсуждавшиеся в примере перехода.

<docs-code-multifile>
    <docs-code header="open-close.ts" path="adev/src/content/examples/animations/src/app/open-close.ts" region="component"/>
    <docs-code header="open-close.html" path="adev/src/content/examples/animations/src/app/open-close.1.html" region="trigger"/>
    <docs-code header="open-close.css" path="adev/src/content/examples/animations/src/app/open-close.css"/>
</docs-code-multifile>

### Итог {#summary}

Вы научились добавлять анимацию к переходу между двумя состояниями, используя `style()` и [`state()`](api/animations/state) вместе с `animate()` для timing.

Узнайте о более продвинутых возможностях анимаций Angular в разделе Animation, начиная с продвинутых техник в [transition and triggers](guide/legacy-animations/transition-and-triggers).

## Сводка Animations API {#animations-api-summary}

Функциональный API, предоставляемый модулем `@angular/animations`, предоставляет domain-specific language \(DSL\) для создания и управления анимациями в приложениях Angular.
См. [API reference](api#animations) для полного списка и деталей синтаксиса основных функций и связанных структур данных.

| Имя функции                       | Что делает                                                                                                                                                                                                  |
| :-------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `trigger()`                       | Запускает анимацию и служит контейнером для всех других вызовов функций анимации. HTML-шаблон привязывается к `triggerName`. Используйте первый аргумент для объявления уникального имени trigger. Использует синтаксис массива. |
| `style()`                         | Определяет один или несколько CSS-стилей для использования в анимациях. Контролирует визуальный вид HTML-элементов во время анимаций. Использует синтаксис объекта.                                         |
| [`state()`](api/animations/state) | Создаёт именованный набор CSS-стилей, которые должны применяться при успешном переходе в данное состояние. Состояние затем можно ссылать по имени в других функциях анимации.                               |
| `animate()`                       | Указывает информацию о timing для перехода. Опциональные значения для `delay` и `easing`. Может содержать вызовы `style()` внутри.                                                                          |
| `transition()`                    | Определяет последовательность анимации между двумя именованными состояниями. Использует синтаксис массива.                                                                                                  |
| `keyframes()`                     | Позволяет последовательное изменение между стилями в указанном временном интервале. Используйте внутри `animate()`. Может включать несколько вызовов `style()` внутри каждого `keyframe()`. Использует синтаксис массива. |
| [`group()`](api/animations/group) | Указывает группу шагов анимации \(_inner animations_\), выполняемых параллельно. Анимация продолжается только после завершения всех внутренних шагов анимации. Используется внутри `sequence()` или `transition()`. |
| `query()`                         | Находит один или несколько внутренних HTML-элементов внутри текущего элемента.                                                                                                                              |
| `sequence()`                      | Указывает список шагов анимации, выполняемых последовательно, один за другим.                                                                                                                               |
| `stagger()`                       | Смещает время старта анимаций для нескольких элементов.                                                                                                                                                     |
| `animation()`                     | Создаёт переиспользуемую анимацию, которую можно вызвать из другого места. Используется вместе с `useAnimation()`.                                                                                          |
| `useAnimation()`                  | Активирует переиспользуемую анимацию. Используется с `animation()`.                                                                                                                                         |
| `animateChild()`                  | Позволяет анимациям на дочерних компонентах выполняться в том же временном окне, что и у родителя.                                                                                                            |

</table>

## Ещё об анимациях Angular {#more-on-angular-animations}

HELPFUL: Посмотрите эту [презентацию](https://www.youtube.com/watch?v=rnTK9meY5us), показанную на конференции AngularConnect в ноябре 2017, и сопровождающий [исходный код](https://github.com/matsko/animationsftw.in).

Вас также могут заинтересовать:

<docs-pill-row>
  <docs-pill href="guide/legacy-animations/transition-and-triggers" title="Transition and triggers"/>
  <docs-pill href="guide/legacy-animations/complex-sequences" title="Complex animation sequences"/>
  <docs-pill href="guide/legacy-animations/reusable-animations" title="Reusable animations"/>
  <docs-pill href="guide/routing/route-transition-animations" title="Route transition animations"/>
  <docs-pill href="guide/animations/migration" title="Migrating to Native CSS Animations"/>
</docs-pill-row>
