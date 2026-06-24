# Создание компонента Home

В этом уроке показано, как создать новый [компонент](guide/components) для вашего приложения Angular.

<docs-video src="https://www.youtube.com/embed/R0nRX8jD2D0?si=OMVaw71EIa44yIOJ"/>

## Чему вы научитесь

В вашем приложении появится новый компонент: `Home`.

## Концептуальный обзор компонентов Angular

Приложения Angular строятся на основе компонентов, которые являются строительными блоками Angular.
Компоненты содержат код, HTML-разметку и CSS-стили, определяющие функции и внешний вид элемента в приложении.
В Angular компоненты могут содержать другие компоненты. Функции и внешний вид приложения могут быть разделены и
распределены по компонентам.

В Angular компоненты имеют метаданные, определяющие их свойства.
При создании компонента `Home` вы используете следующие свойства:

- `selector`: описывает, как Angular обращается к компоненту в шаблонах.
- `standalone`: описывает, является ли компонент standalone-компонентом (не требует `NgModule`).
- `imports`: описывает зависимости компонента.
- `template`: описывает HTML-разметку и макет компонента.
- `styleUrls`: перечисляет URL-адреса CSS-файлов, используемых компонентом, в виде массива.

<docs-pill-row>
  <docs-pill href="api/core/Component" title="Подробнее о компонентах"/>
</docs-pill-row>

<docs-workflow>

<docs-step title="Создание компонента `Home`">
На этом этапе вы создадите новый компонент для вашего приложения.

На панели **Terminal** вашей IDE:

1. В директории вашего проекта перейдите в папку `first-app`.
1. Выполните следующую команду, чтобы создать новый компонент `Home`:

   ```shell
   ng generate component home
   ```

1. Выполните эту команду для сборки и запуска приложения.

   ПРИМЕЧАНИЕ: Этот шаг предназначен только для вашей локальной среды!

   ```shell
   ng serve
   ```

1. Откройте браузер и перейдите по адресу `http://localhost:4200`, чтобы увидеть приложение.

1. Убедитесь, что приложение собирается без ошибок.

   ПОЛЕЗНО: Оно должно выглядеть так же, как и в предыдущем уроке, потому что, хотя вы и добавили новый компонент, вы
   еще не включили его ни в один из шаблонов приложения.

1. Оставьте `ng serve` запущенным, пока выполняете следующие шаги.
   </docs-step>

<docs-step title="Добавление нового компонента в макет приложения">
На этом этапе вы добавите новый компонент `Home` в корневой компонент приложения `App`, чтобы он отображался в макете вашего приложения.

На панели **Edit** вашей IDE:

1. Откройте файл `app.ts` в редакторе.
1. В `app.ts` импортируйте `Home`, добавив эту строку к импортам на уровне файла.

<docs-code header="Импорт Home в src/app/app.ts" path="adev/src/content/tutorials/first-app/steps/03-HousingLocation/src/app/app.ts" visibleLines="[2]"/>

1. В `app.ts`, внутри `@Component`, обновите свойство массива `imports` и добавьте `Home`.

<docs-code header="Замена в src/app/app.ts" path="adev/src/content/tutorials/first-app/steps/03-HousingLocation/src/app/app.ts" visibleLines="[6]"/>

1. В `app.ts`, внутри `@Component`, обновите свойство `template`, включив следующий HTML-код.

<docs-code language="angular-ts" header="Замена в src/app/app.ts" path="adev/src/content/tutorials/first-app/steps/03-HousingLocation/src/app/app.ts" visibleLines="[7,16]"/>

1. Сохраните изменения в `app.ts`.
1. Если `ng serve` запущен, приложение должно обновиться.
   Если `ng serve` не запущен, запустите его снова.
   Текст _Hello world_ в вашем приложении должен смениться на _home works!_ из компонента `Home`.
1. Проверьте запущенное приложение в браузере и убедитесь, что оно обновилось.

<img alt="browser frame of page displaying the text 'home works!'" src="assets/images/tutorials/first-app/homes-app-lesson-02-step-2.png">

</docs-step>

<docs-step title="Добавление функциональности в `Home`">

На этом этапе вы добавите функциональность в `Home`.

На предыдущем этапе вы добавили стандартный компонент `Home` в шаблон приложения, поэтому в приложении появился его HTML
по умолчанию.
Теперь вы добавите поисковый фильтр и кнопку, которые будут использоваться в следующем уроке.
На данный момент это всё, что есть в `Home`.
Обратите внимание, что этот шаг просто добавляет элементы поиска в макет, пока без какой-либо функциональности.

На панели **Edit** вашей IDE:

1. В директории `first-app` откройте файл `home.ts` в редакторе.
1. В `home.ts`, внутри `@Component`, обновите свойство `template` следующим кодом.

<docs-code language="angular-ts" header="Замена в src/app/home/home.ts" path="adev/src/content/tutorials/first-app/steps/03-HousingLocation/src/app/home/home.ts" visibleLines="[5,12]"/>

1. Затем откройте `home.css` в редакторе и обновите содержимое следующими стилями.

   ПРИМЕЧАНИЕ: В браузере (в онлайн-редакторе) они могут находиться в `src/app/home/home.ts` в массиве `styles`.

   <docs-code header="Замена в src/app/home/home.css" path="adev/src/content/tutorials/first-app/steps/03-HousingLocation/src/app/home/home.css"/>

1. Убедитесь, что приложение собирается без ошибок.
   Вы должны увидеть поле фильтра и кнопку в вашем приложении, и они должны быть стилизованы.
   Исправьте любые ошибки, прежде чем переходить к следующему шагу.

<img alt="browser frame of homes-app displaying logo, filter text input box and search button" src="assets/images/tutorials/first-app/homes-app-lesson-02-step-3.png">
</docs-step>

</docs-workflow>

РЕЗЮМЕ: В этом уроке вы создали новый компонент для вашего приложения и добавили в него элемент управления фильтром и
кнопку.

Для получения дополнительной информации по темам, затронутым в этом уроке, посетите:

<docs-pill-row>
  <docs-pill href="cli/generate/component" title="`ng generate component`"/>
  <docs-pill href="api/core/Component" title="Справочник `Component`"/>
  <docs-pill href="guide/components" title="Обзор компонентов Angular"/>
</docs-pill-row>
