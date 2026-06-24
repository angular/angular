# Angular Language Service

Angular Language Service предоставляет редакторам кода возможность получать автодополнение, сообщения об ошибках,
подсказки и навигацию внутри шаблонов Angular.
Он работает как с внешними шаблонами в отдельных HTML-файлах, так и со встроенными (in-line) шаблонами.

## Настройка опций компилятора для Angular Language Service

Чтобы включить новейшие функции языкового сервиса, установите опцию `strictTemplates` в файле `tsconfig.json` в значение
`true`, как показано в следующем примере:

```json

"angularCompilerOptions": {
  "strictTemplates": true
}

```

Для получения дополнительной информации см. руководство
по [опциям компилятора Angular](reference/configs/angular-compiler-options).

## Возможности

Ваш редактор автоматически определяет, что вы открываете файл Angular.
Затем он использует Angular Language Service для чтения файла `tsconfig.json`, находит все шаблоны в вашем приложении и
предоставляет языковые сервисы для любого открытого вами шаблона.

Возможности языкового сервиса включают:

- Списки автодополнения
- Сообщения AOT-диагностики
- Быстрая справка (Quick info)
- Переход к определению (Go to definition)

### Автодополнение

Автодополнение может ускорить процесс разработки, предоставляя контекстные варианты и подсказки по мере ввода текста.
В этом примере показано автодополнение внутри интерполяции.
По мере ввода вы можете нажать клавишу Tab для завершения.

<img alt="автодополнение" src="assets/images/guide/language-service/language-completion.gif">

Также существует автодополнение внутри элементов.
Любые элементы, которые вы используете как селекторы компонентов, будут отображаться в списке автодополнения.

### Проверка ошибок

Angular Language Service может предупреждать вас об ошибках в коде.
В этом примере Angular не знает, что такое `orders` и откуда оно берется.

<img alt="проверка ошибок" src="assets/images/guide/language-service/language-error.gif">

### Быстрая справка и навигация

Функция быстрой справки позволяет навести курсор на элементы, чтобы увидеть, откуда берутся компоненты, директивы и
модули.
Затем вы можете нажать «Go to definition» (Перейти к определению) или клавишу F12, чтобы перейти непосредственно к
определению.

<img alt="навигация" src="assets/images/guide/language-service/language-navigation.gif">

## Angular Language Service в вашем редакторе

