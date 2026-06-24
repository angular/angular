# Использование библиотек Angular из npm

При создании приложения Angular используйте преимущества продвинутых библиотек от разработчиков фреймворка (
first-party), а также богатую экосистему сторонних библиотек.
[Angular Material][AngularMaterialMain] — пример такой библиотеки от команды Angular.

## Установка библиотек

Библиотеки публикуются как [npm-пакеты][GuideNpmPackages], обычно вместе со схематиками (schematics), которые
интегрируют их с Angular CLI.
Чтобы интегрировать переиспользуемый код библиотеки в приложение, необходимо установить пакет и импортировать
предоставляемую функциональность там, где вы её используете.
Для большинства опубликованных библиотек Angular используйте команду Angular CLI `ng add <lib_name>`.

Команда `ng add` использует менеджер пакетов для установки библиотеки и запускает включенные в пакет схематики для
настройки кода проекта.
Примеры менеджеров пакетов: [npm][NpmjsMain] или [yarn][YarnpkgMain].
Дополнительная настройка кода проекта может включать добавление операторов импорта, шрифтов и тем.

Опубликованная библиотека обычно содержит файл `README` или другую документацию о том, как добавить эту библиотеку в
приложение.
Пример см. в документации [Angular Material][AngularMaterialMain].

### Типизация библиотек

Обычно пакеты библиотек включают файлы типизации `.d.ts`; см. примеры в `node_modules/@angular/material`.
Если пакет вашей библиотеки не содержит типизации и IDE выдает ошибку, возможно, потребуется установить пакет
`@types/<lib_name>` вместе с библиотекой.

Например, предположим, что у вас есть библиотека с именем `d3`:

```shell

npm install d3 --save
npm install @types/d3 --save-dev

```

Типы, определенные в пакете `@types/` для установленной в рабочем пространстве библиотеки, автоматически добавляются в
конфигурацию TypeScript проекта, использующего эту библиотеку.
TypeScript по умолчанию ищет типы в каталоге `node_modules/@types`, поэтому вам не нужно добавлять каждый пакет типов
отдельно.

Если для библиотеки нет доступных типов в `@types/`, вы можете использовать её, добавив типизацию вручную.
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

Определите больше типов по мере необходимости.

## Обновление библиотек

Библиотека может обновляться издателем, а также имеет собственные зависимости, которые необходимо поддерживать в
актуальном состоянии.
Для проверки обновлений установленных библиотек используйте команду Angular CLI [`ng update`][CliUpdate].

Используйте команду `ng update <lib_name>` для обновления версий отдельных библиотек.
Angular CLI проверяет последний опубликованный релиз библиотеки и, если он новее установленной версии, загружает его и
обновляет `package.json` в соответствии с последней версией.

При обновлении Angular до новой версии необходимо убедиться, что все используемые библиотеки актуальны.
Если библиотеки имеют взаимозависимости, возможно, придется обновлять их в определенном порядке.
См. [Angular Update Guide][AngularUpdateMain] для получения помощи.

## Добавление библиотеки в глобальную область видимости (runtime global scope)

Если устаревшая JavaScript-библиотека не импортируется в приложение, её можно добавить в глобальную область видимости и
загрузить так, как если бы она была добавлена через тег script.
Настройте Angular CLI для этого на этапе сборки, используя опции `scripts` и `styles` целевой сборки (build target) в
файле конфигурации рабочего пространства [`angular.json`][GuideWorkspaceConfig].

Например, чтобы использовать библиотеку [Bootstrap 4][GetbootstrapDocs40GettingStartedIntroduction]:

1. Установите библиотеку и связанные зависимости с помощью менеджера пакетов npm:

```shell
npm install jquery --save
npm install popper.js --save
npm install bootstrap --save

```

1. В конфигурационном файле `angular.json` добавьте соответствующие файлы скриптов в массив `scripts`:

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

1. Запустите или перезапустите команду `ng serve`, чтобы увидеть работу Bootstrap 4 в вашем приложении.

### Использование глобальных библиотек внутри приложения

После импорта библиотеки с использованием массива "scripts", **не** импортируйте её с помощью оператора `import` в коде
TypeScript.
Следующий фрагмент кода является примером (неправильного) оператора импорта.

```ts

import * as $ from 'jquery';

```

Если вы импортируете её через `import`, у вас будет две разные копии библиотеки: одна импортирована как глобальная
библиотека, а другая — как модуль.
Это особенно плохо для библиотек с плагинами, таких как JQuery, поскольку каждая копия включает разные плагины.

Вместо этого выполните команду `npm install @types/jquery`, чтобы загрузить типизацию для вашей библиотеки, а затем
следуйте шагам установки библиотеки.
Это даст вам доступ к глобальным переменным, предоставляемым этой библиотекой.

### Определение типизации для глобальных библиотек

Если глобальная библиотека, которую нужно использовать, не имеет глобальной типизации, вы можете объявить её вручную как
`any` в файле `src/typings.d.ts`.

Например:

```ts

declare var libraryName: any;

```

Некоторые скрипты расширяют другие библиотеки; например, плагины JQuery:

```ts

$('.test').myPlugin();

```

В этом случае установленный `@types/jquery` не включает `myPlugin`, поэтому нужно добавить интерфейс в
`src/typings.d.ts`.
Например:

```ts

interface JQuery {
  myPlugin(options?: any): any;
}

```

Если не добавить интерфейс для расширения, определенного в скрипте, IDE покажет ошибку:

```text

[TS][Error] Property 'myPlugin' does not exist on type 'JQuery'

```

[CliUpdate]: cli/update 'ng update | CLI |Angular'
[GuideNpmPackages]: reference/configs/npm-packages 'Workspace npm dependencies | Angular'
[GuideWorkspaceConfig]: reference/configs/workspace-config 'Angular workspace configuration | Angular'
[Resources]: resources 'Explore Angular Resources | Angular'
[AngularMaterialMain]: https://material.angular.dev 'Angular Material | Angular'
[AngularUpdateMain]: https://angular.dev/update-guide 'Angular Update Guide | Angular'
[GetbootstrapDocs40GettingStartedIntroduction]: https://getbootstrap.com/docs/4.0/getting-started/introduction 'Introduction | Bootstrap'
[NpmjsMain]: https://www.npmjs.com 'npm'
[YarnpkgMain]: https://yarnpkg.com ' Yarn'
