export interface PouringInfo {
  id: string
  building: string
  axis: string
  component: string
  strengthGrade: string
  plannedVolume: number
  startTime: string
  taskCode: string
  createTime: string
}

export interface KeyCheckItem {
  id: string
  name: string
  description: string
  checked: boolean
  required: boolean
}

export type RecordStatus = 'normal' | 'warning' | 'danger'

export interface ProcessRecord {
  id: string
  timestamp: string
  type: 'truck' | 'slump' | 'vibration' | 'custom'
  truckBatch?: number
  truckNumber?: string
  arrivalTime?: string
  photoUrl?: string
  slumpValue?: number
  slumpStandard?: string
  isSegregation?: boolean
  vibratorOnSite?: boolean
  vibratorCount?: number
  status: RecordStatus
  remark?: string
  location?: string
}

export interface Signature {
  supervisor: string
  supervisorAt: string
  worker: string
  workerAt: string
  workerSignatureUrl?: string
  supervisorSignatureUrl?: string
}

export interface ArchiveInfo {
  id: string
  pouringInfoId: string
  completedVolume: number
  stopReason: string
  problemHandling: string
  weather: string
  temperature: string
  signature: Signature
  archiveTime: string
  reportUrl?: string
}

export const BUILDING_OPTIONS = [
  '1#楼', '2#楼', '3#楼', '4#楼', '5#楼', '6#楼', '7#楼', '8#楼'
]

export const AXIS_OPTIONS = [
  'A轴', 'B轴', 'C轴', 'D轴', 'E轴', 'F轴', '1轴', '2轴', '3轴', '4轴', '5轴', '6轴'
]

export const COMPONENT_OPTIONS = [
  '基础承台', '地下室底板', '地下室剪力墙', '一层柱', '一层梁板',
  '二层柱', '二层梁板', '三层柱', '三层梁板', '屋面层',
  '楼梯', '电梯井', '集水坑', '后浇带'
]

export const STRENGTH_GRADE_OPTIONS = [
  'C15', 'C20', 'C25', 'C30', 'C35', 'C40', 'C45', 'C50', 'C55', 'C60'
]

export const WEATHER_OPTIONS = ['晴', '多云', '阴', '小雨', '中雨', '大雨', '雪']
