# Блоки @loading, @error и @placeholder

Откладываемые представления (deferrable views) позволяют определять контент, который будет показан в различных
состояниях загрузки.

<div class="docs-table docs-scroll-track-transparent">
  <table>
    <tr>
      <td><code>@placeholder</code></td>
      <td>
        По умолчанию блоки defer не рендерят никакого контента до срабатывания триггера. <code>@placeholder</code> — это необязательный блок, объявляющий контент, который нужно показать до загрузки отложенного контента. Angular заменяет заполнитель отложенным контентом после завершения загрузки. Хотя этот блок необязателен, команда Angular рекомендует всегда включать placeholder.
        <a href="https://angular.dev/guide/templates/defer#triggers" target="_blank">
          Подробнее в полной документации по откладываемым представлениям
        </a>
      </td>
    </tr>
    <tr>
      <td><code>@loading</code></td>
      <td>
        Этот необязательный блок позволяет объявить контент, который будет показан во время загрузки любых отложенных зависимостей.
      </td>
    </tr>
    <tr>
      <td><code>@error</code></td>
      <td>
        Этот блок позволяет объявить контент, который будет показан в случае сбоя отложенной загрузки.
      </td>
    </tr>
  </table>
</div>

Содержимое всех вышеперечисленных подблоков загружается сразу (eagerly). Кроме того, некоторые функции требуют наличия
блока `@placeholder`.

В этом упражнении вы узнаете, как использовать блоки `@loading`, `@error` и `@placeholder` для управления состояниями
откладываемых представлений.

<hr>

<docs-workflow>

<docs-step title="Добавление блока `@placeholder`">
В вашем `app.ts` добавьте блок `@placeholder` к блоку `@defer`.

<docs-code language="angular-html" highlight="[3,4,5]">
@defer {
  <article-comments />
} @placeholder {
  <p>Placeholder for comments</p>
}
</docs-code>
</docs-step>

<docs-step title="Настройка блока `@placeholder`">
Блок `@placeholder` принимает необязательный параметр для указания минимального (`minimum`) времени отображения этого заполнителя. Параметр `minimum` указывается в миллисекундах (ms) или секундах (s). Этот параметр существует для предотвращения быстрого мерцания контента заполнителя в случае, если отложенные зависимости загружаются быстро.

<docs-code language="angular-html" highlight="[3,4,5]">
@defer {
  <article-comments />
} @placeholder (minimum 1s) {
  <p>Placeholder for comments</p>
}
</docs-code>
</docs-step>

<docs-step title="Добавление блока `@loading`">
Далее добавьте блок `@loading` в шаблон компонента.

Блок `@loading` принимает два необязательных параметра:

- `minimum`: время, в течение которого этот блок должен отображаться
- `after`: время ожидания после начала загрузки перед показом шаблона загрузки

Оба параметра указываются в миллисекундах (ms) или секундах (s).

Обновите `app.ts`, добавив блок `@loading` с параметром `minimum`, равным `1s`, а также параметром `after` со значением
`500ms`.

<docs-code language="angular-html" highlight="[5,6,7]">
@defer {
  <article-comments />
} @placeholder (minimum 1s) {
  <p>Placeholder for comments</p>
} @loading (minimum 1s; after 500ms) {
  <p>Loading comments...</p>
}
</docs-code>

ПРИМЕЧАНИЕ: в этом примере используются два параметра, разделенные символом `;`.

</docs-step>

<docs-step title="Добавление блока `@error`">
И наконец, добавьте блок `@error` к блоку `@defer`.

<docs-code language="angular-html" highlight="[7,8,9]">
@defer {
  <article-comments />
} @placeholder (minimum 1s) {
  <p>Placeholder for comments</p>
} @loading (minimum 1s; after 500ms) {
  <p>Loading comments...</p>
} @error {
  <p>Failed to load comments</p>
}
</docs-code>
</docs-step>
</docs-workflow>

Поздравляем! Теперь у вас есть хорошее понимание откладываемых представлений. Продолжайте в том же духе, и давайте
перейдем к изучению триггеров.
