# Паттерн App shell {#app-shell-pattern}

[Паттерн App shell](https://developer.chrome.com/blog/app-shell) — это способ рендеринга части приложения с использованием маршрута во время сборки.
Он может улучшить пользовательский опыт, быстро отображая статически отрендеренную страницу (скелет, общий для всех страниц), пока браузер загружает полную клиентскую версию и автоматически переключается на неё после загрузки кода.

Это даёт пользователям значимую первую отрисовку приложения, которая появляется быстро, поскольку браузер может рендерить HTML и CSS без необходимости инициализировать JavaScript.

<docs-workflow>
<docs-step title="Подготовка приложения">
Выполните следующую команду Angular CLI:

```shell
ng new my-app
```

Для существующего приложения необходимо вручную добавить `Router` и определить `<router-outlet>` внутри приложения.
</docs-step>
<docs-step title="Создание App shell приложения">
Используйте Angular CLI для автоматического создания App shell.

```shell
ng generate app-shell
```

Дополнительную информацию об этой команде см. в [App shell command](cli/generate/app-shell).

Команда обновляет код приложения и добавляет дополнительные файлы в структуру проекта.

```text
src
├── app
│ ├── app.config.server.ts # server application configuration
│ └── app-shell # app-shell component
│   ├── app-shell.component.html
│   ├── app-shell.component.scss
│   ├── app-shell.component.spec.ts
│   └── app-shell.component.ts
└── main.server.ts # main server application bootstrapping
```

<docs-step title="Проверка сборки приложения с содержимым shell">

```shell
ng build --configuration=development
```

Или для использования производственной конфигурации:

```shell
ng build
```

Чтобы проверить вывод сборки, откройте <code class="no-auto-link">dist/my-app/browser/index.html</code>.
Найдите текст по умолчанию `app-shell works!`, чтобы убедиться, что маршрут App shell был отрендерен как часть вывода.
</docs-step>
</docs-workflow>
