import {FloatLabelType, LabelOptions, MAT_LABEL_GLOBAL_OPTIONS} from '@angular/material';

const a: FloatLabelType = 'test';
const b: LabelOptions = 'opt2';

const c = {provide: MAT_LABEL_GLOBAL_OPTIONS, useValue: 'test-options'};
