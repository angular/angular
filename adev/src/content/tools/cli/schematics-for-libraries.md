# Схематики для библиотек

При создании Angular-библиотеки вы можете предоставить и упаковать её со схематиками, которые интегрируют её с Angular CLI.
С вашими схематиками пользователи смогут использовать `ng add` для установки начальной версии вашей библиотеки,
`ng generate` для создания артефактов, определённых в вашей библиотеке, и `ng update` для адаптации своего проекта к новой версии библиотеки, вводящей критические изменения.

Все три типа схематиков могут быть частью коллекции, которую вы упаковываете вместе с библиотекой.

## Создание коллекции схематиков {#creating-a-schematics-collection}

Для начала работы с коллекцией необходимо создать файлы схематика.
Следующие шаги показывают, как добавить начальную поддержку без изменения файлов проекта.

1. В корневой папке вашей библиотеки создайте папку `schematics`.
1. В папке `schematics/` создайте папку `ng-add` для первого схематика.
1. На корневом уровне папки `schematics` создайте файл `collection.json`.
1. Отредактируйте файл `collection.json`, чтобы определить начальную схему для вашей коллекции.

   <docs-code header="projects/my-lib/schematics/collection.json (Schematics Collection)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/collection.1.json"/>
   - Путь `$schema` является относительным относительно схемы коллекции Angular Devkit.
   - Объект `schematics` описывает именованные схематики, входящие в эту коллекцию.
   - Первая запись предназначена для схематика с именем `ng-add`.
     Она содержит описание и указывает на фабричную функцию, которая вызывается при выполнении схематика.

1. В файле `package.json` вашего проекта библиотеки добавьте запись "schematics" с путём к файлу схемы.
   Angular CLI использует эту запись для поиска именованных схематиков в вашей коллекции при выполнении команд.

<docs-code header="projects/my-lib/package.json (Schematics Collection Reference)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/package.json" region="collection"/>

Начальная схема, которую вы создали, сообщает CLI, где найти схематик, поддерживающий команду `ng add`.
Теперь вы готовы создать этот схематик.

## Обеспечение поддержки установки {#providing-installation-support}

Схематик для команды `ng add` может улучшить процесс начальной установки для ваших пользователей.
Следующие шаги определяют этот тип схематика.

1. Перейдите в папку `<lib-root>/schematics/ng-add`.
1. Создайте основной файл `index.ts`.
1. Откройте `index.ts` и добавьте исходный код для фабричной функции вашего схематика.

<docs-code header="projects/my-lib/schematics/ng-add/index.ts (ng-add Rule Factory)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/ng-add/index.ts"/>

Angular CLI автоматически установит последнюю версию библиотеки, и этот пример идёт дальше, добавляя `MyLibModule` в корень приложения. Функция `addRootImport` принимает callback, который должен возвращать блок кода. Вы можете писать любой код внутри строки, помеченной функцией `code`, а любые внешние символы должны быть обёрнуты функцией `external`, чтобы гарантировать генерацию соответствующих операторов import.

### Определение типа зависимости {#define-dependency-type}

Используйте параметр `save` команды `ng-add`, чтобы настроить, должна ли библиотека быть добавлена в `dependencies`, `devDependencies` или вообще не сохраняться в файле конфигурации `package.json` проекта.

<docs-code header="projects/my-lib/package.json (ng-add Reference)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/package.json" region="ng-add"/>

Возможные значения:

| Значения            | Подробности                                         |
| :------------------ | :-------------------------------------------------- |
| `false`             | Не добавлять пакет в `package.json`                 |
| `true`              | Добавить пакет в dependencies                       |
| `"dependencies"`    | Добавить пакет в dependencies                       |
| `"devDependencies"` | Добавить пакет в devDependencies                    |

## Сборка схематиков {#building-your-schematics}

Чтобы упаковать схематики вместе с библиотекой, необходимо настроить библиотеку для отдельной сборки схематиков, а затем добавить их в бандл.
Схематики нужно собирать _после_ сборки библиотеки, чтобы они были помещены в правильную директорию.

- Вашей библиотеке нужен пользовательский файл конфигурации TypeScript с инструкциями по компиляции схематиков в распространяемую библиотеку
- Чтобы добавить схематики в бандл библиотеки, добавьте скрипты в файл `package.json` библиотеки

