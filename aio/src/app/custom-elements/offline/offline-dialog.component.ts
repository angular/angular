import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'aio-offline-dialog',
  templateUrl: './offline-dialog.component.html',
})
export class OfflineDialogComponent {

  constructor(public dialogRef: MatDialogRef<OfflineDialogComponent>) { }

  async downloadDocs(){
    try {
      const manifest = await fetch('ngsw.json').then(res => res.json());
      const lazyUrls = manifest.assetGroups.find((g:any) => g.name === 'docs-lazy').urls;

      const start = performance.now();
      const responses = await Promise.all(lazyUrls.map((u:any) => fetch(u)));
      const failed = responses.filter((r:any) => !r.ok);
      const failedCount = failed.length;
      const duration = Math.round((performance.now() - start) / 1000);
      failed.forEach((failure:any)=> console.log(`Failed to fetch ${failure.url}. Time Taken ${duration}. Total failed urls ${failedCount}`))
    } catch (err) {
      console.error(err);
    }
  }

  closeDialog(){
    this.dialogRef.close();
  }

}
