export interface ValidationResultsDto {
    isValid: boolean;
    message: string;
    exceptionStatus: number; // 0: Ok, 1: Warning, 2: Error
}
