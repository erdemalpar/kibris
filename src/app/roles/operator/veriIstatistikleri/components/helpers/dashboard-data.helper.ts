import { ParcelStatisticByIlceDto } from '../models/parsel/parcelStatisticByIlceDto';
import { MegsisUserIstatistikResDto } from '../models/MegsisUserIstatistikResDto';
import { MegsisIlceIstatistikResDto } from '../models/MegsisIlceIstatistikResDto';
import { MegsisMahalleIstatistikResDto } from '../models/MegsisMahalleIstatistikResDto';

export interface DistrictStat {
    name: string;
    totalParcels: number;
    totalPreviousParcels: number;
    neighborhoods: NeighborhoodStat[]; // Mahalle İstatistikleri
}

export interface NeighborhoodStat {
    name: string;
    parcelCount: number;
    previousParcelCount: number;
}

export interface UserStat {
    userName: string;
    totalParselAdet: number;
}

export interface DashboardUsageStats {
    districts: DistrictStat[];
    totalDistricts: number;
    totalNeighborhoods: number;
    totalParcels: number;
    mostPopulatedDistrict: string;
}

export class DashboardDataHelper {

    static processAdminStats(data: MegsisUserIstatistikResDto[]): DashboardUsageStats {
        const districtMap = new Map<string, {
            ilceAd: string;
            yeniParselAdet: number;
            eskiParselAdet: number;
            mahalleMap: Map<string, { mahalleAd: string; yeniParselAdet: number; eskiParselAdet: number }>
        }>();

        if (!data) data = [];

        data.forEach(userStat => {
            userStat.userIlceIstatistik.forEach((ilce: MegsisIlceIstatistikResDto) => {
                const key = ilce.ilceAd.toLocaleUpperCase('tr-TR');

                if (!districtMap.has(key)) {
                    districtMap.set(key, {
                        ilceAd: ilce.ilceAd,
                        yeniParselAdet: 0,
                        eskiParselAdet: 0,
                        mahalleMap: new Map()
                    });
                }

                const currentIlce = districtMap.get(key)!;
                // Yeni Parsel: SUM (Toplama) - Kullanıcıların yaptığı işler farklıdır, toplanmalı
                currentIlce.yeniParselAdet += ilce.yeniParselAdet || 0;

                // Eski Parsel: MAX (Maksimum) - Statik veridir, mükerrerliği önlemek için max alınır
                currentIlce.eskiParselAdet = Math.max(currentIlce.eskiParselAdet, ilce.eskiParselAdet || 0);

                ilce.userMahalleIstatistik.forEach((mahalle: MegsisMahalleIstatistikResDto) => {
                    const mahalleKey = mahalle.mahalleAd.toLocaleUpperCase('tr-TR');

                    if (!currentIlce.mahalleMap.has(mahalleKey)) {
                        currentIlce.mahalleMap.set(mahalleKey, {
                            mahalleAd: mahalle.mahalleAd,
                            yeniParselAdet: 0,
                            eskiParselAdet: 0
                        });
                    }

                    const currentMahalle = currentIlce.mahalleMap.get(mahalleKey)!;
                    // Yeni Parsel: SUM
                    currentMahalle.yeniParselAdet += mahalle.yeniParselAdet || 0;
                    // Eski Parsel: MAX
                    currentMahalle.eskiParselAdet = Math.max(currentMahalle.eskiParselAdet, mahalle.eskiParselAdet || 0);
                });
            });
        });

        const districts: DistrictStat[] = [];
        districtMap.forEach(d => districts.push({
            name: d.ilceAd,
            totalParcels: d.yeniParselAdet,
            totalPreviousParcels: d.eskiParselAdet,
            neighborhoods: Array.from(d.mahalleMap.values()).map(m => ({
                name: m.mahalleAd,
                parcelCount: m.yeniParselAdet,
                previousParcelCount: m.eskiParselAdet
            }))
        }));

        return this.calculateGlobals(districts);
    }

    static processUserStats(user: MegsisUserIstatistikResDto): DashboardUsageStats {
        if (!user) return this.calculateGlobals([]);

        const districts: DistrictStat[] = user.userIlceIstatistik.map((ilce: MegsisIlceIstatistikResDto) => ({
            name: ilce.ilceAd,
            totalParcels: ilce.yeniParselAdet,
            totalPreviousParcels: ilce.eskiParselAdet,
            neighborhoods: ilce.userMahalleIstatistik.map((m: MegsisMahalleIstatistikResDto) => ({
                name: m.mahalleAd,
                parcelCount: m.yeniParselAdet,
                previousParcelCount: m.eskiParselAdet
            }))
        }));

        return this.calculateGlobals(districts);
    }

    static processBackendDto(backendData: ParcelStatisticByIlceDto[]): DashboardUsageStats {
        let districts: DistrictStat[] = [];
        if (backendData) {
            districts = backendData.map((d: ParcelStatisticByIlceDto) => ({
                name: d.ilceAd,
                totalParcels: d.yeniParselAdet,
                totalPreviousParcels: d.eskiParselAdet,
                neighborhoods: [] // DTO detay kırılımı yoksa boş
            }));
        }
        return this.calculateGlobals(districts);
    }

    private static calculateGlobals(districts: DistrictStat[]): DashboardUsageStats {
        const totalDistricts = districts.filter(d => d.totalParcels > 0).length;
        const totalNeighborhoods = districts.reduce((sum, d) => sum + (d.neighborhoods?.length || 0), 0);

        // Toplam Parsel = Sadece Yeni Parseller
        const totalParcels = districts.reduce((sum, d) => sum + (d.totalParcels || 0), 0);

        let mostPopulatedDistrict = '-';
        if (districts.length > 0) {
            // En Yoğun İlçe (Sadece Yeni Parsellere Göre)
            const max = districts.reduce((prev, current) =>
                (prev.totalParcels > current.totalParcels) ? prev : current
            );
            mostPopulatedDistrict = max.name;
        }

        return {
            districts,
            totalDistricts,
            totalNeighborhoods,
            totalParcels,
            mostPopulatedDistrict
        };
    }

    static groupUserPerformanceData(data: MegsisUserIstatistikResDto[]): UserStat[] {
        const userMap = new Map<string, number>();

        data.forEach(u => {
            if (u.userName && u.userName.trim() !== '') {
                // Tutarlılık için alt öğelerden toplamı hesapla
                let calculatedTotal = 0;
                if (u.userIlceIstatistik && Array.isArray(u.userIlceIstatistik)) {
                    calculatedTotal = u.userIlceIstatistik.reduce((sum: number, ilce: MegsisIlceIstatistikResDto) => {
                        return sum + (ilce.yeniParselAdet || 0);
                    }, 0);
                } else {
                    calculatedTotal = u.totalParselAdet || 0;
                }

                const current = userMap.get(u.userName) || 0;
                userMap.set(u.userName, current + calculatedTotal);
            }
        });

        const userStats = Array.from(userMap.entries()).map(([name, count]) => ({
            userName: name,
            totalParselAdet: count
        }));

        // Sort by count descending
        userStats.sort((a, b) => b.totalParselAdet - a.totalParselAdet);

        return userStats;
    }
}
