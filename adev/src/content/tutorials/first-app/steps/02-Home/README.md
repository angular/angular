# Создание компонента Home {#create-home-component}

В этом уроке показано, как создать новый [компонент](guide/components) для вашего приложения Angular.

<docs-video src="https://www.youtube.com/embed/R0nRX8jD2D0?si=OMVaw71EIa44yIOJ"/>

## Чему вы научитесь {#what-youll-learn}

В вашем приложении появится новый компонент: `Home`.

## Концептуальный обзор компонентов Angular {#conceptual-preview-of-angular-components}

Приложения Angular строятся на основе компонентов — строительных блоков Angular.
Компоненты содержат код, HTML-разметку и информацию о стилях CSS, которые определяют функциональность и внешний вид элемента в приложении.
В Angular компоненты могут содержать другие компоненты. Функциональность и внешний вид приложения можно разделить на компоненты.

В Angular компоненты имеют метаданные, определяющие их свойства.
При создании `Home` используются следующие свойства:

- `selector`: описывает, как Angular ссылается на компонент в шаблонах.
- `standalone`: описывает, требует ли компонент `NgModule`.
- `imports`: описывает зависимости компонента.
- `template`: описывает HTML-разметку и структуру компонента.
- `styleUrls`: перечисляет URL CSS-файлов, используемых компонентом, в виде массива.

<docs-pill-row>
  <docs-pill href="api/core/Component" title="Подробнее о компонентах"/>
</docs-pill-row>

<docs-workflow>

<docs-step title="Создайте `Home`">
На этом шаге вы создадите новый компонент для вашего приложения.

В панели **Terminal** вашей IDE:

1. В директории проекта перейдите в папку `first-app`.
1. Выполните эту команду для создания нового компонента `Home`

   ```shell
   ng generate component home
   ```

1. Выполните эту команду для сборки и запуска приложения.

   ПРИМЕЧАНИЕ: Этот шаг предназначен только для локальной среды!

   ```shell
   ng serve
   ```

1. Откройте браузер и перейдите на `http://localhost:4200`, чтобы найти приложение.

1. Убедитесь, что приложение собирается без ошибок.

   ПОЛЕЗНО: Оно должно выглядеть так же, как в предыдущем уроке, поскольку, несмотря на добавление нового компонента, вы ещё не включили его ни в один из шаблонов приложения.

1. Оставьте `ng serve` работающим пока выполняете следующие шаги.
   </docs-step>

<docs-step title="Добавьте новый компонент в макет приложения">
На этом шаге вы добавите новый компонент `Home` в корневой компонент приложения `App`, чтобы он отображался в макете приложения.

В панели **Edit** вашей IDE:

1.  Откройте `app.ts` в редакторе.
1.  В `app.ts` импортируйте `Home`, добавив эту строку к импортам на уровне файла.

      <docs-code header="Import Home in src/app/app.ts" path="adev/src/content/tutorials/first-app/steps/03-HousingLocation/src/app/app.ts" visibleLines="[2]"/>

1.  В `app.ts`, в `@Component`, обновите свойство массива `imports`, добавив `Home`.

      <docs-code header="Replace in src/app/app.ts" path="adev/src/content/tutorials/first-app/steps/03-HousingLocation/src/app/app.ts" visibleLines="[6]"/>

1.  В `app.ts`, в `@Component`, обновите свойство `template`, включив следующий HTML-код.

      <docs-code language="angular-ts" header="Replace in src/app/app.ts" path="adev/src/content/tutorials/first-app/steps/03-HousingLocation/src/app/app.ts" visibleLines="[7,16]"/>

1.  Сохраните изменения в `app.ts`.
1.  Если `ng serve` запущен, приложение должно обновиться.
    Если `ng serve` не запущен, запустите его снова.
    _Hello world_ в вашем приложении должен смениться на _home works!_ из компонента `Home`.
1.  Проверьте запущенное приложение в браузере и убедитесь, что оно обновилось.

  <img alt="окно браузера со страницей, отображающей текст 'home works!'" src="assets/images/tutorials/first-app/homes-app-lesson-02-step-2.png">

</docs-step>

<docs-step title="Добавьте функциональность в `Home`">

На этом шаге вы добавите функциональность в `Home`.

На предыдущем шаге вы добавили компонент `Home` по умолчанию в шаблон приложения, и его HTML по умолчанию появился в приложении.
На этом шаге вы добавите поле поиска и кнопку, которые будут использоваться в последующих уроках.
Пока что это всё, что есть в `Home`.
Обратите внимание, что этот шаг добавляет только элементы поиска в макет без какой-либо функциональности.

Если вы начали с нового проекта Angular вместо загрузки стартового
(ng new): добавьте эти глобальные стили в `src/styles.css`, чтобы кнопка поиска и граница поля ввода были видны:

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
1.  В `home.ts`, в `@Component`, обновите свойство `template` этим кодом.

      <docs-code language="angular-ts" header="Replace in src/app/home/home.ts" path="adev/src/content/tutorials/first-app/steps/03-HousingLocation/src/app/home/home.ts" visibleLines="[5,12]"/>

1.  Далее откройте `home.css` в редакторе и обновите содержимое этими стилями.

    ПРИМЕЧАНИЕ: В браузере их можно разместить в `src/app/home/home.ts` в массиве `styles`.

       <docs-code header="Replace in src/app/home/home.css" path="adev/src/content/tutorials/first-app/steps/03-HousingLocation/src/app/home/home.css"/>

1.  Убедитесь, что приложение собирается без ошибок. В вашем приложении должны появиться поле фильтра и кнопка со стилями. Исправьте все ошибки перед переходом к следующему шагу.

   <img alt="окно браузера с приложением homes-app, отображающим логотип, поле ввода фильтра и кнопку поиска" src="assets/images/tutorials/first-app/homes-app-lesson-02-step-3.png">
</docs-step>

</docs-workflow>

РЕЗЮМЕ: В этом уроке вы создали новый компонент для вашего приложения и добавили в него элемент управления фильтром и кнопку.

Для получения дополнительной информации по темам, затронутым в этом уроке, посетите:

<docs-pill-row>
  <docs-pill href="cli/generate/component" title="`ng generate component`"/>
  <docs-pill href="api/core/Component" title="Справочник `Component`"/>
  <docs-pill href="guide/components" title="Обзор компонентов Angular"/>
</docs-pill-row>
