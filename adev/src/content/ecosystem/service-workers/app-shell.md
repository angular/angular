# Паттерн App Shell {#app-shell-pattern}

[Паттерн App Shell](https://developer.chrome.com/blog/app-shell) — это способ отрисовки части приложения с использованием маршрута во время сборки.
Он может улучшить пользовательский опыт за счёт быстрого отображения статической страницы (общего для всех страниц скелета) пока браузер загружает полную клиентскую версию и автоматически переключается на неё после загрузки кода.

Это даёт пользователям значимую первую отрисовку приложения, которая появляется быстро, потому что браузеру не нужно инициализировать JavaScript для рендеринга HTML и CSS.

<docs-workflow>
<docs-step title="Подготовьте приложение">
Выполните следующую команду Angular CLI:

```shell
ng new my-app
```

Для существующего приложения необходимо вручную добавить `Router` и определить `<router-outlet>` внутри приложения.
</docs-step>
<docs-step title="Создайте оболочку приложения">
Используйте Angular CLI для автоматического создания оболочки приложения.

```shell
ng generate app-shell
```

Подробнее об этой команде см. в разделе [Команда app-shell](cli/generate/app-shell).

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

<docs-step title="Проверьте сборку с содержимым оболочки">

```shell
ng build --configuration=development
```

Или для использования конфигурации production:

```shell
ng build
```

Для проверки результата сборки откройте <code class="no-auto-link">dist/my-app/browser/index.html</code>.
Найдите текст по умолчанию `app-shell works!`, чтобы убедиться, что маршрут оболочки приложения был отрисован как часть вывода.
</docs-step>
</docs-workflow>
