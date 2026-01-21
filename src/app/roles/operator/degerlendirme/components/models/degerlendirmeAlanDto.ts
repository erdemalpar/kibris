export interface DegerlendirmeAlanDto {
    mahalleId: number;
    pageNumber: number;
    pageSize: number;
    description?: string;
    beginDate?: Date;
    endDate?: Date;
    referenceNumber?: string;
}
