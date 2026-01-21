import { Component, Input } from '@angular/core';
import * as L from 'leaflet';
import { TkmGmlUploadPreviewMapDto } from '../models/tkmGmlUploadPreviewMapDto';

@Component({
  selector: 'app-preview-map-ui',
  templateUrl: './preview-map-ui.component.html',
  styleUrls: ['./preview-map-ui.component.scss'],
})
export class PreviewMapUIComponent {
  @Input() featureCollection!: TkmGmlUploadPreviewMapDto;
  @Input() visible: boolean = false;

  private map!: L.Map;

  onDialogShow() {
    this.initMap();
  }


    private initMap() {
        debugger;
      if (!this.featureCollection) return;

      if (this.map) {
          this.map.remove(); // eski map DOM’dan kalkar
      }

    this.map = L.map('previewMap', {
        zoomControl: false,
        minZoom: 10
    }).setView([35.1856, 33.3823], 12);

    
        //L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    L.tileLayer('https://atlas.harita.gov.tr/webservis/ortofoto/{z}/{x}/{y}.png?apikey=XAvG6fTb9roukFkrYggu6dFeG5yYa827', {
      maxZoom: 22,
      attribution: '© Tapu ve Kadastro Dairesi Müdürlüğü'
    }).addTo(this.map);

    
    this.map.attributionControl.setPrefix(
      '<img src="assets/layout/images/Flag_of_the_Turkish_Republic_of_Northern_Cyprus.png" height="15" style="vertical-align:middle;" /> KKTC'
    );

    try {
      const geoJsonData = JSON.parse(this.featureCollection.geoJsonData);
      const domValue = this.featureCollection.dom;
     // console.log('DOM Değeri:', domValue);

        const geoLayer = L.geoJSON(geoJsonData, {
            /*
            pointToLayer: (feature, latlng) => {
                return L.circleMarker(latlng, {
                    radius: 6,
                    weight: 2,
                    fillOpacity: 0.3
                });
            },*/
            pointToLayer: (feature, latlng) => {
                const status = Number(
                    feature.properties?.hataKodu ??
                    feature.properties?.["Hata Kodu"] // ✅ backend’in gönderdiği hali
                ) || 0;
                let color = 'green';
                if (status === 2) color = 'red';
                else if (status === 1) color = 'yellow';

                return L.circleMarker(latlng, {
                    radius: 6,
                    weight: 2,
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.7
                });
            },
            style: (feature) => {
                const status = Number(
                    feature.properties?.hataKodu ??
                    feature.properties?.["Hata Kodu"]
                ) || 0;
                // Öncelik: 2 > 1 > 0
                let color = 'green';
                if (status === 2) color = 'red';
                else if (status === 1) color = 'yellow';
                return { color, weight: 2, fillOpacity: 0.3 };
            },
        onEachFeature: (feature, layer) => {
          if (feature.properties) {
            const popupContent = Object.entries(feature.properties)
              .map(([key, value]) => `<strong>${key}:</strong> <i>${value}</i>`)
              .join('<br>');
            layer.bindPopup(popupContent);
          }
        },
      }).addTo(this.map);

      this.map.fitBounds(geoLayer.getBounds());
    } catch (error) {
     console.error('GeoJSON parse hatası:', error);
    }
  }
}



// import { Component, Input, SimpleChanges } from '@angular/core';
// import * as L from 'leaflet';

// @Component({
//   selector: 'app-preview-map-ui',
//   templateUrl: './preview-map-ui.component.html',
//   styleUrls: ['./preview-map-ui.component.scss'],
// })
// export class PreviewMapUIComponent {
//   @Input() featureCollection: any;
//   @Input() visible: boolean = false;

//   private map!: L.Map;

//   onDialogShow() {
//     this.initMap();
//   }

//   private initMap() {
//     const baseMapURl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
//     this.map = L.map('previewMap').setView([35.1856, 33.3823], 8);
//     L.tileLayer(baseMapURl).addTo(this.map);

//     if (this.featureCollection) {
//       const geoLayer = L.geoJSON(this.featureCollection, {
//         onEachFeature: (feature, layer) => {
//           if (feature.properties) {
//             const popupContent = Object.entries(feature.properties)
//               .map(([key, value]) => `<strong>${key}:</strong> <i>${value}</i>`)
//               .join('<br>');
//             layer.bindPopup(popupContent);
//           }
//         }
//       }).addTo(this.map);

//       this.map.fitBounds(geoLayer.getBounds());
//     }
//   }
// }
