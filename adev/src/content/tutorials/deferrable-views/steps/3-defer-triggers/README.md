# Триггеры defer {#defer-triggers}

Хотя параметры `@defer` по умолчанию предоставляют отличные возможности для ленивой загрузки частей компонентов, может возникнуть желание дополнительно настроить поведение отложенной загрузки.

По умолчанию отложенный контент загружается, когда браузер находится в режиме ожидания. Однако вы можете настроить момент загрузки, указав **триггер**. Это позволяет выбрать поведение загрузки, наиболее подходящее для вашего компонента.

Откладываемые представления предлагают два типа триггеров загрузки:

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
        Условие в виде выражения, которое проверяется на истинность. Когда выражение истинно, заполнитель заменяется лениво загруженным контентом.<br/>
        Например: <code>@defer (when customizedCondition)</code>
      </td>
    </tr>
  </table>
</div>

Если условие `when` принимает значение `false`, блок `defer` не возвращается обратно к заполнителю. Замена — это одноразовая операция.

Вы можете определить несколько триггеров событий одновременно; они будут вычисляться как условия OR.

- Пример: `@defer (on viewport; on timer(2s))`
- Пример: `@defer (on viewport; when customizedCondition)`

В этом упражнении вы узнаете, как использовать триггеры для указания условия загрузки откладываемых представлений.

<hr>

<docs-workflow>

<docs-step title="Добавьте триггер `on hover`">
В вашем `app.ts` добавьте триггер `on hover` в блок `@defer`.

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

Теперь страница не будет отображать раздел комментариев до тех пор, пока вы не наведёте курсор на его заполнитель.
</docs-step>

<docs-step title="Добавьте кнопку 'Show all comments'">
Далее обновите шаблон, добавив кнопку с надписью «Show all comments». Включите переменную шаблона `#showComments` вместе с кнопкой.

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

ПРИМЕЧАНИЕ: подробнее о [переменных шаблона см. в документации](/guide/templates/variables#declaring-a-template-reference-variable).

</docs-step>

<docs-step title="Добавьте триггер `on interaction`">
Обновите блок `@defer` в шаблоне, чтобы использовать триггер `on interaction`. Передайте переменную шаблона `showComments` в качестве параметра `interaction`.

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

С этими изменениями страница будет ожидать одного из следующих условий перед отображением раздела комментариев:

- Пользователь наводит курсор на заполнитель раздела комментариев
- Пользователь нажимает кнопку «Show all comments»

Вы можете перезагрузить страницу, чтобы попробовать различные триггеры для отображения раздела комментариев.
</docs-step>
</docs-workflow>

Если вы хотите узнать больше, ознакомьтесь с документацией по [откладываемым представлениям](/guide/templates/defer).
Продолжайте учиться, чтобы открыть для себя ещё больше замечательных возможностей Angular.
