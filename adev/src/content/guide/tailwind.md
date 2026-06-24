# Использование Tailwind CSS в Angular

[Tailwind CSS](https://tailwindcss.com/) — это utility-first CSS-фреймворк, который позволяет создавать современные
веб-сайты, не покидая HTML. В этом руководстве описан процесс настройки Tailwind CSS в вашем проекте Angular.

## Автоматическая настройка с помощью `ng add`

Angular CLI предоставляет удобный способ интеграции Tailwind CSS в ваш проект с помощью команды `ng add`. Эта команда
автоматически устанавливает необходимые пакеты, настраивает Tailwind CSS и обновляет настройки сборки вашего проекта.

Сначала перейдите в корневую директорию вашего проекта Angular в терминале и выполните следующую команду:

```shell
ng add tailwindcss
```

Эта команда выполняет следующие действия:

- Устанавливает `tailwindcss` и его peer-зависимости.
- Настраивает проект для использования Tailwind CSS.
- Добавляет директиву `@import` Tailwind CSS в ваши стили.

После выполнения `ng add tailwindcss` вы можете сразу начать использовать utility-классы Tailwind в шаблонах ваших
компонентов.

## Ручная настройка (альтернативный метод)

Если вы предпочитаете настраивать Tailwind CSS вручную, выполните следующие шаги:

### 1. Создайте проект Angular

Сначала создайте новый проект Angular, если у вас его еще нет.

```shell
ng new my-project
cd my-project
```

### 2. Установите Tailwind CSS

Далее откройте терминал в корневой директории вашего проекта Angular и выполните следующую команду для установки
Tailwind CSS и его peer-зависимостей:

<docs-code-multifile>
  <docs-code header="npm" language="shell">
    npm install tailwindcss @tailwindcss/postcss postcss
  </docs-code>
  <docs-code header="yarn" language="shell">
    yarn add tailwindcss @tailwindcss/postcss postcss
  </docs-code>
  <docs-code header="pnpm" language="shell">
    pnpm add tailwindcss @tailwindcss/postcss postcss
  </docs-code>
  <docs-code header="bun" language="shell">
    bun add tailwindcss @tailwindcss/postcss postcss
  </docs-code>
</docs-code-multifile>

### 3. Настройте плагины PostCSS

Затем добавьте файл `.postcssrc.json` в корень проекта.
Добавьте плагин `@tailwindcss/postcss` в вашу конфигурацию PostCSS.

```json {header: '.postcssrc.json'}

{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

### 4. Импортируйте Tailwind CSS

Добавьте `@import` в файл `./src/styles.css` для импорта Tailwind CSS.

<docs-code language="css" header="src/styles.css">
@import "tailwindcss";
</docs-code>

Если вы используете SCSS, добавьте `@use` в файл `./src/styles.scss`.

<docs-code language="scss" header="src/styles.scss">
@use "tailwindcss";
</docs-code>

### 5. Начните использовать Tailwind в вашем проекте

Теперь вы можете использовать utility-классы Tailwind в шаблонах ваших компонентов для стилизации приложения. Запустите
процесс сборки с помощью `ng serve`, и вы должны увидеть стилизованный заголовок.

Например, вы можете добавить следующий код в ваш файл `app.html`:

```html
<h1 class="text-3xl font-bold underline">
  Hello world!
</h1>
```

## Дополнительные ресурсы

- [Документация Tailwind CSS](https://tailwindcss.com/docs)
