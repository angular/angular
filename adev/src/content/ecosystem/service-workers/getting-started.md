# Начало работы с Service Workers

Этот документ объясняет, как включить поддержку Angular Service Worker в проектах, созданных с
помощью [Angular CLI](tools/cli). Затем на примере демонстрируется работа Service Worker, включая загрузку и базовое
кеширование.

## Добавление Service Worker в проект

Чтобы настроить Angular Service Worker в вашем проекте, выполните следующую команду CLI:

```shell

ng add @angular/pwa

```

CLI настраивает ваше приложение для использования Service Workers, выполняя следующие действия:

1. Добавляет пакет `@angular/service-worker` в ваш проект.
1. Включает поддержку сборки Service Worker в CLI.
1. Импортирует и регистрирует Service Worker в корневых провайдерах приложения.
1. Обновляет файл `index.html`:

- Включает ссылку для добавления файла `manifest.webmanifest`
- Добавляет мета-тег для `theme-color`

1. Устанавливает файлы иконок для поддержки установленного Progressive Web App (PWA).
1. Создает конфигурационный файл Service Worker под названием [`ngsw-config.json`](ecosystem/service-workers/config),
   который определяет поведение кеширования и другие настройки.

Теперь соберите проект:

```shell

ng build

```

Проект CLI теперь настроен для использования Angular Service Worker.

## Service Worker в действии: обзор

Этот раздел демонстрирует работу Service Worker на примере приложения. Чтобы включить поддержку Service Worker во время
локальной разработки, используйте производственную конфигурацию с помощью следующей команды:

```shell

ng serve --configuration=production

```

