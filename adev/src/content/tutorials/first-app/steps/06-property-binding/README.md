# Добавление Привязки свойства в Шаблон Компонента {#add-a-property-binding-to-a-components-template}

В этом уроке показано, как добавить Привязку свойства в Шаблон и использовать её для передачи динамических данных в Компоненты.

<docs-video src="https://www.youtube.com/embed/eM3zi_n7lNs?si=AsiczpWnMz5HhJqB&amp;start=599"/>

## Что вы узнаете {#what-youll-learn}

- В Шаблоне `Home` появятся Привязки данных.
- Данные будут передаваться из `Home` в `HousingLocation`.

## Общее представление об Input {#conceptual-preview-of-inputs}

В этом уроке вы продолжите процесс передачи данных от родительского Компонента дочернему, привязывая данные к этим свойствам в Шаблоне с помощью Привязки свойства.

Привязка свойства позволяет связать переменную с `Input` в Angular-Шаблоне. Данные при этом динамически привязываются к `Input`.

Для получения более подробного объяснения обратитесь к руководству [Привязка свойства](/guide/templates/binding#css-class-and-style-property-bindings).

<docs-workflow>

<docs-step title="Обновите Шаблон `Home`">
На этом шаге добавляется Привязка свойства к тегу `<app-housing-location>`.

В редакторе кода:

1.  Перейдите к `src/app/home/home.ts`
1.  В свойстве `template` декоратора `@Component` обновите код в соответствии со следующим:
    <docs-code language="angular-ts" header="Add housingLocation property binding" path="adev/src/content/tutorials/first-app/steps/07-dynamic-template-values/src/app/home/home.ts" visibleLines="[15,17]"/>

    При добавлении Привязки свойства к тегу Компонента используется синтаксис `[attribute] = "value"`, чтобы уведомить Angular о том, что присвоенное значение следует рассматривать как свойство класса Компонента, а не как строковое значение.

    Значение в правой части — это имя свойства из `Home`.

</docs-step>

<docs-step title="Убедитесь, что код по-прежнему работает">
1.  Сохраните изменения и убедитесь, что приложение не содержит никаких ошибок.
1.  Исправьте все ошибки перед переходом к следующему шагу.
</docs-step>

</docs-workflow>

SUMMARY: В этом уроке вы добавили новую Привязку свойства и передали ссылку на свойство класса. Теперь `HousingLocation` имеет доступ к данным, которые может использовать для настройки отображения Компонента.

Для получения дополнительной информации по темам, рассмотренным в этом уроке, посетите:

<docs-pill-row>
  <docs-pill href="/guide/templates/binding#css-class-and-style-property-bindings" title="Привязка свойства"/>
</docs-pill-row>
