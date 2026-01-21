import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { AuthorizationService } from '../core/services/authorizationService.service';
import { Router } from '@angular/router';
import { MainMapService } from '../features/map-view/main-map/services/main-map.service';
import { MenuService } from '../layout/app.menu.service';
import { PrimeNGConfig } from 'primeng/api';



@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html',
})
export class AppMenuComponent implements OnInit {
    model: any[] = [];
    // selectedMapType: string = 'googleMap';
    //selectedMapType: string | null = null;
    //selectedLayerTypes: string[] = [];
    //isMapOpen: boolean = false;
    //isLayerOpen: boolean = false;
    //openMenu: 'map' | 'layer' | 'module'| null = null;
    //moduleExpanded = false;
    //googleLabels = {
    //    active: true
    //};


    /*
    mapTypes = [
        { label: 'Google Map', value: 'googleMap' },
        { label: 'Google Uydu', value: 'googleSat' },
        { label: 'OpenStreetMap', value: 'openstreetmap' },
        { label: 'HGM', value: 'hgm' },
        { label: 'Kıbrıs', value: 'kibris' },
        { label: 'Google Etiket', value: 'googleLabels', isLabel: true,active:true},
        { label: 'Kıbrıs Saydam', value: 'kibrisSaydam', isLabel: true, active: false },
    ];

    layerTypes = [
        { label: 'İlce', value: 'ilce' },
        { label: 'Mahalle', value: 'mahalle' },
        { label: 'Parsel', value: 'parsel' },
        { label: 'Yapı', value: 'yapi' },
        { label: 'İrtifak', value: 'irtifak' },
        { label: 'Yer Kontrol Noktaları', value: 'ykn' },
        { label: 'Değerleme Bölgeleri', value: 'degerlemeBolge' },
        { label: 'Detay', value: 'detay' },
    ]; */

    constructor(
        public authorizationService: AuthorizationService,
        private router: Router,
        private mainMapService: MainMapService,
        private menuService: MenuService,
        private primengConfig: PrimeNGConfig) { }


