<template>
	<view class="atmosphere-light-color-light">


		<view class="rotater scene-mode">
			<view class="scene-mode__title">
				{{ $t('atmosphereLightPage.colorLightFunctions.colorLightMode') }}
			</view>
			<!--  -->
			<view class="rotater__scroller">
				<!-- 待定 -->
				<RadialColorPicker :hasChair="hasChair" v-bind="color" :pellucidity="pellucidity" @change="onInput" />
			</view>
			<view class="rotater__slider bottom">
				<image :src="'./images/opacity.png'" />
				<u-slider v-model="pellucidity" class="bottom__slider" inactive-color="#6C6C6C" active-color="#ededed"
					:block-size="20" step="1" min="0" max="100" @change="handleChangeLuminosity"
					@changing="handleChangeLuminosityTick" />



				<view class="value">{{ pellucidity }}%</view>
			</view>
			<view class="rotater__default-options">
				<view v-for="(option, index) in defaultOptions" :key="option.background"
					:class="['option', option.background === hex ? 'active' : '']" :style="{
            background: option.background,
          }" @click="switchOptions(index)" />
			</view>
		</view>
	</view>
</template>

<script>
	import RadialColorPicker from '@/components/radial-color-picker'
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
		name: 'AtmosphereLightColorLight',
		components: {
			RadialColorPicker
		},
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
				deBounds: false,
				forbidSend: false,
				pellucidity: 55,
				activeOptionIndex: '',
				deviceStore: useDeviceStore(),
				// 默认选项
				defaultOptions: [{
						background: '#FC0301'
					},
					{
						background: '#0100FA'
					},
					{
						background: '#0AFE0A'
					},
					{
						background: '#FFFF00',
						// background:'#FF0088'
					},
					{
						background: '#FF00FC'
					},
					{
						background: '#00FEFE'
					}
				],

				color: {
					hue: 100,
					saturation: 100,
					luminosity: 50,
					alpha: 1
				},

				// 初始颜色
				hex: '#FC0301',
				brightness: 100
			}
		},
		computed: {
			// ...mapState('device', ['brightness']),
			// brightnessCopy: {
			// 	get() {
			// 		return this.brightness
			// 	},
			// 	set(res) {
			// 		this.setBrightness(res)
			// 	}
			// },

		},
		watch: {
			BLEData() {
				this.handleBLEData()
			},
			brightNess(newVal) {
				if (newVal) {
					this.brightness = newVal
					this.sendFn('lightChange')
				}
			}
		},
		mounted() {

			if (this.hasChair) {
				this.defaultOptions[3].background = '#FF0088'
			}

			this.handleBLEData()
			this.setInitType()
		},

		methods: {

			setInitType() {
				if (this.firstGetBleData) return
				if (this.activeOptionIndex) {
					this.switchOptions(this.activeOptionIndex, true)
				} else {
					this.switchOptions(0, true)
				}

			},
			handleBLEData() {
				// console.log('BLEData-color', this.BLEData)
				console.log("AAAAAAAA")
				const newVal = this.BLEData
				if (newVal) {
					// this.setBrightness(newVal.brightness)
					console.log(newVal)
					if (newVal.currentRGB) {
						const index = this.defaultOptions.findIndex(el => {
							return el.background.toLocaleLowerCase() ===
								`#${newVal.currentRGB.toLocaleLowerCase()}`
						})
						if (index < 0) {
							this.hex = `#${newVal.currentRGB}`
						} else {
							this.activeOptionIndex = index
							this.hex = this.defaultOptions[this.activeOptionIndex].background
							// console.log(this.hex)
						}
					} else {
						this.hex === '#'
					}
					if (this.hex === '#') {
						this.hex = '#FC0301'
					}
					const hueOptions = this.hexToHsla(this.hex)
					this.color.hue = hueOptions.hue
					this.pellucidity = parseInt(hueOptions.saturation)
					this.$forceUpdate()
				}
			},
			// 切换
			switchOptions(index, init) {
				// if (!init) return
				this.activeOptionIndex = index
				this.hex = this.defaultOptions[this.activeOptionIndex].background
				const hueOptions = this.hexToHsla(this.hex)
				this.color.hue = hueOptions.hue
				this.pellucidity = this.pellucidity ? this.pellucidity : 100
				this.sendFn('singerColorChange')
			},
			changeBrightness() {
				console.log('changeBrightness', this.brightness)
				if (this.forbidSend) return
				this.forbidSend = true
				setTimeout(() => {
					this.forbidSend = false
				}, 300);
				this.BLEData.brightness = this.brightness
				// this.$emit('changeBrightness', this.brightness)
				this.$emit('changeBLEData', this.BLEData)
				this.sendFn('lightChange', true)
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
			sendFn(type, important) {
				// console.log('this.hex', this.hex)
				if (this.deBounds && !important) return
				this.deBounds = true
				setTimeout(() => {
					this.deBounds = false
				}, 100)
				const hex = this.hex.replace('#', '')
				let tempData = ''
				// const currentColor= hex || this.defaultOptions[this.activeOptionIndex].background.slice(1, 7)
				const light = this.brightness.toString(16).padStart(2, '0')

				if (this.hasChair) {
					this.BLEData.currentRGB = this.hex.replace('#', '')
					this.BLEData.brightness = this.brightness
					this.$emit('changeBLEData', this.BLEData)
				}
				switch (type) {
					case 'singerColorChange':
						tempData = calcSum(`02${hex}${light}`)
						break;
					case 'lightChange':
						tempData = calcSum(`02${hex}${light}`)
						break;
					default:
						break;
				}

				if (this.isGroup) {
					this.BLEData.brightness = this.brightness
					this.BLEData.currentMode = this.currentMode
					// this.BLEData.speed = this.speed
					this.BLEData.scene = this.currentScene
					this.$emit('sceneNotice', tempData, "colorlight", this.BLEData)

				} else {
					// console.log(tempData)
					wData(tempData, sres => {
						console.log('sendFnSuc', sres)
					}, err => {
						console.log('sendFnErr', err)
					}, )
				}
				// this.hex = this.defaultOptions[this.activeOptionIndex].background
				// const hueOptions = this.hexToHsla(this.hex)
				// this.color.hue = hueOptions.hue
			},

			// 输入
			onInput(angle) {
				// console.log(angle)
				this.color.hue = angle

				const {
					hue,
					saturation,
					luminosity,
					alpha
				} = this.color
				// console.log(this.color)
				this.hex = this.hslaToHex(hue, saturation, luminosity, alpha)
				this.sendFn('singerColorChange')
				// console.log('hex', this.hex);
			},

			// 亮度
			handleChangeLuminosity(pellucidity) {
				console.log('handleChangeLuminosity', pellucidity)
				this.color.saturation = pellucidity
				const {
					hue,
					saturation,
					luminosity,
					alpha
				} = this.color
				this.hex = this.hslaToHex(hue, saturation, luminosity, alpha)
				this.sendFn('singerColorChange')
				// console.log('hex', this.hex);
			},
			handleChangeLuminosityTick(pellucidity) {
				// console.log('handleChangeLuminosityTick', pellucidity)
				if (this.forbidSend) return
				this.forbidSend = true
				setTimeout(() => {
					this.forbidSend = false
				}, 300);
				this.handleChangeLuminosity(pellucidity)
			},

			hslaToHex(h, s, l, a) {
				h = h / 360;
				s = s === 0 ? 0 : s / 100;
				l = l / 100;
				let r, g, b;
				if (s === 0) {
					r = g = b = l;
				} else {
					// eslint-disable-next-line
					function hue2rgb(p, q, t) {
						if (t < 0) t += 1;
						if (t > 1) t -= 1;
						if (t < 1 / 6) return p + (q - p) * 6 * t;
						if (t < 1 / 2) return q;
						if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
						return p;
					}
					const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
					const p = 2 * l - q;
					r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
					g = Math.round(hue2rgb(p, q, h) * 255);
					b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
				}
				const hexR = r.toString(16).padStart(2, '0');
				const hexG = g.toString(16).padStart(2, '0');
				const hexB = b.toString(16).padStart(2, '0');
				return `#${hexR}${hexG}${hexB}`;
			},

			// hex转hsla
			hexToHsla(hex) {
				// 移除 # 号
				hex = hex.replace('#', '');
				// 将 3 位的颜色值扩展为 6 位
				if (hex.length === 3) {
					hex = hex
						.split('')
						.map(char => {
							return char + char;
						})
						.join('');
				}

				// 解析颜色值的红、绿、蓝分量
				const r = parseInt(hex.slice(0, 2), 16) / 255;
				const g = parseInt(hex.slice(2, 4), 16) / 255;
				const b = parseInt(hex.slice(4, 6), 16) / 255;
				// 计算色相、饱和度和亮度
				const max = Math.max(r, g, b);
				const min = Math.min(r, g, b);
				const d = max - min;
				let h

				if (d === 0) {
					// 灰度色
					h = 0;
				} else if (max === r) {
					// 计算色相
					h = ((g - b) / d) % 6;
				} else if (max === g) {
					h = (b - r) / d + 2;
				} else if (max === b) {
					h = (r - g) / d + 4;
				}

				h = Math.round(h * 60); // 将色相转换为角度制

				// 计算亮度
				const l = (max + min) / 2;

				// 计算饱和度
				const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

				// 透明度默认为 1
				const a = 1;

				return {
					hue: h,
					saturation: `${(s * 100).toFixed(2)}`,
					luminosity: `${(l * 100).toFixed(2)}`,
					alpha: a,
					hsla: `hsla(${h}, ${(s * 100).toFixed(2)}%, ${(l * 100).toFixed(2)}%, ${a})`
				};
			}
		}
	}
</script>


<style lang="scss" scoped>
	.atmosphere-light-color-light {
		border-radius: 16rpx;
		box-shadow: 10rpx 10rpx 10rpx rgba(0, 0, 0, 0.3);

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
			background: #414141;
			border-radius: 16rpx;
			margin-top: 32rpx;

			&__title {
				color: #fff;
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
						border: 8rpx solid #54615F;
					}

					&.active {
						&:after {
							width: 48rpx;
							height: 48rpx;
							background: transparent;
							border-radius: 100%;
							top: 50%;
							left: 50%;
							margin-left: -32rpx;
							margin-top: -32rpx;
							border: 8rpx solid #fff;
						}

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