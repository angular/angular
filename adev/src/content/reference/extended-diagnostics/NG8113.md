# Unused Standalone Imports

This diagnostic detects cases where the `imports` array of a `@Component` contains symbols that
aren't used within the template.

<docs-code language="typescript">

@Component({
  imports: [UsedDirective, UnusedPipe]
})
class AwesomeCheckbox {}

</docs-code>

## What's wrong with that?

The unused imports add unnecessary noise to your code and can increase your compilation time.

## What should I do instead?

Delete the unused import.

<docs-code language="typescript">

@Component({
  imports: [UsedDirective]
})
class AwesomeCheckbox {}

</docs-code>

## What if I can't avoid this?

This diagnostic can be disabled by editing the project's `tsconfig.json` file:

<docs-code language="json">
{
  "angularCompilerOptions": {
    "extendedDiagnostics": {
      "checks": {
        "unusedStandaloneImports": "suppress"
      }
    }
  }
}
</docs-code>

See [extended diagnostic configuration](extended-diagnostics#configuration) for more info.
