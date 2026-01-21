import {Component} from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { MenuService } from './app.menu.service';
import { GmlDownloadStatusService } from '../roles/operator/gml-factory/services/gml-download-status.service';

@Component({
    selector: 'app-footer',
    templateUrl: './app.footer.component.html'
})
export class AppFooterComponent {

    isDownloading = false;
    progressValue = 0;
    constructor(
        public layoutService: LayoutService,
        public menuService: MenuService,
        public gmlDownloadStatusService: GmlDownloadStatusService
    ) {
        this.gmlDownloadStatusService.isDownloading$.subscribe(val => {
          //  console.log('isDownloading:', val);
        });


        this.gmlDownloadStatusService.progressValue$.subscribe(val => {
          //  console.log('progressValue:', val);
        });
        this.gmlDownloadStatusService.isDownloading$.subscribe(value => this.isDownloading = value);
        this.gmlDownloadStatusService.progressValue$.subscribe(value => this.progressValue = value);
    }
}
