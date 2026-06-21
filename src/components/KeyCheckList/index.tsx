import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import type { KeyCheckItem } from '@/types/pouring'

interface KeyCheckListProps {
  items: KeyCheckItem[]
  onToggle: (id: string) => void
}

const KeyCheckList: React.FC<KeyCheckListProps> = ({ items, onToggle }) => {
  return (
    <View className={styles.list}>
      {items.map((item) => (
        <View
          key={item.id}
          className={styles.item}
          onClick={() => onToggle(item.id)}
        >
          <View className={classnames(styles.checkbox, item.checked && styles.checked)} />
          <View className={styles.content}>
            <View className={styles.topRow}>
              <Text className={styles.name}>{item.name}</Text>
              <Text className={item.required ? styles.required : styles.optional}>
                {item.required ? '必查' : '选查'}
              </Text>
            </View>
            <Text className={styles.desc}>{item.description}</Text>
          </View>
        </View>
      ))}
    </View>
  )
}

export default KeyCheckList
