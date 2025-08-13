<template>
	<view class="atmosphere-light-rhythm">
		<view class="record-start">
			<view class="record-start__content">
				{{ $t('atmosphereLightPage.rhythmFunctions.mobilePhoneRadio') }}
			</view>
			<view class="record-start__button">
				<image v-if="isRecording" src="/static/images/device/light_images/play_mune.png"
					@click="stopRecording" />
				<image v-else src="/static/images/device/light_images/pasue_mune.png" @click="startRecording" />
			</view>
		</view>
		<!-- brightness -->
		<view class="sensivitity scene-mode">
			<view class="scene-mode__title">
				{{ $t('atmosphereLightPage.rhythmFunctions.sensitivity') }}
			</view>
			<view class="bottom">

				<u-slider v-model="sensitivity" class="bottom__slider" active-color="#eee21b" :block-size="26" step="1"
					min="0" max="100" @change="handleChangeSensitivity" />
				<view class="value">{{ sensitivity }}%</view>
			</view>
		</view>
	</view>
</template>

<script>
	// const recorderManager = uni.getRecorderManager();
	import {
		calcSum,
		wData
	} from '../../../BLE/BLEfunction'
	export default {
		name: 'AtmosphereLightRhythm',
		props: {
			sensitivityCopy: {
				type: Number,
				default: 50
			},
			switchOn: {
				type: Boolean,
				default: true
			},
			isGroup: {
				type: Boolean,
				default: false
			},
			has_local_rhythm: {
				type: Boolean,
				default: false
			},
			local_record: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				audioHelper: null,
				sensitivity: 50, // 灵敏度
				isRecording: false, // 是否正在录音
				myTimer: null
			}
		},
		watch: {
			switchOn(newVal) {
				if (!newVal) {
					this.stopRecording()
				}
			},
			local_record(newVal) {
				console.log(newVal)
				if (newVal) {
					this.isRecording = true
				}
			}
		},
		mounted() {
			setTimeout(() => {
				this.audioHelper = uni.requireNativePlugin('L-GetDecibel')
				this.sensitivity = this.sensitivityCopy
			}, 500)

			if (this.has_local_rhythm) {
				this.isRecording = this.local_record
			}
		},

		methods: {
			startRecording() {
				if (!this.switchOn) {
					this.$emit('startPlaying')
				}
				this.isRecording = true
				if (this.has_local_rhythm) {
					this.sendBleFn()
				} else {
					if (this.audioHelper) {
						this.audioHelper.getDecibel({
							intervalTime: 1000
						}, res => {
							const sen = 80 - (this.sensitivity / 2)
							console.log('startRecording', res.db)
							if (Number(res.db) > sen) {
								if (this.myTimer) return
								this.myTimer = setInterval(() => {
									if (!this.switchOn) return
									this.sendBleFn()
								}, 200)
							} else {
								clearInterval(this.myTimer)
								this.myTimer = null
							}
						})
					}
				}
			},
			handleChangeSensitivity() {
				if (!this.switchOn) {
					this.$emit('startPlaying')
				}
				this.sendBleFn()
			},
			sendBleFn() {

				if (this.has_local_rhythm) {
					let tempData = ''
					tempData = calcSum(`3E${this.getRandomHexColor()}${this.sensitivity.toString(16).padStart(2, '0')}`)
					if (this.isGroup) {
						this.$emit('sceneNotice', tempData, "rhythm", '')
						// wData2()
					} else {
						wData(tempData, sres => {
							console.log('sendFnSuc', sres)
						}, err => {
							console.log('sendFnErr', err)
						})
					}
				} else {
					let tempData = ''
					tempData = calcSum(`0A${this.getRandomHexColor()}${this.sensitivity.toString(16).padStart(2, '0')}`)
					if (this.isGroup) {
						this.$emit('sceneNotice', tempData, "rhythm", '')
						// wData2()
					} else {
						wData(tempData, sres => {
							console.log('sendFnSuc', sres)
						}, err => {
							console.log('sendFnErr', err)
						})
					}
				}
			},
			getRandomHexColor() {
				const letters = '0123456789ABCDEF';
				let color = '';
				for (let i = 0; i < 6; i++) {
					color += letters[Math.floor(Math.random() * 16)];
				}
				return color;
			},

			stopRecording() {
				if (this.has_local_rhythm) {
					let tempData = ''
					tempData = calcSum(`3F${this.getRandomHexColor()}${this.sensitivity.toString(16).padStart(2, '0')}`)
					wData(tempData, sres => {
						console.log('sendFnSuc', sres)
					}, err => {
						console.log('sendFnErr', err)
					})
					this.$emit('local_record', false)
					this.isRecording = false
				} else {
					this.audioHelper.stop()
					this.isRecording = false
					clearInterval(this.myTimer)
					this.myTimer = null
				}
			}
		},
		beforeDestroy() {
			console.log('执行了没有，关闭律动')
			setTimeout(() => {
				this.audioHelper = null
			}, 500)
			this.stopRecording()
		},
		destroyed() {
			console.log('this.audioHelper', this.audioHelper)
		}
	}
</script>


<style lang="scss" scoped>
	.atmosphere-light-rhythm {
		border-radius: 16rpx;
		margin-top: 20rpx;
		// box-shadow: 10rpx 10rpx 10rpx rgba(0, 0, 0, 0.3) ;

		.record-start {
			display: flex;

			background-color: #414141;
			padding: 40rpx;
			border-radius: 16rpx;
			align-items: center;
			justify-content: space-between;
			color: #fff;
			font-weight: 600;
			box-shadow: 10rpx 10rpx 10rpx rgba(0, 0, 0, 0.3);

			&__content {
				font-size: 36rpx;

			}

			&__button {
				width: 200rpx;
				height: 100rpx;
				border-radius: 16rpx;
				border: 2rpx solid #eee21b;
				display: flex;
				justify-content: center;
				align-items: center;

				image {
					width: 50rpx;
					height: 50rpx;
				}
			}
		}

		.bottom {
			display: flex;
			justify-content: space-between;
			margin-top: 32rpx;
			align-items: center;

			&__slider {
				flex: 1;
				margin: 0 32rpx;
			}

			image {
				width: 36rpx;
				height: 36rpx;
			}
		}

		.scene-mode {
			padding: 32rpx;
			background: #2c2c2c;
			box-shadow: 10rpx 10rpx 10rpx rgba(0, 0, 0, 0.3);
			border-radius: 16rpx;
			margin-top: 32rpx;
			border: 2rpx solid #fff;

			&__title {
				color: #fff;
				font-size: 36rpx;
				font-weight: 600;
			}
		}

		.value {
			width: 50rpx;
			color: #fff;
		}

	}
</style>