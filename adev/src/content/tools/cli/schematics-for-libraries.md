# Schematics для библиотек

Когда вы создаёте Angular-библиотеку, её можно предоставить и упаковать вместе со schematics, которые интегрируют её с Angular CLI.
С вашими schematics пользователи могут использовать `ng add` для установки начальной версии библиотеки,
`ng generate` для создания артефактов, определённых в библиотеке, и `ng update` для адаптации проекта к новой версии библиотеки, вводящей breaking changes.

Все три типа schematics могут быть частью коллекции, которую вы упаковываете с библиотекой.

## Создание коллекции schematics {#creating-a-schematics-collection}

Чтобы начать коллекцию, нужно создать файлы schematic.
Следующие шаги показывают, как добавить начальную поддержку без изменения каких-либо файлов проекта.

1. В корневой папке библиотеки создайте папку `schematics`.
1. В папке `schematics/` создайте папку `ng-add` для первого schematic.
1. На корневом уровне папки `schematics` создайте файл `collection.json`.
1. Отредактируйте файл `collection.json`, чтобы определить начальную схему для коллекции.

   <docs-code header="projects/my-lib/schematics/collection.json (Schematics Collection)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/collection.1.json"/>
   - Путь `$schema` относителен к схеме коллекции Angular Devkit.
   - Объект `schematics` описывает именованные schematics, входящие в эту коллекцию.
   - Первая запись — для schematic с именем `ng-add`.
     Она содержит описание и указывает на фабричную функцию, вызываемую при выполнении schematic.

1. В файле `package.json` проекта библиотеки добавьте запись «schematics» с путём к файлу схемы.
   Angular CLI использует эту запись, чтобы находить именованные schematics в коллекции при запуске команд.

<docs-code header="projects/my-lib/package.json (Schematics Collection Reference)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/package.json" region="collection"/>

Начальная схема, которую вы создали, сообщает CLI, где найти schematic, поддерживающий команду `ng add`.
Теперь можно создать этот schematic.

## Предоставление поддержки установки {#providing-installation-support}

Schematic для команды `ng add` может улучшить начальный процесс установки для пользователей.
Следующие шаги определяют этот тип schematic.

1. Перейдите в папку `<lib-root>/schematics/ng-add`.
1. Создайте файл `schema.json` для определения опций, которые принимает schematic.

   <docs-code header="projects/my-lib/schematics/ng-add/schema.json (ng-add Schema)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/ng-add/schema.json"/>

1. Создайте файл `schema.ts` для определения интерфейса опций, определённых в файле `schema.json`.

   <docs-code header="projects/my-lib/schematics/ng-add/schema.ts (ng-add Schema Interface)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/ng-add/schema.ts"/>

1. Создайте основной файл `index.ts` и добавьте исходный код фабричной функции schematic.

   <docs-code header="projects/my-lib/schematics/ng-add/index.ts (ng-add Rule Factory)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/ng-add/index.ts"/>

Angular CLI автоматически установит последнюю версию библиотеки, а этот пример идёт дальше, добавляя `MyLibModule` в корень приложения. Функция `addRootImport` принимает callback, который должен вернуть блок кода. Можно писать любой код внутри строки, помеченной функцией `code`, а любые внешние символы нужно оборачивать функцией `external`, чтобы гарантировать генерацию соответствующих import-операторов.

### Определение типа зависимости {#define-dependency-type}

Используйте опцию `save` у `ng-add`, чтобы настроить, должна ли библиотека добавляться в `dependencies`, `devDependencies` или вообще не сохраняться в файле конфигурации `package.json` проекта.

<docs-code header="projects/my-lib/package.json (ng-add Reference)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/package.json" region="ng-add"/>

Возможные значения:

| Значения              | Подробности                                 |
| :------------------ | :-------------------------------------- |
| `false`             | Не добавлять пакет в `package.json` |
| `true`              | Добавить пакет в dependencies     |
| `"dependencies"`    | Добавить пакет в dependencies     |
| `"devDependencies"` | Добавить пакет в devDependencies  |

## Сборка schematics {#building-your-schematics}

