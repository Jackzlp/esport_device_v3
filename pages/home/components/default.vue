<template>
	<view class="home-default">
		<!-- 大圆 -->
		<view class="home-default__circle">
			<GradientCircle style-type="" :extra-style="{ zIndex: -1 }" />
		</view>

		<!-- 轮播图 -->
		<view class="home-default__swiper">
			<image src="/static/images/common/left-arrow.png" class="left-arrow" @click.stop="switchBanner(-1)" />
			<image src="/static/images/common/left-arrow.png" class="right-arrow" @click.stop="switchBanner(1)" />
			<swiper class="device-swiper" :autoplay="false" :circular="true" :interval="50000" indicator-dots
				indicator-active-color="#333" :duration="500" :current="currentBanner" @change="setCurr">
				<swiper-item v-for="item in listdata" :key="item.key">
					<view @click="addDevice" class="device-swiper-item">
						<view class="device-swiper-item-content">
							{{ $t(item.content) }}
						</view>
						<chaceImage class="device-swiper-item-image" mode="widthFix" :style="{
                width: `${item.width * 2}rpx`
              }" :fileMd5="item.image" :url='item.image'>
						</chaceImage>
					</view>
				</swiper-item>

				<!-- <swiper-item v-for="item in DEVICE_CONFIG" :key="item.key">
					<view @click="addDevice" class="device-swiper-item">
						<view class="device-swiper-item-content">
							{{ $t(item.content) }}
						</view>
						<image class="device-swiper-item-image" mode="widthFix" :style="{
				  width: `${item.width * 2}rpx`
				}" :src="item.image" />
					</view>
				</swiper-item> -->
			</swiper>

			<view v-if="false" class="device-swiper">
				<image src="/static/images/common/left-arrow.png" class="left-arrow" @click.stop="switchBanner(-1)" />
				<image src="/static/images/common/left-arrow.png" class="right-arrow" @click.stop="switchBanner(1)" />
				<view :class="['device-swiper-item', swiperSwitched ? '' : 'hidden']">
					<view class="device-swiper-item-content">
						{{ $t(currentDevice.content) }}
					</view>
					<image class="device-swiper-item-image" mode="widthFix" :style="{
              width: `${currentDevice.width * 2}rpx`
            }" :src="currentDevice.image" />
				</view>
			</view>
		</view>

		<view class="home-default__actions">
			<!-- 按钮 -->
			<view class="home-default__actions-button" @click="addDevice">
				{{ $t('homePage.default.addDevices') }}
			</view>
		</view>

		<!-- 文案 -->
		<view class="home-default__hint">
			<view v-for="instruction in INSTRUCTIONS" :key="instruction.title" class="home-default__hint-fragment">
				<view class="title">{{ instruction.title }} </view>
				<template v-if="instruction.contents">
					<view v-for="content in instruction.contents" :key="content" class="content">
						{{ content }}
					</view>
				</template>
			</view>
		</view>
	</view>
</template>

<script>
	import GradientCircle from '@/components/gradient-circle/index'
	// import DEVICE_CONFIG from '../config'
	import chaceImage from '@/components/image-cache'

	export default {
		components: {
			GradientCircle,
			chaceImage
		},
		props: {
			listdata: {
				type: Array,
				default: ['']
			}
		},
		data() {
			return {
				currentBanner: 0,
				// DEVICE_CONFIG,
				// list: [1, 2, 3],
				intervalCount: 0, // 用于计算当前循环多少次
				swiperSwitched: false, // 用于动画
				intervalTask: null
			};
		},

		computed: {
			// 当前设备
			currentDevice() {
				return this.listdata[this.currentBanner]
			},
			// 指示
			INSTRUCTIONS() {

				return [{
					title: this.$t('homePage.default.instruction.title'),
					contents: [
						this.$t('homePage.default.instruction.one'),
						this.$t('homePage.default.instruction.two'),
						this.$t('homePage.default.instruction.three')
					]
				}]
			}
		},

		mounted() {
			this.$emit('switchDevice', this.currentDevice)
			this.initSwiper()
		},
		methods: {
			setCurr(e) {
				this.currentBanner = Number(e.detail.current) || e.currentTarget.dataset.index || 0
				this.$emit('switchDevice', this.currentDevice)
			},
			// 增加设备
			addDevice() {
				this.$emit('addDevice')
			},
			// 初始化
			initSwiper() {
				// const duration = 5000;
				this.swiperSwitched = true
				// this.intervalTask = setInterval(() => {
				// 	this.switchBanner()
				// }, duration)
			},

			// 切换设备
			switchBanner(move = 1) {
				this.swiperSwitched = false
				this.intervalCount = this.intervalCount + move;
				this.currentBanner = this.intervalCount % this.listdata.length
				this.$emit('switchDevice', this.currentDevice)
				// setTimeout(() => {
				// 	this.swiperSwitched = true
				// 	this.resetIntervalTask()
				// })
			},

			resetIntervalTask() {
				clearInterval(this.intervalTask)
				this.intervalTask = null
				const duration = 5000;
				this.intervalTask = setInterval(() => {
					this.switchBanner()
				}, duration)
			}
		},

		beforeDestroy() {
			clearInterval(this.intervalTask)
			this.intervalTask = null
		}
	}
</script>

<style lang="scss" scoped>
	.home-default {
		&__circle {
			position: absolute;
		}

		&__swiper {
			position: relative;

			.left-arrow,
			.right-arrow {
				position: absolute;
				width: 50rpx;
				height: 50rpx;
				z-index: 100;
				top: 50%;
			}

			.right-arrow {
				right: 0;
				transform: rotate(180deg);
			}

			.device-swiper {
				height: 710rpx;
				width: 100%;
				position: relative;
				overflow: hidden;

				&-item {
					position: relative;
					height: 100%;

					&.hidden {
						.device-swiper-item-image {
							animation: unset;
						}

						.device-swiper-item-content {
							animation: unset;
						}
					}

					&-image {
						animation: fade-in-image ease-in-out 0.66s;
						position: absolute;
						right: 0;
						bottom: 30rpx;
						width: 540rpx;
						height: auto;
					}

					&-content {
						animation: fade-in-content 0.66s;
						position: absolute;
						left: 32rpx;
						top: 58rpx;
						font-weight: bold;
						font-size: 32rpx;
						color: #C1C1C1;
						width: 340rpx;
						line-height: 44rpx;
					}

					@keyframes fade-in-image {
						0% {
							transform: translateX(100%);
							opacity: 0;
						}

						100% {
							transform: translateX(0);
							opacity: 1;
						}
					}

					@keyframes fade-in-content {
						0% {
							opacity: 0;
							transform: translateX(-100%);
						}

						100% {
							opacity: 1;
							transform: translateX(0);
						}
					}
				}

			}
		}

		&__actions {
			margin-top: 40rpx;

			&-button {
				height: 112rpx;
				color: #fff;
				background: linear-gradient(360deg, #4D4D4D 0%, #303030 100%);
				border-radius: 8px;
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 36rpx;
				margin: 32rpx 32rpx 0;
			}
		}


		// 提示
		&__hint {
			padding: 36rpx 32rpx;

			&-fragment {
				.title {
					color: #333;
					font-size: 32rpx;
					line-height: 44rpx;
				}

				.content {
					color: #333;
					color: #838181;
					line-height: 40rpx;
					font-size: 28rpx;
					margin-top: 18rpx;
				}
			}
		}
	}

	.home-default__circle {
		z-index: -1;
	}
</style>