# Профилирование с Chrome DevTools

Angular интегрируется с [Chrome DevTools extensibility API](https://developer.chrome.com/docs/devtools/performance/extension), чтобы показывать данные и insights фреймворка прямо в [панели Performance Chrome DevTools](https://developer.chrome.com/docs/devtools/performance/overview).

При включённой интеграции можно [записать профиль производительности](https://developer.chrome.com/docs/devtools/performance#record), содержащий два набора данных:

- стандартные записи производительности на основе понимания Chrome вашего кода в браузере;
- Angular-специфичные записи, добавляемые runtime фреймворка.

Оба набора данных показываются на одной вкладке, но на отдельных дорожках:

<img alt="Angular custom track in Chrome DevTools profiler" src="assets/images/best-practices/runtime-performance/angular-perf-in-chrome.png">

Angular-специфичные данные выражены в терминах концепций фреймворка (компоненты, обнаружение изменений, хуки жизненного цикла и т.д.) рядом с вызовами функций и методов нижнего уровня, зафиксированными браузером. Эти два набора данных коррелированы — можно переключаться между представлениями и уровнями детализации.

Дорожку Angular можно использовать, чтобы лучше понять, как код выполняется в браузере, в том числе:

- определить, относится ли блок кода к Angular-приложению или к другому скрипту на той же странице;
- найти узкие места производительности и связать их с конкретными компонентами или сервисами;
- глубже понять внутреннюю работу Angular с визуальной разбивкой каждого цикла обнаружения изменений.

## Запись профиля {#recording-a-profile}

### Включение интеграции {#enable-integration}

Профилирование Angular можно включить одним из двух способов:

1. Выполнить [`ng.enableProfiling()`](api/core/enableProfiling) в консоли Chrome, или
1. Добавить вызов [`enableProfiling()`](api/core/enableProfiling) в код запуска приложения (импорт из `@angular/core`).

NOTE: Профилирование Angular работает только в режиме разработки.

Пример включения интеграции при bootstrap приложения, чтобы зафиксировать все возможные события:

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

Используйте кнопку **Record** в панели Performance Chrome DevTools:

<img alt="Recording a profile" src="assets/images/best-practices/runtime-performance/recording-profile-in-chrome.png">

Подробнее о записи профилей — в [документации Chrome DevTools](https://developer.chrome.com/docs/devtools/performance#record).

## Открытие компонента в Angular DevTools {#open-a-component-in-angular-devtools}

После записи профиля выберите событие компонента на дорожке **Angular**.
Во вкладке **Summary** может быть ссылка **Component**, использующая схему URL `angular-devtools://component/...`.

<img alt="Chrome DevTools Performance panel showing an Angular custom track with a selected _MainComponent event. The Summary tab displays a Component link that uses the angular-devtools://component URL scheme." src="assets/images/best-practices/runtime-performance/chrome-performance-deep-link.png">

Нажмите ссылку, чтобы открыть Angular DevTools и выбрать соответствующий компонент на вкладке **Components**.
Так вы переходите от профиля уровня браузера к состоянию и метаданным компонента для выбранного события.

NOTE: Открытие ссылок на компоненты требует Angular DevTools для Chrome и экспериментального флага Chrome `chrome://flags/#enable-devtools-deep-link-via-extensibility-api`.

## Интерпретация записанного профиля {#interpreting-a-recorded-profile}

Пользовательскую дорожку «Angular» можно использовать для быстрого выявления и диагностики проблем производительности. Ниже — распространённые сценарии профилирования.

### Различие между Angular-приложением и другими задачами на той же странице {#differentiating-between-your-angular-application-and-other-tasks-on-the-same-page}

Поскольку данные Angular и Chrome показаны на отдельных, но коррелированных дорожках, видно, когда выполняется код Angular-приложения, а когда — другая обработка браузера (обычно layout и paint) или другие скрипты на той же странице (в этом случае на пользовательской дорожке Angular нет данных):

<img alt="Profile data: Angular vs. 3rd party scripts execution" src="assets/images/best-practices/runtime-performance/profile-angular-vs-3rd-party.png">

Это позволяет решить, куда направить дальнейшее расследование: на код Angular-приложения или на другие части кодовой базы и зависимости.

### Цветовая кодировка {#color-coding}

Angular использует цвета в flame chart, чтобы различать типы задач:

- 🟦 Синий — код TypeScript, написанный разработчиком приложения (например: сервисы, конструкторы компонентов и хуки жизненного цикла и т.д.).
- 🟪 Фиолетовый — код шаблонов, написанный разработчиком и преобразованный компилятором Angular.
- 🟩 Зелёный — точки входа в код приложения и _причины_ выполнения кода.

Следующие примеры иллюстрируют описанную цветовую кодировку в реальных записях.

#### Пример: bootstrap приложения {#example-application-bootstrapping}

Процесс bootstrap приложения обычно состоит из:

- триггеров, отмеченных синим: вызов `bootstrapApplication`, создание корневого компонента и начальное обнаружение изменений;
- различных DI-сервисов, создаваемых при bootstrap, отмеченных зелёным.

<img alt="Profile data: bootstrap application" src="assets/images/best-practices/runtime-performance/profile-bootstrap-application.png">

#### Пример: выполнение компонента {#example-component-execution}

Обработка одного компонента обычно представлена точкой входа (синий), за которой следует выполнение шаблона (фиолетовый). Шаблон, в свою очередь, может вызвать создание директив и выполнение хуков жизненного цикла (зелёный):

<img alt="Profile data: component processing" src="assets/images/best-practices/runtime-performance/profile-component-processing.png">

#### Пример: обнаружение изменений {#example-change-detection}

Цикл обнаружения изменений обычно состоит из одного или нескольких проходов синхронизации данных (синий), где каждый проход обходит подмножество компонентов.

<img alt="Profile data: change detection" src="assets/images/best-practices/runtime-performance/profile-change-detection.png">

С такой визуализацией сразу видно, какие компоненты участвовали в обнаружении изменений, а какие были пропущены (обычно `OnPush`-компоненты, не помеченные dirty).

Кроме того, можно проверить число проходов синхронизации за одно обнаружение изменений. Более одного прохода говорит о том, что состояние обновляется во время обнаружения изменений. Этого следует избегать: это замедляет обновления страницы и в худших случаях может привести к бесконечным циклам.
