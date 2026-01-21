import { MegsisIlceIstatistikResDto } from './MegsisIlceIstatistikResDto';

export interface MegsisUserIstatistikResDto {
    userName: string;
    totalParselAdet?: number;
    totalYapiAdet?: number;
    userIlceIstatistik: MegsisIlceIstatistikResDto[];
}
