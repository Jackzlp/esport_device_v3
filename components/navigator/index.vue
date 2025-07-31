<template>
	<!-- 协议 -->
	<view class="flex-both-center navigator"
		:style="{ paddingTop: `${systemBarHeight * 3}rpx`, paddingBottom: `32rpx` }">
		<view v-if="showBackIcon" class="navigator__back" @click="back">
			<image v-if="showWhiteBack" :src="'/static/images/common/law.png'"></image>
			<image v-else :src="'/static/images/common/left-arrow.png'" />
		</view>

		<view v-else class="navigator__left">
			<slot name="left" />
		</view>

		<view class="flex-both-center navigator__content" :style="{ top: `${systemBarHeight * 3 - 40}rpx` }">
			<text :class="['title-style', 'ellipsis']" :style="contentStyle">
				{{ content }}
			</text>
		</view>

		<view class="navigator__right">
			<slot name="right" />
		</view>
	</view>
</template>

<script>
	import {
		useUserStore
	} from '@/store/user'
	import {
		useCommonStore
	} from '@/store/common'
	import {
		mapState
	} from 'pinia'

	export default {
		props: {
			// 标题
			content: {
				default: '',
				type: String
			},

			// 隐藏返回的按钮
			showBackIcon: {
				default: true,
				type: Boolean
			},

			// 文本的样式
			contentStyle: {
				type: String,
				default: ''
			},
			showWhiteBack: {
				type: Boolean,
				default: false
			}

		},
		data() {
			return {}
		},

		computed: {
			...mapState(useUserStore, ['userInfo']),
			...mapState(useCommonStore, ['systemBarHeight'])
		},

		methods: {
			confirm() {
				this.$emit('confirm')
			},
			// 回去
			back() {
				const pages = getCurrentPages()

				if (pages.length > 1) return uni.navigateBack();
				if (pages.length === 1) {
					if (!this.userInfo) return this.toLoginPage()
					return this.toHomePage()
				}

			}
		}
	}
</script>

<style lang="scss" scoped>
	.navigator {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		padding: 32rpx 32rpx;
		height: 120rpx;
		background: #fff;
		display: flex;
		align-items: center;
		justify-content: space-between;
		z-index: 100;
		box-sizing: border-box;

		&__back {
			width: 48rpx;
			height: 48rpx;

			image {
				width: 100%;
				height: 100%;
			}
		}

		&__content {
			position: absolute;
			font-size: 32rpx;
			font-weight: bold;
			top: 0;
			left: 0;
			padding: 32rpx 32rpx;
			height: 80rpx;
			right: 0;
			z-index: -1;
		}

		&__back {
			width: 48rpx;
			height: 48rpx;
		}

		&__confirm {
			color: #2E67F3;
			font-size: 28rpx;
		}

		.title-style {
			text-align: center;
			width: 70vw;
			margin: 0 auto;
		}
	}
</style>