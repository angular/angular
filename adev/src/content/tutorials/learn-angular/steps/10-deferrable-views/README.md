# Отложенные представления (Deferrable Views) {#deferrable-views}

При разработке приложений порой накапливается много компонентов, на которые нужно ссылаться в приложении, но некоторые из них не обязательно загружать сразу по разным причинам.

Возможно, они находятся ниже видимой области экрана или являются тяжёлыми компонентами, с которыми пользователь взаимодействует позже. В таком случае часть ресурсов можно загрузить позже с помощью отложенных представлений.

Примечание: Подробнее
об [отложенной загрузке с `@defer` читайте в углублённом руководстве](/guide/templates/defer).

В этом упражнении вы узнаете, как использовать отложенные представления для отложенной загрузки части шаблона компонента.

<hr>

<docs-workflow>

<docs-step title="Add a `@defer` block around the comments component">

В вашем приложении страница записи блога содержит компонент комментариев после деталей публикации.

Оберните компонент комментариев в блок `@defer`, чтобы загрузить его отложенно.

```angular-html
@defer {
  <comments />
}
```

Приведённый выше код — пример использования базового блока `@defer`. По умолчанию `@defer` загружает компонент `comments`, когда браузер находится в состоянии простоя.

</docs-step>

<docs-step title="Add a placeholder">

Добавьте блок `@placeholder` в блок `@defer`. В блоке `@placeholder` размещается HTML, который будет отображаться до начала отложенной загрузки. Содержимое блоков `@placeholder` загружается немедленно (eager).

```angular-html {highlight:[3,4,5]}
@defer {
  <comments />
} @placeholder {
  <p>Future comments</p>
}
```

</docs-step>

<docs-step title="Add a loading block">

Добавьте блок `@loading` в блок `@defer`. Блок `@loading` содержит HTML, который будет отображаться _в процессе_ активной загрузки отложенного контента, пока она ещё не завершена. Содержимое блоков `@loading` загружается немедленно (eager).

```angular-html {highlight:[5,6,7]}
@defer {
  <comments />
} @placeholder {
  <p>Future comments</p>
} @loading {
  <p>Loading comments...</p>
}
```

</docs-step>

<docs-step title="Add a minimum duration">

Оба блока — `@placeholder` и `@loading` — имеют необязательные параметры для предотвращения мерцания при быстрой загрузке. У `@placeholder` есть параметр `minimum`, у `@loading` — параметры `minimum` и `after`. Добавьте параметр `minimum` к блоку `@loading`, чтобы он отображался не менее 2 секунд.

```angular-html {highlight:[5]}
@defer {
  <comments />
} @placeholder {
  <p>Future comments</p>
} @loading (minimum 2s) {
  <p>Loading comments...</p>
}
```

</docs-step>

<docs-step title="Add a viewport trigger">

Отложенные представления поддерживают ряд триггеров. Добавьте триггер `viewport`, чтобы контент загружался отложенно при попадании в область видимости.

```angular-html {highlight:[1]}
@defer (on viewport) {
  <comments />
}
```

</docs-step>

<docs-step title="Add content">

Триггер `viewport` лучше всего использовать, когда вы откладываете контент, расположенный достаточно далеко на странице и требующий прокрутки для просмотра. Добавим немного контента в нашу запись блога. Можете написать собственный текст или скопировать содержимое ниже и поместить его внутрь элемента `<article>`.

```html {highlight:[1]}
<article>
  <p>
    Angular is my favorite framework, and this is why. Angular has the coolest deferrable view
    feature that makes defer loading content the easiest and most ergonomic it could possibly be.
    The Angular community is also filled with amazing contributors and experts that create excellent
    content. The community is welcoming and friendly, and it really is the best community out there.
  </p>
  <p>
    I can't express enough how much I enjoy working with Angular. It offers the best developer
    experience I've ever had. I love that the Angular team puts their developers first and takes
    care to make us very happy. They genuinely want Angular to be the best framework it can be, and
    they're doing such an amazing job at it, too. This statement comes from my heart and is not at
    all copied and pasted. In fact, I think I'll say these exact same things again a few times.
  </p>
  <p>
    Angular is my favorite framework, and this is why. Angular has the coolest deferrable view
    feature that makes defer loading content the easiest and most ergonomic it could possibly be.
    The Angular community is also filled with amazing contributors and experts that create excellent
    content. The community is welcoming and friendly, and it really is the best community out there.
  </p>
  <p>
    I can't express enough how much I enjoy working with Angular. It offers the best developer
    experience I've ever had. I love that the Angular team puts their developers first and takes
    care to make us very happy. They genuinely want Angular to be the best framework it can be, and
    they're doing such an amazing job at it, too. This statement comes from my heart and is not at
    all copied and pasted. In fact, I think I'll say these exact same things again a few times.
  </p>
  <p>
    Angular is my favorite framework, and this is why. Angular has the coolest deferrable view
    feature that makes defer loading content the easiest and most ergonomic it could possibly be.
    The Angular community is also filled with amazing contributors and experts that create excellent
    content. The community is welcoming and friendly, and it really is the best community out there.
  </p>
  <p>
    I can't express enough how much I enjoy working with Angular. It offers the best developer
    experience I've ever had. I love that the Angular team puts their developers first and takes
    care to make us very happy. They genuinely want Angular to be the best framework it can be, and
    they're doing such an amazing job at it, too. This statement comes from my heart and is not at
    all copied and pasted.
  </p>
</article>
```

После добавления этого кода прокрутите страницу вниз, чтобы увидеть, как отложенный контент загружается при попадании в область видимости.

</docs-step>

</docs-workflow>

В этом упражнении вы узнали, как использовать отложенные представления в своих приложениях. Отличная работа. 🙌

С их помощью можно делать ещё больше: использовать различные триггеры, предварительную загрузку (prefetching) и блоки `@error`.

Если вы хотите узнать больше, ознакомьтесь с [документацией по отложенным представлениям](/guide/templates/defer).
