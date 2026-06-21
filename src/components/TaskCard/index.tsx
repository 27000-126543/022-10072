import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'
import type { PouringInfo } from '@/types/pouring'
import { formatDateTime } from '@/utils'

interface TaskCardProps {
  info: PouringInfo
}

const TaskCard: React.FC<TaskCardProps> = ({ info }) => {
  return (
    <View className={styles.card}>
      <View className={styles.header}>
        <Text className={styles.taskLabel}>旁站任务卡</Text>
        <Text className={styles.taskCode}>{info.taskCode}</Text>
      </View>
      <Text className={styles.title}>
        {info.building} · {info.axis} · {info.component}
      </Text>
      <View className={styles.infoGrid}>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>强度等级</Text>
          <Text className={styles.infoValue}>{info.strengthGrade}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>计划方量</Text>
          <Text className={styles.infoValue}>{info.plannedVolume} m³</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>开盘时间</Text>
          <Text className={styles.infoValue}>{info.startTime}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>创建时间</Text>
          <Text className={styles.infoValue}>{formatDateTime(info.createTime).slice(5, 16)}</Text>
        </View>
      </View>
      <View className={styles.footer}>
        <Text>监理员：张监理</Text>
        <Text>状态：旁站进行中</Text>
      </View>
    </View>
  )
}

export default TaskCard
