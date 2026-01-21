import { Component, ViewChild, ElementRef } from '@angular/core';
import { CustomMessageService } from 'src/app/core/services/custom-message.service';
import { GmlDegerlendirmeUploadService } from '../../degerlendirme/services/gml-degerlendirme-upload.service';
import { Router } from '@angular/router';
import { SpatialDataResponseDto } from '../../gml-factory/models/spatialDataResponseDto';
import { TkmDegerlendirmeGmlUploadDto } from '../../degerlendirme/components/models/tkmDegerlendirmeGmlUploadDto';
import { TkmDegerlendirmeGmlApprovedResDto } from '../../degerlendirme/components/models/TkmDegerlendirmeGmlApprovedResDto';
import { DegerlendirmeAlanDto } from '../../degerlendirme/components/models/degerlendirmeAlanDto';
import { TkmGmlUploadPreviewMapDto } from 'src/app/core/modules/preview-map-ui/models/tkmGmlUploadPreviewMapDto';
import { AdministrativeQueryService } from '../../gml-factory/services/administrative-query.service';
import { AppComponent } from 'src/app/app.component';
import * as L from 'leaflet';
import { ConfirmationService, MessageService } from 'primeng/api';
import { firstValueFrom, forkJoin } from 'rxjs';


interface ValidationResultsDto {
    isValid: boolean;
    message: string;
    exceptionStatus: number; // 0: Ok, 1: Warning, 2: Error
}

@Component({
    selector: 'app-degerlendirme',
    templateUrl: './degerlendirme.component.html',
    styleUrls: ['./degerlendirme.component.scss']
})


export class DegerlendirmeComponent {

    ilceList: SpatialDataResponseDto[] = [];
    mahalleList: SpatialDataResponseDto[] = [];

    selectedIlce?: SpatialDataResponseDto;
    selectedMahalle?: SpatialDataResponseDto;
    displayEkleDialog = false;
    newGeom: any = { ad: '', file: null, preview: '' };

    fileName: string | null = null;
    featureCollection: any = null;
    selectedFile: File | null = null;

    domOptions = [33, 36];
    domValue: number = 33;
    ekleMenuItems: any[];
    showSaveButton: boolean = false;

    showMapDialog: boolean = false;
    showMap: boolean = false;
    map!: L.Map;
    selectedRecords: any[] = [];
    selectedUploadRecords: any[] = [];

    @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

    item = {
        paraBirimi: null // veya undefined
    };

    dataList: any[] = [];
    listDto: DegerlendirmeAlanDto[] = [];
    paraBirimleri = [
        { label: 'TL', value: 'TL' },
        { label: 'USD', value: 'USD' },
        { label: 'EUR', value: 'EUR' }
    ];

    private readonly DEFAULT_START_DATE = new Date(2026, 0, 1); // 01.01.2026
    private readonly DEFAULT_END_DATE = new Date(2026, 5, 30); // 30.06.2026

    confirmVisible = false;
    confirmMessage: string = '';
    deleteDescription: string = '';
    confirmRequireDescription = false;
    pendingDeleteItems: any[] = [];
    confirmCallback: ((description?: string) => void) | null = null;
    filterApplied: boolean = false;

    displayUploadResultDialog = false;
    uploadedRecords: any[] = [];

    pageNumber: number = 1;
    pageSize: number = 20;
    totalRecords: number = 0;


    private valuationTypeCache: { [key: string]: any[] } = {};

    constructor(
        private customMessageService: CustomMessageService,
        private gmlDegerlendirmeUploadService: GmlDegerlendirmeUploadService,
        private router: Router,
        private administrativeQueryService: AdministrativeQueryService,
        public app: AppComponent,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) { }

    ngOnInit() {
        this.getIlceler();
        this.preloadValuationTypes();
    }

    async preloadValuationTypes(): Promise<void> {
        try {
            const responses = await firstValueFrom(
                forkJoin({
                    ticari: this.gmlDegerlendirmeUploadService.GetValuationTypeOfTicariAlan(),
                    konut: this.gmlDegerlendirmeUploadService.GetValuationTypeOfKonutAlan(),
                    arazi: this.gmlDegerlendirmeUploadService.GetValuationTypeOfAraziAlan()
                })
            );

            this.valuationTypeCache['ticari'] = responses.ticari?.data || [];
            this.valuationTypeCache['konut'] = responses.konut?.data || [];
            this.valuationTypeCache['arazi'] = responses.arazi?.data || [];
            this.valuationTypeCache['arsa'] = [{ id: 1, name: 'Arsa' }];

            console.log('Valuation tipleri önbelleğe alındı:', this.valuationTypeCache);
        } catch (error) {
            console.error('Valuation tipleri yüklenirken hata:', error);
        }
    }