Чтобы объединить schematics вместе с библиотекой, нужно настроить библиотеку на отдельную сборку schematics, затем добавить их в бандл.
Schematics нужно собирать _после_ сборки библиотеки, чтобы они попали в правильный каталог.

- Библиотеке нужен пользовательский файл конфигурации TypeScript с инструкциями, как скомпилировать schematics в дистрибутивную библиотеку
- Чтобы добавить schematics в бандл библиотеки, добавьте скрипты в файл `package.json` библиотеки

Предположим, в Angular workspace есть проект библиотеки `my-lib`.
Чтобы сообщить библиотеке, как собирать schematics, добавьте файл `tsconfig.schematics.json` рядом со сгенерированным файлом `tsconfig.lib.json`, который настраивает сборку библиотеки.

1. Отредактируйте файл `tsconfig.schematics.json`, добавив следующее содержимое.

   <docs-code header="projects/my-lib/tsconfig.schematics.json (TypeScript Config)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/tsconfig.schematics.json"/>

   | Опции   | Подробности                                                                                                          |
   | :-------- | :--------------------------------------------------------------------------------------------------------------- |
   | `rootDir` | Указывает, что папка `schematics` содержит входные файлы для компиляции.                                 |
   | `outDir`  | Соответствует выходной папке библиотеки. По умолчанию это папка `dist/my-lib` в корне workspace. |

1. Чтобы исходные файлы schematics компилировались в бандл библиотеки, добавьте следующие скрипты в файл `package.json` в корневой папке проекта библиотеки \(`projects/my-lib`\).

   <docs-code header="projects/my-lib/package.json (Build Scripts)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/package.json"/>
   - Скрипт `build` компилирует schematic с помощью пользовательского файла `tsconfig.schematics.json`
   - Скрипт `postbuild` копирует файлы schematic после завершения скрипта `build`
   - Оба скрипта `build` и `postbuild` требуют зависимости `copyfiles` и `typescript`.
     Чтобы установить зависимости, перейдите по пути, определённому в `devDependencies`, и выполните `npm install` перед запуском скриптов.

## Предоставление поддержки генерации {#providing-generation-support}

В коллекцию можно добавить именованный schematic, позволяющий пользователям использовать команду `ng generate` для создания артефакта, определённого в библиотеке.

Предположим, библиотека определяет сервис `my-service`, требующий некоторой настройки.
Вы хотите, чтобы пользователи могли генерировать его следующей командой CLI.

```shell

ng generate my-lib:my-service

```

Для начала создайте новую подпапку `my-service` в папке `schematics`.

### Настройка нового schematic {#configure-the-new-schematic}

При добавлении schematic в коллекцию нужно указать на него в схеме коллекции и предоставить файлы конфигурации для определения опций, которые пользователь может передать команде.

1. Отредактируйте файл `schematics/collection.json`, чтобы указать на новую подпапку schematic, и включите указатель на файл схемы, задающий входы для нового schematic.

   <docs-code header="projects/my-lib/schematics/collection.json (Schematics Collection)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/collection.json"/>

1. Перейдите в папку `<lib-root>/schematics/my-service`.
1. Создайте файл `schema.json` и определите доступные опции для schematic.

   <docs-code header="projects/my-lib/schematics/my-service/schema.json (Schematic JSON Schema)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/schema.json"/>
   - _id_: Уникальный ID схемы в коллекции.
   - _title_: Человекочитаемое описание схемы.
   - _type_: Дескриптор типа, предоставляемого свойствами.
   - _properties_: Объект, определяющий доступные опции для schematic.

   Каждая опция связывает ключ с типом, описанием и необязательным алиасом.
   Тип определяет форму ожидаемого значения, а описание отображается, когда пользователь запрашивает справку по использованию schematic.

   См. схему workspace для дополнительных кастомизаций опций schematic.

1. Создайте файл `schema.ts` и определите интерфейс, хранящий значения опций, определённых в файле `schema.json`.

   <docs-code header="projects/my-lib/schematics/my-service/schema.ts (Schematic Interface)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/schema.ts"/>

   | Опции | Подробности                                                                                                                                     |
   | :------ | :------------------------------------------------------------------------------------------------------------------------------------------ |
   | name    | Имя, которое вы хотите задать создаваемому сервису.                                                                                       |
   | path    | Переопределяет путь, предоставленный schematic. Значение пути по умолчанию основано на текущем рабочем каталоге.                             |
   | project | Указывает конкретный проект для запуска schematic. В schematic можно предоставить значение по умолчанию, если опция не предоставлена пользователем. |

