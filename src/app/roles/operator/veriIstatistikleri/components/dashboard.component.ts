import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Subscription, debounceTime } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { AuthorizationService } from 'src/app/core/services/authorizationService.service';
import { StatsService } from '../services/stats.service';
import { UIChart } from 'primeng/chart';
import * as L from 'leaflet';
import { MegsisUserIstatistikResDto } from './models/MegsisUserIstatistikResDto';
import { AdministrativeQueryService } from '../../gml-factory/services/administrative-query.service';

// Helpers
import { DashboardDataHelper, DistrictStat, NeighborhoodStat, UserStat } from './helpers/dashboard-data.helper';
import { DistrictColors, DistrictHoverColors, getParcelChartOptions, getUserPerformanceChartOptions, PieBackgroundColors } from './helpers/dashboard-chart.config';

@Component({
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {

    districts: DistrictStat[] = [];
    userStats: UserStat[] = [];
    dateStr: string = '';

    // Harita Özellikleri
    private map!: L.Map;
    selectedMapDistrict: any = null;
    districtsLayer!: L.FeatureGroup;
    districtColors = DistrictColors;
    districtHoverColors = DistrictHoverColors;

    // Kullanıcı Bilgisi
    currentUserRole: string = '';
    currentUsername: string = '';

    // Özet Kart Verileri
    totalParcels: number = 0;
    totalDistricts: number = 0;
    totalNeighborhoods: number = 0;
    mostPopulatedDistrict: string = '-';
    mostPopulatedLabel: string = 'En Yoğun İlçe';

    // Grafikler
    parcelByDistrictChart: any;
    parcelByDistrictOptions: any;

    userPerformanceChart: any;
    userPerformanceOptions: any;

    // Detay Kırılım Durumu
    isDistrictView: boolean = true;
    selectedDistrictName: string | null = null;
    chartMinWidth: string = '100%';

    @ViewChild('parcelChart') parcelChart!: UIChart;

    detailedStats: any[] = [];
    adminUserStats: MegsisUserIstatistikResDto[] = []; // Ham veri önbelleği

    // Gerektiğinde geri yüklemek için global toplamları sakla
    globalTotalParcels: number = 0;
    globalTotalNeighborhoods: number = 0;
    globalTotalDistricts: number = 0;
    globalMostPopulatedDistrict: string = '-';

    // Yükleme Durumları
    loadingTotalDistricts: boolean = true;
    loadingTotalNeighborhoods: boolean = true;
    loadingTotalParcels: boolean = true;

    loadingMostPopulated: boolean = true;
    loadingMap: boolean = true;
    loadingMapDetails: boolean = true;
    loadingParcelChart: boolean = true;
    loadingUserChart: boolean = true;

    subscription: Subscription | undefined;

    constructor(
        private statsService: StatsService,
        private layoutService: LayoutService,
        private authService: AuthorizationService,
        private administrativeQueryService: AdministrativeQueryService,
        private cdr: ChangeDetectorRef
    ) {
        this.subscription = this.layoutService.configUpdate$
            .pipe(debounceTime(25))
            .subscribe((config) => {
                this.initCharts();
            });
    }

    ngOnInit() {
        this.authService.getCodes();
        this.currentUserRole = this.authService.role;
        this.currentUsername = this.authService.username;

        this.initdate();
        this.loadData();
    }

    ngAfterViewInit() {
        this.loadingMap = true;
        this.initMap();
    }

    initMap() {
        this.map = L.map('districtMap', {
            zoomControl: false,
            attributionControl: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            touchZoom: false,
            dragging: false
        }).setView([35.2, 33.4], 14.5);

        const mapContainer = this.map.getContainer();
        mapContainer.style.background = '#eef2ff';

        setTimeout(() => {
            this.map.invalidateSize();
            if (this.currentUserRole === 'Admin') {
                this.loadDistrictsLayer();
            } else {
                if (this.districts && this.districts.length > 0) {
                    this.loadDistrictsLayer();
                }
            }
        }, 500);
    }

    loadDistrictsLayer() {
        if (this.districtsLayer && this.map.hasLayer(this.districtsLayer)) return;

        this.districtsLayer = new L.FeatureGroup();

        this.administrativeQueryService.getIlceList().subscribe(res => {
            if (!res.data) return;

            const allowedDistrictNames = new Set<string>();
            if (this.currentUserRole !== 'Admin') {
                this.districts.forEach(d => allowedDistrictNames.add(d.name.toLocaleUpperCase('tr-TR')));
            }

            res.data.forEach((d, index) => {
                // Filter: If not Admin AND district not in allowed list, skip
                if (this.currentUserRole !== 'Admin') {
                    if (!allowedDistrictNames.has(d.name.toLocaleUpperCase('tr-TR'))) return;
                }

                if (d.geom) {
                    const geojson = JSON.parse(d.geom);
                    const color = this.districtColors[index % this.districtColors.length];
                    const hoverColor = this.districtHoverColors[index % this.districtHoverColors.length];

                    const layer = L.geoJSON(geojson, {
                        style: {
                            color: '#ffffff',
                            weight: 2,
                            opacity: 1,
                            fillColor: color,
                            fillOpacity: 1
                        }
                    });

                    if (layer.getLayers().length > 0) {
                        const center = layer.getBounds().getCenter();
                        L.marker(center, {
                            icon: L.divIcon({
                                className: 'district-label',
                                html: `<span style="font-weight:bold; color:#4b5563; font-size:14px; text-shadow: 1px 1px 2px white;">${d.name}</span>`,
                                iconSize: [100, 20],
                                iconAnchor: [50, 10]
                            })
                        }).addTo(this.districtsLayer);
                        this.districtsLayer.addLayer(layer);
                    }

                    layer.on('click', (e) => {
                        L.DomEvent.stopPropagation(e);
                        this.onDistrictClick(d, e.target);
                    });

                    layer.on('mouseover', (e) => {
                        const isSelected = this.selectedMapDistrict?.name === d.name;
                        if (!isSelected) {
                            e.target.setStyle({ weight: 3, color: '#9CA3AF', fillColor: hoverColor });
                        } else {
                            e.target.setStyle({ fillColor: hoverColor });
                        }
                    });

                    layer.on('mouseout', (e) => {
                        const isSelected = this.selectedMapDistrict?.name === d.name;
                        e.target.setStyle({ fillColor: color });
                        if (!isSelected) {
                            e.target.setStyle({ weight: 2, color: '#ffffff' });
                        }
                    });
                }
            });

            this.map.addLayer(this.districtsLayer);

            if (this.districtsLayer.getLayers().length > 0) {
                try {
                    const bounds = this.districtsLayer.getBounds();
                    if (bounds.isValid()) this.map.fitBounds(bounds);
                } catch (err) { }
            }

            this.loadingMap = false;
            this.cdr.detectChanges();
        }, err => {
            this.loadingMap = false;
            this.cdr.detectChanges();
        });
    }

    onDistrictClick(district: any, layer: any) {
        const stats = this.districts.find(d => d.name.toLocaleUpperCase('tr-TR') === district.name.toLocaleUpperCase('tr-TR'));

        this.selectedMapDistrict = {
            name: district.name,
            parcelCount: stats ? (stats.totalParcels || 0) : 0
        };

        if (stats) {
            this.totalDistricts = 1;
            this.totalNeighborhoods = stats.neighborhoods ? stats.neighborhoods.length : 0;
            this.totalParcels = stats.totalParcels || 0;

            if (stats.neighborhoods && stats.neighborhoods.length > 0) {
                const maxNeighborhood = stats.neighborhoods.reduce(
                    (prev: any, current: any) => (prev.parcelCount > current.parcelCount) ? prev : current
                );
                this.mostPopulatedDistrict = maxNeighborhood.name;
                this.mostPopulatedLabel = 'En Yoğun Mahalle';
            } else {
                this.mostPopulatedDistrict = '-';
                this.mostPopulatedLabel = 'En Yoğun Mahalle';
            }
        }

        if (this.currentUserRole === 'Admin') {
            this.updateUserChartForDistrict(district.name);
        }

        this.updateParcelChart(district.name);

        this.districtsLayer.eachLayer((l: any) => {
            if (l.setStyle) l.setStyle({ color: '#ffffff', weight: 2, fillOpacity: 1 });
        });

        if (layer && layer.setStyle) {
            layer.setStyle({ color: '#ef4444', weight: 4 });
            if (layer.getBounds) this.map.fitBounds(layer.getBounds());
        }

        this.cdr.detectChanges();
    }

    clearMapSelection() {
        this.selectedMapDistrict = null;

        // Globalleri Geri Yükle
        this.totalDistricts = this.globalTotalDistricts;
        this.totalNeighborhoods = this.globalTotalNeighborhoods;
        this.totalParcels = this.globalTotalParcels;
        this.mostPopulatedDistrict = this.globalMostPopulatedDistrict;
        this.mostPopulatedLabel = 'En Yoğun İlçe';

        if (this.districtsLayer) {
            this.districtsLayer.eachLayer((l: any) => {
                if (l.setStyle) l.setStyle({ color: '#ffffff', weight: 2, fillOpacity: 1 });
            });
            if (this.districtsLayer.getBounds().isValid()) {
                this.map.fitBounds(this.districtsLayer.getBounds());
            }
        }

        this.resetParcelChart();
        this.initUserPerformanceChart();
    }

    initdate() {
        const d = new Date();
        this.dateStr = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    loadData() {
        debugger;
        this.setAllLoaders(true);

        if (this.currentUserRole === 'Admin') {
            this.loadAdminStatistics();
        } else {
            this.loadUserStatistics();
        }
    }

    setAllLoaders(state: boolean) {
        this.loadingTotalDistricts = state;
        this.loadingTotalNeighborhoods = state;
        this.loadingTotalParcels = state;
        this.loadingMostPopulated = state;
        this.loadingParcelChart = state;
        this.loadingUserChart = state;
    }

    updateDashboardStats(stats: any) {
        this.districts = stats.districts;
        this.totalDistricts = stats.totalDistricts;
        this.totalNeighborhoods = stats.totalNeighborhoods;
        this.totalParcels = stats.totalParcels;
        this.mostPopulatedDistrict = stats.mostPopulatedDistrict;

        // Globalleri Sakla
        this.globalTotalDistricts = this.totalDistricts;
        this.globalTotalParcels = this.totalParcels;
        this.globalTotalNeighborhoods = this.totalNeighborhoods;
        this.globalMostPopulatedDistrict = this.mostPopulatedDistrict;
    }

    loadAdminStatistics() {
        this.statsService.getParcelStatisticsByAdmin()
            .subscribe(res => {
                if (!res.data || res.data.length === 0) {
                    this.setAllLoaders(false);
                    return;
                }

                // Use Helper
                const stats = DashboardDataHelper.processAdminStats(res.data);
                this.updateDashboardStats(stats);
                this.adminUserStats = res.data;

                this.calculateSummaries(); // Gerekirse belirli ayrıntıları düzleştir (geriye dönük uyumluluk için tutuldu)
                this.initCharts();

                this.setAllLoaders(false);
                this.loadingMapDetails = false;
                this.cdr.detectChanges();

                if (this.map) this.loadDistrictsLayer();
            }, err => {
                console.error(err);
                this.setAllLoaders(false);
                this.loadingMapDetails = false;
                this.cdr.detectChanges();
            });
    }

    loadUserStatistics() {
        this.statsService.getParcelStatisticsByUser()
            .subscribe(res => {
                const user = res.data?.[0];
                if (!user) return;

                // Use Helper
                const stats = DashboardDataHelper.processUserStats(user);
                this.updateDashboardStats(stats);

                this.processParcelStatsFromUser();

                if (this.map) this.loadDistrictsLayer();

                this.setAllLoaders(false);
                this.loadingMapDetails = false;
                this.cdr.detectChanges();
            }, err => {
                this.setAllLoaders(false);
                this.loadingMapDetails = false;
                this.cdr.detectChanges();
            });
    }

    processParcelStatsFromAdmin() {
        this.calculateSummaries();
        this.initCharts();
    }

    processParcelStatsFromUser() {
        this.calculateSummaries();
        this.initCharts();
    }

    // detailedStats (Tablo) içinde kullanılan basit düzleştirme mantığı için tutuldu
    calculateSummaries() {
        this.detailedStats = [];
        this.districts.forEach(d => {
            d.neighborhoods.forEach(n => {
                this.detailedStats.push({
                    district: d.name,
                    neighborhood: n.name,
                    parcelCount: n.parcelCount
                });
            });
        });
    }

    initCharts() {
        this.initParcelByDistrictChart();
        this.initUserPerformanceChart();
    }

    initParcelByDistrictChart() {
        this.isDistrictView = true;
        this.selectedDistrictName = null;
        this.chartMinWidth = '100%';

        const labels = this.districts.map(d => d.name);
        const currentData = this.districts.map(d => d.totalParcels);
        const previousData = this.districts.map(d => d.totalPreviousParcels);

        this.setParcelChartData(labels, currentData, previousData);
    }

    updateParcelChart(districtName: string) {
        const district = this.districts.find(d => d.name === districtName);
        if (!district) return;

        this.isDistrictView = false;
        this.selectedDistrictName = districtName;

        const labels = district.neighborhoods.map(n => n.name);
        const currentData = district.neighborhoods.map(n => n.parcelCount);
        const previousData = district.neighborhoods.map(n => n.previousParcelCount);

        if (labels.length > 10) {
            this.chartMinWidth = (labels.length * 60) + 'px';
        } else {
            this.chartMinWidth = '100%';
        }

        this.setParcelChartData(labels, currentData, previousData);
    }

    setParcelChartData(labels: string[], currentData: number[], previousData: number[]) {
        this.parcelByDistrictOptions = getParcelChartOptions(
            (event, elements) => this.onChartClick(event, elements)
        );

        this.parcelByDistrictChart = {
            labels: labels,
            datasets: [
                {
                    label: 'Eski',
                    backgroundColor: '#FFC55C',
                    data: previousData,
                    barThickness: 15,
                    borderRadius: 4
                },
                {
                    label: 'Güncel',
                    backgroundColor: '#FF8E72',
                    data: currentData,
                    barThickness: 15,
                    borderRadius: 4
                }
            ]
        };
    }

    onChartClick(event: any, elements: any[]) {
        if (!elements || elements.length === 0) return;
        if (!this.isDistrictView) return;

        const index = elements[0].index;
        const districtName = this.parcelByDistrictChart.labels[index];

        this.updateParcelChart(districtName);
    }

    resetParcelChart() {
        this.initParcelByDistrictChart();
    }

    initUserPerformanceChart() {
        this.loadingUserChart = true;
        if (this.currentUserRole === 'Admin') {
            this.processUserChartData(this.adminUserStats);
            this.loadingUserChart = false;
        } else {
            this.statsService.getParcelStatisticsByUser()
                .subscribe(response => {
                    let data: MegsisUserIstatistikResDto[] = [];
                    if (Array.isArray(response)) {
                        data = response;
                    } else if (response && Array.isArray(response.data)) {
                        data = response.data;
                    }
                    this.processUserChartData(data);
                    this.loadingUserChart = false;
                }, err => {
                    this.loadingUserChart = false;
                });
        }
    }

    processUserChartData(data: MegsisUserIstatistikResDto[]) {
        // Use Helper
        this.userStats = DashboardDataHelper.groupUserPerformanceData(data);

        this.userPerformanceOptions = getUserPerformanceChartOptions((e, els) => { });

        this.userPerformanceChart = {
            labels: this.userStats.map(u => u.userName),
            datasets: [
                {
                    data: this.userStats.map(u => u.totalParselAdet),
                    backgroundColor: PieBackgroundColors,
                    hoverBackgroundColor: PieBackgroundColors
                }
            ]
        };
    }

    updateUserChartForDistrict(districtName: string) {
        let districtData = this.adminUserStats.map(user => {
            const filteredIlceList = user.userIlceIstatistik.filter(i => i.ilceAd === districtName);
            return {
                ...user,
                userIlceIstatistik: filteredIlceList
            };
        });

        // Use Helper
        const stats = DashboardDataHelper.groupUserPerformanceData(districtData);

        // Filter out users with 0 parcels in this district
        const activeUsers = stats.filter(u => u.totalParselAdet > 0);

        this.userPerformanceChart = {
            labels: activeUsers.map(u => u.userName),
            datasets: [
                {
                    data: activeUsers.map(u => u.totalParselAdet),
                    backgroundColor: PieBackgroundColors,
                    hoverBackgroundColor: PieBackgroundColors
                }
            ]
        };
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
