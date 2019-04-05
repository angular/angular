# VSCode Configuration

This folder contains opt-in [Workspace Settings](https://code.visualstudio.com/docs/getstarted/settings) and [Extension Recommendations](https://code.visualstudio.com/docs/editor/extension-gallery#_workspace-recommended-extensions) that the Angular team recommends using when working on this repository.

## Usage

To use the recommended settings follow the steps below:

- install <https://marketplace.visualstudio.com/items?itemName=xaver.clang-format>
- copy `.vscode/recommended-settings.json` to `.vscode/settings.json`
- restart the editor

If you already have your custom workspace settings you should instead manually merge the file content.

This isn't an automatic process so you will need to repeat it when settings are updated.

To see the recommended extensions select "Extensions: Show Recommended Extensions" in the [Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette).

## Editing `.vscode/recommended-settings.json`

If you wish to add extra configuration items please keep in mind any settings you add here will be used by many users.

Try to keep these settings to things that help facilitate the development process and avoid altering the user workflow whenever possible.
