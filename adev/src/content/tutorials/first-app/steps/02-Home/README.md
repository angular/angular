# Создание Компонента Home {#create-home-component}

В этом уроке показано, как создать новый [Компонент](guide/components) для вашего Angular-приложения.

<docs-video src="https://www.youtube.com/embed/R0nRX8jD2D0?si=OMVaw71EIa44yIOJ"/>

## Что вы узнаете {#what-youll-learn}

В вашем приложении появится новый Компонент: `Home`.

## Общее представление о Компонентах Angular {#conceptual-preview-of-angular-components}

Angular-приложения строятся на основе Компонентов, которые являются строительными блоками Angular.
Компоненты содержат код, HTML-разметку и информацию о CSS-стилях, которые обеспечивают функциональность и внешний вид элемента в приложении.
В Angular Компоненты могут содержать другие Компоненты. Функции и внешний вид приложения можно разделить и распределить по Компонентам.

В Angular Компоненты имеют метаданные, определяющие их свойства.
При создании `Home` используются следующие свойства:

- `selector`: описывает, как Angular ссылается на Компонент в Шаблонах.
- `standalone`: описывает, требует ли Компонент наличия `NgModule`.
- `imports`: описывает зависимости Компонента.
- `template`: описывает HTML-разметку и макет Компонента.
- `styleUrls`: перечисляет URL-адреса CSS-файлов, используемых Компонентом, в виде массива.

<docs-pill-row>
  <docs-pill href="api/core/Component" title="Подробнее о Компонентах"/>
</docs-pill-row>

<docs-workflow>

<docs-step title="Создайте `Home`">
На этом шаге вы создаёте новый Компонент для вашего приложения.

В панели **Терминал** вашей IDE:

1. В директории проекта перейдите в директорию `first-app`.
1. Выполните эту команду для создания нового `Home`

   ```shell
   ng generate component home
   ```

1. Выполните эту команду для сборки и запуска приложения.

   NOTE: Этот шаг только для локальной среды!

   ```shell
   ng serve
   ```

1. Откройте браузер и перейдите по адресу `http://localhost:4200`, чтобы найти приложение.

1. Убедитесь, что приложение собирается без ошибок.

   HELPFUL: Приложение должно выглядеть так же, как в предыдущем уроке, потому что несмотря на добавление нового Компонента, вы ещё не включили его ни в один Шаблон приложения.

1. Оставьте `ng serve` запущенным на время выполнения следующих шагов.
   </docs-step>

<docs-step title="Добавьте новый Компонент в макет приложения">
На этом шаге вы добавляете новый Компонент `Home` в корневой Компонент приложения `App`, чтобы он отображался в макете приложения.

В панели **Edit** вашей IDE:

1.  Откройте `app.ts` в редакторе.
1.  В `app.ts` импортируйте `Home`, добавив эту строку в импорты на уровне файла.

      <docs-code header="Import Home in src/app/app.ts" path="adev/src/content/tutorials/first-app/steps/03-HousingLocation/src/app/app.ts" visibleLines="[2]"/>

1.  В `app.ts`, в `@Component`, обновите свойство массива `imports` и добавьте `Home`.

      <docs-code header="Replace in src/app/app.ts" path="adev/src/content/tutorials/first-app/steps/03-HousingLocation/src/app/app.ts" visibleLines="[6]"/>

1.  В `app.ts`, в `@Component`, обновите свойство `template`, включив в него следующий HTML-код.

      <docs-code language="angular-ts" header="Replace in src/app/app.ts" path="adev/src/content/tutorials/first-app/steps/03-HousingLocation/src/app/app.ts" visibleLines="[7,16]"/>

1.  Сохраните изменения в `app.ts`.
1.  Если `ng serve` запущен, приложение должно обновиться.
    Если `ng serve` не запущен, запустите его снова.
    Текст _Hello world_ в приложении должен смениться на _home works!_ из `Home`.
1.  Проверьте работающее приложение в браузере и убедитесь, что приложение обновлено.

  <img alt="browser frame of page displaying the text 'home works!'" src="assets/images/tutorials/first-app/homes-app-lesson-02-step-2.png">

</docs-step>

<docs-step title="Добавьте возможности в `Home`">

На этом шаге вы добавляете возможности в `Home`.

На предыдущем шаге вы добавили `Home` по умолчанию в Шаблон приложения, и его HTML по умолчанию появился в приложении.
На этом шаге вы добавляете фильтр поиска и кнопку, которые используются в более позднем уроке.
Пока это всё, что есть в `Home`.
Обратите внимание, что на этом шаге только добавляются элементы поиска в макет без какой-либо функциональности.

Если вы начали с нового Angular-проекта вместо загрузки стартового
(ng new): добавьте эти глобальные стили в `src/styles.css`, чтобы были видны границы кнопки поиска и поля ввода:

```
:root {
  --primary-color: #605DC8;
  --secondary-color: #8B89E6;
  --accent-color: #e8e7fa;
  --shadow-color: #E8E8E8;
}

button.primary {
  padding: 10px;
  border: solid 1px var(--primary-color);
  background: var(--primary-color);
  color: white;
  border-radius: 8px;
}
```

В панели **Edit** вашей IDE:

1.  В директории `first-app` откройте `home.ts` в редакторе.
1.  В `home.ts`, в `@Component`, обновите свойство `template` следующим кодом.

      <docs-code language="angular-ts" header="Replace in src/app/home/home.ts" path="adev/src/content/tutorials/first-app/steps/03-HousingLocation/src/app/home/home.ts" visibleLines="[5,12]"/>

1.  Затем откройте `home.css` в редакторе и обновите содержимое этими стилями.

    NOTE: В браузере они могут находиться в `src/app/home/home.ts` в массиве `styles`.

       <docs-code header="Replace in src/app/home/home.css" path="adev/src/content/tutorials/first-app/steps/03-HousingLocation/src/app/home/home.css"/>

1.  Убедитесь, что приложение собирается без ошибок. В приложении должны появиться поле фильтра и кнопка в нужном стиле. Исправьте все ошибки перед переходом к следующему шагу.

   <img alt="browser frame of homes-app displaying logo, filter text input box and search button" src="assets/images/tutorials/first-app/homes-app-lesson-02-step-3.png">
</docs-step>

</docs-workflow>

SUMMARY: В этом уроке вы создали новый Компонент для приложения и добавили в него элемент управления редактированием фильтра и кнопку.

Для получения дополнительной информации по темам, рассмотренным в этом уроке, посетите:

<docs-pill-row>
  <docs-pill href="cli/generate/component" title="`ng generate component`"/>
  <docs-pill href="api/core/Component" title="Справочник по `Component`"/>
  <docs-pill href="guide/components" title="Обзор Компонентов Angular"/>
</docs-pill-row>
