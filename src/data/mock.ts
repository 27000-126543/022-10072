import type { ProcessRecord } from '@/types/pouring'

export const MOCK_PROCESS_RECORDS: ProcessRecord[] = [
  {
    id: 'mock1',
    timestamp: '2026-06-22 09:15:30',
    type: 'truck',
    truckNumber: '川A·D8521',
    arrivalTime: '09:15',
    photoUrl: 'https://picsum.photos/id/1080/750/500',
    status: 'normal',
    remark: '第1车，配合比单齐全',
    location: '施工现场 30.5728°N, 104.0668°E'
  },
  {
    id: 'mock2',
    timestamp: '2026-06-22 09:25:10',
    type: 'slump',
    slumpValue: 165,
    slumpStandard: '160±20mm',
    isSegregation: false,
    status: 'normal',
    remark: '坍落度实测165mm，符合要求',
    location: '施工现场 30.5728°N, 104.0668°E'
  },
  {
    id: 'mock3',
    timestamp: '2026-06-22 09:45:00',
    type: 'vibration',
    vibratorOnSite: true,
    vibratorCount: 3,
    status: 'normal',
    remark: '振捣人员3名，均到位，振捣规范',
    location: '施工现场 30.5728°N, 104.0668°E'
  },
  {
    id: 'mock4',
    timestamp: '2026-06-22 10:30:20',
    type: 'truck',
    truckNumber: '川A·F3367',
    arrivalTime: '10:30',
    photoUrl: 'https://picsum.photos/id/1036/750/500',
    status: 'normal',
    remark: '第2车',
    location: '施工现场 30.5728°N, 104.0668°E'
  },
  {
    id: 'mock5',
    timestamp: '2026-06-22 11:05:45',
    type: 'slump',
    slumpValue: 195,
    slumpStandard: '160±20mm',
    isSegregation: true,
    status: 'warning',
    remark: '坍落度偏大，已通知搅拌站调整，现场加强观察',
    location: '施工现场 30.5728°N, 104.0668°E'
  },
  {
    id: 'mock6',
    timestamp: '2026-06-22 13:20:00',
    type: 'truck',
    truckNumber: '川A·G2289',
    arrivalTime: '13:20',
    photoUrl: 'https://picsum.photos/id/1067/750/500',
    status: 'normal',
    remark: '第5车，开盘鉴定合格',
    location: '施工现场 30.5728°N, 104.0668°E'
  }
]
