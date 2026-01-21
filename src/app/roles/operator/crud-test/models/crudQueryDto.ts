import { QueryDto } from "src/app/core/models/queryDto";

export interface CrudQueryDto extends QueryDto {
    description?: string;
    crudType?:string;
}
