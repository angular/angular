<!-- TODO: need an Angular + AI logo -->

<docs-decorative-header title="Создавайте с ИИ" imgSrc="adev/src/assets/images/what_is_angular.svg"> <!-- markdownlint-disable-line -->
Создавайте приложения на базе ИИ. Разрабатывайте быстрее с помощью ИИ.
</docs-decorative-header>

HELPFUL: Хотите начать разработку в любимой IDE с поддержкой ИИ? <br>Ознакомьтесь с нашими [правилами промптов и лучшими практиками](/ai/develop-with-ai).

Генеративный ИИ (GenAI) на больших языковых моделях (LLM) позволяет создавать сложные и увлекательные пользовательские сценарии: персонализированный контент, умные рекомендации, генерацию и понимание медиа, суммирование информации и динамическую функциональность.

Раньше такие возможности требовали глубокой экспертизы и значительных инженерных усилий. Новые продукты и SDK снижают порог входа. Angular хорошо подходит для интеграции ИИ в веб-приложение благодаря:

- надёжным API шаблонов, которые позволяют создавать динамичные, аккуратно составленные UI из сгенерированного контента;
- сильной архитектуре на сигналах, рассчитанной на динамическое управление данными и состоянием;
- бесшовной интеграции Angular с ИИ SDK и API.

