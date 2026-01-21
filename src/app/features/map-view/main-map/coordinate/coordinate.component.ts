import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { DialogService } from '../services/dialog.service';
import { MainMapService } from '../services/main-map.service';
import { MapDrawService } from '../services/map-draw.service';
import proj4 from 'proj4';
import { Subscription } from 'rxjs';
import { CustomMessageService } from 'src/app/core/services/custom-message.service';

@Component({
    selector: 'app-coordinate',
    templateUrl: './coordinate.component.html',
    styleUrls: ['./coordinate.component.scss']
})
export class CoordinateComponent implements OnInit {
    displayDialog = false;
    minimized = false;

    private map?: L.Map;
    private circleLayer?: L.LayerGroup;
    public currentCircles: L.CircleMarker[] = [];
    constructor(private dialogService: DialogService, private mainMapService: MainMapService, private mapDrawService: MapDrawService, private customMessageService: CustomMessageService) { }

    coordinateTypes = [
        { label: 'Coğrafi', value: 'geo' },
        { label: 'Kartezyen', value: 'cartesian' }
    ];
    selectedCoordinateType: string = 'geo';

    domTypes = [
        { label: 'Seçiniz', value:null },
        { label: '33', value: '33' },
        { label: '36', value: '36' }
    ];

    selectedDomType: string = null;

    // Coğrafi
    latitude: string;
    longitude: string;

    // Kartezyen
    dom: string;
    x: string;
    y: string;

    private subs: Subscription[] = [];

    ngOnInit() {
        this.subs.push(
            this.dialogService.getDialogState$('coordinate').subscribe(state => {
                this.displayDialog = state.visible;
                this.minimized = state.minimized;

                // her açılışta alanları resetleyebilirsin
                if (state.visible && !this.displayDialog) {
                    this.latitude = this.longitude = this.x = this.y = null;
                    this.selectedDomType = null;
                    this.selectedCoordinateType = 'geo';
                }
            })
        );
    }

    ngOnDestroy() {
        this.subs.forEach(s => s.unsubscribe());
    }


    closeDialog() {
        this.dialogService.hideDialog('coordinate');
    }

    toggleMinimize() {
        this.dialogService.toggleMinimize('coordinate');
    }

    goToCoordinates() {
        const map = this.mainMapService.getMap();
        if (!map) {
            // console.error('Harita hazır değil!');
            this.customMessageService.displayErrorMessageString("Harita hazır değil!");
            return;
        }

        if (this.selectedCoordinateType === 'geo') {
            const lat = parseFloat(this.latitude);
            const lng = parseFloat(this.longitude);

            if (!isNaN(lat) && !isNaN(lng)) {
                this.mapDrawService.addCircleToMap(map, [lat, lng]);
            } else {
                // alert('Geçerli enlem ve boylam giriniz!');
                this.customMessageService.displayWarningMessage("Geçerli enlem ve boylam giriniz!");
            }
        } else if (this.selectedCoordinateType === 'cartesian') {
            const xVal = parseFloat(this.x);
            const yVal = parseFloat(this.y);
            const domVal = parseInt(this.selectedDomType);
            if (!isNaN(xVal) && !isNaN(yVal) && !isNaN(domVal)) {
                const gaussProjection = `+proj=tmerc +lat_0=0 +lon_0=${domVal} +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs`;
                const [lng, lat] = proj4(gaussProjection, '+proj=longlat +datum=WGS84 +no_defs', [xVal, yVal]);

              //  console.log('Dönüştürülen Koordinatlar:', lat, lng);

                this.mapDrawService.addCircleToMap(map, [lat, lng]);
            } else {
                // alert('Geçerli X, Y ve D.O.M. giriniz!');
                this.customMessageService.displayWarningMessage("Geçerli X, Y ve D.O.M. giriniz!");
            }
        }
    }
    /*
    private addCircleToMap(map: L.Map, coords: [number, number]) {
        // Eğer this.map daha önce set edilmemişse aynı referansı tut
        if (!this.map) {
            this.map = map;
        }

        // create & keep a layer group for circles (tek sorumluluk, temizleme kolay)
        if (!this.circleLayer) {
            this.circleLayer = L.layerGroup().addTo(this.map);
        }

        map.setView(coords, 15);

    const circle = L.circleMarker(coords, {
        radius: 3,
        color: 'red',
        weight: 2, // kenar kalınlığı 2px
        fillColor: 'red',
        fillOpacity: 0.3
    }).addTo(this.circleLayer);

        // this.mapDrawService.currentCircles.push(circle);
        this.currentCircles.push(circle);
    } */
}
