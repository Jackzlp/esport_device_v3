<template>
	<view class="atmosphere-light-color-light">
		<view class="brightness scene-mode">
			<!-- <view class="scene-mode__title">mode</view> -->

			<view class="bottom" style="align-items: flex-start;">
				<view style="width: 100rpx;height: 100%;color: #fff;font-size: 40rpx;font-weight: 600;">
					Mod</view>
				<picker-view class="left_picker-view"
					:mask-style="'background-image: linear-gradient(rgba(53,53,53,0.8), rgba(53,53,53,0.8)),linear-gradient(rgba(53,53,53,0.8), rgba(53,53,53,0.8) !important'"
					indicator-class="picker-selected" :value="value" @change="handelModels">
					<picker-view-column>
						<view class="item_box" v-for="(item,index) in modes" :key="index">
							{{item.title}}
						</view>

					</picker-view-column>
				</picker-view>


				<view class="right_picker-view">
					<picker-view style="width: 100%;" indicator-class="npicker-selected" :value="value"
						@change="handelModels"
						:mask-style="'background-image: linear-gradient(rgba(53,53,53,0.8), rgba(53,53,53,0.8)),linear-gradient(rgba(53,53,53,0.8), rgba(53,53,53,0.8) !important'">
						<picker-view-column>
							<!-- <view class="item_box" v-for="(item,index) in modes">
								{{item.title}}
							</view> -->
							<view class="tunrouund_box" v-for="(item,index) in modes" :key="index">
								<image mode="aspectFill" src="/static/images/device/light_images/tunAround.png">


								</image>
							</view>
						</picker-view-column>
					</picker-view>
				</view>


			</view>
		</view>

		<!-- brightness -->
		<view class="speed scene-mode">
			<view class="scene-mode__title">
				{{ $t('atmosphereLightPage.sceneFunctions.speedChange') }}
			</view>
			<view class="bottom">

				<u-slider v-model="speedCopy" class="bottom__slider" active-color="#eee21b" :block-size="16" step="1"
					min="0" max="100" @change="changeSpeed" @changing="changeSpeedTick" />
				<view class="value">{{ speed }}%</view>
			</view>
		</view>

		<!-- 	<view class="brightness scene-mode">
			<view class="scene-mode__title">
				{{$t('atmosphereLightPage.order')}}
			</view>
			<view class="order_box">
				<view v-for="(item,index) in orderList" :class="item.status === true?'order_item_active':'order_item'"
					:style="item.style" @click="orderClick(index)"></view>
			</view>
		</view> -->
		<!-- <view class="brightness scene-mode">
			<view class="scene-mode__title">
				LEDS
			</view>
			<view class="bottom">
				
				<u-slider v-model="LEDS" class="bottom__slider" active-color="#333" :block-size="16" step="1" min="0"
					max="180" @change="changeBrightLED" @changing="changeBrightLEDTick" />
				<view class="value">{{ LEDS }}</view>
			</view>
		</view> -->
	</view>
</template>

