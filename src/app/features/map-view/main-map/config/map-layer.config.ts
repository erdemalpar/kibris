import L, { tileLayer, TileLayer } from 'leaflet';

export interface MapLayerConfig {
    // layers: TileLayer[];
    layers: L.Layer[];
}

export interface OverlayLayerConfig {
    layer: L.Layer;
    active: boolean;
}

// Token'ı localStorage'dan al
//const token = localStorage.getItem("accessToken");

class TokenWmsLayer extends L.GridLayer {
    private wmsUrl: string;
    private wmsLayers: string;
    private wmsVersion: string;
    private wmsFormat: string;
    private wmsTransparent: boolean;
    private wmsStyles: string;
    private wmsSld?: string;
    private wmsSldBody?: string;

    constructor(
        url: string,
        layers: string,
        options: {
            version?: string;
            format?: string;
            transparent?: boolean;
            styles?: string;
        } & L.GridLayerOptions
    ) {
        super(options);
        this.wmsUrl = url;
        this.wmsLayers = layers;
        this.wmsVersion = options.version || '1.1.1';
        this.wmsFormat = options.format || 'image/png';
        this.wmsTransparent = options.transparent ?? true;
        this.wmsStyles = options.styles || '';
    }

    override createTile(coords: L.Coords, done: L.DoneCallback) {
        const token = localStorage.getItem("accessToken");
        const tile = document.createElement('img');
        const tileSize = this.getTileSize();
        const params = new URLSearchParams({
            SERVICE: 'WMS',
            REQUEST: 'GetMap',
            VERSION: this.wmsVersion,
            LAYERS: this.wmsLayers,
            STYLES: this.wmsStyles,
            FORMAT: this.wmsFormat,
            TRANSPARENT: String(this.wmsTransparent),
            WIDTH: String(tileSize.x),
            HEIGHT: String(tileSize.y),
            SRS: 'EPSG:4326',
            BBOX: this._tileCoordsToBounds(coords).toBBoxString()
        });

        // const url = `${this.wmsUrl}?${params.toString()}`;

        const url = `${this.wmsUrl}?${params.toString()}&cache=${Date.now()}`; // cache bypass

        fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` },
            cache: "no-store"
        })
            .then(r => {
                if (!r.ok) throw new Error("WMS error " + r.status);
                return r.blob();
            })
            .then(blob => {
                tile.src = URL.createObjectURL(blob);
                done(null, tile);
            })
            .catch(err => done(err, tile));

        tile.width = tileSize.x;
        tile.height = tileSize.y;

        tile.onerror = () => {
            done(new Error("Tile load failed"), tile);
        };

        return tile;
    }

    private _tileCoordsToBounds(coords: L.Coords) {
        const map = this._map!;
        const tileSize = this.getTileSize();
        const nwPoint = coords.scaleBy(tileSize);
        const sePoint = nwPoint.add(tileSize);
        const nw = map.unproject(nwPoint, coords.z);
        const se = map.unproject(sePoint, coords.z);
        return L.latLngBounds(nw, se);
    }
}

// 🔹 Ana Layer konfigürasyonları
export const BASE_LAYER_CONFIGS: { [key: string]: MapLayerConfig } = {
    googleMap: {
        layers: [
            tileLayer('https://mt0.google.com/vt/lyrs=m&hl=tr&gl=TR&x={x}&y={y}&z={z}', {
                subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
                attribution: 'Google Map',
                zIndex: 1 
            })
        ]
    },
    openstreetmap: {
        layers: [
            tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                zIndex: 1 
            })
        ]
    },
    googleSat: {
        layers: [
            tileLayer('https://mt0.google.com/vt/lyrs=s&hl=tr&gl=TR&x={x}&y={y}&z={z}', {
                subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
                attribution: 'Google Satellite',
                maxNativeZoom: 15,
                maxZoom: 22,
                zIndex: 1 
            })
        ]
    },
    hgm: {
        layers: [
            tileLayer('https://atlas.harita.gov.tr/webservis/ortofoto/{z}/{x}/{y}.png?apikey=XAvG6fTb9roukFkrYggu6dFeG5yYa827', {
                attribution: 'HGM',
                maxNativeZoom: 18,
                maxZoom: 22,
                keepBuffer: 999,
                zIndex: 1 
            })
        ]
    },/*
    kibris: {
        layers: [
            tileLayer.wms('https://cbsservis.tapu.gov.ct.tr/tkm.ows/wms?', {
                layers: 'tkm_kibris:KIBRIS',
                format: 'image/png',
                transparent: true,
                version: '1.1.1',
                attribution: 'Kıbrıs Kadastro'
            })
        ]
    }*/
    kibris: {
        layers: [
            new TokenWmsLayer('https://cbsservis.tapu.gov.ct.tr/tkm.ows/wms', 'tkm_kibris:KIBRIS', {
                format: 'image/png',
                transparent: true,
                version: '1.1.1',
                tileSize: 256,
                zIndex: 1 
                // attribution burada GridLayerOptions içinde tip hatası verebilir;
                // istersen attribution'ı map.addControl(new L.Control.Attribution(...)) ile ekle
            })
        ]
    }
};


// 🔹 Overlay Layer’lar (token destekli olan burada)
export const OVERLAY_LAYER_CONFIGS: { [key: string]: OverlayLayerConfig } = {
    googleLabels: {
        layer: tileLayer('https://{s}.google.com/vt/lyrs=h&hl=tr&gl=TR&x={x}&y={y}&z={z}', {
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: 'Google Labels',
            pane: 'overlayPane',
            zIndex: 999
        }),
        active: false
    },

    // Token’lı WMS servisi (KIBRIS_SAYDAM)
    
    kibrisSaydam: {
        layer: new TokenWmsLayer('https://cbsservis.tapu.gov.ct.tr/tkm.ows/wms', 'tkm_kibris:KIBRIS_SAYDAM', {
            format: 'image/png',
            transparent: true,
            version: '1.1.1',
            tileSize: 256,
            zIndex: 999
        }),
        active: false
    },
    degerlemeGuncel: {
        layer: new TokenWmsLayer('https://cbsservis.tapu.gov.ct.tr/tkm.ows/wms', 'tkm_kibris_degerleme:degerleme_guncel', {
            format: 'image/png',
            transparent: true,
            version: '1.1.1',
            tileSize: 256,
            zIndex: 999
        }),
        active: false
    },
    degerlemeTematik: {
        layer: new TokenWmsLayer(
            'https://cbsservis.tapu.gov.ct.tr/tkm.ows/wms','tkm_kibris_degerleme:degerleme_guncel',{
                format: 'image/png',
                transparent: true,
                version: '1.1.1',
                tileSize: 256,
                zIndex: 999,
                styles:'degerleme_tematik_sld'
            }
        ),
        active: false
    }
};