В качестве альтернативы можно использовать пакет [`http-server`](https://www.npmjs.com/package/http-server) из npm,
который поддерживает приложения с Service Worker. Запустите его без установки с помощью:

```shell

npx http-server -p 8080 -c-1 dist/<project-name>/browser

```

Это запустит ваше приложение с поддержкой Service Worker по адресу http://localhost:8080.

### Первоначальная загрузка

Запустив сервер на порту `8080`, перейдите в браузере по адресу `http://localhost:8080`.
Ваше приложение должно загрузиться как обычно.

СОВЕТ: При тестировании Angular Service Workers рекомендуется использовать режим инкогнито или приватное окно в
браузере, чтобы гарантировать, что Service Worker не считывает предыдущее остаточное состояние, что может вызвать
неожиданное поведение.

ПОЛЕЗНО: Если вы не используете HTTPS, Service Worker будет зарегистрирован только при доступе к приложению через
`localhost`.

### Моделирование проблем с сетью

Чтобы смоделировать проблему с сетью, отключите сетевое взаимодействие для вашего приложения.

В Chrome:

1. Выберите **Tools** > **Developer Tools** (в меню Chrome в правом верхнем углу).
1. Перейдите на вкладку **Network**.
1. Выберите **Offline** в выпадающем меню **Throttling**.

<img alt="Опция offline выбрана на вкладке Network" src="assets/images/guide/service-worker/offline-option.png">

Теперь у приложения нет доступа к сети.

Для приложений, не использующих Angular Service Worker, обновление страницы сейчас отобразило бы страницу Chrome "Нет
подключения к Интернету".

С добавлением Angular Service Worker поведение приложения меняется.
При обновлении страница загружается нормально.

Посмотрите на вкладку Network, чтобы убедиться, что Service Worker активен.

<img alt="Запросы помечены как от ServiceWorker" src="assets/images/guide/service-worker/sw-active.png">

ПОЛЕЗНО: В столбце "Size" состояние запросов указано как `(ServiceWorker)`.
Это означает, что ресурсы загружаются не из сети.
Вместо этого они загружаются из кеша Service Worker.

### Что кешируется?

Обратите внимание, что все файлы, необходимые браузеру для рендеринга этого приложения, закешированы.
Шаблонная конфигурация `ngsw-config.json` настроена на кеширование конкретных ресурсов, используемых CLI:

- `index.html`
- `favicon.ico`
- Артефакты сборки (JS и CSS бандлы)
- Всё в папке `assets`
- Изображения и шрифты непосредственно в настроенном `outputPath` (по умолчанию `./dist/<project-name>/`) или
  `resourcesOutputPath`.
  См. документацию по `ng build` для получения дополнительной информации об этих опциях.

ВАЖНО: Сгенерированный `ngsw-config.json` включает ограниченный список расширений для кешируемых шрифтов и изображений.
В некоторых случаях вам может потребоваться изменить glob-шаблон в соответствии с вашими потребностями.

ВАЖНО: Если пути `resourcesOutputPath` или `assets` были изменены после генерации файла конфигурации, необходимо
изменить пути вручную в `ngsw-config.json`.

### Внесение изменений в приложение

Теперь, когда вы увидели, как Service Worker кеширует приложение, следующий шаг — понять, как работают обновления.
Внесите изменение в приложение и наблюдайте, как Service Worker устанавливает обновление:

1. Если вы тестируете в окне инкогнито, откройте вторую пустую вкладку.
   Это сохранит состояние инкогнито и кеша активными во время теста.

1. Закройте вкладку приложения, но не окно.
   Это также должно закрыть инструменты разработчика.

1. Остановите `http-server` (Ctrl-c).
1. Откройте `src/app/app.component.html` для редактирования.
1. Измените текст `Welcome to {{title}}!` на `Bienvenue à {{title}}!`.
1. Соберите проект и запустите сервер снова:

```shell
    ng build
    npx http-server -p 8080 -c-1 dist/<project-name>/browser
```

### Обновление приложения в браузере

Теперь посмотрите, как браузер и Service Worker обрабатывают обновленное приложение.

1. Откройте [http://localhost:8080](http://localhost:8080) снова в том же окне.
   Что происходит?

   <img alt="Текст все еще гласит Welcome to Service Workers!" src="assets/images/guide/service-worker/welcome-msg-en.png">

   Что пошло не так?
   _На самом деле, ничего!_
   Angular Service Worker выполняет свою работу и предоставляет ту версию приложения, которую он **установил**, даже
   если доступно обновление.
   В интересах скорости Service Worker не ждет проверки обновлений перед тем, как предоставить закешированное
   приложение.

   Посмотрите логи `http-server`, чтобы увидеть запрос Service Worker к `/ngsw.json`.

   ```text
   [2023-09-07T00:37:24.372Z]  "GET /ngsw.json?ngsw-cache-bust=0.9365263935102124" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
   ```

   Так Service Worker проверяет наличие обновлений.

1. Обновите страницу.

   <img alt="Текст изменился на Bienvenue à app!" src="assets/images/guide/service-worker/welcome-msg-fr.png">

   Service Worker установил обновленную версию вашего приложения _в фоновом режиме_, и при следующей загрузке или
   перезагрузке страницы Service Worker переключится на последнюю версию.

## Конфигурация Service Worker

Angular Service Workers поддерживают обширные возможности конфигурации через интерфейс `SwRegistrationOptions`,
обеспечивая детальный контроль над поведением регистрации, кешированием и выполнением скриптов.

### Включение и отключение Service Workers

Опция `enabled` управляет тем, будет ли зарегистрирован Service Worker и будут ли связанные сервисы пытаться
взаимодействовать с ним.

```ts

import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(), // Отключить в разработке, включить в продакшене
    }),
  ],
};

```

### Управление кешем с помощью updateViaCache

Опция `updateViaCache` управляет тем, как браузер обращается к HTTP-кешу во время обновлений Service Worker. Это
обеспечивает детальный контроль над тем, когда браузер извлекает обновленные скрипты Service Worker и импортируемые
модули.

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

- **`'imports'`** — HTTP-кеш используется для скриптов, импортируемых скриптом Service Worker, но не для самого скрипта
  Service Worker
- **`'all'`** — HTTP-кеш используется как для скрипта Service Worker, так и для его импортируемых скриптов
- **`'none'`** — HTTP-кеш не используется ни для скрипта Service Worker, ни для его импортируемых скриптов

### Поддержка ES-модулей с опцией type

Опция `type` позволяет указать тип скрипта при регистрации Service Worker, обеспечивая поддержку функций ES-модулей в
ваших скриптах Service Worker.

```ts

export const appConfig: ApplicationConfig = {
  providers: [
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      type: 'module', // Включить функции ES-модулей
    }),
  ],
};

```

Опция `type` принимает следующие значения:

- **`'classic'`** (по умолчанию) — Традиционное выполнение скрипта Service Worker. Функции ES-модулей, такие как
  `import` и `export`, НЕ разрешены в скрипте
- **`'module'`** — Регистрирует скрипт как ES-модуль. Позволяет использовать синтаксис `import`/`export` и функции
  модулей

### Управление областью регистрации (scope)

Опция `scope` определяет область регистрации Service Worker, указывая диапазон URL-адресов, которыми он может управлять.

```ts

export const appConfig: ApplicationConfig = {
  providers: [
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      scope: '/app/', // Service Worker будет управлять только URL-адресами в /app/
    }),
  ],
};

```

- Управляет тем, какие URL-адреса Service Worker может перехватывать и обрабатывать
- По умолчанию областью видимости является каталог, содержащий скрипт Service Worker
- Используется при вызове `ServiceWorkerContainer.register()`

### Конфигурация стратегии регистрации

Опция `registrationStrategy` определяет, когда Service Worker будет зарегистрирован в браузере, обеспечивая контроль над
временем регистрации.

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

- **`'registerWhenStable:timeout'`** (по умолчанию: `'registerWhenStable:30000'`) — Регистрировать, как только
  приложение стабилизируется (нет ожидающих микро-/макрозадач), но не позднее указанного тайм-аута в миллисекундах
- **`'registerImmediately'`** — Зарегистрировать Service Worker немедленно
- **`'registerWithDelay:timeout'`** — Зарегистрировать с задержкой в указанное количество миллисекунд

```ts

// Зарегистрировать немедленно
export const immediateConfig: ApplicationConfig = {
  providers: [
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerImmediately',
    }),
  ],
};

// Зарегистрировать с задержкой в 5 секунд
export const delayedConfig: ApplicationConfig = {
  providers: [
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWithDelay:5000',
    }),
  ],
};

```

Вы также можете предоставить фабричную функцию, возвращающую Observable, для пользовательского времени регистрации:

```ts
import { timer } from 'rxjs';

export const customConfig: ApplicationConfig = {
  providers: [
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: () => timer(10_000), // Зарегистрировать через 10 секунд
    }),
  ],
};

```

## Дополнительно об Angular Service Workers

Вас также может заинтересовать следующее:

<docs-pill-row>
  <docs-pill href="ecosystem/service-workers/config" title="Файл конфигурации"/>
  <docs-pill href="ecosystem/service-workers/communications" title="Взаимодействие с Service Worker"/>
  <docs-pill href="ecosystem/service-workers/push-notifications" title="Push-уведомления"/>
  <docs-pill href="ecosystem/service-workers/devops" title="DevOps для Service Worker"/>
  <docs-pill href="ecosystem/service-workers/app-shell" title="Шаблон App shell"/>
</docs-pill-row>
