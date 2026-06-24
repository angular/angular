# Руководство по встроенным учебным материалам Angular

- [Файлы руководства](#tutorial-files)
- [Структура директорий руководств](#tutorials-directory-structure)
- [Зарезервированные директории руководств](#reserved-tutorials-directories)

## Файлы руководства

Содержимое учебных материалов (туториалов) состоит из контента, исходного кода и конфигурации.

### Контент: `README.md`

Контент руководства должен находиться в файле `README.md` в директории руководства.

На примере руководства `learn-angular`, см.: [
`src/content/tutorials/learn-angular/intro/README.md`](/src/content/tutorials/learn-angular/intro/README.md)

### Конфигурация: `config.json`

Каждое руководство определяется файлом `config.json`, который может содержать следующие опции:

- `title`: определяет заголовок руководства, используемый в навигации.
- `nextTutorial`: путь к следующему руководству (только на этапе `intro/`).
- `src`: относительный путь к внешней директории, определяющей исходный код руководства, используемый во встроенном
  редакторе.
- `answerSrc`: относительный путь к внешней директории, определяющей решение (ответ) руководства, используемое во
  встроенном редакторе.
- `openFiles`: массив файлов, которые должны быть открыты в редакторе.
- `type`: тип определяет, как будет представлено руководство и какие компоненты для него необходимы:
  - `cli`: руководство с типом `cli` будет содержать только контент и интерактивный терминал с Angular CLI.
  - `editor`: используется для полноценного встроенного редактора, содержащего редактор кода, превью, интерактивный
    терминал и консоль с выводом dev-сервера.
  - `local`: отключает встроенный редактор и показывает только контент.
  - `editor-only`: специальная конфигурация, используемая для песочницы (playground) руководств и песочницы главной
    страницы, которая отключает контент и показывает только встроенный редактор.

### Исходный код

Исходный код руководства включает все файлы в директории руководства, за исключением `README.md` и `config.json`.

Исходный код руководства имеет приоритет над файлами проекта [`common`](#common). Поэтому, если файл существует и в [
`common`](#common), и в директории руководства с одинаковым относительным путем, файл руководства переопределит файл
из [`common`](#common).

## Структура директорий руководств

Руководство состоит из введения и шагов. И введение, и каждый шаг содержат свой собственный контент, конфигурацию и
исходный код.

На примере руководства `learn-angular`:

### Введение

[`src/content/tutorials/learn-angular/intro`](/src/content/tutorials/learn-angular/intro)

это введение руководства, которое будет размещаться по маршруту `/tutorials/learn-angular`.

### Шаги

[`src/content/tutorials/learn-angular/steps`](/src/content/tutorials/learn-angular/steps) — это директория, содержащая
шаги руководства.

Вот несколько примеров из руководства `learn-angular`:

- [`learn-angular/steps/1-components-in-angular`](/src/content/tutorials/learn-angular/steps/1-components-in-angular):
  Маршрут будет `/tutorials/learn-angular/components-in-angular`
- [
  `learn-angular/steps/2-updating-the-component-class`](/src/content/tutorials/learn-angular/steps/2-updating-the-component-class):
  Маршрут будет `/tutorials/learn-angular/updating-the-component-class`

Имя директории каждого шага должно начинаться с цифры, за которой следует дефис, а затем название пути шага.

- Цифра обозначает шаг, определяя, каким будет предыдущий и следующий шаг внутри руководства.
- Дефис — это разделитель :).
- Название пути, взятое из имени директории, определяет URL шага.

## Зарезервированные директории руководств

### `common`

Проект `common` — это полноценный Angular-проект, который повторно используется всеми руководствами. Он содержит все
зависимости (`package.json`, `package-lock.json`), конфигурацию проекта (`tsconfig.json`, `angular.json`) и основные
файлы для начальной загрузки приложения (`index.html`, `main.ts`, `app.module.ts`).

Общий проект используется по ряду причин:

- Избежание дублирования файлов в руководствах.
- Оптимизация производительности внутри приложения за счет запроса файлов общего проекта и зависимостей только один раз,
  используя преимущества кэша браузера при последующих запросах.
- Требуется единственный `npm install` для всех руководств, что сокращает время до интерактивности при переходе между
  различными руководствами и шагами.
- Обеспечение единообразного окружения для всех руководств.
- Возможность для каждого руководства сосредоточиться на конкретном исходном коде изучаемой темы, а не на настройке
  проекта.

См. [`src/content/tutorials/common`](/src/content/tutorials/common)

### `playground`

Директория `playground` содержит исходный код для песочницы руководств по адресу `/playground`. Она не должна содержать
никакого контента.

См. [`src/content/tutorials/playground`](/src/content/tutorials/playground)

### `homepage`

Директория `homepage` содержит исходный код для песочницы главной страницы. Она не должна содержать никакого контента.

См. [`src/content/tutorials/homepage`](/src/content/tutorials/homepage)

## Обновление зависимостей

Чтобы обновить зависимости всех руководств, вы можете запустить следующий скрипт:

```bash
rm ./adev/src/content/tutorials/homepage/package-lock.json  ./adev/src/content/tutorials/first-app/common/package-lock.json ./adev/src/content/tutorials/learn-angular/common/package-lock.json ./adev/src/content/tutorials/playground/common/package-lock.json ./adev/src/content/tutorials/deferrable-views/common/package-lock.json

npm i --package-lock-only --prefix ./adev/src/content/tutorials/homepage
npm i --package-lock-only --prefix ./adev/src/content/tutorials/first-app/common
npm i --package-lock-only --prefix ./adev/src/content/tutorials/learn-angular/common
npm i --package-lock-only --prefix ./adev/src/content/tutorials/playground/common
npm i --package-lock-only --prefix ./adev/src/content/tutorials/deferrable-views/common
```
