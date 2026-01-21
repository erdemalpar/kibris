import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { MenuService } from 'src/app/layout/app.menu.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-fenkayit-dialog',
    templateUrl: './fenkayit.component.html',
    styleUrls: ['./fenkayit.component.scss']
})
export class FenkayitComponent implements OnInit, OnDestroy {

    fullscreen = false;
    @Input() name: string = 'FenKlasor';

    visible = false;
    minimized = false;

    @Output() restored = new EventEmitter<void>();
    @Output() closed = new EventEmitter<void>();

    private sub?: Subscription;

    // Arama
    searchBasvuruNo: string = '';

    // Data - İşlemler
    islemler = [
        /*{ name: 'Tevhid', id: 1 },
        { name: 'İfraz', id: 2 },
        { name: 'Yola Terk', id: 3 }*/
    ];
    selectedIslem: any;

    // Data - Parseller
    parceller = [
        /*{ ada: 101, parsel: 5, tip: 'Kadastro' },
        { ada: 101, parsel: 6, tip: 'Kadastro' }*/
    ];
    selectedParcel: any;

    // Data - Meta
    metaData = {
        /*alan: '1200 m²',
        malik: 'Ahmet Yılmaz',
        nitelik: 'Arsa'*/
    };

    // stil objeleri
    normalStyle = { width: '75vw', height: '55vh', padding: '0' };
    minimizedStyle = { width: '320px', height: '40px', padding: '0' };

    constructor(private menuService: MenuService) { }

    ngOnInit() {
        this.sub = this.menuService.dialogs$.subscribe(dialogs => {
            const state = dialogs[this.name];
            if (state) {
                this.visible = state.visible;
                this.minimized = state.minimized;
            }
        });
    }

    ngOnDestroy() { this.sub?.unsubscribe(); }

    openDialog(name: string) {
        this.menuService.openDialog(this.name);
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

    restoreDialog() {
        this.menuService.restoreDialog(this.name);
        this.minimized = false;
        this.visible = true;
    }

    performAction(action: any) {
        // console.log('İşlem:', action);
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
            return this.fullscreen ? { width: '100vw', height: '100vh', margin: 0 } : this.normalStyle;
        }
    }
}
