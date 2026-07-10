# Формат пакетов Angular

Этот документ описывает Angular Package Format \(APF\).
APF — Angular-специфичная спецификация структуры и формата npm-пакетов, используемая всеми first-party пакетами Angular \(`@angular/core`, `@angular/material` и т.д.\) и большинством сторонних Angular-библиотек.

APF позволяет пакету бесшовно работать в большинстве распространённых сценариев использования Angular.
Пакеты, использующие APF, совместимы с инструментами команды Angular, а также с более широкой экосистемой JavaScript.
Рекомендуется, чтобы разработчики сторонних библиотек следовали тому же формату npm-пакетов.

HELPFUL: APF версионируется вместе с остальным Angular, и каждая major-версия улучшает формат пакета.
Версии спецификации до v13 можно найти в этом [google doc](https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/preview).

## Зачем указывать формат пакета? {#why-specify-a-package-format}

В сегодняшнем ландшафте JavaScript разработчики потребляют пакеты многими разными способами, используя множество разных toolchain \(webpack, Rollup, esbuild и т.д.\).
Эти инструменты могут понимать и требовать разные входы — некоторые инструменты могут обрабатывать последнюю версию языка ES, тогда как другим может быть выгодно напрямую потреблять более старую версию ES.

Формат дистрибуции Angular поддерживает все распространённые инструменты разработки и workflows и делает акцент на оптимизациях, которые приводят либо к меньшему размеру payload приложения, либо к более быстрому циклу итерации разработки \(время сборки\).

