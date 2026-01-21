import { Component } from '@angular/core';
import { MainMapService } from '../main-map/services/main-map.service';
import { MapDrawService } from '../main-map/services/map-draw.service';
import { DialogService } from '../main-map/services/dialog.service';
import { CustomMessageService } from '../../../core/services/custom-message.service';
import { MapToolbarService } from '../main-map/services/map-toolbar.service';

@Component({
    selector: 'app-map-toolbar',
    templateUrl: './map-toolbar.component.html',
    styleUrls: ['./map-toolbar.component.scss']
})
export class MapToolbarComponent {
    constructor(
        private mainMapService: MainMapService,
        private mapDrawService: MapDrawService,
        private dialogService: DialogService,
        private customMessageService: CustomMessageService,
        private mapToolbarService: MapToolbarService
    ) { }

    wktMenuOpen: boolean = false; // WKT menüsü açık/kapalı durumu

    openMenu: string | null = null;
    //selectedMapType: string | null = null;
    selectedMapType: string = 'openstreetmap';
    selectedLayerTypes: string[] = [];
    isMapOpen: boolean = false;
    isLayerOpen: boolean = false;
    moduleExpanded = false;
    googleLabels = {
        active: false
    };

    mapTypes = [
        { label: 'Google Map', value: 'googleMap' },
        { label: 'Google Uydu', value: 'googleSat' },
        { label: 'OpenStreetMap', value: 'openstreetmap', active: true },
        { label: 'HGM', value: 'hgm' },
        { label: 'Kıbrıs', value: 'kibris' },
        { label: 'Google Etiket', value: 'googleLabels', isLabel: true, active: false },
        { label: 'Kıbrıs Saydam', value: 'kibrisSaydam', isLabel: true, active: false },
        { label: 'Değerlendirme', value: 'degerlemeGuncel', isLabel: true, active: false },
        { label: 'Değerlendirme Tematik', value: 'degerlemeTematik', isLabel: true, active: false }
    ];

    zoomIn() {
        this.mainMapService.getMap().zoomIn();
    }

    zoomOut() {
        this.mainMapService.getMap().zoomOut();
    }

    drawLine(): void {
        const map = this.mainMapService.getMap();
        if (map) {
            this.mapDrawService.startLineDrawing(map);
        } else {
            this.customMessageService.displayWarningMessage("Harita henüz yüklenmedi.");
        }
    }

    drawPolygon(): void {
        const map = this.mainMapService.getMap();
        if (map) {
            this.mapDrawService.startPolygonDrawing(map);
        } else {
            this.customMessageService.displayWarningMessage("Harita henüz yüklenmedi.");
        }
    }


    drawPoint() {
        const map = this.mainMapService.getMap();
        this.mapDrawService.drawPoint(map);
    }

    clearMap() {
        this.mapDrawService.clearMap();
    }

    identify() {
       this.mapToolbarService.identify();
    }

    openCoordinateDialog() {
        this.customMessageService.displayInfoMessage('Değerleri . (nokta) ile giriniz.');
        this.dialogService.toggleDialog('coordinate');
    }

    openWktDialog() {
        this.wktMenuOpen = true;
        this.dialogService.toggleDialog('wkt');
    }

    openDownloadData() {
        this.dialogService.toggleDialog('download');
    }

    toggleLayer(value: string) {
        if (this.selectedLayerTypes.includes(value)) {
            this.selectedLayerTypes = this.selectedLayerTypes.filter(v => v !== value);
        } else {
            this.selectedLayerTypes.push(value);
        }
    }


    toggleMenu(menu: string) {
        this.openMenu = this.openMenu === menu ? null : menu;
    }

    onMapTypeChange(type: string) {
        this.selectedMapType = type;
        this.mainMapService.changeBaseMap(type);
    }


    onLabelChange(type: string, event: any) {
        const checked = event.target.checked as boolean;

        this.mainMapService.toggleOverlayLayer(type, checked);

        // mapTypes içindeki ilgili objeyi güncelle
        const mapType = this.mapTypes.find(mt => mt.value === type);
        if (mapType) mapType.active = checked;
    }

    onMapTypeClick(type: string) {
        this.selectedMapType = type;  //  UI model DOM'a yazılır
        this.mainMapService.changeBaseMap(type); //  harita da değişir
    }

}
