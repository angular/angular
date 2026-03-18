# Поддержание актуальности Angular-проектов

Как и веб в целом и весь веб-экосистем, Angular постоянно совершенствуется.
Angular балансирует между непрерывным улучшением и строгим фокусом на стабильность, делая обновления простыми.
Поддержание актуальности Angular-приложения позволяет пользоваться передовыми новыми функциями, а также оптимизациями и исправлениями ошибок.

Этот документ содержит информацию и ресурсы, которые помогут поддерживать актуальность Angular-приложений и библиотек.

Информацию о политике и практиках версионирования — включая поддержку и устаревание, а также расписание релизов — см. в [Angular versioning and releases](reference/releases 'Angular versioning and releases').

HELPFUL: Если вы в настоящее время используете AngularJS, см. [Upgrading from AngularJS](https://angular.io/guide/upgrade 'Upgrading from Angular JS').
_AngularJS_ — это название для всех версий Angular v1.x.

## Получение уведомлений о новых релизах {#getting-notified-of-new-releases}

Чтобы получать уведомления о доступных новых релизах, подпишитесь на [@angular](https://x.com/angular '@angular on X') в X (бывший Twitter) или подпишитесь на [Angular blog](https://blog.angular.dev 'Angular blog').

## Знакомство с новыми возможностями {#learning-about-new-features}

Что нового? Что изменилось? Самое важное публикуется в блоге Angular в [анонсах релизов](https://blog.angular.dev/ 'Angular blog - release announcements').

Полный список изменений, упорядоченных по версиям, см. в [журнале изменений Angular](https://github.com/angular/angular/blob/main/CHANGELOG.md 'Angular change log').

## Проверка версии Angular {#checking-your-version-of-angular}

Чтобы проверить версию Angular в приложении, выполните команду `ng version` в директории проекта.

## Поиск текущей версии Angular {#finding-the-current-version-of-angular}

Последняя стабильная выпущенная версия Angular отображается [на npm](https://www.npmjs.com/package/@angular/core 'Angular on npm') в разделе "Version". Например, `16.2.4`.

Также можно найти текущую версию Angular с помощью команды CLI [`ng update`](cli/update).
По умолчанию [`ng update`](cli/update) (без дополнительных аргументов) отображает доступные обновления.

## Обновление среды и приложений {#updating-your-environment-and-apps}

Чтобы сделать обновление несложным, мы предоставляем полные инструкции в интерактивном [Angular Update Guide](update-guide).

Angular Update Guide предоставляет персонализированные инструкции по обновлению на основе указанных текущей и целевой версий.
Он включает базовые и расширенные пути обновления в соответствии со сложностью ваших приложений.
Также содержит сведения об устранении неполадок и рекомендуемые ручные изменения, которые помогут максимально использовать возможности нового релиза.

Для простых обновлений достаточно команды CLI [`ng update`](cli/update).
Без дополнительных аргументов [`ng update`](cli/update) перечисляет доступные обновления и предоставляет рекомендуемые шаги для обновления приложения до последней версии.

[Angular Versioning and Releases](reference/releases#angular-versioning 'Angular Release Practices, Versioning') описывает уровень изменений, которого следует ожидать на основе номера версии релиза.
Также описываются поддерживаемые пути обновления.

## Сводка ресурсов {#resource-summary}

- Анонсы релизов:
  [Angular blog — анонсы релизов](https://blog.angular.dev/ 'Angular blog announcements about recent releases')

- Детали релизов:
  [Журнал изменений Angular](https://github.com/angular/angular/blob/main/CHANGELOG.md 'Angular change log')

- Инструкции по обновлению:
  [Angular Update Guide](update-guide)

- Справочник команды обновления:
  [Angular CLI `ng update` command reference](cli/update)

- Практики версионирования, релизов, поддержки и устаревания:
  [Angular versioning and releases](reference/releases 'Angular versioning and releases')
