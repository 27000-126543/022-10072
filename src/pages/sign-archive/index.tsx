import React, { useState, useMemo } from 'react'
import { View, Text, Input, Textarea, Picker, Button, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import SignaturePad from '@/components/SignaturePad'
import { usePouringStore } from '@/store/pouringStore'
import { WEATHER_OPTIONS } from '@/types/pouring'
import { MOCK_PROCESS_RECORDS } from '@/data/mock'
import { formatDateTime, getCurrentDateTime } from '@/utils'

const SignArchivePage: React.FC = () => {
  const {
    pouringInfo,
    processRecords,
    archiveInfo,
    isTaskCreated,
    setArchiveInfo,
    submitArchive,
  } = usePouringStore()

  const [showSign, setShowSign] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const displayRecords = processRecords.length > 0 ? processRecords : MOCK_PROCESS_RECORDS

  useDidShow(() => {
    console.log('[SignArchivePage] Page shown, isTaskCreated:', isTaskCreated, 'records:', displayRecords.length)
  })

  const stats = useMemo(() => {
    const total = displayRecords.length
    const trucks = displayRecords.filter(r => r.type === 'truck').length
    const abnormal = displayRecords.filter(r => r.status !== 'normal').length
    return { total, trucks, abnormal }
  }, [displayRecords])

  const canGenerate = useMemo(() => {
    if (!pouringInfo) return false
    const completedVolume = archiveInfo?.completedVolume || 0
    const hasWorkerSign = !!archiveInfo?.signature?.worker
    return completedVolume > 0 && hasWorkerSign
  }, [pouringInfo, archiveInfo])

  const handleSignConfirm = async (data: { name: string; signatureUrl: string }) => {
    setArchiveInfo({
      signature: {
        supervisor: '张监理',
        supervisorAt: getCurrentDateTime(),
        worker: data.name,
        workerAt: getCurrentDateTime(),
        workerSignatureUrl: data.signatureUrl,
      }
    })
    Taro.showToast({ title: '施工员签字完成', icon: 'success' })
    console.log('[SignArchivePage] Worker signed:', data.name)
  }

  const handleGenerate = async () => {
    if (!canGenerate) {
      Taro.showToast({
        title: '请完善完成方量并邀请签字',
        icon: 'none',
        duration: 2000,
      })
      return
    }

    if (!archiveInfo?.signature?.workerSignatureUrl) {
      await submitArchive({
        worker: archiveInfo?.signature?.worker || '施工员',
        workerSignatureUrl: archiveInfo?.signature?.workerSignatureUrl || '',
      })
    }

    Taro.showLoading({ title: '生成记录中...', mask: true })
    await new Promise(r => setTimeout(r, 1500))
    Taro.hideLoading()

    setShowSuccess(true)
    console.log('[SignArchivePage] Report generated successfully, records:', stats.total)
  }

  const handleBackHome = () => {
    setShowSuccess(false)
    usePouringStore.getState().resetAll()
    Taro.switchTab({ url: '/pages/pour-info/index' })
  }

  if (!isTaskCreated && processRecords.length === 0) {
    return (
      <View className={styles.page}>
        <View className={styles.noTaskState}>
          <Text className={styles.noTaskIcon}>📦</Text>
          <Text className={styles.noTaskTitle}>暂无待归档的旁站任务</Text>
          <Button className={styles.goBtn} onClick={() => Taro.switchTab({ url: '/pages/pour-info/index' })}>
            去创建任务 →
          </Button>
        </View>
      </View>
    )
  }

  return (
    <View className={styles.page}>
      <ScrollView scrollY style={{ height: '100%' }}>
        {pouringInfo && (
          <View className={styles.summaryCard}>
            <Text className={styles.summaryTitle}>📊 本次浇筑数据汇总</Text>
            <View className={styles.summaryGrid}>
              <View className={styles.summaryItem}>
                <Text className={styles.summaryLabel}>浇筑部位</Text>
                <Text className={styles.summaryValue}>
                  {pouringInfo.building} {pouringInfo.component}
                </Text>
              </View>
              <View className={styles.summaryItem}>
                <Text className={styles.summaryLabel}>强度等级</Text>
                <Text className={styles.summaryValue}>{pouringInfo.strengthGrade}</Text>
              </View>
              <View className={styles.summaryItem}>
                <Text className={styles.summaryLabel}>计划方量</Text>
                <Text className={classnames(styles.summaryValue, styles.big)}>
                  {pouringInfo.plannedVolume}<Text style={{ fontSize: '24rpx', fontWeight: 400 }}> m³</Text>
                </Text>
              </View>
              <View className={styles.summaryItem}>
                <Text className={styles.summaryLabel}>任务编号</Text>
                <Text className={styles.summaryValue} style={{ fontSize: '26rpx' }}>
                  {pouringInfo.taskCode}
                </Text>
              </View>
            </View>
            <View className={styles.statsGrid}>
              <View className={styles.statsCell}>
                <Text className={styles.statsNum}>{stats.total}</Text>
                <Text className={styles.statsLabel}>过程记录</Text>
              </View>
              <View className={styles.statsCell}>
                <Text className={styles.statsNum}>{stats.trucks}</Text>
                <Text className={styles.statsLabel}>罐车批次</Text>
              </View>
              <View className={styles.statsCell}>
                <Text className={styles.statsNum} style={{ color: stats.abnormal > 0 ? '#FECACA' : 'inherit' }}>
                  {stats.abnormal}
                </Text>
                <Text className={styles.statsLabel}>异常项</Text>
              </View>
            </View>
          </View>
        )}

        <View className={styles.sectionCard}>
          <Text className={styles.sectionTitle}>收盘信息补录</Text>

          <View className={styles.rowFields}>
            <View className={classnames(styles.formItem, styles.rowField)}>
              <Text className={styles.formLabel}>
                <Text className={styles.required}>*</Text>实际完成方量(m³)
              </Text>
              <Input
                className={styles.inputField}
                type="digit"
                placeholder="如118.5"
                value={archiveInfo?.completedVolume ? String(archiveInfo.completedVolume) : ''}
                onInput={(e) => setArchiveInfo({ completedVolume: Number(e.detail.value) })}
              />
            </View>

            <View className={classnames(styles.formItem, styles.rowField)}>
              <Text className={styles.formLabel}>施工天气</Text>
              <Picker
                mode="selector"
                range={WEATHER_OPTIONS}
                value={WEATHER_OPTIONS.indexOf(archiveInfo?.weather || '晴')}
                onChange={(e) => setArchiveInfo({ weather: WEATHER_OPTIONS[Number(e.detail.value)] })}
              >
                <View className={styles.pickerField}>
                  <Text className={styles.pickerValue}>{archiveInfo?.weather || '晴'}</Text>
                  <Text className={styles.pickerArrow}>›</Text>
                </View>
              </Picker>
            </View>
          </View>

          <View className={styles.rowFields}>
            <View className={classnames(styles.formItem, styles.rowField)}>
              <Text className={styles.formLabel}>环境温度</Text>
              <Input
                className={styles.inputField}
                placeholder="如 25℃"
                value={archiveInfo?.temperature || ''}
                onInput={(e) => setArchiveInfo({ temperature: e.detail.value })}
              />
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>停歇/中断原因</Text>
            <Textarea
              className={styles.textareaField}
              placeholder="如无停歇请填写「无」，如有请详细说明原因和时长"
              value={archiveInfo?.stopReason || ''}
              onInput={(e) => setArchiveInfo({ stopReason: e.detail.value })}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>问题处理意见</Text>
            <Textarea
              className={styles.textareaField}
              placeholder="记录浇筑过程中发现的问题及处理措施、复查结果"
              value={archiveInfo?.problemHandling || ''}
              onInput={(e) => setArchiveInfo({ problemHandling: e.detail.value })}
            />
          </View>
        </View>

        <View className={styles.sectionCard}>
          <Text className={styles.sectionTitle}>双签确认</Text>

          <View className={styles.signBlock}>
            <View className={classnames(styles.signItem, !!archiveInfo?.signature?.supervisor && styles.signed)}>
              {archiveInfo?.signature?.supervisor ? (
                <>
                  <Text className={styles.signStatus}>已签</Text>
                  <Text className={styles.signName}>{archiveInfo.signature.supervisor}</Text>
                  <Text className={styles.signRole}>监理员</Text>
                </>
              ) : (
                <>
                  <Text className={styles.signIcon}>✍️</Text>
                  <Text className={styles.signPlaceholder}>
                    监理员{'\n'}（系统自动签认）
                  </Text>
                </>
              )}
            </View>

            <View className={classnames(styles.signItem, !!archiveInfo?.signature?.worker && styles.signed)}>
              {archiveInfo?.signature?.worker ? (
                <>
                  <Text className={styles.signStatus}>已签</Text>
                  <Text className={styles.signName}>{archiveInfo.signature.worker}</Text>
                  <Text className={styles.signRole}>施工员</Text>
                </>
              ) : (
                <>
                  <Text className={styles.signIcon}>📲</Text>
                  <Text className={styles.signPlaceholder}>
                    施工员{'\n'}（待签字确认）
                  </Text>
                </>
              )}
            </View>
          </View>

          <Button
            className={classnames(styles.inviteBtn, !isTaskCreated && styles.disabled)}
            onClick={() => isTaskCreated && setShowSign(true)}
          >
            {archiveInfo?.signature?.worker ? '✓ 已邀请施工员签字（点击重签）' : '📱 邀请施工员签字确认'}
          </Button>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <Button className={styles.prevBtn} onClick={() => Taro.switchTab({ url: '/pages/process-record/index' })}>
          ← 过程记录
        </Button>
        <Button
          className={classnames(styles.generateBtn, !canGenerate && styles.disabled)}
          onClick={handleGenerate}
        >
          📄 一键生成旁站记录
        </Button>
      </View>

      <SignaturePad
        visible={showSign}
        title="施工员签字确认"
        role="施工员"
        onClose={() => setShowSign(false)}
        onConfirm={handleSignConfirm}
      />

      {showSuccess && (
        <View className={styles.successOverlay}>
          <View className={styles.successCard}>
            <View className={styles.successIcon}>✓</View>
            <Text className={styles.successTitle}>旁站记录生成成功！</Text>
            <Text className={styles.successDesc}>
              记录已包含照片、时间戳和位置信息，{'\n'}可提交监理资料归档。
            </Text>
            <View className={styles.successInfo}>
              <View className={styles.infoRow}>
                <Text className={styles.infoKey}>任务编号</Text>
                <Text className={styles.infoVal}>{pouringInfo?.taskCode}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoKey}>记录数</Text>
                <Text className={styles.infoVal}>{stats.total} 条过程记录</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoKey}>生成时间</Text>
                <Text className={styles.infoVal}>{formatDateTime(new Date()).slice(5, 16)}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoKey}>签字状态</Text>
                <Text className={styles.infoVal} style={{ color: '#16A34A' }}>✓ 双签已完成</Text>
              </View>
            </View>
            <View className={styles.successActions}>
              <Button className={styles.secondaryAction} onClick={() => setShowSuccess(false)}>
                关闭
              </Button>
              <Button className={styles.primaryAction} onClick={handleBackHome}>
                开始新任务
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default SignArchivePage
