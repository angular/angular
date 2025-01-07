import {Component} from '@angular/core';
import {form} from '../form';
import {address} from '../address';
import {YupWrapperComponent} from './yup/yup-wrapper.component';
import {ZodWrapperComponent} from './zod/zod-wrapper.component';
import {AjvWrapperComponent} from './ajv/ajv-wrapper.component';
import {JoiWrapperComponent} from './joi/joi-wrapper.component';

@Component({
  selector: 'app-schemas',
  standalone: true,
  imports: [YupWrapperComponent, ZodWrapperComponent, AjvWrapperComponent, JoiWrapperComponent],
  template: `
    <h1>Schemas</h1>
    <h2>Yup</h2>
    <app-yup-wrapper></app-yup-wrapper>

    <h2>Zod</h2>
      <app-zod-wrapper></app-zod-wrapper>

    <h2>AJV</h2>
    <app-ajv-wrapper></app-ajv-wrapper>

    <h2>Joi</h2>
    <app-joi-wrapper></app-joi-wrapper>
  `,
})
export class SchemasComponent {}
