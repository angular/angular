# Angular Language Service {#angular-language-service}

Angular Language Service предоставляет редакторам кода возможность получать автодополнения, ошибки, подсказки и навигацию внутри шаблонов Angular.
Он работает с внешними шаблонами в отдельных HTML-файлах, а также со встроенными шаблонами.

## Настройка параметров компилятора для Angular Language Service {#configuring-compiler-options-for-the-angular-language-service}

Для включения новейших функций Language Service установите параметр `strictTemplates` в `tsconfig.json`, задав `strictTemplates` в `true`, как показано в следующем примере:

```json

"angularCompilerOptions": {
  "strictTemplates": true
}

```

Подробнее см. в руководстве по [параметрам компилятора Angular](reference/configs/angular-compiler-options).

## Возможности {#features}

Редактор автоматически определяет, что открывается Angular-файл.
Затем он использует Angular Language Service для чтения файла `tsconfig.json`, поиска всех шаблонов приложения и предоставления языковых сервисов для любого открытого шаблона.

Языковые сервисы включают:

- Списки автодополнений
- Диагностические сообщения AOT
- Быстрая информация
- Переход к определению

### Автодополнение {#autocompletion}

Автодополнение может ускорить разработку, предоставляя контекстные варианты и подсказки по мере ввода.
Этот пример показывает автодополнение в интерполяции.
При вводе можно нажать tab для завершения.

<img alt="autocompletion" src="assets/images/guide/language-service/language-completion.gif">

Автодополнение также работает внутри элементов.
Любые элементы, которые являются селектором компонента, будут отображаться в списке автодополнения.

### Проверка ошибок {#error-checking}

Angular Language Service может предупреждать об ошибках в коде.
В этом примере Angular не знает, что такое `orders` и откуда это берётся.

<img alt="error checking" src="assets/images/guide/language-service/language-error.gif">

### Быстрая информация и навигация {#quick-info-and-navigation}

Функция быстрой информации позволяет наводить курсор для просмотра того, откуда берутся компоненты, директивы и модули.
Затем можно нажать «Go to definition» или клавишу F12 для перехода непосредственно к определению.

<img alt="navigation" src="assets/images/guide/language-service/language-navigation.gif">

## Angular Language Service в редакторе {#angular-language-service-in-your-editor}

