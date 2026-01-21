import { Injectable } from '@angular/core';
import { Layer, geoJSON, LatLngBounds } from 'leaflet';
import * as L from 'leaflet';
import * as turf from '@turf/turf';
import { MainMapService } from '../services/main-map.service';
import wellknown from 'wellknown';
import { BehaviorSubject, Subject } from 'rxjs';
import { CustomMessageService } from '../../../../core/services/custom-message.service';
import { MapToolbarService } from '../services/map-toolbar.service';

@Injectable({
    providedIn: 'root'
})

export class MapDrawService {

    private isDrawing = false;
    private isDrawingPolygon = false;
    private isDrawingLine = false;
    private map!: L.Map;
    private latlngs: L.LatLng[] = [];
    private polyline!: L.Polyline;
    private previewLine!: L.Polyline;
    private points: L.LatLng[] = [];
    private polygon!: L.Polygon;
    private previewLabelMarker?: L.Marker;
    private currentPolyline!: L.Polyline;
    private drawnItems!: L.FeatureGroup;
    private pointMarkers: L.Marker[] = [];
    private polylines: L.Polyline[] = [];
    private polygons: L.Polygon[] = []

    private boundAddPoint = this.addPoint.bind(this);
    private boundUpdatePreviewLine = this.updatePreviewLine.bind(this);
    private boundFinishDrawing = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            this.finishDrawing();
        }
    };
    private boundFinishPointDrawing = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            this.disablePointDrawing();
        }
    };
    private boundAddPolygonPoint = this.addPolygonPoint.bind(this);
    private pointMarker?: L.CircleMarker;
    private isDrawingPoint = false;
    private boundAddDrawPoint = this.addDrawPoint.bind(this);
    private singlePointMarkers: L.CircleMarker[] = [];

    private wktLayer?: L.GeoJSON;
    public wkt$: BehaviorSubject<string> = new BehaviorSubject<string>('');
    // Mevcut koordinat noktalarını tutacak dizi
    public currentCircles: L.CircleMarker[] = [];
    private circleLayer?: L.LayerGroup;

    private geoJsonLayer: Layer | undefined;
    private clearSubject = new Subject<void>();
    private drawSubject = new Subject<GeoJSON.FeatureCollection>();

    constructor(private mainMapService: MainMapService, private customMessageService: CustomMessageService, private mapToolbarService: MapToolbarService) { }

    private updateCurrentWKT() {

        const wktLines: string[] = [];

        // Noktalar
        if (this.singlePointMarkers.length > 0) {
            this.singlePointMarkers.forEach(m => {
                wktLines.push(wellknown.stringify(m.toGeoJSON().geometry));
            });
        }

        // Çizgiler
        if (this.polylines.length > 0) {
            this.polylines.forEach(line => {
                wktLines.push(wellknown.stringify(line.toGeoJSON().geometry));
            });
        }

        // Poligonlar (aynı mantıkla eklenecek)
        if (this.polygons && this.polygons.length > 0) {
            this.polygons.forEach(poly => {
                wktLines.push(wellknown.stringify(poly.toGeoJSON().geometry));
            });
        }

        this.wkt$.next(wktLines.join('\n')); // Her biri alt satırda
    }

    public resetWKT() {
        this.wkt$.next('');
        this.singlePointMarkers = [];
        this.polylines = [];
        this.polygons = [];
    }



    private setup(map: L.Map): void {
        this.map = map;
        this.isDrawing = true;

        // Eski çizim öğelerini temizle
        if (this.drawnItems) {
            this.map.removeLayer(this.drawnItems);
        }

        this.drawnItems = new L.FeatureGroup();
        this.map.addLayer(this.drawnItems);

        this.latlngs = [];
        this.currentPolyline = undefined!;
        this.previewLine = undefined!;
    }
    private addPoint(e: L.LeafletMouseEvent): void {
        const latlng = e.latlng;

        // Son nokta ile yeni tıklanan nokta arasındaki mesafeyi kontrol et
        const lastLatLng = this.latlngs[this.latlngs.length - 1];

        // Son noktaya tıklanıp tıklanmadığını kontrol et
        const isLastPoint = lastLatLng && this.isSamePoint(latlng, lastLatLng);

        if (isLastPoint) {
            // Son noktaya tıklanırsa, çizimi bitir
            if (this.latlngs.length >= 2) {
                this.finishDrawing();
            }
            return; // Son noktaya tıklanmışsa işlem yapılmaz
        }

        // Daha önce eklenmiş bir noktaya tıklanıp tıklanmadığını kontrol et
        const isDuplicatePoint = this.latlngs.some((point) => this.isSamePoint(latlng, point));

        if (isDuplicatePoint) {
            // Noktayı sil
            this.removePoint(latlng);
            return; // Silme işlemi yapıldıktan sonra devam edilmez
        }

        // Yeni bir nokta ekle
        this.latlngs.push(latlng);

        // Kare marker her noktaya eklensin
        //this.addPointMarker(latlng);

        // Önceki previewLine'ı kaldır (kesik çizgi)
        if (this.previewLine) {
            this.map.removeLayer(this.previewLine);
            this.previewLine = undefined!;
        }

        // Kalıcı çizgi oluştur veya güncelle (düz çizgi)
        if (this.currentPolyline) {
            this.currentPolyline.addLatLng(latlng);
        } else {
            this.currentPolyline = L.polyline([latlng], {
                color: '#3388ff',
                weight: 4
            }).addTo(this.map);
        }

        // Uzunluk etiketi ekle
        const totalLength = this.calculateLength(this.latlngs);
        this.updateSegmentLabels();
    }

    private updateSegmentLabels(): void {
        // Eski etiketleri temizle
        this.drawnItems.eachLayer(layer => {
            if (
                layer instanceof L.Marker &&
                (layer as any).options.icon?.options.className === 'length-label'
            ) {
                this.drawnItems.removeLayer(layer);
            }
        });

        let totalLength = 0;

        for (let i = 1; i < this.latlngs.length; i++) {
            const from = this.latlngs[i - 1];
            const to = this.latlngs[i];

            const segmentLength = this.calculateLength([from, to]);

            const previousTotal = totalLength;
            totalLength += segmentLength;

            const diff = segmentLength; // artık net segment uzunluğu
            //const formatted = `${Math.round(totalLength)} m`;
            //const formattedDiff = `(+${Math.round(diff)} m)`;

            const formatted = `${totalLength.toFixed(2)} m`;
            const formattedDiff = `(+${diff.toFixed(2)} m)`;

            // Etiketi çizgi üzerinde %65 noktasına koy
            const lat = from.lat + (to.lat - from.lat) * 0.65;
            const lng = from.lng + (to.lng - from.lng) * 0.65;
            const labelPoint = L.latLng(lat, lng);

            const label = L.marker(labelPoint, {
                icon: L.divIcon({
                    className: 'length-label',
                    html: `<strong>${formatted}<br>${formattedDiff}</strong>`,
                    iconSize: [60, 40]
                }),
                interactive: false
            });

            this.drawnItems.addLayer(label);
        }
    }

    private removePoint(latlng: L.LatLng): void {
        // Silinen nokta indexini bul
        const index = this.latlngs.findIndex((point) => this.isSamePoint(latlng, point));

        if (index !== -1) {
            // Silinen noktayı listeden çıkar
            this.latlngs.splice(index, 1);

            // Marker'ı da sil
            const markerIndex = this.pointMarkers.findIndex(marker => this.isSamePoint(latlng, marker.getLatLng()));
            if (markerIndex !== -1) {
                const markerToRemove = this.pointMarkers[markerIndex];
                this.map.removeLayer(markerToRemove);
                this.pointMarkers.splice(markerIndex, 1); // Marker'ı listeden çıkar
            }

            // Silinen noktayı ve onunla ilgili çizgiyi güncelle
            this.updatePolyline();
            this.updateSegmentLabels();
        }
    }

    // Çizgiyi güncelleme (silinen noktadan sonra yeniden çizim yap)
    private updatePolyline(): void {
        if (this.currentPolyline) {
            this.map.removeLayer(this.currentPolyline);
        }

        this.currentPolyline = L.polyline(this.latlngs, {
            color: '#3388ff',
            weight: 4
        }).addTo(this.map);
    }

    // Yaklaşık nokta eşitliğini kontrol et
    private isSamePoint(latlng1: L.LatLng, latlng2: L.LatLng): boolean {
        const threshold = 0.0001; // yaklaşık eşitlik için eşik değeri (yaklaşık 1 m)

        return (
            Math.abs(latlng1.lat - latlng2.lat) < threshold &&
            Math.abs(latlng1.lng - latlng2.lng) < threshold
        );
    }

    private addPolygonPoint(e: L.LeafletMouseEvent): void {
        const latlng = e.latlng;

        // Son noktayla aynı yere tekrar tıklanmış mı?
        const lastLatLng = this.latlngs[this.latlngs.length - 1];
        if (lastLatLng && latlng.distanceTo(lastLatLng) < 2) { // 2 metre veya piksel eşik gibi düşünebilirsin
            if (this.latlngs.length >= 3) {
                this.finishDrawing();
            }
            return;
        }

        this.latlngs.push(latlng);

        if (this.polygon) {
            this.polygon.setLatLngs(this.latlngs);
        } else {
            this.polygon = L.polygon(this.latlngs, {
                color: '#ff7800',
                weight: 2
            }).addTo(this.map);
        }
        //Alangüncelle
        this.updatePolygonMeasurements(this.latlngs);
    }

    private updatePolygonMeasurements(latlngs: L.LatLng[]): void {
        if (latlngs.length < 3) return;

        // Eski etiketleri temizle
        this.drawnItems.clearLayers();

        // Poligonun ilk noktasını son noktaya ekleyerek kapatıyoruz
        const closedLatlngs = [...latlngs, latlngs[0]]; // İlk nokta sonradan ekleniyor
        const turfPoly = turf.polygon([closedLatlngs.map(c => [c.lng, c.lat])]);

        const area = turf.area(turfPoly); // m²
        const centroid = turf.centroid(turfPoly);

        const label = L.marker([centroid.geometry.coordinates[1], centroid.geometry.coordinates[0]], {
            icon: L.divIcon({
                className: 'area-label',
                html: `<strong>${area.toFixed(2)} m²</strong>`, // Alanı m² olarak göster
                iconSize: [100, 30]
            })
        });

        this.drawnItems.addLayer(label);
    }

    private updatePreviewLine(e: L.LeafletMouseEvent): void {
        if (!this.isDrawing || this.latlngs.length === 0) return;

        const previewLatLngs = [...this.latlngs, e.latlng];

        // Kesik çizgi oluştur veya güncelle
        if (!this.previewLine) {
            this.previewLine = L.polyline(previewLatLngs, {
                color: 'gray',
                dashArray: '5, 5',
                weight: 2
            }).addTo(this.map);
        } else {
            this.previewLine.setLatLngs(previewLatLngs);
        }

        // Eğer çizim polygon ise, uzunluk etiketi gösterme
        if (this.isDrawingPolygon) {
            if (this.previewLabelMarker) {
                this.map.removeLayer(this.previewLabelMarker);
                this.previewLabelMarker = undefined;
            }
            return;
        }

        //Polyline için mesafe etiketi göster
        const lastPoint = this.latlngs[this.latlngs.length - 1];
        const segmentLength = this.calculateLength([lastPoint, e.latlng]);

        if (this.previewLabelMarker) {
            this.map.removeLayer(this.previewLabelMarker);
        }

        this.previewLabelMarker = L.marker(e.latlng, {
            icon: L.divIcon({
                className: 'length-label-preview',
                html: `<span>+${segmentLength.toFixed(2)} m</span>`,
                iconSize: [80, 20]
            }),
            interactive: false
        }).addTo(this.map);
    }

    // Polyline uzunluğunu hesapla
    private calculateLength(latlngs: L.LatLng[]): number {
        const turfLine = turf.lineString(
            latlngs.map((coord) => [coord.lng, coord.lat])
        );
        return turf.length(turfLine, { units: 'meters' });
    }

    startLineDrawing(map: L.Map): void {
        this.customMessageService.displayInfoMessage('Çizimi bitirmek için son noktaya tıklayınız ya da "ESC" tuşuna basınız.');

        if (this.isDrawingPolygon) {
            this.finishPolygonDrawing();
        }

        this.isDrawing = true;
        this.isDrawingLine = true;
        this.setup(map);

        this.map.getContainer().classList.add('leaflet-crosshair-cursor');

        this.map.on('click', this.boundAddPoint);
        this.map.on('mousemove', this.boundUpdatePreviewLine);

        document.addEventListener('keydown', this.boundFinishDrawing);


    }

    private finishDrawing(): void {
        if (this.isDrawing) {
            this.isDrawing = false;

            // Cursor normal haline dönsün
            this.map.getContainer().classList.remove('leaflet-crosshair-cursor');


            this.map.off('click', this.boundAddPoint);
            this.map.off('mousemove', this.boundUpdatePreviewLine);
            this.map.off('click', this.boundAddPolygonPoint);
            document.removeEventListener('keydown', this.boundFinishDrawing);


            if (this.previewLine) {
                this.map.removeLayer(this.previewLine);
                this.previewLine = undefined!;
            }
            /*
            if (this.currentPolyline) {
                this.drawnItems.addLayer(this.currentPolyline);
            }*/
            if (this.currentPolyline) {
                this.drawnItems.addLayer(this.currentPolyline);
                this.polylines.push(this.currentPolyline); // Listeye ekle
            }


            if (this.previewLabelMarker) {
                this.map.removeLayer(this.previewLabelMarker);
                this.previewLabelMarker = undefined;
            }
            /*
            if (this.polygon) {
                this.drawnItems.addLayer(this.polygon);
            }*/

            if (this.polygon) {
                this.drawnItems.addLayer(this.polygon);
                this.polygons.push(this.polygon);
            }

            this.latlngs = [];
            this.currentPolyline = undefined!;

            this.polygon = undefined!;

            this.pointMarkers = [];

            // WKT güncelle
            this.updateCurrentWKT();
        }
    }

    finishPolygonDrawing(): void {
        if (this.isDrawingPolygon) {
            this.isDrawingPolygon = false;

            this.map.off('click', this.boundAddPolygonPoint);
            this.map.off('mousemove', this.boundUpdatePreviewLine);
            document.removeEventListener('keydown', this.boundFinishDrawing);

            if (this.previewLine) {
                this.map.removeLayer(this.previewLine);
                this.previewLine = undefined!;
            }

            if (this.previewLabelMarker) {
                this.map.removeLayer(this.previewLabelMarker);
                this.previewLabelMarker = undefined;
            }

            // Haritada polygon varsa, temizle
            if (this.polygon) {
                this.map.removeLayer(this.polygon);
                this.polygon = undefined!;
            }

            this.latlngs = [];
            this.currentPolyline = undefined!;

            this.polygon = undefined!;

            this.pointMarkers.forEach((m) => this.map.removeLayer(m));
            this.pointMarkers = [];
        }
    }

    startPolygonDrawing(map: L.Map): void {
        this.customMessageService.displayInfoMessage('Çizimi bitirmek için son noktaya tıklayınız ya da "ESC" tuşuna basınız.');

        if (this.isDrawingLine) {
            this.finishLineDrawing();
        }
        this.isDrawing = true;
        this.isDrawingPolygon = true;
        this.setup(map);
        this.map.getContainer().classList.add('leaflet-crosshair-cursor');

        this.map.on('click', this.boundAddPolygonPoint);
        this.map.on('mousemove', this.boundUpdatePreviewLine);
        document.addEventListener('keydown', this.boundFinishDrawing);

    }

    finishLineDrawing(): void {
        if (this.isDrawingLine) {
            this.isDrawingLine = false;

            this.map.off('click', this.boundAddPoint);
            this.map.off('mousemove', this.boundUpdatePreviewLine);
            document.removeEventListener('keydown', this.boundFinishDrawing);

            if (this.previewLine) {
                this.map.removeLayer(this.previewLine);
                this.previewLine = undefined!;
            }

            if (this.previewLabelMarker) {
                this.map.removeLayer(this.previewLabelMarker);
                this.previewLabelMarker = undefined;
            }

            this.latlngs = [];
            this.currentPolyline = undefined!;

            this.pointMarkers.forEach((m) => this.map.removeLayer(m));
            this.pointMarkers = [];
        }
    }

    drawPoint(map: L.Map): void {
        this.customMessageService.displayInfoMessage('Çizimi bitirmek için "ESC" tuşuna basınız.');

        this.map = map;
        /*
        if (this.isDrawingPoint) {
            this.disablePointDrawing();
        } else {
            this.enablePointDrawing();
        }*/

        this.enablePointDrawing();

        document.addEventListener('keydown', this.boundFinishPointDrawing);
    }

    private enablePointDrawing(): void {
        this.isDrawingPoint = true;
        this.map.getContainer().classList.add('leaflet-crosshair-cursor');
        this.map.on('click', this.boundAddDrawPoint);
    }
    /*
    private disablePointDrawing(): void {
        this.isDrawingPoint = false;
        this.map.getContainer().classList.remove('leaflet-crosshair-cursor');
        this.map.off('click', this.boundAddDrawPoint);
    }*/

    private disablePointDrawing(): void {
        this.isDrawingPoint = false;
        const map = this.mainMapService.getMap();
        if (map) {
            map.getContainer().classList.remove('leaflet-crosshair-cursor');
            map.off('click', this.boundAddDrawPoint);
        }
    }


    private addDrawPoint(e: L.LeafletMouseEvent): void {
        const marker=L.circleMarker(e.latlng, {
            radius: 3,
            color: 'red',
            weight: 1,
            fillColor: 'red',
            fillOpacity: 0.3
        }).addTo(this.map);

        this.singlePointMarkers.push(marker);

        // WKT güncelle
        this.updateCurrentWKT();
    }

    showWKTOnMap(wkt: string) {
        this.map = this.mainMapService.getMap(); // MainMapService'den haritayı al
        debugger;
        if (!this.map) {
            // console.error('Harita hazır değil!');
            this.customMessageService.displayErrorMessageString("Harita hazır değil!");
            return;
        }

        if (!wkt || !wkt.trim()) {
            // alert('Lütfen WKT giriniz!');
            this.customMessageService.displayInfoMessage("Lütfen WKT giriniz!");
            return;
        }

        const geojson = wellknown(wkt);
        if (!geojson) {
            // alert('Geçersiz WKT formatı!');
            this.customMessageService.displayErrorMessageString("Geçersiz WKT formatı!");
            return;
        }

        // Eski WKT layer varsa kaldır
        if (this.wktLayer) {
            this.map.removeLayer(this.wktLayer);
        }

        // Yeni WKT layer ekle
        this.wktLayer = L.geoJSON(geojson, {
            style: {
                color: '#007bff',
                weight: 3,
                fillColor: '#007bff',
                fillOpacity: 0.4
            }
        }).addTo(this.map);

        // WKT alanına zoom yap
        this.map.fitBounds(this.wktLayer.getBounds());
    }

    public getCurrentWKT(): string {
        debugger;
        if (this.polygon) {
            return wellknown.stringify(this.polygon.toGeoJSON().geometry);
        } else if (this.currentPolyline) {
            return wellknown.stringify(this.currentPolyline.toGeoJSON().geometry);
        } else if (this.singlePointMarkers.length > 0) {
            if (this.singlePointMarkers.length === 1) {
                return wellknown.stringify(this.singlePointMarkers[0].toGeoJSON().geometry);
            } else {
                const geojson = {
                    type: "Feature",
                    geometry: {
                        type: "MultiPoint",
                        coordinates: this.singlePointMarkers.map(m => {
                            const latlng = m.getLatLng();
                            return [latlng.lng, latlng.lat];
                        })
                    }
                };
                return wellknown.stringify(geojson.geometry);
            }
        } else {
            return '';
        }
    }

    public addCircleToMap(map: L.Map, coords: [number, number]) {
        //const map = this.getMap();
        if (!map) {
            // console.error('Harita hazır değil!');
            this.customMessageService.displayErrorMessageString("Harita hazır değil!");
            return;
        }

        if (!this.circleLayer) {
            this.circleLayer = L.layerGroup().addTo(map);
        }

       /* map.setView(coords, 15);

        L.circleMarker(coords, {
            radius: 3,
            color: 'red',
            weight: 2,
            fillColor: 'red',
            fillOpacity: 0.3
        }).addTo(this.circleLayer); */

        const marker = L.circleMarker(coords, {
            radius: 3,
            color: 'red',
            weight: 2,
            fillColor: 'red',
            fillOpacity: 0.3
        }).addTo(this.circleLayer);

        // Haritayı bu noktaya yaklaştır
        const point = L.latLng(coords[0], coords[1]);
        const bounds = L.latLngBounds([point]);
        map.fitBounds(bounds, { maxZoom: 22 });
    }

    public clearMap(): void {
        // Çizimle ilgili her şeyi sıfırla
        this.finishDrawing(); // Önce çizim modunu sonlandır
        //this.drawnItems.clearLayers(); // Haritadaki tüm çizim katmanlarını temizle
        this.disablePointDrawing();

        if (this.drawnItems) {
            this.drawnItems.clearLayers(); // Çizim grubu temizle
        }
        
        // Tekil noktaları temizle
        this.singlePointMarkers.forEach(m => this.map.removeLayer(m));
        this.singlePointMarkers = [];

        this.mapToolbarService.clearSinglePointMarkers();

        // Değişkenleri de sıfırla
        this.latlngs = [];
        this.currentPolyline = undefined!;
        this.polygon = undefined!;
        this.pointMarkers = [];

        // WKT katmanını temizle
        if (this.wktLayer && this.map) {
            this.map.removeLayer(this.wktLayer);
            this.wktLayer = undefined;
        }

        if (this.circleLayer) {
            this.circleLayer.clearLayers();
            this.circleLayer = undefined;
        }
    }

    drawGeometry(geoJsonData: GeoJSON.FeatureCollection, styleOptions?: any) {
        const map = this.mainMapService.getMap();
        if (!map) {
            //console.error('Harita hazır değil!');
            this.customMessageService.displayErrorMessageString("Harita hazır değil!");
            return;
        }

        // Önceki katmanı temizle
        if (this.geoJsonLayer) {
            this.geoJsonLayer.remove();
        }
            //this.clearGeometry();
            this.geoJsonLayer = geoJSON(geoJsonData, {
                style: {
                    color: 'red',
                    weight: 2,
                    fillOpacity: 0.4,
                    fillColor: styleOptions?.fillColor || 'none'
                },
                onEachFeature: (feature, layer) => {
                    const label = feature.properties?.Ad || feature.properties?.name;
                    if (label) {
                        layer.bindTooltip(label, {
                            permanent: true,
                            direction: "center",
                            className: "parsel-tooltip"
                        });
                    }
                }
            }).addTo(map);

            const bounds: LatLngBounds = (this.geoJsonLayer as any).getBounds();
            if (bounds.isValid()) {
                map.fitBounds(bounds);
            }

            this.drawSubject.next(geoJsonData);
    }

    clearGeometry(temporary: boolean = false) {
        const map = this.mainMapService.getMap();
        if (this.geoJsonLayer && map) {
            if (!temporary) {
                map.removeLayer(this.geoJsonLayer);
                this.geoJsonLayer = undefined;
                this.clearSubject.next();
            }
        }
    }

}
