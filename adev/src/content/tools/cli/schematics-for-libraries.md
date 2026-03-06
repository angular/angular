# Схематики для библиотек {#schematics-for-libraries}

При создании Angular-библиотеки можно предоставить и упаковать вместе с ней схематики, интегрирующие её с Angular CLI.
С помощью ваших схематиков пользователи смогут использовать `ng add` для установки начальной версии библиотеки,
`ng generate` для создания артефактов, определённых в библиотеке, и `ng update` для адаптации проекта к новой версии библиотеки с критическими изменениями.

Все три типа схематиков могут быть частью коллекции, упакованной вместе с библиотекой.

## Создание коллекции схематиков {#creating-a-schematics-collection}

Для начала работы с коллекцией необходимо создать файлы схематиков.
Следующие шаги показывают, как добавить начальную поддержку без изменения файлов проекта.

1. В корневой папке библиотеки создайте папку `schematics`.
1. В папке `schematics/` создайте папку `ng-add` для первого схематика.
1. На корневом уровне папки `schematics` создайте файл `collection.json`.
1. Отредактируйте файл `collection.json`, чтобы определить начальную схему коллекции.

   <docs-code header="projects/my-lib/schematics/collection.json (Schematics Collection)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/collection.1.json"/>
   - Путь `$schema` указывает относительно схемы коллекции Angular Devkit.
   - Объект `schematics` описывает именованные схематики, входящие в эту коллекцию.
   - Первая запись — для схематика с именем `ng-add`.
     Она содержит описание и указывает на фабричную функцию, вызываемую при выполнении схематика.

1. В файл `package.json` проекта библиотеки добавьте запись "schematics" с путём к файлу схемы.
   Angular CLI использует эту запись для поиска именованных схематиков в вашей коллекции при выполнении команд.

<docs-code header="projects/my-lib/package.json (Schematics Collection Reference)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/package.json" region="collection"/>

Созданная начальная схема сообщает CLI, где найти схематик, поддерживающий команду `ng add`.
Теперь можно создать этот схематик.

## Обеспечение поддержки установки {#providing-installation-support}

Схематик для команды `ng add` может улучшить процесс начальной установки для пользователей.
Следующие шаги определяют этот тип схематика.

1. Перейдите в папку `<lib-root>/schematics/ng-add`.
1. Создайте основной файл `index.ts`.
1. Откройте `index.ts` и добавьте исходный код фабричной функции схематика.

<docs-code header="projects/my-lib/schematics/ng-add/index.ts (ng-add Rule Factory)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/ng-add/index.ts"/>

Angular CLI автоматически установит последнюю версию библиотеки, и в этом примере делается шаг вперёд — добавляется `MyLibModule` в корень приложения. Функция `addRootImport` принимает коллбэк, который должен возвращать блок кода. Любой код можно написать внутри строки, помеченной функцией `code`, а все внешние символы должны быть обёрнуты функцией `external`, чтобы гарантировать генерацию соответствующих операторов импорта.

### Определение типа зависимости {#define-dependency-type}

Используйте опцию `save` для `ng-add`, чтобы настроить, должна ли библиотека добавляться в `dependencies`, `devDependencies` или не сохраняться в файле конфигурации `package.json` проекта.

<docs-code header="projects/my-lib/package.json (ng-add Reference)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/package.json" region="ng-add"/>

Возможные значения:

| Значения            | Описание                                    |
| :------------------ | :------------------------------------------ |
| `false`             | Не добавлять пакет в `package.json`         |
| `true`              | Добавить пакет в зависимости                |
| `"dependencies"`    | Добавить пакет в зависимости                |
| `"devDependencies"` | Добавить пакет в devDependencies            |

## Сборка схематиков {#building-your-schematics}

Для упаковки схематиков вместе с библиотекой необходимо настроить библиотеку для раздельной сборки схематиков, а затем добавить их в бандл.
Схематики нужно собирать _после_ сборки библиотеки, чтобы они были помещены в правильную директорию.

