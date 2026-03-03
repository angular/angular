/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isDevMode} from '@angular/core';
import type {NavigationItem} from '@angular/docs';
// These imports are expected to be red because they are generated a build time
// @ts-ignore
import ERRORS_NAV_DATA from '../../../content/reference/errors/routes.json' with {type: 'json'};
// @ts-ignore
import EXT_DIAGNOSTICS_NAV_DATA from '../../../content/reference/extended-diagnostics/routes.json' with {type: 'json'};
// @ts-ignore
import FIRST_APP_TUTORIAL_NAV_DATA from '../../../content/tutorials/first-app/first-app/routes.json' with {type: 'json'};
// @ts-ignore
import LEARN_ANGULAR_TUTORIAL_NAV_DATA from '../../../content/tutorials/learn-angular/learn-angular/routes.json' with {type: 'json'};
// @ts-ignore
import DEFERRABLE_VIEWS_TUTORIAL_NAV_DATA from '../../../content/tutorials/deferrable-views/deferrable-views/routes.json' with {type: 'json'};
// @ts-ignore
import SIGNALS_TUTORIAL_NAV_DATA from '../../../content/tutorials/signals/signals/routes.json' with {type: 'json'};
// @ts-ignore
import SIGNAL_FORMS_TUTORIAL_NAV_DATA from '../../../content/tutorials/signal-forms/signal-forms/routes.json' with {type: 'json'};
// @ts-ignore
import API_MANIFEST_JSON from '../../../assets/manifest.json' with {type: 'json'};

interface SubNavigationData {
  docs: NavigationItem[];
  reference: NavigationItem[];
  tutorials: NavigationItem[];
  footer: NavigationItem[];
}

