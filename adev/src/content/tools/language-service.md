# Angular Language Service

Angular Language Service предоставляет редакторам кода возможность получать автодополнения, ошибки, подсказки и навигацию внутри Angular-шаблонов.
Он работает как с внешними шаблонами в отдельных HTML-файлах, так и с встроенными шаблонами.

## Настройка параметров компилятора для Angular Language Service {#configuring-compiler-options-for-the-angular-language-service}

Чтобы включить последние функции Language Service, задайте параметр `strictTemplates` в `tsconfig.json`, установив `strictTemplates` в `true`, как показано в следующем примере:

```json

"angularCompilerOptions": {
  "strictTemplates": true
}

```

Дополнительную информацию см. в руководстве [Параметры Angular-компилятора](reference/configs/angular-compiler-options).

## Возможности {#features}

Ваш редактор автоматически определяет, что вы открываете Angular-файл.
Затем он использует Angular Language Service для чтения файла `tsconfig.json`, поиска всех шаблонов в вашем приложении и предоставления языковых сервисов для любых открытых шаблонов.

Языковые сервисы включают:

- Списки автодополнений
- Диагностические сообщения AOT
- Быстрая информация
- Переход к определению

### Автодополнение {#autocompletion}

Автодополнение ускоряет разработку, предоставляя контекстные варианты и подсказки по мере набора текста.
В этом примере показано автодополнение в интерполяции.
При наборе текста можно нажать Tab для завершения.

<img alt="autocompletion" src="assets/images/guide/language-service/language-completion.gif">

Автодополнение также работает внутри элементов.
Любые элементы, имеющиеся в качестве селектора компонента, будут отображаться в списке автодополнений.

### Проверка ошибок {#error-checking}

Angular Language Service может предупреждать вас об ошибках в коде.
В этом примере Angular не знает, что такое `orders` и откуда оно берётся.

<img alt="error checking" src="assets/images/guide/language-service/language-error.gif">

### Быстрая информация и навигация {#quick-info-and-navigation}

Функция быстрой информации позволяет навести курсор и увидеть, откуда берутся компоненты, директивы и модули.
Затем можно нажать "Go to definition" или клавишу F12, чтобы перейти непосредственно к определению.

<img alt="navigation" src="assets/images/guide/language-service/language-navigation.gif">

## Angular Language Service в редакторе {#angular-language-service-in-your-editor}

