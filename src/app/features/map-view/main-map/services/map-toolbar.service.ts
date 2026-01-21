import { Injectable } from '@angular/core';
import { Subscription, Subject } from 'rxjs';
import { MainMapService } from '../services/main-map.service';
import { IdentifyService } from '../services/identify.service';
import { ParcelInfoDto } from 'src/app/core/models/parcelInfoDto';
import { CustomMessageService } from 'src/app/core/services/custom-message.service';
import * as L from 'leaflet';

@Injectable({
    providedIn: 'root'
})

export class MapToolbarService {

    private clickSubscription: Subscription | undefined;
    parcelDetails: ParcelInfoDto | null = null;
    displayDialog: boolean = false;

    private parcelInfoSubject = new Subject<ParcelInfoDto | null>();
    parcelInfo$ = this.parcelInfoSubject.asObservable();

    private singlePointMarkers: L.CircleMarker[] = [];
    constructor(private mainMapService: MainMapService, private identifyService: IdentifyService,private customMessageService: CustomMessageService) { }

    zoomIn() {
        this.mainMapService.getMap().zoomIn();
    }

    zoomOut() {
        this.mainMapService.getMap().zoomOut();
    }

    identify() {
        if (this.mainMapService.isIdentifyModeActive()) {
            this.disableIdentify();
            return;
        }
        this.mainMapService.enableIdentifyMode();

        const map = this.mainMapService.getMap();
        if (map) {
            this.clickSubscription?.unsubscribe();
            this.clickSubscription = new Subscription();

            const clickHandler = (e: any) => {
                if (this.mainMapService.isIdentifyModeActive()) {
                    const latlng = e.latlng;
                    // console.log('Tıklanan nokta:', latlng);

                    //this.singlePointMarkers.forEach(m => map.removeLayer(m));
                    //this.singlePointMarkers = [];

                    const marker = L.circleMarker(latlng, {
                        radius: 5,
                        color: 'red',
                        weight: 2,
                        fillColor: 'red',
                        fillOpacity: 0.6
                    }).addTo(map);

                    this.singlePointMarkers.push(marker);

                    // Servisi çağır
                    this.identifyService.getParcelInfoByCoordinate(latlng.lat, latlng.lng).subscribe({
                        next: (res) => {
                            debugger;

                            const data = res.data;

                            // 1) service status OK ama içerik "bulunamadı" mesajı içeriyorsa:
                            const notFound = data &&
                                (data.adaNo?.includes('bulunamadı') ||
                                    data.parselNo?.includes('bulunamadı'));

                            if (res.statusCode === 200 && data && !notFound) {
                                this.parcelDetails = res.data;
                                // this.displayDialog = true; // Dialog aç
                                this.parcelInfoSubject.next(res.data);
                            } else {  
                                //this.showAlert('warning', 'Bu konumda parsel bulunamadı.');
                                this.customMessageService.displayWarningMessage('Bu konumda parsel bulunamadı.');
                               // this.parcelInfoSubject.next(null);
                            }
                        },
                        error: (err) => {
                            console.error(err);
                            //this.showAlert('error', 'Sunucu hatası veya bağlantı sorunu.');
                            this.customMessageService.displayErrorMessage(err);
                            this.customMessageService.displayErrorMessageString('Sunucu hatası veya bağlantı sorunu.');
                        }
                    });
                }
            };

            // Harita click event’ini dinle
            map.on('click', clickHandler);
            this.clickSubscription.add(() => map.off('click', clickHandler));
        }
    }

    clearSinglePointMarkers() {
        const map = this.mainMapService.getMap();
        if (!map) return;

        this.singlePointMarkers.forEach(marker => map.removeLayer(marker));
        this.singlePointMarkers = [];
    }


    public disableIdentify() {
        this.mainMapService.disableIdentifyMode();
        if (this.clickSubscription) {
            this.clickSubscription.unsubscribe();
            this.clickSubscription = undefined;
        }
        this.clearSinglePointMarkers();
    }

}