    ngOnInit() {
        this.primengConfig.ripple = true;
        this.authorizationService.getCodes();
        var result = this.authorizationService.isRefreshTokenExpire();
        if (this.authorizationService.role == undefined || result) {
            // localStorage.removeItem("accessToken");
            // localStorage.removeItem("refreshToken");
            // localStorage.removeItem("refreshTokenExpiration");
            // localStorage.removeItem("accessTokenExpiration");
            // this.router.navigate(["/auth/login"])
        }
        this.model = [
            {
                // label: 'Favorites',
                icon: 'pi pi-home',
                items: [
                    {
                        label: 'Ana Sayfa',
                        icon: 'pi pi-fw pi-home',
                        routerLink: ['/main-map'],
                    },
                ],
            },

            {
                items: [
                    {
                        label: 'Modüller',
                        icon: 'pi pi-fw pi-briefcase',
                        expanded: true,
                        //command: (event) => {
                        //    this.openMenu = this.openMenu === 'module' ? null : 'module';

                        //    // Diğer menüleri kapat
                        //    if (this.openMenu === 'module') {
                        //        this.isMapOpen = false;
                        //        this.isLayerOpen = false;
                        //    }

                        //    // Menü öğesinin kendisi için PrimeNG expanded toggle
                        //    if (event.item) event.item.expanded = this.openMenu === 'module';
                        //},
                        items: [
                            /* {
                                 label: 'Crud',
                                 icon: 'pi pi-fw pi-pencil',
                                 routerLink: ['/operator/crud-test'],
                             },*/
                            {
                                label: 'Başvuru',
                                icon: 'pi pi-fw pi-desktop',
                                items: [
                                    {
                                        label: 'Başvuru İşlemleri',
                                        icon: 'pi pi-fw pi-book',
                                        command: () => {
                                            this.router.navigate(['/main-map']).then(() => {
                                                setTimeout(() => this.menuService.openDialog('BasvuruIslemleri'), 200);
                                            });
                                        }
                                        // command: () => this.menuService.openDialog('BasvuruIslemleri')
                                    },
                                    {
                                        label: 'Fen Klasörü',
                                        icon: 'pi pi-fw pi-folder',
                                        command: () => this.menuService.openDialog('FenKlasor')
                                    },
                                    /*  {
                                          label: 'İş Yönetimi',
                                          icon: 'pi pi-fw pi-briefcase',
                                          routerLink: ['/operator/isYonetimi'],
                                      }*/
                                ],
                            },
                            {
                                label: 'Veri',
                                icon: 'pi pi-fw pi-cloud',
                                items: [
                                    {
                                        label: 'Veri Yükleme',
                                        icon: 'pi pi-fw pi-cloud-upload',
                                        routerLink: ['/operator/gml-factory/upload'],
                                    },/*
                                    {
                                        label: 'Veri İndirme',
                                        icon: 'pi pi-fw pi-cloud-download',
                                        routerLink: ['/operator/gml-factory/download'],
                                    }*/
                                ],
                            },
                            {
                                label: 'Değerlendirme',
                                icon: 'pi pi-chart-line',
                                routerLink: ['/operator/degerlendirme'],
                            },
                            /* {
                                 label: 'Arşiv',
                                 icon: 'pi pi-fw pi-folder',
                                 items: [
                                     {
                                         label: 'Pafta Kayıt Defteri',
                                         icon: 'fg fg-search-country',
                                         routerLink: ['/operator/paftaKayitDefteri'],
                                     }
                                 ],
                             },*/
                            {
                                label: 'İstatistik',
                                icon: 'pi pi-fw pi-chart-bar',
                                items: [
                                    {
                                        label: 'Veri İstatistikleri',
                                        icon: 'pi pi-fw pi-sliders-h',
                                        routerLink: ['/operator/veriIstatistikleri'],
                                    }
                                ],
                            },
                            /* {
                                 label: 'Yardım',
                                 icon: 'pi pi-fw pi-question',
                                 items: [
                                     {
                                         label: 'Duyurular',
                                         icon: 'pi pi-fw pi-info',
                                         routerLink: ['/operator/duyurular'],
                                     },
                                     {
                                         label: 'Dökümanlar',
                                         icon: 'pi pi-fw pi-file-o',
                                         routerLink: ['/operator/dökümanlar'],
                                     }
                                 ],
                             }*/

                        ],
                    }

                ],
            },/*,
            {
                items: [
                    {
                        label: 'Harita',
                        icon: 'fg-map-o',
                        items: [
                            {
                                label: 'Google Map',
                                icon: 'fg-globe-alt-o',
                                command: () => this.onMapTypeChange('googleMap')
                            },
                            {
                                label: 'Google Uydu',
                                icon: 'fg-globe-alt-o',
                                command: () => this.onMapTypeChange('googleSat')
                            },
                            {
                                label: 'OpenStreetMap',
                                icon: 'fg-globe-alt-o',
                                command: () => this.onMapTypeChange('openstreetmap')
                            },
                            {
                                label: 'HGM',
                                icon: 'fg-globe-alt-o',
                                command: () => this.onMapTypeChange('hgm')
                            },
                            {
                                label: 'Google Etiket',
                                icon: 'fg-tag',
                                command: () => {
                                    this.googleLabelsActive = !this.googleLabelsActive;
                                    this.onLabelChange('googleLabels', this.googleLabelsActive);
                                }
                            }
                        ]
                    }
                ]
            }*/
            {
                items: [
                    {
                        label: 'Yardım',
                        icon: 'pi pi-spin pi-cog',
                        items: [
                            {
                                label: 'Sıkça Sorulan Sorular',
                                icon: 'pi pi-question-circle',
                                routerLink: ['/info-pages/faq'],
                            },
                            {
                                label: 'Dokümanlar',
                                icon: 'fg-folder-maps',
                                items: [
                                    {
                                        label: 'Veri Yükleme İşlemleri',
                                        icon: 'pi pi-file-o',
                                        items: [
                                            {
                                                label: 'Yapı Yükleme',
                                                icon: 'pi pi-slack',
                                                command: () => {
                                                    window.open('assets/docs/Yapi_Alan.pdf', '_blank');
                                                }
                                            },
                                        ]
                                    },
                                ]
                            }
                        ],
                    }
                ],
            }
        ];
    }
    /*
    toggleMenu(menuKey: 'map' | 'layer') {
        this.openMenu = this.openMenu === menuKey ? null : menuKey;

        if (this.openMenu) {
            this.closeAllModelMenus();
        }
    }
    */
    //toggleHarita() {
    //    // this.openMenu = this.openMenu === 'map' ? null : 'map';
    //   /* this.isMapOpen = !this.isMapOpen;
    //    if (this.isMapOpen) {
    //        this.isLayerOpen = false;
    //        this.moduleExpanded = false; // modüller menüsünü kapat
    //    }*/
    //    this.isMapOpen = !this.isMapOpen;
    //    this.isLayerOpen = false;
    //    this.moduleExpanded = false; // Modül menüsünü kapat
    //}

