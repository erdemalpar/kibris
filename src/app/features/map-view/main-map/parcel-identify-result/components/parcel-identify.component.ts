import { Component, OnInit, Input } from '@angular/core';
import { ParcelInfoDto } from 'src/app/core/models/parcelInfoDto';
import { MapToolbarService } from '../../services/map-toolbar.service';
import { MenuService } from 'src/app/layout/app.menu.service';
import { MapDrawService } from '../../services/map-draw.service';
import { MainMapService } from '../../services/main-map.service';
import proj4 from 'proj4';

interface LayerNode {
    label: string;
    count?: number;       // alt öğe sayısı
    children?: LayerNode[];
    expanded?: boolean;
}

@Component({
    selector: 'app-parcel-identify',
    templateUrl: './parcel-identify.component.html',
    styleUrls: ['./parcel-identify.component.scss']
})
export class ParcelIdentifyComponent implements OnInit {
    // ... (rest of properties)
    @Input() name: string = 'Öznitelik Bilgileri';
    visible: boolean = false;
    minimized: boolean = false;
    fullscreen: boolean = false;

    parcelDetails: ParcelInfoDto | null = null;

    // ITRF96 / TM33 Definition
    private readonly ITRF96_TM33 = "+proj=tmerc +lat_0=0 +lon_0=33 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs";

    // stil objeleri (template içinde kullanılıyor)
    normalStyle = { width: '700px', height: '450px', padding: '0' };
    minimizedStyle = { width: '320px', height: '40px', padding: '0' };

    layers: LayerNode[] = [];
    selectedLayer: any = null;
    selectedParcel: any = null; // Sağ panelde gösterilecek parsel
    activeTab: 'oznitelik' | 'koordinat' | 'geometri' = 'oznitelik';

    expandedSections: Record<string, Record<string, boolean>> = {
        oznitelik: {
            parsel: true,
            kullanim: false
        },
        koordinat: {
            koordinatBilgi: true
        },
        geometri: {
            geometriBilgi: true,
            cepheUzunluk: false
        }
    };

    coordinates: { lon: number; lat: number }[] = [];
    geometriAlan: number | null = null;
    geometriCevre: number | null = null;
    cepheList: { index: number; length: number }[] = [];

    constructor(private mapToolbarService: MapToolbarService,
        private menuService: MenuService,
        private mapDrawServise: MapDrawService,
        private mainMapService: MainMapService) { }

    ngOnInit(): void {
        this.mapToolbarService.parcelInfo$.subscribe((parcel) => {
            if (parcel) {
                this.parcelDetails = parcel;
                this.visible = true; // Dialog aç

                // Dinamik child listeleri oluştur
                const ilce = parcel.ilceAdi ? [{ label: parcel.ilceAdi }] : [];
                const mahalleler = parcel.mahalleAdi ? [{ label: parcel.mahalleAdi }] : [];
                const adalar = parcel.adaNo ? [{ label: parcel.adaNo }] : [];
                const parseller = parcel.parselNo ? [{ label: parcel.parselNo }] : [];

                // Katmanları oluştur
                this.layers = [
                    {
                        label: 'Katmanlar',
                        count: (ilce.length ? 1 : 0) + (mahalleler.length ? 1 : 0) + (adalar.length ? 1 : 0) + (parseller.length ? 1 : 0),
                        expanded: true,
                        children: [
                            {
                                label: 'İlçe',
                                count: ilce.length,
                                expanded: true,
                                children: [{ label: parcel.ilceAdi }]
                            },
                            {
                                label: 'Mahalle',
                                count: mahalleler.length,
                                expanded: true,
                                children: [{ label: parcel.mahalleAdi }]
                            },
                            {
                                label: 'Ada',
                                count: adalar.length,
                                expanded: true,
                                children: [{ label: parcel.adaNo }]
                            },
                            {
                                label: 'Parsel',
                                count: parseller.length,
                                expanded: true,
                                children: [{ label: parcel.parselNo }]
                            }
                        ]
                    }
                ];

                // this.selectedParcel = null;
                this.selectedParcel = {
                    type: 'parsel',
                    label: parcel.parselNo,
                    adaParsel: `${parcel.adaNo}/${parcel.parselNo}`,
                    tapuAlani: parcel.tapuAlani || '-',
                    nitelik: parcel.nitelik || '-',
                    geomGeoJson: parcel.geomGeoJson || null,
                };

                // Seçili layer da ilk parsel node’u olsun
                this.selectedLayer = this.layers[0].children?.find(c => c.label === 'Parsel')?.children?.[0] || null;

                // Koordinat ve geometriyi hazırla
                this.parseCoordinates();

                this.activeTab = 'oznitelik';

            } else {
                this.visible = true; // Veri yoksa kapat
                this.layers = [];
            }
        });
    }

