# Начало работы с Service Worker

Этот документ объясняет, как включить поддержку Angular Service Worker в проектах, созданных с помощью [Angular CLI](tools/cli). Затем на примере демонстрируется Service Worker в действии, включая загрузку и базовое кэширование.

## Добавление Service Worker в проект {#adding-a-service-worker-to-your-project}

Чтобы настроить Angular Service Worker в проекте, выполните следующую команду CLI:

```shell

ng add @angular/pwa

```

CLI настраивает приложение для использования Service Worker, выполняя следующие действия:

1. Добавляет пакет `@angular/service-worker` в проект.
1. Включает поддержку сборки Service Worker в CLI.
1. Импортирует и регистрирует Service Worker в корневых провайдерах приложения.
1. Обновляет файл `index.html`:
   - Включает ссылку для добавления файла `manifest.webmanifest`
   - Добавляет мета-тег для `theme-color`
1. Устанавливает файлы иконок для поддержки установленного Progressive Web App (PWA).
1. Создаёт файл конфигурации Service Worker [`ngsw-config.json`](ecosystem/service-workers/config),
   который задаёт поведение кэширования и другие настройки.

Теперь выполните сборку проекта:

```shell

ng build

```

Проект CLI теперь настроен для использования Angular Service Worker.

## Service Worker в действии: обзор {#service-worker-in-action-a-tour}

В этом разделе демонстрируется Service Worker в действии на примере приложения. Для включения поддержки Service Worker при локальной разработке используйте производственную конфигурацию со следующей командой:

```shell

ng serve --configuration=production

```