Предположим, что у вас есть проект библиотеки `my-lib` в вашем Angular-рабочем пространстве.
Чтобы сообщить библиотеке, как собирать схематики, добавьте файл `tsconfig.schematics.json` рядом со сгенерированным файлом `tsconfig.lib.json`, который настраивает сборку библиотеки.

1. Отредактируйте файл `tsconfig.schematics.json`, добавив следующее содержимое.

   <docs-code header="projects/my-lib/tsconfig.schematics.json (TypeScript Config)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/tsconfig.schematics.json"/>

   | Параметры | Подробности                                                                                                                   |
   | :-------- | :---------------------------------------------------------------------------------------------------------------------------- |
   | `rootDir` | Указывает, что ваша папка `schematics` содержит входные файлы для компиляции.                                                 |
   | `outDir`  | Соответствует выходной папке библиотеки. По умолчанию это папка `dist/my-lib` в корне рабочего пространства.                  |

1. Чтобы убедиться, что исходные файлы схематиков компилируются в бандл библиотеки, добавьте следующие скрипты в файл `package.json` в корневой папке вашего проекта библиотеки (`projects/my-lib`).

   <docs-code header="projects/my-lib/package.json (Build Scripts)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/package.json"/>
   - Скрипт `build` компилирует ваш схематик, используя пользовательский файл `tsconfig.schematics.json`
   - Скрипт `postbuild` копирует файлы схематика после завершения скрипта `build`
   - Оба скрипта `build` и `postbuild` требуют зависимостей `copyfiles` и `typescript`.
     Для установки зависимостей перейдите к пути, определённому в `devDependencies`, и выполните `npm install` перед запуском скриптов.

## Обеспечение поддержки генерации {#providing-generation-support}

Вы можете добавить именованный схематик в вашу коллекцию, который позволит пользователям использовать команду `ng generate` для создания артефакта, определённого в вашей библиотеке.

Предположим, что ваша библиотека определяет сервис `my-service`, требующий определённой настройки.
Вы хотите, чтобы пользователи могли генерировать его с помощью следующей команды CLI.

```shell

ng generate my-lib:my-service

```

Для начала создайте новую подпапку `my-service` в папке `schematics`.

### Настройка нового схематика {#configure-the-new-schematic}

При добавлении схематика в коллекцию необходимо указать на него в схеме коллекции и предоставить файлы конфигурации, определяющие параметры, которые пользователь может передать команде.

1. Отредактируйте файл `schematics/collection.json`, чтобы указать на новую подпапку схематика и включить указатель на файл схемы, определяющий входные данные для нового схематика.

   <docs-code header="projects/my-lib/schematics/collection.json (Schematics Collection)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/collection.json"/>

1. Перейдите в папку `<lib-root>/schematics/my-service`.
1. Создайте файл `schema.json` и определите доступные параметры для схематика.

   <docs-code header="projects/my-lib/schematics/my-service/schema.json (Schematic JSON Schema)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/schema.json"/>
   - _id_: Уникальный ID для схемы в коллекции.
   - _title_: Понятное человеку описание схемы.
   - _type_: Дескриптор для типа, предоставляемого свойствами.
   - _properties_: Объект, определяющий доступные параметры для схематика.

   Каждый параметр связывает ключ с типом, описанием и опциональным псевдонимом.
   Тип определяет форму ожидаемого значения, а описание отображается, когда пользователь запрашивает справку по использованию схематика.

   Дополнительные настройки параметров схематика см. в схеме рабочего пространства.

1. Создайте файл `schema.ts` и определите интерфейс, хранящий значения параметров, определённых в файле `schema.json`.

   <docs-code header="projects/my-lib/schematics/my-service/schema.ts (Schematic Interface)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/schema.ts"/>

   | Параметры | Подробности                                                                                                                                               |
   | :-------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | name      | Имя, которое вы хотите присвоить создаваемому сервису.                                                                                                    |
   | path      | Переопределяет путь, переданный схематику. Значение пути по умолчанию основано на текущей рабочей директории.                                             |
   | project   | Указывает конкретный проект для запуска схематика. В схематике вы можете задать значение по умолчанию, если пользователь не указал параметр.               |