Angular Language Service в настоящее время доступен как расширение для [Visual Studio Code](https://code.visualstudio.com), [WebStorm](https://www.jetbrains.com/webstorm), [Sublime Text](https://www.sublimetext.com), [Zed](https://zed.dev), [Neovim](https://neovim.io) и [Eclipse IDE](https://www.eclipse.org/eclipseide).

### Visual Studio Code {#visual-studio-code}

В [Visual Studio Code](https://code.visualstudio.com) установите расширение из [Marketplace расширений](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template).
Откройте Marketplace из редактора с помощью значка расширений на левой панели меню или используйте VS Quick Open \(⌘+P на Mac, CTRL+P в Windows\) и введите "? ext".
В Marketplace найдите расширение Angular Language Service и нажмите кнопку **Install**.

Интеграция Visual Studio Code с Angular language service поддерживается и распространяется командой Angular.

### Visual Studio {#visual-studio}

В [Visual Studio](https://visualstudio.microsoft.com) установите расширение из [Marketplace расширений](https://marketplace.visualstudio.com/items?itemName=TypeScriptTeam.AngularLanguageService).
Откройте Marketplace из редактора, выбрав Extensions в верхней панели меню, затем Manage Extensions.
В Marketplace найдите расширение Angular Language Service и нажмите кнопку **Install**.

Интеграция Visual Studio с Angular language service поддерживается и распространяется Microsoft при участии команды Angular.
Посмотрите проект [здесь](https://github.com/microsoft/vs-ng-language-service).

### WebStorm {#webstorm}

В [WebStorm](https://www.jetbrains.com/webstorm) включите плагин [Angular and AngularJS](https://plugins.jetbrains.com/plugin/6971-angular-and-angularjs).

Начиная с WebStorm 2019.1, `@angular/language-service` больше не требуется и должен быть удалён из `package.json`.

### Sublime Text {#sublime-text}

В [Sublime Text](https://www.sublimetext.com) Language Service поддерживает только встроенные шаблоны при установке в качестве плагина.
Для автодополнения в HTML-файлах необходим пользовательский плагин Sublime \(или модификации существующего плагина\).

Для использования Language Service во встроенных шаблонах сначала необходимо добавить расширение для поддержки TypeScript, а затем установить плагин Angular Language Service.
Начиная с TypeScript 2.3, TypeScript имеет модель плагинов, которую может использовать language service.

1. Установите последнюю версию TypeScript в локальную директорию `node_modules`:

   ```shell
   npm install --save-dev typescript
   ```

1. Установите пакет Angular Language Service в то же место:

   ```shell

   npm install --save-dev @angular/language-service

   ```

1. После установки пакета добавьте следующее в раздел `"compilerOptions"` файла `tsconfig.json` проекта.

   ```json {header:"tsconfig.json"}
   "plugins": [
     {"name": "@angular/language-service"}
   ]
   ```

1. В пользовательских настройках редактора \(`Cmd+,` или `Ctrl+,`\) добавьте следующее:

   ```json {header:"Sublime Text user preferences"}

   "typescript-tsdk": "<path to your folder>/node_modules/typescript/lib"

   ```

Это позволяет Angular Language Service предоставлять диагностику и автодополнение в файлах `.ts`.

### Eclipse IDE {#eclipse-ide}

Можно напрямую установить пакет «Eclipse IDE for Web and JavaScript developers», который уже включает Angular Language Server, или в других пакетах Eclipse IDE использовать Help > Eclipse Marketplace для поиска и установки [Eclipse Wild Web Developer](https://marketplace.eclipse.org/content/wild-web-developer-html-css-javascript-typescript-nodejs-angular-json-yaml-kubernetes-xml).

### Neovim {#neovim}

#### Conquer of Completion с Node.js {#conquer-of-completion-with-nodejs}

Angular Language Service использует tsserver, который не полностью соответствует спецификациям LSP. Поэтому при использовании neovim или vim с JavaScript, TypeScript или Angular можно обнаружить, что [Conquer of Completion](https://github.com/neoclide/coc.nvim) (COC) имеет наиболее полную реализацию Angular Language Service и tsserver. Это объясняется тем, что COC портирует реализацию tsserver из VSCode, которая учитывает особенности реализации tsserver.

1. [Настройте coc.nvim](https://github.com/neoclide/coc.nvim)

2. Настройте Angular Language Service

   После установки запустите vim-команду `CocConfig` для открытия файла конфигурации `coc-settings.json` и добавьте свойство angular.

   Обязательно замените правильные пути к глобальным `node_modules`, указывающие на директории с `tsserver` и `ngserver` соответственно.

   ```json {header:"CocConfig example file coc-settings.json"}
   {
     "languageserver": {
       "angular": {
         "command": "ngserver",
         "args": [
           "--stdio",
           "--tsProbeLocations",
           "/usr/local/lib/node_modules/typescript/lib/CHANGE/THIS/TO/YOUR/GLOBAL/NODE_MODULES",
           "--ngProbeLocations",
           "/usr/local/lib/node_modules/@angular/language-server/bin/CHANGE/THIS/TO/YOUR/GLOBAL/NODE_MODULES"
         ],
         "filetypes": ["ts", "typescript", "html"],
         "trace.server.verbosity": "verbose"
       }
     }
   }
   ```

HELPFUL: Пути `/usr/local/lib/node_modules/typescript/lib` и `/usr/local/lib/node_modules/@angular/language-server/bin` выше должны указывать на расположение глобальных node_modules, которое может быть другим.

#### Встроенный LSP Neovim {#built-in-neovim-lsp}

Angular Language Service можно использовать с Neovim с помощью плагина [nvim-lspconfig](https://github.com/neovim/nvim-lspconfig).

1. [Установите nvim-lspconfig](https://github.com/neovim/nvim-lspconfig?tab=readme-ov-file#install)

2. [Настройте angularls для nvim-lspconfig](https://github.com/neovim/nvim-lspconfig/blob/master/doc/configs.md#angularls)

### Zed {#zed}

В [Zed](https://zed.dev) установите расширение из [Marketplace расширений](https://zed.dev/extensions/angular).

## Как работает Language Service {#how-the-language-service-works}

При использовании редактора с language service редактор запускает отдельный процесс language service и взаимодействует с ним через [RPC](https://ru.wikipedia.org/wiki/%D0%A3%D0%B4%D0%B0%D0%BB%D1%91%D0%BD%D0%BD%D1%8B%D0%B9_%D0%B2%D1%8B%D0%B7%D0%BE%D0%B2_%D0%BF%D1%80%D0%BE%D1%86%D0%B5%D0%B4%D1%83%D1%80), используя [Language Server Protocol](https://microsoft.github.io/language-server-protocol).
При вводе текста в редакторе редактор отправляет информацию в процесс language service для отслеживания состояния проекта.

При вызове списка автодополнения в шаблоне редактор сначала разбирает шаблон в HTML [абстрактное синтаксическое дерево (AST)](https://ru.wikipedia.org/wiki/%D0%90%D0%B1%D1%81%D1%82%D1%80%D0%B0%D0%BA%D1%82%D0%BD%D0%BE%D0%B5_%D1%81%D0%B8%D0%BD%D1%82%D0%B0%D0%BA%D1%81%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%BE%D0%B5_%D0%B4%D0%B5%D1%80%D0%B5%D0%B2%D0%BE).
Компилятор Angular интерпретирует это дерево для определения контекста: к какому модулю относится шаблон, текущая область видимости, селектор компонента и позиция курсора в AST шаблона.
Затем можно определить символы, которые потенциально могут находиться на этой позиции.

При интерполяции всё несколько сложнее.
Если внутри `div` есть интерполяция `{{data.---}}` и нужен список автодополнения после `data.---`, компилятор не может использовать HTML AST для получения ответа.
HTML AST может сообщить компилятору только о наличии некоего текста с символами "`{{data.---}}`".
Тогда парсер шаблона создаёт AST выражения, находящееся внутри AST шаблона.
Angular Language Services затем смотрит на `data.---` в его контексте, запрашивает TypeScript Language Service о членах `data` и возвращает список возможных вариантов.

## Дополнительная информация {#more-information}

- Более подробная информация о реализации — в [исходном коде Angular Language Service](https://github.com/angular/angular/blob/main/packages/language-service/src)
- Более подробная информация о соображениях при проектировании и намерениях — в [документации по проектированию](https://github.com/angular/vscode-ng-language-service/wiki/Design)
