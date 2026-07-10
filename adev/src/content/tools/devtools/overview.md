# Обзор DevTools

Angular DevTools — расширение браузера, предоставляющее возможности отладки и профилирования для Angular-приложений.

<docs-video src="https://www.youtube.com/embed/bavWOHZM6zE"/>

Установите Angular DevTools из [Chrome Web Store](https://chrome.google.com/webstore/detail/angular-developer-tools/ienfalfjdbdpebioblfackkekamfmbnh) или из [Firefox Addons](https://addons.mozilla.org/firefox/addon/angular-devtools/).

Открыть Chrome или Firefox DevTools на любой веб-странице можно, нажав <kbd>F12</kbd> или <kbd><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>I</kbd></kbd> (Windows или Linux) и <kbd><kbd>Fn</kbd>+<kbd>F12</kbd></kbd> или <kbd><kbd>Cmd</kbd>+<kbd>Option</kbd>+<kbd>I</kbd></kbd> (Mac).
После открытия DevTools браузера и установки Angular DevTools его можно найти на вкладке «Angular».

HELPFUL: Страница новой вкладки Chrome не запускает установленные расширения, поэтому вкладка Angular не появится в DevTools. Откройте любую другую страницу, чтобы увидеть её.

<img src="assets/images/guide/devtools/devtools.png" alt="Обзор Angular DevTools с деревом компонентов приложения.">

## Открытие приложения {#open-your-application}

При открытии расширения вы увидите четыре дополнительные вкладки:

| Вкладки                                      | Подробности                                                                                                                |
| :---------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| [Components](tools/devtools/component)    | Позволяет исследовать компоненты и директивы в приложении, а также просматривать или редактировать их состояние.                    |
| [Profiler](tools/devtools/profiler)       | Позволяет профилировать приложение и понять, где узкое место производительности при выполнении обнаружения изменений. |
| [Injector Tree](tools/devtools/injectors) | Позволяет визуализировать иерархию Environment и Element Injector                                                      |
| [Router Tree](tools/devtools/router)      | Позволяет визуализировать дерево маршрутизации приложения.                                                               |

Другие вкладки, например `Transfer State`, экспериментальны, включаются в настройках DevTools и пока не документированы.

HELPFUL: Пользователям браузеров на базе Chromium может быть интересна [интеграция с панелью Performance](/best-practices/profiling-with-chrome-devtools).

<img src="assets/images/guide/devtools/devtools-tabs.png" alt="Скриншот верхней части Angular DevTools с двумя вкладками в левом верхнем углу: «Components» и «Profiler».">

В правом верхнем углу Angular DevTools находится кнопка информации, открывающая всплывающее окно.
Во всплывающем окне, среди прочего, указаны версия Angular, работающая на странице, и версия DevTools.

### Angular-приложение не обнаружено {#angular-application-not-detected}

Если при открытии Angular DevTools появляется сообщение об ошибке «Angular application not detected», это означает, что расширение не может связаться с Angular-приложением на странице.
Самая частая причина — на проверяемой веб-странице нет Angular-приложения.
Убедитесь, что вы проверяете нужную страницу и что Angular-приложение запущено.

### Обнаружено приложение, собранное с production-конфигурацией {#we-detected-an-application-built-with-production-configuration}

Если появляется сообщение об ошибке «We detected an application built with production configuration. Angular DevTools only supports development builds.», это означает, что Angular-приложение на странице найдено, но оно скомпилировано с production-оптимизациями.
При компиляции для production Angular CLI удаляет различные возможности отладки, чтобы минимизировать объём JavaScript на странице и улучшить производительность. В том числе удаляются возможности, необходимые для связи с DevTools.

Чтобы запустить DevTools, нужно скомпилировать приложение с отключёнными оптимизациями. `ng serve` делает это по умолчанию.
Если нужно отладить развёрнутое приложение, отключите оптимизации в сборке с помощью [опции конфигурации `optimization`](reference/configs/workspace-config#optimization-configuration) (`{"optimization": false}`).
