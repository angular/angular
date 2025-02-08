# @defer dependencies failed to load

This error occurs when loading dependencies for a `@defer` block fails (typically due to poor network conditions) and no `@error` block has been configured to handle the failure state. Having no `@error` block in this scenario may create a poor user experience.

## Debugging the error
Verify that you added `@error` blocks to your `@defer` blocks to handle failure states.