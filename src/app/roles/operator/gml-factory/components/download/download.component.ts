import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { DialogService } from 'src/app/features/map-view/main-map/services/dialog.service';
import { AdministrativeQueryService } from 'src/app/roles/operator/gml-factory/services/administrative-query.service';
import { MapDrawService } from 'src/app/features/map-view/main-map/services/map-draw.service';
import { SpatialDataResponseDto } from '../../models/spatialDataResponseDto';
import { TkmGmlDownloadDto } from '../../models/tkmGmlDownloadDto';
import { GmlDownloadService } from '../../services/gml-download.service';
import { CustomMessageService } from 'src/app/core/services/custom-message.service';
import { GmlDownloadStatusService } from '../../services/gml-download-status.service';
import { AppComponent } from 'src/app/app.component';

@Component({
    selector: 'app-download',
    templateUrl: './download.component.html',
    styleUrls: ['./download.component.scss']
})
export class DownloadComponent implements AfterViewInit {

    @ViewChild('downloadDialog', { read: ElementRef }) downloadDialog!: ElementRef;

    displayDialog = false;
    minimized = false;

    selectedIlce: SpatialDataResponseDto | null = null;
    ilceList: SpatialDataResponseDto[] = [];

    selectedMahalle: SpatialDataResponseDto | null = null;
    mahalleList: SpatialDataResponseDto[] = [];

    selectedAda: SpatialDataResponseDto | null = null;
    adaList: SpatialDataResponseDto[] = [];


    selectedParsel: SpatialDataResponseDto | null = null;
    parselList: SpatialDataResponseDto[] = [];

    selectedKatmanList: SpatialDataResponseDto[] = [];
    katmanList: SpatialDataResponseDto[] = [];


    //isDownloading = false;
    progressValue = 0;
    progressInterval: any;
 
    constructor(private dialogService: DialogService,
        private administrativeQueryService: AdministrativeQueryService,
        private mapDrawService: MapDrawService,
        private customMessageService: CustomMessageService,
        private gmlDownloadService: GmlDownloadService,
        public gmlDownloadStatusService: GmlDownloadStatusService,
        public app: AppComponent
     ) {

        this.dialogService.getDialogState$('download').subscribe(state => {
            this.displayDialog = state.visible;
            this.minimized = state.minimized;

            if (state.visible) {
               // this.resetForm();
                this.loadIlceList();

                // Dialog açıldığında pozisyonu ayarlıyoruz
                setTimeout(() => {
                    if (this.downloadDialog?.nativeElement) {
                        const el = this.downloadDialog.nativeElement as HTMLElement;
                        el.style.top = '80px';
                        el.style.right = '50px';
                        el.style.left = 'auto';
                        el.style.transform = 'none';
                    }
                }, 0); 
            }
        });
    }

    ngAfterViewInit(): void {
        // Optional: ilk açılışta da pozisyon ayarı
    }

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