    //toggleLayer() {
    //    // this.openMenu = this.openMenu === 'layer' ? null : 'layer';
    //    /*this.isLayerOpen = !this.isLayerOpen;
    //    if (this.isLayerOpen) {
    //        this.isMapOpen = false;
    //        this.moduleExpanded = false; // modüller menüsünü kapat
    //    }*/
    //    this.isLayerOpen = !this.isLayerOpen;
    //    this.isMapOpen = false;
    //    this.moduleExpanded = false; // Modül menüsünü kapat
    //}

    //closeModulesMenu() {
    //    if (!this.model) return;

    //    this.model.forEach(item => {
    //        if (item.items) {
    //            item.items.forEach(subItem => {
    //                if (subItem.items) {
    //                    subItem.items.forEach(moduleItem => {
    //                        if (moduleItem.label === 'Modüller') {
    //                            moduleItem.expanded = false;
    //                        }
    //                    });
    //                }
    //            });
    //        }
    //    });
    //}

    //toggleModule() {
    //toggleModule() {
    //  /*  this.moduleExpanded = !this.moduleExpanded;
    //    if (this.moduleExpanded) {
    //        this.isMapOpen = false;
    //        this.isLayerOpen = false;
    //    }*/
    //    this.moduleExpanded = !this.moduleExpanded;
    //    this.isMapOpen = false;
    //    this.isLayerOpen = false;
    //}

    //toggleModuleMenu(items: any[], label: string) {
    //    items.forEach(item => {
    //        if (item.items) {
    //            item.items.forEach(subItem => {
    //                if (subItem.label === label) {
    //                    subItem.expanded = !subItem.expanded;
    //                } else {
    //                    subItem.expanded = false; // diğer menüleri kapat
    //                }
    //            });
    //        }
    //    });
    //}

    //closeAllMenusExcept(menu: 'map' | 'layer' | 'module') {
    //    this.isMapOpen = menu === 'map' ? this.isMapOpen : false;
    //    this.isLayerOpen = menu === 'layer' ? this.isLayerOpen : false;
    //    this.moduleExpanded = menu === 'module' ? this.moduleExpanded : false;
    //}



    //closeAllModelMenus() {
    //    // model menüleri PrimeNG app-menuitem ile açılıyorsa
    //    if (!this.model) return;

    //    this.model.forEach(item => {
    //        if (item.items) {
    //            item.items.forEach(subItem => {
    //                if (subItem.expanded !== undefined) subItem.expanded = false;
    //                // Eğer derin alt menüler varsa recursive olarak kapat
    //                if (subItem.items) {
    //                    this.closeSubItems(subItem.items);
    //                }
    //            });
    //        }
    //    });
    //}

    //closeSubItems(items: any[]) {
    //    items.forEach(sub => {
    //        if (sub.expanded !== undefined) sub.expanded = false;
    //        if (sub.items) this.closeSubItems(sub.items);
    //    });
    //}
    /*
    isMenuOpen(menuKey: 'map' | 'layer') {
        return this.openMenu === menuKey;
    }*/

    //onMapTypeClick(value: string) {
    //    this.selectedMapType = value;
    //}

    //onLayerTypeClick(value: string) {
    //    this.toggleLayerSelection(value);
    //}

    //onMapTypeChange(type: string) {
    //    console.log('Seçilen Harita Tipi:', type);
    //    this.selectedMapType = type;
    //    this.mainMapService.changeBaseMap(type);
    //}

    //onLabelChange(type: string, event: any) {
    //    /*const checked = event.target.checked as boolean;
    //    this.googleLabelsActive = checked;
    //    this.mainMapService.toggleOverlayLayer(type, checked);*/
    //    const checked = event.target.checked as boolean;

    //    this.mainMapService.toggleOverlayLayer(type, checked);

    //    // opsiyonel: mapTypes içindeki ilgili objeyi güncelle
    //    const mapType = this.mapTypes.find(mt => mt.value === type);
    //    if (mapType) mapType.active = checked;
    //}

    //onLayerChange(event: Event, value: string) {
    //    const checked = (event.target as HTMLInputElement).checked;
    //    console.log('Katman:', value, 'Durum:', checked);

    //    if (checked) {
    //        if (!this.selectedLayerTypes.includes(value)) {
    //            this.selectedLayerTypes.push(value);
    //        }
    //    } else {
    //        this.selectedLayerTypes = this.selectedLayerTypes.filter(v => v !== value);
    //    }
    //}


    //toggleLayerSelection(value: string, checked?: boolean) {
    //    if (checked === undefined) {
    //        checked = !this.selectedLayerTypes.includes(value);
    //    }

    //    if (checked) {
    //        if (!this.selectedLayerTypes.includes(value)) {
    //            this.selectedLayerTypes.push(value);
    //        }
    //    } else {
    //        this.selectedLayerTypes = this.selectedLayerTypes.filter(v => v !== value);
    //    }
    //}

}
