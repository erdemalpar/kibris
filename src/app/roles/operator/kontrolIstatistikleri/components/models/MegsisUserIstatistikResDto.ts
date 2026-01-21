import { MegsisIlceIstatistikResDto } from './MegsisIlceIstatistikResDto';

export interface MegsisUserIstatistikResDto {
    userName: string;
    totalParselAdet: number;
    userIlceIstatistik: MegsisIlceIstatistikResDto[];
}
