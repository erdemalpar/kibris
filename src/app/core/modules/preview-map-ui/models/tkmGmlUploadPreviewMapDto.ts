export interface TkmGmlUploadPreviewMapDto {
    mahalleId: number;
    mahalleName: string;
    ilceId: number;
    ilceName: string;
    geoJsonData: string;
    dom: number;
    allValid?: boolean;
    validationResults?: ValidationResultsDto[];
    featureCount?: number;
}


export interface ValidationResultsDto {
    isValid: boolean;
    message: string;
    exceptionStatus: number; // 0: Ok, 1: Warning, 2: Error
}
