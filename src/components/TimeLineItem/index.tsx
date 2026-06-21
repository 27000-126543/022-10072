import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import StatusBadge from '@/components/StatusBadge'
import type { ProcessRecord } from '@/types/pouring'
import { getRecordTypeText } from '@/utils'

interface TimeLineItemProps {
  record: ProcessRecord
  onRemove?: (id: string) => void
}

const TimeLineItem: React.FC<TimeLineItemProps> = ({ record, onRemove }) => {
  const renderTruckInfo = () => (
    <>
      <View className={classnames(styles.infoRow, record.photoUrl && styles.withPhoto)}>
        <View>
          <Text className={styles.infoLabel}>车次 / 车牌</Text>
          <Text className={styles.infoValue}>
            第{record.truckBatch}车 · {record.truckNumber}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text className={styles.infoLabel}>到场时间</Text>
          <Text className={styles.infoValue}>{record.arrivalTime}</Text>
        </View>
      </View>
      {record.photoUrl && (
        <View className={styles.photoWrap}>
          <Image
            className={styles.photo}
            src={record.photoUrl}
            mode="aspectFill"
            onError={(e) => console.error('[TimeLineItem] Image load error:', e)}
          />
        </View>
      )}
    </>
  )

  const renderSlumpInfo = () => (
    <>
      <View className={styles.slumpBar}>
        <Text className={styles.slumpValue} style={{
          color: record.status === 'normal' ? '#16A34A' : record.status === 'warning' ? '#F59E0B' : '#DC2626'
        }}>{record.slumpValue}</Text>
        <Text className={styles.slumpStandard}>mm / 标准：{record.slumpStandard}</Text>
      </View>
      <View className={styles.infoRow}>
        <Text className={styles.infoLabel}>离析情况</Text>
        <View>
          {record.isSegregation ? (
            <Text className={classnames(styles.tag, styles.segregation)}>存在离析</Text>
          ) : (
            <Text className={classnames(styles.tag, styles.noSegregation)}>无离析</Text>
          )}
        </View>
      </View>
    </>
  )

  const renderVibrationInfo = () => (
    <>
      <View className={styles.infoRow}>
        <Text className={styles.infoLabel}>振捣人员到位</Text>
        <Text className={styles.infoValue}>
          {record.vibratorOnSite ? '✓ 已到位' : '✗ 未到位'}
        </Text>
      </View>
      <View className={styles.infoRow}>
        <Text className={styles.infoLabel}>振捣人员数量</Text>
        <Text className={styles.infoValue}>{record.vibratorCount} 人</Text>
      </View>
    </>
  )

  return (
    <View className={styles.timelineItem}>
      <View className={classnames(styles.timelineDot, styles[record.status])} />
      <View className={styles.timelineLine} />
      <View className={styles.card} onLongPress={() => onRemove && onRemove(record.id)}>
        <View className={styles.cardHeader}>
          <Text className={styles.typeLabel}>{getRecordTypeText(record.type)}</Text>
          <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx' }}>
            <StatusBadge status={record.status} />
            <Text className={styles.timestamp}>{record.timestamp.slice(11, 16)}</Text>
          </View>
        </View>
        <View className={styles.cardBody}>
          {record.type === 'truck' && renderTruckInfo()}
          {record.type === 'slump' && renderSlumpInfo()}
          {record.type === 'vibration' && renderVibrationInfo()}
          {record.remark && (
            <Text className={styles.remark}>备注：{record.remark}</Text>
          )}
        </View>
      </View>
    </View>
  )
}

export default TimeLineItem
