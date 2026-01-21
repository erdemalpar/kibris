export interface TkmDegerlendirmeGmlApprovedResDto {
    geoJsonData: string;
    name: string;
    dom: number;
    mahalleId: number;
    featureId?: number;
    featureName?: string;
    deger?: number;
    paraBirimi?: string;
    aciklama?: string;
    valuationType?: string;
    valuationId?: number;
    crudType: number;
    valuationStartDate?: Date;
    valuationEndDate?: Date;
    updateDescription?: string;
}
