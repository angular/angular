# Триггеры defer {#defer-triggers}

Хотя настройки `@defer` по умолчанию предлагают отличные возможности для отложенной загрузки частей компонентов, иногда
может потребоваться дополнительная настройка поведения загрузки.

По умолчанию отложенный контент загружается, когда браузер находится в состоянии простоя. Однако вы можете настроить
момент загрузки, указав **триггер**. Это позволяет выбрать поведение загрузки, наиболее подходящее для вашего компонента.

Откладываемые представления поддерживают два типа триггеров загрузки:

<div class="docs-table docs-scroll-track-transparent">
  <table>
    <tr>
      <td><code>on</code></td>
      <td>
        Условие триггера, использующее один из встроенных триггеров.<br/>
        Например: <code>@defer (on viewport)</code>
      </td>
    </tr>
    <tr>
      <td><code>when</code></td>
      <td>
        Условие в виде выражения, которое вычисляется на истинность. Когда выражение истинно, заполнитель заменяется
        лениво загруженным контентом.<br/>
        Например: <code>@defer (when customizedCondition)</code>
      </td>
    </tr>
  </table>
</div>

Если условие `when` принимает значение `false`, блок `defer` не возвращается к заполнителю. Замена выполняется
единожды.

Вы можете определить несколько триггеров событий одновременно — они будут вычисляться как условия ИЛИ.

- Пример: `@defer (on viewport; on timer(2s))`
- Пример: `@defer (on viewport; when customizedCondition)`

В этом упражнении вы узнаете, как использовать триггеры для задания условий загрузки откладываемых представлений.

<hr>

<docs-workflow>

<docs-step title="Добавление триггера `on hover`">
В файле `app.ts` добавьте триггер `on hover` к блоку `@defer`.

```angular-html {highlight:[1]}
@defer (on hover) {
  <article-comments />
} @placeholder (minimum 1s) {
  <p>Placeholder for comments</p>
} @loading (minimum 1s; after 500ms) {
  <p>Loading comments...</p>
} @error {
  <p>Failed to load comments</p>
}
```

Теперь страница не будет отображать секцию комментариев до тех пор, пока вы не наведёте курсор на заполнитель.
</docs-step>

<docs-step title="Добавление кнопки 'Показать все комментарии'">
Затем обновите шаблон, добавив кнопку с надписью «Show all comments». Добавьте к кнопке переменную шаблона
`#showComments`.

```angular-html {highlight:[1]}
<button type="button" #showComments>Show all comments</button>

@defer (on hover) {
  <article-comments />
} @placeholder (minimum 1s) {
  <p>Placeholder for comments</p>
} @loading (minimum 1s; after 500ms) {
  <p>Loading comments...</p>
} @error {
  <p>Failed to load comments</p>
}
```

ПРИМЕЧАНИЕ: подробнее о [переменных шаблона можно прочитать в документации](/guide/templates/variables#declaring-a-template-reference-variable).

</docs-step>

<docs-step title="Добавление триггера `on interaction`">
Обновите блок `@defer` в шаблоне, добавив триггер `on interaction`. Передайте переменную шаблона `showComments` в
качестве параметра для `interaction`.

```angular-html {highlight:[3]}
<button type="button" #showComments>Show all comments</button>

@defer (on hover; on interaction(showComments)) {
  <article-comments />
} @placeholder (minimum 1s) {
  <p>Placeholder for comments</p>
} @loading (minimum 1s; after 500ms) {
  <p>Loading comments...</p>
} @error {
  <p>Failed to load comments</p>
}
```

После этих изменений страница будет ожидать одного из следующих условий перед отображением секции комментариев:

- пользователь наводит курсор на заполнитель секции комментариев;
- пользователь нажимает кнопку «Show all comments».

Вы можете перезагрузить страницу и попробовать различные триггеры для отображения секции комментариев.
</docs-step>
</docs-workflow>

Если вы хотите узнать больше, ознакомьтесь с документацией по [откладываемым представлениям](/guide/templates/defer).
Продолжайте изучение, чтобы открыть для себя другие полезные возможности Angular.