Angular Language Service в настоящее время доступен как расширение для [Visual Studio Code](https://code.visualstudio.com), [WebStorm](https://www.jetbrains.com/webstorm), [Sublime Text](https://www.sublimetext.com), [Zed](https://zed.dev), [Neovim](https://neovim.io) и [Eclipse IDE](https://www.eclipse.org/eclipseide).

### Visual Studio Code {#visual-studio-code}

В [Visual Studio Code](https://code.visualstudio.com) установите расширение из [Extensions: Marketplace](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template).
Откройте маркетплейс из редактора, используя иконку Extensions на левой панели меню, или воспользуйтесь VS Quick Open (⌘+P на Mac, CTRL+P на Windows) и введите "? ext".
В маркетплейсе найдите расширение Angular Language Service и нажмите кнопку **Install**.

Интеграция Visual Studio Code с Angular Language Service поддерживается и распространяется командой Angular.

### Visual Studio {#visual-studio}

В [Visual Studio](https://visualstudio.microsoft.com) установите расширение из [Extensions: Marketplace](https://marketplace.visualstudio.com/items?itemName=TypeScriptTeam.AngularLanguageService).
Откройте маркетплейс из редактора, выбрав Extensions в верхнем меню, затем Manage Extensions.
В маркетплейсе найдите расширение Angular Language Service и нажмите кнопку **Install**.

Интеграция Visual Studio с Angular Language Service поддерживается и распространяется Microsoft при помощи команды Angular.
Ознакомьтесь с проектом [здесь](https://github.com/microsoft/vs-ng-language-service).

### WebStorm {#webstorm}

В [WebStorm](https://www.jetbrains.com/webstorm) включите плагин [Angular and AngularJS](https://plugins.jetbrains.com/plugin/6971-angular-and-angularjs).

Начиная с WebStorm 2019.1, `@angular/language-service` больше не требуется и должен быть удалён из `package.json`.

### Sublime Text {#sublime-text}

В [Sublime Text](https://www.sublimetext.com) Language Service поддерживает только встроенные шаблоны при установке в качестве плагина.
Для автодополнения в HTML-файлах требуется пользовательский плагин Sublime (или модификации текущего плагина).

Для использования Language Service со встроенными шаблонами необходимо сначала добавить расширение для TypeScript, затем установить плагин Angular Language Service.
Начиная с TypeScript 2.3, TypeScript имеет модель плагинов, которую может использовать языковой сервис.

1. Установите последнюю версию TypeScript в локальной директории `node_modules`:

   ```shell
   npm install --save-dev typescript
   ```

1. Установите пакет Angular Language Service в том же месте:

   ```shell

   npm install --save-dev @angular/language-service

   ```

1. После установки пакета добавьте следующее в раздел `"compilerOptions"` файла `tsconfig.json` проекта.

   ```json {header:"tsconfig.json"}
   "plugins": [
     {"name": "@angular/language-service"}
   ]
   ```

1. В пользовательских настройках редактора (`Cmd+,` или `Ctrl+,`) добавьте следующее:

   ```json {header:"Sublime Text user preferences"}

   "typescript-tsdk": "<path to your folder>/node_modules/typescript/lib"

   ```

Это позволяет Angular Language Service предоставлять диагностику и автодополнение в файлах `.ts`.

### Eclipse IDE {#eclipse-ide}

Либо установите напрямую пакет "Eclipse IDE for Web and JavaScript developers", который включает Angular Language Server, либо в других пакетах Eclipse IDE используйте Help > Eclipse Marketplace для поиска и установки [Eclipse Wild Web Developer](https://marketplace.eclipse.org/content/wild-web-developer-html-css-javascript-typescript-nodejs-angular-json-yaml-kubernetes-xml).

### Neovim {#neovim}

#### Conquer of Completion с Node.js {#conquer-of-completion-with-nodejs}

Angular Language Service использует tsserver, который не строго следует спецификациям LSP. Поэтому если вы используете neovim или vim с JavaScript, TypeScript или Angular, вы можете обнаружить, что [Conquer of Completion](https://github.com/neoclide/coc.nvim) (COC) имеет наиболее полную реализацию Angular Language Service и tsserver. Это потому, что COC портирует реализацию VSCode tsserver, которая учитывает особенности реализации tsserver.

1. [Настройте coc.nvim](https://github.com/neoclide/coc.nvim)

2. Настройте Angular Language Service

   После установки выполните vim-команду `CocConfig` для открытия файла конфигурации `coc-settings.json` и добавьте свойство angular.

   Обязательно подставьте правильные пути к вашим глобальным `node_modules`, чтобы они указывали на директории, содержащие `tsserver` и `ngserver` соответственно.

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

HELPFUL: `/usr/local/lib/node_modules/typescript/lib` и `/usr/local/lib/node_modules/@angular/language-server/bin` выше должны указывать на расположение ваших глобальных node modules, которое может отличаться.

#### Встроенный LSP Neovim {#built-in-neovim-lsp}

Angular Language Service можно использовать с Neovim с помощью плагина [nvim-lspconfig](https://github.com/neovim/nvim-lspconfig).

1. [Установите nvim-lspconfig](https://github.com/neovim/nvim-lspconfig?tab=readme-ov-file#install)

2. [Настройте angularls для nvim-lspconfig](https://github.com/neovim/nvim-lspconfig/blob/master/doc/configs.md#angularls)

### Zed {#zed}

В [Zed](https://zed.dev) установите расширение из [Extensions: Marketplace](https://zed.dev/extensions/angular).

## Как работает Language Service {#how-the-language-service-works}

При использовании редактора с языковым сервисом редактор запускает отдельный процесс языкового сервиса и взаимодействует с ним через [RPC](https://en.wikipedia.org/wiki/Remote_procedure_call), используя [Language Server Protocol](https://microsoft.github.io/language-server-protocol).
При наборе текста редактор отправляет информацию процессу языкового сервиса для отслеживания состояния проекта.

При запросе списка автодополнений в шаблоне редактор сначала разбирает шаблон в HTML [абстрактное синтаксическое дерево (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree).
Angular-компилятор интерпретирует это дерево для определения контекста: какому модулю принадлежит шаблон, текущей области видимости, селектора компонента и где находится курсор в AST шаблона.
Затем можно определить символы, которые потенциально могут быть на этой позиции.

Если вы находитесь в интерполяции, процесс несколько сложнее.
Если у вас есть интерполяция `{{data.---}}` внутри `div` и нужен список автодополнений после `data.---`, компилятор не может использовать HTML AST для получения ответа.
HTML AST может только сообщить компилятору, что есть некий текст с символами `{{data.---}}`.
Тогда парсер шаблонов создаёт AST выражения, находящийся внутри AST шаблона.
Angular Language Services затем рассматривает `data.---` в контексте, запрашивает у TypeScript Language Service, какие члены есть у `data`, и возвращает список возможных вариантов.

## Дополнительная информация {#more-information}

- Для получения более подробной информации о реализации см. [исходный код Angular Language Service](https://github.com/angular/angular/blob/main/packages/language-service/src)
- Для получения информации о дизайне и намерениях см. [документацию по дизайну](https://github.com/angular/vscode-ng-language-service/wiki/Design)
