# Обзор DevTools

Angular DevTools — это расширение для браузера, которое предоставляет возможности отладки и профилирования для
приложений Angular.

<docs-video src="https://www.youtube.com/embed/bavWOHZM6zE"/>

Установите Angular DevTools
из [Chrome Web Store](https://chrome.google.com/webstore/detail/angular-developer-tools/ienfalfjdbdpebioblfackkekamfmbnh)
или из [Firefox Addons](https://addons.mozilla.org/firefox/addon/angular-devtools/).

Вы можете открыть Chrome или Firefox DevTools на любой веб-странице, нажав <kbd>F12</kbd> или <kbd><kbd>Ctrl</kbd>+<kbd>
Shift</kbd>+<kbd>I</kbd></kbd> (Windows или Linux) и <kbd><kbd>Fn</kbd>+<kbd>F12</kbd></kbd> или <kbd><kbd>
Cmd</kbd>+<kbd>Option</kbd>+<kbd>I</kbd></kbd> (Mac).
После открытия инструментов разработчика браузера и установки Angular DevTools, вы сможете найти его на вкладке "
Angular".

HELPFUL: На новой вкладке Chrome установленные расширения не запускаются, поэтому вкладка Angular не появится в
DevTools. Перейдите на любую другую страницу, чтобы увидеть её.

<img src="assets/images/guide/devtools/devtools.png" alt="Обзор Angular DevTools, показывающий дерево компонентов приложения.">

## Откройте ваше приложение

При открытии расширения вы увидите три дополнительные вкладки:

| Вкладки                                   | Подробности                                                                                                                            |
| :---------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| [Components](tools/devtools/component)    | Позволяет изучать компоненты и директивы в вашем приложении, а также просматривать или редактировать их состояние.                     |
| [Profiler](tools/devtools/profiler)       | Позволяет профилировать приложение и понимать, где находятся узкие места производительности во время выполнения обнаружения изменений. |
| [Injector Tree](tools/devtools/injectors) | Позволяет визуализировать иерархию Environment Injector и Element Injector.                                                            |

Другие вкладки, такие как `Router Tree` или `Transfer State`, являются экспериментальными; их можно включить в
настройках devtools, и они пока не задокументированы.

HELPFUL: Пользователям браузеров на базе Chromium может быть
интересна [интеграция с панелью Performance](/best-practices/profiling-with-chrome-devtools).

<img src="assets/images/guide/devtools/devtools-tabs.png" alt="Скриншот верхней части Angular DevTools, иллюстрирующий две вкладки в верхнем левом углу: одну с меткой 'Components' и другую с меткой 'Profiler'.">

В правом верхнем углу Angular DevTools находится кнопка информации, открывающая всплывающее окно.
В этом окне, среди прочего, указана версия Angular, запущенная на странице, а также версия devtools.

### Приложение Angular не обнаружено

Если при открытии Angular DevTools вы видите сообщение об ошибке "Angular application not detected" (Приложение Angular
не обнаружено), это означает, что расширение не может установить связь с приложением Angular на странице.
Наиболее частая причина — на проверяемой веб-странице нет приложения Angular.
Убедитесь, что вы проверяете нужную веб-страницу и что приложение Angular запущено.

### Обнаружено приложение, собранное с конфигурацией для продакшена

Если вы видите сообщение об ошибке "We detected an application built with production configuration. Angular DevTools
only supports development builds." (Мы обнаружили приложение, собранное с конфигурацией для продакшена. Angular DevTools
поддерживает только сборки для разработки), это означает, что приложение Angular было найдено на странице, но оно
скомпилировано с оптимизациями для продакшена.
При компиляции для продакшена Angular CLI удаляет различные функции отладки, чтобы минимизировать объем JavaScript на
странице и повысить производительность. Это включает в себя функции, необходимые для связи с DevTools.

Чтобы запустить DevTools, необходимо скомпилировать приложение с отключенными оптимизациями. `ng serve` делает это по
умолчанию.
Если вам нужно отладить развернутое приложение, отключите оптимизации в сборке с помощью [опции конфигурации
`optimization`](reference/configs/workspace-config#optimization-configuration) (`{"optimization": false}`).
