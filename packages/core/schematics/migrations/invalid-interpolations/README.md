## Invalid interpolation-like markup

This schematic fixes interpolation-like markup no longer accepted by
the Anuglar compiler since invalidated by #39107.

Previously, the angular parser would not match markup like
`{{ 1 + 2 }` or `{{ 1 + 2 }<!-- -->}` to be partial (but malformed)
interpolations, an implementation detail that some developers may have
relied on to treat interpolation-like markup as text.

However, this kind of markup may be ambiguous, and since #39107, is not
well-formed. In such cases it is preferred to use an interpolation
directly or escape interpolation delimiters (e.g. `{{ '{{' }} 1 + 2
{{ '}}' }}`). This commit provides fixes for malformed cases so as to
ease migration for applications relying on the previous implementation.
