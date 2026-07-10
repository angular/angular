# Откладываемые представления

Иногда при разработке приложений у вас накапливается множество компонентов, на которые нужно ссылаться, но некоторые из
них по разным причинам не нужно загружать сразу.

Возможно, они находятся за пределами видимой области экрана или являются тяжелыми компонентами, взаимодействие с
которыми происходит позже. В таком случае мы можем загрузить некоторые из этих ресурсов позже с помощью откладываемых
представлений (deferrable views).

Примечание: Подробнее об [отложенной загрузке с помощью @defer читайте в подробном руководстве](/guide/templates/defer).

В этом упражнении вы узнаете, как использовать откладываемые представления для отложенной загрузки части шаблона вашего
компонента.

<hr>

<docs-workflow>

<docs-step title="Add a `@defer` block around the comments component">

В вашем приложении на странице поста блога есть компонент комментариев, расположенный после деталей поста.

Оберните компонент комментариев в блок `@defer`, чтобы загрузить его отложенно.

```angular-html
@defer {
  <comments />
}
```

Приведенный выше код — это пример использования базового блока `@defer`. По умолчанию `@defer` загрузит компонент
`comments`, когда браузер будет в состоянии простоя (idle).

</docs-step>

<docs-step title="Add a placeholder">

Добавьте блок `@placeholder` к блоку `@defer`. В блоке `@placeholder` размещается HTML, который будет отображаться до
начала отложенной загрузки. Контент в блоках `@placeholder` загружается сразу.

<docs-code language="angular-html" highlight="[3,4,5]">
@defer {
  <comments />
} @placeholder {
  <p>Future comments</p>
}
</docs-code>

</docs-step>

<docs-step title="Add a loading block">

Добавьте блок `@loading` к блоку `@defer`. В блоке `@loading` размещается HTML, который будет отображаться _во время_
активной загрузки отложенного контента, пока она еще не завершилась. Контент в блоках `@loading` загружается сразу.

<docs-code language="angular-html" highlight="[5,6,7]">
@defer {
  <comments />
} @placeholder {
  <p>Future comments</p>
} @loading {
  <p>Loading comments...</p>
}
</docs-code>

</docs-step>

<docs-step title="Add a minimum duration">

Секции `@placeholder` и `@loading` имеют необязательные параметры для предотвращения мерцания, возникающего при быстрой
загрузке. У `@placeholder` есть параметр `minimum`, а у `@loading` — `minimum` и `after`. Добавьте длительность
`minimum` к блоку `@loading`, чтобы он отображался не менее 2 секунд.

<docs-code language="angular-html" highlight="[5]">
@defer {
  <comments />
} @placeholder {
  <p>Future comments</p>
} @loading (minimum 2s) {
  <p>Loading comments...</p>
}
</docs-code>

</docs-step>

<docs-step title="Add a viewport trigger">

Откладываемые представления имеют множество вариантов триггеров. Добавьте триггер viewport, чтобы контент загружался
отложенно, как только он попадет в область просмотра.

<docs-code language="angular-html" highlight="[1]">
@defer (on viewport) {
  <comments />
}
</docs-code>

</docs-step>

<docs-step title="Add content">

Триггер viewport лучше всего использовать, когда вы откладываете контент, находящийся достаточно далеко внизу страницы,
до которого нужно прокрутить, чтобы увидеть. Поэтому давайте добавим немного контента в наш пост блога. Вы можете
написать свой собственный текст или скопировать приведенный ниже контент и поместить его внутрь элемента `<article>`.

<docs-code language="html" highlight="[1]">
<article>
  <p>Angular is my favorite framework, and this is why. Angular has the coolest deferrable view feature that makes defer loading content the easiest and most ergonomic it could possibly be. The Angular community is also filled with amazing contributors and experts that create excellent content. The community is welcoming and friendly, and it really is the best community out there.</p>
  <p>I can't express enough how much I enjoy working with Angular. It offers the best developer experience I've ever had. I love that the Angular team puts their developers first and takes care to make us very happy. They genuinely want Angular to be the best framework it can be, and they're doing such an amazing job at it, too. This statement comes from my heart and is not at all copied and pasted. In fact, I think I'll say these exact same things again a few times.</p>
  <p>Angular is my favorite framework, and this is why. Angular has the coolest deferrable view feature that makes defer loading content the easiest and most ergonomic it could possibly be. The Angular community is also filled with amazing contributors and experts that create excellent content. The community is welcoming and friendly, and it really is the best community out there.</p>
  <p>I can't express enough how much I enjoy working with Angular. It offers the best developer experience I've ever had. I love that the Angular team puts their developers first and takes care to make us very happy. They genuinely want Angular to be the best framework it can be, and they're doing such an amazing job at it, too. This statement comes from my heart and is not at all copied and pasted. In fact, I think I'll say these exact same things again a few times.</p>
  <p>Angular is my favorite framework, and this is why. Angular has the coolest deferrable view feature that makes defer loading content the easiest and most ergonomic it could possibly be. The Angular community is also filled with amazing contributors and experts that create excellent content. The community is welcoming and friendly, and it really is the best community out there.</p>
  <p>I can't express enough how much I enjoy working with Angular. It offers the best developer experience I've ever had. I love that the Angular team puts their developers first and takes care to make us very happy. They genuinely want Angular to be the best framework it can be, and they're doing such an amazing job at it, too. This statement comes from my heart and is not at all copied and pasted.</p>
</article>
</docs-code>

После добавления этого кода прокрутите страницу вниз, чтобы увидеть, как отложенный контент загружается при попадании в
область просмотра.

</docs-step>

</docs-workflow>

В этом упражнении вы узнали, как использовать откладываемые представления в ваших приложениях. Отличная работа. 🙌

С ними можно делать еще больше: использовать различные триггеры, предзагрузку и блоки `@error`.

Если вы хотите узнать больше, ознакомьтесь с [документацией по откладываемым представлениям](guide/defer).