    ilceChanged(event) {
        this.selectedIlce = event.value; 

        this.mahalleList = []; 
        this.selectedMahalle = null;
        this.mapDrawService.clearGeometry();

        if (!this.selectedIlce) {
            return;
        }

        if (this.selectedIlce.geom) {
            try {
                const geometry = JSON.parse(this.selectedIlce.geom);
                this.mapDrawService.drawGeometry(geometry, { fillOpacity: 0, fillColor: 'none' });
            } catch (error) {
                this.customMessageService.displayErrorMessageString("İlçe geometrisi çizilemedi.");
            }
        } else {
            this.mapDrawService.clearGeometry();
        }

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


    mahalleChanged(event) {
        this.selectedAda = null;
        this.adaList = [];

        this.selectedMahalle = event.value; 
        if (!this.selectedMahalle) {
            this.mapDrawService.clearGeometry();
            //this.selectedAda = null;
          //  this.adaList = [];
            return;
        }

        if (this.selectedMahalle.geom) {
            try {
                const geometry = JSON.parse(this.selectedMahalle.geom);
                this.mapDrawService.drawGeometry(geometry, { fillOpacity: 0, fillColor: 'none' });
            } catch (error) {
                //  console.log("Mahalle geometrisi çizilemedi (geçersiz GeoJSON)", error);
                this.customMessageService.displayErrorMessageString("Mahalle geometrisi çizilemedi.");
            }
        } else {
            this.mapDrawService.clearGeometry();
           // console.log("Mahalle geometrisi bulunamadı");
        }

        this.administrativeQueryService.getAdaList(this.selectedMahalle.id).subscribe({
            next: (res) => {
                this.adaList = res.data;
            },
            error: (err) => {
                this.customMessageService.displayErrorMessageString("Ada listesi alınamadı.");
                this.adaList = [];
            }
        });

        if (this.katmanList.length === 0) { 
            this.administrativeQueryService.getKatmanList().subscribe({
                next: (res) => {
                    // this.katmanList = res.data;  Ilce,Pafta ve Degerlendirme katmanları listelenmeyecek şekilde düzenlendi
                    this.katmanList = res.data.filter((x: any) =>
                        x.id !== 14000 && x.id !== 1000 && x.id !== 13000
                    );
                },
                error: (err) => {
                    this.customMessageService.displayErrorMessageString("Katman listesi alınamadı.");
                }
            });
        }
    }

    adaChanged(event) {

        if (!this.selectedAda) {
            this.parselList = [];
            return;
        }

        this.administrativeQueryService.getParselList(this.selectedMahalle.id, this.selectedAda.name).subscribe({
            next: (res) => {
                this.parselList = res.data;
            },
            error: (err) => {
                this.customMessageService.displayErrorMessageString("Parsel listesi alınamadı.");
                this.parselList = [];
            }
        });
    }

    toggleMinimize() {
        this.dialogService.toggleMinimize('download');
    }

    closeDialog() {
        this.dialogService.hideDialog('download');
        this.mapDrawService.clearGeometry();
        this.resetForm(); 

       
    }

    resetForm() {
        this.selectedIlce = null;
        this.selectedMahalle = null;
        this.selectedAda = null;
        this.selectedParsel = null;
        this.selectedKatmanList = [];
        this.mahalleList = [];
        this.mapDrawService.clearGeometry();
    }

    download(): void {
        debugger;
        this.app.isLoading = true; 
        const dtoList: TkmGmlDownloadDto[] = this.selectedKatmanList.map(katman => ({
            ilceId: this.selectedIlce.id,
            mahalleId: this.selectedMahalle.id,
            adaNo: this.selectedAda?.name || '',
            parselNo: this.selectedParsel?.name || '',
            dom:33,
            kriterId: katman.id,
            kriterName: katman.name,
            geom:''
        }));

        this.gmlDownloadService.DownloadGml(dtoList).subscribe({
            next: async (fileBlob) => {
                // Blob içeriğini string olarak oku
                const text = await fileBlob.text();

                (text.includes("İlgili kriterlere uygun veri bulunamadı"));
                this.app.isLoading = false;

                // Eğer "İlgili kriterlere uygun veri bulunamadı" içeriyorsa indirme yapma
                if (text.includes("İlgili kriterlere uygun veri bulunamadı")) {
                    this.customMessageService.displayWarningMessage(
                        "İlgili kriterlere uygun veri bulunamadı!"
                    );
                    return; // DOWNLOAD YOK!
                }

                const a = document.createElement('a');
                const objectUrl = URL.createObjectURL(fileBlob);
                    
                    let fileName = this.sanitizeFileName(this.selectedIlce.name)
                        + '_' + this.sanitizeFileName(this.selectedMahalle.name);

                    if (this.selectedAda?.name && this.selectedAda.name !== this.selectedMahalle.name) {
                        fileName += '_' + this.sanitizeFileName(this.selectedAda.name);
                    }

                    if (this.selectedParsel?.name) {
                        fileName += '-' + this.sanitizeFileName(this.selectedParsel.name);
                    }

                fileName += '.gml';
                a.href = objectUrl;
                    a.download = fileName;
                a.click();

                    URL.revokeObjectURL(objectUrl);
                this.app.isLoading = false;
                    this.customMessageService.displayInfoMessage("İndirme tamamlandı!");
                },
            error: (err) => {
                this.app.isLoading = false;
                this.customMessageService.displayErrorMessageString("GML indirilemedi.");
            }
        });
    }

    private sanitizeFileName(name: string): string {
        return name
            .toLowerCase()
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c');
    }

}
