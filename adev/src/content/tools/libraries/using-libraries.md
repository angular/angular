# Использование Angular-библиотек, опубликованных в npm

При сборке Angular-приложения используйте преимущества сложных first-party библиотек, а также богатой экосистемы сторонних библиотек.
[Angular Material][AngularMaterialMain] — пример сложной first-party библиотеки.

## Установка библиотек {#install-libraries}

Библиотеки публикуются как [npm-пакеты][GuideNpmPackages], обычно вместе со schematics, которые интегрируют их с Angular CLI.
Чтобы интегрировать переиспользуемый код библиотеки в приложение, нужно установить пакет и импортировать предоставляемую функциональность в месте использования.
Для большинства опубликованных Angular-библиотек используйте команду Angular CLI `ng add <lib_name>`.

Команда Angular CLI `ng add` использует менеджер пакетов для установки пакета библиотеки и вызывает schematics, включённые в пакет, для другого scaffolding в коде проекта.
Примеры менеджеров пакетов — [npm][NpmjsMain] или [yarn][YarnpkgMain].
Дополнительный scaffolding в коде проекта включает import-операторы, шрифты и темы.

Опубликованная библиотека обычно предоставляет файл `README` или другую документацию о том, как добавить эту библиотеку в приложение.
Пример см. в документации [Angular Material][AngularMaterialMain].

### Типизация библиотек {#library-typings}

Обычно пакеты библиотек включают типизацию в файлах `.d.ts`; примеры см. в `node_modules/@angular/material`.
Если пакет библиотеки не включает типизацию и IDE жалуется, может потребоваться установить пакет `@types/<lib_name>` вместе с библиотекой.

Например, предположим, есть библиотека с именем `d3`:

```shell

npm install d3 --save
npm install @types/d3 --save-dev

```

Типы, определённые в пакете `@types/` для библиотеки, установленной в workspace, автоматически добавляются в конфигурацию TypeScript проекта, использующего эту библиотеку.
TypeScript по умолчанию ищет типы в каталоге `node_modules/@types`, поэтому не нужно добавлять каждый пакет типов отдельно.

Если у библиотеки нет типизации в `@types/`, её можно использовать, добавив типизацию вручную.
Для этого:

1. Создайте файл `typings.d.ts` в каталоге `src/`.
   Этот файл автоматически включается как глобальное определение типов.

1. Добавьте следующий код в `src/typings.d.ts`:

   ```ts
   declare module 'host' {
     export interface Host {
       protocol?: string;
       hostname?: string;
       pathname?: string;
     }
     export function parse(url: string, queryString?: string): Host;
   }
   ```

1. В компоненте или файле, использующем библиотеку, добавьте следующий код:

   ```ts
   import * as host from 'host';
   const parsedUrl = host.parse('https://angular.dev');
   console.log(parsedUrl.hostname);
   ```

Определяйте дополнительную типизацию по мере необходимости.

## Обновление библиотек {#updating-libraries}

Библиотека может обновляться издателем, а также имеет отдельные зависимости, которые нужно поддерживать актуальными.
Чтобы проверить обновления установленных библиотек, используйте команду Angular CLI [`ng update`][CliUpdate].

Используйте команду Angular CLI `ng update <lib_name>` для обновления отдельных версий библиотек.
Angular CLI проверяет последний опубликованный релиз библиотеки и, если последняя версия новее установленной, загружает её и обновляет `package.json` в соответствии с последней версией.

При обновлении Angular до новой версии нужно убедиться, что используемые библиотеки актуальны.
Если у библиотек есть взаимные зависимости, их может потребоваться обновлять в определённом порядке.
См. [Angular Update Guide][AngularUpdateMain] для помощи.

## Добавление библиотеки в runtime global scope {#adding-a-library-to-the-runtime-global-scope}

Если устаревшая JavaScript-библиотека не импортируется в приложение, её можно добавить в runtime global scope и загружать так, как если бы она была добавлена в теге script.
Настройте Angular CLI делать это на этапе сборки с помощью опций `scripts` и `styles` цели build в файле конфигурации сборки workspace [`angular.json`][GuideWorkspaceConfig].

Например, чтобы использовать библиотеку [Bootstrap 4][GetbootstrapDocs40GettingStartedIntroduction]

1. Установите библиотеку и связанные зависимости с помощью менеджера пакетов npm:

   ```shell
     npm install jquery --save
     npm install popper.js --save
     npm install bootstrap --save
   ```

1. В файле конфигурации `angular.json` добавьте связанные файлы скриптов в массив `scripts`:

   ```json
     "scripts": [
         "node_modules/jquery/dist/jquery.slim.js",
         "node_modules/popper.js/dist/umd/popper.js",
         "node_modules/bootstrap/dist/js/bootstrap.js"
       ],
   ```

1. Добавьте CSS-файл `bootstrap.css` в массив `styles`:

   ```json
     "styles": [
         "node_modules/bootstrap/dist/css/bootstrap.css",
         "src/styles.css"
     ],
   ```

1. Запустите или перезапустите команду Angular CLI `ng serve`, чтобы увидеть работу Bootstrap 4 в приложении.

### Использование runtime-global библиотек в приложении {#using-runtime-global-libraries-inside-your-app}

После импорта библиотеки через массив «scripts» **не** импортируйте её с помощью import-оператора в TypeScript-коде.
Следующий фрагмент кода — пример import-оператора.

```ts
import * as $ from 'jquery';
```

Если импортировать её через import-операторы, получится две разные копии библиотеки: одна как глобальная библиотека и одна как модуль.
Это особенно плохо для библиотек с плагинами, таких как jQuery, потому что каждая копия включает разные плагины.

Вместо этого выполните команду Angular CLI `npm install @types/jquery`, чтобы загрузить типизацию для библиотеки, а затем следуйте шагам установки библиотеки.
Это даст доступ к глобальным переменным, предоставляемым этой библиотекой.

### Определение типизации для runtime-global библиотек {#defining-typings-for-runtime-global-libraries}

Если у нужной глобальной библиотеки нет глобальной типизации, её можно объявить вручную как `any` в `src/typings.d.ts`.

Например:

```ts
declare var libraryName: any;
```

Некоторые скрипты расширяют другие библиотеки; например, плагины jQuery:

```ts
$('.test').myPlugin();
```

В этом случае установленный `@types/jquery` не включает `myPlugin`, поэтому нужно добавить интерфейс в `src/typings.d.ts`.
Например:

```ts
interface JQuery {
  myPlugin(options?: any): any;
}
```

Если не добавить интерфейс для расширения, определённого скриптом, IDE покажет ошибку:

```text

[TS][Error] Property 'myPlugin' does not exist on type 'JQuery'

```

[CliUpdate]: cli/update 'ng update | CLI |Angular'
[GuideNpmPackages]: reference/configs/npm-packages 'Workspace npm dependencies | Angular'
[GuideWorkspaceConfig]: reference/configs/workspace-config 'Angular workspace configuration | Angular'
[Resources]: resources 'Explore Angular Resources | Angular'
[AngularMaterialMain]: https://material.angular.dev 'Angular Material | Angular'
[AngularUpdateMain]: /update-guide 'Angular Update Guide | Angular'
[GetbootstrapDocs40GettingStartedIntroduction]: https://getbootstrap.com/docs/4.0/getting-started/introduction 'Introduction | Bootstrap'
[NpmjsMain]: https://www.npmjs.com 'npm'
[YarnpkgMain]: https://yarnpkg.com ' Yarn'