### Добавление файлов шаблонов {#add-template-files}

Чтобы добавлять артефакты в проект, schematic нужны собственные файлы шаблонов.
Шаблоны schematic поддерживают специальный синтаксис для выполнения кода и подстановки переменных.

1. Создайте папку `files/` внутри папки `schematics/my-service/`.
1. Создайте файл с именем `__name@dasherize__.service.ts.template`, определяющий шаблон для генерации файлов.
   Этот шаблон сгенерирует сервис, в который уже внедрён `HttpClient` Angular в свойство `http`.

   ```ts {header:projects/my-lib/schematics/my-service/files/__name@dasherize__.service.ts.template (Schematic Template)}

   import { Service } from '@angular/core';
   import { HttpClient } from '@angular/common/http';

   @Service()
   export class <%= classify(name) %>Service {
      private http = inject(HttpClient);
   }

   ```

   - Методы `classify` и `dasherize` — утилитарные функции, которые schematic использует для преобразования исходного шаблона и имени файла.
   - `name` предоставляется как свойство из фабричной функции.
     Это то же `name`, которое вы определили в схеме.

### Добавление фабричной функции {#add-the-factory-function}

Теперь, когда инфраструктура на месте, можно определить основную функцию, выполняющую нужные модификации в проекте пользователя.

Фреймворк Schematics предоставляет систему шаблонов файлов, поддерживающую шаблоны и путей, и содержимого.
Система работает с плейсхолдерами, определёнными внутри файлов или путей, загруженных во входной `Tree`.
Она заполняет их значениями, переданными в `Rule`.

