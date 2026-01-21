import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { MainMapService } from '../main-map/services/main-map.service';
import { BASE_LAYER_CONFIGS, OVERLAY_LAYER_CONFIGS } from './config/map-layer.config';


@Component({
    selector: 'app-map',
    templateUrl: './main-map.component.html',
    styleUrls: ['./main-map.component.scss']
})
export class MainMapComponent implements AfterViewInit {

    constructor(private mainMapService: MainMapService) { }

    private map!: L.Map;

    ngAfterViewInit(): void {
        this.initMap();
    }

    private initMap(): void {

        this.map = L.map('map', {
            center: [35.104122, 33.188768],
            zoom: 9,
            maxZoom: 22,
            zoomControl: false
        });
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 22,
            attribution: '© Tapu ve Kadastro Dairesi Müdürlüğü'
        }).addTo(this.map);
        
      //  this.mainMapService.setMap(this.map);

        // ❗ 3) İlk base map burada yükleniyor
       // this.mainMapService.changeBaseMap("openstreetmap");

        this.map.attributionControl.setPrefix('<img src="assets/layout/images/Flag_of_the_Turkish_Republic_of_Northern_Cyprus.png" height="15" style="vertical-align:middle;" /> KKTC');

        // kuzey oku ekleme
        const NorthControl = L.Control.extend({
            onAdd: (map: L.Map) => {
                const div = L.DomUtil.create('div', 'leaflet-control-north');
                div.innerHTML = `<i class="fg-compass-rose-n" style="font-size:60px; color:#0a5b96; margin-top: 30px; margin-right: -5px;"></i>`;
                return div;
            },
            onRemove: (map: L.Map) => {
                // Temizlik işlemleri gerekiyorsa buraya
            }
        });

        new NorthControl({ position: 'topright' }).addTo(this.map);

        // Koordinat göstermek için control
        const CoordsControl = L.Control.extend({
            onAdd: (map: L.Map) => {
                const div = L.DomUtil.create('div', 'leaflet-coords');
                div.style.background = 'rgba(255,255,255,0.8)';
                div.style.padding = '4px 8px';
                div.style.borderRadius = '4px';
                div.style.fontSize = '10px';
                div.innerHTML = 'Enlem: 0  Boylam: 0';
                return div;
            }
        });

        // Control’ü haritaya ekle
        const coordsControl = new CoordsControl({ position: 'topleft' });
        coordsControl.addTo(this.map);

        // Mousemove ile güncelle
        this.map.on('mousemove', (e: L.LeafletMouseEvent) => {
            const lat = e.latlng.lat.toFixed(4);
            const lng = e.latlng.lng.toFixed(4);
            (coordsControl.getContainer() as HTMLDivElement).innerHTML = `Enlem: ${lat} Boylam : ${lng}`;
        });

        // İkonlu buton kontrolü
        const ToggleMenuControl = L.Control.extend({
            onAdd: (map: L.Map) => {
                const div = L.DomUtil.create('div', 'leaflet-control-togglemenu');

                // Buton oluştur
                const button = L.DomUtil.create('button', 'menu-toggle-btn', div);
                button.innerHTML = `<i class="pi pi-angle-left"></i>`; // ilk hali '<'

                // Tıklama event
                button.addEventListener('click', () => {
                    const menuBtn = document.querySelector('.layout-menu-button') as HTMLElement;
                    if (menuBtn) {
                        menuBtn.click();
                    }

                    // İkonu toggle et
                    const icon = button.querySelector('i');
                    if (icon?.classList.contains('pi-angle-left')) {
                        icon.classList.remove('pi-angle-left');
                        icon.classList.add('pi-angle-right'); // '>'
                        document.body.classList.add('menu-collapsed');
                    } else {
                        icon?.classList.remove('pi-angle-right');
                        icon?.classList.add('pi-angle-left'); // '<'
                        document.body.classList.remove('menu-collapsed');
                    }

                    // Menü açılıp kapandıktan sonra haritayı yeniden boyutlandır
                    setTimeout(() => {
                        this.map.invalidateSize();
                    }, 140); // animasyonun tamamlanması için 200ms bekle
                });

                // Harita olaylarını engelle
                L.DomEvent.disableClickPropagation(div);

                return div;
            }
        });

        new ToggleMenuControl({ position: 'topleft' }).addTo(this.map);

        this.mainMapService.setMap(this.map);

        this.mainMapService.drawBoundary();
    }

}