### Добавление файлов шаблонов {#add-template-files}

Для добавления артефактов в проект схематику необходимы собственные файлы шаблонов.
Шаблоны схематиков поддерживают специальный синтаксис для выполнения кода и подстановки переменных.

1. Создайте папку `files/` внутри папки `schematics/my-service/`.
1. Создайте файл с именем `__name@dasherize__.service.ts.template`, определяющий шаблон для генерации файлов.
   Этот шаблон сгенерирует сервис, в котором уже внедрён `HttpClient` Angular в свойство `http`.

   ```ts {header:projects/my-lib/schematics/my-service/files/__name@dasherize__.service.ts.template (Schematic Template)}

   import { Injectable } from '@angular/core';
   import { HttpClient } from '@angular/common/http';

   @Injectable({
      providedIn: 'root'
   })
   export class <%= classify(name) %>Service {
      private http = inject(HttpClient);
   }

   ```

   - Методы `classify` и `dasherize` — это вспомогательные функции, которые схематик использует для преобразования исходного шаблона и имени файла.
   - `name` предоставляется как свойство вашей фабричной функции.
     Это то же `name`, которое вы определили в схеме.

### Добавление фабричной функции {#add-the-factory-function}

Теперь, когда инфраструктура готова, вы можете определить основную функцию, выполняющую необходимые изменения в проекте пользователя.

Фреймворк Schematics предоставляет систему шаблонов файлов, поддерживающую как шаблоны путей, так и шаблоны содержимого.
Система работает с заполнителями, определёнными внутри файлов или путей, загруженных во входное дерево `Tree`.
Она заполняет их значениями, переданными в `Rule`.

