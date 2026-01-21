import { BaseEntityOnlyIdDto } from "./baseEntityOnlyIdDto";

export interface BaseEntityWithoutUpdateDto extends BaseEntityOnlyIdDto {
    creatorId?: number;
    isActive?: boolean;
    createTime?: string;
}

