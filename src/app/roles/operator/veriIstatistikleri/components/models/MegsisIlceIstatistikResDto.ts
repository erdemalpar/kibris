import { MegsisMahalleIstatistikResDto } from './MegsisMahalleIstatistikResDto';
import { MegsisParselResDto } from './parsel/MegsisParselResDto';
import { MegsisYapiResDto } from './yapi/MegsisYapiResDto';
export interface MegsisIlceIstatistikResDto {
    ilceId: number;
    ilceAd: string;
    yeniParselAdet?: number;
    eskiParselAdet?: number;
    yeniYapiTotalAdet?: number;
    eskiYapiTotalAdet?: number;
    yeniYapiTescilliAdet?: number;
    eskiYapiTescilliAdet?: number;
    yeniYapiTescilsizAdet?: number;
    eskiYapiTescilsizAdet?: number;
    userMahalleIstatistik: MegsisMahalleIstatistikResDto[];
    parselDto?: MegsisParselResDto;
    yapiDto?: MegsisYapiResDto;
}
