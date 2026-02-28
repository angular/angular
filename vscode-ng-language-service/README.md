# Angular Language Service

![demo](https://github.com/angular/vscode-ng-language-service/raw/main/demo.gif)

## Features

This extension provides a rich editing experience for Angular templates, both inline
and external templates including:

- Completions lists
- AOT Diagnostic messages
- Quick info
- Go to definition
- Document Symbols for Outline panel, breadcrumbs, and "Go to Symbol"

## Download

Download the extension from [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template).

## Configuring compiler options for the Angular Language Service

The Angular Language Service uses the same set of options that are used to compile the application.
To get the most complete information in the editor, set the `strictTemplates` option in `tsconfig.json`,
as shown in the following example:

```
"angularCompilerOptions": {
  "strictTemplates": true
}
```

For more information, see the [Angular compiler options](https://angular.io/guide/angular-compiler-options) guide.

## Extension Settings

### Document Symbols

Document Symbols enable the Outline panel, breadcrumbs navigation, and "Go to Symbol" (Cmd+Shift+O / Ctrl+Shift+O) to show Angular template elements like `@if`, `@for`, structural directives, and template references.

| Setting                                            | Default | Description                                                                                  |
| -------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------- |
| `angular.documentSymbols.enabled`                  | `true`  | Enable Angular-specific document symbols                                                     |
| `angular.documentSymbols.showImplicitForVariables` | `false` | Show implicit `@for` loop variables (`$index`, `$count`, `$first`, `$last`, `$even`, `$odd`) |

For TypeScript files with inline templates, the Outline shows only the component class with template symbols nested inside:

```
MyComponent (class)
└── (template)
    ├── @if (condition)
    └── <button>
```

Example configuration:

```json
{
  "angular.documentSymbols.enabled": true,
  "angular.documentSymbols.showImplicitForVariables": false
}
```

## Versioning

The language service extension relies on the `@angular/language-service` and `typescript` packages
for its backend. `@angular/language-service` is always bundled with the extension, and is always
the latest version at the time of the release.
`typescript` is loaded, in order of priority, from:

1. The path specified by `typescript.tsdk` in project or global settings.
2. _(Recommended)_ The version of `typescript` bundled with the Angular Language Service extension.
3. The version of `typescript` present in the current workspace's node_modules.

We suggest **not** specifying `typescript.tsdk` in your VSCode settings
per method (1) above. If the `typescript` package is loaded by
methods (1) or (3), there is a potential for a mismatch between
the API expected by `@angular/language-service` and the API provided by `typescript`. This could
lead to a failure of the language service extension.

For more information, please see [#594](https://github.com/angular/vscode-ng-language-service/issues/594).

## Installing a particular release build

Download the `.vsix` file for the release that you want to install from the [releases](https://github.com/angular/angular/releases?q=vscode&expanded=true) tab.

_Do not open the .vsix file directly_. Instead, in Visual Studio code, go to the extensions tab. Click on the "..." menu in the upper right corner of the extensions tab, select "Install from vsix..." and then select the .vsix file for the release you just downloaded.

The extension can also be installed with the following command:

```
code --install-extension /path/to/ngls.vsix
```

## Angular Language Service for Other Editors

- [coc-angular](https://github.com/iamcco/coc-angular) for ([Neo](https://neovim.io))[vim](https://www.vim.org/)
- [nvim-lspconfig](https://github.com/neovim/nvim-lspconfig/blob/master/doc/configs.md#angularls) for [Neovim](https://neovim.io)
- [Wild Web Developer](https://github.com/eclipse/wildwebdeveloper) for Eclipse
- [lsp-mode](https://github.com/emacs-lsp/lsp-mode) for Emacs
