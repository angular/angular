# Триггеры defer

Хотя параметры `@defer` по умолчанию уже дают хорошие варианты ленивой загрузки частей компонентов, иногда нужно дополнительно настроить момент загрузки.

По умолчанию отложенный контент загружается, когда браузер простаивает. Можно изменить момент загрузки, указав **триггер**. Так вы выбираете поведение загрузки, лучше всего подходящее компоненту.

Откладываемые представления поддерживают два типа триггеров загрузки:

| Триггер | Описание                                                                                                                                                                                                    |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `on`    | Условие с триггером из списка встроенных.<br/>Например: `@defer (on viewport)`                                                                                                |
| `when`  | Условие-выражение, проверяемое на истинность. Когда выражение истинно, placeholder заменяется лениво загруженным контентом.<br/>Например: `@defer (when customizedCondition)` |

Если условие `when` становится `false`, блок `defer` не возвращается к placeholder. Замена — одноразовая операция.

Можно задать несколько триггеров событий сразу — они оцениваются как условия OR.

- Пример: `@defer (on viewport; on timer(2s))`
- Пример: `@defer (on viewport; when customizedCondition)`

В этом задании вы научитесь использовать триггеры, чтобы задать условие загрузки откладываемых представлений.

<hr>

<docs-workflow>

<docs-step title="Add `on hover` trigger">
В `app.ts` добавьте триггер `on hover` к блоку `@defer`.

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

Теперь страница не отрендерит секцию комментариев, пока вы не наведёте курсор на её placeholder.
</docs-step>

<docs-step title="Add a 'Show all comments' button">
Далее обновите шаблон: добавьте кнопку с текстом «Show all comments». Добавьте к кнопке template-переменную `#showComments`.

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

NOTE: подробнее о [template-переменных — в документации](/guide/templates/variables#declaring-a-template-reference-variable).

</docs-step>

<docs-step title="Add `on interaction` trigger">
Обновите блок `@defer` в шаблоне, чтобы использовать триггер `on interaction`. Передайте template-переменную `showComments` как параметр `interaction`.

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

С этими изменениями страница дождётся одного из условий, прежде чем отрендерить секцию комментариев:

- пользователь наводит курсор на placeholder секции комментариев;
- пользователь нажимает кнопку «Show all comments».

Можно перезагрузить страницу и попробовать разные триггеры для рендера секции комментариев.
</docs-step>
</docs-workflow>

Чтобы узнать больше, см. документацию по [откладываемым представлениям](/guide/templates/defer).
Продолжайте учиться, чтобы открыть ещё больше возможностей Angular.
