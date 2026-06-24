# Schematics для библиотек

При создании библиотеки Angular вы можете предоставить и упаковать ее вместе со Schematics, которые интегрируют ее с
Angular CLI.
С помощью ваших Schematics пользователи могут использовать `ng add` для установки начальной версии вашей библиотеки,
`ng generate` для создания артефактов, определенных в вашей библиотеке, и `ng update` для настройки своего проекта под
новую версию библиотеки, содержащую критические изменения (breaking changes).

Все три типа Schematics могут быть частью коллекции, которую вы упаковываете вместе с библиотекой.

## Создание коллекции Schematics

Чтобы начать создание коллекции, необходимо создать файлы схем.
Следующие шаги показывают, как добавить начальную поддержку без изменения каких-либо файлов проекта.

1. В корневой папке вашей библиотеки создайте папку `schematics`.
1. В папке `schematics/` создайте папку `ng-add` для вашей первой схемы.
1. На корневом уровне папки `schematics` создайте файл `collection.json`.
1. Отредактируйте файл `collection.json`, чтобы определить начальную схему для вашей коллекции.

   <docs-code header="projects/my-lib/schematics/collection.json (Schematics Collection)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/collection.1.json"/>
   - Путь `$schema` указывается относительно схемы коллекции Angular Devkit.
   - Объект `schematics` описывает именованные схемы, входящие в эту коллекцию.
   - Первая запись предназначена для схемы с именем `ng-add`.
     Она содержит описание и указывает на фабричную функцию, которая вызывается при выполнении вашей схемы.

1. В файле `package.json` вашего проекта библиотеки добавьте запись "schematics" с путем к вашему файлу схемы.
   Angular CLI использует эту запись для поиска именованных схем в вашей коллекции при запуске команд.

<docs-code header="projects/my-lib/package.json (Schematics Collection Reference)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/package.json" region="collection"/>

Созданная вами начальная схема сообщает CLI, где найти схему, поддерживающую команду `ng add`.
Теперь вы готовы создать эту схему.

## Обеспечение поддержки установки

Схема для команды `ng add` может улучшить процесс начальной установки для ваших пользователей.
Следующие шаги определяют этот тип схемы.

1. Перейдите в папку `<lib-root>/schematics/ng-add`.
1. Создайте основной файл `index.ts`.
1. Откройте `index.ts` и добавьте исходный код для фабричной функции вашей схемы.

<docs-code header="projects/my-lib/schematics/ng-add/index.ts (ng-add Rule Factory)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/ng-add/index.ts"/>

Angular CLI автоматически установит последнюю версию библиотеки, а этот пример идет еще дальше, добавляя `MyLibModule` в
корень приложения. Функция `addRootImport` принимает колбэк, который должен вернуть блок кода. Вы можете написать любой
код внутри строки, помеченной функцией `code`, а любые внешние символы должны быть обернуты функцией `external`, чтобы
гарантировать генерацию соответствующих импортов.

### Определение типа зависимости

Используйте опцию `save` команды `ng-add`, чтобы настроить, должна ли библиотека быть добавлена в `dependencies`,
`devDependencies` или вообще не сохраняться в конфигурационном файле `package.json` проекта.

<docs-code header="projects/my-lib/package.json (ng-add Reference)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/package.json" region="ng-add"/>

Возможные значения:

| Значения            | Подробности                         |
| :------------------ | :---------------------------------- |
| `false`             | Не добавлять пакет в `package.json` |
| `true`              | Добавить пакет в dependencies       |
| `"dependencies"`    | Добавить пакет в dependencies       |
| `"devDependencies"` | Добавить пакет в devDependencies    |

## Сборка ваших Schematics

Чтобы собрать Schematics вместе с библиотекой, необходимо настроить библиотеку на отдельную сборку Schematics, а затем
добавить их в бандл.
Вы должны собирать Schematics _после_ сборки библиотеки, чтобы они были помещены в правильную директорию.

- Вашей библиотеке требуется пользовательский файл конфигурации TypeScript с инструкциями о том, как скомпилировать ваши
  Schematics в распространяемую библиотеку.
- Чтобы добавить Schematics в бандл библиотеки, добавьте скрипты в файл `package.json` библиотеки.

