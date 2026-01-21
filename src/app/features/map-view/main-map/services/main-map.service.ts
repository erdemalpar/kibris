import { Injectable } from '@angular/core';
import { Map, Layer } from 'leaflet';
import * as L from 'leaflet';
import { BehaviorSubject, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BASE_LAYER_CONFIGS, OVERLAY_LAYER_CONFIGS } from '../config/map-layer.config';
import wellknown from 'wellknown';

@Injectable({
    providedIn: 'root'
})

export class MainMapService {
    private _map: Map | undefined;
    private baseLayerConfigs = BASE_LAYER_CONFIGS;
    private overlayLayerConfigs = OVERLAY_LAYER_CONFIGS;
    private currentTileLayer: Layer | undefined;
    public boundaryLayer?: L.LayerGroup;
    private wktLayer?: L.GeoJSON;
    private identifyMode = false;

    //Harita tipi kontrolü
    private selectedMapTypeSubject = new BehaviorSubject<string>('googleSat');
    selectedMapType$ = this.selectedMapTypeSubject.asObservable();

    constructor(private http: HttpClient) { }

    drawBoundary() {
        this.http.get<any>('assets/data/boundary.json').subscribe(geoJsonData => {
            const boundaryLayer = L.geoJSON(geoJsonData, {
                style: {
                    fillOpacity: 0,
                    fillColor: 'none',
                    color: 'red',
                    weight: 2
                }
            });

            // Eski boundaryLayer varsa kaldır (varsa bellekte temizlik için)
            if (this.boundaryLayer) {
                this._map.removeLayer(this.boundaryLayer);
            }

            this.boundaryLayer = L.layerGroup([boundaryLayer]);
            this.boundaryLayer.addTo(this._map);

            setTimeout(() => {
                this._map.setView([35.104122, 33.188768], 9);
            }, 0);
        });
    }

    getMap(): Map | undefined {
        return this._map;
    }

    setMap(map: Map) {
        this._map = map;
    }

    // Harita tipi değiştir
    changeBaseMap(type: string): void {
     /*   const config = this.baseLayerConfigs[type];
        if (!this._map || !config) return;

        // Önce mevcut ana katmanları temizle
        this._map.eachLayer((layer) => {
            if ((layer as any)._url) this._map.removeLayer(layer);
        });

        // Yeni ana katmanları ekle
        config.layers.forEach(layer => {
            layer.addTo(this._map);
        });
        this.currentTileLayer = config.layers[0];

        // Aktif olan overlay katmanları da yeniden ekle
        Object.values(this.overlayLayerConfigs).forEach(overlay => {
            if (overlay.active) {
                overlay.layer.addTo(this._map);
            }
        });

        this.selectedMapTypeSubject.next(type);*/
        const config = this.baseLayerConfigs[type];
        if (!this._map) return;

        // 1) TÜM TileLayer taban katmanlarını kaldır (WMS hariç)
        this._map.eachLayer((layer: any) => {
            if (layer instanceof L.TileLayer) {
                this._map.removeLayer(layer);
            }
        });

        // 2) Yeni baseLayerları ekle
        if (config) {
            config.layers.forEach(layer => {
                if ((layer as any).setZIndex) {
                    (layer as any).setZIndex(1);
                }
                layer.addTo(this._map!);
            });

            this.currentTileLayer = config.layers[0];
        }

        // 3️⃣ Aktif overlay’leri üstte tut (zIndex: 999)
        Object.values(this.overlayLayerConfigs).forEach(overlay => {
            if (overlay.active) {
                if ((overlay.layer as any).setZIndex) {
                    (overlay.layer as any).setZIndex(999);
                }
                overlay.layer.addTo(this._map);
            }
        });

        // 4️⃣ Seçili map tipini güncelle
        this.selectedMapTypeSubject.next(type);
    }

    toggleOverlayLayer(name: string, enabled: boolean): void {
       /* const overlay = this.overlayLayerConfigs[name];
        if (!overlay || !this._map) return;

        if (enabled) {
            overlay.layer.addTo(this._map);
            overlay.active = true;
        } else {
            this._map.removeLayer(overlay.layer);
            overlay.active = false;
        }*/
        const overlay = this.overlayLayerConfigs[name];
        if (!overlay || !this._map) return;

        if (enabled) {
            if ((overlay.layer as any).setZIndex) {
                (overlay.layer as any).setZIndex(999);
            }
            overlay.layer.addTo(this._map);
            overlay.active = true;
        } else {
            this._map.removeLayer(overlay.layer);
            overlay.active = false;
        }
    }

    enableIdentifyMode() {
        this.identifyMode = true;
        if (this._map) {
            this._map.getContainer().style.cursor = 'help';
        }
    }

    disableIdentifyMode() {
        this.identifyMode = false;
        if (this._map) {
            this._map.getContainer().style.cursor = '';
        }
    }

    isIdentifyModeActive(): boolean {
        return this.identifyMode;
    }
}
