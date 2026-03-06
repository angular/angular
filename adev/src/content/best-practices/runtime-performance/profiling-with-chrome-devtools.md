# Профилирование в Chrome DevTools {#profiling-with-the-chrome-devtools}

Angular интегрируется с [API расширяемости Chrome DevTools](https://developer.chrome.com/docs/devtools/performance/extension) для отображения данных и аналитики, специфичных для фреймворка, непосредственно на [панели производительности Chrome DevTools](https://developer.chrome.com/docs/devtools/performance/overview).

При включённой интеграции можно [записать профиль производительности](https://developer.chrome.com/docs/devtools/performance#record), содержащий два набора данных:

- Стандартные записи о производительности, основанные на понимании Chrome выполнения вашего кода в браузере, и
- Специфичные для Angular записи, предоставляемые средой выполнения фреймворка.

Оба набора данных отображаются вместе на одной вкладке, но на отдельных треках:

<img alt="Angular custom track in Chrome DevTools profiler" src="assets/images/best-practices/runtime-performance/angular-perf-in-chrome.png">

Специфичные для Angular данные выражены в понятиях фреймворка (компоненты, обнаружение изменений, хуки жизненного цикла и т.д.) наряду с низкоуровневыми вызовами функций и методов, захваченными браузером. Эти два набора данных коррелируют, и между ними можно переключаться на разные представления и уровни детализации.

Трек Angular можно использовать для лучшего понимания того, как ваш код работает в браузере, в том числе:

- Определение, является ли данный блок кода частью Angular-приложения или принадлежит другому скрипту на той же странице.
- Выявление узких мест производительности и их отнесение к конкретным компонентам или сервисам.
- Получение более глубокого понимания внутренней работы Angular с визуальной разбивкой каждого цикла обнаружения изменений.

## Запись профиля {#recording-a-profile}

### Включение интеграции {#enable-integration}

Включить профилирование Angular можно двумя способами:

1. Выполнить [`ng.enableProfiling()`](api/core/enableProfiling) в консоли Chrome, или
1. Включить вызов [`enableProfiling()`](api/core/enableProfiling) в стартовый код приложения (импортировать из `@angular/core`).

NOTE: Профилирование Angular работает исключительно в режиме разработки.

Пример того, как включить интеграцию при запуске приложения для захвата всех возможных событий:

```ts
import {enableProfiling} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {MyApp} from './my-app';

// Turn on profiling *before* bootstrapping your application
// in order to capture all of the code run on start-up.
enableProfiling();
bootstrapApplication(MyApp);
```

### Запись профиля {#record-a-profile}

Используйте кнопку **Record** на панели производительности Chrome DevTools:

<img alt="Recording a profile" src="assets/images/best-practices/runtime-performance/recording-profile-in-chrome.png">

Подробнее о записи профилей см. в [документации Chrome DevTools](https://developer.chrome.com/docs/devtools/performance#record).

## Интерпретация записанного профиля {#interpreting-a-recorded-profile}

Пользовательский трек «Angular» позволяет быстро выявлять и диагностировать проблемы с производительностью. В следующих разделах описаны некоторые распространённые сценарии профилирования.

### Различение Angular-приложения и других задач на той же странице {#differentiating-between-your-angular-application-and-other-tasks-on-the-same-page}

Поскольку данные Angular и Chrome отображаются на отдельных, но коррелирующих треках, можно видеть, когда выполняется код Angular-приложения, в отличие от других операций браузера (как правило, компоновки и отрисовки) или других скриптов на той же странице (в этом случае пользовательский трек Angular не содержит данных):

<img alt="Profile data: Angular vs. 3rd party scripts execution" src="assets/images/best-practices/runtime-performance/profile-angular-vs-3rd-party.png">

Это позволяет определить, должны ли дальнейшие исследования сосредоточиться на коде Angular-приложения или на других частях кодовой базы или зависимостях.

### Цветовое кодирование {#color-coding}

Angular использует цвета в диаграмме flame chart для различения типов задач:

- 🟦 Синий обозначает TypeScript-код, написанный разработчиком приложения (например: сервисы, конструкторы компонентов и хуки жизненного цикла и т.д.).
- 🟪 Фиолетовый обозначает код шаблонов, написанный разработчиком приложения и преобразованный компилятором Angular.
- 🟩 Зелёный обозначает точки входа в код приложения и определяет _причины_ выполнения кода.

Следующие примеры иллюстрируют описанное цветовое кодирование на различных реальных записях.

#### Пример: Запуск приложения {#example-application-bootstrapping}

Процесс запуска приложения обычно состоит из:

- Триггеров, отмеченных синим, таких как вызов `bootstrapApplication`, создание экземпляра корневого компонента и начальное обнаружение изменений
- Различных DI-сервисов, создаваемых при запуске, отмеченных зелёным.

<img alt="Profile data: bootstrap application" src="assets/images/best-practices/runtime-performance/profile-bootstrap-application.png">

#### Пример: Выполнение компонента {#example-component-execution}

Обработка одного компонента обычно представлена как точка входа (синий), за которой следует выполнение шаблона (фиолетовый). Шаблон, в свою очередь, может запускать создание экземпляров директив и выполнение хуков жизненного цикла (зелёный):

<img alt="Profile data: component processing" src="assets/images/best-practices/runtime-performance/profile-component-processing.png">

#### Пример: Обнаружение изменений {#example-change-detection}

Цикл обнаружения изменений обычно состоит из одного или нескольких проходов синхронизации данных (синий), где каждый проход обходит подмножество компонентов.

<img alt="Profile data: change detection" src="assets/images/best-practices/runtime-performance/profile-change-detection.png">

С помощью этой визуализации данных можно немедленно определить компоненты, участвовавшие в обнаружении изменений, и те, которые были пропущены (как правило, компоненты `OnPush`, не помеченные как «грязные»).

Кроме того, можно проверить количество проходов синхронизации за одно обнаружение изменений. Наличие более одного прохода синхронизации свидетельствует о том, что состояние обновляется во время обнаружения изменений. Этого следует избегать, поскольку это замедляет обновления страницы и в худшем случае может привести к бесконечным циклам.