Предположим, у вас есть проект библиотеки `my-lib` в вашем рабочем пространстве Angular.
Чтобы указать библиотеке, как собирать Schematics, добавьте файл `tsconfig.schematics.json` рядом со сгенерированным
файлом `tsconfig.lib.json`, который настраивает сборку библиотеки.

1. Отредактируйте файл `tsconfig.schematics.json`, добавив следующее содержимое.

   <docs-code header="projects/my-lib/tsconfig.schematics.json (TypeScript Config)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/tsconfig.schematics.json"/>

   | Опции     | Подробности                                                                                                         |
   | :-------- | :------------------------------------------------------------------------------------------------------------------ |
   | `rootDir` | Указывает, что папка `schematics` содержит входные файлы для компиляции.                                            |
   | `outDir`  | Соответствует выходной папке библиотеки. По умолчанию это папка `dist/my-lib` в корне вашего рабочего пространства. |

1. Чтобы убедиться, что исходные файлы ваших Schematics скомпилированы в бандл библиотеки, добавьте следующие скрипты в
   файл `package.json` в корневой папке проекта вашей библиотеки \(`projects/my-lib`\).

   <docs-code header="projects/my-lib/package.json (Build Scripts)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/package.json"/>
   - Скрипт `build` компилирует вашу схему, используя пользовательский файл `tsconfig.schematics.json`.
   - Скрипт `postbuild` копирует файлы схем после завершения скрипта `build`.
   - Оба скрипта, `build` и `postbuild`, требуют зависимостей `copyfiles` и `typescript`.
     Чтобы установить зависимости, перейдите по пути, определенному в `devDependencies`, и запустите `npm install` перед запуском скриптов.

## Обеспечение поддержки генерации

Вы можете добавить именованную схему в свою коллекцию, которая позволит пользователям использовать команду `ng generate`
для создания артефакта, определенного в вашей библиотеке.

Предположим, что ваша библиотека определяет сервис `my-service`, который требует некоторой настройки.
Вы хотите, чтобы ваши пользователи могли генерировать его с помощью следующей команды CLI.

```shell

ng generate my-lib:my-service

```

Для начала создайте новую подпапку `my-service` в папке `schematics`.

### Настройка новой схемы

Когда вы добавляете схему в коллекцию, вы должны указать на нее в схеме коллекции и предоставить конфигурационные файлы
для определения опций, которые пользователь может передать команде.

1. Отредактируйте файл `schematics/collection.json`, чтобы указать на подпапку новой схемы, и включите указатель на файл
   схемы, который определяет входные данные для новой схемы.

<docs-code header="projects/my-lib/schematics/collection.json (Schematics Collection)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/collection.json"/>

1. Перейдите в папку `<lib-root>/schematics/my-service`.
1. Создайте файл `schema.json` и определите доступные опции для схемы.

   <docs-code header="projects/my-lib/schematics/my-service/schema.json (Schematic JSON Schema)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/schema.json"/>
   - _id_: Уникальный ID для схемы в коллекции.
   - _title_: Человекочитаемое описание схемы.
   - _type_: Дескриптор типа, предоставляемого свойствами.
   - _properties_: Объект, определяющий доступные опции для схемы.

   Каждая опция связывает ключ с типом, описанием и необязательным псевдонимом.
   Тип определяет форму ожидаемого значения, а описание отображается, когда пользователь запрашивает справку по
   использованию вашей схемы.

   См. схему рабочего пространства для дополнительных настроек опций схемы.

1. Создайте файл `schema.ts` и определите интерфейс, который хранит значения опций, определенных в файле `schema.json`.

   <docs-code header="projects/my-lib/schematics/my-service/schema.ts (Schematic Interface)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/schema.ts"/>

   | Опции   | Подробности                                                                                                                                     |
   | :------ | :---------------------------------------------------------------------------------------------------------------------------------------------- |
   | name    | Имя, которое вы хотите дать созданному сервису.                                                                                                 |
   | path    | Переопределяет путь, предоставленный схеме. Значение пути по умолчанию основано на текущем рабочем каталоге.                                    |
   | project | Указывает конкретный проект для запуска схемы. В схеме вы можете предоставить значение по умолчанию, если опция не предоставлена пользователем. |