Подробности о структурах данных и синтаксисе см. в [README Schematics](https://github.com/angular/angular-cli/blob/main/packages/angular_devkit/schematics/README.md).

1. Создайте основной файл `index.ts` и добавьте исходный код для фабричной функции схематика.
1. Сначала импортируйте определения схематиков, которые вам понадобятся.
   Фреймворк Schematics предоставляет множество вспомогательных функций для создания и использования правил при выполнении схематика.

   <docs-code header="projects/my-lib/schematics/my-service/index.ts (Imports)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="schematics-imports"/>

1. Импортируйте определённый интерфейс схемы, предоставляющий информацию о типах для параметров схематика.

   <docs-code header="projects/my-lib/schematics/my-service/index.ts (Schema Import)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="schema-imports"/>

1. Для создания схематика генерации начните с пустой фабрики правил.

   <docs-code header="projects/my-lib/schematics/my-service/index.ts (Initial Rule)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.1.ts" region="factory"/>

Эта фабрика правил возвращает дерево без изменений.
Параметры — это значения, переданные командой `ng generate`.

## Определение правила генерации {#define-a-generation-rule}

Теперь у вас есть инфраструктура для создания кода, который фактически изменяет приложение пользователя, настраивая его для использования сервиса, определённого в вашей библиотеке.

Рабочее пространство Angular, в котором пользователь установил вашу библиотеку, содержит несколько проектов (приложений и библиотек).
Пользователь может указать проект в командной строке или использовать проект по умолчанию.
В любом случае ваш код должен определить конкретный проект, к которому применяется схематик, чтобы получить информацию из конфигурации проекта.

Это делается с помощью объекта `Tree`, передаваемого в фабричную функцию.
Методы `Tree` дают доступ к полному файловому дереву в рабочем пространстве, позволяя читать и записывать файлы во время выполнения схематика.

### Получение конфигурации проекта {#get-the-project-configuration}

1. Чтобы определить проект назначения, используйте метод `workspaces.readWorkspace` для чтения содержимого файла конфигурации рабочего пространства `angular.json`.
   Для использования `workspaces.readWorkspace` необходимо создать `workspaces.WorkspaceHost` из `Tree`.
   Добавьте следующий код в вашу фабричную функцию.

   <docs-code header="projects/my-lib/schematics/my-service/index.ts (Schema Import)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="workspace"/>

   Обязательно проверьте наличие контекста и выбросьте соответствующую ошибку.

1. Теперь, имея имя проекта, используйте его для получения конфигурационной информации, специфичной для проекта.

   <docs-code header="projects/my-lib/schematics/my-service/index.ts (Project)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="project-info"/>

   Объект `workspace.projects` содержит всю конфигурационную информацию, специфичную для проекта.

1. `options.path` определяет, куда перемещаются файлы шаблонов схематика после применения схематика.

   Параметр `path` в схеме схематика по умолчанию заменяется текущей рабочей директорией.
   Если `path` не определён, используйте `sourceRoot` из конфигурации проекта вместе с `projectType`.

   <docs-code header="projects/my-lib/schematics/my-service/index.ts (Project Info)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="path"/>

### Определение правила {#define-the-rule}

`Rule` может использовать внешние файлы шаблонов, преобразовывать их и возвращать другой объект `Rule` с преобразованным шаблоном.
Используйте шаблонизацию для генерации любых пользовательских файлов, необходимых для вашего схематика.

1. Добавьте следующий код в вашу фабричную функцию.

   <docs-code header="projects/my-lib/schematics/my-service/index.ts (Template transform)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="template"/>

   | Методы             | Подробности                                                                                                                                                                                                                                                                              |
   | :----------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | `apply()`          | Применяет несколько правил к источнику и возвращает преобразованный источник. Принимает 2 аргумента: источник и массив правил.                                                                                                                                                            |
   | `url()`            | Читает исходные файлы из вашей файловой системы, относительно схематика.                                                                                                                                                                                                                 |
   | `applyTemplates()` | Получает аргумент с методами и свойствами, которые вы хотите сделать доступными в шаблоне схематика и именах файлов схематика. Возвращает `Rule`. Здесь вы определяете методы `classify()` и `dasherize()`, а также свойство `name`.                                                     |
   | `classify()`       | Принимает значение и возвращает его в title case. Например, если переданное имя — `my service`, оно возвращается как `MyService`.                                                                                                                                                         |
   | `dasherize()`      | Принимает значение и возвращает его в виде строки с дефисами в нижнем регистре. Например, если переданное имя — MyService, оно возвращается как `my-service`.                                                                                                                            |
   | `move()`           | Перемещает предоставленные исходные файлы в место назначения при применении схематика.                                                                                                                                                                                                   |

1. Наконец, фабрика правил должна возвращать правило.

   <docs-code header="projects/my-lib/schematics/my-service/index.ts (Chain Rule)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="chain"/>

   Метод `chain()` позволяет объединять несколько правил в одно, чтобы выполнять несколько операций в одном схематике.
   Здесь вы просто объединяете правила шаблона с кодом, выполняемым схематиком.

См. полный пример следующей функции правила схематика.

<docs-code header="projects/my-lib/schematics/my-service/index.ts" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts"/>

Дополнительную информацию о правилах и вспомогательных методах см. в [Предоставляемые правила](https://github.com/angular/angular-cli/tree/main/packages/angular_devkit/schematics#provided-rules).

## Запуск схематика библиотеки {#running-your-library-schematic}

После сборки библиотеки и схематиков вы можете установить коллекцию схематиков для запуска в вашем проекте.
Следующие шаги показывают, как сгенерировать сервис с помощью созданного ранее схематика.

### Сборка библиотеки и схематиков {#build-your-library-and-schematics}

Из корня рабочего пространства выполните команду `ng build` для вашей библиотеки.

```shell

ng build my-lib

```

Затем перейдите в директорию библиотеки для сборки схематика

```shell

cd projects/my-lib
npm run build

```

### Линковка библиотеки {#link-the-library}

Ваша библиотека и схематики упакованы и помещены в папку `dist/my-lib` в корне рабочего пространства.
Для запуска схематика необходимо слинковать библиотеку с папкой `node_modules`.
Из корня рабочего пространства выполните команду `npm link` с путём к распространяемой библиотеке.

```shell

npm link dist/my-lib

```

### Запуск схематика {#run-the-schematic}

Теперь, когда библиотека установлена, запустите схематик с помощью команды `ng generate`.

```shell

ng generate my-lib:my-service --name my-data

```

В консоли вы увидите, что схематик был запущен и файл `my-data.service.ts` был создан в папке вашего приложения.

```shell {hideCopy}

CREATE src/app/my-data.service.ts (208 bytes)

```
