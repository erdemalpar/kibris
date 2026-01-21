import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild, HostListener } from '@angular/core';
import { AppConfig, LayoutService } from './service/app.layout.service';
import { AuthorizationService } from '../core/services/authorizationService.service';
import { MenuItem } from 'primeng/api';
import { MenuService } from './app.menu.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
})
export class AppTopbarComponent {
    items: MenuItem[] = [];
    isMobile: boolean = false;

    fenDialogVisible = false;

    @ViewChild('menuButton') menuButton!: ElementRef;

    @ViewChild('mobileMenuButton') mobileMenuButton!: ElementRef;

    config!: AppConfig;

   // minimizedDialogs: string[] = [];
   // dialogs: { [key: string]: any } = {};

    //private sub?: Subscription;

    fenMinimized = false;
    constructor(public layoutService: LayoutService, public el: ElementRef,
                public authorizationService:AuthorizationService,
        public menuService: MenuService
         
    ) {/*
        this.subscription = this.layoutService.configUpdate$.subscribe(
            (config) => {
                this.config = config;
            }
        );

        // Responsive menü sistemi
        this.checkScreenSize();
        // this.initializeMenu();
       */
    }
    /*
    ngOnInit() {
        this.sub = this.menuService.minimizedOrder$.subscribe(order => {
            this.minimizedDialogs = order;
            this.cdRef.detectChanges(); // DOM’u güncelle
        });
    }*/

    @HostListener('window:resize', ['$event'])
    onResize() {
        this.checkScreenSize();
       // this.initializeMenu();
    }

    private checkScreenSize() {
        this.isMobile = window.innerWidth <= 768;
        // 992px altında da mobil davranışı uygula
        if (window.innerWidth <= 992) {
            this.isMobile = true;
        }
        // iPad Air ve benzeri tablet'ler için (820px altı)
        if (window.innerWidth <= 820) {
            this.isMobile = true;
        }
    }
    /*
    private initializeMenu() {
        if (this.isMobile) {
            // Mobil için optimize edilmiş menü
            this.items = [
                {
                    label: 'Başvuru',
                    icon: 'pi pi-fw pi-desktop',
                    items: [
                        { label: 'Başvuru', icon: 'pi pi-fw pi-book' },
                        { label: 'Fen Klasörü', icon: 'pi pi-fw pi-folder' },
                        { label: 'İş Yönetimi', icon: 'pi pi-fw pi-briefcase' }
                    ]
                },
                {
                    label: 'Veri',
                    icon: 'pi pi-fw pi-cloud',
                    items: [
                        { label: 'Yükleme', icon: 'pi pi-fw pi-cloud-upload' },
                        { label: 'İndirme', icon: 'pi pi-fw pi-cloud-download' },
                    ]
                },
                {
                    label: 'Arşiv',
                    icon: 'pi pi-fw pi-folder',
                    items: [
                        { label: 'Pafta', icon: 'fg fg-search-country' }
                    ]
                },
                {
                    label: 'İstatistik',
                    icon: 'pi pi-fw pi-chart-bar',
                    items: [
                        { label: 'Kontrol', icon: 'pi pi-fw pi-sliders-h' }
                    ]
                },
                {
                    label: 'Yardım',
                    icon: 'pi pi-fw pi-question',
                    items: [
                        { label: 'Duyurular', icon: 'pi pi-fw pi-info' },
                        { label: 'Dokümanlar', icon: 'pi pi-fw pi-file-o' }
                    ]
                }
            ];
        } else {
            // Desktop için tam menü
            this.items = [
                {
                    label: 'Başvuru',
                    icon: 'pi pi-fw pi-desktop',
                    items: [
                        { label: 'Başvuru İşlemleri', icon: 'pi pi-fw pi-book' },
                        { label: 'Fen Klasörü', icon: 'pi pi-fw pi-folder' },
                        { label: 'İş Yönetimi', icon: 'pi pi-fw pi-briefcase' }
                    ]
                },
                {
                    label: 'Veri',
                    icon: 'pi pi-fw pi-cloud',
                    items: [
                        { label: 'Veri Yükleme', icon: 'pi pi-fw pi-cloud-upload' },
                        { label: 'Veri İndirme', icon: 'pi pi-fw pi-cloud-download' },
                    ]
                },
                {
                    label: 'Arşiv',
                    icon: 'pi pi-fw pi-folder',
                    items: [
                        { label: 'Pafta Kayıt Defteri', icon: 'fg fg-search-country' }
                    ]
                },
                {
                    label: 'İstatistik',
                    icon: 'pi pi-fw pi-chart-bar',
                    items: [
                        { label: 'Kontrol İstatistikleri', icon: 'pi pi-fw pi-sliders-h' }
                    ]
                },
                {
                    label: 'Yardım',
                    icon: 'pi pi-fw pi-question',
                    items: [
                        { label: 'Duyurular', icon: 'pi pi-fw pi-info' },
                        { label: 'Dokümanlar', icon: 'pi pi-fw pi-file-o' }
                    ]
                }
            ];
        }
    }
    */
    onMenuButtonClick() {
        this.layoutService.onMenuToggle();
    }
    

    restoreDialog(name: string) {
        this.menuService.restoreDialog(name); // servis -> visible:true, minimized:false
    }

    closeDialog(name: string) {
        this.menuService.closeDialog(name); // servis -> tamamen kapat
    }

    onLogout() {
        this.authorizationService.logout();
    }
}
