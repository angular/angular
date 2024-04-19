import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DownloaderService } from './downloader.service';

@Component({
  standalone: true,
  selector: 'app-downloader',
  templateUrl: './downloader.component.html',
  imports: [ CommonModule ],
  providers: [ DownloaderService ]
})
export class DownloaderComponent {
  contents: string | undefined;
  constructor(private downloaderService: DownloaderService) {}

  clear() {
    this.contents = undefined;
  }

  // #docregion download
  download() {
    this.downloaderService.getTextFile('assets/textfile.txt')
      .subscribe(results => this.contents = results);
  }
  // #enddocregion download
}