Разработчики могут опираться на Angular CLI и [ng-packagr](https://github.com/ng-packagr/ng-packagr) \(инструмент сборки, который использует Angular CLI\) для производства пакетов в формате пакетов Angular.
См. руководство [Создание библиотек](tools/libraries/creating-libraries) для подробностей.

## Раскладка файлов {#file-layout}

Следующий пример показывает упрощённую версию раскладки файлов пакета `@angular/core` с объяснением каждого файла в пакете.

```markdown
node_modules/@angular/core
├── README.md
├── package.json
├── fesm2022
│ ├── core.mjs
│ ├── core.mjs.map
│ ├── testing.mjs
│ └── testing.mjs.map
└── types
│ ├── core.d.ts
│ ├── testing.d.ts
```

В этой таблице описана раскладка файлов под `node_modules/@angular/core` с аннотациями, описывающими назначение файлов и каталогов:

| Файлы                                                                                                                                                     | Назначение                                                                                                                                                                                                        |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `README.md`                                                                                                                                               | README пакета, используемый веб-UI npmjs.                                                                                                                                                                          |
| `package.json`                                                                                                                                            | Основной `package.json`, описывающий сам пакет, а также все доступные entrypoints и форматы кода. Этот файл содержит mapping «exports», используемый runtime и инструментами для разрешения модулей. |
| `fesm2022/` <br /> &nbsp;&nbsp;─ `core.mjs` <br /> &nbsp;&nbsp;─ `core.mjs.map` <br /> &nbsp;&nbsp;─ `testing.mjs` <br /> &nbsp;&nbsp;─ `testing.mjs.map` | Код для всех entrypoints в flattened \(FESM\) формате ES2022 вместе с source maps.                                                                                                                          |
| `types/` <br /> &nbsp;&nbsp;─ `core.d.ts` <br /> &nbsp;&nbsp;─ `testing.d.ts`                                                                             | Объединённые определения типов TypeScript для всех публичных entrypoints.                                                                                                                                                |

## `package.json` {#packagejson}

Основной `package.json` содержит важные метаданные пакета, включая следующее:

- Он [объявляет](#esm-declaration) пакет в формате EcmaScript Module \(ESM\)
- Он содержит поле `"exports"`, определяющее доступные форматы исходного кода всех entrypoints
- Он содержит [ключи](#legacy-resolution-keys), определяющие доступные форматы исходного кода первичного entrypoint `@angular/core` для инструментов, которые не понимают `"exports"`.
  Эти ключи считаются deprecated и могут быть удалены по мере распространения поддержки `"exports"` в экосистеме.

- Он объявляет, содержит ли пакет [side effects](#side-effects)

### Объявление ESM {#esm-declaration}

Top-level `package.json` содержит ключ:

```js
{
  "type": "module"
}
```

Это сообщает resolvers, что код внутри пакета использует EcmaScript Modules, а не модули CommonJS.

### `"exports"` {#exports}

Поле `"exports"` имеет следующую структуру:

```js
"exports": {
  "./schematics/*": {
    "default": "./schematics/*.js"
  },
  "./package.json": {
    "default": "./package.json"
  },
  ".": {
    "types": "./types/core.d.ts",
    "default": "./fesm2022/core.mjs"
  },
  "./testing": {
    "types": "./types/testing.d.ts",
    "default": "./fesm2022/testing.mjs"
  }
}
```

Основной интерес представляют ключи `"."` и `"./testing"`, которые определяют доступные форматы кода для первичного entrypoint `@angular/core` и вторичного entrypoint `@angular/core/testing` соответственно.
Для каждого entrypoint доступные форматы:

| Форматы                   | Подробности                                                                 |
| :------------------------ | :---------------------------------------------------------------------- |
| Typings \(файлы `.d.ts`\) | Файлы `.d.ts` используются TypeScript при зависимости от данного пакета. |
| `default`                 | Код ES2022, свёрнутый в один источник.                             |

Инструменты, осведомлённые об этих ключах, могут предпочтительно выбирать желаемый формат кода из `"exports"`.

Библиотеки могут захотеть экспонировать дополнительные статические файлы, не охваченные exports JavaScript-based entry-points, такие как Sass mixins или предварительно скомпилированный CSS.

Дополнительную информацию см. в [Управление ресурсами в библиотеке](tools/libraries/creating-libraries#managing-assets-in-a-library).

### Legacy-ключи разрешения {#legacy-resolution-keys}

Помимо `"exports"`, top-level `package.json` также определяет legacy-ключи разрешения модулей для resolvers, которые не поддерживают `"exports"`.
Для `@angular/core` это:

```js
{
  "module": "./fesm2022/core.mjs",
  "typings": "./types/core.d.ts",
}
```

Как показано в предыдущем фрагменте кода, resolver модулей может использовать эти ключи для загрузки конкретного формата кода.

### Side effects {#side-effects}

Последняя функция `package.json` — объявить, есть ли у пакета [side effects](#sideeffects-flag).

```js
{
  "sideEffects": false
}
```

Большинство пакетов Angular не должны зависеть от top-level side effects и поэтому должны включать это объявление.

## Entrypoints и разделение кода {#entrypoints-and-code-splitting}

Пакеты в Angular Package Format содержат один первичный entrypoint и ноль или более вторичных entrypoints \(например, `@angular/common/http`\).
Entrypoints служат нескольким функциям.

1. Они определяют module specifiers, из которых пользователи импортируют код \(например, `@angular/core` и `@angular/core/testing`\).

   Пользователи обычно воспринимают эти entrypoints как отдельные группы символов с разными целями или возможностями.

   Конкретные entrypoints могут использоваться только для специальных целей, таких как тестирование.
   Такие API можно отделить от первичного entrypoint, чтобы снизить шанс их случайного или некорректного использования.

1. Они определяют гранулярность, с которой код может загружаться лениво.

   Многие современные инструменты сборки способны на «code splitting» \(aka ленивую загрузку\) только на уровне ES Module.
   Angular Package Format в основном использует один «flat» ES Module на entry point. Это означает, что большинство инструментов сборки не могут разделить код с одним entry point на несколько выходных chunks.

Общее правило для пакетов APF — использовать entrypoints для наименьших возможных наборов логически связанного кода.
Например, пакет Angular Material публикует каждый логический компонент или набор компонентов как отдельный entrypoint — один для Button, один для Tabs и т.д.
Это позволяет каждому компоненту Material загружаться лениво отдельно, если нужно.

Не всем библиотекам нужна такая гранулярность.
Большинство библиотек с одной логической целью следует публиковать как один entrypoint.
`@angular/core`, например, использует один entrypoint для runtime, потому что runtime Angular обычно используется как единая сущность.

### Разрешение вторичных entry points {#resolution-of-secondary-entry-points}

Вторичные entrypoints могут разрешаться через поле `"exports"` файла `package.json` пакета.

## README.md {#readmemd}

Файл README в формате Markdown, используемый для отображения описания пакета на npm и GitHub.

Пример содержимого README пакета @angular/core:

```html
Angular &equals;&equals;&equals;&equals;&equals;&equals;&equals; The sources for this package are in
the main [Angular](https://github.com/angular/angular) repo.Please file issues and pull requests
against that repo. License: MIT
```

## Частичная компиляция {#partial-compilation}

Библиотеки в Angular Package Format должны публиковаться в режиме «partial compilation».
Это режим компиляции для `ngc`, который производит скомпилированный код Angular, не привязанный к конкретной версии runtime Angular, в отличие от полной компиляции, используемой для приложений, где версии компилятора и runtime Angular должны точно совпадать.

Чтобы частично скомпилировать код Angular, используйте флаг `compilationMode` в свойстве `angularCompilerOptions` вашего `tsconfig.json`:

```js
{
  …
  "angularCompilerOptions": {
    "compilationMode": "partial",
  }
}
```

Частично скомпилированный код библиотеки затем преобразуется в полностью скомпилированный код во время процесса сборки приложения Angular CLI.

Если ваш pipeline сборки не использует Angular CLI, см. руководство [Потребление partial ivy кода вне Angular CLI](tools/libraries/creating-libraries#consuming-partial-ivy-code-outside-the-angular-cli).

## Оптимизации {#optimizations}

### Flattening ES-модулей {#flattening-of-es-modules}

Angular Package Format указывает, что код должен публиковаться в «flattened» формате ES module.
Это значительно сокращает время сборки Angular-приложений, а также время загрузки и парсинга финального бандла приложения.
См. отличный пост [«The cost of small modules»](https://nolanlawson.com/2016/08/15/the-cost-of-small-modules) Nolan Lawson.

Компилятор Angular может генерировать index-файлы ES module. Инструменты вроде Rollup могут использовать эти файлы для генерации flattened-модулей в формате файла _Flattened ES Module_ (FESM).

FESM — формат файла, создаваемый путём свёртывания всех ES Modules, доступных из entrypoint, в один ES Module.
Он формируется путём следования всем импортам из пакета и копирования этого кода в один файл с сохранением всех публичных ES exports и удалением всех частных импортов.
Однако в некоторых случаях FESM может зависеть от shared chunks, разделяемых между несколькими entry points.

Сокращённое имя FESM, произносится _phe-som_, может сопровождаться числом, например FESM2020.
Число относится к уровню языка JavaScript внутри модуля.
Соответственно, файл FESM2022 был бы ESM+ES2022 и включал бы операторы import/export и исходный код ES2022.

Чтобы сгенерировать flattened ES Module index-файл, используйте следующие опции конфигурации в файле tsconfig.json:

```js
{
  "compilerOptions": {
    …
    "module": "esnext",
    "target": "es2022",
    …
  },
  "angularCompilerOptions": {
    …
    "flatModuleOutFile": "my-ui-lib.js",
    "flatModuleId": "my-ui-lib"
  }
}
```

После того как index-файл \(например, `my-ui-lib.js`\) сгенерирован ngc, bundlers и оптимизаторы вроде Rollup могут использоваться для производства flattened ESM-файла.

### Флаг «sideEffects» {#sideeffects-flag}

По умолчанию EcmaScript Modules имеют side effects: импорт из модуля гарантирует, что любой код на верхнем уровне этого модуля должен выполниться.
Это часто нежелательно, так как большинство side-effectful кода в типичных модулях на самом деле не является по-настоящему side-effectful, а вместо этого влияет только на конкретные символы.
Если эти символы не импортируются и не используются, часто желательно удалить их в процессе оптимизации, известном как tree-shaking, а side-effectful код может этому помешать.

Инструменты сборки, такие как webpack, поддерживают флаг, позволяющий пакетам объявлять, что они не зависят от side-effectful кода на верхнем уровне своих модулей, давая инструментам больше свободы для tree-shake кода из пакета.
Конечный результат этих оптимизаций должен быть меньшим размером бандла и лучшим распределением кода в chunks бандла после code-splitting.
Эта оптимизация может сломать ваш код, если он содержит нелокальные side effects — однако это нетипично для Angular-приложений и обычно является признаком плохого дизайна.
Рекомендация — всем пакетам заявлять статус free от side effects, устанавливая свойство `sideEffects` в `false`, а разработчикам следовать [Angular Style Guide](/style-guide), что естественно приводит к коду без нелокальных side effects.

Дополнительная информация: [документация webpack о side effects](https://github.com/webpack/webpack/tree/master/examples/side-effects)

### Уровень языка ES2022 {#es2022-language-level}

Уровень языка ES2022 теперь является уровнем языка по умолчанию, потребляемым Angular CLI и другими инструментами.
Angular CLI понижает уровень бандла до уровня языка, поддерживаемого всеми целевыми браузерами, на этапе сборки приложения.

### Бандлинг d.ts / flattening определений типов {#dts-bundling--type-definition-flattening}

Начиная с APF v8 рекомендуется бандлить определения TypeScript.
Бандлинг определений типов может значительно ускорить компиляции для пользователей, особенно если в библиотеке много отдельных исходных файлов `.ts`.

Angular использует [`rollup-plugin-dts`](https://github.com/Swatinem/rollup-plugin-dts) для flattening файлов `.d.ts` (используя `rollup`, аналогично тому, как создаются файлы FESM).

Использование rollup для бандлинга `.d.ts` полезно, так как он поддерживает code splitting между entry-points.
Например, если у вас несколько entrypoints, опирающихся на один и тот же shared type, вместе с более крупными flattened файлами `.d.ts` будет создан shared файл `.d.ts`.
Это желательно и избегает дублирования типов.

### Tslib {#tslib}

Начиная с APF v10 рекомендуется добавлять tslib как прямую зависимость первичного entry-point.
Это потому, что версия tslib привязана к версии TypeScript, использованной для компиляции библиотеки.

## Примеры {#examples}

<docs-pill-row>
  <docs-pill href="https://app.unpkg.com/@angular/core@21.0.6" title="@angular/core package"/>
  <docs-pill href="https://app.unpkg.com/@angular/material@21.0.3" title="@angular/material package"/>
</docs-pill-row>

## Определение терминов {#definition-of-terms}

Следующие термины намеренно используются по всему этому документу.
В этом разделе — определения всех из них для дополнительной ясности.

### Package {#package}

Наименьший набор файлов, публикуемых в npm и устанавливаемых вместе, например `@angular/core`.
Этот пакет включает манифест package.json, скомпилированный исходный код, файлы определений typescript, source maps, метаданные и т.д.
Пакет устанавливается с `npm install @angular/core`.

### Symbol {#symbol}

Класс, функция, константа или переменная, содержащиеся в модуле и опционально сделанные видимыми для внешнего мира через export модуля.

### Module {#module}

Сокращение от ECMAScript Modules.
Файл, содержащий операторы, которые импортируют и экспортируют символы.
Это идентично определению модулей в спецификации ECMAScript.

### ESM {#esm}

Сокращение от ECMAScript Modules \(см. выше\).

### FESM {#fesm}

Сокращение от Flattened ES Modules и состоит из формата файла, создаваемого путём свёртывания всех ES Modules, доступных из entry point, в один ES Module.
Обратите внимание, что FESM обычно один файл, но он может зависеть от shared chunk, разделяемого с другими FESM.

### Module ID {#module-id}

Идентификатор модуля, используемый в операторах import \(например, `@angular/core`\).
ID часто напрямую соответствует пути в файловой системе, но это не всегда так из-за различных стратегий разрешения модулей.

### Module specifier {#module-specifier}

Идентификатор модуля \(см. выше\).

### Стратегия разрешения модулей {#module-resolution-strategy}

Алгоритм, используемый для преобразования Module ID в пути в файловой системе.
У Node.js есть хорошо специфицированная и широко используемая; TypeScript поддерживает несколько стратегий разрешения модулей; у [Closure Compiler](https://developers.google.com/closure/compiler) есть ещё одна стратегия.

### Формат модуля {#module-format}

Спецификация синтаксиса модуля, покрывающая как минимум синтаксис импорта и экспорта из файла.
Распространённые форматы модулей — CommonJS \(CJS, обычно используемый для приложений Node.js\) или ECMAScript Modules \(ESM\).
Формат модуля указывает только упаковку отдельных модулей, но не возможности языка JavaScript, используемые для содержимого модуля.
Из-за этого команда Angular часто использует спецификатор уровня языка как суффикс к формату модуля \(например, ESM+ES2022 указывает, что модуль в формате ESM и содержит код ES2022\).

### Bundle {#bundle}

Артефакт в форме одного JS-файла, производимый инструментом сборки \(например, [webpack](https://webpack.js.org) или [Rollup](https://rollupjs.org)\), содержащий символы, происходящие из одного или нескольких модулей.
Bundles — browser-specific обходной путь, снижающий нагрузку на сеть, которая возникла бы, если бы браузеры начали загружать сотни, если не десятки тысяч файлов.
Node.js обычно не использует bundles.
Распространённые форматы бандлов — UMD и System.register.

### Уровень языка {#language-level}

Язык кода \(ES2022\).
Независим от формата модуля.

### Entry point {#entry-point}

Модуль, предназначенный для импорта пользователем.
На него ссылаются по уникальному Module ID, и он экспортирует публичный API, на который ссылается этот Module ID.
Пример — `@angular/core` или `@angular/core/testing`.
Оба entry points существуют в пакете `@angular/core`, но экспортируют разные символы.
У пакета может быть много entry points.

### Deep import {#deep-import}

Процесс получения символов из модулей, которые не являются Entry Points.
Эти Module ID обычно считаются частными API, которые могут меняться в течение жизни проекта или пока создаётся бандл для данного пакета.

### Top-Level import {#top-level-import}

Импорт, приходящий из entry point.
Доступные top-level imports определяют публичный API и экспонируются в модулях «@angular/name», таких как `@angular/core` или `@angular/common`.

### Tree-shaking {#tree-shaking}

Процесс идентификации и удаления кода, не используемого приложением — также известный как dead code elimination.
Это глобальная оптимизация, выполняемая на уровне приложения с помощью инструментов вроде [Rollup](https://rollupjs.org), [Closure Compiler](https://developers.google.com/closure/compiler) или [Terser](https://github.com/terser/terser).

### AOT compiler {#aot-compiler}

Ahead of Time компилятор для Angular.

### Flattened type definitions {#flattened-type-definitions}

Объединённые определения TypeScript, сгенерированные с помощью инструментов вроде [API Extractor](https://api-extractor.com) или [rollup-plugin-dts](https://github.com/Swatinem/rollup-plugin-dts).