- Библиотеке нужен пользовательский файл конфигурации TypeScript с инструкциями по компиляции схематиков в распространяемую библиотеку
- Для добавления схематиков в бандл библиотеки добавьте скрипты в файл `package.json` библиотеки

Предположим, в рабочем пространстве Angular есть проект библиотеки `my-lib`.
Чтобы сообщить библиотеке, как собирать схематики, добавьте файл `tsconfig.schematics.json` рядом со сгенерированным файлом `tsconfig.lib.json`, настраивающим сборку библиотеки.

1. Отредактируйте файл `tsconfig.schematics.json`, добавив следующее содержимое.

   <docs-code header="projects/my-lib/tsconfig.schematics.json (TypeScript Config)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/tsconfig.schematics.json"/>

   | Параметры | Описание                                                                                                                    |
   | :-------- | :-------------------------------------------------------------------------------------------------------------------------- |
   | `rootDir` | Указывает, что папка `schematics` содержит входные файлы для компиляции.                                                   |
   | `outDir`  | Соответствует выходной папке библиотеки. По умолчанию это папка `dist/my-lib` в корне рабочего пространства.               |

1. Для включения исходных файлов схематиков в бандл библиотеки добавьте следующие скрипты в файл `package.json` в корневой папке проекта библиотеки \(`projects/my-lib`\).

   <docs-code header="projects/my-lib/package.json (Build Scripts)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/package.json"/>
   - Скрипт `build` компилирует схематики с использованием пользовательского файла `tsconfig.schematics.json`
   - Скрипт `postbuild` копирует файлы схематиков после завершения скрипта `build`
   - Оба скрипта `build` и `postbuild` требуют зависимостей `copyfiles` и `typescript`.
     Для установки зависимостей перейдите в путь, указанный в `devDependencies`, и выполните `npm install` перед запуском скриптов.

## Обеспечение поддержки генерации {#providing-generation-support}

Можно добавить именованный схематик в коллекцию, позволяющий пользователям использовать команду `ng generate` для создания артефакта, определённого в библиотеке.

Предположим, библиотека определяет сервис `my-service`, требующий некоторой настройки.
Нужно, чтобы пользователи могли генерировать его с помощью следующей команды CLI.

```shell

ng generate my-lib:my-service

```

Для начала создайте новую подпапку `my-service` в папке `schematics`.

### Настройка нового схематика {#configure-the-new-schematic}

При добавлении схематика в коллекцию необходимо указать на него в схеме коллекции и предоставить файлы конфигурации для определения параметров, которые пользователь может передавать команде.

1. Отредактируйте файл `schematics/collection.json`, чтобы указать на новую подпапку схематика и включить указатель на файл схемы, задающий входные данные нового схематика.

   <docs-code header="projects/my-lib/schematics/collection.json (Schematics Collection)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/collection.json"/>

1. Перейдите в папку `<lib-root>/schematics/my-service`.
1. Создайте файл `schema.json` и определите доступные параметры схематика.

   <docs-code header="projects/my-lib/schematics/my-service/schema.json (Schematic JSON Schema)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/schema.json"/>
   - _id_: Уникальный идентификатор схемы в коллекции.
   - _title_: Описание схемы, понятное человеку.
   - _type_: Дескриптор типа, предоставляемого свойствами.
   - _properties_: Объект, определяющий доступные параметры схематика.

   Каждая опция связывает ключ с типом, описанием и необязательным псевдонимом.
   Тип определяет форму ожидаемого значения, а описание отображается, когда пользователь запрашивает справку по использованию схематика.

   Дополнительные настройки параметров схематика см. в схеме рабочего пространства.

1. Создайте файл `schema.ts` и определите интерфейс, хранящий значения параметров, определённых в файле `schema.json`.

   <docs-code header="projects/my-lib/schematics/my-service/schema.ts (Schematic Interface)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/schema.ts"/>

   | Параметры | Описание                                                                                                                                          |
   | :-------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
   | name      | Имя для создаваемого сервиса.                                                                                                                     |
   | path      | Переопределяет путь, передаваемый схематику. Значение пути по умолчанию основано на текущей рабочей директории.                                   |
   | project   | Указывает конкретный проект для запуска схематика. В схематике можно задать значение по умолчанию, если пользователь не предоставил параметр. |

