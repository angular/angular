import {Component} from '@angular/core';

@Component({
  selector: 'app-css-scopes',
  template: `
    <section>
      <div class="caseTsInlineColorExpr" [style.color]="inlineExprColor">ts-inline-color-expr</div>
      <div class="caseTsInlineColorLiteral" [style.color]="'oklch(58% 0.17 250)'">
        ts-inline-color-literal
      </div>
      <div class="caseTsInlineLiteral" [style.width.px]="'320'">ts-inline-width-320</div>
      <div class="caseTsInlineLiteralWithUnit" [style.width.px]="'2px'">ts-inline-width-2px</div>
      <div class="caseTsInlineNumeric" [style.width.px]="320">ts-inline-width-number</div>
      <div class="caseTsInlineExpr" [style.width.px]="dynamicWidthPx">ts-inline-width-expr</div>
      <div
        [style]="{
          color: 'oklch(62% 0.19 275)',
          'background-color': 'hsl(210 70% 40%)',
          '--chip-gap': 'calc(var(--gap, 4px) * 2)',
        }"
      >
        ts-inline-style-object
      </div>
      <div
        [attr.style]="'color: color-mix(in oklab, red 40%, blue); width: clamp(12rem, 50vw, 40rem); --pad: calc(var(--base, 4px) * 3)'"
      >
        ts-inline-attr-style
      </div>
    </section>
  `,
  styles: `
    .caseParity {
      width: 320px;
      color: rgb(10 20 30 / 0.8);
      --space-token: 8px;
    }
  `,
  standalone: false,
})
export class CssScopesComponent {
  dynamicWidthPx = 320;
  inlineExprColor = 'rebeccapurple';
  items = [1, 2, 3];

  exprColor = 'teal';
  exprBackground = 'mintcream';
  exprCustomProp = '12px';
  exprWidth = 280;
  dynamicStyle = 'color: red';
  isActive = true;
}
