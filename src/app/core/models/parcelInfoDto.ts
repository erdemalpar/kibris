export interface ParcelInfoDto {
    ilceAdi?: string;
    mahalleAdi?: string;
    mahalleNo?: number;
    adaNo?: string;
    parselNo?: string;
    tapuAlani?: string | null;
    nitelik?: string | null;
    mevkii?: string | null;
    zeminTip?: string | null;
    pafta?: string | null;
    cepheUzunluklari?: number[];
    geomGeoJson?: string;
    placeholder?: boolean;
}
