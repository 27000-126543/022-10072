import React, { useState, useMemo } from 'react'
import { View, Text, Input, Textarea, Picker, Button, ScrollView, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import SignaturePad from '@/components/SignaturePad'
import StatusBadge from '@/components/StatusBadge'
import { usePouringStore } from '@/store/pouringStore'
import { WEATHER_OPTIONS } from '@/types/pouring'
import { formatDateTime, getCurrentDateTime, getRecordTypeText } from '@/utils'

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
  const [showReport, setShowReport] = useState(false)

  useDidShow(() => {
    console.log('[SignArchivePage] Page shown, isTaskCreated:', isTaskCreated, 'records:', processRecords.length)
  })

  const stats = useMemo(() => {
    const total = processRecords.length
    const trucks = processRecords.filter(r => r.type === 'truck').length
    const abnormal = processRecords.filter(r => r.status !== 'normal').length
    return { total, trucks, abnormal }
  }, [processRecords])

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

    if (processRecords.length === 0) {
      Taro.showToast({
        title: '暂无过程记录，无法生成报告',
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
    await new Promise(r => setTimeout(r, 1000))
    Taro.hideLoading()

    setShowReport(true)
    console.log('[SignArchivePage] Report generated, records:', stats.total)
  }

  const handleBackHome = () => {
    setShowReport(false)
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

      {showReport && (
        <View className={styles.reportOverlay}>
          <View className={styles.reportHeader}>
            <Text className={styles.reportHeaderTitle}>旁站记录详情</Text>
            <View className={styles.reportClose} onClick={() => setShowReport(false)}>×</View>
          </View>

          <ScrollView scrollY className={styles.reportBody}>
            <Text className={styles.reportTitle}>混凝土浇筑旁站记录</Text>
            <Text className={styles.reportSubtitle}>
              任务编号：{pouringInfo?.taskCode} · 生成时间：{formatDateTime(new Date()).slice(0, 16)}
            </Text>

            <View className={styles.reportSection}>
              <Text className={styles.reportSectionTitle}>工程基本信息</Text>
              <View className={styles.reportInfoGrid}>
                <View className={styles.reportInfoItem}>
                  <Text className={styles.reportInfoLabel}>楼栋</Text>
                  <Text className={styles.reportInfoValue}>{pouringInfo?.building}</Text>
                </View>
                <View className={styles.reportInfoItem}>
                  <Text className={styles.reportInfoLabel}>轴线</Text>
                  <Text className={styles.reportInfoValue}>{pouringInfo?.axis}</Text>
                </View>
                <View className={styles.reportInfoItem}>
                  <Text className={styles.reportInfoLabel}>构件部位</Text>
                  <Text className={styles.reportInfoValue}>{pouringInfo?.component}</Text>
                </View>
                <View className={styles.reportInfoItem}>
                  <Text className={styles.reportInfoLabel}>强度等级</Text>
                  <Text className={styles.reportInfoValue}>{pouringInfo?.strengthGrade}</Text>
                </View>
                <View className={styles.reportInfoItem}>
                  <Text className={styles.reportInfoLabel}>计划方量</Text>
                  <Text className={styles.reportInfoValue}>{pouringInfo?.plannedVolume} m³</Text>
                </View>
                <View className={styles.reportInfoItem}>
                  <Text className={styles.reportInfoLabel}>实际完成</Text>
                  <Text className={styles.reportInfoValue}>{archiveInfo?.completedVolume || 0} m³</Text>
                </View>
                <View className={styles.reportInfoItem}>
                  <Text className={styles.reportInfoLabel}>开盘时间</Text>
                  <Text className={styles.reportInfoValue}>{pouringInfo?.startTime}</Text>
                </View>
                <View className={styles.reportInfoItem}>
                  <Text className={styles.reportInfoLabel}>天气 / 温度</Text>
                  <Text className={styles.reportInfoValue}>
                    {archiveInfo?.weather || '晴'} / {archiveInfo?.temperature || '-'}
                  </Text>
                </View>
              </View>
            </View>

            <View className={styles.reportSection}>
              <Text className={styles.reportSectionTitle}>过程记录时间线</Text>
              <View className={styles.reportTimeline}>
                <View className={styles.reportTimelineLine} />
                {processRecords.map((record, idx) => (
                  <View key={record.id} className={styles.reportTimelineItem}>
                    <View className={classnames(styles.reportTimelineDot, styles[record.status])} />
                    <View className={styles.reportTimelineCard}>
                      <View className={styles.reportTimelineHead}>
                        <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx' }}>
                          <Text className={styles.reportTimelineType}>
                            {idx + 1}. {getRecordTypeText(record.type)}
                          </Text>
                          <StatusBadge status={record.status} />
                        </View>
                        <Text className={styles.reportTimelineTime}>
                          {record.timestamp.slice(5, 16)}
                        </Text>
                      </View>

                      {record.type === 'truck' && (
                        <>
                          {record.photoUrl && (
                            <View className={styles.reportTimelinePhoto}>
                              <Image
                                className={styles.reportTimelinePhotoImg}
                                src={record.photoUrl}
                                mode="aspectFill"
                              />
                            </View>
                          )}
                          <View className={styles.reportInfoRow}>
                            <Text className={styles.reportInfoRowKey}>车次</Text>
                            <Text className={styles.reportInfoRowVal}>第{record.truckBatch}车</Text>
                          </View>
                          <View className={styles.reportInfoRow}>
                            <Text className={styles.reportInfoRowKey}>车牌号</Text>
                            <Text className={styles.reportInfoRowVal}>{record.truckNumber}</Text>
                          </View>
                          <View className={styles.reportInfoRow}>
                            <Text className={styles.reportInfoRowKey}>到场时间</Text>
                            <Text className={styles.reportInfoRowVal}>{record.arrivalTime}</Text>
                          </View>
                        </>
                      )}

                      {record.type === 'slump' && (
                        <>
                          <View className={styles.reportSlumpBar}>
                            <Text className={classnames(styles.reportSlumpValue, styles[record.status])}>
                              {record.slumpValue} mm
                            </Text>
                            <Text className={styles.reportSlumpStandard}>
                              标准：{record.slumpStandard}
                            </Text>
                          </View>
                          <View className={styles.reportInfoRow}>
                            <Text className={styles.reportInfoRowKey}>离析情况</Text>
                            <Text className={styles.reportInfoRowVal}>
                              {record.isSegregation ? '存在离析' : '无离析，正常'}
                            </Text>
                          </View>
                        </>
                      )}

                      {record.type === 'vibration' && (
                        <>
                          <View className={styles.reportInfoRow}>
                            <Text className={styles.reportInfoRowKey}>振捣人员</Text>
                            <Text className={styles.reportInfoRowVal}>
                              {record.vibratorOnSite ? '已到位' : '未到位'}
                            </Text>
                          </View>
                          <View className={styles.reportInfoRow}>
                            <Text className={styles.reportInfoRowKey}>人员数量</Text>
                            <Text className={styles.reportInfoRowVal}>{record.vibratorCount} 人</Text>
                          </View>
                        </>
                      )}

                      {record.type === 'custom' && record.remark && (
                        <Text className={styles.reportInfoRowVal} style={{ textAlign: 'left' }}>
                          {record.remark}
                        </Text>
                      )}

                      <View className={styles.reportInfoRow}>
                        <Text className={styles.reportInfoRowKey}>位置</Text>
                        <Text className={styles.reportInfoRowVal}>{record.location || '施工现场'}</Text>
                      </View>

                      {record.remark && record.type !== 'custom' && (
                        <Text className={styles.reportRemark}>备注：{record.remark}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.reportSection}>
              <Text className={styles.reportSectionTitle}>收盘信息</Text>
              <View className={styles.reportInfoGrid}>
                <View className={classnames(styles.reportInfoItem, styles.full)}>
                  <Text className={styles.reportInfoLabel}>停歇/中断原因</Text>
                  <Text className={styles.reportInfoValue}>
                    {archiveInfo?.stopReason || '无停歇'}
                  </Text>
                </View>
                <View className={classnames(styles.reportInfoItem, styles.full)}>
                  <Text className={styles.reportInfoLabel}>问题处理意见</Text>
                  <Text className={styles.reportInfoValue}>
                    {archiveInfo?.problemHandling || '无'}
                  </Text>
                </View>
              </View>
            </View>

            <View className={styles.reportSection}>
              <Text className={styles.reportSectionTitle}>双方签认</Text>
              <View className={styles.reportSignSection}>
                <View className={styles.reportSignBlock}>
                  <Text className={styles.reportSignName}>
                    {archiveInfo?.signature?.supervisor || '张监理'}
                  </Text>
                  <Text className={styles.reportSignRole}>监理员</Text>
                  <Text className={styles.reportSignDate}>
                    {archiveInfo?.signature?.supervisorAt?.slice(0, 10) || formatDateTime(new Date()).slice(0, 10)}
                  </Text>
                </View>
                <View className={styles.reportSignBlock}>
                  <Text className={styles.reportSignName}>
                    {archiveInfo?.signature?.worker || '施工员'}
                  </Text>
                  <Text className={styles.reportSignRole}>施工员</Text>
                  <Text className={styles.reportSignDate}>
                    {archiveInfo?.signature?.workerAt?.slice(0, 10) || formatDateTime(new Date()).slice(0, 10)}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <View className={styles.reportFooter}>
            <Button className={styles.reportFooterSecondary} onClick={() => setShowReport(false)}>
              关闭
            </Button>
            <Button className={styles.reportFooterPrimary} onClick={handleBackHome}>
              📤 提交归档
            </Button>
          </View>
        </View>
      )}
    </View>
  )
}

export default SignArchivePage
