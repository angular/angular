# Триггеры отложенной загрузки

Хотя настройки по умолчанию для `@defer` предлагают отличные возможности для ленивой загрузки частей ваших компонентов,
может возникнуть необходимость в дополнительной настройке процесса отложенной загрузки.

По умолчанию отложенный контент загружается, когда браузер находится в состоянии простоя (idle). Однако вы можете
настроить момент загрузки, указав **триггер**. Это позволяет выбрать поведение загрузки, которое лучше всего подходит
для вашего компонента.

Откладываемые представления предлагают два типа триггеров загрузки:

<div class="docs-table docs-scroll-track-transparent">
  <table>
    <tr>
      <td><code>on</code></td>
      <td>
        Условие срабатывания, использующее триггер из списка встроенных триггеров.<br/>
        Например: <code>@defer (on viewport)</code>
      </td>
    </tr>
    <tr>
      <td><code>when</code></td>
      <td>
        Условие в виде выражения, которое проверяется на истинность. Когда выражение становится истинным (truthy), плейсхолдер заменяется лениво загруженным контентом.<br/>
        Например: <code>@defer (when customizedCondition)</code>
      </td>
    </tr>
  </table>
</div>

Если условие `when` становится ложным (`false`), блок `defer` не возвращается обратно к плейсхолдеру. Замена — это
одноразовая операция.

Вы можете определить несколько триггеров событий одновременно; эти триггеры будут оцениваться как условия ИЛИ (OR).

- Пример: `@defer (on viewport; on timer(2s))`
- Пример: `@defer (on viewport; when customizedCondition)`

В этом упражнении вы узнаете, как использовать триггеры для задания условий загрузки откладываемых представлений.

<hr>

<docs-workflow>

<docs-step title="Добавьте триггер `on hover`">
В вашем `app.ts` добавьте триггер `on hover` к блоку `@defer`.

<docs-code language="angular-html" hightlight="[1]">
@defer (on hover) {
  <article-comments />
} @placeholder (minimum 1s) {
  <p>Placeholder for comments</p>
} @loading (minimum 1s; after 500ms) {
  <p>Loading comments...</p>
} @error {
  <p>Failed to load comments</p>
}
</docs-code>

Теперь страница не будет отображать раздел комментариев, пока вы не наведете курсор на его плейсхолдер.
</docs-step>

<docs-step title="Добавьте кнопку 'Show all comments'">
Далее обновите шаблон, добавив кнопку с надписью "Show all comments". Добавьте к кнопке переменную шаблона `#showComments`.

<docs-code language="angular-html" hightlight="[1]">
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
</docs-code>

ПРИМЕЧАНИЕ: для получения дополнительной информации
о [переменных шаблона ознакомьтесь с документацией](https://angular.dev/guide/templates/reference-variables#).

</docs-step>

<docs-step title="Добавьте триггер `on interaction`">
Обновите блок `@defer` в шаблоне, чтобы использовать триггер `on interaction`. Передайте переменную шаблона `showComments` в качестве параметра для `interaction`.

<docs-code language="angular-html" hightlight="[3]">
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
</docs-code>

С этими изменениями страница будет ожидать выполнения одного из следующих условий перед отображением раздела
комментариев:

- Пользователь наводит курсор на плейсхолдер раздела комментариев
- Пользователь нажимает на кнопку "Show all comments"

Вы можете перезагрузить страницу, чтобы попробовать разные триггеры для отображения раздела комментариев.
</docs-step>
</docs-workflow>

Если вы хотите узнать больше, ознакомьтесь с документацией
по [Откладываемым представлениям](https://angular.dev/guide/defer).
Продолжайте обучение, чтобы открыть для себя больше замечательных возможностей Angular.
