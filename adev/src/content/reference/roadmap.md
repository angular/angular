<docs-decorative-header title="Дорожная карта Angular" imgSrc="adev/src/assets/images/roadmap.svg"> <!-- markdownlint-disable-line -->
Узнайте, как команда Angular набирает обороты в вебе.
</docs-decorative-header>

Как open source проект, ежедневные коммиты, PR и динамика Angular полностью отслеживаются на GitHub. Чтобы повысить прозрачность того, как эта ежедневная работа связана с будущим фреймворка, наша дорожная карта объединяет текущее и планируемое видение команды.

Следующие проекты не привязаны к конкретной версии Angular. Мы выпустим их по завершении, и они войдут в конкретную версию на основе нашего расписания релизов, следуя семантическому версионированию. Например, мы выпускаем возможности в следующем minor после завершения или в следующем major, если они включают breaking changes.

Сейчас у Angular три цели для фреймворка:

1. Улучшить [AI-опыт для разработчиков](/ai)
1. Улучшить [опыт разработчика Angular](#improving-the-angular-developer-experience)
1. Улучшить производительность фреймворка

Продолжайте читать, чтобы узнать, как мы планируем достичь этих целей конкретной проектной работой.

## Изучайте современный Angular {#explore-modern-angular}

Начните разработку с новейшими возможностями Angular из нашей дорожной карты. Этот список отражает текущий статус новых возможностей из нашей дорожной карты:

### Доступно для экспериментов {#available-to-experiment-with}

- [Web MCP](/ai/webmcp)

### Готово к production {#production-ready}

- [Signal Forms](/guide/forms/signals/overview)
- [Resource API](/guide/signals/resource)
- [httpResource](/api/common/http/httpResource)
- [Zoneless change detection](/guide/zoneless)
- [Linked Signal API](/guide/signals/linked-signal)
- [Incremental hydration](/guide/incremental-hydration)
- [Effect API](/api/core/effect)
- [Event replay with SSR](/api/platform-browser/withEventReplay)
- [Route-level render mode](/guide/ssr)

## Улучшение AI-опыта для разработчиков Angular {#improving-the-ai-experience-for-angular-developers}

### Лучшее из AI для Angular {#bringing-the-best-of-ai-to-angular}

<docs-card-container>
  <docs-card title="AI Powered Angular">
  AI продолжает формировать ландшафт разработки. Он изменил то, как мы разрабатываем приложения, и типы пользовательских опытов, которые возможны. Мы планируем наилучшим образом поддерживать сообщество разработчиков в AI-assisted coding и интеграции AI в их приложения.
  </docs-card>
  <docs-card title="AI Development">
  Команда продолжит развивать значимые интеграции с инструментами вроде Google AI Studio, Gemini CLI и другим agentic tooling, таким как Agentic IDE вроде Antigravity. Мы планируем запускать решения, соответствующие быстро развивающейся индустрии. Примеры включают agent skills, новые возможности MCP и AI SDK.
  </docs-card>
  <docs-card title="Code Generation">
  [Согласно нашим исследованиям](https://blog.angular.dev/beyond-the-horizon-how-angular-is-embracing-ai-for-next-gen-apps-7a7ed706e1a3), генерация кода для Angular уже высокого качества с современными LLM. Мы продолжим инвестиции в улучшение генерации кода для Angular. Это означает, что мы будем регулярно оценивать качество генерации кода с текущими моделями и работать над его улучшением через system instructions, документацию и тактические изменения фреймворка. Мы также продолжим инвестиции в [Web Codegen Scorer](https://github.com/angular/web-codegen-scorer), нашу инфраструктуру оценки.
  </docs-card>
  <docs-card title="AI Powered Experiences">
  Для разработчиков Angular открывается новый фронтир с новыми концепциями, такими как Dynamic UI generation. Мы начали с поддержки Angular для A2UI и активно ищем дополнительные возможности для поддержки современных опытов приложений.
  </docs-card>
</docs-card-container>

## Улучшение опыта разработчика Angular {#improving-the-angular-developer-experience}

### Скорость разработчика {#developer-velocity}

<docs-card-container>
  <docs-card title="Compiler">
    Microsoft потратила последний год на портирование компилятора TypeScript на Go с обещанием ускорения в 5–10 раз для типичных компиляций TypeScript. У Angular, возможно, одна из самых глубоких интеграций с компилятором TypeScript, что потребует более крупных архитектурных изменений для поддержки новых tsgo-based workflows как для компилятора, так и для language service.

Мы находимся в процессе прототипирования и исследования того, как будет выглядеть эта поддержка, и поставим компилятор Angular, совместимый с tsgo и приносящий преимущества производительности нативного порта Microsoft в экосистему Angular.
</docs-card>

  <docs-card title="Enhanced Ecosystem compatibility">
    Разработчики смешивают AI-сгенерированный код с написанным вручную и хотят использовать популярные библиотеки и быстро интегрировать новые опыты. Angular хочет хорошо интегрироваться в эту экосистему — разработчики должны иметь возможность использовать любимые инструменты и комбинировать фреймворки в соответствии со своими требованиями.

В рамках этого проекта мы исследуем пространство требований кросс-фреймворкового interop и наших инструментов сборки для улучшения совместимости. Мы также хотим понять, можем ли мы внести вклад в это пространство, предоставляя framework-agnostic решения открытых проблем веб-экосистемы, подобно тому, что мы поставили с проектом [Web Codegen Scorer](https://github.com/angular/web-codegen-scorer).

  </docs-card>

  <docs-card title="Components">
  В Angular v21 мы запустили Angular Aria в developer preview, предоставив восемь паттернов для accessible, headless компонентов. Мы планируем продвинуть эти паттерны до stable и ввести новые паттерны там, где нужно. Мы хотим предоставить разработчикам прочную основу для разработки собственных компонентов с Angular Aria — мы предоставляем взаимодействия, а вы приносите стиль, соответствующий вашим design systems. У разработчиков будет выбор: разрабатывать пользовательские компоненты с Angular Aria, использовать паттерны взаимодействия из CDK или использовать готовые стилизованные Material Components.

Для accessibility мы непрерывно оцениваем компоненты и паттерны по стандартам accessibility, таким как WCAG, и работаем над исправлением любых проблем, возникающих из этого процесса.
</docs-card>
</docs-card-container>

### Улучшение инструментов {#improve-tooling}

<docs-card-container>
  <docs-card title="Modernize unit testing tooling with ng test">
  После стабильного релиза Vitest в Angular v21 он теперь наш основной test runner. Сейчас мы сосредоточены на продвижении нашего экспериментального инструмента миграции Karma → Vitest до stable, а также на исследовании новых возможностей для дальнейшей доработки и улучшения workflow тестирования разработчиков.
</docs-card>
</docs-card-container>

## Завершённые проекты {#completed-projects}

<docs-card-container>

  <docs-card title="Signal Forms" href="/guide/forms/signals/overview" link="Completed in 2026">
  Signal Forms теперь стабильны. Этот новый подход позволяет разработчикам управлять состоянием форм с помощью signals, обеспечивая эргономичный опыт создания форм. Мы продвинули Signal Forms до stable и улучшили interop с reactive forms — позволяя командам постепенно мигрировать крупные формы в своём темпе.
  </docs-card>
  
  <docs-card title="Reactivity" href="/guide/signals" link="Completed in 2026">
  Мы представили новые signal API, `resource()` и `httpResource()`, для гибкой асинхронной обработки данных. Мы продвинули эти API до developer stable.
  </docs-card>
  
  <docs-card title="Change Detection" href="/api/core/ChangeDetectionStrategy" link="Completed in 2026">
  С Zoneless, ставшим стабильным и режимом по умолчанию, мы установили стратегию обнаружения изменений по умолчанию в `OnPush`, чтобы следовать текущим лучшим практикам. Мы также переименовали `ChangeDetectionStrategy.Default` в `ChangeDetectionStrategy.Eager`.
  
  [См. обсуждение RFC для подробностей](https://github.com/angular/angular/discussions/66779).
  </docs-card>

  <docs-card title="Signal debugging in Angular DevTools" link="Completed in 2026">
  Мы добавили лучшие инструменты для отладки Signals с помощью Angular DevTools. Это изменение включает новый UI для инспекции и отладки signals.
  </docs-card>

  <docs-card title="Improve HMR (Hot Module Reload)" href="https://github.com/angular/angular/issues/39367#issuecomment-1439537306" link="Completed in 2025">
  Мы работаем над более быстрым циклом edit/refresh, включая hot module replacement. В Angular v19 мы поставили начальную поддержку CSS и template HMR, а в v20 продвинули template HMR до stable. Мы продолжим собирать отзывы, чтобы убедиться, что закрываем потребности разработчиков, прежде чем отметить этот проект как завершённый.
</docs-card>

<docs-card title="Zoneless Angular"  link="Completed in Q4 2025">
В v18 мы поставили экспериментальную поддержку zoneless в Angular. Она позволяет разработчикам использовать фреймворк без включения zone.js в бандл, что улучшает производительность, опыт отладки и interop. В рамках начального релиза мы также ввели поддержку zoneless в Angular CDK и Angular Material.

В v19 мы ввели поддержку zoneless в SSR, закрыли некоторые edge cases и создали schematic для scaffolding zoneless-проектов. Мы перевели <a href="https://fonts.google.com/" target="_blank">Google Fonts</a> на zoneless, что улучшило производительность, опыт разработчика и позволило выявить пробелы, которые нужно закрыть перед переводом этой возможности в developer preview.

Начиная с Angular v20.2, Zoneless Angular стабилен и включает улучшения в обработке ошибок и SSR.
</docs-card>

<docs-card title="Server route configuration" link="Completed in Q2 2025"  >
Мы работаем над более эргономичной конфигурацией маршрутов на сервере. Мы хотим сделать тривиальным объявление того, какие маршруты должны рендериться на сервере, prerender или на клиенте.

В Angular v19 мы поставили developer preview route-level render mode, позволяющий гранулярно настраивать, какие маршруты Angular должен prerender, SSR или CSR. В Angular v20 мы продвинули это до stable.
</docs-card>
<docs-card title="Enable incremental hydration" link="Completed in Q2 2025">
В v17 мы продвинули гидратацию из developer preview и последовательно наблюдаем улучшения LCP на 40–50%. С тех пор мы начали прототипировать incremental hydration и показали демо на сцене ng-conf.

В v19 мы поставили incremental hydration в режиме developer preview на базе блоков `@defer`. В Angular v20 мы продвинули это до stable!
</docs-card>
<docs-card title="Deliver Angular Signals" link="Completed in Q2 2025" href="https://github.com/angular/angular/discussions/49685">
Этот проект переосмысливает модель реактивности Angular, вводя Signals как примитив реактивности. Начальное планирование привело к сотням обсуждений, разговоров с разработчиками, сессий обратной связи, UX-исследований и серии RFC, получивших более 1000 комментариев.

В Angular v20 мы продвинули все фундаментальные примитивы реактивности до stable, включая signal, effect, linkedSignal, signal-based queries и inputs.
</docs-card>
<docs-card title="Support two-dimensional drag-and-drop" link="Completed in Q2 2024" href="https://github.com/angular/components/issues/13372">
В рамках этого проекта мы реализовали поддержку смешанной ориентации для drag and drop Angular CDK. Это одна из самых запрашиваемых возможностей репозитория.
</docs-card>
<docs-card title="Event replay with SSR and prerendering" link="Completed in Q4 2024" href="api/platform-browser/withEventReplay">
В v18 мы ввели функциональность event replay при использовании SSR или prerendering. Для этой возможности мы опираемся на примитив event dispatch (ранее известный как jsaction), работающий на Google.com.

В Angular v19 мы продвинули event replay до stable и включили его по умолчанию для всех новых проектов.
</docs-card>
<docs-card title="Integrate Angular Language Service with Schematics" link="Completed in Q4 2024">
Чтобы упростить разработчикам использование современных API Angular, мы включили интеграцию между Angular language service и schematics, позволяющую рефакторить приложение одним кликом.
</docs-card>
<docs-card title="Streamline standalone imports with Language Service" link="Completed in Q4 2024">
В рамках этой инициативы language service автоматически импортирует компоненты и pipes в standalone и NgModule-based приложениях. Кроме того, мы добавили диагностику шаблонов для подсветки неиспользуемых импортов в standalone-компонентах, что должно помочь сделать бандлы приложений меньше.
</docs-card>
<docs-card title="Local template variables" link="Completed in Q3 2024">
Мы выпустили поддержку локальных переменных шаблонов в Angular, см. [документацию `@let`](/api/core/@let) для дополнительной информации.
</docs-card>
<docs-card title="Expand the customizability of Angular Material" link="Completed in Q2 2024" href="https://material.angular.dev/guide/theming">
Чтобы обеспечить лучшую кастомизацию компонентов Angular Material и возможности Material 3, мы сотрудничаем с командой Material Design Google по определению token-based theming API.

В v17.2 мы поделились экспериментальной поддержкой Angular Material 3, а в v18 продвинули её до stable.
</docs-card>
<docs-card title="Introduce deferred loading" link="Completed in Q2 2024" href="https://next.angular.dev/guide/templates/defer">
В v17 мы поставили deferrable views в developer preview, предоставляющие эргономичный API для отложенной загрузки кода. В v18 мы включили deferrable views для разработчиков библиотек и продвинули API до stable.
</docs-card>
<docs-card title="iframe support in Angular DevTools" link="Completed in Q2 2024">
Мы включили отладку и профилирование Angular-приложений, встроенных в iframe на странице.
</docs-card>
<docs-card title="Automation for transition of existing hybrid rendering projects to esbuild and vite" link="Completed in Q2 2024" href="tools/cli/build-system-migration">
В v17 мы поставили application builder на базе vite и esbuild и включили его для новых проектов по умолчанию. Он улучшает время сборки для проектов с hybrid rendering до 87%. В рамках v18 мы поставили schematics и руководство, мигрирующие существующие проекты с hybrid rendering на новый pipeline сборки.
</docs-card>
<docs-card title="Make Angular.dev the official home for Angular developers" link="Completed in Q2 2024" href="https://goo.gle/angular-dot-dev">
Angular.dev — новый сайт, домен и дом для разработки на Angular. Новый сайт содержит обновлённую документацию, туториалы и руководства, которые помогут разработчикам строить с новейшими возможностями Angular.
</docs-card>
<docs-card title="Introduce built-in control flow" link="Completed in Q2 2024" href="guide/templates/control-flow">
В v17 мы поставили developer preview версию нового control flow. Он приносит значительные улучшения производительности и лучшую эргономику для написания шаблонов. Мы также предоставили миграцию существующих `*ngIf`, `*ngFor` и `*ngSwitch`, которую можно запустить для перевода проекта на новую реализацию. Начиная с v18 встроенный control flow стабилен.
</docs-card>
<docs-card title="Modernize getting started tutorial" link="Completed Q4 2023">
За последние два квартала мы разработали новый [видео](https://www.youtube.com/watch?v=xAT0lHYhHMY&list=PL1w1q3fL4pmj9k1FrJ3Pe91EPub2_h4jF) и [текстовый](/tutorials/learn-angular) туториал на базе standalone-компонентов.
</docs-card>
<docs-card title="Investigate modern bundlers" link="Completed Q4 2023" href="guide/hydration">
В Angular v16 мы выпустили developer preview esbuild-based builder с поддержкой `ng build` и `ng serve`. Development-сервер `ng serve` использует Vite и multi-file компиляцию esbuild и компилятора Angular. В v17 мы продвинули инструменты сборки из developer preview и включили их по умолчанию для новых проектов.
</docs-card>
<docs-card title="Introduce dependency injection debugging APIs" link="Completed Q4 2023" href="tools/devtools">
Чтобы улучшить утилиты отладки Angular и Angular DevTools, мы работаем над API, предоставляющими доступ к runtime внедрения зависимостей. В рамках проекта мы экспонируем методы отладки, позволяющие исследовать иерархию injector и зависимости по связанным providers. Начиная с v17 мы поставили возможность подключения к жизненному циклу внедрения зависимостей. Мы также запустили визуализацию дерева injector и инспекцию providers, объявленных внутри каждого отдельного узла.
</docs-card>
<docs-card title="Improve documentation and schematics for standalone components" link="Completed Q4 2023" href="essentials/components">
Мы выпустили developer preview коллекции schematics `ng new --standalone`, позволяющей создавать приложения без NgModules. В v17 мы переключили формат создания новых приложений на standalone API и изменили документацию, чтобы отразить рекомендацию. Кроме того, мы поставили schematics, поддерживающие обновление существующих приложений до standalone-компонентов, директив и pipes. Хотя NgModules останутся в обозримом будущем, мы рекомендуем изучить преимущества новых API для улучшения опыта разработчика и получения выгоды от новых возможностей, которые мы для них строим.
</docs-card>
<docs-card title="Explore hydration and server-side rendering improvements" link="Completed Q4 2023">
В v16 мы выпустили developer preview non-destructive full hydration, см. [руководство по гидратации](guide/hydration) и [blog post](https://blog.angular.dev/whats-next-for-server-side-rendering-in-angular-2a6f27662b67) для дополнительной информации. Мы уже видим значительные улучшения Core Web Vitals, включая [LCP](https://web.dev/lcp) и [CLS](https://web.dev/cls). В лабораторных тестах мы последовательно наблюдали улучшение LCP реального приложения на 45%.

В v17 мы запустили гидратацию вне developer preview и сделали серию улучшений в SSR, включая: обнаружение маршрутов во время выполнения для SSG, до 87% более быстрое время сборки для hybrid rendered приложений, prompt, включающий hybrid rendering для новых проектов.
</docs-card>
<docs-card title="Non-destructive full app hydration" link="Completed Q1 2023" href="guide/hydration">
В v16 мы выпустили developer preview non-destructive full hydration, позволяющей Angular переиспользовать существующие DOM-узлы на SSR-странице вместо пересоздания приложения с нуля. Дополнительную информацию см. в руководстве по гидратации.
</docs-card>
<docs-card title="Improvements in the image directive" link="Completed Q1 2023" href="guide/image-optimization">
Мы выпустили Angular image directive как stable в v15. Мы ввели новую возможность fill mode, позволяющую изображениям вписываться в родительский контейнер вместо явных размеров. За последние два месяца команда Chrome Aurora сделала backport директивы до v12 и новее.
</docs-card>
<docs-card title="Documentation refactoring" link="Completed Q1 2023" href="https://angular.io">
Обеспечить, чтобы вся существующая документация соответствовала согласованному набору типов контента. Обновить чрезмерное использование tutorial-style документации в независимые темы. Мы хотим гарантировать, что контент вне основных туториалов самодостаточен без жёсткой привязки к серии руководств. Во Q2 2022 мы отрефакторили контент шаблонов и внедрения зависимостей. Во Q1 2023 мы улучшили руководства HTTP и на этом приостанавливаем проект рефакторинга документации.
</docs-card>
<docs-card title="Improve image performance" link="Completed Q4 2022" href="guide/image-optimization">
Команды Aurora и Angular работают над реализацией image directive, нацеленной на улучшение Core Web Vitals. Мы поставили стабильную версию image directive в v15.
</docs-card>
<docs-card title="Modern CSS" link="Completed Q4 2022" href="https://blog.angular.dev/modern-css-in-angular-layouts-4a259dca9127">
Веб-экосистема постоянно развивается, и мы хотим отражать последние современные стандарты в Angular. В этом проекте мы стремимся предоставить руководства по использованию современных возможностей CSS в Angular, чтобы разработчики следовали лучшим практикам для layout, стилизации и т.д. Мы поделились официальными руководствами по layout и в рамках инициативы прекратили публикацию flex layout.
</docs-card>
<docs-card title="Support adding directives to host elements" link="Completed Q4 2022" href="guide/directives/directive-composition-api">
Давно запрашиваемая возможность — добавлять директивы к host-элементам. Возможность позволяет разработчикам дополнять собственные компоненты дополнительным поведением без использования наследования. В v15 мы поставили наш directive composition API, позволяющий усиливать host-элементы директивами.
</docs-card>
<docs-card title="Better stack traces" link="Completed Q4 2022" href="https://developer.chrome.com/blog/devtools-better-angular-debugging/">
Angular и Chrome DevTools работают вместе, чтобы обеспечить более читаемые stack traces для сообщений об ошибках. В v15 мы выпустили улучшенные релевантные и связанные stack traces. Как инициативу более низкого приоритета мы исследуем, как сделать stack traces дружелюбнее, предоставляя более точные имена call frame для шаблонов.
</docs-card>
<docs-card title="Enhanced Angular Material components by integrating MDC Web" link="Completed Q4 2022" href="https://material.angular.dev/guide/mdc-migration">
MDC Web — библиотека, созданная командой Google Material Design, предоставляющая переиспользуемые примитивы для построения компонентов Material Design. Команда Angular включает эти примитивы в Angular Material. Использование MDC Web лучше выравнивает Angular Material со спецификацией Material Design, расширяет accessibility, улучшает качество компонентов и повышает скорость нашей команды.
</docs-card>
<docs-card title="Implement APIs for optional NgModules" link="Completed Q4 2022" href="https://blog.angular.dev/angular-v15-is-now-available-df7be7f2f4c8">
В процессе упрощения Angular мы работаем над введением API, позволяющих разработчикам инициализировать приложения, создавать экземпляры компонентов и использовать роутер без NgModules. Angular v14 вводит developer preview API для standalone-компонентов, директив и pipes. В следующие несколько кварталов мы соберём отзывы разработчиков и финализируем проект, сделав API стабильными. Следующим шагом мы поработаем над улучшением use cases вроде TestBed, Angular elements и т.д.
</docs-card>
<docs-card title="Allow binding to protected fields in templates" link="Completed Q2 2022" href="guide/templates/binding">
Чтобы улучшить инкапсуляцию компонентов Angular, мы включили привязку к protected членам экземпляра компонента. Таким образом, больше не нужно экспонировать поле или метод как public, чтобы использовать его внутри шаблонов.
</docs-card>
<docs-card title="Publish guides on advanced concepts" link="Completed Q2 2022" href="https://angular.io/guide/change-detection">
Разработать и опубликовать подробное руководство по обнаружению изменений. Разработать контент для профилирования производительности Angular-приложений. Охватить, как обнаружение изменений взаимодействует с Zone.js, и объяснить, когда оно запускается, как профилировать его длительность, а также распространённые практики оптимизации производительности.
</docs-card>
<docs-card title="Rollout strict typings for @angular/forms" link="Completed Q2 2022" href="guide/forms/typed-forms">
Во Q4 2021 мы спроектировали решение для введения строгой типизации форм, а во Q1 2022 завершили соответствующий request for comments. Сейчас мы реализуем стратегию rollout с автоматизированным шагом миграции, который включит улучшения для существующих проектов. Сначала мы тестируем решение на более чем 2500 проектах в Google, чтобы обеспечить гладкий путь миграции для внешнего сообщества.
</docs-card>
<docs-card title="Remove legacy View Engine" link="Completed Q1 2022" href="https://blog.angular.dev/angular-v15-is-now-available-df7be7f2f4c8">
После завершения перехода всех наших внутренних инструментов на Ivy мы удалим legacy View Engine для снижения концептуальной нагрузки Angular, меньшего размера пакета, меньшей стоимости поддержки и меньшей сложности кодовой базы.
</docs-card>
<docs-card title="Simplified Angular mental model with optional NgModules" link="Completed Q1 2022" href="https://blog.angular.dev/angular-v15-is-now-available-df7be7f2f4c8">
Чтобы упростить ментальную модель Angular и путь обучения, мы работаем над тем, чтобы сделать NgModules необязательными. Эта работа позволяет разработчикам разрабатывать standalone-компоненты и реализовать альтернативный API для объявления области компиляции компонента. Мы запустили этот проект высокоуровневыми обсуждениями дизайна, которые зафиксировали в RFC.
</docs-card>
<docs-card title="Design strict typing for @angular/forms" link="Completed Q1 2022" href="guide/forms/typed-forms">
Мы будем работать над поиском способа реализовать более строгую проверку типов для reactive forms с минимальными обратно несовместимыми последствиями. Таким образом, мы позволяем разработчикам ловить больше проблем во время разработки, обеспечиваем лучшую поддержку текстовых редакторов и IDE и улучшаем проверку типов для reactive forms.
</docs-card>
<docs-card title="Improve integration of Angular DevTools with framework" link="Completed Q1 2022" href="tools/devtools">
Чтобы улучшить интеграцию Angular DevTools с фреймворком, мы работаем над переносом кодовой базы в monorepository angular/angular. Это включает переход Angular DevTools на Bazel и интеграцию в существующие процессы и CI pipeline.
</docs-card>
<docs-card title="Launch advanced compiler diagnostics" link="Completed Q1 2022" href="extended-diagnostics">
Расширить диагностику компилятора Angular за пределы проверки типов. Ввести другие проверки корректности и соответствия, чтобы дополнительно гарантировать корректность и лучшие практики.
</docs-card>
<docs-card title="Update our e2e testing strategy" link="Completed Q3 2021" href="guide/testing">
Чтобы обеспечить future-proof стратегию e2e-тестирования, мы хотим оценить состояние Protractor, инновации сообщества, лучшие практики e2e и исследовать новые возможности. Как первые шаги усилия мы поделились RFC и работали с партнёрами, чтобы обеспечить гладкую интеграцию между Angular CLI и современными инструментами e2e-тестирования. Следующим шагом нужно финализировать рекомендации и составить список ресурсов для перехода.
</docs-card>
<docs-card title="Angular libraries use Ivy" link="Completed Q3 2021" href="tools/libraries">
Ранее в 2020 мы поделились RFC по дистрибуции Ivy-библиотек. После бесценной обратной связи сообщества мы разработали дизайн проекта. Сейчас мы инвестируем в разработку дистрибуции Ivy-библиотек, включая обновление формата пакета библиотеки для использования Ivy-компиляции, разблокировку deprecation формата библиотек View Engine и ngcc.
</docs-card>
<docs-card title="Improve test times and debugging with automatic test environment tear down" link="Completed Q3 2021" href="guide/testing">
Чтобы улучшить время тестов и создать лучшую изоляцию между тестами, мы хотим изменить TestBed так, чтобы он автоматически очищал и разрушал тестовое окружение после каждого запуска теста.
</docs-card>
<docs-card title="Deprecate and remove IE11 support" link="Completed Q3 2021" href="https://github.com/angular/angular/issues/41840">
Internet Explorer 11 (IE11) мешал Angular пользоваться некоторыми современными возможностями веб-платформы. В рамках этого проекта мы пометим как deprecated и удалим поддержку IE11, чтобы открыть путь современным возможностям evergreen-браузеров. Мы провели RFC для сбора отзывов сообщества и решения о следующих шагах.
</docs-card>
<docs-card title="Leverage ES2017+ as the default output language" link="Completed Q3 2021" href="https://www.typescriptlang.org/docs/handbook/tsconfig-json.html">
Поддержка современных браузеров позволяет пользоваться более компактным, выразительным и производительным новым синтаксисом JavaScript. В рамках этого проекта мы исследуем, что блокирует продвижение этой инициативы, и предпримем шаги для её включения.
</docs-card>
<docs-card title="Accelerated debugging and performance profiling with Angular DevTools" link="Completed Q2 2021" href="tools/devtools">
Мы работаем над инструментами разработки для Angular, предоставляющими утилиты для отладки и профилирования производительности. Этот проект призван помочь разработчикам понять структуру компонентов и обнаружение изменений в Angular-приложении.
</docs-card>
<docs-card title="Streamline releases with consolidated Angular versioning & branching" link="Completed Q2 2021" href="reference/releases">
Мы хотим консолидировать инструменты управления релизами между несколькими GitHub-репозиториями Angular (angular/angular, angular/angular-cli и angular/components). Это усилие позволяет переиспользовать инфраструктуру, унифицировать и упростить процессы и улучшить надёжность нашего процесса релизов.
</docs-card>
<docs-card title="Higher developer consistency with commit message standardization" link="Completed Q2 2021" href="https://github.com/angular/angular">
Мы хотим унифицировать требования к сообщениям коммитов и соответствие между репозиториями Angular (angular/angular, angular/components и angular/angular-cli), чтобы обеспечить согласованность процесса разработки и переиспользовать инфраструктурные инструменты.
</docs-card>
<docs-card title="Transition the Angular language service to Ivy" link="Completed Q2 2021" href="tools/language-service">
Цель этого проекта — улучшить опыт и убрать legacy-зависимость, переведя language service на Ivy. Сегодня language service всё ещё использует компилятор и проверку типов View Engine даже для Ivy-приложений. Мы хотим использовать Ivy template parser и улучшенную проверку типов для Angular Language service, чтобы соответствовать поведению приложения. Эта миграция также шаг к разблокировке удаления View Engine, что упростят Angular, уменьшит размер npm-пакета и улучшит поддерживаемость фреймворка.
</docs-card>
<docs-card title="Increased security with native Trusted Types in Angular" link="Completed Q2 2021" href="best-practices/security">
В сотрудничестве с командой безопасности Google мы добавляем поддержку нового API Trusted Types. Этот API веб-платформы помогает разработчикам строить более безопасные веб-приложения.
</docs-card>
<docs-card title="Optimized build speed and bundle sizes with Angular CLI webpack 5" link="Completed Q2 2021" href="tools/cli/build">
В рамках релиза v11 мы ввели opt-in preview webpack 5 в Angular CLI. Чтобы обеспечить стабильность, мы продолжим итерации над реализацией для включения улучшений скорости сборки и размера бандла.
</docs-card>
<docs-card title="Faster apps by inlining critical styles in Universal apps" link="Completed Q1 2021" href="guide/ssr">
Загрузка внешних таблиц стилей — блокирующая операция, то есть браузер не может начать отрисовку приложения, пока не загрузит весь ссылаемый CSS. Наличие render-blocking ресурсов в header страницы может значительно влиять на производительность загрузки, например first contentful paint. Чтобы сделать приложения быстрее, мы сотрудничали с командой Google Chrome по встраиванию critical CSS и асинхронной загрузке остальных стилей.
</docs-card>
<docs-card title="Improve debugging with better Angular error messages" link="Completed Q1 2021" href="errors">
Сообщения об ошибках часто несут ограниченную actionable информацию, помогающую разработчикам их разрешить. Мы работали над тем, чтобы сделать сообщения об ошибках более обнаруживаемыми, добавляя связанные коды, разрабатывая руководства и другие материалы для более гладкого опыта отладки.
</docs-card>
<docs-card title="Improved developer onboarding with refreshed introductory documentation" link="Completed Q1 2021" href="tutorials">
Мы переопределим пользовательские пути обучения и обновим вводную документацию. Мы ясно сформулируем преимущества Angular, как исследовать его возможности, и предоставим руководство, чтобы разработчики могли стать продуктивными с фреймворком за минимальное время.
</docs-card>
<docs-card title="Expand component harnesses best practices" link="Completed Q1 2021" href="https://material.angular.dev/guide/using-component-harnesses">
Angular CDK ввёл концепцию component test harnesses в Angular в версии 9. Test harnesses позволяют авторам компонентов создавать поддерживаемые API для тестирования взаимодействий с компонентами. Мы продолжаем улучшать эту инфраструктуру harnesses и прояснять лучшие практики вокруг их использования. Мы также работаем над увеличением adoption harnesses внутри Google.
</docs-card>
<docs-card title="Author a guide for content projection" link="Completed Q2 2021" href="https://angular.io/docs">
Проекция контента — ключевая концепция Angular, которая не имеет того присутствия в документации, которого заслуживает. В рамках этого проекта мы хотим определить основные use cases и концепции проекции контента и задокументировать их.
</docs-card>
<docs-card title="Migrate to ESLint" link="Completed Q4 2020" href="tools/cli">
С deprecation TSLint мы переходим на ESLint. В рамках процесса мы поработаем над обеспечением обратной совместимости с нашей текущей рекомендуемой конфигурацией TSLint, реализуем стратегию миграции для существующих Angular-приложений и введём новые инструменты в toolchain Angular CLI.
</docs-card>
<docs-card title="Operation Bye Bye Backlog (also known as Operation Byelog)" link="Completed Q4 2020" href="https://github.com/angular/angular/issues">
Мы активно инвестируем до 50% инженерной ёмкости в triage issues и PR, пока не получим ясное понимание более широких потребностей сообщества. После этого мы обязуемся выделять до 20% инженерной ёмкости, чтобы оперативно успевать за новыми submissions.
</docs-card>
</docs-card-container>
