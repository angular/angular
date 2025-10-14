/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export declare const formControlNameExample = "\n  <div [formGroup]=\"myGroup\">\n    <input formControlName=\"firstName\">\n  </div>\n\n  In your class:\n\n  this.myGroup = new FormGroup({\n      firstName: new FormControl()\n  });";
export declare const formGroupNameExample = "\n  <div [formGroup]=\"myGroup\">\n      <div formGroupName=\"person\">\n        <input formControlName=\"firstName\">\n      </div>\n  </div>\n\n  In your class:\n\n  this.myGroup = new FormGroup({\n      person: new FormGroup({ firstName: new FormControl() })\n  });";
export declare const formArrayNameExample = "\n  <div [formGroup]=\"myGroup\">\n    <div formArrayName=\"cities\">\n      <div *ngFor=\"let city of cityArray.controls; index as i\">\n        <input [formControlName]=\"i\">\n      </div>\n    </div>\n  </div>\n\n  In your class:\n\n  this.cityArray = new FormArray([new FormControl('SF')]);\n  this.myGroup = new FormGroup({\n    cities: this.cityArray\n  });";
export declare const ngModelGroupExample = "\n  <form>\n      <div ngModelGroup=\"person\">\n        <input [(ngModel)]=\"person.name\" name=\"firstName\">\n      </div>\n  </form>";
export declare const ngModelWithFormGroupExample = "\n  <div [formGroup]=\"myGroup\">\n      <input formControlName=\"firstName\">\n      <input [(ngModel)]=\"showMoreControls\" [ngModelOptions]=\"{standalone: true}\">\n  </div>\n";
