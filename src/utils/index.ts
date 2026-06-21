import dayjs from 'dayjs'
import type { RecordStatus } from '@/types/pouring'

export const generateId = (): string => {
  return `${Date.now()}${Math.random().toString(36).substr(2, 9)}`
}

export const generateTaskCode = (building: string): string => {
  const dateStr = dayjs().format('YYYYMMDD')
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  const buildingCode = building.replace(/[^\d]/g, '') || '0'
  return `PZ${dateStr}${buildingCode}${rand}`
}

export const formatDateTime = (date: Date | string): string => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

export const formatTime = (date: Date | string): string => {
  return dayjs(date).format('HH:mm')
}

export const formatDate = (date: Date | string): string => {
  return dayjs(date).format('YYYY-MM-DD')
}

export const getCurrentDateTime = (): string => {
  return dayjs().format('YYYY-MM-DD HH:mm:ss')
}

export const getCurrentTime = (): string => {
  return dayjs().format('HH:mm')
}

export const getStatusText = (status: RecordStatus): string => {
  const map: Record<RecordStatus, string> = {
    normal: '正常',
    warning: '异常',
    danger: '严重'
  }
  return map[status]
}

export const getRecordTypeText = (type: string): string => {
  const map: Record<string, string> = {
    truck: '罐车进场',
    slump: '坍落度检测',
    vibration: '振捣检查',
    custom: '其他记录'
  }
  return map[type] || '记录'
}

export const evaluateSlumpStatus = (
  value: number,
  standard: string = '160±20mm'
): RecordStatus => {
  const match = standard.match(/(\d+)±(\d+)mm/)
  if (!match) return 'normal'
  const target = parseInt(match[1])
  const tolerance = parseInt(match[2])
  const diff = Math.abs(value - target)
  if (diff <= tolerance) return 'normal'
  if (diff <= tolerance * 1.5) return 'warning'
  return 'danger'
}

export const getLocation = async (): Promise<string> => {
  return '施工现场 30.5728°N, 104.0668°E'
}
