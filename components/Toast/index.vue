<template>
	<u-overlay :show="visible" @click="hideToast">
		<view class="toast">
			<view class="toast__content">
				<image v-if="iconUrl" class="toast__image" :src="iconUrl" />

				<view class="toast__text">{{ content }}</view>
			</view>
		</view>
	</u-overlay>
</template>

<script>
	import {
		mapState
	} from 'pinia'
	import {
		useCommonStore
	} from '@/store/common'
	export default {
		data() {
			return {
				type: 'plain',

				// 类型
				icons: {
					'plain': '',
					'success': '/static/images/toast-success.png',
					'error': '/static/images/toast-error.png'
				},

				// 内容
				content: '',
				timer: null, // 用来隐藏弹窗的timer
				visible: false,
				commonStore: useCommonStore()
			}
		},

		computed: {
			iconUrl() {
				return this.icons[this.type] || ''
			}
		},
		watch: {
			showToastObj(newVal) {
				if (newVal) {
					this.showToast(newVal)
				}
			}
		},

		mounted() {},

		methods: {
			// ...mapActions(useCommonStore, ['setShowToastObj']),
			// 展示toast
			showToast({
				content,
				type = 'plain',
				duration = 2000
			}) {

				this.content = content
				this.type = type

				this.visible = true
				// console.log('showToast', this.visible)
				// 隐藏
				this.timer = setTimeout(() => this.hideToast(), duration)
			},

			// 隐藏
			hideToast() {
				this.visible = false
				this.commonStore.setShowToastObj(null)
				clearTimeout(this.timer)
			}
		}
	}
</script>

<style lang="scss">
	.toast {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		width: 100vw;

		&__content {
			padding: 44rpx 48rpx;
			margin: 0 30rpx;
			color: #333333;
			background: #F9F9F9;
			border-radius: 16rpx;
			display: flex;
			align-items: center;
		}

		&__image {
			width: 52rpx;
			height: 52rpx;
			flex-shrink: 0;
		}

		&__text {
			font-size: 32rpx;
			margin-left: 20rpx;
		}
	}
</style>