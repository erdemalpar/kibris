
export interface QueryDto {
    is_active?:boolean;
    limit?: number ;
    offset?: number ;
    sortFilter?: string;
    sortOrderFilter?: number;
    firstDate?:number;
    lastDate?:number;
}