Подробности об этих структурах данных и синтаксисе см. в [Schematics README](https://github.com/angular/angular-cli/blob/main/packages/angular_devkit/schematics/README.md).

1. Создайте основной файл `index.ts` и добавьте исходный код фабричной функции schematic.
1. Сначала импортируйте определения schematics, которые понадобятся.
   Фреймворк Schematics предлагает много утилитарных функций для создания и использования rules при запуске schematic.

   <docs-code header="projects/my-lib/schematics/my-service/index.ts (Imports)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="schematics-imports"/>

1. Импортируйте определённый интерфейс схемы, предоставляющий информацию о типах для опций schematic.

   <docs-code header="projects/my-lib/schematics/my-service/index.ts (Schema Import)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="schema-imports"/>

1. Чтобы построить generation schematic, начните с пустой фабрики rule.

   <docs-code header="projects/my-lib/schematics/my-service/index.ts (Initial Rule)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.1.ts" region="factory"/>

Эта фабрика rule возвращает tree без изменений.
Опции — это значения опций, переданные через команду `ng generate`.

## Определение generation rule {#define-a-generation-rule}

Теперь у вас есть фреймворк для создания кода, который фактически модифицирует приложение пользователя, чтобы настроить его для сервиса, определённого в библиотеке.

Angular workspace, куда пользователь установил библиотеку, содержит несколько проектов \(приложения и библиотеки\).
Пользователь может указать проект в командной строке или оставить значение по умолчанию.
В любом случае код должен идентифицировать конкретный проект, к которому применяется этот schematic, чтобы можно было получить информацию из конфигурации проекта.

Делайте это с помощью объекта `Tree`, передаваемого в фабричную функцию.
Методы `Tree` дают доступ к полному дереву файлов в workspace, позволяя читать и писать файлы во время выполнения schematic.

### Получение конфигурации проекта {#get-the-project-configuration}

1. Чтобы определить целевой проект, используйте метод `workspaces.readWorkspace` для чтения содержимого файла конфигурации workspace `angular.json`.
   Для использования `workspaces.readWorkspace` нужно создать `workspaces.WorkspaceHost` из `Tree`.
   Добавьте следующий код в фабричную функцию.

   <docs-code header="projects/my-lib/schematics/my-service/index.ts (Schema Import)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="workspace"/>

   Обязательно проверьте, что контекст существует, и выбросьте соответствующую ошибку.

1. Теперь, когда есть имя проекта, используйте его для получения конфигурационной информации, специфичной для проекта.

   <docs-code header="projects/my-lib/schematics/my-service/index.ts (Project)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="project-info"/>

   Объект `workspace.projects` содержит всю конфигурационную информацию, специфичную для проекта.

1. `options.path` определяет, куда перемещаются файлы шаблонов schematic после применения schematic.

   Опция `path` в схеме schematic по умолчанию подставляется текущим рабочим каталогом.
   Если `path` не определён, используйте `sourceRoot` из конфигурации проекта вместе с `projectType`.

   <docs-code header="projects/my-lib/schematics/my-service/index.ts (Project Info)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="path"/>

### Определение rule {#define-the-rule}

`Rule` может использовать внешние файлы шаблонов, трансформировать их и возвращать другой объект `Rule` с трансформированным шаблоном.
Используйте шаблоны для генерации любых пользовательских файлов, необходимых для schematic.

1. Добавьте следующий код в фабричную функцию.

   <docs-code header="projects/my-lib/schematics/my-service/index.ts (Template transform)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="template"/>

   | Методы            | Подробности                                                                                                                                                                                                                                          |
   | :----------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | `apply()`          | Применяет несколько rules к источнику и возвращает трансформированный источник. Принимает 2 аргумента: источник и массив rules.                                                                                                                     |
   | `url()`            | Читает исходные файлы из файловой системы относительно schematic.                                                                                                                                                                              |
   | `applyTemplates()` | Принимает аргумент методов и свойств, которые вы хотите сделать доступными шаблону schematic и именам файлов schematic. Возвращает `Rule`. Здесь определяются методы `classify()` и `dasherize()` и свойство `name`. |
   | `classify()`       | Принимает значение и возвращает его в title case. Например, если предоставлено имя `my service`, возвращается `MyService`.                                                                                                             |
   | `dasherize()`      | Принимает значение и возвращает его в dashed и lowercase. Например, если предоставлено имя MyService, возвращается `my-service`.                                                                                                     |
   | `move()`           | Перемещает предоставленные исходные файлы в назначение при применении schematic.                                                                                                                                                              |

1. Наконец, фабрика rule должна вернуть rule.

   <docs-code header="projects/my-lib/schematics/my-service/index.ts (Chain Rule)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="chain"/>

   Метод `chain()` позволяет объединить несколько rules в одно rule, чтобы выполнять несколько операций в одном schematic.
   Здесь вы только объединяете rules шаблонов с любым кодом, выполняемым schematic.

См. полный пример следующей функции rule schematic.

<docs-code header="projects/my-lib/schematics/my-service/index.ts" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts"/>

Дополнительную информацию о rules и утилитарных методах см. в [Provided Rules](https://github.com/angular/angular-cli/tree/main/packages/angular_devkit/schematics#provided-rules).

## Запуск schematic библиотеки {#running-your-library-schematic}

После сборки библиотеки и schematics можно установить коллекцию schematics для запуска против проекта.
Следующие шаги показывают, как сгенерировать сервис с помощью schematic, созданного ранее.

### Сборка библиотеки и schematics {#build-your-library-and-schematics}

Из корня workspace выполните команду `ng build` для библиотеки.

```shell

ng build my-lib

```

Затем перейдите в каталог библиотеки, чтобы собрать schematic

```shell

cd projects/my-lib
npm run build

```

### Связывание библиотеки {#link-the-library}

Библиотека и schematics упакованы и размещены в папке `dist/my-lib` в корне workspace.
Для запуска schematic нужно связать библиотеку в папку `node_modules`.
Из корня workspace выполните команду `npm link` с путём к дистрибутивной библиотеке.

```shell

npm link dist/my-lib

```

### Запуск schematic {#run-the-schematic}

Теперь, когда библиотека установлена, запустите schematic командой `ng generate`.

```shell

ng generate my-lib:my-service --name my-data

```

В консоли видно, что schematic был выполнен и файл `my-data.service.ts` создан в папке приложения.

```shell {hideCopy}

CREATE src/app/my-data.service.ts (208 bytes)

```
