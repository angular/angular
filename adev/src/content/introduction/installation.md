<docs-decorative-header title="Установка" imgSrc="adev/src/assets/images/what_is_angular.svg"> <!-- markdownlint-disable-line -->
</docs-decorative-header>

Начните работу с Angular быстро — через онлайн-стартеры или локально в терминале.

## Играйте онлайн {#play-online}

Если вы просто хотите поэкспериментировать с Angular в браузере без настройки проекта, используйте нашу онлайн-песочницу:

<docs-card title="Playground" href="/playground" link="Открыть в Playground" iconImgSrc="adev/src/assets/icons/playground.svg" titleInline>
Самый быстрый способ поработать с приложением Angular. Настройка не требуется.
</docs-card>

## Настройка нового проекта локально {#set-up-a-new-project-locally}

Если вы начинаете новый проект, скорее всего, захотите создать локальный проект, чтобы использовать такие инструменты, как Git.

### Требования {#prerequisites}

- **Node.js** — [v20.19.0 или новее](/reference/versions)
- **Текстовый редактор** — рекомендуем [Visual Studio Code](https://code.visualstudio.com/)
- **Терминал** — необходим для выполнения команд [Angular CLI](/tools/cli)
- **Инструмент разработки** — для улучшения рабочего процесса рекомендуем [Angular Language Service](/tools/language-service)

### Инструкции {#instructions}

Следующее руководство проведёт вас через настройку локального проекта Angular.

#### Установка Angular CLI {#install-angular-cli}

Откройте терминал (если вы используете [Visual Studio Code](https://code.visualstudio.com/), можно открыть [встроенный терминал](https://code.visualstudio.com/docs/editor/integrated-terminal)) и выполните следующую команду:

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

Если у вас возникают проблемы с выполнением этой команды в Windows или Unix, ознакомьтесь с [документацией CLI](/tools/cli/setup-local#install-the-angular-cli) для получения дополнительной информации.

#### Создание нового проекта {#create-a-new-project}

В терминале выполните команду CLI [`ng new`](cli/new) с желаемым именем проекта. В следующих примерах мы будем использовать имя проекта `my-first-angular-app`.

```shell
ng new <project-name>
```

Вам будут предложены параметры конфигурации проекта. Используйте клавиши со стрелками и Enter для навигации и выбора нужных опций.

Если у вас нет предпочтений, просто нажмите Enter, чтобы принять значения по умолчанию и продолжить настройку.

После выбора параметров конфигурации и завершения настройки CLI вы должны увидеть следующее сообщение:

```text
✔ Packages installed successfully.
    Successfully initialized git.
```

На этом этапе вы готовы запустить проект локально!

#### Локальный запуск нового проекта {#running-your-new-project-locally}

В терминале перейдите в новый проект Angular.

```shell
cd my-first-angular-app
```

Все зависимости должны быть установлены на этом этапе (это можно проверить наличием папки `node_modules` в проекте), поэтому можно запустить проект командой:

```shell
npm start
```

Если всё прошло успешно, в терминале должно появиться похожее подтверждающее сообщение:

```text
Watch mode enabled. Watching for file changes...
NOTE: Raw file sizes do not reflect development server per-request transformations.
  ➜  Local:   http://localhost:4200/
  ➜  press h + enter to show help
```

Теперь можно открыть путь из `Local` (например, `http://localhost:4200/`) и увидеть приложение. Удачного кодинга! 🎉

### Разработка с помощью ИИ {#using-ai-for-development}

Чтобы начать разработку в предпочитаемой IDE с поддержкой ИИ, [ознакомьтесь с правилами промптов и лучшими практиками Angular](/ai/develop-with-ai).

## Следующие шаги {#next-steps}

Теперь, когда вы создали проект Angular, вы можете узнать больше об Angular в нашем [руководстве «Основы»](/essentials) или выбрать тему в подробных руководствах!