    getIlceler() {
        debugger;
        if (this.ilceList.length === 0) { // sadece ilk açılışta çağır
            this.administrativeQueryService.getIlceList().subscribe({
                next: (res) => {
                    this.ilceList = res.data;
                    // Eğer API direkt IlceDto[] dönerse:
                    // this.ilceList = res;
                },
                error: (err) => {
                    //console.error('İlçe listesi alınamadı', err);
                    error: () => { this.customMessageService.displayErrorMessageString("İlçe listesi alınamadı."); }
                    this.app.isLoading = false;
                }
            });
        }
    }

    onIlceChange(event) {
        const selectedIlce = event.value;

        this.mahalleList = [];
        this.selectedMahalle = null;

        if (!selectedIlce) return;

        this.administrativeQueryService.getMahalleList(this.selectedIlce.id).subscribe({
            next: (res) => {
                if (this.selectedIlce && this.selectedIlce.id === event.value.id) {
                    this.mahalleList = res.data;
                }
            },
            error: (err) => {
                this.customMessageService.displayErrorMessageString("Mahalle listesi alınamadı.");
                this.mahalleList = [];
            }
        });

    }

    get hasNewRecords(): boolean {
        return this.dataList?.some(x => x.isNew);
    }

    initMap() {
    setTimeout(() => {
        const mapContainer = document.getElementById('popupMap');
        if (!mapContainer) {
            console.error('Harita container bulunamadı');
            return;
        }

        if (!this.map) {
            this.map = L.map('popupMap', {
                center: [35.1856, 33.3823],
                zoom: 12,
                zoomControl: true
            });
            /*
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(this.map);*/
            L.tileLayer('https://atlas.harita.gov.tr/webservis/ortofoto/{z}/{x}/{y}.png?apikey=XAvG6fTb9roukFkrYggu6dFeG5yYa827', {
                maxZoom: 22,
                attribution: '© Tapu ve Kadastro Dairesi Müdürlüğü'
            }).addTo(this.map);


            this.map.attributionControl.setPrefix(
                '<img src="assets/layout/images/Flag_of_the_Turkish_Republic_of_Northern_Cyprus.png" height="15" style="vertical-align:middle;" /> KKTC'
            );
        } else {
            this.map.invalidateSize();
        }
    }, 100); // 100ms delay ile DOM’un tamamen render olmasını bekle
    }

    resetMap() {
        if (this.map) {
            this.map.eachLayer((layer: any) => {
                if (layer instanceof L.Polygon || layer instanceof L.Marker) {
                    this.map.removeLayer(layer);
                }
            });

            // İstersen tile layer'ı da kaldırmak yerine sıfırdan başlatabilirsin
            this.map.setView([35.1856, 33.3823], 12);
            this.map.invalidateSize();
        }
    }

    onFiltrele() {
        if (!this.selectedMahalle) {
            this.customMessageService.displayInfoMessage("Lütfen mahalle seçiniz.");
            return;
        }

        this.filterApplied = true;
        this.app.isLoading = true;

        const dto: DegerlendirmeAlanDto = {
            mahalleId: this.selectedMahalle.id,
            pageNumber: this.pageNumber,
            pageSize: this.pageSize
        };

        this.gmlDegerlendirmeUploadService.ListDegerlendirme(dto).subscribe({
            next: async (response) => {
                this.totalRecords = response?.totalCount || 0;

                const data = response?.data || [];
                if (!data.length) {
                    this.customMessageService.displayInfoMessage("Veri bulunamadı.");
                    this.listDto = [...this.dataList.filter((x) => x.isNew)];
                    this.app.isLoading = false;
                    return;
                }

                const mapped = await Promise.all(
                    (response.data || []).map(async (x) => {
                        const featureTypeName = x.featureTypeDegerlendirme?.toLowerCase() || null;

                        const rawTipOptions = await this.loadValuationTypes(featureTypeName);
                        const tipOptions = Array.isArray(rawTipOptions)
                            ? rawTipOptions.map((t) => ({ label: t.name, value: t.id }))
                            : [];

                        let selectedTip = null;
                        if (x.turId) {
                            selectedTip = tipOptions.find((t) => t.value === x.turId) || null;
                        } else if (featureTypeName === 'arsa') {
                            selectedTip = tipOptions[0] || null;
                        }

                        return {
                            id: x.id,
                            name: x.ad,
                            mahalle: this.selectedMahalle?.name || '',
                            tip: selectedTip,
                            tipOptions,
                            deger: x.deger,
                            paraBirimi: x.paraBirimi,
                            aciklama: x.aciklama,
                            dom: x.dom,
                            featureType: x.featureTypeDegerlendirme,
                            geom: x.geom,
                            degerBaslangicTarihi: x.degerBaslangicTarihi ? new Date(x.degerBaslangicTarihi) : null,
                            degerBitisTarihi: x.degerBitisTarihi ? new Date(x.degerBitisTarihi) : null,
                            isNew: false
                        };
                    })
                );
                console.log('Response data sample:', response.data[0]);

                // Yeni eklenmiş kayıtları da koru
                this.listDto = [...mapped, ...this.dataList.filter((x) => x.isNew)];

            },
            error: () => {
                this.customMessageService.displayErrorMessageString("Veriler alınamadı.");
                this.app.isLoading = false;
            },
            complete: () => {
                this.app.isLoading = false;
            }
        });
    }


