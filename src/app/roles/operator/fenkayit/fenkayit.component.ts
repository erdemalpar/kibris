import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { MenuService } from 'src/app/layout/app.menu.service';
import { Subscription } from 'rxjs';
import * as L from 'leaflet';
import { BASE_LAYER_CONFIGS } from 'src/app/features/map-view/main-map/config/map-layer.config';

@Component({
    selector: 'app-fenkayit-dialog',
    templateUrl: './fenkayit.component.html',
    styleUrls: ['./fenkayit.component.scss']
})
export class FenkayitComponent implements OnInit, OnDestroy {

    fullscreen = false;
    @Input() name: string = 'FenKlasor';

    visible = false;
    minimized = false;

    @Output() restored = new EventEmitter<void>();
    @Output() closed = new EventEmitter<void>();

    private sub?: Subscription;
    private map: L.Map | undefined;

    // Arama
    searchBasvuruNo: string = '';

    // Data - İşlemler
    islemler = [
        /*{ name: 'Tevhid', id: 1 },
        { name: 'İfraz', id: 2 },
        { name: 'Yola Terk', id: 3 }*/
    ];
    selectedIslem: any;

    // Data - Parseller
    parceller = [
        /*{ ada: 101, parsel: 5, tip: 'Kadastro' },
        { ada: 101, parsel: 6, tip: 'Kadastro' }*/
    ];
    selectedParcel: any;

    // Data - Meta
    metaData = {
        /*alan: '1200 m²',
        malik: 'Ahmet Yılmaz',
        nitelik: 'Arsa'*/
    };

    // stil objeleri
    normalStyle = { width: '75vw', height: '55vh', padding: '0' };
    minimizedStyle = { width: '320px', height: '40px', padding: '0' };

    constructor(private menuService: MenuService) { }

    ngOnInit() {
        this.sub = this.menuService.dialogs$.subscribe(dialogs => {
            const state = dialogs[this.name];
            if (state) {
                this.visible = state.visible;
                this.minimized = state.minimized;
            }
        });
    }

    ngOnDestroy() {
        this.sub?.unsubscribe();
        if (this.map) {
            this.map.remove();
        }
    }

    openDialog(name: string) {
        this.menuService.openDialog(this.name);
    }

    closeDialog() {
        this.menuService.closeDialog(this.name);
        this.fullscreen = false; // Kapatırken fullscreen'i sıfırla
    }

    onDialogShow() {
        // Dialog animasyonu bittikten sonra haritayı başlat veya güncelle
        setTimeout(() => {
            this.initMap();
        }, 100);
    }

    initMap() {
        const mapContainer = document.getElementById('fen-map');
        if (!mapContainer) return;

        if (this.map) {
            this.map.invalidateSize();
            return;
        }

        // Config'den uydu haritasını alalım (veya default googleMap)
        const baseLayers = BASE_LAYER_CONFIGS['googleSat'].layers;

        this.map = L.map('fen-map', {
            center: [35.2, 33.4], // Kıbrıs civarı
            zoom: 9,
            layers: baseLayers, // Config'den gelen katmanlar
            zoomControl: false // Zoom kontrolünü isteğe bağlı kapatabilir veya konumlandırabiliriz
        });

        L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    }

    // Harita Altlık Seçenekleri
    selectedBaseLayer: string = 'googleSat'; // Varsayılan

    baseLayerOptions = [
        { label: 'Google Uydu', value: 'googleSat' },
        { label: 'Google Harita', value: 'googleMap' },
        { label: 'OpenStreetMap', value: 'openstreetmap' },
        { label: 'HGM', value: 'hgm' },
        { label: 'Kıbrıs (WMS)', value: 'kibris' }
    ];

    changeBaseLayer(layerKey: string) {
        if (!this.map) return;

        // Bu key configde var mı kontrol et
        if (!BASE_LAYER_CONFIGS[layerKey]) return;

        // 1. Tüm base layerları temizle
        Object.values(BASE_LAYER_CONFIGS).forEach(config => {
            config.layers.forEach(l => {
                if (this.map?.hasLayer(l)) {
                    this.map?.removeLayer(l);
                }
            });
        });

        // 2. Yeni seçilen layerı ekle
        const nextLayers = BASE_LAYER_CONFIGS[layerKey].layers;
        nextLayers.forEach(l => this.map?.addLayer(l));

        console.log(`Harita altlığı değiştirildi: ${layerKey}`);
    }

    toggleMinimize() {
        this.minimized = !this.minimized;
        this.fullscreen = false;
        this.menuService.toggleMinimized(this.name);
    }

    toggleFullscreen() {
        this.fullscreen = !this.fullscreen;
        if (this.fullscreen) {
            this.menuService.restoreDialog(this.name);
            this.minimized = false;
            this.visible = true;
        }
        // Fullscreen geçişinde harita boyutunu güncelle
        setTimeout(() => {
            if (this.map) {
                this.map.invalidateSize();
            }
        }, 300);
    }

    restoreDialog() {
        this.menuService.restoreDialog(this.name);
        this.minimized = false;
        this.visible = true;
    }

    performAction(action: any) {
        // console.log('İşlem:', action);
    }

    get dialogClass() {
        if (this.minimized) return 'dialog-minimized';
        if (this.fullscreen) return 'dialog-fullscreen';
        return '';
    }

    get dialogStyle() {
        if (this.minimized) {
            return { width: '0', height: '0', overflow: 'hidden', padding: '0' };
        } else {
            return this.fullscreen ? { width: '100vw', height: '100vh', margin: 0 } : this.normalStyle;
        }
    }
}
