import React, { useState } from 'react'
import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'

interface SignaturePadProps {
  visible: boolean
  title?: string
  role?: string
  onClose: () => void
  onConfirm: (data: { name: string; signatureUrl: string }) => void
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  visible,
  title = '请签字确认',
  role = '施工员',
  onClose,
  onConfirm,
}) => {
  const [name, setName] = useState('')
  const [signed, setSigned] = useState(false)

  const reset = () => {
    setName('')
    setSigned(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSign = () => {
    if (!name.trim()) {
      Taro.showToast({ title: '请先输入姓名', icon: 'none' })
      return
    }
    setSigned(true)
    Taro.showToast({ title: '签名完成', icon: 'success' })
  }

  const handleClear = () => {
    setSigned(false)
  }

  const handleConfirm = () => {
    if (!name.trim()) {
      Taro.showToast({ title: '请输入姓名', icon: 'none' })
      return
    }
    if (!signed) {
      Taro.showToast({ title: '请先点击签名', icon: 'none' })
      return
    }
    const signatureUrl = `data:image/svg+xml;base64,${btoa(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><text x="50%" y="50%" font-family="KaiTi, serif" font-size="48" font-weight="bold" fill="#0C4A6E" text-anchor="middle" dominant-baseline="middle" transform="rotate(-8 200 100)">${name}</text></svg>`
    )}`
    onConfirm({ name: name.trim(), signatureUrl })
    reset()
  }

  if (!visible) return null

  return (
    <View className={styles.modalMask} onClick={handleClose}>
      <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <View className={styles.modalHeader}>
          <Text className={styles.title}>{title}</Text>
          <View className={styles.closeBtn} onClick={handleClose}>×</View>
        </View>

        <View className={styles.modalBody}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.required}>*</Text>{role}姓名
            </Text>
            <Input
              className={styles.input}
              placeholder={`请输入${role}姓名`}
              value={name}
              onInput={(e) => setName(e.detail.value)}
              disabled={signed}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.required}>*</Text>签名区域
            </Text>
            <View className={styles.signArea}>
              {signed ? (
                <Text className={styles.signName}>{name}</Text>
              ) : (
                <View className={styles.signPlaceholder}>
                  <Text className={styles.signIcon}>✍️</Text>
                  <Text className={styles.signTip}>点击下方「签名」按钮完成电子签名</Text>
                </View>
              )}
            </View>
            <View className={styles.signActions}>
              <Button
                className={classnames(styles.actionBtn, !signed && styles.primary)}
                onClick={handleSign}
                disabled={signed || !name.trim()}
              >{signed ? '已签名' : '点击签名'}</Button>
              <Button
                className={styles.actionBtn}
                onClick={handleClear}
                disabled={!signed}
              >清除重签</Button>
            </View>
          </View>
        </View>

        <View className={styles.footer}>
          <Button className={styles.cancelBtn} onClick={handleClose}>取消</Button>
          <Button
            className={classnames(styles.confirmBtn, !signed && styles.disabled)}
            onClick={handleConfirm}
          >确认提交</Button>
        </View>
      </View>
    </View>
  )
}

export default SignaturePad
