import {ConnectedOverlayDirective, OverlayOrigin} from '@angular/cdk/overlay';
import {ObserveContent} from '@angular/cdk/observers';
import {FocusTrapDirective} from '@angular/cdk/a11y';
import {FloatPlaceholderType, PlaceholderOptions, MAT_PLACEHOLDER_GLOBAL_OPTIONS} from '@angular/material';

const a = new ConnectedOverlayDirective();
const b = new OverlayOrigin();
const c = new ObserveContent();
const d = new FocusTrapDirective();

const e: FloatPlaceholderType = 'test';
const f: PlaceholderOptions = 'opt2';

const g = {provide: MAT_PLACEHOLDER_GLOBAL_OPTIONS, useValue: 'test-options'};
