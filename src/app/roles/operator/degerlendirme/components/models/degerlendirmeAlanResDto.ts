export interface DegerlendirmeAlanResDto {
    id: number;
    ad?: string;
    deger: number;
    paraBirimi: string;
    geom?: string;
    orijinalGeomWkt?: string;
    dom?: number;
    durum?: number;
    turId?: number;
    mahalleRef: number;
    aciklama?: string;
    guncellemeAciklama?: string;
    degerBaslangicTarihi: Date;
    degerBitisTarihi: Date;
    totalCount: number;
    featureType: string;
}