    toggleNode(node: LayerNode) {
        node.expanded = !node.expanded;
    }

    selectLayer(layer: any) {
        this.selectedLayer = layer;
    }

    toggleSection(tab: 'oznitelik' | 'koordinat' | 'geometri', section: string) {
        const isOpen = this.expandedSections[tab][section];

        // Önce sadece o sekmedeki tüm bölümleri kapat
        Object.keys(this.expandedSections[tab]).forEach(key => {
            this.expandedSections[tab][key] = false;
        });

        // Tıklananı aç (eğer kapalıysa)
        this.expandedSections[tab][section] = !isOpen;
    }

    setActiveTab(tab: 'oznitelik' | 'koordinat' | 'geometri') {
        this.activeTab = tab;

        // Sekme değişince ilgili expanded yapısını kontrol et
        if (!this.expandedSections[tab]) {
            this.expandedSections[tab] = {};
        }
    }

    selectParcel(label: string, sub: any) {
        this.selectedLayer = sub;
        // this.selectedLayer = { ...layer, type: 'parsel' };
        if (!this.parcelDetails) return;

        // parcelDetails tek parsel olduğu için örnek gösterim
        this.selectedParcel = {
            type: 'parsel',
            label,
            //tasinmazId: this.parcelDetails.tasinmazId || '-', // parcelDetails içinde varsa
            adaParsel: `${this.parcelDetails.adaNo}/${this.parcelDetails.parselNo}`,
            tapuAlani: this.parcelDetails.tapuAlani || '-',
            nitelik: this.parcelDetails.nitelik || '-',
            //koordinat: `${this.parcelDetails.latitude}, ${this.parcelDetails.longitude}`,
            geomGeoJson: this.parcelDetails?.geomGeoJson || null,
        };
        this.parseCoordinates();
        this.activeTab = 'oznitelik'; // default olarak Öznitelik göster
    }

    // Ada seçildiğinde
    selectAda(adaLabel: string, sub: any) {
        // this.selectedLayer = { ...layer, type: 'ada' };
        this.selectedLayer = sub;
        // Ada için template'te kullanacağımız minimal obje
        this.selectedParcel = {
            type: 'ada',
            adaNo: adaLabel,  // HTML’de göstereceğimiz değer
            label: adaLabel
        };

        // Ada için koordinat/geometri yoksa temizle
        this.coordinates = [];
        this.geometriAlan = null;
        this.geometriCevre = null;
        this.cepheList = [];
        this.activeTab = 'oznitelik';
    }

    // Mahalle seçildiğinde
    selectMahalle(label: string, sub: any) {
        // this.selectedLayer = { ...layer, type: 'mahalle' };
        this.selectedLayer = sub;
        this.selectedParcel = {
            type: 'mahalle',
            mahalleAdi: label,
            label,
            geomGeoJson: sub.geomGeoJson || this.parcelDetails?.geomGeoJson || null
        };

        this.parseCoordinates();
        // this.coordinates = [];
        this.geometriAlan = null;
        this.geometriCevre = null;
        this.cepheList = [];
        this.activeTab = 'oznitelik';
    }

