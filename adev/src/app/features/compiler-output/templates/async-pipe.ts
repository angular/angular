export const asyncPipeTemplate = `<div>
  {{projects$ | async}}
</div>

<div>
  @if (users$ | async; as users) {
    {{ users.length }}
  }
<div>`;
