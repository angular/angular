# Отложенные представления {#deferrable-views}

В процессе разработки приложения нередко приходится ссылаться на множество Компонентов, часть из которых не нужно загружать сразу по разным причинам.

Возможно, они расположены ниже видимой области или являются тяжёлыми Компонентами, с которыми не взаимодействуют до более позднего момента. В таких случаях можно загружать часть ресурсов позже с помощью отложенных представлений.

NOTE: Подробнее об [отложенной загрузке с @defer в подробном руководстве](/guide/templates/defer).

В этом упражнении вы научитесь использовать отложенные представления для отложенной загрузки раздела Шаблона Компонента.

<hr>

<docs-workflow>

<docs-step title="Оберните Компонент комментариев в блок `@defer`">

В приложении страница записи блога содержит Компонент комментариев после деталей записи.

Оберните Компонент комментариев блоком `@defer` для его отложенной загрузки.

```angular-html
@defer {
  <comments />
}
```

Приведённый выше код является примером использования базового блока `@defer`. По умолчанию `@defer` загрузит Компонент `comments`, когда браузер будет бездействовать.

</docs-step>

<docs-step title="Добавьте заглушку">

Добавьте блок `@placeholder` в блок `@defer`. В блоке `@placeholder` размещается HTML, который будет отображаться до начала отложенной загрузки. Содержимое блоков `@placeholder` загружается немедленно (eagerly).

```angular-html {highlight:[3,4,5]}
@defer {
  <comments />
} @placeholder {
  <p>Future comments</p>
}
```

</docs-step>

<docs-step title="Добавьте блок загрузки">

Добавьте блок `@loading` в блок `@defer`. В блоке `@loading` размещается HTML, который будет отображаться _во время_ активной загрузки отложенного содержимого, но до её завершения. Содержимое блоков `@loading` загружается немедленно (eagerly).

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

<docs-step title="Добавьте минимальную длительность">

Оба раздела `@placeholder` и `@loading` имеют необязательные параметры для предотвращения мерцания при быстрой загрузке. `@placeholder` поддерживает параметр `minimum`, а `@loading` — параметры `minimum` и `after`. Добавьте минимальную длительность `minimum` в блок `@loading`, чтобы он отображался не менее 2 секунд.

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

<docs-step title="Добавьте триггер viewport">

Отложенные представления поддерживают несколько вариантов триггеров. Добавьте триггер viewport, чтобы содержимое загружалось отложенно при попадании в область видимости.

```angular-html {highlight:[1]}
@defer (on viewport) {
  <comments />
}
```

</docs-step>

<docs-step title="Добавьте содержимое">

Триггер viewport лучше всего использовать при откладывании содержимого, расположенного достаточно далеко вниз по странице, чтобы до него нужно было прокручивать. Поэтому добавим немного содержимого в нашу запись блога. Можно написать своё или скопировать содержимое ниже и поместить его внутрь элемента `<article>`.

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

После добавления этого кода прокрутите страницу вниз, чтобы увидеть, как отложенное содержимое загружается при попадании в область видимости.

</docs-step>

</docs-workflow>

В ходе упражнения вы научились использовать отложенные представления в приложениях. Отличная работа!

Возможностей у них значительно больше: разные триггеры, предзагрузка и блоки `@error`.

Для получения дополнительной информации изучите [документацию по отложенным представлениям](/guide/templates/defer).
