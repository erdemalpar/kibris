import { Component } from '@angular/core';
import { CustomMessageService } from 'src/app/core/services/custom-message.service';
import { GmlUploadService } from '../../services/gml-upload.service';
import { Router } from '@angular/router';
import { SpatialDataResponseDto } from '../../models/spatialDataResponseDto';
import { TkmGmlUploadDto } from '../../models/tkmGmlUploadDto';
import { TkmGmlUploadPreviewMapDto } from 'src/app/core/modules/preview-map-ui/models/tkmGmlUploadPreviewMapDto';
import { AdministrativeQueryService } from '../../services/administrative-query.service';
import { AppComponent } from 'src/app/app.component';

interface ValidationResultsDto {
    isValid: boolean;
    message: string;
    exceptionStatus: number; // 0: Ok, 1: Warning, 2: Error
}

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})


export class UploadComponent {


  fileName: string | null = null;
  showMapDialog: boolean = false;
  featureCollection: any = null;

  ilceList: SpatialDataResponseDto[] = [];
  mahalleList: SpatialDataResponseDto[] = [];

  selectedIlce?: SpatialDataResponseDto;
  selectedMahalle?: SpatialDataResponseDto;
  selectedFile: File | null = null;

  domOptions = [33, 36];
  domValue: number = 33;
  allValid: boolean = true; 
  constructor(
    private customMessageService: CustomMessageService,
    private gmlUploadService: GmlUploadService,
      private router: Router,
      private administrativeQueryService: AdministrativeQueryService,
      public app: AppComponent
  ) { }

  ngOnInit() {
    this.getIlceler();
  }

  getIlceler() {/*
    this.gmlUploadService.GetIlceler().subscribe(res => {
      if (res.statusCode === 200) {
        this.ilceList = res.data;
      }
    }); */
      if (this.ilceList.length === 0) { // sadece ilk açılışta çağır
          this.administrativeQueryService.getIlceList().subscribe({
              next: (res) => {
                  this.ilceList = res.data;
                  // Eğer API direkt IlceDto[] dönerse:
                  // this.ilceList = res;
              },
              error: (err) => {
                  //console.error('İlçe listesi alınamadı', err);
              }
          });
      }
  }

  onIlceChange(event: any) {/*
    const ilceId = event.value.id;
    this.gmlUploadService.GetMahalleler(ilceId).subscribe(res => {
      if (res.statusCode === 200) {
        this.mahalleList = res.data;
        this.selectedMahalle = undefined;
      }
    });*/ debugger;
      this.selectedIlce = event.value;


      this.mahalleList = [];
      this.selectedMahalle = null;

      if (!this.selectedIlce) {
          return;
      }
      
      this.administrativeQueryService.getMahalleList(this.selectedIlce.id).subscribe({
          next: (res) => {
              if (this.selectedIlce && this.selectedIlce.id === event.value.id) {
                  this.mahalleList = res.data;
              }
          },
          error: (err) => {
           //   console.error('Mahalle listesi alınamadı', err);
              this.mahalleList = [];
          }
      });
  }
  
    onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file && (file.name.endsWith('.gml') || file.name.endsWith('.GML'))) {
        this.fileName = file.name;
        this.selectedFile = file; 
    } else {
      this.customMessageService.displayErrorMessageString("Lütfen sadece .gml uzantılı dosya seçiniz.");
    }
  }
  /*
    onFileSelected(event: any) {
        const file: File = event.target.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.gml')) {
            this.customMessageService.displayErrorMessageString("Lütfen sadece .gml uzantılı dosya seçiniz.");
            return;
        }

        // Önce eski dosya ve haritayı temizle
        this.showMapDialog = false;
        this.featureCollection = null;
        this.selectedFile = null;
        this.fileName = null;

        setTimeout(() => {
            // Yeni dosya set et
            this.selectedFile = file;
            this.fileName = file.name;

            // Eğer parse işlemi burada yapılacaksa (upload değilse)
            // const gmlContent = ... parse edilen GML
            // this.featureCollection = { geoJsonData: gmlContent, ... }

            // Dialogu aç → onDialogShow tetiklenecek → harita yeniden çizilecek
            if (this.featureCollection) {
                this.showMapDialog = true;
            }
        }, 50);
    }

    */
    onRemoveFile() {
      this.featureCollection = null;
      this.selectedFile = null;
        this.fileName = null;

        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) {
            input.value = ""; 
        }
  }


  onUpload() {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    if (!input?.files?.length) {
      this.customMessageService.displayErrorMessageString("Lütfen önce bir dosya seçin.");
      return;
    }

    if (!this.selectedIlce || !this.selectedMahalle || !this.domValue) {
      this.customMessageService.displayErrorMessageString("İlçe, Mahalle ve DOM seçimini yapınız.");
      return;
    }

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const gmlContent = reader.result as string;

      const dto: TkmGmlUploadDto = {
        ilceId: this.selectedIlce.id,
        mahalleId: this.selectedMahalle.id,
        dom: this.domValue,
        gmlContent: gmlContent
      };

        this.app.isLoading = true;

        this.gmlUploadService.UploadGmlContent(dto).subscribe({
            next: (res:any) => {
               // console.log('res:',res);
          this.customMessageService.displayInfoMessage("Dosya başarıyla yüklendi!");
                setTimeout(() => {
              if (res) {
                  // backend’den gelen tek ValidationResultsDto listesi varsa
                  this.featureCollection = {
                      ...res,
                      validationResults: this.getValidationMessagesFromGeoJson(res.geoJsonData)
                  };
                  // allValid kontrolü: tüm validationResults geçerli ise true
                 // this.featureCollection.allValid = this.featureCollection.validationResults.every(v => v.isValid);
                  this.featureCollection.allValid = res.allValid ?? this.featureCollection.validationResults.every(v => v.isValid);
                  this.showMapDialog = true;
              }
                }, 500);
                this.app.isLoading = false;
        },
            error: (err) => {
                this.app.isLoading = false;
          this.customMessageService.displayErrorMessageString("Dosya yüklenirken hata oluştu.");
          console.error(err);
        }
      });


    };

    reader.onerror = () => {
      this.customMessageService.displayErrorMessageString("Dosya okunamadı.");
    };

    reader.readAsText(file);
  }


    onConfirm() {
        debugger;
  if (this.featureCollection) {
    const dto: TkmGmlUploadPreviewMapDto = {
      ilceId: this.featureCollection.ilceId,
      ilceName: this.featureCollection.ilceName,
      mahalleId: this.featureCollection.mahalleId,
      mahalleName: this.featureCollection.mahalleName,
      geoJsonData: this.featureCollection.geoJsonData,
        dom: this.featureCollection.dom,
        featureCount: this.featureCollection.featureCount
      };

      this.app.isLoading = true;

    this.gmlUploadService.SaveGmlContent(dto).subscribe({
        next: (res) => {
            this.app.isLoading = false;
            this.showMapDialog = false;
            this.customMessageService.displayInfoMessage("Veri başarıyla kaydedildi!");
        setTimeout(() => {
         // this.customMessageService.displayInfoMessage("Veri başarıyla kaydedildi!");
            // this.router.navigate(['/main-map']);
            //  Aynı route’u yeniden yükle
            const currentUrl = this.router.url;
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                this.router.navigate([currentUrl]);
            });
        }, 1500);
      },
        error: (err) => {
            this.app.isLoading = false;
        this.showMapDialog = false;
        setTimeout(() => {
          this.customMessageService.displayErrorMessageString("Veri kaydedilirken hata oluştu.");
        }, 1500);
        console.error(err);
      }
    });
  }
  }

    // Backend GeoJSON'undan mesajları ayıkla
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
    
    downloadInvalidGMLs() {
        console.log('Hatalı gml indir');
        if (!this.featureCollection) {
            this.customMessageService.displayErrorMessageString("İndirilecek veri bulunamadı.");
            return;
        }

        const dto: TkmGmlUploadPreviewMapDto = {
            ilceId: this.featureCollection.ilceId,
            ilceName: this.featureCollection.ilceName,
            mahalleId: this.featureCollection.mahalleId,
            mahalleName: this.featureCollection.mahalleName,
            geoJsonData: this.featureCollection.geoJsonData,
            dom: this.featureCollection.dom,
            featureCount: this.featureCollection.featureCount
        };

        this.app.isLoading = true;

        this.gmlUploadService.ErrorGmlDownload(dto).subscribe({
            next: (blob: Blob) => {
                this.app.isLoading = false;

                if (!blob || blob.size === 0) {
                    this.customMessageService.displayErrorMessageString("Boş dosya döndü.");
                    return;
                }

                const fileName = "hatali_gml.gml";

                const link = document.createElement("a");
                link.href = window.URL.createObjectURL(blob);
                link.download = fileName;
                link.click();

                window.URL.revokeObjectURL(link.href);

                this.customMessageService.displayInfoMessage("Hatalı GML başarıyla indirildi!");
            },
            error: (err) => {
                this.app.isLoading = false;

                if (err.status === 404) {
                    this.customMessageService.displayWarningMessage("İlgili kriterlere uygun hata bulunamadı.");
                }
                else if (err.error?.message) {
                    //Backend’ten gelen CustomException mesajı
                    this.customMessageService.displayErrorMessageString(err.error.message);
                }
                else {
                    this.customMessageService.displayErrorMessageString("GML indirilirken bir hata oluştu.");
                }
            }
        });
    }




  // onConfirm() {
  //   if (this.featureCollection) {
  //     this.gmlUploadService.SaveGmlContent(this.featureCollection).subscribe({
  //       next: (res) => {
  //         this.showMapDialog = false;
  //         setTimeout(() => {
  //           this.customMessageService.displayInfoMessage("Veri başarıyla kaydedildi!");
  //           this.router.navigate(['/']);
  //         }, 1500);
  //       },
  //       error: (err) => {
  //         this.showMapDialog = false;
  //         setTimeout(() => {
  //           this.customMessageService.displayErrorMessageString("Veri kaydedilirken hata oluştu.");
  //         }, 1500);
  //         console.error(err);
  //       }
  //     });
  //   }
  // }
}