    async onPageChange(event: any) {
        this.pageNumber = Math.floor(event.first / event.rows) + 1;
        this.pageSize = event.rows;

       await this.onFiltrele(); // Yeni sayfa numarasıyla sorguyu tekrar gönder
    }

    onEkle() {
        this.newGeom = { ad: '', file: null, preview: '' };
       this.fileName = null;
        this.selectedFile = null;

        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) {
            input.value = '';
        }

        this.displayEkleDialog = true;
    }

    onEkleDialogHide() {
        // Tüm form ve dosya bilgilerini sıfırla
        this.newGeom = { ad: '', file: null, preview: '' };
        this.fileName = null;
        this.selectedFile = null;
        this.domValue = 33; // varsayılan DOM değeri (gerekirse kaldır)

        // Dosya input’unu temizle
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) {
            input.value = '';
        }
    }

    onFileSelected(event: any) {
        const file: File = event.target.files[0];
        if (file && (file.name.endsWith('.gml') || file.name.endsWith('.GML'))) {
            this.fileName = file.name;
            this.selectedFile = file;
        } else {
            this.customMessageService.displayErrorMessageString("Lütfen sadece .gml uzantılı dosya seçiniz.");
        }

        // Aynı dosyayı yeniden seçebilmek için
        event.target.value = '';
    }


    onRemoveFile() {
        this.featureCollection = null;
        this.selectedFile = null;
        this.fileName = null;

        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) {
            input.value = "";
        }
    }

    onDeleteLocalUploadRecords() {
        if (!this.selectedUploadRecords || this.selectedUploadRecords.length === 0) {
            this.customMessageService.displayInfoMessage("Lütfen silinecek kayıtları seçiniz.");
            return;
        }

        const count = this.selectedUploadRecords.length;
        this.showConfirm(
            `Seçili ${count} kayıt listeden silinecektir. Emin misiniz?`,
            () => {
                // Seçili kayıtları listeden çıkar
                this.dataList = this.dataList.filter(x => !this.selectedUploadRecords.includes(x));
                this.selectedUploadRecords = [];

                this.customMessageService.displayInfoMessage("Kayıt(lar) listeden kaldırıldı.");

                // Eğer tablo boşsa dialog'u kapat
                if (!this.dataList || this.dataList.length === 0) {
                    this.displayUploadResultDialog = false;
                }
            },
            false // açıklama alanı gösterilmez
        );

    }

    async onUpload() {
        debugger;
        const defaultParaBirimi =
            this.paraBirimleri.find(p => p.value === 'TL') || null;
        if (!this.selectedFile) {
            this.customMessageService.displayErrorMessageString("Lütfen önce bir dosya seçin.");
            return;
        }

        if (!this.selectedIlce || !this.selectedMahalle || !this.domValue) {
            this.customMessageService.displayErrorMessageString("İlçe, Mahalle ve DOM seçimini yapınız.");
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            const gmlContent = reader.result as string;

            const dto: TkmDegerlendirmeGmlUploadDto = {
                ilceId: this.selectedIlce.id,
                mahalleId: this.selectedMahalle.id,
                dom: this.domValue,
                gmlContent: gmlContent
            };

            this.app.isLoading = true;

            this.gmlDegerlendirmeUploadService.UploadDegerlendirmeGmlContent(dto).subscribe({
                next: async (res: any) => {
                   // console.log('res:', res);
                    this.app.isLoading = false;
                    this.customMessageService.displayInfoMessage("Dosya başarıyla yüklendi!");
                   

                    if (Array.isArray(res) && res.length > 0) {
                        this.dataList = [];

                        for (const item of res) {
                            const backendName = item.name?.trim() || '';

                            // Tip seçeneklerini yükle (featureType eşleme için normalize ediyoruz)
                            const normalizedFeatureName = (item.featureName || backendName).trim().toLowerCase();
                            const rawTipOptions = await this.loadValuationTypes(normalizedFeatureName);
                            const tipOptions = Array.isArray(rawTipOptions)
                                ? rawTipOptions.map(x => ({ label: x.name, value: x.id }))
                                : [];
                            const selectedTip = (normalizedFeatureName === 'arsa') ? tipOptions[0] : null;

                            this.dataList.push({
                                name: backendName,
                                // name: item.name,
                                tip: selectedTip,
                                tipOptions, // dinamik olarak yükleniyor
                                mahalle: this.selectedMahalle?.name || '',
                                // DEFAULT TARİHLER
                                valuationStartDate: new Date(this.DEFAULT_START_DATE),
                                valuationEndDate: new Date(this.DEFAULT_END_DATE),
                                deger: null,
                                // DEFAULT PARA BİRİMİ
                                paraBirimi: defaultParaBirimi ? { ...defaultParaBirimi } : null,
                                /* aciklama: item.geoJsonData
                                     ? JSON.parse(item.geoJsonData)?.properties?.aciklama || ''
                                     : '',*/
                                aciklama: null,
                                dom: item.dom || this.domValue,
                                isNew: true,
                                // featureName: this.mapFeatureName(item.featureName),
                                featureName: this.mapFeatureName(normalizedFeatureName),
                                featureType: this.mapFeatureName(normalizedFeatureName),
                                geoJsonData: item.geoJsonData,
                            });
                        }

                        // this.listDto = [...this.listDto, ...this.dataList];
                        this.uploadedRecords = [...this.dataList];
                        this.showSaveButton = true;
                        this.displayEkleDialog = false;
                        this.displayUploadResultDialog = true;

                    }
                },
                error: (err: any) => {
                    this.app.isLoading = false;

                    let userMessage = "Dosya yüklenirken hata oluştu.";

                    // 1️⃣ err.error.message varsa kullan
                    if (err?.error?.message) {
                        userMessage = err.error.message;
                    }
                    // 2️⃣ err.error varsa ve string ise kullan
                    else if (err?.error && typeof err.error === 'string') {
                        userMessage = err.error;
                    }
                    // 3️⃣ err.message varsa kullan (Angular HttpClient error)
                    else if (err?.message) {
                        userMessage = err.message;
                    }

                    this.customMessageService.displayErrorMessageString(userMessage);
                    console.error('GML yükleme hatası:', err);
                }

            });


        };

        reader.onerror = () => {
            this.customMessageService.displayErrorMessageString("Dosya okunamadı.");
        };

        reader.readAsText(this.selectedFile);
    }

    mapFeatureType(value: number): string {
        switch (value) {
            case 0: return 'Arazi';
            case 1: return 'Arsa';
            case 2: return 'Konut';
            case 3: return 'Ticari';
            default: return 'Diger';
        }
    }

    private mapFeatureName(featureName: string): string {
        switch (featureName) {
            case 'ticari':
                return 'DEGER_TICARI';
            case 'konut':
                return 'DEGER_KONUT';
            case 'arazi':
                return 'DEGER_ARAZI';
            case 'arsa':
                return 'DEGER_ARSA';
            default:
                return featureName; // bilinmeyen ise olduğu gibi gönder
        }
    }

    async loadValuationTypes(featureName: string): Promise<any[]> {
        featureName = (featureName || '').trim().toLowerCase();

        // Cache'de varsa direkt döndür
        if (this.valuationTypeCache[featureName]) {
            return this.valuationTypeCache[featureName];
        }

        // Cache yoksa tek seferlik yükle
        try {
            let res;
            switch (featureName) {
                case 'ticari':
                    res = await firstValueFrom(this.gmlDegerlendirmeUploadService.GetValuationTypeOfTicariAlan());
                    break;
                case 'konut':
                    res = await firstValueFrom(this.gmlDegerlendirmeUploadService.GetValuationTypeOfKonutAlan());
                    break;
                case 'arazi':
                    res = await firstValueFrom(this.gmlDegerlendirmeUploadService.GetValuationTypeOfAraziAlan());
                    break;
                case 'arsa':
                    this.valuationTypeCache['arsa'] = [{ id: 1, name: 'Arsa' }];
                    return this.valuationTypeCache['arsa'];
                default:
                    return [];
            }

        const data = res?.data || [];
        this.valuationTypeCache[featureName] = data;
            return data;
        } catch (error) {
            console.error('Valuation tipi alınırken hata:', error);
            return [];
        }
    }


    getValidationMessagesFromGeoJson(geoJsonData: string): ValidationResultsDto[] {
        const messages: ValidationResultsDto[] = [];

        try {
            const geoJson = JSON.parse(geoJsonData);

            if (geoJson?.features?.length) {
                geoJson.features.forEach((feature: any) => {
                    const props = feature.properties;
                    if (props?.hataDurum && props?.hataKodu !== undefined) {
                        messages.push({
                            isValid: props.hataKodu === 0,
                            message: props.hataDurum,
                            exceptionStatus: props.hataKodu
                        });
                    }
                });
            }
        } catch (e) {
            console.error('GeoJSON parse hatası', e);
        }

        return messages;
    }

    onDeleteSelected() {
        if (!this.selectedRecords || this.selectedRecords.length === 0) {
            this.customMessageService.displayInfoMessage("Lütfen silinecek kayıtları seçiniz.");
            return;
        }

        const count = this.selectedRecords.length;
        const message =
            count === 1
                ? "Seçili 1 kayıt silinecektir. Emin misiniz?"
                : `Seçili ${count} kayıt silinecektir. Emin misiniz?`;

        // 🔹 Eğer tüm seçilen kayıtlar yeni (henüz kaydedilmemiş) ise açıklama isteme
        const onlyNewRecords = this.selectedRecords.every(x => x.isNew);

        //this.pendingDeleteItems = [...this.selectedRecords];

        this.pendingDeleteItems = this.selectedRecords;

        this.showConfirm(
            message,
            (aciklama) => this.onDeleteConfirmed(aciklama),
            !onlyNewRecords // sadece backend kayıtlarında açıklama zorunlu
        );
    }
    /*
    private buildFeatureNameForBackend(item: any): string {
        // Öncelik: featureTypeDegerlendirme varsa onu kullan
        const typeRaw = item.featureTypeDegerlendirme || item.tip?.label || item.featureName || '';
        const typeValue = typeRaw.toString().trim().toLowerCase(); // küçük harfe çevir

        switch (typeValue) {
            case 'arsa': return 'DEGER_ARSA';
            case 'arazi': return 'DEGER_ARAZI';
            case 'konut': return 'DEGER_KONUT';
            case 'ticari': return 'DEGER_TICARI';
            default:
                console.warn('Bilinmeyen featureType:', typeValue, '→ DEGER_ARSA varsayıldı');
                return 'DEGER_ARSA'; // fallback
        }
    }
    */

    private buildFeatureNameForBackend(item: any): string | null {
        // 1️⃣ featureTypeDegerlendirme varsa, doğrudan o kategoriye göre dön
        const typeRaw = (item?.featureTypeDegerlendirme || '').toString().toLowerCase().trim();
        if (typeRaw.includes('arsa')) return 'DEGER_ARSA';
        if (typeRaw.includes('arazi')) return 'DEGER_ARAZI';
        if (typeRaw.includes('konut')) return 'DEGER_KONUT';
        if (typeRaw.includes('ticari')) return 'DEGER_TICARI';

        // 2️⃣ featureType boşsa, tip alanına göre tahmin et
        const tipRaw =
            (item?.tip?.label ||
                item?.tip?.value ||
                item?.tip ||
                item?.name ||
                '').toString().toLowerCase().trim();

        // 🔹 TİCARİ
        if (['ishani', 'işhani', 'plaza', 'karma_proje', 'karma proje', 'otel'].some(t => tipRaw.includes(t)))
            return 'DEGER_TICARI';

        // 🔹 KONUT
        if (['markakonut', 'apartman', 'müstakil', 'mustakil', 'villa'].some(t => tipRaw.includes(t)))
            return 'DEGER_KONUT';

        // 🔹 ARAZİ
        if (['ekili', 'dikili', 'ciplak', 'çıplak'].some(t => tipRaw.includes(t)))
            return 'DEGER_ARAZI';

        // 🔹 ARSA
        if (tipRaw.includes('arsa')) return 'DEGER_ARSA';

        // 3️⃣ Bilinmeyen durumlar için uyarı ver
        console.warn('buildFeatureNameForBackend: Tanımsız tip, varsayılan DEGER_ARSA →', item);
        return 'DEGER_ARSA';
    }

    onDeleteConfirmed(aciklama: string) {
        if (!this.pendingDeleteItems || this.pendingDeleteItems.length === 0) return;

        const onlyNewRecords = this.pendingDeleteItems.every(x => x.isNew);

        if (onlyNewRecords) {
            this.dataList = this.dataList.filter(x => !this.pendingDeleteItems.includes(x));
            this.selectedRecords = [];
            this.pendingDeleteItems = [];
            this.confirmVisible = false;
            this.customMessageService.displayInfoMessage("Kayıt(lar) listeden kaldırıldı.");
            return;
        }

        // Build DTO list but first validate we can determine featureName for every backend record
        const itemsToDeleteFromBackend = this.pendingDeleteItems.filter(x => !x.isNew);
        const problematicItems: any[] = [];

        const dtoList: TkmDegerlendirmeGmlApprovedResDto[] = itemsToDeleteFromBackend.map(item => {
            const featureNameForBackend = this.buildFeatureNameForBackend(item);

            if (!featureNameForBackend) {
                problematicItems.push({
                    name: item.name,
                    tip: item.tip ? (item.tip.label ?? item.tip) : null,
                    featureName: item.featureName,
                    featureTypeDegerlendirme: item.featureTypeDegerlendirme
                });
            }

            // valuationId alınışı - tip nesnesi veya primitive olabilir
            const valuationId = item?.tip && (item.tip.value ?? item.tip) ? (item.tip.value ?? item.tip) : null;

            return {
                id: item.id ?? null,
                geoJsonData: item.geoJsonData ?? '',
                aciklama: item.aciklama,
                name: item.name,
                mahalleId: this.selectedMahalle?.id ?? item.mahalleId ?? null,
                dom: item.dom,
                featureName: featureNameForBackend, // null olabilir, daha sonra kontrol edeceğiz
                deger: item.deger ?? null,
                paraBirimi: (item.paraBirimi && item.paraBirimi.value) ? item.paraBirimi.value : item.paraBirimi ?? null,
                crudType: 2,
                updateDescription: aciklama?.trim() || 'Silme işlemi',
                valuationId: item.tip?.value ?? item.tip?.id ?? item.tip ?? null,
                valuationType: null,
                valuationStartDate: null,
                valuationEndDate: null
            } as TkmDegerlendirmeGmlApprovedResDto;
        });

        // Eğer belirlenemeyen kayıt varsa iptal et ve kullanıcıya göster
        if (problematicItems.length > 0) {
            console.warn('FeatureName belirlenemeyen kayıtlar:', problematicItems);
            this.customMessageService.displayErrorMessageString(
                'Bazı kayıtların tipi belirlenemediği için silme işlemi iptal edildi. ' +
                'Lütfen ilgili kayıtların "Tip" alanını kontrol ediniz veya yöneticinize danışınız.\n' +
                problematicItems.map(p => `Ad: ${p.name}, Tip: ${p.tip ?? '—'}, featureName: ${p.featureName ?? '—'}`).join('\n')
            );
            this.app.isLoading = false;
            this.confirmVisible = false;
            return;
        }

        // Hepsi sorunsuzsa gönder
       // console.log('Silme DTO listesi:', dtoList);
        this.app.isLoading = true;

        this.gmlDegerlendirmeUploadService.SaveGmlContent(dtoList).subscribe({
            next: () => {
                this.app.isLoading = false;
                this.customMessageService.displayInfoMessage("Kayıt(lar) başarıyla silindi.");
                this.confirmVisible = false;
                this.selectedRecords = [];
                this.pendingDeleteItems = [];
                this.onFiltrele();
            },
            error: (err) => {
                this.app.isLoading = false;
                console.error("Silme hatası:", err);
                this.customMessageService.displayErrorMessageString("Silme işlemi sırasında hata oluştu.");
            }
        });
    }

    //onDeleteConfirmed(aciklama: string) {
    //    debugger;
    //    console.log('Silinecek kayıtlar:', this.pendingDeleteItems.map(x => ({ name: x.name, featureName: x.featureName })));
    //    console.log('Silinecek kayıt featureName:', this.pendingDeleteItems.map(x => this.buildFeatureNameForBackend(x)));


    //    if (!this.pendingDeleteItems || this.pendingDeleteItems.length === 0) return;

    //    // 🔹 Eğer hepsi local (isNew) kayıt ise sadece listeden sil
    //    const onlyNewRecords = this.pendingDeleteItems.every(x => x.isNew);

    //    if (onlyNewRecords) {
    //        this.dataList = this.dataList.filter(x => !this.pendingDeleteItems.includes(x));
    //        this.selectedRecords = [];
    //        this.pendingDeleteItems = [];
    //        this.confirmVisible = false;
    //        this.customMessageService.displayInfoMessage("Kayıt(lar) listeden kaldırıldı.");
    //        return;
    //    }

    //    // 🔹 Backend'e gönderilecek DTO listesi
    //    const dtoList: TkmDegerlendirmeGmlApprovedResDto[] = this.pendingDeleteItems
    //        .filter(x => !x.isNew)
    //        .map(item => {
    //            // featureName'i backend ile uyumlu hale getir
    //            /*const featureName = item.featureName?.startsWith('DEGER_')
    //                ? item.featureName
    //                : 'DEGER_' + (item.featureName || item.name);*/

    //            const featureNameForBackend = this.buildFeatureNameForBackend(item);
               
    //            return {
    //                geoJsonData: item.geoJsonData ?? '', // ❗Silmede geoJsonData gönderilmez
    //                aciklama: item.aciklama,
    //                name: item.name,
    //                mahalleId: this.selectedMahalle?.id ?? item.mahalleId ?? null,
    //                dom: item.dom,
    //                // featureName: item.featureName,
    //                featureName: featureNameForBackend,
    //                deger: item.deger ?? null,
    //                paraBirimi: (item.paraBirimi && item.paraBirimi.value)
    //                    ? item.paraBirimi.value
    //                    : item.paraBirimi ?? null,
    //                crudType: 2, // 0: insert, 1: update, 2: delete
    //                updateDescription: aciklama?.trim() || 'Silme işlemi',
    //                valuationId: item.tip.value,
    //                valuationType: null,        // ❗Silmede null olmalı
    //                valuationStartDate: null,
    //                valuationEndDate: null
    //            } as TkmDegerlendirmeGmlApprovedResDto;
    //        });
    //    console.log('Silme DTO listesi:', dtoList);
    //    this.app.isLoading = true;

    //    this.gmlDegerlendirmeUploadService.SaveGmlContent(dtoList).subscribe({
    //        next: () => {
    //            this.app.isLoading = false;
    //            this.customMessageService.displayInfoMessage("Kayıt(lar) başarıyla silindi.");
    //            this.confirmVisible = false;
    //            this.selectedRecords = [];
    //            this.pendingDeleteItems = [];
    //            this.onFiltrele();
    //        },
    //        error: (err) => {
    //            this.app.isLoading = false;
    //            console.error("Silme hatası:", err);
    //            this.customMessageService.displayErrorMessageString("Silme işlemi sırasında hata oluştu.");
    //        }
    //    });
    //}

    showConfirm(message: string, callback: (description?: string) => void, requireDescription: boolean = false) {
        this.confirmMessage = message;
        this.confirmRequireDescription = requireDescription;
        this.deleteDescription = '';
        this.confirmCallback = callback;
        this.confirmVisible = true;
    }

    onConfirmAccept() {
        if (this.confirmRequireDescription && !this.deleteDescription.trim()) {
            this.customMessageService.displayErrorMessageString("Lütfen açıklama giriniz.");
            return;
        }

        this.confirmVisible = false;
        if (this.confirmCallback) {
            this.confirmCallback(this.deleteDescription);
        }
    }

    onConfirmReject() {
        this.confirmVisible = false;
        this.confirmCallback = null;
        this.deleteDescription = '';
    }

    onSaveData() {
        if (!this.dataList || this.dataList.length === 0) {
            this.customMessageService.displayErrorMessageString("Kaydedilecek veri bulunamadı.");
            return;
        }

        const newRecords = this.dataList.filter(x => x.isNew);
        if (newRecords.length === 0) {
            this.customMessageService.displayInfoMessage("Yeni kayıt bulunmamaktadır.");
            return;
        }

        // 🔸 Hata işaretlerini sıfırla
        newRecords.forEach(r => r.validationErrors = {});

        // 🔸 Zorunlu alanlar kontrolü
        let hasMandatoryError = false;
        let hasDateError = false;

        newRecords.forEach(item => {
            item.validationErrors = {};

            if (!item.tip) {
                item.validationErrors.tip = true;
                hasMandatoryError = true;
            }
            if (!item.valuationStartDate) {
                item.validationErrors.valuationStartDate = true;
                hasMandatoryError = true;
            }
            if (!item.valuationEndDate) {
                item.validationErrors.valuationEndDate = true;
                hasMandatoryError = true;
            }
            // Bitiş tarihi başlangıç tarihinden küçük olamaz
            if (item.valuationStartDate && item.valuationEndDate) {
                if (item.valuationEndDate < item.valuationStartDate) {
                    item.validationErrors.valuationEndDate = true;
                    hasDateError = true;
                }
            }

            if (!item.deger && item.deger !== 0) {
                item.validationErrors.deger = true;
                hasMandatoryError = true;
            }
            if (!item.paraBirimi) {
                item.validationErrors.paraBirimi = true;
                hasMandatoryError = true;
            }

            if (!item.name || !item.name.trim()) {
                item.validationErrors.name = true;
                hasMandatoryError = true;
            }

        });

        // 🔹 Hata mesajları
        if (hasMandatoryError) {
            this.customMessageService.displayErrorMessageString(
                "Lütfen tüm zorunlu alanları doldurunuz."
            );
            return;
        }

        if (hasDateError) {
            this.customMessageService.displayErrorMessageString(
                "Bitiş tarihi, başlangıç tarihinden küçük olamaz."
            );
            return;
        }


        const dtoList: TkmDegerlendirmeGmlApprovedResDto[] = newRecords.map(item => {

            const toUtcDate = (date: Date): Date => {
                if (!date) return null;

                // Yıl, ay, gün al
                const year = date.getFullYear();
                const month = date.getMonth();
                const day = date.getDate();

                // UTC olarak yeni Date oluştur
                return new Date(Date.UTC(year, month, day, 0, 0, 0));
            };

            return {
                geoJsonData: item.geoJsonData,
                aciklama: item.aciklama,
                name: item.name,
                mahalleId: this.selectedMahalle?.id ?? item.mahalleId ?? null,
                dom: item.dom,
                featureName: item.featureName,
                deger: item.deger,
                paraBirimi: (item.paraBirimi && item.paraBirimi.value) ? item.paraBirimi.value : item.paraBirimi,
                valuationId: (item.tip && item.tip.value) ? item.tip.value : null,
                valuationType: (item.tip && item.tip.label) ? item.tip.label : null,
                valuationStartDate: toUtcDate(item.valuationStartDate),
                valuationEndDate: toUtcDate(item.valuationEndDate),
                crudType: 0 // 0: insert, 1: update, 2: delete
            } as TkmDegerlendirmeGmlApprovedResDto;
        });

        this.app.isLoading = true;

        this.gmlDegerlendirmeUploadService.SaveGmlContent(dtoList).subscribe({
            //next: (res) => {
            next: (res:string) => {
                this.app.isLoading = false;
                this.customMessageService.displayInfoMessage("Kayıtlar başarıyla kaydedildi.");
                this.showSaveButton = false;
                this.dataList.forEach(x => x.isNew = false);

                this.displayUploadResultDialog = false;
                this.onFiltrele();
            },
            error: (err) => {
                this.app.isLoading = false;
                console.error(err);
                this.customMessageService.displayErrorMessageString("Kayıt işlemi sırasında hata oluştu.");
            }
        });
    }



    goToGeometry(item: any) {
        this.showMap = true;

        // Dialog açıldıktan sonra haritayı initialize et
        setTimeout(() => {
            this.initMap(); // initMap() fonksiyonunu kullan

            // Önceki şekilleri sil
            if (this.map) {
                this.map.eachLayer((layer: any) => {
                    if (layer instanceof L.Polygon || layer instanceof L.Marker) {
                        this.map.removeLayer(layer);
                    }
                });

                let polygon: [number, number][][] = [];

                // 1️⃣ Eğer WKT varsa onu kullan
                if (item.geom) {
                    polygon = this.parseWKTPolygon(item.geom);

                    // 2️⃣ Yoksa geoJsonData varsa ordan çöz
                } else if (item.geoJsonData) {
                    try {
                        const geo = JSON.parse(item.geoJsonData);
                        if (geo?.geometry?.coordinates) {
                            const coords = geo.geometry.coordinates[0].map((c: any) => [c[1], c[0]]);
                            polygon = [coords];
                        }
                    } catch (err) {
                        console.error("GeoJSON parse hatası:", err);
                    }
                }

                // Poligonu haritaya ekle
                if (polygon && polygon.length > 0) {
                    const leafletPolygon = L.polygon(polygon, {
                        color: '#007bff',
                        weight: 2,
                        fillOpacity: 0.4
                    }).addTo(this.map);

                    leafletPolygon.bindPopup(`<b>${item.name}</b><br>${item.aciklama || ''}`);
                    this.map.fitBounds(leafletPolygon.getBounds());
                } else {
                    this.customMessageService.displayErrorMessageString("Geometri bulunamadı.");
                }
            }
        }, 300); // küçük delay, dialog tamamen açıldıktan sonra çalışsın
    }




    /** 🔸 WKT Polygon metnini parse eder ve Leaflet koordinatlarına dönüştürür */
    parseWKTPolygon(wkt: string): [number, number][][] {
        if (!wkt) return [];

        // "Polygon((" ve "))" ifadelerini temizle
        const cleaned = wkt
            .replace(/^POLYGON\s*\(\(/i, '')
            .replace(/\)\)$/, '');

        // Noktaları ayır
        const points = cleaned.split(',').map(p => p.trim().split(' ').map(Number));

        // Leaflet [lat, lon] formatına çevir
        const latlngs: [number, number][] = points.map(([x, y]) => [y, x]);

        // Leaflet poligonlar dizisi (tek halka)
        return [latlngs];
    }

    onGeometriEkle() {
        // console.log('Geometri Ekle tıklandı');
        this.closeMap();
        this.displayEkleDialog = true; // Dialog açılır
    }

    closeMap() {
        if (this.map) {
            this.map.remove();   // Haritayı tamamen temizle
            this.map = null;     // Map objesini sıfırla
        }
        this.showMap = false;
    }


    //showConfirm(message: string, callback: () => void) {
    //    this.confirmMessage = message;
    //    this.confirmCallback = callback;
    //    this.confirmVisible = true;
    //}

    onCancel() {
       /* if (this.dataList) {
            this.dataList = this.dataList.filter(x => !x.isNew);
        }

        this.displayUploadResultDialog = false;*/

        this.dataList = [];

        this.selectedRecords = [];
        this.displayUploadResultDialog = false;

       // this.onFiltrele();
    }
}
