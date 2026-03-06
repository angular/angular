# Начало работы с Service Worker {#getting-started-with-service-workers}

В этом документе описывается, как включить поддержку Angular Service Worker в проектах, созданных с помощью [Angular CLI](tools/cli). Затем на примере показывается Service Worker в действии: загрузка и базовое кэширование.

## Добавление Service Worker в проект {#adding-a-service-worker-to-your-project}

Для настройки Angular Service Worker в проекте выполните следующую команду CLI:

```shell

ng add @angular/pwa

```

CLI настраивает приложение для использования Service Worker, выполняя следующие действия:

1. Добавляет пакет `@angular/service-worker` в проект.
1. Включает поддержку сборки Service Worker в CLI.
1. Импортирует и регистрирует Service Worker с корневыми провайдерами приложения.
1. Обновляет файл `index.html`:
   - Добавляет ссылку на файл `manifest.webmanifest`
   - Добавляет мета-тег для `theme-color`
1. Устанавливает файлы иконок для поддержки установленного прогрессивного веб-приложения (PWA).
1. Создаёт файл конфигурации Service Worker [`ngsw-config.json`](ecosystem/service-workers/config),
   определяющий поведение кэширования и другие параметры.

Теперь выполните сборку проекта:

```shell

ng build

```

Проект CLI теперь настроен для использования Angular Service Worker.

## Service Worker в действии: обзор {#service-worker-in-action-a-tour}

В этом разделе демонстрируется Service Worker в действии на примере приложения. Для включения поддержки Service Worker при локальной разработке используйте конфигурацию production со следующей командой:

```shell

ng serve --configuration=production

```

Также можно использовать пакет [`http-server`](https://www.npmjs.com/package/http-server) из npm, который поддерживает приложения с Service Worker. Запустите его без установки:

```shell

npx http-server -p 8080 -c-1 dist/<project-name>/browser

```

Это запустит приложение с поддержкой Service Worker по адресу http://localhost:8080.

### Начальная загрузка {#initial-load}

При запущенном сервере на порту `8080` откройте браузер по адресу `http://localhost:8080`.
Приложение должно загрузиться в обычном режиме.

TIP: При тестировании Angular Service Worker рекомендуется использовать режим инкогнито или приватное окно браузера, чтобы Service Worker не читал данные предыдущего состояния, что может вызвать непредвиденное поведение.

HELPFUL: Если HTTPS не используется, Service Worker будет зарегистрирован только при доступе к приложению через `localhost`.

### Имитация проблем с сетью {#simulating-a-network-issue}

Для имитации проблем с сетью отключите сетевое взаимодействие для приложения.

В Chrome:

1. Выберите **Инструменты** > **Инструменты разработчика** (из меню Chrome в правом верхнем углу).
1. Перейдите на вкладку **Сеть**.
1. Выберите **Офлайн** в выпадающем меню **Ограничение пропускной способности**.

<img alt="The offline option in the Network tab is selected" src="assets/images/guide/service-worker/offline-option.png">

Теперь приложение не имеет доступа к сети.

Для приложений, не использующих Angular Service Worker, обновление страницы в этом случае отобразит страницу Chrome «Нет подключения к Интернету».

После добавления Angular Service Worker поведение приложения изменяется.
При обновлении страница загружается в обычном режиме.

Проверьте вкладку «Сеть», чтобы убедиться, что Service Worker активен.

<img alt="Requests are marked as from ServiceWorker" src="assets/images/guide/service-worker/sw-active.png">

HELPFUL: В столбце «Размер» состояние запросов указано как `(ServiceWorker)`.
Это означает, что ресурсы загружаются не из сети.
Вместо этого они загружаются из кэша Service Worker.

### Что кэшируется? {#whats-being-cached}

Обратите внимание, что все файлы, необходимые браузеру для отрисовки приложения, кэшируются.
Стандартная конфигурация `ngsw-config.json` настроена на кэширование конкретных ресурсов, используемых CLI:

- `index.html`
- `favicon.ico`
- Артефакты сборки (бандлы JS и CSS)
- Всё содержимое папки `assets`
- Изображения и шрифты непосредственно в настроенном `outputPath` (по умолчанию `./dist/<project-name>/`) или `resourcesOutputPath`.
  Подробнее об этих параметрах см. в документации `ng build`.

IMPORTANT: Генерируемый `ngsw-config.json` содержит ограниченный список расширений кэшируемых шрифтов и изображений. В некоторых случаях может потребоваться изменить glob-паттерн в соответствии с потребностями.

IMPORTANT: Если пути `resourcesOutputPath` или `assets` изменяются после генерации файла конфигурации, пути необходимо обновить вручную в `ngsw-config.json`.

### Внесение изменений в приложение {#making-changes-to-your-application}

Теперь, когда вы увидели, как Service Worker кэширует приложение, следующий шаг — понять, как работают обновления.
Внесите изменение в приложение и наблюдайте за установкой обновления Service Worker:

1. Если тестирование ведётся в режиме инкогнито, откройте вторую пустую вкладку.
   Это сохранит режим инкогнито и состояние кэша в течение теста.

1. Закройте вкладку с приложением, но не окно.
   Это также закроет инструменты разработчика.

1. Остановите `http-server` (Ctrl-c).
1. Откройте `src/app/app.component.html` для редактирования.
1. Замените текст `Welcome to {{title}}!` на `Bienvenue à {{title}}!`.
1. Выполните сборку и снова запустите сервер:

```shell
    ng build
    npx http-server -p 8080 -c-1 dist/<project-name>/browser
```

### Обновление приложения в браузере {#updating-your-application-in-the-browser}

Посмотрите, как браузер и Service Worker обрабатывают обновлённое приложение.

1. Снова откройте [http://localhost:8080](http://localhost:8080) в том же окне.
   Что произошло?

   <img alt="It still says Welcome to Service Workers!" src="assets/images/guide/service-worker/welcome-msg-en.png">

   Что пошло не так?
   _Ничего, на самом деле!_
   Angular Service Worker выполняет свою работу и обслуживает версию приложения, которую он **установил**, даже несмотря на наличие доступного обновления.
   В интересах скорости Service Worker не ждёт проверки обновлений перед обслуживанием кэшированного приложения.

   Посмотрите логи `http-server`, чтобы увидеть запрос Service Worker к `/ngsw.json`.

   ```text
   [2023-09-07T00:37:24.372Z]  "GET /ngsw.json?ngsw-cache-bust=0.9365263935102124" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
   ```

   Так Service Worker проверяет наличие обновлений.

1. Обновите страницу.

   <img alt="The text has changed to say Bienvenue à app!" src="assets/images/guide/service-worker/welcome-msg-fr.png">

   Service Worker установил обновлённую версию приложения _в фоновом режиме_, и при следующей загрузке или перезагрузке страницы Service Worker переключится на последнюю версию.

## Конфигурация Service Worker {#service-worker-configuration}

Angular Service Worker поддерживает широкие возможности конфигурации через интерфейс `SwRegistrationOptions`, обеспечивая детальное управление поведением регистрации, кэшированием и выполнением скриптов.

### Включение и отключение Service Worker {#enabling-and-disabling-service-workers}

Опция `enabled` управляет тем, будет ли Service Worker зарегистрирован и будут ли связанные сервисы пытаться с ним взаимодействовать.

```ts
import {ApplicationConfig, isDevMode} from '@angular/core';
import {provideServiceWorker} from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(), // Disable in development, enable in production
    }),
  ],
};
```

### Управление кэшем с помощью updateViaCache {#cache-control-with-updateviacache}

Опция `updateViaCache` управляет тем, как браузер обращается к HTTP-кэшу при обновлениях Service Worker. Это обеспечивает детальный контроль над тем, когда браузер загружает обновлённые скрипты Service Worker и импортируемые модули.

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      updateViaCache: 'imports',
    }),
  ],
};
```

Опция `updateViaCache` принимает следующие значения:

- **`'imports'`** — HTTP-кэш используется для импортированных скриптов Service Worker, но не для самого скрипта Service Worker
- **`'all'`** — HTTP-кэш используется как для скрипта Service Worker, так и для его импортированных скриптов
- **`'none'`** — HTTP-кэш не используется ни для скрипта Service Worker, ни для его импортированных скриптов

### Поддержка ES-модулей с помощью опции type {#es-module-support-with-type-option}

Опция `type` позволяет указать тип скрипта при регистрации Service Worker, обеспечивая поддержку функций ES-модулей в скриптах Service Worker.

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      type: 'module', // Enable ES module features
    }),
  ],
};
```

