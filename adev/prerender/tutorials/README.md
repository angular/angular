# Tutorial Scripts

The tutorials scripts are responsible for generating the tutorials source code and metadata by reading the tutorials content from [`src/content/tutorials`](/src/content/tutorials).

_See [the tutorials content README](/src/content/tutorials/README.md) for more information about the tutorials content._

For each tutorial, the following JSON files are generated and stored at `src/assets/tutorials`:

- `source-code/<tutorial-pathname>.json`: contains the tutorial source code in the [WebContainer](https://webcontainers.io) `FileSystemTree` format. It's
  used to mount the tutorial files in the WebContainer. See the WebContainer docs for more info: <https://webcontainers.io/guides/working-with-the-file-system>
- `metadata/<tutorial-pathname>.json`: the tutorial metadata has all the information necessary to manage the tutorial in app.
  It contains the tutorial `config.json`, the previous and next step, the next tutorial, and the code editor file paths and contents.
- `routes.json`: defines all routes for the tutorials, used at [`src/app/sub-navigation-data.ts`](/src/app/sub-navigation-data.ts) to populate the tutorials nav.

## Usage

```bash
yarn generate-tutorials
```
