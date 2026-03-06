# Поддержание актуальности Angular-проектов {#keeping-your-angular-projects-up-to-date}

Как и веб, и вся веб-экосистема, Angular постоянно совершенствуется.
Angular балансирует между непрерывным улучшением и сильным акцентом на стабильности, стремясь сделать обновления максимально простыми.
Поддержание актуальности Angular-приложения позволяет пользоваться передовыми новыми возможностями, а также оптимизациями и исправлениями ошибок.

Этот документ содержит информацию и ресурсы, которые помогут вам поддерживать актуальность Angular-приложений и библиотек.

Сведения о политике и практиках версионирования — включая поддержку, устаревание и расписание выпусков — см. в [Angular versioning and releases](reference/releases 'Angular versioning and releases').

HELPFUL: Если вы в настоящее время используете AngularJS, см. [Upgrading from AngularJS](https://angular.io/guide/upgrade 'Upgrading from Angular JS').
_AngularJS_ — название всех версий Angular v1.x.

## Получение уведомлений о новых выпусках {#getting-notified-of-new-releases}

Чтобы получать уведомления о новых выпусках, подпишитесь на [@angular](https://x.com/angular '@angular on X') в X (бывший Twitter) или подпишитесь на [блог Angular](https://blog.angular.dev 'Angular blog').

## Знакомство с новыми возможностями {#learning-about-new-features}

Что нового? Что изменилось? Самое важное публикуется в блоге Angular в [анонсах выпусков](https://blog.angular.dev/ 'Angular blog - release announcements').

Полный список изменений, упорядоченных по версии, см. в [журнале изменений Angular](https://github.com/angular/angular/blob/main/CHANGELOG.md 'Angular change log').

## Проверка версии Angular {#checking-your-version-of-angular}

Чтобы проверить версию Angular в приложении, выполните команду `ng version` в каталоге проекта.

## Поиск текущей версии Angular {#finding-the-current-version-of-angular}

Последняя стабильная выпущенная версия Angular отображается [на npm](https://www.npmjs.com/package/@angular/core 'Angular on npm') в поле «Version». Например, `16.2.4`.

Также можно узнать текущую версию Angular с помощью команды CLI [`ng update`](cli/update).
По умолчанию [`ng update`](cli/update) (без дополнительных аргументов) выводит список доступных обновлений.

## Обновление среды разработки и приложений {#updating-your-environment-and-apps}

Чтобы упростить процесс обновления, предоставляются полные инструкции в интерактивном [Angular Update Guide](update-guide).

Angular Update Guide предоставляет настраиваемые инструкции по обновлению, основанные на текущей и целевой версиях, которые вы указываете.
Включает базовые и расширенные пути обновления с учётом сложности ваших приложений.
Также содержит информацию по устранению неполадок и рекомендованные изменения вручную, чтобы получить максимум от нового выпуска.

Для простых обновлений достаточно команды CLI [`ng update`](cli/update).
Без дополнительных аргументов [`ng update`](cli/update) выводит список доступных обновлений и предоставляет рекомендованные шаги для обновления приложения до актуальной версии.

[Angular Versioning and Releases](reference/releases#angular-versioning 'Angular Release Practices, Versioning') описывает уровень изменений, которых следует ожидать, исходя из номера версии выпуска.
Также описывает поддерживаемые пути обновления.

## Сводка ресурсов {#resource-summary}

- Анонсы выпусков:
  [Angular blog - release announcements](https://blog.angular.dev/ 'Angular blog announcements about recent releases')

- Детали выпусков:
  [Angular change log](https://github.com/angular/angular/blob/main/CHANGELOG.md 'Angular change log')

- Инструкции по обновлению:
  [Angular Update Guide](update-guide)

- Справочник команд обновления:
  [Angular CLI `ng update` command reference](cli/update)

- Практики версионирования, выпусков, поддержки и устаревания:
  [Angular versioning and releases](reference/releases 'Angular versioning and releases')