export const DOCS_SUB_NAVIGATION_DATA: NavigationItem[] = [
  {
    label: 'Введение',
    children: [
      {
        label: 'Что такое Angular?',
        path: 'overview',
        contentPath: 'introduction/what-is-angular',
      },
      {
        label: 'Установка',
        path: 'installation',
        contentPath: 'introduction/installation',
      },
      {
        label: 'Основы',
        children: [
          {
            label: 'Обзор',
            path: 'essentials',
            contentPath: 'introduction/essentials/overview',
          },
          {
            label: 'Композиция с компонентами',
            path: 'essentials/components',
            contentPath: 'introduction/essentials/components',
          },
          {
            label: 'Реактивность с сигналами',
            path: 'essentials/signals',
            contentPath: 'introduction/essentials/signals',
          },
          {
            label: 'Динамические интерфейсы с шаблонами',
            path: 'essentials/templates',
            contentPath: 'introduction/essentials/templates',
          },
          {
            label: 'Формы с сигналами',
            path: 'essentials/signal-forms',
            contentPath: 'introduction/essentials/signal-forms',
            status: 'new',
          },
          {
            label: 'Модульный дизайн с внедрением зависимостей',
            path: 'essentials/dependency-injection',
            contentPath: 'introduction/essentials/dependency-injection',
          },
          {
            label: 'Следующие шаги',
            path: 'essentials/next-steps',
            contentPath: 'introduction/essentials/next-steps',
          },
        ],
      },
      {
        label: 'Начать кодить! 🚀',
        path: 'tutorials/learn-angular',
      },
    ],
  },
  {
    label: 'Подробные руководства',
    children: [
      {
        label: 'Сигналы',
        status: 'updated',
        children: [
          {
            label: 'Обзор',
            path: 'guide/signals',
            contentPath: 'guide/signals/overview',
          },
          {
            label: 'Зависимое состояние с linkedSignal',
            path: 'guide/signals/linked-signal',
            contentPath: 'guide/signals/linked-signal',
          },
          {
            label: 'Асинхронная реактивность с ресурсами',
            path: 'guide/signals/resource',
            contentPath: 'guide/signals/resource',
          },
          {
            label: 'Побочные эффекты для нереактивных API',
            path: 'guide/signals/effect',
            contentPath: 'guide/signals/effect',
            status: 'new',
          },
        ],
      },
      {
        label: 'Компоненты',
        children: [
          {
            label: 'Анатомия компонентов',
            path: 'guide/components',
            contentPath: 'guide/components/anatomy-of-components',
          },
          {
            label: 'Селекторы',
            path: 'guide/components/selectors',
            contentPath: 'guide/components/selectors',
          },
          {
            label: 'Стилизация',
            path: 'guide/components/styling',
            contentPath: 'guide/components/styling',
          },
          {
            label: 'Получение данных через input-свойства',
            path: 'guide/components/inputs',
            contentPath: 'guide/components/inputs',
          },
          {
            label: 'Пользовательские события с output',
            path: 'guide/components/outputs',
            contentPath: 'guide/components/outputs',
          },
          {
            label: 'Проекция контента с ng-content',
            path: 'guide/components/content-projection',
            contentPath: 'guide/components/content-projection',
          },
          {
            label: 'Host-элементы',
            path: 'guide/components/host-elements',
            contentPath: 'guide/components/host-elements',
          },
          {
            label: 'Жизненный цикл',
            path: 'guide/components/lifecycle',
            contentPath: 'guide/components/lifecycle',
          },
          {
            label: 'Обращение к дочерним компонентам через запросы',
            path: 'guide/components/queries',
            contentPath: 'guide/components/queries',
          },
          {
            label: 'Использование DOM API',
            path: 'guide/components/dom-apis',
            contentPath: 'guide/components/dom-apis',
          },
          {
            label: 'Наследование',
            path: 'guide/components/inheritance',
            contentPath: 'guide/components/inheritance',
          },
          {
            label: 'Программный рендеринг компонентов',
            path: 'guide/components/programmatic-rendering',
            contentPath: 'guide/components/programmatic-rendering',
          },
          {
            label: 'Расширенная конфигурация',
            path: 'guide/components/advanced-configuration',
            contentPath: 'guide/components/advanced-configuration',
          },
          {
            label: 'Пользовательские элементы',
            path: 'guide/elements',
            contentPath: 'guide/elements',
          },
        ],
      },
      {
        label: 'Шаблоны',
        children: [
          {
            label: 'Обзор',
            path: 'guide/templates',
            contentPath: 'guide/templates/overview',
          },
          {
            label: 'Привязка динамического текста, свойств и атрибутов',
            path: 'guide/templates/binding',
            contentPath: 'guide/templates/binding',
          },
          {
            label: 'Добавление обработчиков событий',
            path: 'guide/templates/event-listeners',
            contentPath: 'guide/templates/event-listeners',
          },
          {
            label: 'Двусторонняя привязка',
            path: 'guide/templates/two-way-binding',
            contentPath: 'guide/templates/two-way-binding',
          },
          {
            label: 'Поток управления',
            path: 'guide/templates/control-flow',
            contentPath: 'guide/templates/control-flow',
          },
          {
            label: 'Pipe',
            path: 'guide/templates/pipes',
            contentPath: 'guide/templates/pipes',
          },
          {
            label: 'Вставка дочернего контента с ng-content',
            path: 'guide/templates/ng-content',
            contentPath: 'guide/templates/ng-content',
          },
          {
            label: 'Создание фрагментов шаблона с ng-template',
            path: 'guide/templates/ng-template',
            contentPath: 'guide/templates/ng-template',
          },
          {
            label: 'Группировка элементов с ng-container',
            path: 'guide/templates/ng-container',
            contentPath: 'guide/templates/ng-container',
          },
          {
            label: 'Переменные в шаблонах',
            path: 'guide/templates/variables',
            contentPath: 'guide/templates/variables',
          },
          {
            label: 'Отложенная загрузка с @defer',
            path: 'guide/templates/defer',
            contentPath: 'guide/templates/defer',
          },
          {
            label: 'Синтаксис выражений',
            path: 'guide/templates/expression-syntax',
            contentPath: 'guide/templates/expression-syntax',
          },
          {
            label: 'Пробелы в шаблонах',
            path: 'guide/templates/whitespace',
            contentPath: 'guide/templates/whitespace',
          },
        ],
      },
      {
        label: 'Директивы',
        children: [
          {
            label: 'Обзор',
            path: 'guide/directives',
            contentPath: 'guide/directives/overview',
          },
          {
            label: 'Директивы атрибутов',
            path: 'guide/directives/attribute-directives',
            contentPath: 'guide/directives/attribute-directives',
          },
          {
            label: 'Структурные директивы',
            path: 'guide/directives/structural-directives',
            contentPath: 'guide/directives/structural-directives',
          },
          {
            label: 'API композиции директив',
            path: 'guide/directives/directive-composition-api',
            contentPath: 'guide/directives/directive-composition-api',
          },
          {
            label: 'Оптимизация изображений с NgOptimizedImage',
            path: 'guide/image-optimization',
            contentPath: 'guide/image-optimization',
          },
        ],
      },
      {
        label: 'Внедрение зависимостей',
        status: 'updated',
        children: [
          {
            label: 'Обзор',
            path: 'guide/di',
            contentPath: 'guide/di/overview',
            status: 'updated',
          },
          {
            label: 'Создание и использование сервисов',
            path: 'guide/di/creating-and-using-services',
            contentPath: 'guide/di/creating-and-using-services',
            status: 'updated',
          },
          {
            label: 'Определение провайдеров зависимостей',
            path: 'guide/di/defining-dependency-providers',
            contentPath: 'guide/di/defining-dependency-providers',
            status: 'updated',
          },
          {
            label: 'Контекст внедрения',
            path: 'guide/di/dependency-injection-context',
            contentPath: 'guide/di/dependency-injection-context',
          },
          {
            label: 'Иерархические инжекторы',
            path: 'guide/di/hierarchical-dependency-injection',
            contentPath: 'guide/di/hierarchical-dependency-injection',
          },
          {
            label: 'Оптимизация токенов внедрения',
            path: 'guide/di/lightweight-injection-tokens',
            contentPath: 'guide/di/lightweight-injection-tokens',
          },
          {
            label: 'DI в действии',
            path: 'guide/di/di-in-action',
            contentPath: 'guide/di/di-in-action',
          },
          {
            label: 'Отладка и устранение проблем DI',
            path: 'guide/di/debugging-and-troubleshooting-di',
            contentPath: 'guide/di/debugging-and-troubleshooting-di',
            status: 'new',
          },
        ],
      },
      {
        label: 'Маршрутизация',
        status: 'updated',
        children: [
          {
            label: 'Обзор',
            path: 'guide/routing',
            contentPath: 'guide/routing/overview',
          },
          {
            label: 'Определение маршрутов',
            path: 'guide/routing/define-routes',
            contentPath: 'guide/routing/define-routes',
          },
          {
            label: 'Стратегии загрузки маршрутов',
            path: 'guide/routing/loading-strategies',
            contentPath: 'guide/routing/loading-strategies',
          },
          {
            label: 'Отображение маршрутов с Outlet',
            path: 'guide/routing/show-routes-with-outlets',
            contentPath: 'guide/routing/show-routes-with-outlets',
          },
          {
            label: 'Навигация по маршрутам',
            path: 'guide/routing/navigate-to-routes',
            contentPath: 'guide/routing/navigate-to-routes',
          },
          {
            label: 'Чтение состояния маршрута',
            path: 'guide/routing/read-route-state',
            contentPath: 'guide/routing/read-route-state',
          },
          {
            label: 'Перенаправление маршрутов',
            path: 'guide/routing/redirecting-routes',
            contentPath: 'guide/routing/redirecting-routes',
          },
          {
            label: 'Управление доступом к маршрутам с guard',
            path: 'guide/routing/route-guards',
            contentPath: 'guide/routing/route-guards',
          },
          {
            label: 'Resolver данных маршрута',
            path: 'guide/routing/data-resolvers',
            contentPath: 'guide/routing/data-resolvers',
          },
          {
            label: 'Жизненный цикл и события',
            path: 'guide/routing/lifecycle-and-events',
            contentPath: 'guide/routing/lifecycle-and-events',
          },
          {
            label: 'Тестирование маршрутизации и навигации',
            path: 'guide/routing/testing',
            contentPath: 'guide/routing/testing',
            status: 'new',
          },
          {
            label: 'Другие задачи маршрутизации',
            path: 'guide/routing/common-router-tasks',
            contentPath: 'guide/routing/common-router-tasks',
          },
          {
            label: 'Создание пользовательских сопоставлений маршрутов',
            path: 'guide/routing/routing-with-urlmatcher',
            contentPath: 'guide/routing/routing-with-urlmatcher',
          },
          {
            label: 'Стратегии рендеринга',
            path: 'guide/routing/rendering-strategies',
            contentPath: 'guide/routing/rendering-strategies',
            status: 'new',
          },
          {
            label: 'Настройка поведения маршрутов',
            path: 'guide/routing/customizing-route-behavior',
            contentPath: 'guide/routing/customizing-route-behavior',
            status: 'new',
          },
          {
            label: 'Справочник по роутеру',
            path: 'guide/routing/router-reference',
            contentPath: 'guide/routing/router-reference',
          },
          {
            label: 'Анимации переходов между маршрутами',
            path: 'guide/routing/route-transition-animations',
            contentPath: 'guide/routing/route-transition-animations',
          },
        ],
      },
      {
        label: 'Формы',
        status: 'updated',
        preserveOtherCategoryOrder: true,
        children: [
          {
            label: 'Обзор',
            path: 'guide/forms',
            contentPath: 'guide/forms/overview',
          },

          {
            label: 'Обзор',
            path: 'guide/forms/signals/overview',
            contentPath: 'guide/forms/signals/overview',
            category: 'Signal Forms',
            status: 'new',
          },
          {
            label: 'Модели форм',
            path: 'guide/forms/signals/models',
            contentPath: 'guide/forms/signals/models',
            category: 'Signal Forms',
            status: 'new',
          },
          {
            label: 'Проектирование модели формы',
            path: 'guide/forms/signals/model-design',
            contentPath: 'guide/forms/signals/designing-your-form-model',
            category: 'Signal Forms',
            status: 'new',
          },
          {
            label: 'Управление состоянием полей',
            path: 'guide/forms/signals/field-state-management',
            contentPath: 'guide/forms/signals/field-state-management',
            category: 'Signal Forms',
            status: 'new',
          },
          {
            label: 'Валидация',
            path: 'guide/forms/signals/validation',
            contentPath: 'guide/forms/signals/validation',
            category: 'Signal Forms',
            status: 'new',
          },
          {
            label: 'Логика формы',
            path: 'guide/forms/signals/form-logic',
            contentPath: 'guide/forms/signals/form-logic',
            category: 'Signal Forms',
            status: 'new',
          },
          {
            label: 'Асинхронные операции',
            path: 'guide/forms/signals/async-operations',
            contentPath: 'guide/forms/signals/async-operations',
            category: 'Signal Forms',
            status: 'new',
          },
          {
            label: 'Пользовательские элементы управления',
            path: 'guide/forms/signals/custom-controls',
            contentPath: 'guide/forms/signals/custom-controls',
            category: 'Signal Forms',
            status: 'new',
          },
          {
            label: 'Сравнение с другими системами форм',
            path: 'guide/forms/signals/comparison',
            contentPath: 'guide/forms/signals/comparison',
            category: 'Signal Forms',
            status: 'new',
          },
          {
            label: 'Миграция с Reactive Forms',
            path: 'guide/forms/signals/migration',
            contentPath: 'guide/forms/signals/migration',
            category: 'Signal Forms',
            status: 'new',
          },
          {
            label: 'Реактивные формы',
            path: 'guide/forms/reactive-forms',
            contentPath: 'guide/forms/reactive-forms',
            category: 'Reactive Forms',
          },
          {
            label: 'Строго типизированные реактивные формы',
            path: 'guide/forms/typed-forms',
            contentPath: 'guide/forms/typed-forms',
            category: 'Reactive Forms',
          },
          {
            label: 'Формы на основе шаблонов',
            path: 'guide/forms/template-driven-forms',
            contentPath: 'guide/forms/template-driven-forms',
            category: 'Template driven Forms',
          },
          {
            label: 'Валидация ввода формы',
            path: 'guide/forms/form-validation',
            contentPath: 'guide/forms/form-validation',
            category: 'Reactive Forms',
          },
          {
            label: 'Валидация ввода формы',
            path: 'guide/forms/form-validation',
            contentPath: 'guide/forms/form-validation',
            category: 'Template driven Forms',
          },
          {
            label: 'Создание динамических форм',
            path: 'guide/forms/dynamic-forms',
            contentPath: 'guide/forms/dynamic-forms',
            category: 'Reactive Forms',
          },
        ],
      },
      {
        label: 'HTTP-клиент',
        children: [
          {
            label: 'Обзор',
            path: 'guide/http',
            contentPath: 'guide/http/overview',
          },
          {
            label: 'Настройка HttpClient',
            path: 'guide/http/setup',
            contentPath: 'guide/http/setup',
          },
          {
            label: 'Выполнение запросов',
            path: 'guide/http/making-requests',
            contentPath: 'guide/http/making-requests',
          },
          {
            label: 'Реактивная загрузка данных с httpResource',
            path: 'guide/http/http-resource',
            contentPath: 'guide/http/http-resource',
          },
          {
            label: 'Перехват запросов и ответов',
            path: 'guide/http/interceptors',
            contentPath: 'guide/http/interceptors',
          },
          {
            label: 'Тестирование',
            path: 'guide/http/testing',
            contentPath: 'guide/http/testing',
          },
        ],
      },
      {
        label: 'Серверный и гибридный рендеринг',
        children: [
          {
            label: 'Обзор',
            path: 'guide/performance',
            contentPath: 'guide/performance/overview',
          },
          {
            label: 'Серверный и гибридный рендеринг',
            path: 'guide/ssr',
            contentPath: 'guide/ssr',
          },
          {
            label: 'Гидратация',
            path: 'guide/hydration',
            contentPath: 'guide/hydration',
          },
          {
            label: 'Инкрементальная гидратация',
            path: 'guide/incremental-hydration',
            contentPath: 'guide/incremental-hydration',
          },
        ],
      },
      {
        label: 'Тестирование',
        children: [
          {
            label: 'Обзор',
            path: 'guide/testing',
            contentPath: 'guide/testing/overview',
          },
          {
            label: 'Основы тестирования компонентов',
            path: 'guide/testing/components-basics',
            contentPath: 'guide/testing/components-basics',
          },
          {
            label: 'Сценарии тестирования компонентов',
            path: 'guide/testing/components-scenarios',
            contentPath: 'guide/testing/components-scenarios',
          },
          {
            label: 'Тестирование сервисов',
            path: 'guide/testing/services',
            contentPath: 'guide/testing/services',
          },
          {
            label: 'Тестирование директив атрибутов',
            path: 'guide/testing/attribute-directives',
            contentPath: 'guide/testing/attribute-directives',
          },
          {
            label: 'Тестирование pipe',
            path: 'guide/testing/pipes',
            contentPath: 'guide/testing/pipes',
          },
          {
            label: 'Тестирование маршрутизации и навигации',
            path: 'guide/routing/testing',
            contentPath: 'guide/routing/testing',
            status: 'new',
          },
          {
            label: 'Отладка тестов',
            path: 'guide/testing/debugging',
            contentPath: 'guide/testing/debugging',
          },
          {
            label: 'Покрытие кода',
            path: 'guide/testing/code-coverage',
            contentPath: 'guide/testing/code-coverage',
          },
          {
            label: 'Утилиты для тестирования API',
            path: 'guide/testing/utility-apis',
            contentPath: 'guide/testing/utility-apis',
          },
          {
            label: 'Обзор harness компонентов',
            path: 'guide/testing/component-harnesses-overview',
            contentPath: 'guide/testing/component-harnesses-overview',
          },
          {
            label: 'Использование harness компонентов в тестах',
            path: 'guide/testing/using-component-harnesses',
            contentPath: 'guide/testing/using-component-harnesses',
          },
          {
            label: 'Создание harness для ваших компонентов',
            path: 'guide/testing/creating-component-harnesses',
            contentPath: 'guide/testing/creating-component-harnesses',
          },
          {
            label: 'Добавление поддержки harness для дополнительных сред тестирования',
            path: 'guide/testing/component-harnesses-testing-environments',
            contentPath: 'guide/testing/component-harnesses-testing-environments',
          },
          {
            label: 'Миграция с Karma на Vitest',
            path: 'guide/testing/migrating-to-vitest',
            contentPath: 'guide/testing/migrating-to-vitest',
          },
          {
            label: 'Тестирование с Karma и Jasmine',
            path: 'guide/testing/karma',
            contentPath: 'guide/testing/karma',
          },
          {
            label: 'Утилиты тестирования Zone.js',
            path: 'guide/testing/zone-js-testing-utilities',
            contentPath: 'guide/testing/zone-js-testing-utilities',
          },
        ],
      },
      {
        label: 'Angular Aria',
        status: 'new',
        children: [
          {
            label: 'Обзор',
            path: 'guide/aria/overview',
            contentPath: 'guide/aria/overview',
          },
          {
            label: 'Аккордеон',
            path: 'guide/aria/accordion',
            contentPath: 'guide/aria/accordion',
          },
          {
            label: 'Автодополнение',
            path: 'guide/aria/autocomplete',
            contentPath: 'guide/aria/autocomplete',
          },
          {
            label: 'Комбинированный список',
            path: 'guide/aria/combobox',
            contentPath: 'guide/aria/combobox',
          },
          {
            label: 'Таблица',
            path: 'guide/aria/grid',
            contentPath: 'guide/aria/grid',
          },
          {
            label: 'Список',
            path: 'guide/aria/listbox',
            contentPath: 'guide/aria/listbox',
          },
          {
            label: 'Меню',
            path: 'guide/aria/menu',
            contentPath: 'guide/aria/menu',
          },
          {
            label: 'Панель меню',
            path: 'guide/aria/menubar',
            contentPath: 'guide/aria/menubar',
          },
          {
            label: 'Множественный выбор',
            path: 'guide/aria/multiselect',
            contentPath: 'guide/aria/multiselect',
          },
          {
            label: 'Выбор',
            path: 'guide/aria/select',
            contentPath: 'guide/aria/select',
          },
          {
            label: 'Вкладки',
            path: 'guide/aria/tabs',
            contentPath: 'guide/aria/tabs',
          },
          {
            label: 'Панель инструментов',
            path: 'guide/aria/toolbar',
            contentPath: 'guide/aria/toolbar',
          },
          {
            label: 'Дерево',
            path: 'guide/aria/tree',
            contentPath: 'guide/aria/tree',
          },
        ],
      },
      {
        label: 'Интернационализация',
        children: [
          {
            label: 'Обзор',
            path: 'guide/i18n',
            contentPath: 'guide/i18n/overview',
          },
          {
            label: 'Добавление пакета локализации',
            path: 'guide/i18n/add-package',
            contentPath: 'guide/i18n/add-package',
          },
          {
            label: 'Ссылка на локали по ID',
            path: 'guide/i18n/locale-id',
            contentPath: 'guide/i18n/locale-id',
          },
          {
            label: 'Форматирование данных на основе локали',
            path: 'guide/i18n/format-data-locale',
            contentPath: 'guide/i18n/format-data-locale',
          },
          {
            label: 'Подготовка компонента к переводу',
            path: 'guide/i18n/prepare',
            contentPath: 'guide/i18n/prepare',
          },
          {
            label: 'Работа с файлами переводов',
            path: 'guide/i18n/translation-files',
            contentPath: 'guide/i18n/translation-files',
          },
          {
            label: 'Объединение переводов в приложение',
            path: 'guide/i18n/merge',
            contentPath: 'guide/i18n/merge',
          },
          {
            label: 'Развёртывание нескольких локалей',
            path: 'guide/i18n/deploy',
            contentPath: 'guide/i18n/deploy',
          },
          {
            label: 'Импорт глобальных вариантов данных локали',
            path: 'guide/i18n/import-global-variants',
            contentPath: 'guide/i18n/import-global-variants',
          },
          {
            label: 'Управление размеченным текстом с пользовательскими ID',
            path: 'guide/i18n/manage-marked-text',
            contentPath: 'guide/i18n/manage-marked-text',
          },
          {
            label: 'Пример приложения Angular',
            path: 'guide/i18n/example',
            contentPath: 'guide/i18n/example',
          },
        ],
      },
      {
        label: 'Анимации',
        status: 'updated',
        children: [
          {
            label: 'Анимации появления и исчезновения',
            path: 'guide/animations',
            contentPath: 'guide/animations/enter-and-leave',
            status: 'new',
          },
          {
            label: 'Сложные анимации с CSS',
            path: 'guide/animations/css',
            contentPath: 'guide/animations/css',
          },
          {
            label: 'Анимации переходов между маршрутами',
            path: 'guide/routing/route-transition-animations',
            contentPath: 'guide/routing/route-transition-animations',
          },
        ],
      },
      {
        label: 'Drag and drop',
        path: 'guide/drag-drop',
        contentPath: 'guide/drag-drop',
      },
    ],
  },
  {
    label: 'Разработка с ИИ',
    status: 'new',
    children: [
      {
        label: 'Начало работы',
        path: 'ai',
        contentPath: 'ai/overview',
      },
      {
        label: 'Промпты для LLM и настройка AI IDE',
        path: 'ai/develop-with-ai',
        contentPath: 'ai/develop-with-ai',
      },
      {
        label: 'Паттерны проектирования',
        path: 'ai/design-patterns',
        contentPath: 'ai/design-patterns',
      },
      {
        label: 'Настройка MCP-сервера Angular CLI',
        path: 'ai/mcp',
        contentPath: 'ai/mcp-server-setup',
      },
      {
        label: 'Angular AI Tutor',
        path: 'ai/ai-tutor',
        contentPath: 'ai/ai-tutor',
      },
    ],
  },
  {
    label: 'Инструменты разработчика',
    children: [
      {
        label: 'Angular CLI',
        children: [
          {
            label: 'Обзор',
            path: 'tools/cli',
            contentPath: 'tools/cli/overview',
          },
          {
            label: 'Локальная настройка',
            path: 'tools/cli/setup-local',
            contentPath: 'tools/cli/setup-local',
          },
          {
            label: 'Сборка приложений Angular',
            path: 'tools/cli/build',
            contentPath: 'tools/cli/build',
          },
          {
            label: 'Запуск приложений Angular для разработки',
            path: 'tools/cli/serve',
            contentPath: 'tools/cli/serve',
          },
          {
            label: 'Развёртывание',
            path: 'tools/cli/deployment',
            contentPath: 'tools/cli/deployment',
          },
          {
            label: 'Сквозное тестирование',
            path: 'tools/cli/end-to-end',
            contentPath: 'tools/cli/end-to-end',
          },
          {
            label: 'Миграция на новую систему сборки',
            path: 'tools/cli/build-system-migration',
            contentPath: 'tools/cli/build-system-migration',
          },
          {
            label: 'Окружения сборки',
            path: 'tools/cli/environments',
            contentPath: 'tools/cli/environments',
          },
          {
            label: 'Сборщики Angular CLI',
            path: 'tools/cli/cli-builder',
            contentPath: 'tools/cli/cli-builder',
          },
          {
            label: 'Генерация кода с помощью schematic',
            path: 'tools/cli/schematics',
            contentPath: 'tools/cli/schematics',
          },
          {
            label: 'Создание schematic',
            path: 'tools/cli/schematics-authoring',
            contentPath: 'tools/cli/schematics-authoring',
          },
          {
            label: 'Schematic для библиотек',
            path: 'tools/cli/schematics-for-libraries',
            contentPath: 'tools/cli/schematics-for-libraries',
          },
          {
            label: 'Проверка типов шаблонов',
            path: 'tools/cli/template-typecheck',
            contentPath: 'tools/cli/template-typecheck',
          },
          {
            label: 'Ahead-of-time (AOT) компиляция',
            path: 'tools/cli/aot-compiler',
            contentPath: 'tools/cli/aot-compiler',
          },
          {
            label: 'Ошибки метаданных AOT',
            path: 'tools/cli/aot-metadata-errors',
            contentPath: 'tools/cli/aot-metadata-errors',
          },
        ],
      },
      {
        label: 'Библиотеки',
        children: [
          {
            label: 'Обзор',
            path: 'tools/libraries',
            contentPath: 'tools/libraries/overview',
          },
          {
            label: 'Создание библиотек',
            path: 'tools/libraries/creating-libraries',
            contentPath: 'tools/libraries/creating-libraries',
          },
          {
            label: 'Использование библиотек',
            path: 'tools/libraries/using-libraries',
            contentPath: 'tools/libraries/using-libraries',
          },
          {
            label: 'Формат пакетов Angular',
            path: 'tools/libraries/angular-package-format',
            contentPath: 'tools/libraries/angular-package-format',
          },
        ],
      },
      {
        label: 'DevTools',
        children: [
          {
            label: 'Обзор',
            path: 'tools/devtools',
            contentPath: 'tools/devtools/overview',
          },
          {
            label: 'Компоненты',
            path: 'tools/devtools/component',
            contentPath: 'tools/devtools/component',
          },
          {
            label: 'Профилировщик',
            path: 'tools/devtools/profiler',
            contentPath: 'tools/devtools/profiler',
          },
          {
            label: 'Инжекторы',
            path: 'tools/devtools/injectors',
            contentPath: 'tools/devtools/injectors',
          },
          // TODO: create those guides
          // The signal debugging docs should also be added to the signal section
          // {
          //   label: 'Signals',
          //   path: 'tools/devtools/signals',
          //   contentPath: 'tools/devtools/signals',
          // },
          // {
          //   label: 'Router',
          //   path: 'tools/devtools/router',
          //   contentPath: 'tools/devtools/router',
          // }
        ],
      },
      {
        label: 'Языковой сервис',
        path: 'tools/language-service',
        contentPath: 'tools/language-service',
      },
    ],
  },
  {
    label: 'Лучшие практики',
    children: [
      {
        label: 'Руководство по стилю',
        path: 'style-guide',
        contentPath: 'best-practices/style-guide',
        status: 'updated',
      },
      {
        label: 'Безопасность',
        path: 'best-practices/security',
        contentPath: 'guide/security', // Have not refactored due to build issues
      },
      {
        label: 'Доступность',
        path: 'best-practices/a11y',
        contentPath: 'best-practices/a11y',
      },
      {
        label: 'Необработанные ошибки в Angular',
        path: 'best-practices/error-handling',
        contentPath: 'best-practices/error-handling',
      },
      {
        label: 'Производительность',
        preserveOtherCategoryOrder: true,
        children: [
          {
            label: 'Обзор',
            path: 'best-practices/performance',
            contentPath: 'best-practices/performance/overview',
          },

          // Loading Performance
          {
            label: 'Маршруты с ленивой загрузкой',
            path: 'best-practices/performance/lazy-loaded-routes',
            contentPath: 'guide/routing/loading-strategies',
            category: 'Loading Performance',
          },
          {
            label: 'Отложенная загрузка с @defer',
            path: 'best-practices/performance/defer',
            contentPath: 'guide/templates/defer',
            category: 'Loading Performance',
          },
          {
            label: 'Оптимизация изображений',
            path: 'best-practices/performance/image-optimization',
            contentPath: 'guide/image-optimization',
            category: 'Loading Performance',
          },
          {
            label: 'Рендеринг на стороне сервера',
            path: 'best-practices/performance/ssr',
            contentPath: 'guide/ssr',
            category: 'Loading Performance',
          },

          // Runtime Performance
          {
            label: 'Обзор',
            path: 'best-practices/runtime-performance',
            contentPath: 'best-practices/runtime-performance/overview',
            category: 'Runtime Performance',
          },
          {
            label: 'Zoneless',
            path: 'guide/zoneless',
            contentPath: 'guide/zoneless',
            category: 'Runtime Performance',
          },
          {
            label: 'Медленные вычисления',
            path: 'best-practices/slow-computations',
            contentPath: 'best-practices/runtime-performance/slow-computations',
            category: 'Runtime Performance',
          },
          {
            label: 'Пропуск поддеревьев компонентов',
            path: 'best-practices/skipping-subtrees',
            contentPath: 'best-practices/runtime-performance/skipping-subtrees',
            category: 'Runtime Performance',
          },
          {
            label: 'Загрязнение Zone',
            path: 'best-practices/zone-pollution',
            contentPath: 'best-practices/runtime-performance/zone-pollution',
            category: 'Runtime Performance',
          },

          {
            label: 'Профилирование с Chrome DevTools',
            path: 'best-practices/profiling-with-chrome-devtools',
            contentPath: 'best-practices/runtime-performance/profiling-with-chrome-devtools',
            category: 'Runtime Performance',
          },
        ],
      },
      {
        label: 'Обновление',
        path: 'update',
        contentPath: 'best-practices/update',
      },
    ],
  },
  {
    label: 'Мероприятия для разработчиков',
    children: [
      {
        label: 'Релиз Angular v21',
        path: 'events/v21',
        contentPath: 'events/v21',
        status: 'new',
      },
    ],
  },
  {
    label: 'Расширенная экосистема',
    children: [
      {
        label: 'NgModules',
        path: 'guide/ngmodules/overview',
        contentPath: 'guide/ngmodules/overview',
      },
      {
        label: 'Устаревшие анимации',
        children: [
          {
            label: 'Обзор',
            path: 'guide/legacy-animations',
            contentPath: 'guide/animations/overview',
          },
          {
            label: 'Переходы и триггеры',
            path: 'guide/legacy-animations/transition-and-triggers',
            contentPath: 'guide/animations/transition-and-triggers',
          },
          {
            label: 'Сложные последовательности',
            path: 'guide/legacy-animations/complex-sequences',
            contentPath: 'guide/animations/complex-sequences',
          },
          {
            label: 'Переиспользуемые анимации',
            path: 'guide/legacy-animations/reusable-animations',
            contentPath: 'guide/animations/reusable-animations',
          },
          {
            label: 'Миграция на нативные CSS-анимации',
            path: 'guide/animations/migration',
            contentPath: 'guide/animations/migration',
          },
        ],
      },
      {
        label: 'Использование RxJS с Angular',
        children: [
          {
            label: 'Взаимодействие с сигналами',
            path: 'ecosystem/rxjs-interop',
            contentPath: 'ecosystem/rxjs-interop/signals-interop',
          },
          {
            label: 'Взаимодействие с output компонентов',
            path: 'ecosystem/rxjs-interop/output-interop',
            contentPath: 'ecosystem/rxjs-interop/output-interop',
          },
          {
            label: 'Отписка с takeUntilDestroyed',
            path: 'ecosystem/rxjs-interop/take-until-destroyed',
            contentPath: 'ecosystem/rxjs-interop/take-until-destroyed',
          },
        ],
      },
      {
        label: 'Service Workers и PWA',
        children: [
          {
            label: 'Обзор',
            path: 'ecosystem/service-workers',
            contentPath: 'ecosystem/service-workers/overview',
          },
          {
            label: 'Начало работы',
            path: 'ecosystem/service-workers/getting-started',
            contentPath: 'ecosystem/service-workers/getting-started',
          },
          {
            label: 'Пользовательские скрипты service worker',
            path: 'ecosystem/service-workers/custom-service-worker-scripts',
            contentPath: 'ecosystem/service-workers/custom-service-worker-scripts',
          },
          {
            label: 'Файл конфигурации',
            path: 'ecosystem/service-workers/config',
            contentPath: 'ecosystem/service-workers/config',
          },
          {
            label: 'Взаимодействие с service worker',
            path: 'ecosystem/service-workers/communications',
            contentPath: 'ecosystem/service-workers/communications',
          },
          {
            label: 'Push-уведомления',
            path: 'ecosystem/service-workers/push-notifications',
            contentPath: 'ecosystem/service-workers/push-notifications',
          },
          {
            label: 'DevOps для service worker',
            path: 'ecosystem/service-workers/devops',
            contentPath: 'ecosystem/service-workers/devops',
          },
          {
            label: 'Паттерн App Shell',
            path: 'ecosystem/service-workers/app-shell',
            contentPath: 'ecosystem/service-workers/app-shell',
          },
        ],
      },
      {
        label: 'Web Workers',
        path: 'ecosystem/web-workers',
        contentPath: 'ecosystem/web-workers',
      },
      {
        label: 'Пользовательский конвейер сборки',
        path: 'ecosystem/custom-build-pipeline',
        contentPath: 'ecosystem/custom-build-pipeline',
      },
      {
        label: 'Tailwind',
        path: 'guide/tailwind',
        contentPath: 'guide/tailwind',
        status: 'new',
      },
      {
        label: 'Angular Fire',
        path: 'https://github.com/angular/angularfire#readme',
      },
      {
        label: 'Google Maps',
        path: 'https://github.com/angular/components/tree/main/src/google-maps#readme',
      },
      {
        label: 'Google Pay',
        path: 'https://github.com/google-pay/google-pay-button#angular',
      },
      {
        label: 'YouTube player',
        path: 'https://github.com/angular/components/blob/main/src/youtube-player/README.md',
      },
      {
        label: 'Angular CDK',
        path: 'https://material.angular.dev/cdk/categories',
      },
      {
        label: 'Angular Material',
        path: 'https://material.angular.dev/',
      },
    ],
  },
  ...(isDevMode()
    ? [
        {
          label: 'Руководство разработчика Adev',
          children: [
            {
              label: 'Kitchen Sink',
              path: 'kitchen-sink',
              contentPath: 'kitchen-sink',
            },
          ],
        },
      ]
    : []),
];