<script>
	import {
		useDeviceStore
	} from '../../../../../store/device'
	import {
		calcSum,
		wData
	} from '../../../BLE/BLEfunction'
	import {
		mapState
	} from 'pinia'


	export default {
		name: 'AtmosphereLightColorful',
		props: {
			BLEData: {
				type: Object,
				default: null
			},
			firstGetBleData: {
				type: Boolean,
				default: true
			},
			hasChair: {
				type: Boolean,
				default: false
			},
			isGroup: {
				type: Boolean,
				default: false
			},
			brightNess: {
				type: Number,
				default: 100
			}
		},
		data() {
			return {
				value: [1],
				LEDS: 180,
				orderList: [{
						status: true,
						style: `background-image: linear-gradient(45deg ,#FF5656 10%, #84FF4D 40%,#419BFF 70%);`
					},
					{
						status: false,
						style: `background-image: linear-gradient(45deg ,#FF5656 10%,#419BFF  40%,#84FF4D 70%);`
					},
					{
						status: false,
						style: `background-image: linear-gradient(45deg ,#84FF4D  10%,#FF5656  40%,#419BFF 70%);`
					},
					{
						status: false,
						style: `background-image: linear-gradient(45deg ,#84FF4D  10%, #419BFF 40%, #FF5656 70%);`
					},
					{
						status: false,
						style: `background-image: linear-gradient(45deg ,#419BFF 10%, #FF5656  40%, #84FF4D 70%);`
					},
					{
						status: false,
						style: `background-image: linear-gradient(45deg ,#419BFF  10%, #84FF4D 40%, #FF5656 70%);`
					},
				],
				modes: [{
						title: 'Automaticloop',
						mode: 'Automatic loop',
						style: `background: linear-gradient(45deg, #FF5656 0%, #FFAC3B 24%, #FFE532 30%, #84FF4D 43%,#FFE532 66%,#FFAC3B 80%,#FF5656 90%); 
						-webkit-background-clip: text;
                        background-clip: text;color: transparent;`
					},
					{
						title: 'PositiveRainbow',
						mode: 'Positive Rainbow',
						style: `background: linear-gradient(45deg, #FF5656 10%, #FFAC3B 20%, #FFE532 30%, #84FF4D 43%,#419BFF 66%,#4B0082 80%,#660099 90%);-webkit-background-clip: text;
                        background-clip: text;color: transparent;`
					},
					{
						title: 'ReverseRainbow',
						mode: 'Reverse Rainbow',
						style: `background: linear-gradient(45deg, #660099 10%, #4B0082 20%, #419BFF 30%, #84FF4D 43%, #FFE532 66%,#FFAC3B 80%, #FF5656 90%);-webkit-background-clip: text;
                      background-clip: text;color: transparent;`
					}
				],
				orderIndex: 2,
				modeArr: ['0B', '0D', '0E', '0F'],
				forbidSend: false,
				isSend: false,
				brightness: 100,
				deviceStore: useDeviceStore()
			}
		},
		watch: {
			BLEData(newVal) {
				if (newVal) {
					this.handleBLEData(newVal)
				}
			},
			brightNess(newVal) {
				if (newVal) {
					this.brightness = newVal
					this.changeBrightness()
				}
			}
		},
		computed: {

			...mapState(useDeviceStore, ['speed']),

			// brightnessCopy: {
			// 	get() {
			// 		return this.brightness
			// 	},
			// 	set(res) {
			// 		this.setBrightness(res)
			// 	}
			// },
			speedCopy: {
				get() {
					return this.speed
				},
				set(res) {
					this.deviceStore.setSpeed(res)
				}
			},


		},
		mounted() {
			// this.handleBLEData(this.BLEData)
			this.hasCharsModel()
			this.handleFirstLanch()
		},

		methods: {
			// ...mapMutations('device', ['setSpeed']),

			changeBrightness() {
				let index = this.value[0]
				if (index != -1) {
					this.sendFn('lightChange', index)
				}
			},
			changeBrightnessTick() {
				// console.log('changeBrightnessTick', this.brightness)
				if (this.forbidSend) return
				this.forbidSend = true
				setTimeout(() => {
					this.forbidSend = false
				}, 300);
				this.changeBrightness()
			},
			changeSpeed() {
				let index = this.value[0]
				console.log(index)
				if (index != -1) {
					this.sendFn('speedChage', index)
				}
			},
			changeSpeedTick() {
				// console.log('changeSpeedTick', this.speed)
				if (this.forbidSend) return
				this.forbidSend = true
				setTimeout(() => {
					this.forbidSend = false
				}, 300);
				this.changeSpeed()
			},
			handleFirstLanch() {
				// this.setBrightness(this.BLEData.brightness || 100)
				this.deviceStore.setSpeed(this.BLEData.speed || 100)
				if (this.BLEData && this.BLEData.mode) {
					this.orderIndex = this.BLEData.order ? this.BLEData.order : 2
					this.LEDS = this.BLEData.LEDS ? this.BLEData.LEDS : 180
					// this.sendFn('order', 3)
					let index = this.modeArr.findIndex(item => item === this.BLEData.mode)
					this.sendFn(this.BLEData.mode, index === -1 ? 0 : index)
					this.value = [index === -1 ? 0 : index]
					console.log(index)
				} else {
					this.sendFn('Automatic loop', 1)
					this.value = [1]
				}
			},

			hasCharsModel() {
				var temArr = []
				for (let i = 0; i < 33; i++) {
					temArr.push({
						title: `${this.$t('esportChairPage.mode')}-${ (i + 1)}`,
						mode: this.$t('esportChairPage.mode') + (i + 1),
					})
				}
				this.modes = temArr
				this.modeArr = ['0B', '0D', '0E', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '2A',
					'2B', '2C', '2D', '2E', '2F', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '3A',
					'3B', '3C', '3D'
				]
			},
			changeBrightLED(value) {
				if (value < 15) {
					this.LEDS = 180
				} else {
					this.LEDS = value
				}
				this.sendFn('order', 3)
			},
			changeBrightLEDTick() {},
			handelModels(e) {
				console.log(e.detail.value)
				let currentModeIndex = e.detail.value[0]
				let model = this.modes[currentModeIndex].mode
				this.BLEData.mode = this.modeArr[currentModeIndex + 1]
				this.sendFn(model, currentModeIndex)
				this.value = e.detail.value
			},
			handleBLEData(bleData) {

				if (bleData) {
					let index = this.modeArr.findIndex(item => {
						return item === bleData.mode
					})
					if (index != -1) {
						this.value = [index]
					}
					this.orderList.map(item => {
						item.status = false
					})
					this.orderList[bleData.orderIndex ? bleData.orderIndex : 2].status = true
					// this.setBrightness(this.BLEData.brightness || 100)
					this.deviceStore.setSpeed(this.BLEData.speed || 100)
				}
			},
			sendFn(type, index) {
				let that = this
				if (this.isSend) return
				this.isSend = true
				let tempData = ''
				const order = this.orderIndex.toString(16).padStart(2, '0')
				const LED = this.LEDS.toString(16).padStart(2, '0')
				const light = this.brightness.toString(16).padStart(2, '0')
				const speed = this.speed.toString(16).padStart(2, '0')
				var dp = this.modeArr[index]
				console.log(dp)
				// if (dp === "0F") {
				// 	tempData = calcSum(`${dp}${LED}${order}`)
				// } else {
				tempData = calcSum(`${dp}00${light}${speed}`)
				// }
				if (this.hasChair) {
					this.BLEData.order = this.orderIndex
					this.BLEData.LEDS = this.LEDS
					this.BLEData.brightness = this.brightness
					this.BLEData.speed = this.speed
					this.BLEData.mode = dp
					this.$emit('changeBLEData', this.BLEData)
					setTimeout(() => {
						// console.log(that.isSend)
						that.isSend = false
					}, 200)
				}
				if (this.isGroup) {
					this.BLEData.brightness = this.brightness
					this.BLEData.currentMode = this.currentMode
					this.BLEData.speed = this.speed
					this.BLEData.scene = this.currentScene
					this.$emit('sceneNotice', tempData, "colorFul", this.BLEData)
					setTimeout(() => {
						// console.log(that.isSend)
						that.isSend = false
					}, 200)
					// wData2()
				} else {
					setTimeout(() => {
						wData(tempData, sres => {
							console.log('sendFnSuc', sres)
						}, err => {
							console.log('sendFnErr', err)
						}, )
						// console.log(that.isSend)
						that.isSend = false
					}, 50)
				}
			},

			orderClick(index) {
				this.orderList.map(item => {
					item.status = false
				})
				this.orderList[index].status = true
				this.orderIndex = index
				this.sendFn('order', 3)
			},
			// 检查是否是第一次打开应用
			isFirstOpen() {
				const firstOpenKey = 'FIRST_OPEN'; // 定义本地存储的key
				let isFirst = false;
				// 尝试从本地存储获取标识符
				const firstOpen = uni.getStorageSync(firstOpenKey);

				if (!firstOpen) {
					// 如果没有获取到，表明是第一次打开
					isFirst = true;
					// 设置标识符，下一次打开时不再是第一次
					uni.setStorageSync(firstOpenKey, 'true');
				}
				return isFirst;
			}

		}
	}