Альтернативно можно использовать [пакет `http-server`](https://www.npmjs.com/package/http-server) из npm, который поддерживает приложения с Service Worker. Запустите его без установки командой:

```shell

npx http-server -p 8080 -c-1 dist/<project-name>/browser

```

Это запустит приложение с поддержкой Service Worker по адресу http://localhost:8080.

### Начальная загрузка {#initial-load}

При запущенном сервере на порту `8080` откройте браузер по адресу `http://localhost:8080`.
Приложение должно загрузиться нормально.

TIP: При тестировании Angular Service Worker рекомендуется использовать режим инкогнито или приватное окно в браузере, чтобы убедиться, что Service Worker не использует данные из предыдущего состояния, которое может вызвать непредсказуемое поведение.

HELPFUL: Если вы не используете HTTPS, Service Worker будет зарегистрирован только при доступе к приложению на `localhost`.

### Симуляция сетевой проблемы {#simulating-a-network-issue}

Для симуляции сетевой проблемы отключите сетевое взаимодействие для приложения.

В Chrome:

1. Выберите **Tools** > **Developer Tools** (из меню Chrome в правом верхнем углу).
1. Перейдите на вкладку **Network**.
1. Выберите **Offline** в выпадающем меню **Throttling**.

<img alt="The offline option in the Network tab is selected" src="assets/images/guide/service-worker/offline-option.png">

Теперь приложение не имеет доступа к сети.

Для приложений, не использующих Angular Service Worker, обновление страницы теперь отобразило бы страницу Chrome «Нет подключения к Интернету».

С добавлением Angular Service Worker поведение приложения меняется.
При обновлении страница загружается нормально.

Проверьте вкладку Network, чтобы убедиться, что Service Worker активен.

<img alt="Requests are marked as from ServiceWorker" src="assets/images/guide/service-worker/sw-active.png">

HELPFUL: В столбце "Size" состояние запросов указано как `(ServiceWorker)`.
Это означает, что ресурсы не загружаются из сети.
Вместо этого они загружаются из кэша Service Worker.

### Что кэшируется? {#whats-being-cached}

Обратите внимание, что все файлы, необходимые браузеру для рендеринга этого приложения, кэшированы.
Стандартная конфигурация `ngsw-config.json` настроена для кэширования конкретных ресурсов, используемых CLI:

- `index.html`
- `favicon.ico`
- Артефакты сборки (JS и CSS бандлы)
- Всё, что находится в `assets`
- Изображения и шрифты непосредственно в настроенном `outputPath` (по умолчанию `./dist/<project-name>/`) или `resourcesOutputPath`.
  Дополнительную информацию об этих параметрах см. в документации по `ng build`.

IMPORTANT: Сгенерированный `ngsw-config.json` содержит ограниченный список расширений кэшируемых шрифтов и изображений. В некоторых случаях может потребоваться изменить glob-паттерн в соответствии с вашими потребностями.

IMPORTANT: Если пути `resourcesOutputPath` или `assets` изменены после генерации файла конфигурации, нужно вручную изменить пути в `ngsw-config.json`.

### Внесение изменений в приложение {#making-changes-to-your-application}

Теперь, когда вы увидели, как Service Worker кэширует приложение, следующим шагом является понимание того, как работают обновления.
Внесите изменение в приложение и наблюдайте за установкой обновления Service Worker:

1. Если тестирование ведётся в режиме инкогнито, откройте вторую пустую вкладку.
   Это сохранит режим инкогнито и состояние кэша живыми во время теста.

1. Закройте вкладку приложения, но не окно.
   Это также должно закрыть Developer Tools.

1. Остановите `http-server` (Ctrl-c).
1. Откройте `src/app/app.component.html` для редактирования.
1. Измените текст `Welcome to {{title}}!` на `Bienvenue à {{title}}!`.
1. Выполните сборку и снова запустите сервер:

```shell
    ng build
    npx http-server -p 8080 -c-1 dist/<project-name>/browser
```

### Обновление приложения в браузере {#updating-your-application-in-the-browser}

Теперь посмотрите, как браузер и Service Worker обрабатывают обновлённое приложение.

1. Снова откройте [http://localhost:8080](http://localhost:8080) в том же окне.
   Что произошло?

   <img alt="It still says Welcome to Service Workers!" src="assets/images/guide/service-worker/welcome-msg-en.png">

   Что пошло не так?
   _На самом деле, ничего!_
   Angular Service Worker выполняет свою работу и обслуживает версию приложения, которую он **установил**, даже при наличии доступного обновления.
   В интересах скорости Service Worker не ждёт проверки обновлений, прежде чем обслуживать кэшированное приложение.

   Посмотрите логи `http-server`, чтобы увидеть запрос Service Worker к `/ngsw.json`.

   ```text
   [2023-09-07T00:37:24.372Z]  "GET /ngsw.json?ngsw-cache-bust=0.9365263935102124" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
   ```

   Именно так Service Worker проверяет наличие обновлений.

1. Обновите страницу.

   <img alt="The text has changed to say Bienvenue à app!" src="assets/images/guide/service-worker/welcome-msg-fr.png">

   Service Worker установил обновлённую версию приложения _в фоновом режиме_, и при следующей загрузке или перезагрузке страницы Service Worker переключается на последнюю версию.

## Конфигурация Service Worker {#service-worker-configuration}

Angular Service Worker поддерживает широкие параметры конфигурации через интерфейс `SwRegistrationOptions`, обеспечивая тонкий контроль над поведением регистрации, кэшированием и выполнением скриптов.

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

Опция `updateViaCache` управляет тем, как браузер использует HTTP-кэш при обновлениях Service Worker. Это обеспечивает тонкий контроль над тем, когда браузер загружает обновлённые скрипты Service Worker и импортированные модули.

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

- **`'imports'`** — HTTP-кэш используется для импортируемых скриптов Service Worker, но не для самого скрипта Service Worker
- **`'all'`** — HTTP-кэш используется как для скрипта Service Worker, так и для его импортируемых скриптов
- **`'none'`** — HTTP-кэш не используется ни для скрипта Service Worker, ни для его импортируемых скриптов

### Поддержка ES-модулей с опцией type {#es-module-support-with-type-option}

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

- **`'classic'`** (по умолчанию) — традиционное выполнение скрипта Service Worker. Функции ES-модулей, такие как `import` и `export`, НЕ допускаются в скрипте
- **`'module'`** — регистрирует скрипт как ES-модуль. Разрешает использование синтаксиса `import`/`export` и функций модулей

### Управление областью регистрации {#registration-scope-control}

Опция `scope` определяет область регистрации Service Worker, задавая диапазон URL, которым он может управлять.

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
- По умолчанию область — это директория, содержащая скрипт Service Worker
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

- **`'registerWhenStable:timeout'`** (по умолчанию: `'registerWhenStable:30000'`) — регистрация после стабилизации приложения (нет ожидающих микро/макро-задач), но не позднее указанного тайм-аута в миллисекундах
- **`'registerImmediately'`** — немедленная регистрация Service Worker
- **`'registerWithDelay:timeout'`** — регистрация с задержкой указанного тайм-аута в миллисекундах

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

Также можно предоставить фабричную функцию Observable для пользовательского времени регистрации:

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

## Подробнее об Angular Service Worker {#more-on-angular-service-workers}

Вас также может заинтересовать следующее:

<docs-pill-row>
  <docs-pill href="ecosystem/service-workers/config" title="Файл конфигурации"/>
  <docs-pill href="ecosystem/service-workers/communications" title="Взаимодействие с Service Worker"/>
  <docs-pill href="ecosystem/service-workers/push-notifications" title="Push-уведомления"/>
  <docs-pill href="ecosystem/service-workers/devops" title="DevOps для Service Worker"/>
  <docs-pill href="ecosystem/service-workers/app-shell" title="Паттерн App shell"/>
</docs-pill-row>