export const TUTORIALS_SUB_NAVIGATION_DATA: NavigationItem[] = [
  FIRST_APP_TUTORIAL_NAV_DATA,
  LEARN_ANGULAR_TUTORIAL_NAV_DATA,
  DEFERRABLE_VIEWS_TUTORIAL_NAV_DATA,
  SIGNALS_TUTORIAL_NAV_DATA,
  SIGNAL_FORMS_TUTORIAL_NAV_DATA,
  {
    path: 'tutorials',
    contentPath: 'tutorials/home',
    label: 'Туториалы',
  },
];

export const REFERENCE_SUB_NAVIGATION_DATA: NavigationItem[] = [
  {
    label: 'Дорожная карта',
    path: 'roadmap',
    contentPath: 'reference/roadmap',
  },
  {
    label: 'Присоединиться',
    path: 'https://github.com/angular/angular/blob/main/CONTRIBUTING.md',
  },
  {
    label: 'Справочник API',
    preserveOtherCategoryOrder: true,
    children: [
      {
        label: 'Обзор',
        path: 'api',
      },
      ...getApiNavigationItems(),
    ],
  },
  {
    label: 'Справочник CLI',
    children: [
      {
        label: 'Обзор',
        path: 'cli',
        contentPath: 'reference/cli',
      },
      {
        label: 'ng add',
        path: 'cli/add',
      },
      {
        label: 'ng analytics',
        children: [
          {
            label: 'Обзор',
            path: 'cli/analytics',
          },
          {
            label: 'disable',
            path: 'cli/analytics/disable',
          },
          {
            label: 'enable',
            path: 'cli/analytics/enable',
          },
          {
            label: 'info',
            path: 'cli/analytics/info',
          },
          {
            label: 'prompt',
            path: 'cli/analytics/prompt',
          },
        ],
      },
      {
        label: 'ng build',
        path: 'cli/build',
      },
      {
        label: 'ng cache',
        children: [
          {
            label: 'Обзор',
            path: 'cli/cache',
          },
          {
            label: 'clean',
            path: 'cli/cache/clean',
          },
          {
            label: 'disable',
            path: 'cli/cache/disable',
          },
          {
            label: 'enable',
            path: 'cli/cache/enable',
          },
          {
            label: 'info',
            path: 'cli/cache/info',
          },
        ],
      },
      {
        label: 'ng completion',
        children: [
          {
            label: 'Обзор',
            path: 'cli/completion',
          },
          {
            label: 'script',
            path: 'cli/completion/script',
          },
        ],
      },
      {
        label: 'ng config',
        path: 'cli/config',
      },
      {
        label: 'ng deploy',
        path: 'cli/deploy',
      },
      {
        label: 'ng e2e',
        path: 'cli/e2e',
      },
      {
        label: 'ng extract-i18n',
        path: 'cli/extract-i18n',
      },
      {
        label: 'ng generate',
        children: [
          {
            label: 'Обзор',
            path: 'cli/generate',
          },
          {
            label: 'ai-config',
            path: 'cli/generate/ai-config',
          },
          {
            label: 'app-shell',
            path: 'cli/generate/app-shell',
          },
          {
            label: 'application',
            path: 'cli/generate/application',
          },
          {
            label: 'class',
            path: 'cli/generate/class',
          },
          {
            label: 'component',
            path: 'cli/generate/component',
          },
          {
            label: 'config',
            path: 'cli/generate/config',
          },
          {
            label: 'directive',
            path: 'cli/generate/directive',
          },
          {
            label: 'enum',
            path: 'cli/generate/enum',
          },
          {
            label: 'environments',
            path: 'cli/generate/environments',
          },
          {
            label: 'guard',
            path: 'cli/generate/guard',
          },
          {
            label: 'interceptor',
            path: 'cli/generate/interceptor',
          },
          {
            label: 'interface',
            path: 'cli/generate/interface',
          },
          {
            label: 'library',
            path: 'cli/generate/library',
          },
          {
            label: 'module',
            path: 'cli/generate/module',
          },
          {
            label: 'pipe',
            path: 'cli/generate/pipe',
          },
          {
            label: 'resolver',
            path: 'cli/generate/resolver',
          },
          {
            label: 'service-worker',
            path: 'cli/generate/service-worker',
          },
          {
            label: 'service',
            path: 'cli/generate/service',
          },
          {
            label: 'web-worker',
            path: 'cli/generate/web-worker',
          },
        ],
      },
      {
        label: 'ng lint',
        path: 'cli/lint',
      },
      {
        label: 'ng new',
        path: 'cli/new',
      },
      {
        label: 'ng run',
        path: 'cli/run',
      },
      {
        label: 'ng serve',
        path: 'cli/serve',
      },
      {
        label: 'ng test',
        path: 'cli/test',
      },
      {
        label: 'ng update',
        path: 'cli/update',
      },
      {
        label: 'ng version',
        path: 'cli/version',
      },
    ],
  },
  {
    label: 'Энциклопедия ошибок',
    children: [
      {
        label: 'Обзор',
        path: 'errors',
        contentPath: 'reference/errors/overview',
      },
      ...ERRORS_NAV_DATA,
    ],
  },
  {
    label: 'Расширенная диагностика',
    children: [
      {
        label: 'Обзор',
        path: 'extended-diagnostics',
        contentPath: 'reference/extended-diagnostics/overview',
      },
      ...EXT_DIAGNOSTICS_NAV_DATA,
    ],
  },
  {
    label: 'Версионирование и релизы',
    path: 'reference/releases',
    contentPath: 'reference/releases',
  },
  {
    label: 'Совместимость версий',
    path: 'reference/versions',
    contentPath: 'reference/versions',
  },
  {
    label: 'Руководство по обновлению',
    path: 'update-guide',
  },
  {
    label: 'Конфигурации',
    children: [
      {
        label: 'Структура файлов',
        path: 'reference/configs/file-structure',
        contentPath: 'reference/configs/file-structure',
      },
      {
        label: 'Конфигурация рабочего пространства',
        path: 'reference/configs/workspace-config',
        contentPath: 'reference/configs/workspace-config',
      },
      {
        label: 'Опции компилятора Angular',
        path: 'reference/configs/angular-compiler-options',
        contentPath: 'reference/configs/angular-compiler-options',
      },
      {
        label: 'Зависимости npm',
        path: 'reference/configs/npm-packages',
        contentPath: 'reference/configs/npm-packages',
      },
    ],
  },
  {
    label: 'Миграции',
    children: [
      {
        label: 'Обзор',
        path: 'reference/migrations',
        contentPath: 'reference/migrations/overview',
      },
      {
        label: 'Standalone',
        path: 'reference/migrations/standalone',
        contentPath: 'reference/migrations/standalone',
      },
      {
        label: 'Синтаксис потока управления',
        path: 'reference/migrations/control-flow',
        contentPath: 'reference/migrations/control-flow',
      },
      {
        label: 'Функция inject()',
        path: 'reference/migrations/inject-function',
        contentPath: 'reference/migrations/inject-function',
      },
      {
        label: 'Маршруты с ленивой загрузкой',
        path: 'reference/migrations/route-lazy-loading',
        contentPath: 'reference/migrations/route-lazy-loading',
      },
      {
        label: 'Signal inputs',
        path: 'reference/migrations/signal-inputs',
        contentPath: 'reference/migrations/signal-inputs',
      },
      {
        label: 'Outputs',
        path: 'reference/migrations/outputs',
        contentPath: 'reference/migrations/outputs',
      },
      {
        label: 'Signal queries',
        path: 'reference/migrations/signal-queries',
        contentPath: 'reference/migrations/signal-queries',
      },
      {
        label: 'Очистка неиспользуемых импортов',
        path: 'reference/migrations/cleanup-unused-imports',
        contentPath: 'reference/migrations/cleanup-unused-imports',
      },
      {
        label: 'Самозакрывающиеся теги',
        path: 'reference/migrations/self-closing-tags',
        contentPath: 'reference/migrations/self-closing-tags',
      },
      {
        label: 'NgClass в Class',
        path: 'reference/migrations/ngclass-to-class',
        contentPath: 'reference/migrations/ngclass-to-class',
        status: 'new',
      },
      {
        label: 'NgStyle в Style',
        path: 'reference/migrations/ngstyle-to-style',
        contentPath: 'reference/migrations/ngstyle-to-style',
        status: 'new',
      },
      {
        label: 'Миграция модуля тестирования роутера',
        path: 'reference/migrations/router-testing-module-migration',
        contentPath: 'reference/migrations/router-testing-module-migration',
        status: 'new',
      },
      {
        label: 'CommonModule в Standalone',
        path: 'reference/migrations/common-to-standalone',
        contentPath: 'reference/migrations/common-to-standalone',
        status: 'new',
      },
    ],
  },
];

