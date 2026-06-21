import React, { useState } from 'react'
import { View, Text, Input, Textarea, Image, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import type { ProcessRecord, RecordStatus } from '@/types/pouring'
import { evaluateSlumpStatus, getCurrentTime } from '@/utils'

type RecordType = ProcessRecord['type']

interface RecordFormProps {
  visible: boolean
  onClose: () => void
  onSubmit: (record: Omit<ProcessRecord, 'id' | 'timestamp'>) => void
}

const RECORD_TYPES: { key: RecordType; label: string }[] = [
  { key: 'truck', label: '罐车进场' },
  { key: 'slump', label: '坍落度检测' },
  { key: 'vibration', label: '振捣检查' },
  { key: 'custom', label: '其他记录' },
]

const STATUS_OPTIONS: { key: RecordStatus; label: string }[] = [
  { key: 'normal', label: '正常' },
  { key: 'warning', label: '异常' },
  { key: 'danger', label: '严重' },
]

const RecordForm: React.FC<RecordFormProps> = ({ visible, onClose, onSubmit }) => {
  const [type, setType] = useState<RecordType>('truck')
  const [truckBatch, setTruckBatch] = useState('')
  const [truckNumber, setTruckNumber] = useState('')
  const [arrivalTime, setArrivalTime] = useState(getCurrentTime())
  const [photoUrl, setPhotoUrl] = useState('')
  const [slumpValue, setSlumpValue] = useState('')
  const [slumpStandard, setSlumpStandard] = useState('160±20mm')
  const [isSegregation, setIsSegregation] = useState<boolean | null>(null)
  const [vibratorOnSite, setVibratorOnSite] = useState<boolean | null>(null)
  const [vibratorCount, setVibratorCount] = useState('')
  const [status, setStatus] = useState<RecordStatus>('normal')
  const [remark, setRemark] = useState('')

  const resetForm = () => {
    setType('truck')
    setTruckBatch('')
    setTruckNumber('')
    setArrivalTime(getCurrentTime())
    setPhotoUrl('')
    setSlumpValue('')
    setSlumpStandard('160±20mm')
    setIsSegregation(null)
    setVibratorOnSite(null)
    setVibratorCount('')
    setStatus('normal')
    setRemark('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleChooseImage = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['camera', 'album'],
      })
      setPhotoUrl(res.tempFilePaths[0])
    } catch (e) {
      console.error('[RecordForm] Choose image failed:', e)
    }
  }

  const canSubmit = () => {
    if (type === 'truck') return truckBatch.trim().length > 0 && truckNumber.trim().length > 0
    if (type === 'slump') return slumpValue.trim().length > 0 && isSegregation !== null
    if (type === 'vibration') return vibratorOnSite !== null
    return remark.trim().length > 0
  }

  const handleSubmit = () => {
    if (!canSubmit()) {
      Taro.showToast({ title: '请完善必填项', icon: 'none' })
      return
    }

    let finalStatus: RecordStatus = status
    if (type === 'slump' && slumpValue) {
      finalStatus = evaluateSlumpStatus(parseInt(slumpValue), slumpStandard, !!isSegregation)
    }

    const baseRecord: Omit<ProcessRecord, 'id' | 'timestamp'> = {
      type,
      status: finalStatus,
      remark,
    }

    if (type === 'truck') {
      Object.assign(baseRecord, {
        truckBatch: parseInt(truckBatch) || 0,
        truckNumber,
        arrivalTime,
        photoUrl,
      })
    } else if (type === 'slump') {
      Object.assign(baseRecord, {
        slumpValue: parseInt(slumpValue),
        slumpStandard,
        isSegregation: !!isSegregation,
      })
    } else if (type === 'vibration') {
      Object.assign(baseRecord, {
        vibratorOnSite: !!vibratorOnSite,
        vibratorCount: parseInt(vibratorCount) || 0,
      })
    }

    onSubmit(baseRecord)
    handleClose()
    Taro.showToast({ title: '记录已添加', icon: 'success' })
  }

  if (!visible) return null

  return (
    <View className={styles.modalMask} onClick={handleClose}>
      <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <View className={styles.modalHeader}>
          <Text className={styles.title}>添加过程记录</Text>
          <View className={styles.closeBtn} onClick={handleClose}>×</View>
        </View>

        <ScrollView scrollX className={styles.typeTabs}>
          {RECORD_TYPES.map((t) => (
            <View
              key={t.key}
              className={classnames(styles.typeTab, type === t.key && styles.active)}
              onClick={() => setType(t.key)}
            >
              {t.label}
            </View>
          ))}
        </ScrollView>

        <View className={styles.formBody}>
          {type === 'truck' && (
            <>
              <View className={styles.rowFields}>
                <View className={classnames(styles.formItem, styles.rowField)}>
                  <Text className={styles.formLabel}><Text className={styles.required}>*</Text>车次</Text>
                  <Input
                    className={styles.input}
                    type="number"
                    placeholder="如第1车"
                    value={truckBatch}
                    onInput={(e) => setTruckBatch(e.detail.value)}
                  />
                </View>
                <View className={classnames(styles.formItem, styles.rowField)}>
                  <Text className={styles.formLabel}><Text className={styles.required}>*</Text>到场时间</Text>
                  <Input
                    className={styles.input}
                    placeholder="HH:mm"
                    value={arrivalTime}
                    onInput={(e) => setArrivalTime(e.detail.value)}
                  />
                </View>
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}><Text className={styles.required}>*</Text>车牌号</Text>
                <Input
                  className={styles.input}
                  placeholder="请输入车牌号，如川A·12345"
                  value={truckNumber}
                  onInput={(e) => setTruckNumber(e.detail.value)}
                />
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>小票照片</Text>
                {photoUrl ? (
                  <Image className={styles.previewPhoto} src={photoUrl} mode="aspectFill" onClick={handleChooseImage} />
                ) : (
                  <View className={styles.photoBtn} onClick={handleChooseImage}>
                    <Text className={styles.photoIcon}>📷</Text>
                    <Text className={styles.photoText}>拍摄小票</Text>
                  </View>
                )}
              </View>
            </>
          )}

          {type === 'slump' && (
            <>
              <View className={styles.rowFields}>
                <View className={classnames(styles.formItem, styles.rowField)}>
                  <Text className={styles.formLabel}><Text className={styles.required}>*</Text>实测值(mm)</Text>
                  <Input
                    className={styles.input}
                    type="number"
                    placeholder="如160"
                    value={slumpValue}
                    onInput={(e) => setSlumpValue(e.detail.value)}
                  />
                </View>
                <View className={classnames(styles.formItem, styles.rowField)}>
                  <Text className={styles.formLabel}>标准值</Text>
                  <Input
                    className={styles.input}
                    placeholder="160±20mm"
                    value={slumpStandard}
                    onInput={(e) => setSlumpStandard(e.detail.value)}
                  />
                </View>
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}><Text className={styles.required}>*</Text>是否离析</Text>
                <View className={styles.radioGroup}>
                  <View
                    className={classnames(styles.radioItem, isSegregation === true && styles.active)}
                    onClick={() => setIsSegregation(true)}
                  >是，离析</View>
                  <View
                    className={classnames(styles.radioItem, isSegregation === false && styles.active)}
                    onClick={() => setIsSegregation(false)}
                  >否，正常</View>
                </View>
              </View>
            </>
          )}

          {type === 'vibration' && (
            <>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}><Text className={styles.required}>*</Text>振捣人员到位</Text>
                <View className={styles.radioGroup}>
                  <View
                    className={classnames(styles.radioItem, vibratorOnSite === true && styles.active)}
                    onClick={() => setVibratorOnSite(true)}
                  >✓ 已到位</View>
                  <View
                    className={classnames(styles.radioItem, vibratorOnSite === false && styles.active)}
                    onClick={() => setVibratorOnSite(false)}
                  >✗ 未到位</View>
                </View>
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>振捣人员数量</Text>
                <Input
                  className={styles.input}
                  type="number"
                  placeholder="请输入人数"
                  value={vibratorCount}
                  onInput={(e) => setVibratorCount(e.detail.value)}
                />
              </View>
            </>
          )}

          {type !== 'slump' && (
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>状态判定</Text>
              <View className={styles.statusSelector}>
                {STATUS_OPTIONS.map((s) => (
                  <View
                    key={s.key}
                    className={classnames(styles.statusOption, styles[s.key], status === s.key && styles.active)}
                    onClick={() => setStatus(s.key)}
                  >{s.label}</View>
                ))}
              </View>
            </View>
          )}

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>备注说明</Text>
            <Textarea
              className={styles.textarea}
              placeholder="请输入备注信息（选填）"
              value={remark}
              onInput={(e) => setRemark(e.detail.value)}
            />
          </View>
        </View>

        <View className={styles.footer}>
          <Button className={styles.cancelBtn} onClick={handleClose}>取消</Button>
          <Button
            className={classnames(styles.submitBtn, !canSubmit() && styles.disabled)}
            onClick={handleSubmit}
          >保存记录</Button>
        </View>
      </View>
    </View>
  )
}

export default RecordForm
