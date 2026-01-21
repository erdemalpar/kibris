import { MegsisParselResDto } from './parsel/MegsisParselResDto';
import { MegsisYapiResDto } from './yapi/MegsisYapiResDto';
export interface MegsisMahalleIstatistikResDto {
    mahalleId: number;
    mahalleAd: string;
    yeniParselAdet?: number;
    eskiParselAdet?: number;
    yeniYapiTotalAdet?: number;
    eskiYapiTotalAdet?: number;
    yeniYapiTescilliAdet?: number;
    eskiYapiTescilliAdet?: number;
    yeniYapiTescilsizAdet?: number;
    eskiYapiTescilsizAdet?: number;
    parselDto?: MegsisParselResDto;
    yapiDto?: MegsisYapiResDto;
}