    selectIlce(label: string, sub: any) {
        // this.selectedLayer = { ...layer, type: 'mahalle' };
        this.selectedLayer = sub;
        this.selectedParcel = {
            type: 'ilce',
            ilceAdi: label,
            label,
            geomGeoJson: sub.geomGeoJson || this.parcelDetails?.geomGeoJson || null
        };

        this.parseCoordinates();
        // this.coordinates = [];
        this.geometriAlan = null;
        this.geometriCevre = null;
        this.cepheList = [];
        this.activeTab = 'oznitelik';
    }

    parseCoordinates() {
        this.coordinates = [];
        this.geometriAlan = null;
        this.geometriCevre = null;
        this.cepheList = [];

        if (!this.selectedParcel?.geomGeoJson) return;

        try {
            const geoJson = JSON.parse(this.selectedParcel.geomGeoJson);

            let totalArea = 0;
            let totalPerimeter = 0;

            // Helper to process a single Polygon (array of rings)
            const processPolygon = (rings: any[]) => {
                rings.forEach((ring, index) => {
                    // Convert ring coords to {lon, lat} format
                    const ringCoords = ring.map((pair: number[]) => ({
                        lon: pair[0],
                        lat: pair[1]
                    }));

                    const ringArea = this.calculateArea(ringCoords);
                    const ringPerim = this.calculatePerimeter(ringCoords);

                    // First ring is exterior (Add area), others are holes (Subtract area)
                    if (index === 0) {
                        totalArea += ringArea;
                    } else {
                        totalArea -= ringArea;
                    }

                    // Perimeter is always additive
                    totalPerimeter += ringPerim;
                });
            };

            if (geoJson.type === 'Polygon') {
                // geoJson.coordinates is Array of Rings
                processPolygon(geoJson.coordinates);

                // For UI List: Use only the exterior ring (index 0)
                if (geoJson.coordinates.length > 0) {
                    this.coordinates = geoJson.coordinates[0].map((pair: number[]) => ({
                        lon: pair[0],
                        lat: pair[1]
                    }));
                    // Cephe listesi sadece dış halka için hesaplansın (Genelde istenen budur)
                    this.cepheList = this.calculateEdgeLengths(this.coordinates);
                }

            } else if (geoJson.type === 'MultiPolygon') {
                // geoJson.coordinates is Array of Polygons (which are Array of Rings)
                geoJson.coordinates.forEach((polygonRings: any[]) => {
                    processPolygon(polygonRings);
                });

                // For UI List: Use the exterior ring of the FIRST polygon
                if (geoJson.coordinates.length > 0 && geoJson.coordinates[0].length > 0) {
                    this.coordinates = geoJson.coordinates[0][0].map((pair: number[]) => ({
                        lon: pair[0],
                        lat: pair[1]
                    }));
                    this.cepheList = this.calculateEdgeLengths(this.coordinates);
                }
            }

            this.geometriAlan = Number(Math.abs(totalArea).toFixed(2));
            this.geometriCevre = Number(totalPerimeter.toFixed(2));

        } catch (e) {
            console.error('GeoJSON parse hatası:', e);
            this.coordinates = [];
        }
    }

    // ITRF96 TM33 Projeksiyonuna göre çevre hesabı (Metre)
    calculatePerimeter(coords: { lon: number, lat: number }[]): number {
        if (!coords || coords.length < 2) return 0;

        let total = 0;

        for (let i = 0; i < coords.length - 1; i++) {
            const p1 = coords[i];
            const p2 = coords[i + 1];

            // WGS84 -> ITRF96 TM33
            const projP1 = proj4(this.ITRF96_TM33, [p1.lon, p1.lat]);
            const projP2 = proj4(this.ITRF96_TM33, [p2.lon, p2.lat]);

            // Öklid mesafesi
            const dx = projP2[0] - projP1[0];
            const dy = projP2[1] - projP1[1];
            total += Math.sqrt(dx * dx + dy * dy);
        }
        return Number(total.toFixed(2));
    }

