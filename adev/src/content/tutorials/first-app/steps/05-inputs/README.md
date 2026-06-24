# Add an input parameter to the component

В этом уроке демонстрируется, как создать `input` компонента и использовать его для передачи данных в компонент для
настройки.

<docs-video src="https://www.youtube.com/embed/eM3zi_n7lNs?si=WvRGFSkW_7_zDIFD&amp;start=241"/>

ПРИМЕЧАНИЕ: В этом видео используется старый синтаксис, но основные концепции остаются актуальными.

## Чему вы научитесь

Шаблон `HousingLocation` вашего приложения получит свойство `HousingLocation` для приема входных данных.

## Концептуальный обзор Inputs

[Inputs](api/core/input) (входные свойства) позволяют компонентам определять данные, которые могут быть переданы им из
родительского компонента.

В этом уроке вы определите свойство `input` в компоненте `HousingLocation`, которое позволит настраивать данные,
отображаемые в компоненте.

Узнайте больше в руководствах [Прием данных с помощью свойств input](guide/components/inputs)
и [Пользовательские события с output](guide/components/outputs).

<docs-workflow>

<docs-step title="Импорт функции input()">
В редакторе кода импортируйте вспомогательный метод `input` из `@angular/core` в компонент `HousingLocation`.

<docs-code header="Import input in housing-location.ts" path="adev/src/content/tutorials/first-app/steps/06-property-binding/src/app/housing-location/housing-location.ts" visibleLines="[1]"/>

</docs-step>

<docs-step title="Добавление свойства Input">
Добавьте обязательное свойство с именем `housingLocation` и инициализируйте его с помощью `input.required()`, указав тип `HousingLocationInfo`.

  <docs-code header="Declare the input property in housing-location.ts" path="adev/src/content/tutorials/first-app/steps/06-property-binding/src/app/housing-location/housing-location.ts" visibleLines="[12]"/>

Вам необходимо вызвать метод `required` для `input`, чтобы указать, что родительский компонент обязан предоставить
значение. В нашем примере приложения мы знаем, что это значение будет передаваться всегда — так задумано. Вызов
`.required()` гарантирует, что компилятор TypeScript будет следить за этим и рассматривать свойство как non-nullable (не
допускающее null), когда этот компонент используется в шаблоне.

</docs-step>

<docs-step title="Передача данных во входное свойство">
Отправьте значение `housingLocation` из компонента `Home` в свойство `housingLocation` компонента HousingLocation.

<docs-code language="angular-ts" header="Declare the input property for HousingLocation in home.ts" path="adev/src/content/tutorials/first-app/steps/06-property-binding/src/app/home/home.ts" visibleLines="[16]"/>

</docs-step>

</docs-workflow>

РЕЗЮМЕ: В этом уроке вы создали новое свойство `input`. Вы также использовали метод `.required`, чтобы гарантировать,
что значение Сигнала всегда определено.

<docs-pill-row>
  <docs-pill href="guide/components/inputs" title="Accepting data with input properties"/>
  <docs-pill href="guide/components/outputs" title="Custom events with outputs"/>
</docs-pill-row>
