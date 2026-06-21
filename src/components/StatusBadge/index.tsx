import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import type { RecordStatus } from '@/types/pouring'
import { getStatusText } from '@/utils'

interface StatusBadgeProps {
  status: RecordStatus
  text?: string
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text }) => {
  return (
    <View className={classnames(styles.badge, styles[status])}>
      <Text>{text || getStatusText(status)}</Text>
    </View>
  )
}

export default StatusBadge
