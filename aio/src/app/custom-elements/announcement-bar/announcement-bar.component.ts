import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Logger } from 'app/shared/logger.service';
import { CONTENT_URL_PREFIX } from 'app/documents/document.service';
const announcementsPath = CONTENT_URL_PREFIX + 'announcements.json';

export interface Announcement {
  imageUrl: string;
  message: string;
  linkUrl: string;
  startDate: string;
  endDate: string;
}

/**
 * Display the latest live announcement. This is used on the homepage.
 *
 * The data for the announcements is kept in `aio/content/marketing/announcements.json`.
 *
 * The format for that data file looks like:
 *
 * ```
 * [
 *   {
 *     "startDate": "2018-02-01",
 *     "endDate": "2018-03-01",
 *     "message": "This is an <b>important</b> announcement",
 *     "imageUrl": "url/to/image",
 *     "linkUrl": "url/to/website"
 *   },
 *   ...
 * ]
 * ```
 *
 * Only one announcement will be shown at any time. This is determined as the first "live"
 * announcement in the file, where "live" means that its start date is before today, and its
 * end date is after today.
 *
 * **Security Note:**
 * The `message` field can contain unsanitized HTML but this field should only updated by
 * verified members of the Angular team.
 */
@Component({
  selector: 'aio-announcement-bar',
  template: `
  <div class="homepage-container" *ngIf="announcement">
    <div class="announcement-bar">
      <img [src]="announcement.imageUrl" alt="">
      <p [innerHTML]="announcement.message"></p>
      <a class="button" [href]="announcement.linkUrl">Learn More</a>
    </div>
  </div>`
})
export class AnnouncementBarComponent implements OnInit {
  announcement: Announcement;

  constructor(private http: HttpClient, private logger: Logger) {}

  ngOnInit() {
    this.http.get<Announcement[]>(announcementsPath)
      .pipe(
        catchError(error => {
          this.logger.error(new Error(`${announcementsPath} request failed: ${error.message}`));
          return [];
        }),
        map(announcements => this.findCurrentAnnouncement(announcements)),
        catchError(error => {
          this.logger.error(new Error(`${announcementsPath} contains invalid data: ${error.message}`));
          return [];
        }),
      )
      .subscribe(announcement => this.announcement = announcement);
  }

  /**
   * Get the first date in the list that is "live" now
   */
  private findCurrentAnnouncement(announcements: Announcement[]) {
    return announcements
      .filter(announcement => new Date(announcement.startDate).valueOf() < Date.now())
      .filter(announcement => new Date(announcement.endDate).valueOf() > Date.now())
      [0];
  }
}
