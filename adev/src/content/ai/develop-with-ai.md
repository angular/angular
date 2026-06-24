# Промпты для LLM и настройка ИИ в IDE

Генерация кода с помощью больших языковых моделей (LLM) — это быстрорастущая область интереса для разработчиков. Хотя
LLM часто способны генерировать рабочий код, создание кода для постоянно развивающихся фреймворков, таких как Angular,
может быть сложной задачей.

Продвинутые инструкции и промптинг становятся новым стандартом для поддержки современной генерации кода с учетом
специфики предметной области. В этом разделе собраны материалы и ресурсы, способствующие более точной генерации кода для
Angular с помощью LLM.

## Пользовательские промпты и системные инструкции

Улучшите свой опыт генерации кода с помощью LLM, используя один из следующих пользовательских файлов, специфичных для
предметной области.

ПРИМЕЧАНИЕ: Эти файлы будут регулярно обновляться, чтобы соответствовать актуальным соглашениям Angular.

Ниже приведен набор инструкций, которые помогут LLM генерировать корректный код, соответствующий лучшим практикам
Angular. Этот файл можно включить в качестве системных инструкций для ваших ИИ-инструментов или добавить к вашему
промпту в качестве контекста.

<docs-code language="md" path="packages/core/resources/best-practices.md" class="compact"/>

<a download href="/assets/context/best-practices.md" target="_blank">Нажмите здесь, чтобы скачать файл
best-practices.md.</a>

## Файлы правил

Некоторые редакторы, такие
как <a href="https://studio.firebase.google.com?utm_source=adev&utm_medium=website&utm_campaign=BUILD_WITH_AI_ANGULAR&utm_term=angular_devrel&utm_content=build_with_ai_angular_firebase_studio">
Firebase Studio</a>, имеют файлы правил, полезные для предоставления критически важного контекста для LLM.

| Среда/IDE                | Файл правил                                                                                                            | Инструкции по установке                                                                                                                                         |
| :----------------------- | :--------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Firebase Studio          | <a download href="/assets/context/airules.md" target="_blank">airules.md</a>                                           | <a href="https://firebase.google.com/docs/studio/set-up-gemini#custom-instructions">Настроить `airules.md`</a>                                                  |
| IDE с поддержкой Copilot | <a download="copilot-instructions.md" href="/assets/context/guidelines.md" target="_blank">copilot-instructions.md</a> | <a href="https://code.visualstudio.com/docs/copilot/copilot-customization#_custom-instructions" target="_blank">Настроить `.github/copilot-instructions.md`</a> |
| Cursor                   | <a download href="/assets/context/angular-20.mdc" target="_blank">cursor.md</a>                                        | <a href="https://docs.cursor.com/context/rules" target="_blank">Настроить `cursorrules.md`</a>                                                                  |
| IDE JetBrains            | <a download href="/assets/context/guidelines.md" target="_blank">guidelines.md</a>                                     | <a href="https://www.jetbrains.com/help/junie/customize-guidelines.html" target="_blank">Настроить `guidelines.md`</a>                                          |
| VS Code                  | <a download=".instructions.md" href="/assets/context/guidelines.md" target="_blank">.instructions.md</a>               | <a href="https://code.visualstudio.com/docs/copilot/copilot-customization#_custom-instructions" target="_blank">Настроить `.instructions.md`</a>                |
| Windsurf                 | <a download href="/assets/context/guidelines.md" target="_blank">guidelines.md</a>                                     | <a href="https://docs.windsurf.com/windsurf/cascade/memories#rules" target="_blank">Настроить `guidelines.md`</a>                                               |

## Настройка сервера MCP в Angular CLI

Angular CLI включает экспериментальный [сервер Model Context Protocol (MCP)](https://modelcontextprotocol.io/), который
позволяет ИИ-ассистентам в вашей среде разработки взаимодействовать с Angular CLI.

[**Узнайте, как настроить сервер MCP в Angular CLI**](/ai/mcp)

## Предоставление контекста с помощью `llms.txt`

`llms.txt` — это предлагаемый стандарт для веб-сайтов, разработанный для того, чтобы помочь LLM лучше понимать и
обрабатывать их контент. Команда Angular разработала две версии этого файла, чтобы помочь LLM и инструментам,
использующим LLM для генерации кода, создавать более качественный современный код Angular.

- <a href="/llms.txt" target="_blank">llms.txt</a> — индексный файл, содержащий ссылки на ключевые файлы и ресурсы.
- <a href="/assets/context/llms-full.txt" target="_blank">llms-full.txt</a> — более полный набор ресурсов, описывающий,
  как работает Angular и как создавать приложения на Angular.

Обязательно [ознакомьтесь с обзорной страницей](/ai) для получения дополнительной информации о том, как интегрировать ИИ
в ваши приложения Angular.

## Web Codegen Scorer

Команда Angular разработала и открыла исходный код [Web Codegen Scorer](https://github.com/angular/web-codegen-scorer) —
инструмента для оценки качества веб-кода, сгенерированного ИИ. Вы можете использовать этот инструмент для принятия
обоснованных решений, касающихся сгенерированного ИИ кода, например, для тонкой настройки промптов с целью повышения
точности кода Angular, создаваемого LLM. Эти промпты можно включить в качестве системных инструкций для ваших
ИИ-инструментов или добавить к вашему промпту в качестве контекста. Вы также можете использовать этот инструмент для
сравнения качества кода, создаваемого различными моделями, и отслеживания качества с течением времени по мере развития
моделей и агентов.
