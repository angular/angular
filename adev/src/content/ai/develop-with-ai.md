# LLM prompts and AI IDE setup
Generating code with large language models (LLMs) is a rapidly growing area of interest for developers. While LLMs are often capable of generating working code it can be a challenge to generate code for consistently evolving frameworks like Angular.

Advanced instructions and prompting are an emerging standard for supporting modern code generation with domain specific details. This section contains curated content and resources to support more accurate code generation for Angular and LLMs.

## Custom Prompts and System Instructions
Improve your experience generating code with LLMs by using one of the following custom, domain specific files.

NOTE: These files will be updated on a regular basis staying up to date with Angular's conventions.

* <a href="/context/best-practices.md" target="_blank">best-practices.md</a> - a set of instructions to help LLMs generate correct code that follows Angular best practices. This file can be included as system instructions to your AI tooling or included along with your prompt as context.

## Rules Files
Several editors, such as <a href="https://studio.firebase.google.com?utm_source=adev&utm_medium=website&utm_campaign=BUILD_WITH_AI_ANGULAR&utm_term=angular_devrel&utm_content=build_with_ai_angular_firebase_studio">Firebase Studio</a> have rules files useful for providing critical context to LLMs.

| Environment/IDE | Rules File                                                      | Installation Instructions                                                                                              |
|:----------------|:----------------------------------------------------------------|:-----------------------------------------------------------------------------------------------------------------------|
| Firebase Studio | <a download href="/context/airules.md" target="_blank">airules.md</a>    | <a href="https://firebase.google.com/docs/studio/set-up-gemini#custom-instructions">Configure `airules.md`</a>         |
| Cursor          | <a download href="/context/angular-20.mdc" target="_blank">cursor.md</a> | <a href="https://docs.cursor.com/context/rules" target="_blank">Configure `cursorrules.md`</a>                         |
| JetBrains IDEs  | <a download href="/context/guidelines.md" target="_blank">guidelines.md</a>  | <a href="https://www.jetbrains.com/help/junie/customize-guidelines.html" target="_blank">Configure `guidelines.md`</a> |

## Providing Context with `llms.txt`
`llms.txt` is a proposed standard for websites designed to help LLMs better understand and process their content. The Angular team has developed two versions of this file to help LLMs and tools that use LLMs for code generation to create better modern Angular code.


* <a href="/llms.txt" target="_blank">llms.txt</a> - an index file providing links to key files and resources. 
* <a href="/llms-full.txt" target="_blank">llms-full.txt</a> - a more robust compiled set of resources describing how Angular works and how to build Angular applications.

Be sure [to check out the overview page](/ai) for more information on how to integrate AI into your Angular applications.