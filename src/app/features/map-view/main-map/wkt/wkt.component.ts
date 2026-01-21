import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { DialogService } from '../services/dialog.service';
import { MapDrawService } from '../services/map-draw.service';

@Component({
    selector: 'app-wkt',
    templateUrl: './wkt.component.html',
    styleUrls: ['./wkt.component.scss']
})
export class WktComponent {

    displayDialog = false;
    minimized = false;
    wktText: string = '';

    private subs: Subscription[] = [];

    constructor(private dialogService: DialogService, private mapDrawService: MapDrawService) { }
   
    ngOnInit() {
        this.subs.push(
            this.dialogService.getDialogState$('wkt').subscribe(state => {
                // Dialog açılıyorsa wktText sıfırlansın
                if (state.visible && !this.displayDialog) {
                    this.wktText = '';
                }
                this.displayDialog = state.visible;
                this.minimized = state.minimized;
            })
        );

        // MapDrawService’den gelen WKT’yi dinle
        this.subs.push(
            this.mapDrawService.wkt$.subscribe(wkt => {
                if (this.displayDialog) {
                    this.wktText = wkt;
                }
            })
        );
    }

    ngOnDestroy() {
        this.subs.forEach(s => s.unsubscribe());
    }


    closeDialog() {
        this.dialogService.hideDialog('wkt');
        this.mapDrawService.resetWKT(); // Eski çizimleri temizle
    }

    showWKTOnMap() {
      //  console.log('WKT haritada gösterilecek:', this.wktText);
        this.mapDrawService.showWKTOnMap(this.wktText);
    }

    toggleMinimize() {
        this.dialogService.toggleMinimize('wkt');
    }


}
