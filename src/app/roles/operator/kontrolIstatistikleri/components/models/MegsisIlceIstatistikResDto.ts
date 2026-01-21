import { MegsisMahalleIstatistikResDto } from './MegsisMahalleIstatistikResDto';
export interface MegsisIlceIstatistikResDto {
    ilceId: number;
    ilceAd: string;
    yeniParselAdet: number;
    eskiParselAdet: number;
    userMahalleIstatistik: MegsisMahalleIstatistikResDto[];
}