### Добавление файлов шаблонов

Чтобы добавить артефакты в проект, вашей схеме нужны собственные файлы шаблонов.
Шаблоны Schematics поддерживают специальный синтаксис для выполнения кода и подстановки переменных.

1. Создайте папку `files/` внутри папки `schematics/my-service/`.
1. Создайте файл с именем `__name@dasherize__.service.ts.template`, который определяет шаблон для генерации файлов.
   Этот шаблон сгенерирует сервис, в который уже внедрен `HttpClient` Angular в свойство `http`.

   <docs-code lang="typescript" header="projects/my-lib/schematics/my-service/files/__name@dasherize__.service.ts.template (Schematic Template)">

   import { Injectable } from '@angular/core';
   import { HttpClient } from '@angular/common/http';

   @Injectable({
   providedIn: 'root'
   })
   export class <%= classify(name) %>Service {
   private http = inject(HttpClient);
   }

   </docs-code>
   - Методы `classify` и `dasherize` — это утилитарные функции, которые ваша схема использует для преобразования исходного шаблона и имени файла.
   - `name` предоставляется как свойство из вашей фабричной функции.
     Это то же самое `name`, которое вы определили в схеме.

### Добавление фабричной функции

Теперь, когда инфраструктура готова, вы можете определить основную функцию, которая выполняет необходимые модификации в
проекте пользователя.

Фреймворк Schematics предоставляет систему шаблонизации файлов, которая поддерживает шаблоны как путей, так и
содержимого.
Система работает с заполнителями, определенными внутри файлов или путей, загруженных во входное `Tree`.
Она заполняет их, используя значения, переданные в `Rule`.

