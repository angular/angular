# Промпты для LLM и настройка ИИ-IDE

Генерация кода с помощью больших языковых моделей (LLM) быстро набирает популярность среди разработчиков. Хотя LLM часто способны генерировать рабочий код, стабильно получать качественный код для постоянно развивающихся фреймворков вроде Angular бывает непросто.

Продвинутые инструкции и промптинг становятся стандартом поддержки современной генерации кода с учётом предметной области. В этом разделе собраны материалы и ресурсы, которые помогают LLM точнее генерировать код для Angular.

## Пользовательские промпты и системные инструкции {#custom-prompts-and-system-instructions}

Улучшите генерацию кода с LLM, используя один из следующих специализированных файлов.

NOTE: Эти файлы регулярно обновляются, чтобы соответствовать соглашениям Angular.

Ниже — набор инструкций, помогающих LLM генерировать корректный код по лучшим практикам Angular. Файл можно подключить как системные инструкции к ИИ-инструменту или добавить к промпту как контекст.

<docs-code language="md" path="packages/core/resources/best-practices.md" class="compact"/>

<a download href="/assets/context/best-practices.md" target="_blank">Нажмите здесь, чтобы скачать файл best-practices.md.</a>

## Файлы правил {#rules-files}

В ряде редакторов, например в <a href="https://studio.firebase.google.com?utm_source=adev&utm_medium=website&utm_campaign=BUILD_WITH_AI_ANGULAR&utm_term=angular_devrel&utm_content=build_with_ai_angular_firebase_studio" target="_blank">Firebase Studio</a>, есть файлы правил, полезные для передачи критически важного контекста LLM.

| Среда/IDE            | Файл правил                                                                                                            | Инструкции по установке                                                                                                                                         |
| :------------------- | :--------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Firebase Studio      | <a download href="/assets/context/airules.md" target="_blank">airules.md</a>                                           | <a href="https://firebase.google.com/docs/studio/set-up-gemini#custom-instructions" target="_blank">Настройка `airules.md`</a>                                  |
| IDE на базе Copilot  | <a download="copilot-instructions.md" href="/assets/context/guidelines.md" target="_blank">copilot-instructions.md</a> | <a href="https://code.visualstudio.com/docs/copilot/copilot-customization#_custom-instructions" target="_blank">Настройка `.github/copilot-instructions.md`</a> |
| Cursor               | <a download href="/assets/context/angular-20.mdc" target="_blank">cursor.md</a>                                        | <a href="https://docs.cursor.com/context/rules" target="_blank">Настройка `cursorrules.md`</a>                                                                  |
| JetBrains IDEs       | <a download href="/assets/context/guidelines.md" target="_blank">guidelines.md</a>                                     | <a href="https://www.jetbrains.com/help/junie/customize-guidelines.html" target="_blank">Настройка `guidelines.md`</a>                                          |
| VS Code              | <a download=".instructions.md" href="/assets/context/guidelines.md" target="_blank">.instructions.md</a>               | <a href="https://code.visualstudio.com/docs/copilot/copilot-customization#_custom-instructions" target="_blank">Настройка `.instructions.md`</a>                |
| Windsurf             | <a download href="/assets/context/guidelines.md" target="_blank">guidelines.md</a>                                     | <a href="https://docs.windsurf.com/windsurf/cascade/memories#rules" target="_blank">Настройка `guidelines.md`</a>                                               |

## Настройка Angular CLI MCP Server {#angular-cli-mcp-server-setup}

Angular CLI включает экспериментальный [Model Context Protocol (MCP) server](https://modelcontextprotocol.io/), который позволяет ИИ-ассистентам в среде разработки взаимодействовать с Angular CLI.

[**Узнайте, как настроить Angular CLI MCP Server**](/ai/mcp)

## Контекст с помощью `llms.txt` {#providing-context-with-llmstxt}

`llms.txt` — предлагаемый стандарт для сайтов, помогающий LLM лучше понимать и обрабатывать их содержимое. Команда Angular подготовила две версии этого файла, чтобы LLM и инструменты на их основе генерировали более качественный современный код Angular.

- <a href="/llms.txt" target="_blank">llms.txt</a> — индексный файл со ссылками на ключевые файлы и ресурсы.
- <a href="/assets/context/llms-full.txt" target="_blank">llms-full.txt</a> — более полный набор материалов о том, как устроен Angular и как создавать Angular-приложения.

Обязательно загляните на [обзорную страницу](/ai), чтобы узнать больше об интеграции ИИ в Angular-приложения.

## Web Codegen Scorer {#web-codegen-scorer}

Команда Angular разработала и открыла исходный код [Web Codegen Scorer](https://github.com/angular/web-codegen-scorer) — инструмента для оценки качества веб-кода, сгенерированного ИИ. С его помощью можно принимать решения на основе данных: например, дорабатывать промпты, чтобы повысить точность кода Angular от LLM. Такие промпты можно подключать как системные инструкции к ИИ-инструменту или как контекст к запросу. Также инструмент позволяет сравнивать качество кода разных моделей и отслеживать его со временем по мере развития моделей и агентов.
