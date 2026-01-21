import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class GmlDownloadStatusService {
    isDownloading$ = new BehaviorSubject<boolean>(false);
    progressValue$ = new BehaviorSubject<number>(0);
}