Подробности об этих структурах данных и синтаксисе см.
в [README Schematics](https://github.com/angular/angular-cli/blob/main/packages/angular_devkit/schematics/README.md).

1. Создайте основной файл `index.ts` и добавьте исходный код для фабричной функции вашей схемы.
1. Сначала импортируйте определения Schematics, которые вам понадобятся.
   Фреймворк Schematics предлагает множество утилитарных функций для создания и использования правил при запуске схемы.

<docs-code header="projects/my-lib/schematics/my-service/index.ts (Imports)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="schematics-imports"/>

1. Импортируйте определенный интерфейс схемы, который предоставляет информацию о типах для опций вашей схемы.

<docs-code header="projects/my-lib/schematics/my-service/index.ts (Schema Import)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="schema-imports"/>

1. Чтобы создать схему генерации, начните с пустой фабрики правил.

<docs-code header="projects/my-lib/schematics/my-service/index.ts (Initial Rule)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.1.ts" region="factory"/>

Эта фабрика правил возвращает дерево без изменений.
`options` — это значения опций, переданные через команду `ng generate`.

## Определение правила генерации

Теперь у вас есть основа для создания кода, который фактически изменяет приложение пользователя, настраивая его для
сервиса, определенного в вашей библиотеке.

Рабочее пространство Angular, где пользователь установил вашу библиотеку, содержит несколько проектов (приложения и
библиотеки).
Пользователь может указать проект в командной строке или оставить значение по умолчанию.
В любом случае вашему коду необходимо идентифицировать конкретный проект, к которому применяется эта схема, чтобы вы
могли получить информацию из конфигурации проекта.

Сделайте это, используя объект `Tree`, который передается в фабричную функцию.
Методы `Tree` дают вам доступ к полному дереву файлов в вашем рабочем пространстве, позволяя читать и записывать файлы
во время выполнения схемы.

### Получение конфигурации проекта

1. Чтобы определить целевой проект, используйте метод `workspaces.readWorkspace` для чтения содержимого
   конфигурационного файла рабочего пространства `angular.json`.
   Для использования `workspaces.readWorkspace` вам необходимо создать `workspaces.WorkspaceHost` из `Tree`.
   Добавьте следующий код в вашу фабричную функцию.

   <docs-code header="projects/my-lib/schematics/my-service/index.ts (Schema Import)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="workspace"/>

   Убедитесь, что контекст существует, и выбросьте соответствующую ошибку.

1. Теперь, когда у вас есть имя проекта, используйте его для получения информации о конфигурации конкретного проекта.

   <docs-code header="projects/my-lib/schematics/my-service/index.ts (Project)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="project-info"/>

   Объект `workspace.projects` содержит всю информацию о конфигурации конкретного проекта.

1. `options.path` определяет, куда будут перемещены файлы шаблонов схемы после применения схемы.

   Опция `path` в схеме Schematics по умолчанию заменяется текущим рабочим каталогом.
   Если `path` не определен, используйте `sourceRoot` из конфигурации проекта вместе с `projectType`.

   <docs-code header="projects/my-lib/schematics/my-service/index.ts (Project Info)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="path"/>

### Определение правила

`Rule` может использовать внешние файлы шаблонов, преобразовывать их и возвращать другой объект `Rule` с преобразованным
шаблоном.
Используйте шаблонизацию для генерации любых пользовательских файлов, необходимых для вашей схемы.

1. Добавьте следующий код в вашу фабричную функцию.

   <docs-code header="projects/my-lib/schematics/my-service/index.ts (Template transform)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="template"/>

   | Методы             | Подробности                                                                                                                                                                                                                   |
   | :----------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | `apply()`          | Применяет несколько правил к источнику и возвращает преобразованный источник. Принимает 2 аргумента: источник и массив правил.                                                                                                |
   | `url()`            | Читает исходные файлы из вашей файловой системы относительно схемы.                                                                                                                                                           |
   | `applyTemplates()` | Принимает аргумент с методами и свойствами, которые вы хотите сделать доступными для шаблона схемы и имен файлов схемы. Возвращает `Rule`. Здесь вы определяете методы `classify()` и `dasherize()`, а также свойство `name`. |
   | `classify()`       | Принимает значение и возвращает его в формате TitleCase. Например, если предоставленное имя — `my service`, оно возвращается как `MyService`.                                                                                 |
   | `dasherize()`      | Принимает значение и возвращает его разделенным дефисами и в нижнем регистре. Например, если предоставленное имя — MyService, оно возвращается как `my-service`.                                                              |
   | `move()`           | Перемещает предоставленные исходные файлы в их место назначения при применении схемы.                                                                                                                                         |

1. Наконец, фабрика правил должна вернуть правило.

   <docs-code header="projects/my-lib/schematics/my-service/index.ts (Chain Rule)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="chain"/>

   Метод `chain()` позволяет объединить несколько правил в одно, чтобы вы могли выполнять несколько операций в одной
   схеме.
   Здесь вы только объединяете правила шаблона с любым кодом, выполняемым схемой.

См. полный пример следующей функции правила схемы.

<docs-code header="projects/my-lib/schematics/my-service/index.ts" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts"/>

Для получения дополнительной информации о правилах и утилитарных методах
см. [Provided Rules](https://github.com/angular/angular-cli/tree/main/packages/angular_devkit/schematics#provided-rules).

## Запуск схемы вашей библиотеки

После сборки библиотеки и Schematics вы можете установить коллекцию Schematics для запуска в вашем проекте.
Следующие шаги показывают, как сгенерировать сервис, используя созданную ранее схему.

### Сборка библиотеки и Schematics

Из корня вашего рабочего пространства запустите команду `ng build` для вашей библиотеки.

```shell

ng build my-lib

```

Затем перейдите в директорию вашей библиотеки, чтобы собрать схему.

```shell

cd projects/my-lib
npm run build

```

### Линковка библиотеки

Ваша библиотека и Schematics упаковываются и помещаются в папку `dist/my-lib` в корне вашего рабочего пространства.
Для запуска схемы вам необходимо прилинковать библиотеку в вашу папку `node_modules`.
Из корня вашего рабочего пространства запустите команду `npm link` с путем к вашей распространяемой библиотеке.

```shell

npm link dist/my-lib

```

### Запуск схемы

Теперь, когда ваша библиотека установлена, запустите схему с помощью команды `ng generate`.

```shell

ng generate my-lib:my-service --name my-data

```

В консоли вы увидите, что схема была запущена, и файл `my-data.service.ts` был создан в папке вашего приложения.

<docs-code language="shell" hideCopy>

CREATE src/app/my-data.service.ts (208 bytes)

</docs-code>
