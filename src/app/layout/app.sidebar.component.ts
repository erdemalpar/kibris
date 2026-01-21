import {
    AfterViewInit,
    Component,
    ElementRef,
    OnDestroy,
    ViewChild,
} from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { MainMapService } from 'src/app/features/map-view/main-map/services/main-map.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './app.sidebar.component.html',
})
export class AppSidebarComponent implements OnDestroy {
    timeout: any = null;

    @ViewChild('menuContainer') menuContainer!: ElementRef;

    selectedMapType: string = 'googleSat'; // Varsayılan harita OpenStreetMap
    googleLabelsActive = true;

    constructor(public layoutService: LayoutService, public el: ElementRef, private mainMapService: MainMapService) {}

    resetOverlay() {
        if (this.layoutService.state.overlayMenuActive) {
            this.layoutService.state.overlayMenuActive = false;
        }
    }

    ngOnDestroy() {
        this.resetOverlay();
    }

    onMapTypeChange(type: string) {
        //this.selectedMapType = type;
        this.mainMapService.changeBaseMap(type); // Harita tipini değiştir
    }

    onLabelChange(type: string, checked: boolean): void {
        this.googleLabelsActive = checked;
        this.mainMapService.toggleOverlayLayer(type, checked);
    }
}
