<docs-decorative-header title="Установка" imgSrc="adev/src/assets/images/what_is_angular.svg"> <!-- markdownlint-disable-line -->
</docs-decorative-header>

Начните работу с Angular быстро, используя онлайн-стартеры или локально через терминал.

## Попробовать онлайн {#try-online}

Если вы просто хотите поэкспериментировать с Angular в браузере без настройки проекта, вы можете использовать нашу
онлайн-песочницу:

<docs-card-container>
  <docs-card title="" href="/playground" link="Открыть в Playground">
  Самый быстрый способ поиграть с Angular-приложением. Настройка не требуется.
  </docs-card>
</docs-card-container>

## Настроить новый проект локально {#set-up-a-new-project-locally}

Если вы начинаете новый проект, вы, скорее всего, захотите создать локальный проект, чтобы иметь возможность
использовать такие инструменты, как Git.

### Предварительные требования {#prerequisites}

- **Node.js** - [v20.19.0 или новее](/reference/versions)
- **Текстовый редактор** - Мы рекомендуем [Visual Studio Code](https://code.visualstudio.com/)
- **Терминал** - Требуется для запуска команд Angular CLI
- **Инструмент разработки** - Для улучшения рабочего процесса разработки мы
  рекомендуем [Angular Language Service](/tools/language-service)

### Инструкции {#instructions}

Следующее руководство поможет вам создать локальный проект Angular.

#### Установка Angular CLI {#install-the-angular-cli}

Откройте терминал (если вы используете [Visual Studio Code](https://code.visualstudio.com/), вы можете
открыть [встроенный терминал](https://code.visualstudio.com/docs/editor/integrated-terminal)) и выполните следующую
команду:

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

Если у вас возникли проблемы с выполнением этой команды в Windows или Unix, ознакомьтесь
с [документацией CLI](/tools/cli/setup-local#install-the-angular-cli) для получения дополнительной информации.

#### Создание нового проекта {#create-a-new-project}

В вашем терминале выполните CLI команду `ng new` с желаемым именем проекта. В следующих примерах мы будем использовать
имя проекта `my-first-angular-app`.

```shell
ng new <project-name>
```

Вам будут предложены некоторые параметры конфигурации для вашего проекта. Используйте клавиши со стрелками и Enter для
навигации и выбора нужных опций.

Если у вас нет особых предпочтений, просто нажмите клавишу Enter, чтобы принять параметры по умолчанию и продолжить
настройку.

После выбора параметров конфигурации и завершения настройки CLI вы должны увидеть следующее сообщение:

```text
✔ Packages installed successfully.
    Successfully initialized git.
```

Теперь вы готовы запустить свой проект локально!

#### Запуск нового проекта локально {#run-your-new-project-locally}

В терминале перейдите в ваш новый проект Angular.

```shell
cd my-first-angular-app
```

На данный момент все ваши зависимости должны быть установлены (что вы можете проверить, убедившись в наличии папки
`node_modules` в вашем проекте), поэтому вы можете запустить проект, выполнив команду:

```shell
npm start
```

Если все прошло успешно, вы должны увидеть похожее подтверждающее сообщение в вашем терминале:

```text
Watch mode enabled. Watching for file changes...
NOTE: Raw file sizes do not reflect development server per-request transformations.
  ➜  Local:   http://localhost:4200/
  ➜  press h + enter to show help
```

И теперь вы можете перейти по пути в `Local` (например, `http://localhost:4200`), чтобы увидеть ваше приложение.
Приятного кодинга! 🎉

### Использование ИИ для разработки {#using-ai-for-development}

Чтобы начать разработку в вашей предпочтительной IDE с поддержкой
ИИ, [ознакомьтесь с правилами промптинга Angular и лучшими практиками](/ai/develop-with-ai).

## Следующие шаги {#next-steps}

Теперь, когда вы создали свой проект Angular, вы можете узнать больше об Angular в
нашем [Руководстве по основам](/essentials) или выбрать тему в наших подробных гайдах!