### Добавление файлов шаблонов {#add-template-files}

Для добавления артефактов в проект схематику нужны собственные файлы шаблонов.
Шаблоны схематиков поддерживают специальный синтаксис для выполнения кода и подстановки переменных.

1. Создайте папку `files/` внутри папки `schematics/my-service/`.
1. Создайте файл `__name@dasherize__.service.ts.template`, определяющий шаблон для генерации файлов.
   Этот шаблон создаёт сервис с уже внедрённым `HttpClient` Angular в свойство `http`.

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

   - Методы `classify` и `dasherize` — служебные функции, используемые схематиком для преобразования шаблона источника и имени файла.
   - `name` предоставляется как свойство из фабричной функции.
     Это то же самое `name`, что определено в схеме.

### Добавление фабричной функции {#add-the-factory-function}

Теперь, когда инфраструктура создана, можно определить основную функцию, выполняющую нужные изменения в проекте пользователя.

Фреймворк Schematics предоставляет систему шаблонов файлов, поддерживающую как шаблоны путей, так и шаблоны содержимого.
Система работает с заполнителями, определёнными внутри файлов или путей, загружаемых в входное `Tree`.
Она заполняет их значениями, передаваемыми в `Rule`.

Подробнее об этих структурах данных и синтаксисе см. в [README Schematics](https://github.com/angular/angular-cli/blob/main/packages/angular_devkit/schematics/README.md).

1. Создайте основной файл `index.ts` и добавьте исходный код фабричной функции схематика.
1. Сначала импортируйте определения схематиков.
   Фреймворк Schematics предлагает множество служебных функций для создания и использования правил при выполнении схематика.

   <docs-code header="projects/my-lib/schematics/my-service/index.ts (Imports)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="schematics-imports"/>

1. Импортируйте определённый интерфейс схемы, предоставляющий информацию о типах для параметров схематика.

   <docs-code header="projects/my-lib/schematics/my-service/index.ts (Schema Import)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="schema-imports"/>

1. Для построения схематика генерации начните с пустой фабрики правил.

   <docs-code header="projects/my-lib/schematics/my-service/index.ts (Initial Rule)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.1.ts" region="factory"/>

Эта фабрика правил возвращает дерево без изменений.
Параметры — это значения опций, переданных через команду `ng generate`.

## Определение правила генерации {#define-a-generation-rule}

Теперь есть инфраструктура для создания кода, который фактически модифицирует приложение пользователя для настройки сервиса, определённого в библиотеке.

Рабочее пространство Angular, в котором пользователь установил библиотеку, содержит несколько проектов (приложений и библиотек).
Пользователь может указать проект в командной строке или позволить выбрать по умолчанию.
В любом случае код должен идентифицировать конкретный проект, к которому применяется схематик, чтобы получить информацию из конфигурации проекта.

Это делается с помощью объекта `Tree`, передаваемого в фабричную функцию.
Методы `Tree` предоставляют доступ к полному дереву файлов рабочего пространства, позволяя читать и записывать файлы в процессе выполнения схематика.

### Получение конфигурации проекта {#get-the-project-configuration}

1. Для определения целевого проекта используйте метод `workspaces.readWorkspace` для чтения содержимого файла конфигурации рабочего пространства `angular.json`.
   Для использования `workspaces.readWorkspace` необходимо создать `workspaces.WorkspaceHost` из `Tree`.
   Добавьте следующий код в фабричную функцию.

   <docs-code header="projects/my-lib/schematics/my-service/index.ts (Schema Import)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="workspace"/>

   Убедитесь, что контекст существует, и выбрасывайте соответствующую ошибку.

1. Теперь, зная имя проекта, используйте его для получения специфичной для проекта информации конфигурации.

   <docs-code header="projects/my-lib/schematics/my-service/index.ts (Project)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="project-info"/>

   Объект `workspace.projects` содержит всю специфичную для проекта информацию конфигурации.

1. `options.path` определяет, куда перемещаются файлы шаблонов схематика после его применения.

   Параметр `path` в схеме схематика по умолчанию замещается текущей рабочей директорией.
   Если `path` не определён, используйте `sourceRoot` из конфигурации проекта вместе с `projectType`.

   <docs-code header="projects/my-lib/schematics/my-service/index.ts (Project Info)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="path"/>

### Определение правила {#define-the-rule}

`Rule` может использовать внешние файлы шаблонов, преобразовывать их и возвращать другой объект `Rule` с преобразованным шаблоном.
Используйте шаблонизацию для генерации пользовательских файлов, необходимых схематику.

1. Добавьте следующий код в фабричную функцию.

   <docs-code header="projects/my-lib/schematics/my-service/index.ts (Template transform)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="template"/>

   | Методы             | Описание                                                                                                                                                                                                                                                              |
   | :----------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | `apply()`          | Применяет несколько правил к источнику и возвращает преобразованный источник. Принимает 2 аргумента: источник и массив правил.                                                                                                                                        |
   | `url()`            | Читает исходные файлы из файловой системы относительно схематика.                                                                                                                                                                                                     |
   | `applyTemplates()` | Получает аргумент с методами и свойствами, которые нужно сделать доступными для шаблона схематика и имён файлов. Возвращает `Rule`. Здесь определяются методы `classify()` и `dasherize()`, а также свойство `name`. |
   | `classify()`       | Принимает значение и возвращает его в виде заглавного регистра. Например, если переданное имя `my service`, оно возвращается как `MyService`.                                                                                                                         |
   | `dasherize()`      | Принимает значение и возвращает его с дефисами в нижнем регистре. Например, если переданное имя `MyService`, оно возвращается как `my-service`.                                                                                                                       |
   | `move()`           | Перемещает предоставленные исходные файлы в назначение при применении схематика.                                                                                                                                                                                      |

1. Наконец, фабрика правил должна возвращать правило.

   <docs-code header="projects/my-lib/schematics/my-service/index.ts (Chain Rule)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="chain"/>

   Метод `chain()` позволяет объединить несколько правил в одно, чтобы выполнить несколько операций в одном схематике.
   Здесь объединяются правила шаблонизации с кодом, выполняемым схематиком.

Посмотрите полный пример следующей функции правила схематика.

<docs-code header="projects/my-lib/schematics/my-service/index.ts" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts"/>

Подробнее о правилах и служебных методах см. в разделе [Предоставленные правила](https://github.com/angular/angular-cli/tree/main/packages/angular_devkit/schematics#provided-rules).

## Запуск схематика библиотеки {#running-your-library-schematic}

После сборки библиотеки и схематиков можно установить коллекцию схематиков для применения к проекту.
Следующие шаги показывают, как сгенерировать сервис с помощью созданного схематика.

### Сборка библиотеки и схематиков {#build-your-library-and-schematics}

Из корня рабочего пространства выполните команду `ng build` для библиотеки.

```shell

ng build my-lib

```

Затем перейдите в директорию библиотеки для сборки схематиков

```shell

cd projects/my-lib
npm run build

```

### Связывание библиотеки {#link-the-library}

Библиотека и схематики упакованы и помещены в папку `dist/my-lib` в корне рабочего пространства.
Для запуска схематика необходимо связать библиотеку с папкой `node_modules`.
Из корня рабочего пространства выполните команду `npm link` с путём к распространяемой библиотеке.

```shell

npm link dist/my-lib

```

### Запуск схематика {#run-the-schematic}

Теперь, когда библиотека установлена, запустите схематик с помощью команды `ng generate`.

```shell

ng generate my-lib:my-service --name my-data

```

В консоли будет видно, что схематик был запущен и файл `my-data.service.ts` был создан в папке приложения.

```shell {hideCopy}

CREATE src/app/my-data.service.ts (208 bytes)

```
