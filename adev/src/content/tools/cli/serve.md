# Запуск приложений Angular для разработки

Вы можете запустить ваше приложение Angular CLI с помощью команды `ng serve`.
Это скомпилирует приложение, пропустит ненужные оптимизации, запустит сервер разработки (devserver), а также будет
автоматически пересобирать проект и перезагружать страницу при любых последующих изменениях.
Остановить сервер можно нажатием `Ctrl+C`.

`ng serve` выполняет только билдер для цели `serve` в проекте по умолчанию, как указано в `angular.json`. Хотя здесь
может использоваться любой билдер, наиболее распространенным (и используемым по умолчанию) является
`@angular/build:dev-server`.

Вы можете определить, какой билдер используется для конкретного проекта, посмотрев цель `serve` этого проекта.

```json

{
  "projects": {
    "my-app": {
      "architect": {
        // `ng serve` invokes the Architect target named `serve`.
        "serve": {
          "builder": "@angular/build:dev-server",
          // ...
        },
        "build": { /* ... */ },
        "test": { /* ... */ }
      }
    }
  }
}

```

## Проксирование на бэкенд-сервер

Используйте [поддержку проксирования](https://vite.dev/config/server-options#server-proxy), чтобы перенаправлять
определенные URL на бэкенд-сервер, передав файл в опцию сборки `--proxy-config`.
Например, чтобы перенаправить все вызовы `http://localhost:4200/api` на сервер, запущенный на
`http://localhost:3000/api`, выполните следующие шаги.

1. Создайте файл `proxy.conf.json` в папке `src/` вашего проекта.
1. Добавьте следующее содержимое в новый файл прокси:

```json
{
  "/api/**": {
    "target": "http://localhost:3000",
    "secure": false
  }
}
```

1. В файле конфигурации CLI, `angular.json`, добавьте опцию `proxyConfig` в цель `serve`:

```json
{
  "projects": {
    "my-app": {
      "architect": {
        "serve": {
          "builder": "@angular/build:dev-server",
          "options": {
            "proxyConfig": "src/proxy.conf.json"
          }
        }
      }
    }
  }
}

```

1. Чтобы запустить сервер разработки с этой конфигурацией прокси, выполните `ng serve`.

ПРИМЕЧАНИЕ: Чтобы применить изменения, внесенные в файл конфигурации прокси, необходимо перезапустить процесс
`ng serve`.

### Поведение сопоставления путей зависит от билдера

**`@angular/build:dev-server`** (основан на [Vite](https://vite.dev/config/server-options#server-proxy))

- `/api` соответствует только `/api`.
- `/api/*` соответствует `/api/users`, но не `/api/users/123`.
- `/api/**` соответствует `/api/users` и `/api/users/123`.

**`@angular-devkit/build-angular:dev-server`** (основан
на [Webpack DevServer](https://webpack.js.org/configuration/dev-server/#devserverproxy))

- `/api` соответствует `/api` и любым подпутям (эквивалентно `/api/**`).