Angular Language Service в настоящее время доступен как расширение
для [Visual Studio Code](https://code.visualstudio.com), [WebStorm](https://www.jetbrains.com/webstorm), [Sublime Text](https://www.sublimetext.com), [Zed](https://zed.dev), [Neovim](https://neovim.io)
и [Eclipse IDE](https://www.eclipse.org/eclipseide).

### Visual Studio Code

В [Visual Studio Code](https://code.visualstudio.com) установите расширение
из [Extensions: Marketplace](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template).
Откройте маркетплейс из редактора, используя значок Extensions (Расширения) в левом меню, или используйте VS Quick
Open (⌘+P на Mac, CTRL+P на Windows) и введите «? ext».
В маркетплейсе найдите расширение Angular Language Service и нажмите кнопку **Install** (Установить).

Интеграция Visual Studio Code с Angular Language Service поддерживается и распространяется командой Angular.

### Visual Studio

В [Visual Studio](https://visualstudio.microsoft.com) установите расширение
из [Extensions: Marketplace](https://marketplace.visualstudio.com/items?itemName=TypeScriptTeam.AngularLanguageService).
Откройте маркетплейс из редактора, выбрав Extensions (Расширения) в верхнем меню, а затем выбрав Manage Extensions (
Управление расширениями).
В маркетплейсе найдите расширение Angular Language Service и нажмите кнопку **Install** (Установить).

Интеграция Visual Studio с Angular Language Service поддерживается и распространяется компанией Microsoft при помощи
команды Angular.
Ознакомиться с проектом можно [здесь](https://github.com/microsoft/vs-ng-language-service).

### WebStorm

В [WebStorm](https://www.jetbrains.com/webstorm) включите
плагин [Angular and AngularJS](https://plugins.jetbrains.com/plugin/6971-angular-and-angularjs).

Начиная с WebStorm 2019.1, пакет `@angular/language-service` больше не требуется, и его следует удалить из вашего
`package.json`.

### Sublime Text

В [Sublime Text](https://www.sublimetext.com) при установке в виде плагина Language Service поддерживает только
встроенные (in-line) шаблоны.
Вам понадобится специальный плагин для Sublime (или модификации текущего плагина) для автодополнения в HTML-файлах.

Чтобы использовать Language Service для встроенных шаблонов, сначала необходимо добавить расширение для поддержки
TypeScript, а затем установить плагин Angular Language Service.
Начиная с TypeScript 2.3, TypeScript имеет модель плагинов, которую может использовать языковой сервис.

1. Установите последнюю версию TypeScript в локальную директорию `node_modules`:

```shell

npm install --save-dev typescript

```

1. Установите пакет Angular Language Service в то же место:

```shell

npm install --save-dev @angular/language-service

```

1. После установки пакета добавьте следующее в секцию `"compilerOptions"` файла `tsconfig.json` вашего проекта:

   ```json {header:"tsconfig.json"}
   "plugins": [
     {"name": "@angular/language-service"}
   ]
   ```

2. В пользовательских настройках редактора (`Cmd+,` или `Ctrl+,`) добавьте следующее:

   ```json {header:"Sublime Text user preferences"}

   "typescript-tsdk": "<путь к вашей папке>/node_modules/typescript/lib"

   ```

Это позволит Angular Language Service предоставлять диагностику и автодополнение в файлах `.ts`.

### Eclipse IDE

Либо установите пакет «Eclipse IDE for Web and JavaScript developers», в который уже включен Angular Language Server,
либо из других пакетов Eclipse IDE используйте Help > Eclipse Marketplace, чтобы найти и
установить [Eclipse Wild Web Developer](https://marketplace.eclipse.org/content/wild-web-developer-html-css-javascript-typescript-nodejs-angular-json-yaml-kubernetes-xml).

### Neovim

#### Conquer of Completion с Node.js

Angular Language Service использует tsserver, который не совсем точно следует спецификациям LSP. Поэтому, если вы
используете neovim или vim с JavaScript, TypeScript или Angular, вы можете обнаружить,
что [Conquer of Completion](https://github.com/neoclide/coc.nvim) (COC) имеет наиболее полную реализацию Angular
Language Service и tsserver. Это связано с тем, что COC портирует реализацию tsserver из VSCode, которая учитывает
особенности реализации tsserver.

1. [Настройте coc.nvim](https://github.com/neoclide/coc.nvim)

2. Настройте Angular Language Service

   После установки запустите команду `CocConfig` в командной строке vim, чтобы открыть файл конфигурации
   `coc-settings.json`, и добавьте свойство angular.

   Убедитесь, что вы подставили правильные пути к вашим глобальным `node_modules`, чтобы они вели к директориям,
   содержащим `tsserver` и `ngserver` соответственно.

   ```json {header:"Пример файла CocConfig coc-settings.json"}
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

ПОЛЕЗНО: `/usr/local/lib/node_modules/typescript/lib` и `/usr/local/lib/node_modules/@angular/language-server/bin` выше
должны указывать на расположение ваших глобальных модулей node, которое может отличаться.

#### Встроенный LSP в Neovim

Angular Language Service можно использовать с Neovim с помощью
плагина [nvim-lspconfig](https://github.com/neovim/nvim-lspconfig).

1. [Установите nvim-lspconfig](https://github.com/neovim/nvim-lspconfig?tab=readme-ov-file#install)

2. [Настройте angularls для nvim-lspconfig](https://github.com/neovim/nvim-lspconfig/blob/master/doc/configs.md#angularls)

### Zed

В [Zed](https://zed.dev) установите расширение из [Extensions: Marketplace](https://zed.dev/extensions/angular).

## Как работает Language Service

Когда вы используете редактор с языковым сервисом, редактор запускает отдельный процесс языкового сервиса и общается с
ним через [RPC](https://ru.wikipedia.org/wiki/Удалённый_вызов_процедур),
используя [Language Server Protocol](https://microsoft.github.io/language-server-protocol).
Когда вы вводите текст в редакторе, редактор отправляет информацию процессу языкового сервиса для отслеживания состояния
вашего проекта.

Когда вы вызываете список автодополнения внутри шаблона, редактор сначала парсит шаблон в
HTML [абстрактное синтаксическое дерево (AST)](https://ru.wikipedia.org/wiki/Абстрактное_синтаксическое_дерево).
Компилятор Angular интерпретирует это дерево, чтобы определить контекст: частью какого модуля является шаблон, текущую
область видимости, селектор компонента и где находится курсор в AST шаблона.
Затем он может определить символы, которые потенциально могут находиться в этой позиции.

Все немного сложнее, если вы находитесь внутри интерполяции.
Если у вас есть интерполяция `{{data.---}}` внутри `div` и вам нужен список автодополнения после `data.---`, компилятор
не может использовать HTML AST для поиска ответа.
HTML AST может только сказать компилятору, что есть текст с символами "`{{data.---}}`".
Именно тогда парсер шаблонов создает AST выражения, которое находится внутри AST шаблона.
Затем Angular Language Service смотрит на `data.---` в его контексте, запрашивает у TypeScript Language Service, какие
члены есть у `data`, и возвращает список возможностей.

## Дополнительная информация

- Для получения более подробной информации о реализации
  см. [исходный код Angular Language Service](https://github.com/angular/angular/blob/main/packages/language-service/src)
- О проектных решениях и намерениях
  см. [документацию по дизайну здесь](https://github.com/angular/vscode-ng-language-service/wiki/Design)
