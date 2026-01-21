export const DistrictColors = ['#BBDEFB', '#C8E6C9', '#FFCDD2', '#E1BEE7', '#FFE0B2', '#B2DFDB', '#F8BBD0'];
export const DistrictHoverColors = ['#90CAF9', '#A5D6A7', '#EF9A9A', '#CE93D8', '#FFCC80', '#80CBC4', '#F48FB1'];

export const PieBackgroundColors = [
    '#ec4899', '#f59e0b', '#6366f1', '#10b981', '#d946ef', '#0ea5e9',
    '#8b5cf6', '#ef4444', '#14b8a6', '#f97316', '#84cc16', '#06b6d4',
    '#a855f7', '#3b82f6', '#f43f5e', '#64748b', '#78716c', '#2dd4bf', '#fb923c'
];

export function getParcelChartOptions(onChartClick: (event: any, elements: any[]) => void): any {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    return {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
            legend: {
                display: true,
                labels: {
                    color: textColor
                },
                onClick: (e: any, legendItem: any, legend: any) => {
                    // Gizleme/gösterme mantığını engelle
                    e.stopPropagation();
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary,
                    font: { weight: 500 },
                    autoSkip: false
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            },
            y: {
                ticks: { color: textColorSecondary },
                grid: { color: surfaceBorder, drawBorder: false }
            }
        },
        onClick: (event: any, elements: any[]) => {
            onChartClick(event, elements);
        }
    };
}

export function getUserPerformanceChartOptions(onChartClick: (event: any, elements: any[]) => void): any {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');

    return {
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true,
                    color: textColor
                },
                onClick: (e: any, legendItem: any, legend: any) => {
                    // Gizleme/gösterme mantığını engelle (Kullanıcı isteği: Grafik dilimlerini gizleme)
                    e.stopPropagation();
                }
            }
        },
        onClick: (event: any, elements: any[]) => {
            onChartClick(event, elements);
        }
    };
}
