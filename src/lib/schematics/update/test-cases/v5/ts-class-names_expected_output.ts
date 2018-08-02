import {CdkConnectedOverlay, CdkOverlayOrigin} from '@angular/cdk/overlay';
import {CdkObserveContent} from '@angular/cdk/observers';
import {CdkTrapFocus} from '@angular/cdk/a11y';
import {FloatLabelType, LabelOptions, MAT_LABEL_GLOBAL_OPTIONS} from '@angular/material';

const a = new CdkConnectedOverlay();
const b = new CdkOverlayOrigin();
const c = new CdkObserveContent();
const d = new CdkTrapFocus();

const e: FloatLabelType = 'test';
const f: LabelOptions = 'opt2';

const g = {provide: MAT_LABEL_GLOBAL_OPTIONS, useValue: 'test-options'};
