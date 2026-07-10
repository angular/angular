# Поддержание Angular-проектов в актуальном состоянии

Как и веб в целом и вся экосистема, Angular постоянно развивается.
Angular сочетает непрерывные улучшения с сильным акцентом на стабильность и простоту обновлений.
Актуальная версия Angular-приложения даёт доступ к новейшим возможностям, а также к оптимизациям и исправлениям ошибок.

В этом документе собраны материалы и ресурсы, которые помогут поддерживать Angular-приложения и библиотеки в актуальном состоянии.

О политике версионирования и практиках выпуска — включая поддержку, устаревание и график релизов — см. [Версионирование и релизы Angular](reference/releases 'Angular versioning and releases').

HELPFUL: Если вы используете AngularJS, см. [Переход с AngularJS](https://angular.io/guide/upgrade 'Upgrading from AngularJS').
_AngularJS_ — название всех версий Angular v1.x.

## Уведомления о новых релизах {#getting-notified-of-new-releases}

Чтобы получать уведомления о новых релизах, подпишитесь на [@angular](https://x.com/angular '@angular on X') в X (ранее Twitter) или на [блог Angular](https://blog.angular.dev 'Angular blog').

## Новые возможности {#learning-about-new-features}

Что нового? Что изменилось? Самое важное публикуется в [анонсах релизов](https://blog.angular.dev/ 'Angular blog - release announcements') в блоге Angular.

Полный список изменений по версиям см. в [журнале изменений Angular](https://github.com/angular/angular/blob/main/CHANGELOG.md 'Angular change log').

## Проверка версии Angular {#checking-your-version-of-angular}

Чтобы узнать версию Angular в приложении, выполните команду `ng version` из каталога проекта.

## Текущая версия Angular {#finding-the-current-version-of-angular}

Последняя стабильная версия Angular указана [на npm](https://www.npmjs.com/package/@angular/core 'Angular on npm') в поле «Version». Например, `16.2.4`.

Текущую версию Angular можно также узнать командой CLI [`ng update`](cli/update).
По умолчанию [`ng update`](cli/update) (без аргументов) показывает доступные обновления.

## Обновление окружения и приложений {#updating-your-environment-and-apps}

Чтобы упростить обновление, мы подготовили пошаговые инструкции в интерактивном [руководстве по обновлению Angular](update-guide).

Руководство по обновлению Angular формирует инструкции с учётом текущей и целевой версий.
В нём есть базовые и продвинутые пути обновления в зависимости от сложности приложения.
Также включены сведения по устранению неполадок и рекомендуемые ручные изменения для максимальной пользы от нового релиза.

Для простых обновлений достаточно команды CLI [`ng update`](cli/update).
Без дополнительных аргументов [`ng update`](cli/update) перечисляет доступные обновления и рекомендуемые шаги для перехода на самую новую версию.

В [Версионировании и релизах Angular](reference/releases#angular-versioning 'Angular Release Practices, Versioning') описано, какого уровня изменений ожидать по номеру версии релиза.
Там же указаны поддерживаемые пути обновления.

## Сводка ресурсов {#resource-summary}

- Анонсы релизов:
  [Блог Angular — анонсы релизов](https://blog.angular.dev/ 'Angular blog announcements about recent releases')

- Подробности релизов:
  [Журнал изменений Angular](https://github.com/angular/angular/blob/main/CHANGELOG.md 'Angular change log')

- Инструкции по обновлению:
  [Руководство по обновлению Angular](update-guide)

- Справочник команды обновления:
  [Справочник команды Angular CLI `ng update`](cli/update)

- Версионирование, релизы, поддержка и устаревание:
  [Версионирование и релизы Angular](reference/releases 'Angular versioning and releases')
