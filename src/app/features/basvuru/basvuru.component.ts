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
export class BasvuruComponent implements OnInit, OnDestroy{
    @Input() name: string = 'Başvuru İşlemleri'; // Dinamik isim

    visible = false;
    minimized = false;

    fullscreen: boolean = false;

    @Output() restored = new EventEmitter<void>();
    @Output() closed = new EventEmitter<void>();

    selectedIlce: SpatialDataResponseDto | null = null;
    ilceList: SpatialDataResponseDto[] = [];

    private sub?: Subscription;

    // stil objeleri (template içinde kullanılıyor)
    normalStyle = { width: '1000px', height: '600px', padding: '0' };
    minimizedStyle = { width: '320px', height: '40px', padding: '0' };

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
                // 🔹 Sayfalama verisini başlangıçta yükle
                this.first = 0;
                this.updatePagedData(0, this.rows);
            }
        });
        this.totalRecords = this.basvurular.length;
    }

    // 🔹 Sayfa değişince çalışan event
    onPageChange(event: any) {
        debugger;
      //  console.log('onPageChange event:', event);
        this.first = event.first;
        this.rows = event.rows; // 🔹 Kullanıcı sayfa başına satır sayısını değiştirirse güncelle
       const start = event.first;
       const end = event.first + event.rows;
        //console.log('Computed start,end:', start, end);
        this.updatePagedData(start, end);
        //this.pagedBasvurular = this.basvurular.slice(start, end);
        //  this.pagedBasvurular = this.basvurular.slice(event.first, event.first + event.rows);
       // this.updatePagedData(this.first, this.first + this.rows);
    }

    // 🔹 Görüntülenecek kayıtları güncelle
    updatePagedData(start: number, end: number) {
        debugger;
        // 🔹 Toplam kayıt sayısını aşarsa engelle
        if (end > this.basvurular.length) {
            end = this.basvurular.length;
        }
        this.pagedBasvurular = this.basvurular.slice(start, end);
       // console.log('pagedBasvurular updated: start', start, 'end', end, 'count', this.pagedBasvurular.length);
    }

    ngOnDestroy() {
        this.sub?.unsubscribe();
    }
    rows = 25;
    first = 0;
    totalRecords = 0;
    pagedBasvurular: any[] = []; // sadece gösterilecek kayıtlar
    basvurular = [
        { basvuruNo: '001', fenKayit: 'FK001', basvuruTip: 'Yeni', ilce: 'Merkez', islem: 'Onay', zemin: 'Beton', durum: 'Beklemede' },
        { basvuruNo: '002', fenKayit: 'FK002', basvuruTip: 'Revize', ilce: 'Küçükçekmece', islem: 'Red', zemin: 'Toprak', durum: 'Tamamlandı' },
        { basvuruNo: '003', fenKayit: 'FK003', basvuruTip: 'Revize', ilce: 'Küçükçekmece', islem: 'Red', zemin: 'Toprak', durum: 'Tamamlandı' },
        { basvuruNo: '004', fenKayit: 'FK001', basvuruTip: 'Yeni', ilce: 'Merkez', islem: 'Onay', zemin: 'Beton', durum: 'Beklemede' },
        { basvuruNo: '005', fenKayit: 'FK002', basvuruTip: 'Revize', ilce: 'Küçükçekmece', islem: 'Red', zemin: 'Toprak', durum: 'Tamamlandı' },
        { basvuruNo: '006', fenKayit: 'FK003', basvuruTip: 'Revize', ilce: 'Küçükçekmece', islem: 'Red', zemin: 'Toprak', durum: 'Tamamlandı' },
        { basvuruNo: '007', fenKayit: 'FK001', basvuruTip: 'Yeni', ilce: 'Merkez', islem: 'Onay', zemin: 'Beton', durum: 'Beklemede' },
        { basvuruNo: '008', fenKayit: 'FK002', basvuruTip: 'Revize', ilce: 'Küçükçekmece', islem: 'Red', zemin: 'Toprak', durum: 'Tamamlandı' },
        { basvuruNo: '009', fenKayit: 'FK003', basvuruTip: 'Revize', ilce: 'Küçükçekmece', islem: 'Red', zemin: 'Toprak', durum: 'Tamamlandı' },
        { basvuruNo: '010', fenKayit: 'FK001', basvuruTip: 'Yeni', ilce: 'Merkez', islem: 'Onay', zemin: 'Beton', durum: 'Beklemede' },
        { basvuruNo: '011', fenKayit: 'FK002', basvuruTip: 'Revize', ilce: 'Küçükçekmece', islem: 'Red', zemin: 'Toprak', durum: 'Tamamlandı' },
        { basvuruNo: '012', fenKayit: 'FK003', basvuruTip: 'Revize', ilce: 'Küçükçekmece', islem: 'Red', zemin: 'Toprak', durum: 'Tamamlandı' },
        { basvuruNo: '013', fenKayit: 'FK001', basvuruTip: 'Yeni', ilce: 'Merkez', islem: 'Onay', zemin: 'Beton', durum: 'Beklemede' },
        { basvuruNo: '014', fenKayit: 'FK002', basvuruTip: 'Revize', ilce: 'Küçükçekmece', islem: 'Red', zemin: 'Toprak', durum: 'Tamamlandı' },
        { basvuruNo: '015', fenKayit: 'FK003', basvuruTip: 'Revize', ilce: 'Küçükçekmece', islem: 'Red', zemin: 'Toprak', durum: 'Tamamlandı' },
        { basvuruNo: '016', fenKayit: 'FK001', basvuruTip: 'Yeni', ilce: 'Merkez', islem: 'Onay', zemin: 'Beton', durum: 'Beklemede' },
        { basvuruNo: '017', fenKayit: 'FK002', basvuruTip: 'Revize', ilce: 'Küçükçekmece', islem: 'Red', zemin: 'Toprak', durum: 'Tamamlandı' },
        { basvuruNo: '018', fenKayit: 'FK003', basvuruTip: 'Revize', ilce: 'Küçükçekmece', islem: 'Red', zemin: 'Toprak', durum: 'Tamamlandı' },
        { basvuruNo: '019', fenKayit: 'FK001', basvuruTip: 'Yeni', ilce: 'Merkez', islem: 'Onay', zemin: 'Beton', durum: 'Beklemede' },
        { basvuruNo: '020', fenKayit: 'FK002', basvuruTip: 'Revize', ilce: 'Küçükçekmece', islem: 'Red', zemin: 'Toprak', durum: 'Tamamlandı' },
        { basvuruNo: '021', fenKayit: 'FK003', basvuruTip: 'Revize', ilce: 'Küçükçekmece', islem: 'Red', zemin: 'Toprak', durum: 'Tamamlandı' },
        { basvuruNo: '022', fenKayit: 'FK001', basvuruTip: 'Yeni', ilce: 'Merkez', islem: 'Onay', zemin: 'Beton', durum: 'Beklemede' },
        { basvuruNo: '023', fenKayit: 'FK002', basvuruTip: 'Revize', ilce: 'Küçükçekmece', islem: 'Red', zemin: 'Toprak', durum: 'Tamamlandı' },
        { basvuruNo: '024', fenKayit: 'FK003', basvuruTip: 'Revize', ilce: 'Küçükçekmece', islem: 'Red', zemin: 'Toprak', durum: 'Tamamlandı' },
        { basvuruNo: '025', fenKayit: 'FK001', basvuruTip: 'Yeni', ilce: 'Merkez', islem: 'Onay', zemin: 'Beton', durum: 'Beklemede' },
        { basvuruNo: '026', fenKayit: 'FK002', basvuruTip: 'Revize', ilce: 'Küçükçekmece', islem: 'Red', zemin: 'Toprak', durum: 'Tamamlandı' },
        { basvuruNo: '027', fenKayit: 'FK003', basvuruTip: 'Revize', ilce: 'Küçükçekmece', islem: 'Red', zemin: 'Toprak', durum: 'Tamamlandı' },
        { basvuruNo: '028', fenKayit: 'FK001', basvuruTip: 'Yeni', ilce: 'Merkez', islem: 'Onay', zemin: 'Beton', durum: 'Beklemede' },
        { basvuruNo: '029', fenKayit: 'FK002', basvuruTip: 'Revize', ilce: 'Küçükçekmece', islem: 'Red', zemin: 'Toprak', durum: 'Tamamlandı' },
        { basvuruNo: '030', fenKayit: 'FK003', basvuruTip: 'Revize', ilce: 'Küçükçekmece', islem: 'Red', zemin: 'Toprak', durum: 'Tamamlandı' },
        { basvuruNo: '031', fenKayit: 'FK001', basvuruTip: 'Yeni', ilce: 'Merkez', islem: 'Onay', zemin: 'Beton', durum: 'Beklemede' },
        { basvuruNo: '032', fenKayit: 'FK002', basvuruTip: 'Revize', ilce: 'Küçükçekmece', islem: 'Red', zemin: 'Toprak', durum: 'Tamamlandı' },
        { basvuruNo: '033', fenKayit: 'FK003', basvuruTip: 'Revize', ilce: 'Küçükçekmece', islem: 'Red', zemin: 'Toprak', durum: 'Tamamlandı' },
        { basvuruNo: '034', fenKayit: 'FK001', basvuruTip: 'Yeni', ilce: 'Merkez', islem: 'Onay', zemin: 'Beton', durum: 'Beklemede' },
        { basvuruNo: '035', fenKayit: 'FK002', basvuruTip: 'Revize', ilce: 'Küçükçekmece', islem: 'Red', zemin: 'Toprak', durum: 'Tamamlandı' },
        { basvuruNo: '036', fenKayit: 'FK003', basvuruTip: 'Revize', ilce: 'Küçükçekmece', islem: 'Red', zemin: 'Toprak', durum: 'Tamamlandı' },
    ];

    // Kriter seçenekleri
    kriterler = [
        { label: 'Tümü', value: null },
        { label: 'Kriter 1', value: 'krit1' },
        { label: 'Kriter 2', value: 'krit2' }
    ];
    selectedKriter: any = null;

    private loadIlceList(): void {
        if (this.ilceList.length === 0) {
            this.administrativeQueryService.getIlceList().subscribe({
                next: (res) => {
                    this.ilceList = res.data;
                },
                error: (err) => {
                    this.customMessageService.displayErrorMessageString("İlçe listesi alınamadı.");
                }
            });
        }
    }

    openDialog(name: string) {
        this.menuService.openDialog(this.name);

        if (this.ilceList.length === 0) {
            this.loadIlceList();
        }
    }

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

    closeDialog() {
        this.menuService.closeDialog(this.name);
        this.selectedIlce = null;
    }

    restoreDialog() {
        this.menuService.restoreDialog(this.name);
        this.minimized = false;
        this.visible = true;
    }

    get dialogClass() {
        if (this.minimized) return 'dialog-minimized';
        if (this.fullscreen) return 'dialog-fullscreen';
        return '';
    }

    get dialogStyle() {
        if (this.minimized) {
            return { width: '0', height: '0', overflow: 'hidden', padding: '0' }; // görünmez
        } else {
            return this.normalStyle;
        }
    }

    ilceChanged(event) {
        this.selectedIlce = event.value;
    }
}
