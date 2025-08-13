<template>
	<!-- 倒计时 -->
	<view class="count-down-task">
		<view class="ceter_name_box">
			<view class="ceter_name_box_left" @click="showTimerDateDialog">
				<!-- <view class="battery"> -->
				<image style="margin-right: 10rpx;" src="/static/images/device/light_images/light_countDownTimer.png">
				</image>
				<view>{{$t('countDownTask.title')}}</view>
				<!-- </view> -->
			</view>
			<view class="ceter_name_box_right">
				<!-- <view style="width: 100rpx;flex-shrink: 1;">NOW PLAYING</view> -->
				<view style="font-size: 36rpx;">
					{{ currentDevice && currentDevice.name }}
				</view>
			</view>
		</view>

		<view class="line" v-if="remainingTime"></view>
		<view class="function-bar" v-if="remainingTime" :style="{backgroundColor:`${StatusColor}`}">





			<view class="function-bar-time">
				<image mode="aspectFit" src="/static/images/device/light_images/countDownBg.png"></image>
				<u-count-down ref="countDown" :time="remainingTime" format="DD:HH:mm:ss" auto-start millisecond
					@change="handleTimeChange">
					<view class="time">
						<view class="time-item">
							<text
								class="time-item__value">{{ timeData.hours >= 10 ? timeData.hours : '0'+timeData.hours }}
							</text>

						</view>

						<view class="time-item">
							<text
								class="time-item__value">{{ timeData.minutes >= 10 ? timeData.minutes : '0'+timeData.minutes }}
							</text>

						</view>

						<text class="time-item">
							<text
								class="time-item__value">{{ timeData.seconds >= 10 ? timeData.seconds : '0'+timeData.seconds }}</text>

						</text>
					</view>
				</u-count-down>
			</view>

			<image @click.stop="handleShut" class="right_image"
				src="/static/images/device/light_images/countDown_clock.png">
			</image>


		</view>

		<!-- 时间选择器 -->

		<u-datetime-picker :modelValue="dateTime" :show="isShowTimerDateDialog" :close-on-click-overlay="true"
			:min-date="0" :max-date="new Date().getTime()" mode="time" :confirm-text="$t('confirm')"
			:cancel-text="$t('cancel')" @cancel="isShowTimerDateDialog = false" @close="isShowTimerDateDialog = false"
			@confirm="confirmTimersDate" />
	</view>
</template>

<script>
	import {
		calcSum,
		wData
	} from '../../../BLE/BLEfunction'
	import {

		mapState
	} from 'pinia'
	import {
		useDeviceStore
	} from '../../../../../store/device'
	export default {
		props: {
			switchOn: {
				type: Boolean,
				required: true
			},
			initCount: {
				type: String,
				default: ''
			},
			StatusColor: {
				type: String,
				default: '#414141'
			}

		},
		data() {
			return {
				// 单位毫秒
				remainingTime: 0,
				timeData: {},
				isShowTimerDateDialog: false,
				dateTime: '',
				bacColor: '#414141',
				deviceStore: useDeviceStore()

			}
		},
		computed: {
			...mapState(useDeviceStore, ['currentDevice', 'devMode']),
		},

		watch: {
			initCount(newVal) {
				this.initRemainingTime(newVal)
			},
			switchOn(newVal) {
				// 如果在倒计时期间调整了开关，此时应该终止倒计时
				this.remainingTime = 0
			},
			// StatusColor(newVal){
			// 	console.log("BBBBBBB")
			// 	console.log(newVal)
			// 	this.bacColor = newVal
			// }

		},


		mounted() {
			// 初始化倒计时的时间
			this.initRemainingTime()
		},

		methods: {
			// 初始化剩余时间
			initRemainingTime(initCount) {

				if (initCount && initCount !== '000000') {
					let hour = parseInt(initCount.slice(0, 2), 16)
					let min = parseInt(initCount.slice(2, 4), 16)
					let sec = parseInt(initCount.slice(4, 6), 16)
					hour = hour * 60 * 60 * 1000
					min = min * 60 * 1000
					sec = sec * 1000
					this.remainingTime = hour + min + sec
				}
			},

			// 时间变化
			handleTimeChange(e) {
				this.timeData = e

				// 计算当前剩余时间
				const days = e.days * 24 * 60 * 60 * 1000
				const hours = e.hours * 60 * 60 * 1000
				const minutes = e.minutes * 60 * 1000
				const seconds = e.seconds * 1000
				const milliseconds = e.milliseconds

				const remainingTime = days + hours + minutes + seconds + milliseconds


				if (remainingTime === 0) {
					this.remainingTime = 0;
					this.toggleCountDownTask()

				}
			},

			// 展示timer的弹窗
			showTimerDateDialog() {
				if (this.remainingTime) return
				this.isShowTimerDateDialog = true
			},

			// 确定当前的时间
			confirmTimersDate(e) {
				const date = e.value

				const hours = +date.split(':')[0]
				const minutes = +date.split(':')[1]

				if (!hours && !minutes) return this.$toast({
					content: 'Please select a time',
					type: 'info'
				})

				this.remainingTime = hours * 60 * 60 * 1000 + minutes * 60 * 1000
				this.isShowTimerDateDialog = false
				this.sendBleFn(hours, minutes)

			},

			sendBleFn(hours, minutes) {
				const countDownHour = hours.toString(16).padStart(2, '0')
				const countDownMin = minutes.toString(16).padStart(2, '0')
				const countDownSec = '00'
				const tempData = calcSum(`0C${countDownHour}${countDownMin}${countDownSec}`)
				wData(tempData, sres => {
					console.log('sendFn', sres)
				})
			},

			// 关闭
			handleShut() {
				this.remainingTime = 0
				// this.$emit('shut')


				this.sendBleFn(0, 0)
			},

			// 切换倒计时任务状态
			toggleCountDownTask() {
				this.switchOn ? this.stop() : this.start()
			},

			start() {
				// this.$emit('update:switchOn', !this.switchOn)
				this.$refs.countDown.start();
			},
			// 暂停
			stop() {
				// this.$emit('update:switchOn', !this.switchOn)
				this.$refs.countDown.pause();
			}
		}
	}
