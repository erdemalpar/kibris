import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

    @Input() showMap: boolean = false; // Haritanın görünürlüğü
    @Input() mapId: string = 'map';    // Eğer birden fazla harita olacaksa ID ile yönet

    constructor() { }

    ngOnInit(): void {
        if (this.showMap) {
            this.initMap();
        }
    }

    initMap() {
        // Haritanın başlatılması (OpenLayers, Leaflet veya kullandığınız kütüphane)
        const mapContainer = document.getElementById(this.mapId);
        if (mapContainer) {
            // map initialization logic
          //  console.log('Map initialized for:', this.mapId);
        }
    }

    closeMap() {
        this.showMap = false;
    }
}
