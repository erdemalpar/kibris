import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { MenuService } from 'src/app/layout/app.menu.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-ozelalanlar',
    templateUrl: './ozelalanlar.component.html',
    styleUrls: ['./ozelalanlar.component.scss']
})
export class OzelalanlarComponent implements OnInit, OnDestroy {
    @Input() name: string = 'OzelAlanlar';

    visible: boolean = false;
    minimized: boolean = false;
    fullscreen: boolean = false;

    seciliAlanTipi: any;
    alanTipleri: any[] = [];

    veriler: any[] = [];
    sutunlar: any[] = [];

    private sub?: Subscription;

    normalStyle = {
        width: '1200px',
        height: '700px',
        padding: '0',
        'min-width': '600px',
        'min-height': '400px'
    };

    constructor(private menuService: MenuService) { }

    ngOnInit(): void {
        this.sub = this.menuService.dialogs$.subscribe(dialogs => {
            const state = dialogs[this.name];
            if (state) {
                this.visible = state.visible;
                this.minimized = state.minimized;
            }
        });

        this.alanTipleri = [
            { ad: 'Seçiniz', kod: null },
            { ad: 'Tip 1', kod: '1' },
            { ad: 'Tip 2', kod: '2' }
        ];

        this.sutunlar = [
            { alan: 'kurumNo', baslik: 'Kurum No' },
            { alan: 'disKurumNo', baslik: 'Dış Kurum No' },
            { alan: 'ilceAd', baslik: 'İlçe Ad' },
            { alan: 'alanAd', baslik: 'Alan Ad' },
            { alan: 'alanTip', baslik: 'Alan Tip' },
            { alan: 'durum', baslik: 'Durum' },
            { alan: 'asama', baslik: 'Aşama' },
            { alan: 'dosyaAdet', baslik: 'Dosya Adet' },
            { alan: 'aciklama', baslik: 'Açıklama' }
        ];

        // Örnek boş veri
        this.veriler = Array(10).fill({});
    }

    ngOnDestroy() {
        this.sub?.unsubscribe();
    }

    closeDialog() {
        this.menuService.closeDialog(this.name);
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
