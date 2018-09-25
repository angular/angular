import {FloatPlaceholderType, PlaceholderOptions, MAT_PLACEHOLDER_GLOBAL_OPTIONS} from '@angular/material';

const a: FloatPlaceholderType = 'test';
const b: PlaceholderOptions = 'opt2';

const c = {provide: MAT_PLACEHOLDER_GLOBAL_OPTIONS, useValue: 'test-options'};
