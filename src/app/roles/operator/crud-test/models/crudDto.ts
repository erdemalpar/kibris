import { BaseEntity } from "src/app/core/models/baseEntityDto";

export interface CrudDto extends BaseEntity {
    description: string;
    crudType:string
}