</script>

<style lang="scss">
	.count-down-task {
		.line {
			height: 1rpx;
			margin-top: 20rpx;
			margin-bottom: 20rpx;
			background: repeating-linear-gradient(to right,
					#787878 0 10rpx,
					transparent 10rpx 15rpx);
		}

		.ceter_name_box {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-top: 10rpx;



			&_left {
				display: flex;
				justify-content: flex-start;
				align-items: center;
				width: 250rpx;
				height: 70rpx;
				color: white;
				font-size: 24rpx;

				image {
					width: 40rpx;
					height: 40rpx;
				}

				// .battery {
				// 	width: 200rpx;
				// 	height: 70rpx;
				// 	margin-top: 10rpx;

				// 	border: 1px dashed #787878;

				// 	border-radius: 12rpx;
				// 	display: flex;
				// 	justify-content: flex-start;
				// 	align-items: center;
				// 	color: white;


				// }
			}

			&_right {
				display: flex;
				justify-content: flex-end;
				align-items: center;
				color: white;
				font-weight: bold;
				font-size: 26rpx;
				width: calc(100% - 280rpx);
				flex-shrink: 0;
			}
		}

		.function-bar {
			// margin: 32rpx 32rpx 0;
			// background: #414141;
			// padding: 24rpx 32rpx;
			border-radius: 16rpx;
			display: flex;
			justify-content: space-around;
			align-items: center;



			&-header {
				display: flex;
				justify-content: space-between;
				border-radius: 16rpx;
				align-items: center;

				&__icon {
					background: linear-gradient(360deg, #4D4D4D 0%, #303030 100%);
					border-radius: 100%;
					width: 64rpx;
					height: 64rpx;
					box-sizing: border-box;
					padding: 12rpx;

					image {
						width: 40rpx;
						height: 40rpx;
					}
				}


				&__arrow-right {
					width: 13.5px;
					height: 13.5px;
				}


				&__content {
					margin-left: 20rpx;
					font-weight: bold;
					font-size: 36rpx;
					flex: 1;
				}

				&__shut {
					color: #DF0001;
					font-size: 36rpx;
				}
			}

			&-time {
				// margin-top: 20rpx;
				// border-top: 2rpx solid #E2E2E2;
				// padding: 30rpx 0 0;
				position: relative;
				width: 450rpx;
				height: 130rpx;


				image {
					position: absolute;
					left: 0;
					top: 0;
					width: 100%;
					height: 100%;

				}


				.time {
					width: 450rpx;
					height: 130rpx;
					// background-color: yellow;

					&__splitter {
						padding: 28rpx 28rpx 0;
					}

					display: flex;
					justify-content: center;

					&-item {
						display: flex;
						// flex-direction: column;
						justify-content: space-between;

						align-items: center;
						width: 150rpx;

						&__value {
							// background: #F7F7F7;
							border-radius: 16rpx;
							height: 130rpx;
							width: 150rpx;
							display: flex;
							align-items: center;
							justify-content: center;
							color: #fff;
							font-size: 60rpx;
							font-weight: 600;
						}

						&__mark {
							margin: 8rpx;
							color: #838181;
							font-size: 20rpx;
						}

						// display: flex;
						// flex-direction: column;
						// justify-content: center;

						// &__value {
						// 	background: #F7F7F7;
						// 	border-radius: 16rpx;
						// 	height: 130rpx;
						// 	width: 150rpx;
						// 	display: flex;
						// 	align-items: center;
						// 	justify-content: center;
						// 	color: #fff;
						// 	font-size: 60rpx;
						// 	font-weight: 600;
						// 	// background-color: yellow;

						// }

						// &__mark {
						// 	margin: 8rpx;
						// 	color: #838181;
						// 	font-size: 20rpx;
						// }
					}
				}
			}

			&-actions {
				text-align: center;
				padding: 16rpx 0;

				.turn-button {
					padding: 10rpx 26rpx;
					background: #F7F7F7;
					display: inline-flex;
					align-items: center;
					color: #838181;
					font-size: 28rpx;
					border-radius: 16rpx;

					&.active {
						color: #333;
					}

					image {
						width: 28rpx;
						height: 28rpx;
						margin-right: 8rpx;
					}
				}
			}
		}
	}

	.right_image {
		width: 80rpx;
		height: 80rpx;
		// margin-: 60rpx;
	}
</style>