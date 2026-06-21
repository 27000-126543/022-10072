import React, { useMemo } from 'react'
import { View, Text, Input, Picker, Button, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import TaskCard from '@/components/TaskCard'
import KeyCheckList from '@/components/KeyCheckList'
import { usePouringStore } from '@/store/pouringStore'
import {
  BUILDING_OPTIONS,
  AXIS_OPTIONS,
  COMPONENT_OPTIONS,
  STRENGTH_GRADE_OPTIONS,
} from '@/types/pouring'
import { getCurrentDateTime } from '@/utils'

const PourInfoPage: React.FC = () => {
  const {
    pouringInfo,
    keyCheckItems,
    isTaskCreated,
    setPouringInfo,
    createTask,
    toggleKeyCheck,
  } = usePouringStore()

  useDidShow(() => {
    console.log('[PourInfoPage] Page shown, isTaskCreated:', isTaskCreated)
  })

  const progress = useMemo(() => {
    const total = keyCheckItems.filter(i => i.required).length
    const checked = keyCheckItems.filter(i => i.required && i.checked).length
    return { total, checked, percent: total > 0 ? Math.round((checked / total) * 100) : 0 }
  }, [keyCheckItems])

  const canCreate = useMemo(() => {
    if (!pouringInfo) return false
    return (
      pouringInfo.building &&
      pouringInfo.axis &&
      pouringInfo.component &&
      pouringInfo.strengthGrade &&
      pouringInfo.plannedVolume > 0 &&
      pouringInfo.startTime
    )
  }, [pouringInfo])

  const handleCreate = async () => {
    if (!canCreate) {
      Taro.showToast({ title: '请完善全部信息', icon: 'none' })
      return
    }
    await createTask()
    Taro.showToast({ title: '任务卡已生成', icon: 'success' })
    console.log('[PourInfoPage] Task created successfully')
  }

  const handleStartRecord = () => {
    const uncheckedRequired = keyCheckItems.filter(i => i.required && !i.checked)
    if (uncheckedRequired.length > 0) {
      Taro.showModal({
        title: '提示',
        content: `还有 ${uncheckedRequired.length} 项必查项未核对，是否继续？`,
        confirmText: '继续',
        success: (res) => {
          if (res.confirm) {
            Taro.switchTab({ url: '/pages/process-record/index' })
          }
        }
      })
    } else {
      Taro.switchTab({ url: '/pages/process-record/index' })
    }
  }

  const startTimeOptions = useMemo(() => {
    const now = getCurrentDateTime().slice(0, 16)
    return [now]
  }, [])

  return (
    <View className={styles.page}>
      <ScrollView scrollY style={{ height: '100%' }}>
        <View className={styles.pageHeader}>
          <Text className={styles.pageTitle}>混凝土浇筑旁站</Text>
          <Text className={styles.pageSubtitle}>
            {isTaskCreated ? '当前旁站任务进行中，请前往过程记录页' : '请先选择浇筑信息，生成旁站任务卡'}
          </Text>
        </View>

        {!isTaskCreated ? (
          <View className={styles.card}>
            <Text className={styles.sectionTitle}>浇筑基本信息</Text>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>
                <Text className={styles.required}>*</Text>选择楼栋
              </Text>
              <Picker
                mode="selector"
                range={BUILDING_OPTIONS}
                value={BUILDING_OPTIONS.indexOf(pouringInfo?.building || '')}
                onChange={(e) => setPouringInfo({ building: BUILDING_OPTIONS[Number(e.detail.value)] })}
              >
                <View className={styles.pickerField}>
                  <Text className={classnames(styles.pickerValue, !pouringInfo?.building && styles.placeholder)}>
                    {pouringInfo?.building || '请选择楼栋号'}
                  </Text>
                  <Text className={styles.pickerArrow}>›</Text>
                </View>
              </Picker>
            </View>

            <View className={styles.rowFields}>
              <View className={classnames(styles.formItem, styles.rowField)}>
                <Text className={styles.formLabel}>
                  <Text className={styles.required}>*</Text>轴线
                </Text>
                <Picker
                  mode="selector"
                  range={AXIS_OPTIONS}
                  value={AXIS_OPTIONS.indexOf(pouringInfo?.axis || '')}
                  onChange={(e) => setPouringInfo({ axis: AXIS_OPTIONS[Number(e.detail.value)] })}
                >
                  <View className={styles.pickerField}>
                    <Text className={classnames(styles.pickerValue, !pouringInfo?.axis && styles.placeholder)}>
                      {pouringInfo?.axis || '请选择'}
                    </Text>
                    <Text className={styles.pickerArrow}>›</Text>
                  </View>
                </Picker>
              </View>

              <View className={classnames(styles.formItem, styles.rowField)}>
                <Text className={styles.formLabel}>
                  <Text className={styles.required}>*</Text>强度等级
                </Text>
                <Picker
                  mode="selector"
                  range={STRENGTH_GRADE_OPTIONS}
                  value={STRENGTH_GRADE_OPTIONS.indexOf(pouringInfo?.strengthGrade || '')}
                  onChange={(e) => setPouringInfo({ strengthGrade: STRENGTH_GRADE_OPTIONS[Number(e.detail.value)] })}
                >
                  <View className={styles.pickerField}>
                    <Text className={classnames(styles.pickerValue, !pouringInfo?.strengthGrade && styles.placeholder)}>
                      {pouringInfo?.strengthGrade || '请选择'}
                    </Text>
                    <Text className={styles.pickerArrow}>›</Text>
                  </View>
                </Picker>
              </View>
            </View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>
                <Text className={styles.required}>*</Text>构件部位
              </Text>
              <Picker
                mode="selector"
                range={COMPONENT_OPTIONS}
                value={COMPONENT_OPTIONS.indexOf(pouringInfo?.component || '')}
                onChange={(e) => setPouringInfo({ component: COMPONENT_OPTIONS[Number(e.detail.value)] })}
              >
                <View className={styles.pickerField}>
                  <Text className={classnames(styles.pickerValue, !pouringInfo?.component && styles.placeholder)}>
                    {pouringInfo?.component || '请选择构件部位'}
                  </Text>
                  <Text className={styles.pickerArrow}>›</Text>
                </View>
              </Picker>
            </View>

            <View className={styles.rowFields}>
              <View className={classnames(styles.formItem, styles.rowField)}>
                <Text className={styles.formLabel}>
                  <Text className={styles.required}>*</Text>计划方量(m³)
                </Text>
                <Input
                  className={styles.inputField}
                  type="digit"
                  placeholder="如120"
                  value={pouringInfo?.plannedVolume ? String(pouringInfo.plannedVolume) : ''}
                  onInput={(e) => setPouringInfo({ plannedVolume: Number(e.detail.value) })}
                />
              </View>

              <View className={classnames(styles.formItem, styles.rowField)}>
                <Text className={styles.formLabel}>
                  <Text className={styles.required}>*</Text>开盘时间
                </Text>
                <Picker
                  mode="multiSelector"
                  range={[startTimeOptions]}
                  onChange={(e) => setPouringInfo({ startTime: startTimeOptions[Number(e.detail.value)] })}
                >
                  <View className={styles.pickerField}>
                    <Text className={classnames(styles.pickerValue, !pouringInfo?.startTime && styles.placeholder)}>
                      {pouringInfo?.startTime?.slice(5, 16) || '选择时间'}
                    </Text>
                    <Text className={styles.pickerArrow}>›</Text>
                  </View>
                </Picker>
              </View>
            </View>
          </View>
        ) : (
          pouringInfo && (
            <>
              <View style={{ marginBottom: '24rpx' }}>
                <TaskCard info={pouringInfo} />
              </View>

              <View className={styles.card}>
                <View className={styles.checkHeader}>
                  <Text className={styles.sectionTitle} style={{ margin: 0 }}>关键核对项</Text>
                  <Text className={styles.progressText}>
                    必查：<Text className={styles.highlight}>{progress.checked}</Text>/{progress.total}
                  </Text>
                </View>
                <View className={styles.progressBar}>
                  <View className={styles.progressFill} style={{ width: `${progress.percent}%` }} />
                </View>
                <KeyCheckList items={keyCheckItems} onToggle={toggleKeyCheck} />
              </View>

              <View className={styles.tipsCard}>
                <Text className={styles.tipsTitle}>💡 旁站提示</Text>
                <Text className={styles.tipsContent}>
                  浇筑过程中，请随时前往「过程记录」页面添加罐车进场、坍落度检测、振捣检查等记录。发现异常情况请立即标注并拍照留存。
                </Text>
              </View>
            </>
          )
        )}
      </ScrollView>

      <View className={styles.bottomBar}>
        {isTaskCreated ? (
          <>
            <Button className={styles.secondaryBtn} onClick={() => {
              Taro.showModal({
                title: '确认重置',
                content: '确定要重新开始新的旁站任务吗？当前记录将被清除。',
                confirmColor: '#DC2626',
                success: (res) => {
                  if (res.confirm) {
                    usePouringStore.getState().resetAll()
                    Taro.showToast({ title: '已重置', icon: 'success' })
                  }
                }
              })
            }}>重置任务</Button>
            <Button className={styles.primaryBtn} onClick={handleStartRecord}>
              开始过程记录 →
            </Button>
          </>
        ) : (
          <Button
            className={classnames(styles.primaryBtn, { [styles.disabled]: !canCreate })}
            style={{ flex: 1 }}
            onClick={handleCreate}
          >
            生成旁站任务卡
          </Button>
        )}
      </View>
    </View>
  )
}

export default PourInfoPage
