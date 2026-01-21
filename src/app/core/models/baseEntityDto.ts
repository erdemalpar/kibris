import { BaseEntityWithoutUpdateDto } from "./baseEntityWithoutUpdateDto";

export interface BaseEntity extends BaseEntityWithoutUpdateDto {
    updatorId?: number | null;
    lastUpdateTime?: string | null;
}

