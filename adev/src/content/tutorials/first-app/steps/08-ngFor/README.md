# Использование @for для вывода списка объектов в компоненте

В этом уроке показано, как использовать блок `@for` в шаблонах Angular для отображения динамически повторяющихся данных.

<docs-video src="https://www.youtube.com/embed/eM3zi_n7lNs?si=MIl5NcRxvcLjYt5f&amp;start=477"/>

ПРИМЕЧАНИЕ: В этом видео используется старый синтаксис, но основные концепции остаются актуальными.

## Чему вы научитесь

- Вы добавите набор данных в приложение.
- Ваше приложение будет отображать список элементов из нового набора данных, используя `@for`.

## Концептуальный обзор `@for`

В Angular `@for` — это особый тип [блока управления потоком](/guide/templates/control-flow), используемый для
динамического повторения данных в шаблоне. В чистом JavaScript вы бы использовали цикл for — `@for` предоставляет
аналогичную функциональность для шаблонов Angular.

Вы можете использовать `@for` для перебора массивов и даже асинхронных значений. В этом уроке вы добавите новый массив
данных для перебора.

Для более подробного объяснения обратитесь к руководству
по [управлению потоком](guide/templates/control-flow#repeat-content-with-the-for-block).

<docs-workflow>

<docs-step title="Добавление данных о жилье в `Home`">

В `Home` сейчас есть только один объект жилья. В этом шаге вы добавите массив записей `HousingLocation`.

1. В `src/app/home/home.ts` удалите свойство `housingLocation` из класса `Home`.
1. Обновите класс `Home`, добавив свойство `housingLocationList`. Обновите свой код, чтобы он соответствовал следующему:
   <docs-code language="angular-ts"  header="Add housingLocationList property in home.ts" path="adev/src/content/tutorials/first-app/steps/09-services/src/app/home/home.ts" visibleLines="26-131"/>

   ВАЖНО: Не удаляйте декоратор `@Component`, вы обновите этот код в следующем шаге.

</docs-step>

<docs-step title="Обновление шаблона `Home` для использования `@for`">
Теперь в приложении есть набор данных, который можно использовать для отображения записей в браузере с помощью блока `@for`.

1. Обновите тег `<app-housing-location>` в коде шаблона следующим образом:
   <docs-code language="angular-ts"  header="Add @for to Home template in home.ts" path="adev/src/content/tutorials/first-app/steps/09-services/src/app/home/home.ts" visibleLines="[15,19]"/>

   Обратите внимание, что в коде `[housingLocation] = "housingLocation"` значение `housingLocation` теперь относится к
   переменной, используемой в блоке `@for`. До этого изменения оно ссылалось на свойство класса `Home`.

1. Сохраните все изменения.

1. Обновите страницу в браузере и убедитесь, что приложение теперь отображает сетку объектов жилья.

<section class="lightbox">
<img alt="окно браузера с приложением homes-app, отображающее логотип, текстовое поле фильтра, кнопку поиска и сетку карточек жилья" src="assets/images/tutorials/first-app/homes-app-lesson-08-step-2.png">
</section>

</docs-step>

</docs-workflow>

РЕЗЮМЕ: В этом уроке вы использовали блок `@for` для динамического повторения данных в шаблонах Angular. Вы также
добавили новый массив данных для использования в приложении Angular. Приложение теперь динамически отображает список
объектов жилья в браузере.

Приложение обретает форму, отличная работа.

Для получения дополнительной информации по темам, затронутым в этом уроке, посетите:

<docs-pill-row>
  <docs-pill href="guide/templates/control-flow" title="Блоки управления потоком"/>
  <docs-pill href="guide/templates/control-flow#repeat-content-with-the-for-block" title="Руководство по @for"/>
  <docs-pill href="/api/core/@for" title="@for"/>
</docs-pill-row>
