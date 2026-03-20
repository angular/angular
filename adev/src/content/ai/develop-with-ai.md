# LLM prompts and AI IDE setup

Generating code with large language models (LLMs) is a rapidly growing area of interest for developers. While LLMs are often capable of generating working code it can be a challenge to generate code for consistently evolving frameworks like Angular.

Advanced instructions and prompting are an emerging standard for supporting modern code generation with domain specific details. This section contains curated content and resources to support more accurate code generation for Angular and LLMs.

## Custom Prompts and System Instructions

Improve your experience generating code with LLMs by using one of the following custom, domain specific files.

NOTE: These files will be updated on a regular basis staying up to date with Angular's conventions.

Here is a set of instructions to help LLMs generate correct code that follows Angular best practices. This file can be included as system instructions to your AI tooling or included along with your prompt as context.

<docs-code language="md" path="packages/core/resources/best-practices.md" class="compact"/>

<a download href="/assets/context/best-practices.md" target="_blank">Click here to download the best-practices.md file.</a>

## Rules Files

Several editors, such as <a href="https://studio.firebase.google.com?utm_source=adev&utm_medium=website&utm_campaign=BUILD_WITH_AI_ANGULAR&utm_term=angular_devrel&utm_content=build_with_ai_angular_firebase_studio">Firebase Studio</a> have rules files useful for providing critical context to LLMs.

| Environment/IDE      | Rules File                                                                                                             | Installation Instructions                                                                                                                                       |
| :------------------- | :--------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Firebase Studio      | <a download href="/assets/context/airules.md" target="_blank">airules.md</a>                                           | <a href="https://firebase.google.com/docs/studio/set-up-gemini#custom-instructions">Configure `airules.md`</a>                                                  |
| Copilot powered IDEs | <a download="copilot-instructions.md" href="/assets/context/guidelines.md" target="_blank">copilot-instructions.md</a> | <a href="https://code.visualstudio.com/docs/copilot/copilot-customization#_custom-instructions" target="_blank">Configure `.github/copilot-instructions.md`</a> |
| Cursor               | <a download href="/assets/context/angular-20.mdc" target="_blank">cursor.md</a>                                        | <a href="https://docs.cursor.com/context/rules" target="_blank">Configure `cursorrules.md`</a>                                                                  |
| JetBrains IDEs       | <a download href="/assets/context/guidelines.md" target="_blank">guidelines.md</a>                                     | <a href="https://www.jetbrains.com/help/junie/customize-guidelines.html" target="_blank">Configure `guidelines.md`</a>                                          |
| VS Code              | <a download=".instructions.md" href="/assets/context/guidelines.md" target="_blank">.instructions.md</a>               | <a href="https://code.visualstudio.com/docs/copilot/copilot-customization#_custom-instructions" target="_blank">Configure `.instructions.md`</a>                |
| Windsurf             | <a download href="/assets/context/guidelines.md" target="_blank">guidelines.md</a>                                     | <a href="https://docs.windsurf.com/windsurf/cascade/memories#rules" target="_blank">Configure `guidelines.md`</a>                                               |

## Angular CLI MCP Server setup

The Angular CLI includes an experimental [Model Context Protocol (MCP) server](https://modelcontextprotocol.io/) that allows AI assistants in your development environment to interact with the Angular CLI.

[**Learn how to set up the Angular CLI MCP Server**](/ai/mcp)

## Providing Context with `llms.txt`

`llms.txt` is a proposed standard for websites designed to help LLMs better understand and process their content. The Angular team has developed two versions of this file to help LLMs and tools that use LLMs for code generation to create better modern Angular code.

- <a href="/llms.txt" target="_blank">llms.txt</a> - an index file providing links to key files and resources.
- <a href="/assets/context/llms-full.txt" target="_blank">llms-full.txt</a> - a more robust compiled set of resources describing how Angular works and how to build Angular applications.

Be sure [to check out the overview page](/ai) for more information on how to integrate AI into your Angular applications.

## Web Codegen Scorer

The Angular team developed and open-sourced the [Web Codegen Scorer](https://github.com/angular/web-codegen-scorer), a tool to evaluate and score the quality of AI generated web code. You can use this tool to make evidence-based decisions relating to AI-generated code, such as fine-tuning prompts to improve the accuracy of LLM-generated code for Angular. These prompts can be included as system instructions for your AI tooling or as context with your prompt. You can also use this tool to compare the quality of code produced by different models and monitor quality over time as models and agents evolve.