</script>

<style lang="scss">
	.atmosphere-light-color-light {
		border-radius: 16rpx;
		// box-shadow: 10rpx 10rpx 10rpx rgba(0, 0, 0, 0.3) ;

		.bottom {
			display: flex;
			justify-content: space-between;
			margin-top: 32rpx;
			align-items: center;

			&__slider {
				flex: 1;
				margin: 0 32rpx;
			}

			.left_picker-view {
				width: 50%;
				height: 300rpx;
				margin-top: 50rpx;
			}

			.right_picker-view {
				width: 80rpx;
				height: 350rpx;
				border: 4rpx solid #616161;
				border-radius: 16rpx;
				overflow: hidden;
				padding: 8rpx;
				padding-left: 12.5rpx;


				picker-view {
					width: 80rpx;
					height: 350rpx;

					.tunrouund_box {
						height: 200rpx;
						width: 95%;

						// background-color: red;
						// padding-left: 30%;
						image {
							width: 100%;
							height: 100%;
						}

					}
				}


			}

			image {
				width: 36rpx;
				height: 36rpx;
			}
		}

		.scene-mode {
			padding: 32rpx;
			background: #353535;
			border-radius: 16rpx;
			margin-top: 32rpx;
			box-shadow: 10rpx 10rpx 10rpx rgba(0, 0, 0, 0.3);

			&__title {
				color: #FFF;
				font-size: 36rpx;
				font-weight: 600;
			}
		}

		.rotater {
			&__scroller {
				width: 100%;
				height: 570rpx;
				display: flex;
				justify-content: center;
			}

			&__default-options {
				margin-top: 32rpx;
				display: flex;
				justify-content: space-between;
				align-items: center;

				.option {
					width: 56rpx;
					height: 56rpx;
					border-radius: 100%;
					position: relative;

					&:after {
						content: '';
						position: absolute;
						width: 48rpx;
						height: 48rpx;
						background: transparent;
						border-radius: 100%;
						top: 50%;
						left: 50%;
						margin-left: -32rpx;
						margin-top: -32rpx;
						border: 8rpx solid #F5F5F5;
					}

					&.active {
						&:after {
							width: 36rpx;
							height: 36rpx;
							background: transparent;
							border-radius: 100%;
							top: 50%;
							left: 50%;
							margin-left: -26rpx;
							margin-top: -26rpx;
							border: 8rpx solid #fff;
						}

					}
				}
			}
		}

		.item_box {
			display: flex;
			justify-content: center;
			align-items: center;
			height: 60px;
			color: transparent;
			-webkit-background-clip: text;
			background-clip: text;
			width: auto;
			background-color: black;
			font-size: 50rpx;
			font-weight: 500;
			color: transparent;
			color: white;
			// background-image: linear-gradient(45deg, #FF5656 35%, #FFAC3B 40%, #FFE532 45%, #84FF4D 50%, #FFE532 55%, #FFAC3B 60%, #FF5656 65%);
		}

		.value {
			width: 50rpx;
			color: #fff;
		}
	}

	// ::v-deep(.custom-mask) {
	// 	background-image:
	// 		linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.2)),
	// 		linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.2)) !important;
	// }

	.picker-selected {
		position: relative;
		height: 60px;
	}

	.picker-selected::before {
		content: '';
		position: absolute;
		top: 0px;
		border: #353535 solid 1rpx;
	}

	.picker-selected::after {
		content: '';
		position: absolute;
		bottom: 0;
		border: #353535 solid 1rpx // border: none;
	}

	/* 选中框样式（圆角+边框） */
	.npicker-selected {

		height: 200rpx !important;
		width: 50rpx !important;
		/* 强制高度等于图片高度 */
		border-radius: 12rpx;
		box-sizing: border-box;
		// margin-left: 12.5rpx;

		/* 圆角边框（替代伪元素方案） */
		border: 4rpx solid #a3a3a3 !important;
		background: rgba(255, 255, 255, 0.05);
		// padding-left: 2rpx;
		// padding-right: 2rpx;
		/* 可选：浅色背景突出选中态 */
	}

	// .npicker-selected {
	// 	position: relative;
	// 	height: 200px;
	// 	// border: 2rpx solid rgb(97, 97, 97);
	// }

	.npicker-selected::before {
		content: '';
		position: absolute;
		top: 0px;
		border: transparent solid 1rpx;
	}

	.npicker-selected::after {
		content: '';
		position: absolute;
		bottom: 0;
		border: transparent solid 1rpx // border: none;
	}

	.order_box {
		display: flex;
		justify-content: flex-start;
		align-items: center;

		.order_item {
			margin-left: 10rpx;
			width: 40px;
			height: 40px;
			border-radius: 50%;
			margin-top: 20rpx;
			border: 8rpx solid #353535;
		}

		.order_item_active {
			margin-left: 10rpx;
			width: 40px;
			height: 40px;
			border-radius: 50%;
			margin-top: 20rpx;
			border: 8rpx solid #353535;
		}
	}
</style>