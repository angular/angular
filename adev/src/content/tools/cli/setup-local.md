# Настройка локального окружения и workspace

Это руководство объясняет, как настроить окружение для разработки на Angular с помощью [Angular CLI](cli 'CLI command reference').
Оно включает информацию об установке CLI, создании начального workspace и стартового приложения, а также о локальном запуске этого приложения для проверки настройки.

<docs-callout title="Try Angular without local setup">

Если вы новичок в Angular, можно начать с [Попробуйте прямо сейчас!](tutorials/learn-angular), где представлены основы Angular в браузере.
Этот автономный туториал использует интерактивную среду [StackBlitz](https://stackblitz.com) для онлайн-разработки.
Локальное окружение не нужно настраивать, пока вы к этому не готовы.

</docs-callout>

## Перед началом {#before-you-start}

Чтобы использовать Angular CLI, следует быть знакомым со следующим:

<docs-pill-row>
  <docs-pill href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" title="JavaScript"/>
  <docs-pill href="https://developer.mozilla.org/en-US/docs/Web/HTML" title="HTML"/>
  <docs-pill href="https://developer.mozilla.org/en-US/docs/Web/CSS" title="CSS"/>
</docs-pill-row>

Также следует быть знакомым с использованием инструментов командной строки (CLI) и иметь общее понимание командных оболочек.
Знание [TypeScript](https://www.typescriptlang.org) полезно, но не обязательно.

## Зависимости {#dependencies}

Чтобы установить Angular CLI на локальную систему, необходимо установить [Node.js](https://nodejs.org/).
Angular CLI использует Node и связанный с ним менеджер пакетов npm для установки и запуска JavaScript-инструментов вне браузера.

[Скачайте и установите Node.js](https://nodejs.org/en/download), который также включает CLI `npm`.
Angular требует [активную LTS или maintenance LTS](https://nodejs.org/en/about/previous-releases) версию Node.js.
См. руководство по [совместимости версий Angular](reference/versions) для дополнительной информации.

## Установка Angular CLI {#install-the-angular-cli}

Чтобы установить Angular CLI, откройте окно терминала и выполните следующую команду:

<docs-code-multifile>
   <docs-code
     header="npm"
     language="shell"
     >
     npm install -g @angular/cli
     </docs-code>
   <docs-code
     header="pnpm"
     language="shell"
     >
     pnpm install -g @angular/cli
     </docs-code>
   <docs-code
     header="yarn"
     language="shell"
     >
     yarn global add @angular/cli
     </docs-code>
   <docs-code
     header="bun"
     language="shell"
     >
     bun install -g @angular/cli
     </docs-code>

 </docs-code-multifile>

### Политика выполнения PowerShell {#powershell-execution-policy}

На клиентских компьютерах Windows выполнение PowerShell-скриптов по умолчанию отключено, поэтому приведённая выше команда может завершиться ошибкой.
Чтобы разрешить выполнение PowerShell-скриптов, необходимое для глобальных бинарников npm, нужно установить следующую <a href="https://docs.microsoft.com/powershell/module/microsoft.powershell.core/about/about_execution_policies" target="_blank">политику выполнения</a>:

```sh

Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

```

Внимательно прочитайте сообщение, отображаемое после выполнения команды, и следуйте инструкциям. Убедитесь, что понимаете последствия установки политики выполнения.

### Права Unix {#unix-permissions}

В некоторых Unix-подобных окружениях глобальные скрипты могут принадлежать пользователю root, поэтому приведённая выше команда может завершиться ошибкой прав доступа.
Запустите с `sudo`, чтобы выполнить команду от имени root, и введите пароль по запросу:

<docs-code-multifile>
   <docs-code
     header="npm"
     language="shell"
     >
     sudo npm install -g @angular/cli
     </docs-code>
   <docs-code
     header="pnpm"
     language="shell"
     >
     sudo pnpm install -g @angular/cli
     </docs-code>
   <docs-code
     header="yarn"
     language="shell"
     >
     sudo yarn global add @angular/cli
     </docs-code>
   <docs-code
     header="bun"
     language="shell"
     >
     sudo bun install -g @angular/cli
     </docs-code>

 </docs-code-multifile>

Убедитесь, что понимаете последствия выполнения команд от имени root.

## Создание workspace и начального приложения {#create-a-workspace-and-initial-application}

Приложения разрабатываются в контексте **workspace** Angular.

Чтобы создать новый workspace и начальное стартовое приложение, выполните команду CLI `ng new` и укажите имя `my-app`, как показано здесь, затем ответьте на вопросы о включаемых возможностях:

```shell

ng new my-app

```

Angular CLI устанавливает необходимые npm-пакеты Angular и другие зависимости.
Это может занять несколько минут.

CLI создаёт новый workspace и небольшое welcome-приложение в новом каталоге с тем же именем, что и workspace, готовое к запуску.
Перейдите в новый каталог, чтобы последующие команды использовали этот workspace.

```shell

cd my-app

```

## Запуск приложения {#run-the-application}

Angular CLI включает development-сервер для локальной сборки и раздачи приложения. Выполните следующую команду:

```shell

ng serve --open

```

Команда `ng serve` запускает сервер, отслеживает файлы, а также пересобирает приложение и перезагружает браузер при внесении изменений в эти файлы.

Опция `--open` (или просто `-o`) автоматически открывает браузер по адресу `http://localhost:4200/` для просмотра сгенерированного приложения.

## Workspace и файлы проекта {#workspaces-and-project-files}

Команда [`ng new`](cli/new) создаёт папку [Angular workspace](reference/configs/workspace-config) и генерирует в ней новое приложение.
Workspace может содержать несколько приложений и библиотек.
Начальное приложение, созданное командой [`ng new`](cli/new), находится в корневом каталоге workspace.
При генерации дополнительного приложения или библиотеки в существующем workspace оно по умолчанию помещается в подпапку `projects/`.

Вновь сгенерированное приложение содержит исходные файлы корневого компонента и шаблона.
У каждого приложения есть папка `src`, содержащая его компоненты, данные и ресурсы.

Сгенерированные файлы можно редактировать напрямую или добавлять и изменять с помощью команд CLI.
Используйте команду [`ng generate`](cli/generate) для добавления новых файлов дополнительных компонентов, директив, pipes, сервисов и т.д.
Команды вроде [`ng add`](cli/add) и [`ng generate`](cli/generate), которые создают или работают с приложениями и библиотеками, должны выполняться
изнутри workspace. Напротив, команды вроде `ng new` должны выполняться _вне_ workspace, потому что они создают новый.

## Следующие шаги {#next-steps}

- Узнайте больше о [структуре файлов](reference/configs/file-structure) и [конфигурации](reference/configs/workspace-config) сгенерированного workspace.

- Протестируйте новое приложение с помощью [`ng test`](cli/test).

- Генерируйте boilerplate вроде компонентов, директив и pipes с помощью [`ng generate`](cli/generate).

- Разверните новое приложение и сделайте его доступным реальным пользователям с помощью [`ng deploy`](cli/deploy).

- Настройте и запустите сквозные тесты приложения с помощью [`ng e2e`](cli/e2e).
