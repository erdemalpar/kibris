import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { MenuService } from 'src/app/layout/app.menu.service';
import { Subscription } from 'rxjs';
import { SpatialDataResponseDto } from '../../roles/operator/gml-factory/models/spatialDataResponseDto';
import { AdministrativeQueryService } from '../../roles/operator/gml-factory/services/administrative-query.service';
import { CustomMessageService } from 'src/app/core/services/custom-message.service';

@Component({
    selector: 'app-basvuru-dialog',
    templateUrl: './basvuru.component.html',
    styleUrls: ['./basvuru.component.scss']
})
export class BasvuruComponent implements OnInit, OnDestroy {
    @Input() name: string = 'Başvuru İşlemleri';

    visible = false;
    minimized = false;
    fullscreen: boolean = false;

    @Output() restored = new EventEmitter<void>();
    @Output() closed = new EventEmitter<void>();

    // Filtre Seçimleri
    selectedIl: any = null; // Tip tanımlı değilse any geçici olarak
    ilList: any[] = [
        { name: 'Adana', code: '01' },
        { name: 'Ankara', code: '06' },
        { name: 'İstanbul', code: '34' },
        { name: 'İzmir', code: '35' }
    ];

    selectedIlce: SpatialDataResponseDto | null = null;
    ilceList: SpatialDataResponseDto[] = [];

    // Kriter seçenekleri
    kriterler = [
        { label: 'Seçiniz', value: null },
        { label: 'Kriter 1', value: 'krit1' },
        { label: 'Kriter 2', value: 'krit2' }
    ];
    selectedKriter: any = null;


    private sub?: Subscription;

    // stil objeleri
    normalStyle = {
        width: '1200px',
        height: '700px',
        padding: '0',
        'min-width': '600px',
        'min-height': '400px'
    };
    minimizedStyle = { width: '320px', height: '40px', padding: '0' };

    rows = 25;
    first = 0;
    totalRecords = 0;
    pagedBasvurular: any[] = [];
    selectedBasvuru: any = null; // Seçilen satır

    // Mock Data - Resimdeki sütunlara göre güncellendi
    basvurular = [
        {
            basvuruNo: '2023/001', fenKayit: 'FK-101', basvuruTip: 'Tevhid', basIslem: 'Ön İnceleme',
            ilce: 'Çankaya', zemin: 'Arsa', gor1: '', gor2: '', odeme: 'Ödendi', durum: 'Onaylandı',
            veriOnay: 'Evet', tescilDurum: 'Tescilli', randevuTarih: '01.01.2024', randevuTarih2: '05.01.2024'
        },
        {
            basvuruNo: '2023/002', fenKayit: 'FK-102', basvuruTip: 'İfraz', basIslem: 'Kontrol',
            ilce: 'Keçiören', zemin: 'Tarla', gor1: '', gor2: '', odeme: 'Bekliyor', durum: 'Sürece',
            veriOnay: 'Hayır', tescilDurum: 'Bekliyor', randevuTarih: '02.01.2024', randevuTarih2: '06.01.2024'
        },
        {
            basvuruNo: '2023/003', fenKayit: 'FK-103', basvuruTip: 'Yola Terk', basIslem: 'Onay',
            ilce: 'Mamak', zemin: 'Arsa', gor1: '', gor2: '', odeme: 'Ödendi', durum: 'Tamamlandı',
            veriOnay: 'Evet', tescilDurum: 'Tescilli', randevuTarih: '03.01.2024', randevuTarih2: '07.01.2024'
        },
        {
            basvuruNo: '2023/004', fenKayit: 'FK-104', basvuruTip: 'İrtifak', basIslem: 'Başvuru',
            ilce: 'Gölbaşı', zemin: 'Zeytinlik', gor1: '', gor2: '', odeme: 'Bekliyor', durum: 'İnceleniyor',
            veriOnay: 'Hayır', tescilDurum: 'Yok', randevuTarih: '04.01.2024', randevuTarih2: ''
        },
        // Daha fazla dummy veri eklenebilir...
    ];

    constructor(private menuService: MenuService,
        private administrativeQueryService: AdministrativeQueryService,
        private customMessageService: CustomMessageService) { }

    ngOnInit() {
        this.sub = this.menuService.dialogs$.subscribe(dialogs => {
            const state = dialogs[this.name];
            if (state) {
                this.visible = state.visible;
                this.minimized = state.minimized;
                this.loadIlceList();
                this.first = 0;
                this.updatePagedData(0, this.rows);
            }
        });

        // Mock data çoğaltma (tablo dolsun diye)
        for (let i = 0; i < 5; i++) {
            this.basvurular = [...this.basvurular, ...this.basvurular];
        }
        this.totalRecords = this.basvurular.length;
    }

    onPageChange(event: any) {
        this.first = event.first;
        this.rows = event.rows;
        const start = event.first;
        const end = event.first + event.rows;
        this.updatePagedData(start, end);
    }

    updatePagedData(start: number, end: number) {
        if (end > this.basvurular.length) {
            end = this.basvurular.length;
        }
        this.pagedBasvurular = this.basvurular.slice(start, end);
    }

    ngOnDestroy() {
        this.sub?.unsubscribe();
    }

    private loadIlceList(): void {
        if (this.ilceList.length === 0) {
            this.administrativeQueryService.getIlceList().subscribe({
                next: (res) => {
                    this.ilceList = res.data;
                },
                error: (err) => {
                    // this.customMessageService.displayErrorMessageString("İlçe listesi alınamadı.");
                    // Dummy data ile devam et, backend yoksa hata vermesin
                    this.ilceList = [
                        { id: '1', name: 'Aladağ', wkb: '' },
                        { id: '2', name: 'Ceyhan', wkb: '' },
                        { id: '3', name: 'Çukurova', wkb: '' }
                    ] as any;
                }
            });
        }
    }

    closeDialog() {
        this.menuService.closeDialog(this.name);
        this.selectedIlce = null;
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
    }

    ilceChanged(event: any) {
        this.selectedIlce = event.value;
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
            return this.normalStyle;
        }
    }
}
