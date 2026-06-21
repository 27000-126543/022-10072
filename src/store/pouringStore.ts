import { create } from 'zustand'
import type {
  PouringInfo,
  KeyCheckItem,
  ProcessRecord,
  ArchiveInfo
} from '@/types/pouring'
import { generateId, generateTaskCode, getCurrentDateTime, getLocation } from '@/utils'

interface PouringState {
  pouringInfo: PouringInfo | null
  keyCheckItems: KeyCheckItem[]
  processRecords: ProcessRecord[]
  archiveInfo: ArchiveInfo | null
  isTaskCreated: boolean

  setPouringInfo: (info: Partial<PouringInfo>) => void
  createTask: () => Promise<void>
  toggleKeyCheck: (id: string) => void
  addProcessRecord: (record: Omit<ProcessRecord, 'id' | 'timestamp'>) => Promise<void>
  removeProcessRecord: (id: string) => void
  setArchiveInfo: (info: Partial<ArchiveInfo>) => void
  submitArchive: (signature: { worker: string; workerSignatureUrl: string }) => Promise<void>
  resetAll: () => void
}

const DEFAULT_KEY_CHECK_ITEMS: KeyCheckItem[] = [
  { id: '1', name: '坍落度核对', description: '现场实测坍落度值，核对是否符合配合比要求', checked: false, required: true },
  { id: '2', name: '试块留置', description: '按规范要求留置标养、同条件养护试块', checked: false, required: true },
  { id: '3', name: '振捣工艺', description: '振捣棒插入间距、深度、振捣时间符合要求', checked: false, required: true },
  { id: '4', name: '模板支撑', description: '模板体系稳固，支撑间距、扫地杆符合方案', checked: false, required: true },
  { id: '5', name: '钢筋保护层', description: '保护层垫块到位，钢筋无位移变形', checked: false, required: false },
  { id: '6', name: '浇筑顺序', description: '按方案确定的浇筑方向和顺序进行', checked: false, required: false },
  { id: '7', name: '施工缝处理', description: '施工缝按要求凿毛、清理、接浆处理', checked: false, required: false }
]

export const usePouringStore = create<PouringState>((set, get) => ({
  pouringInfo: null,
  keyCheckItems: DEFAULT_KEY_CHECK_ITEMS,
  processRecords: [],
  archiveInfo: null,
  isTaskCreated: false,

  setPouringInfo: (info) => set((state) => ({
    pouringInfo: state.pouringInfo
      ? { ...state.pouringInfo, ...info } as PouringInfo
      : { ...info } as PouringInfo
  })),

  createTask: async () => {
    const { pouringInfo } = get()
    if (!pouringInfo) return
    const taskCode = generateTaskCode(pouringInfo.building || '1')
    const location = await getLocation()
    set({
      pouringInfo: {
        ...pouringInfo,
        id: generateId(),
        taskCode,
        createTime: getCurrentDateTime(),
      } as PouringInfo,
      keyCheckItems: DEFAULT_KEY_CHECK_ITEMS.map(item => ({ ...item })),
      processRecords: [],
      isTaskCreated: true,
    })
    console.log('[PouringStore] Task created:', taskCode, 'Location:', location)
  },

  toggleKeyCheck: (id) => set((state) => ({
    keyCheckItems: state.keyCheckItems.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    )
  })),

  addProcessRecord: async (record) => {
    const location = await getLocation()
    const newRecord: ProcessRecord = {
      ...record,
      id: generateId(),
      timestamp: getCurrentDateTime(),
      location,
    }
    set((state) => ({
      processRecords: [newRecord, ...state.processRecords],
    }))
    console.log('[PouringStore] Record added:', newRecord.type, newRecord.status)
  },

  removeProcessRecord: (id) => set((state) => ({
    processRecords: state.processRecords.filter((r) => r.id !== id)
  })),

  setArchiveInfo: (info) => set((state) => ({
    archiveInfo: state.archiveInfo
      ? { ...state.archiveInfo, ...info } as ArchiveInfo
      : { ...info } as ArchiveInfo
  })),

  submitArchive: async (signature) => {
    const { pouringInfo, processRecords } = get()
    if (!pouringInfo) return
    const location = await getLocation()
    const archiveTime = getCurrentDateTime()
    set({
      archiveInfo: {
        id: generateId(),
        pouringInfoId: pouringInfo.id,
        completedVolume: 0,
        stopReason: '',
        problemHandling: '',
        weather: '晴',
        temperature: '25℃',
        signature: {
          supervisor: '张监理',
          supervisorAt: archiveTime,
          worker: signature.worker,
          workerAt: archiveTime,
          workerSignatureUrl: signature.workerSignatureUrl,
        },
        archiveTime,
      } as ArchiveInfo,
    })
    console.log('[PouringStore] Archive submitted:', archiveTime, 'Location:', location, 'Records count:', processRecords.length)
  },

  resetAll: () => set({
    pouringInfo: null,
    keyCheckItems: DEFAULT_KEY_CHECK_ITEMS.map(item => ({ ...item })),
    processRecords: [],
    archiveInfo: null,
    isTaskCreated: false,
  }),
}))
