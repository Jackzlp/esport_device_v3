<template>
	<view class="atmosphere-light-scene">
		<!-- brightness -->
		<view class="tabbar_box">
			<view v-for="(mode, modeindex) in PRESET_SCENES" :key="mode.title"
				:class="['tabbar_item', currentMode === modeindex ? 'select' : '']"
				@click="tabbar_child_click(modeindex)">
				{{ $t(mode.title) }}
			</view>
		</view>

		<!-- 颜色 -->
		<view class="scene-mode">
			<!-- 场景列表 -->
			<view class="scene-mode__list"
				v-if="PRESET_SCENES && PRESET_SCENES[currentMode] && PRESET_SCENES[currentMode].scenes">
				<view v-for="(scene, sceneIndex) in PRESET_SCENES[currentMode].scenes"
					:key="`${PRESET_SCENES[currentMode].title}-${sceneIndex}`" :class="[
		    'scene',
		    `linear${sceneIndex + 1}${scene.key === '_other'?'_other':scene.key === 'color_type'?'_type':scene.key === 'lcolor_type'?'_ltype':scene.key === 'Five'?'_Five':scene.key ==='normal'?'_normal':''}`,
		      currentScene === sceneIndex ? 'active' : ''
		  ]" @click="switchMode(currentMode, sceneIndex)" />
			</view>
		</view>

		<!-- Speed -->
		<view class="speed scene-mode"
			style="background-color: #414141;border-radius: 16rpx;border: 2rpx solid #FFF;box-shadow: 10rpx 10rpx 10rpx rgba(0, 0, 0, 0.3) ;">
			<view class="scene-mode__title">
				{{ $t('atmosphereLightPage.sceneFunctions.speedChange') }}
			</view>
			<view class="bottom">
				<slider @touchmove.native.passive="onTouchMove" :value="speed" class="bottom__slider"
					active-color="#eee21b" :block-size="26" step="1" min="1" max="100" @change="changeSpeed"
					@changing="changeSpeedTick">
				</slider>
				<view class="value">{{ speed }}%</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		PRESET_SCENES_NEW
	} from './constant'
	import {
		calcSum,
		wData,
		wData2
	} from '../../../BLE/BLEfunction'
	import {
		mapState
	} from 'pinia'

	import {
		useDeviceStore
	} from '../../../../../store/device';
	export default {
		name: 'AtmosphereLightScene',
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
				forbidSend: false,
				speed: 100,
				currentMode: 0,
				currentScene: 0,
				PRESET_SCENES: [],
				selectTabModel: '',
				brightness: 100,
				deviceStore: useDeviceStore(),
			}
		},
		computed: {
			...mapState(useDeviceStore, ['currentDevice']),
			has_key_color_version() {
				let special = uni.getStorageSync("chairInfo")
				const hasLightArr = JSON.parse(special).key_color_version ? JSON.parse(special).key_color_version : [
					'GTZ-510-RGB'
				]
				const model = this.currentDevice && this.currentDevice.model
				return hasLightArr.includes(model)
			},
			has_color_type() {
				let special = uni.getStorageSync("chairInfo")
				const hasLightArr = JSON.parse(special).color_type ? JSON.parse(special).color_type : [
					'GTP560-BLK-SP'
				]
				const model = this.currentDevice && this.currentDevice.model
				return hasLightArr.includes(model)
			},
			has_lcolor_type() {
				let special = uni.getStorageSync("chairInfo")
				const hasLightArr = JSON.parse(special).lcolortype ? JSON.parse(special).lcolortype : [
					'GTP801'
				]
				const model = this.currentDevice && this.currentDevice.model
				return hasLightArr.includes(model)
			},
			has_5_color_type() {
				let special = uni.getStorageSync("chairInfo")
				const hasLightArr = JSON.parse(special).FColortype ? JSON.parse(special).FColortype : [
					'GTP801'
				]
				const model = this.currentDevice && this.currentDevice.model
				return hasLightArr.includes(model)
			},
			has_normal_type() {
				let special = uni.getStorageSync("chairInfo")
				const hasLightArr = JSON.parse(special).normalList ? JSON.parse(special).normalList : [
					'T02-PINK'
				]
				const model = this.currentDevice && this.currentDevice.model
				return hasLightArr.includes(model)
			}
		},
		watch: {
			BLEData: {
				handler(newVal) {
					if (newVal) {
						this.speed = newVal.speed || 100;
						this.currentMode = newVal.currentMode
						this.currentScene = newVal.scene
						this.setInitType()
						this.$nextTick(() => {
							this.$forceUpdate()
						})
					}
				},
				deep: true,
				immediate: true
			},
			brightNess(newVal) {
				if (newVal !== undefined && newVal !== null) {
					this.brightness = newVal >= 0 ? newVal : 100
					this.sendFn('lightChange')
				}
			}
		},
		mounted() {
			// 初始化时检查BLEData是否存在
			if (this.BLEData) {
				this.deviceStore.setBrightness(this.BLEData.brightness || 100)
				this.speed = this.BLEData.speed || 100;
				this.currentMode = this.BLEData.currentMode || 0
				this.currentScene = this.BLEData.scene || 0
			}

			this.PRESET_SCENES = PRESET_SCENES_NEW()
			if (this.has_key_color_version) {
				this.PRESET_SCENES = PRESET_SCENES_NEW('other')
			}
			if (this.has_color_type) {
				this.PRESET_SCENES = PRESET_SCENES_NEW('color_type')
			}
			if (this.has_lcolor_type) {
				this.PRESET_SCENES = PRESET_SCENES_NEW('lcolor_type')
			}
			if (this.has_5_color_type) {
				this.PRESET_SCENES = PRESET_SCENES_NEW('Five')
			}
			if (this.has_normal_type) {
				this.PRESET_SCENES = PRESET_SCENES_NEW('normal')
			}
			this.setInitType()
		},
		methods: {
			setInitType() {
				if (this.firstGetBleData) return
				// 确保currentMode和currentScene有默认值
				const mode = this.currentMode ?? 0
				const scene = this.currentScene ?? 0
				this.switchMode(mode, scene, true)
				this.$nextTick(() => {
					this.$forceUpdate()
				})
			},
			onSliderMove(value) {
				// 处理滑块值变化
			},
			tabbar_child_click(modeindex) {
				if (this.currentMode === modeindex) return
				this.currentMode = modeindex
				this.currentScene = 0
				this.$emit("changCurrentBleData", this.currentMode, this.currentScene)
				this.sendFn('switchMode')
			},
			switchMode(modeIndex, sceneIndex, init) {
				// 确保参数有默认值
				const newModeIndex = modeIndex ?? 0
				const newSceneIndex = sceneIndex ?? 0

				if (this.currentMode === newModeIndex && this.currentScene === newSceneIndex && !init) return

				this.currentMode = newModeIndex
				this.currentScene = newSceneIndex

				this.sendFn('switchMode')
				this.$emit("changCurrentBleData", this.currentMode, this.currentScene)
			},
			sendFn(type) {
				let tempData = ''
				// 确保变量有默认值，避免toString()报错
				const light = (this.brightness || 0).toString(16).padStart(2, '0')
				const speed = (this.speed || 0).toString(16).padStart(2, '0')
				const scene = ((this.currentScene || 0) + 1).toString(16).padStart(2, '0')
				const modeArr = ['07', '08', '09']
				const dp = modeArr[this.currentMode || 0] // 确保currentMode有效

				// 仅在BLEData存在时才修改其属性
				if (this.hasChair && this.BLEData) {
					this.BLEData.brightness = this.brightness
					this.BLEData.currentMode = this.currentMode
					this.BLEData.speed = this.speed
					this.BLEData.scene = this.currentScene
					this.$emit('changeBLEData', this.BLEData)
				}

				switch (type) {
					case 'switchMode':
						tempData = calcSum(`${dp}${scene}${light}${speed}`)
						break;
					case 'lightChange':
						tempData = calcSum(`${dp}${scene}${light}${speed}`)
						break;
					case 'speedChage':
						tempData = calcSum(`${dp}${scene}${light}${speed}`)
						break;
					default:
						break;
				}

				if (this.isGroup && this.BLEData) {
					this.BLEData.brightness = this.brightness
					this.BLEData.currentMode = this.currentMode
					this.BLEData.speed = this.speed
					this.BLEData.scene = this.currentScene
					this.$emit('sceneNotice', tempData, "scene", this.BLEData)
				} else if (tempData) {
					setTimeout(() => {
						wData(tempData, sres => {
							console.log('sendFnSuc', sres)
						}, err => {
							console.log(tempData, type)
							console.log('sendFnErr', err)
						})
					}, 200)
				}
			},
			changeBrightness() {
				console.log('changeBrightness', this.brightness)
				this.sendFn('lightChange')
			},
			changeBrightnessTick() {
				console.log('changeBrightnessTick', this.brightness)
				if (this.forbidSend) return
				this.forbidSend = true
				setTimeout(() => {
					this.forbidSend = false
				}, 300);
				this.changeBrightness()
			},
			changeSpeed(e) {
				if (!e || !e.detail) {
					return
				}

				this.speed = e.detail.value
				// 仅在BLEData存在时才修改其属性
				if (this.BLEData) {
					this.BLEData.speed = this.speed
					this.$emit('changeBLEData', this.BLEData)
				}

				this.sendFn('speedChage')
			},
			changeSpeedTick(e) {
				if (!e || !e.detail) {
					return
				}

				if (this.forbidSend) return
				this.forbidSend = true
				this.speed = e.detail.value

				// 仅在BLEData存在时才修改其属性
				if (this.BLEData) {
					this.BLEData.speed = this.speed
				}

				setTimeout(() => {
					this.forbidSend = false
				}, 300);

				this.changeSpeed(e)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.atmosphere-light-scene {
		.tabbar_box {
			display: flex;
			justify-content: space-between;
			align-items: center;
			height: 150rpx;

			.tabbar_item {
				background-color: #2d2d2d;
				border: 2rpx solid #898989;
				border-radius: 10rpx;
				width: 200rpx;
				color: #fff;
				padding: 10rpx;
				font-size: 26rpx;
				min-height: 75rpx;
				text-align: center;
				box-shadow: 5rpx 5rpx 5rpx rgba(0, 0, 0, 0.3);
				display: flex;
				justify-content: center;
				align-items: center;

				&.select {
					background-color: #3d3d3d;
				}
			}
		}

		.bottom {
			display: flex;
			justify-content: space-between;
			margin-top: 32rpx;
			align-items: center;
			padding-right: 32rpx;

			&__slider {
				width: 80%;
				padding-left: 20rpx;
				height: 10rpx;
			}

			image {
				width: 36rpx;
				height: 36rpx;
			}
		}

		.scene-mode {
			padding: 20rpx;
			margin-top: 12rpx;

			&__title {
				color: #fff;
				font-size: 36rpx;
				font-weight: 600;
			}

			&__list {
				display: flex;
				align-items: center;
				flex-wrap: wrap;

				.scene {
					width: 90rpx;
					height: 90rpx;
					border-radius: 100%;
					border: 8rpx solid #414141;
					margin-right: 20rpx;
					margin-top: 20rpx;
					box-shadow: 10rpx 10rpx 10rpx rgba(0, 0, 0, 0.3);

					&:nth-child(6n + 6) {
						margin-right: 0;
					}

					&:nth-child(n + 7) {
						margin-top: 20 rpx;
					}

					&.linear1 {
						background: linear-gradient(137deg,
								#ff5656 0%,
								#ffac3b 14%,
								#ffe532 30%,
								#84ff4d 43%,
								#59ffc4 58%,
								#419bff 76%,
								#ff5fff 87%,
								#ff6262 100%);
					}

					&.linear2 {
						background: linear-gradient(313deg, #FF1E1E 0%, #FFDFCF 100%);
					}

					&.linear3 {
						background: linear-gradient(322deg, #1E90FF 0%, #CFE8FF 100%);
					}

					&.linear4 {
						background: linear-gradient(322deg, #16CD51 0%, #B2FFAF 100%);
					}

					&.linear5 {
						background: linear-gradient(313deg, #FFDE1E 0%, #FFEFCF 100%);
					}

					&.linear6 {
						background: linear-gradient(322deg, #FF00D0 0%, #FF00D0 100%);
					}

					&.linear7 {
						background: linear-gradient(140deg, #00e4ff 0% 0%, #00e4ff 100%);
					}

					&.linear8 {
						background: linear-gradient(322deg, #EDEDED 0%, #FFFFFF 100%);
					}

					&.linear9 {
						background: linear-gradient(140deg, #FF0000 0%, #00FF00 100%);
					}

					&.linear10 {
						background: linear-gradient(140deg, #FF0000 0%, #0000FF 100%);
					}

					&.linear7_normal {
						background: linear-gradient(313deg, #99FF39 0%, #D1FFCF 100%);
					}

					&.linear8_normal {
						background: linear-gradient(140deg, #FF1E1E 0%, #16CD51 100%);
					}

					&.linear9_normal {
						background: linear-gradient(140deg, #FF1E1E 0%, #0000FF 100%);
					}

					&.linear10_normal {
						background: linear-gradient(140deg, #94F59D 0%, #5AADFF 100%);
					}

					&.linear7_other {
						background: linear-gradient(140deg, #00e4ff 0% 0%, #00e4ff 100%);
					}

					&.linear8_other {
						background: linear-gradient(140deg, #00ffbb 0%, #00ffbb 100%);
					}

					&.linear7_ltype {
						background: linear-gradient(140deg, #007F80 0%, #007F80 100%);
					}

					&.linear8_ltype {
						background: linear-gradient(140deg, #227700 0% 0%, #227700 100%);
					}

					&.linear9_ltype {
						background: linear-gradient(140deg, #FF0000 0%, #00FF00 100%);
					}

					&.linear10_ltype {
						background: linear-gradient(140deg, #FF0000 0%, #0000FF 100%);
					}

					&.linear5_Five {
						background: linear-gradient(313deg, #FFFF00 0%, #FFFF00 100%);
					}

					&.linear7_Five {
						background: linear-gradient(140deg, #007F80 0%, #007F80 100%);
					}

					&.linear8_Five {
						background: linear-gradient(140deg, #EDEDED 0%, #EDEDED 100%);
					}

					&.linear9_Five {
						background: linear-gradient(140deg, #FF0000 0%, #00FF00 100%);
					}

					&.linear10_Five {
						background: linear-gradient(140deg, #FF0000 0%, #0000FF 100%);
					}

					&.linear6_type {
						background: linear-gradient(322deg, #FF00D0 0%, #FF00D0 100%);
					}

					&.linear7_type {
						background: linear-gradient(140deg, #05FaFF 0% 0%, #05FaFF 100%);
					}

					&.linear8_type {
						background: linear-gradient(140deg, #808080 0%, #808080 100%);
					}

					&.linear9_type {
						background: linear-gradient(140deg, #FC0301 0%, #16CD51 100%);
					}

					&.linear10_type {
						background: linear-gradient(140deg, #94F59D 0%, #5AADFF 100%);
					}

					&.active {
						border: 8rpx solid #F7F7F7;
					}
				}
			}
		}

		.value {
			width: 50rpx;
			color: #fff;
		}
	}
</style>