Это руководство показывает, как с помощью [Genkit](/ai#build-ai-powered-applications-with-genkit-and-angular), [Firebase AI Logic](/ai#build-ai-powered-applications-with-firebase-ai-logic-and-angular) и [Gemini API](/ai#build-ai-powered-applications-with-gemini-api-and-angular) уже сегодня наполнить Angular-приложения ИИ. Материал поможет быстро стартовать: объясняет, с чего начать интеграцию ИИ в Angular, и делится ресурсами — стартовыми наборами, примерами кода и рецептами типовых сценариев.

Для начала достаточно базового понимания Angular. Новичок? Попробуйте [руководство по основам](/essentials) или [вводные туториалы](/tutorials).

NOTE: На этой странице показаны интеграции и примеры с продуктами Google AI, но такие инструменты, как Genkit, не привязаны к конкретной модели и позволяют выбрать свою. Во многих случаях примеры и образцы кода применимы и к сторонним решениям.

## Начало работы {#getting-started}

Создание приложений на базе ИИ — новая и быстро развивающаяся область. Бывает непросто решить, с чего начать и какие технологии выбрать. Ниже — три варианта:

1. _Genkit_ даёт выбор [поддерживаемой модели и интерфейса с единым API](https://genkit.dev) для full-stack приложений. Подходит, когда нужна сложная серверная ИИ-логика, например персонализированные рекомендации.

1. _Firebase AI Logic_ предоставляет безопасный клиентский API к моделям Google для чисто клиентских или мобильных приложений. Лучше всего для интерактивных ИИ-функций прямо в браузере: анализ текста в реальном времени или простые чат-боты.

1. _Gemini API_ позволяет строить приложение, напрямую используя методы и возможности API — удобно для full-stack. Подходит, когда нужен прямой контроль над моделями: кастомная генерация изображений или глубокая обработка данных.

### Создавайте приложения на базе ИИ с Genkit и Angular {#build-ai-powered-applications-with-genkit-and-angular}

[Genkit](https://genkit.dev) — открытый набор инструментов для ИИ-функций в веб- и мобильных приложениях. Он предлагает единый интерфейс для моделей Google, OpenAI, Anthropic, Ollama и других, чтобы вы могли выбрать подходящие. Как серверное решение Genkit требует поддерживаемой серверной среды, например node-сервера. Full-stack приложение на Angular SSR даёт стартовый серверный код.

Примеры работы с Genkit и Angular:

- [Agentic Apps with Genkit and Angular starter-kit](https://github.com/angular/examples/tree/main/genkit-angular-starter-kit) — новичок в ИИ? Начните с базового приложения с agentic-сценарием. Отличная точка входа для первого опыта.

- [Use Genkit in an Angular app](https://genkit.dev/docs/frameworks/angular/) — создайте базовое приложение с Genkit Flows, Angular и Gemini 2.5 Flash. Пошаговое руководство по full-stack Angular-приложению с ИИ.

- [Dynamic Story Generator app](https://github.com/angular/examples/tree/main/genkit-angular-story-generator) — agentic Angular-приложение на Genkit, Gemini и Imagen 3: динамическая история по взаимодействию пользователя с красивыми панелями изображений. Начните здесь, если хотите более продвинутый сценарий.

  У этого примера также есть подробные видеоразборы:
  - [Смотреть «Building Agentic Apps with Angular and Genkit live!»](https://youtube.com/live/mx7yZoIa2n4?feature=share)
  - [Смотреть «Building Agentic Apps with Angular and Genkit live! PT 2»](https://youtube.com/live/YR6LN5_o3B0?feature=share)

- [Building Agentic apps with Firebase and Google Cloud (Barista Example)](https://developers.google.com/solutions/learn/agentic-barista) — agentic-приложение для заказа кофе на Firebase и Google Cloud. Использует и Firebase AI Logic, и Genkit.

- [Creating Dynamic, Server-Driven UIs](https://github.com/angular/examples/tree/main/dynamic-sdui-app) — agentic Angular-приложения с UI-представлениями, генерируемыми во время выполнения по вводу пользователя.

  У этого примера также есть подробный видеоразбор:
  - [Смотреть «Exploring the future of web apps»](https://www.youtube.com/live/4qargCqOu70?feature=share)

### Создавайте приложения на базе ИИ с Firebase AI Logic и Angular {#build-ai-powered-applications-with-firebase-ai-logic-and-angular}

[Firebase AI Logic](https://firebase.google.com/products/vertex-ai-in-firebase) даёт безопасный способ обращаться к Vertex AI Gemini API или Imagen API прямо из веб- и мобильных приложений. Это удобно для Angular-разработчиков: приложение может быть full-stack или только клиентским. Для чисто клиентского приложения Firebase AI Logic — хороший выбор для внедрения ИИ.

Пример работы с Firebase AI Logic и Angular:

- [Firebase AI Logic x Angular Starter Kit](https://github.com/angular/examples/tree/main/firebase-ai-logic-angular-example) — стартовый набор для e-commerce с чат-агентом, выполняющим задачи. Начните здесь, если ещё не работали с Firebase AI Logic и Angular.

  В примере есть [подробный видеоразбор функциональности и добавления новых возможностей](https://youtube.com/live/4vfDz2al_BI).

### Создавайте приложения на базе ИИ с Gemini API и Angular {#build-ai-powered-applications-with-gemini-api-and-angular}

[Gemini API](https://ai.google.dev/gemini-api/docs) даёт доступ к современным моделям Google с поддержкой аудио, изображений, видео и текста. Модели оптимизированы под разные сценарии — [подробнее на сайте документации Gemini API](https://ai.google.dev/gemini-api/docs/models).

- [AI Text Editor Angular app template](https://github.com/FirebaseExtended/firebase-framework-tools/tree/main/starters/angular/ai-text-editor) — шаблон полноценного текстового редактора с ИИ: уточнение, расширение и формализация текста. Хорошая точка входа для вызовов Gemini API по HTTP.

- [AI Chatbot app template](https://github.com/FirebaseExtended/firebase-framework-tools/tree/main/starters/angular/ai-chatbot) — шаблон с интерфейсом чат-бота, общающегося с Gemini API по HTTP.

## Лучшие практики {#best-practices}

### Подключение к провайдерам моделей и безопасность API-учётных данных {#connecting-to-model-providers-and-keeping-your-api-credentials-secure}

При подключении к провайдерам моделей важно хранить секреты API в безопасности. _Никогда не помещайте API-ключ в файл, который попадает на клиент, например `environments.ts`_.

Архитектура приложения определяет, какие ИИ API и инструменты выбирать — в зависимости от того, клиентское оно или серверное. Инструменты вроде Firebase AI Logic дают безопасное подключение к API моделей из клиентского кода. Если нужен другой API или провайдер, рассмотрите proxy-сервер или даже [Cloud Functions for Firebase](https://firebase.google.com/docs/functions) как прокси, чтобы не раскрывать ключи.

Пример клиентского подключения: [репозиторий Firebase AI Logic Angular example](https://github.com/angular/examples/tree/main/firebase-ai-logic-angular-example).

Для серверных подключений к API моделей, требующим ключей, предпочтительнее secrets manager или переменные окружения, а не `environments.ts`. Следуйте стандартным практикам защиты ключей и учётных данных. Firebase теперь предоставляет новый secrets manager в обновлениях Firebase App Hosting. Подробнее — в [официальной документации](https://firebase.google.com/docs/app-hosting/configure).

Пример серверного подключения в full-stack приложении: [репозиторий Angular AI Example (Genkit and Angular Story Generator)](https://github.com/angular/examples/tree/main/genkit-angular-story-generator).

### Используйте Tool Calling для расширения приложений {#use-tool-calling-to-enhance-apps}

Если нужны agentic-сценарии, где агенты действуют и используют инструменты для решения задач по промптам, применяйте «tool calling». Tool calling (также function calling) позволяет LLM делать запросы обратно в приложение, которое его вызвало. Вы как разработчик определяете доступные инструменты и контролируете, как и когда они вызываются.

Tool calling расширяет веб-приложения дальше формата «вопрос–ответ» чат-бота. Модель можно наделить возможностью запрашивать вызовы функций через function calling API провайдера. Доступные инструменты выполняют более сложные действия в контексте приложения.

В [e-commerce примере](https://github.com/angular/examples/blob/main/firebase-ai-logic-angular-example/src/app/ai.service.ts#L88) из [репозитория Angular examples](https://github.com/angular/examples) LLM запрашивает вызовы функций инвентаря, чтобы получить контекст для более сложных задач — например, расчёта стоимости группы товаров. Объём доступного API и решение, вызывать ли запрошенную LLM функцию, остаются за вами. Вы контролируете поток выполнения. Можно открыть отдельные функции сервиса, но не все.

### Обработка недетерминированных ответов {#handling-non-deterministic-responses}

Поскольку модели могут возвращать недетерминированные результаты, приложения стоит проектировать с учётом этого. Несколько стратегий:

- Настраивайте промпты и параметры модели (например, [temperature](https://ai.google.dev/gemini-api/docs/prompting-strategies)) для большей или меньшей детерминированности. Подробнее — в [разделе о стратегиях промптинга](https://ai.google.dev/gemini-api/docs/prompting-strategies) на [ai.google.dev](https://ai.google.dev/).
- Используйте стратегию «human in the loop»: человек проверяет выводы перед продолжением сценария. Стройте workflow так, чтобы операторы (люди или другие модели) подтверждали выводы и ключевые решения.
- Применяйте tool (или function) calling и ограничения схемы, чтобы направлять и ограничивать ответы модели предопределёнными форматами и повышать предсказуемость.

Даже с этими приёмами в дизайн приложения стоит закладывать разумные запасные варианты. Следуйте стандартам устойчивости приложений. Например, недопустимо, чтобы приложение падало, если ресурс или API недоступны. В таком случае пользователю показывают сообщение об ошибке и, при необходимости, варианты следующих шагов. Для приложений на базе ИИ нужны те же соображения. Убеждайтесь, что ответ соответствует ожидаемому, и предусматривайте «мягкую посадку» через [graceful degradation](https://developer.mozilla.org/en-US/docs/Glossary/Graceful_degradation), если это не так. То же относится к сбоям API провайдеров LLM.

Пример: провайдер LLM не отвечает. Возможная стратегия:

- сохранить ответ пользователя для повторной попытки (сейчас или позже);
- сообщить пользователю о сбое уместным сообщением без раскрытия чувствительной информации;
- возобновить диалог позже, когда сервисы снова доступны.

## Следующие шаги {#next-steps}

О промптах для LLM и настройке ИИ-IDE см. следующие руководства:

<docs-pill-row>
  <docs-pill href="ai/develop-with-ai" title="Промпты для LLM и настройка IDE"/>
  <docs-pill href="ai/agent-skills" title="Agent Skills"/>
</docs-pill-row>