Опция `type` принимает следующие значения:

- **`'classic'`** (по умолчанию) — традиционное выполнение скрипта Service Worker. Функции ES-модулей, такие как `import` и `export`, НЕ разрешены в скрипте
- **`'module'`** — регистрирует скрипт как ES-модуль. Разрешает использование синтаксиса `import`/`export` и функций модулей

### Управление областью регистрации {#registration-scope-control}

Опция `scope` определяет область регистрации Service Worker, задавая диапазон URL, которые он может контролировать.

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      scope: '/app/', // Service worker will only control URLs under /app/
    }),
  ],
};
```

- Управляет URL, которые Service Worker может перехватывать и обрабатывать
- По умолчанию областью является директория, содержащая скрипт Service Worker
- Используется при вызове `ServiceWorkerContainer.register()`

### Настройка стратегии регистрации {#registration-strategy-configuration}

Опция `registrationStrategy` определяет, когда Service Worker будет зарегистрирован в браузере, обеспечивая контроль над временем регистрации.

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
```

Доступные стратегии регистрации:

- **`'registerWhenStable:timeout'`** (по умолчанию: `'registerWhenStable:30000'`) — регистрация как только приложение стабилизируется (нет незавершённых микро-/макро-задач), но не позднее указанного времени ожидания в миллисекундах
- **`'registerImmediately'`** — немедленная регистрация Service Worker
- **`'registerWithDelay:timeout'`** — регистрация с задержкой указанного времени ожидания в миллисекундах

```ts
// Register immediately
export const immediateConfig: ApplicationConfig = {
  providers: [
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerImmediately',
    }),
  ],
};

// Register with a 5-second delay
export const delayedConfig: ApplicationConfig = {
  providers: [
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWithDelay:5000',
    }),
  ],
};
```

Также можно предоставить фабричную функцию Observable для настраиваемого времени регистрации:

```ts
import {timer} from 'rxjs';

export const customConfig: ApplicationConfig = {
  providers: [
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: () => timer(10_000), // Register after 10 seconds
    }),
  ],
};
```

## Дополнительные материалы по Angular Service Worker {#more-on-angular-service-workers}

Также может быть полезным следующее:

<docs-pill-row>
  <docs-pill href="ecosystem/service-workers/config" title="Файл конфигурации"/>
  <docs-pill href="ecosystem/service-workers/communications" title="Взаимодействие с Service Worker"/>
  <docs-pill href="ecosystem/service-workers/push-notifications" title="Push-уведомления"/>
  <docs-pill href="ecosystem/service-workers/devops" title="DevOps для Service Worker"/>
  <docs-pill href="ecosystem/service-workers/app-shell" title="Паттерн App Shell"/>
</docs-pill-row>