    // ITRF96 TM33 Projeksiyonuna göre alan hesabı (Metrekare)
    calculateArea(coords: { lon: number, lat: number }[]): number {
        if (!coords || coords.length < 3) return 0;

        let area = 0;

        // Shoelace formülü (Düzlem geometrisi)
        for (let i = 0; i < coords.length - 1; i++) {
            const p1 = coords[i];
            const p2 = coords[i + 1];

            // WGS84 -> ITRF96 TM33
            const [x1, y1] = proj4(this.ITRF96_TM33, [p1.lon, p1.lat]);
            const [x2, y2] = proj4(this.ITRF96_TM33, [p2.lon, p2.lat]);

            area += (x1 * y2) - (x2 * y1);
        }

        area = Math.abs(area / 2.0);
        return Number(area.toFixed(2));
    }

    formatArea(value: number | null | undefined): string {
        if (value == null || isNaN(value)) return '-';

        // Ondalık var mı kontrol et
        if (Number.isInteger(value)) {
            return value.toFixed(2) + ' m²'; // 58 → 58.00 m²
        } else {
            return value + ' m²'; // 123.4567 → 123.4567 m²
        }
    }

    formatLength(value: number | null | undefined): string {
        if (value == null || isNaN(value)) return '-';
        return Number.isInteger(value) ? value.toFixed(2) + ' m' : value + ' m';
    }

    // İki nokta arasındaki mesafe (ITRF96)
    calculateEdgeLengths(coords: { lon: number, lat: number }[]): { index: number; length: number }[] {
        const edges: { index: number; length: number }[] = [];
        if (!coords || coords.length < 2) return edges;

        for (let i = 0; i < coords.length - 1; i++) {
            const p1 = coords[i];
            const p2 = coords[i + 1];

            // WGS84 -> ITRF96 TM33
            const projP1 = proj4(this.ITRF96_TM33, [p1.lon, p1.lat]);
            const projP2 = proj4(this.ITRF96_TM33, [p2.lon, p2.lat]);

            const dx = projP2[0] - projP1[0];
            const dy = projP2[1] - projP1[1];
            const length = Math.sqrt(dx * dx + dy * dy);

            edges.push({
                index: i + 1,
                length: Number(length.toFixed(2))
            });
        }

        return edges;
    }

    get dialogClass() {
        if (this.minimized) return 'dialog-minimized';
        if (this.fullscreen) return 'dialog-fullscreen';
        return '';
    }

    get dialogStyle() {
        if (this.minimized) {
            return { width: '320px', height: '40px', padding: '0' };  // sadece ufalt
        } else {
            return this.normalStyle; // geniş hali
        }
    }

    closeDialog() {
        this.visible = false;
        this.fullscreen = false;
        this.minimized = false;

        this.parcelDetails = null;
        this.selectedParcel = null;
        this.selectedLayer = null;
        this.layers = [];

        this.mapToolbarService.clearSinglePointMarkers();
        this.mapToolbarService.disableIdentify();
        this.menuService.closeDialog(this.name);
    }
    /*
    toggleMinimize() {
        this.minimized = !this.minimized;
    }*/

    toggleMinimize() {
        this.minimized = !this.minimized;              // minimize flag
        this.fullscreen = false;
        this.menuService.toggleMinimized(this.name);
    }

    toggleFullscreen() {
        this.fullscreen = !this.fullscreen;

        if (this.fullscreen) {
            this.menuService.restoreDialog(this.name); // veya this.minimized = false;
            this.minimized = false;
            this.visible = true; // fullscreen açarken görünürlüğü garantile
        }
    }

    restoreDialog() {
        this.menuService.restoreDialog(this.name);
        this.minimized = false;
        this.visible = true;
    }

    zoomToCoordinate(coord: { lat: number; lon: number }) {
        const map = this.mainMapService.getMap();
        if (!map) return;

        this.mapDrawServise.addCircleToMap(map, [coord.lat, coord.lon]);
    }

}
