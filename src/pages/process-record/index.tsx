import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import TimeLineItem from '@/components/TimeLineItem'
import RecordForm from '@/components/RecordForm'
import StatusBadge from '@/components/StatusBadge'
import { usePouringStore } from '@/store/pouringStore'
import { MOCK_PROCESS_RECORDS } from '@/data/mock'
import { formatDate } from '@/utils'
import type { ProcessRecord } from '@/types/pouring'

const ProcessRecordPage: React.FC = () => {
  const {
    pouringInfo,
    processRecords,
    isTaskCreated,
    addProcessRecord,
    removeProcessRecord,
  } = usePouringStore()

  const [showForm, setShowForm] = useState(false)
  const [useMock, setUseMock] = useState(false)

  useDidShow(() => {
    console.log('[ProcessRecordPage] Page shown, records:', processRecords.length, 'isTaskCreated:', isTaskCreated)
  })

  usePullDownRefresh(() => {
    setTimeout(() => Taro.stopPullDownRefresh(), 500)
  })

  const displayRecords: ProcessRecord[] = useMemo(() => {
    if (useMock && processRecords.length === 0) return MOCK_PROCESS_RECORDS
    return processRecords
  }, [processRecords, useMock])

  const stats = useMemo(() => {
    const total = displayRecords.length
    const normal = displayRecords.filter(r => r.status === 'normal').length
    const warning = displayRecords.filter(r => r.status === 'warning').length
    const danger = displayRecords.filter(r => r.status === 'danger').length
    const trucks = displayRecords.filter(r => r.type === 'truck').length
    return { total, normal, warning, danger, trucks }
  }, [displayRecords])

  const handleLoadDemo = () => {
    setUseMock(true)
    Taro.showToast({ title: '已加载示例数据', icon: 'success' })
    console.log('[ProcessRecordPage] Loaded mock data, count:', MOCK_PROCESS_RECORDS.length)
  }

  const handleAddRecord = async (record: Omit<ProcessRecord, 'id' | 'timestamp'>) => {
    setUseMock(false)
    await addProcessRecord(record)
  }

  const handleRemove = (id: string) => {
    Taro.showModal({
      title: '删除记录',
      content: '确定要删除这条记录吗？',
      confirmColor: '#DC2626',
      success: (res) => {
        if (res.confirm) {
          removeProcessRecord(id)
          Taro.showToast({ title: '已删除', icon: 'success' })
        }
      }
    })
  }

  return (
    <View className={styles.page}>
      {pouringInfo && (
        <View className={styles.headerCard}>
          <View className={styles.headerTop}>
            <View className={styles.taskInfo}>
              <Text className={styles.taskTitle}>
                {pouringInfo.building} · {pouringInfo.axis} · {pouringInfo.component}
              </Text>
              <View className={styles.taskSub}>
                <Text>{pouringInfo.strengthGrade}</Text>
                <Text>计划 {pouringInfo.plannedVolume}m³</Text>
              </View>
            </View>
            <View className={styles.taskBadge}>进行中</View>
          </View>
          <View className={styles.statsBar}>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statValue, styles.total)}>{stats.total}</Text>
              <Text className={styles.statLabel}>总记录</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statValue, styles.normal)}>{stats.normal}</Text>
              <Text className={styles.statLabel}>正常</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statValue, styles.warning)}>{stats.warning}</Text>
              <Text className={styles.statLabel}>异常</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statValue, styles.danger)}>{stats.danger}</Text>
              <Text className={styles.statLabel}>严重</Text>
            </View>
          </View>
        </View>
      )}

      {!isTaskCreated ? (
        <View className={styles.noTaskState}>
          <Text className={styles.noTaskIcon}>📋</Text>
          <Text className={styles.noTaskTitle}>尚未创建旁站任务</Text>
          <Button className={styles.goBtn} onClick={() => Taro.switchTab({ url: '/pages/pour-info/index' })}>
            去创建任务 →
          </Button>
          <View style={{ marginTop: '48rpx' }}>
            <Text style={{ fontSize: '24rpx', color: '#86909C' }}>或</Text>
          </View>
          <View style={{ marginTop: '24rpx' }}>
            <Button
              className={styles.goBtn}
              style={{ background: '#F0F4F8', color: '#475569' }}
              onClick={handleLoadDemo}
            >
              加载示例数据预览
            </Button>
          </View>
        </View>
      ) : displayRecords.length === 0 ? (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📝</Text>
          <Text className={styles.emptyTitle}>还没有过程记录</Text>
          <Text className={styles.emptyDesc}>
            点击右下角 + 按钮{'\n'}添加罐车进场、坍落度检测等记录
          </Text>
        </View>
      ) : (
        <ScrollView scrollY>
          <View className={styles.sectionHeader}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx' }}>
              <Text className={styles.sectionTitle}>时间线记录</Text>
              <Text className={styles.todayLabel}>今天 {formatDate(new Date())}</Text>
            </View>
            <Text className={styles.recordCount}>共 {displayRecords.length} 条</Text>
          </View>

          <View className={styles.timelineWrap}>
            {displayRecords.map((record) => (
              <TimeLineItem
                key={record.id}
                record={record}
                onRemove={handleRemove}
              />
            ))}
          </View>
          <Text className={styles.hintText}>长按记录卡片可删除</Text>
        </ScrollView>
      )}

      {isTaskCreated && (
        <View
          className={classnames(styles.fab, !isTaskCreated && styles.disabled)}
          onClick={() => isTaskCreated && setShowForm(true)}
        >
          <Text className={styles.fabIcon}>+</Text>
        </View>
      )}

      <RecordForm
        visible={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleAddRecord}
      />

      {stats.warning > 0 || stats.danger > 0 ? (
        <View style={{
          position: 'fixed',
          left: '32rpx',
          bottom: 'calc(env(safe-area-inset-bottom) + 140rpx)',
          padding: '8rpx 20rpx',
          borderRadius: '999rpx',
          backgroundColor: stats.danger > 0 ? '#FEE2E2' : '#FEF3C7',
          zIndex: 100,
        }}>
          <StatusBadge status={stats.danger > 0 ? 'danger' : 'warning'}
            text={`${stats.warning + stats.danger}项异常待关注`}
          />
        </View>
      ) : null}
    </View>
  )
}

export default ProcessRecordPage
