<template>
  <!-- 当有选中的社区才展示 -->
  <u-modal
    :show="showDialog"
    cancel-color="#838181"
    confirm-color="#E21D1C"
    :show-cancel-button="true"
    :confirm-text="$t('my_center_page.delete')"
    :cancel-text="$t('cancel')"
    :close-on-click-overlay="true"
    @close="close"
    @cancel="close"
    @confirm="confirm"
  >
    <view style="font-size: 32rpx; line-height: 44rpx; color: #333;">
      {{ $t('devices.deleteDialogHint') }}
    </view>
  </u-modal>
</template>

<script>
export default {
    props: {

    },
    data() {
        return {
            showDialog: true
        }
    },

    methods: {
        // 以游客模式登陆
        confirm() {
            this.$emit('delete')
            this.close()
        },

        close() {
            this.showDialog = false
            this.$emit('close')
        }
    }
}
</script>