export const FOOTER_NAVIGATION_DATA: NavigationItem[] = [
  {
    label: 'Пресс-кит',
    path: 'press-kit',
    contentPath: 'reference/press-kit',
  },
  {
    label: 'Лицензия',
    path: 'license',
    contentPath: 'reference/license',
  },
];

export const ALL_ITEMS = [
  ...DOCS_SUB_NAVIGATION_DATA,
  ...REFERENCE_SUB_NAVIGATION_DATA,
  ...FOOTER_NAVIGATION_DATA,
  ...TUTORIALS_SUB_NAVIGATION_DATA,
];

function getApiNavigationItems(): NavigationItem[] {
  const manifest = API_MANIFEST_JSON as any; // TODO(mri): Use proper type when the refactoring of #66252 gets in.

  const apiNavigationItems: NavigationItem[] = [];

  for (const packageEntry of manifest) {
    const packageNavigationItem: NavigationItem = {
      label: packageEntry.moduleLabel,
      children: packageEntry.entries.map((api: any) => ({
        path: getApiUrl(packageEntry, api.name),
        label: api.name,
        category: api.category,
      })),
    };

    apiNavigationItems.push(packageNavigationItem);
  }

  return apiNavigationItems;
}

function getApiUrl(packageEntry: any, apiName: string): string {
  const packageName = packageEntry.normalizedModuleName
    // packages like `angular_core` should be `core`
    // packages like `angular_animation_browser` should be `animation/browser`
    .replace('angular_', '')
    .replaceAll('_', '/');
  return `api/${packageName}/${apiName}`;
}
