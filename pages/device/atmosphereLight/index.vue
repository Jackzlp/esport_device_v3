<template>
	<PageLayout type="custom" style="margin-bottom: -100rpx;">
		<view :class="['atmosphere-light-page operate-page', switchOn ? 'switch-on' : '']" :style="{
        paddingTop: `${systemBarHeight * 2 + 32}rpx`
      }">
			<!-- 顶部导航 -->
			<view class="operate-page__header" :style="{
          paddingTop: `${systemBarHeight * 2}rpx`
        }">
				<image class="back-icon" :src="'/static/images/arrow-white.png'" @click="$back" />
				<image class="setting-page" :src="'/static/images/settings-white.png'" @click="handleSettingPage" />
			</view>
			<!-- 模糊圈 -->
			<view class="device_Box">
				<image class="light_bg" mode="widthFix" src="/static/images/device/light_images/light_bg.jpg">

				</image>
				<chaceImage class="light_image" mode="widthFix"
					:fileMd5="DEVICE_OPTIONS[currentDevice.type].cover(currentDevice.model)"
					:url='DEVICE_OPTIONS[currentDevice.type].withShadow(currentDevice.model)'>
				</chaceImage>
			</view>

			<!-- 基本操作信息 -->
			<view class="options_bg">
				<view class="options_bg_center_box">
					<view class="centet_top_box">
						<u-switch v-model="switchOn" active-color="#eee21b" size="20" inactive-color="#E7E7E7"
							@change="handleChangeSwitchOn" />
						<image mode="aspectFit" src="/static/images/device/light_images/light_brigress.png">

						</image>

						<u-slider :disabled="activeFunc ==='rhythm'?true:false" v-model="currentBrightness"
							:block-style="{ border: '2px solid #eee21b' }" class="myslider" active-color="#eee21b"
							:block-size="26" step="1" min="0" max="100" @change="changeBrightness" />
					</view>

					<CountDownTask ref="showCountDownRef" :switch-on.sync="switchOn" :init-count="initCount" />


				</view>

				<view class="options_bg_functions">

					<view v-for="func in functions" :key="func.key" class="item" @click="handleSwitchFunc(func,false)"
						v-show="func && func.isShow">

						<view v-if="activeFunc === func.key" class="item_select">{{ func.title }}</view>
						<view v-else class="item_normal">{{ func.title }}</view>
					</view>

				</view>



				<view class="functions-display">
					<AtmosphereLightScene @changCurrentBleData="changCurrentBleData" :brightNess='currentBrightness'
						ref="sceneBrightness" v-if="activeFunc === 'scene'" :b-l-e-data="currentBLEData"
						:first-get-ble-data="firstGetBleData" />
					<AtmosphereLightColorLight :brightNess='currentBrightness' ref="lightBrightness"
						v-else-if="activeFunc === 'color light'" :b-l-e-data="currentBLEData"
						:first-get-ble-data="firstGetBleData" />
					<AtmosphereLightRhythm v-else-if="activeFunc === 'rhythm'" :switch-on="switchOn"
						:sensitivity-copy="sensitivity" :has_local_rhythm="has_local_rhythm"
						:local_record="local_record" @startPlaying="startPlaying" @local_record="local_recordMethod" />
					<AtmosphereLightColorful :brightNess='currentBrightness' ref="colorBrightness"
						v-else-if="activeFunc === 'colorful' && IsColorful === true" :b-l-e-data="currentBLEData"
						:first-get-ble-data="firstGetBleData" />
					<AtmosphereLightMusic v-else-if="activeFunc === 'music'" :switch-on="switchOn"
						:is-page-show="isPageShow" @startPlaying="startPlaying" />
				</view>
			</view>



		</view>



	</PageLayout>
</template>

<script>
	import {

		mapState,
	} from 'pinia'
	import {
		getBLEData,
		calcSum,
		wData,
		getConnectedBluetoothDevices,
		ab2hex
	} from '../BLE/BLEfunction'
	import {
		useCommonStore
	} from '../../../store/common'
	import {
		useDeviceStore
	} from '../../../store/device'
	import PageLayout from '@/components/page-layout'
	import AtmosphereLightScene from './functions/scene/index'
	import AtmosphereLightColorLight from './functions/color-light/index'
	import AtmosphereLightRhythm from './functions/rhythm/index'
	import AtmosphereLightMusic from './functions/music/index'
	import AtmosphereLightColorful from './functions/colorful/index'
	import CountDownTask from './functions/countDown/index.vue'
	import {
		DEVICE_OPTIONS
	} from '../../home/constant'
	import chaceImage from '@/components/image-cache'
	import {
		useUserStore
	} from '../../../store/user'
	export default {
		name: 'MyPost',
		components: {
			PageLayout,
			AtmosphereLightScene,
			AtmosphereLightColorLight,
			AtmosphereLightRhythm,
			AtmosphereLightMusic,
			CountDownTask,
			AtmosphereLightColorful,
			chaceImage
		},
		data() {
			return {
				// 当前是否打开按钮了
				switchOn: true,
				isPageShow: true,
				hideTime: new Date().getTime(),
				sensitivity: 50,
				forbidOnshow: false,
				firstGetBleData: true,
				ignoreGetBleData: false,
				isNotIos: false,
				initCount: '',
				activeFunc: 'scene',
				errArr: [],
				currentBackData: '', // 蓝牙返回的数据
				DEVICE_OPTIONS,
				checkTodoList: [{
						name: 'timer1',
						hasChecked: false,
						id: '01',
						showPageCheck: true
					}, {
						name: 'timer2',
						hasChecked: false,
						id: '02',
						showPageCheck: true
					}, {
						name: 'timer3',
						hasChecked: false,
						id: '03',
						showPageCheck: true
					}, {
						name: 'timer4',
						hasChecked: false,
						id: '04',
						showPageCheck: true
					}, {
						name: 'timer5',
						hasChecked: false,
						id: '05',
						showPageCheck: true
					}, {
						name: 'timer6',
						hasChecked: false,
						id: '06',
						showPageCheck: true
					}, {
						name: '模式',
						hasChecked: false,
						id: '07',
						showPageCheck: false
					}, {
						name: '倒计时',
						hasChecked: false,
						id: '08',
						showPageCheck: false
					}
					// , {
					// 	name: '炫彩',
					// 	hasChecked: false,
					// 	id: '09',
					// 	showPageCheck: false
					// }
				],
				countDownTaskCount: 0,
				currentBLEData: {
					currentRGB: '',
					RGBmode: 0,
					brightness: 0,
					scene: 0,
					speed: 0,
					mode: '0D',
					order: 0,
					currentMode: 0
				},
				IsColorful: false,
				isFirstConnect: false,
				changeOrder: false,
				firbidenGetColorFul: false,
				functions: [{
						key: 'color light',
						title: this.$t('atmosphereLightPage.Base'),
						icon: './images/color-light.png',
						activeIcon: './images/color-light-active.png',
						isShow: true

					}, {
						key: 'scene',
						title: this.$t('atmosphereLightPage.scene'),
						icon: './images/scene.png',
						activeIcon: './images/scene-active.png',
						isShow: true
					}, {
						key: 'rhythm',
						title: this.$t('atmosphereLightPage.rhythm'),
						icon: './images/rhythm.png',
						activeIcon: './images/rhythm-active.png',
						isShow: true
					}, {
						key: 'colorful',
						title: this.$t('atmosphereLightPage.colorful'),
						icon: './images/colorful.png',
						activeIcon: './images/colorful-active.png',
						isShow: false
					}
					// {
					// 	key: 'music',
					// 	title: this.$t('atmosphereLightPage.music'),
					// 	icon: require('./images/music.png'),
					// 	activeIcon: require('./images/music-active.png'),
					// 	isShow: true
					// },
				],
				// reciveColor: false,
				// checkforce: false
				getCount: 0,
				local_record: false,
				currentBrightness: 100,
				bleTimeout: null,
				commonStore: useUserStore(),
				deviceStore: useDeviceStore()
			}
		},

		computed: {
			...mapState(useCommonStore, ['systemBarHeight']),
			...mapState(useDeviceStore, ['currentDevice', 'devMode']),



			hasColorful() {
				let special = uni.getStorageSync("chairInfo")
				const hasLightArr = JSON.parse(special).colorful ? JSON.parse(special).colorful : [
					'LUFT-600-LS',
					'GTP-600'
				]
				const model = this.currentDevice && this.currentDevice.model
				return hasLightArr.includes(model)
			},
			has_local_rhythm() {
				let special = uni.getStorageSync("chairInfo")
				const hasLightArr = JSON.parse(special).has_local_rhythm ? JSON.parse(special).has_local_rhythm : [
					'GTP560-BLK-LS',
					'GTP801B',
					'GT905'
				]
				const model = this.currentDevice && this.currentDevice.model
				return hasLightArr.includes(model)
			},
			timerChange() {
				let special = uni.getStorageSync("chairInfo")
				const hasLightArr = JSON.parse(special).timerChange ? JSON.parse(special).timerChange : [
					'GTZ-510-RGB'
				]
				const model = this.currentDevice && this.currentDevice.model
				return hasLightArr.includes(model)
			}
		},

		mounted() {
			this.forbidOnshow = true
			const that = this
			uni.getSystemInfo({
				success(res) {
					if (res.platform === 'android') {
						that.isNotIos = true
					} else if (res.platform === 'ios') {
						// console.log('that.functions,1', that.functions)
						// that.functions.pop()
						// that.$forceUpdate()
						// console.log('that.functions,2', that.functions)
						that.isNotIos = false
					} else {
						console.log('设备不是安卓也是iOS');
					}
				}
			});
			// console.log(this.currentDevice)
			setTimeout(() => {
				this.forbidOnshow = false
				// this.analysisBLEData('aa5501010c000009010d55aa')
			}, 2000)
			this.initBLEState()
		},
		onShow() {
			this.isPageShow = true
			this.errArr = []
			this.firstGetBleData = true
			// 如果页面被长时间隐藏，有可能是至于后台，此时需要重新获取
			const now = new Date().getTime()
			if ((now - this.hideTime) > 15000) {
				this.getBleDataAgain(false)
			} else {
				this.getBleDataAgain(true)
			}
		},

		mounted() {
			if (this.currentDevice.model) {
				this.IsColorful = this.hasColorful
				let index = this.functions
					.findIndex(item => item.key === 'colorful')
				console.log(index)
				console.log("AAAAAAAAA")
				setTimeout(() => {
					if (index != -1) {
						this.functions[index].isShow = this.IsColorful
						// this.handleSwitchFunc('colorful',false)
						console.log(this.functions)
					}

					this.$forceUpdate()
				}, 1000)

			}
		},
		onLoad(options) {

			if (options.lanch) {
				this.isFirstConnect = true
				setTimeout(() => {
					this.isFirstConnect = false
				}, 500)
			}
			// console.log(this.currentDevice)

		},
		onHide() {
			this.isPageShow = false
			this.hideTime = new Date().getTime()
			console.log("AAA")
		},


		methods: {
			// ...mapActions('device', ['setCurrentTimer', 'saveCurrentDevice', 'setConnecting']),
			// ...mapMutations('device', ['setBrightness']),




			getBleDataAgain(onlyCheckTimer) {
				if (this.forbidOnshow) return
				this.countDownTaskCount = 0
				for (let i = 0; i < this.checkTodoList.length; i++) {
					if (onlyCheckTimer && this.checkTodoList[i].showPageCheck) {
						this.checkTodoList[i].hasChecked = false;
					}
					if (!onlyCheckTimer) {
						this.checkTodoList[i].hasChecked = false;
					}
				}
				this.checkAllStaus()
			},

			changeBrightness(e) {
				this.currentBLEData.brightness = e
			},

			startPlaying() {
				//判断如果是关机，此时要将变成开机状态
				if (!this.switchOn) {
					this.sendFn('open')
					this.switchOn = true
				}
				setTimeout(() => {
					this.getBleDataAgain(true)
					// this.handleChangeSwitchOn(true)
				}, 2500)
			},
			// 去倒计时详情
			handleCountTaskDetail() {
				this.$navigateTo('/pages/device/atmosphereLight/timer')
			},
			// 切换功能
			handleSwitchFunc(func, byhand) {
				// console.log(this.currentBLEData)
				// 如果是ios跳音乐模式时要屏蔽，并跳转回单色模式
				const isMusic = func.key === 'music'
				if (isMusic && !this.isNotIos) {
					this.activeFunc = func.key
					this.handleSwitchFunc('color light')
					return
				} else if (func.key === this.activeFunc && !this.firstGetBleData) return
				const temp = this.checkTodoList.find(el => {
					return !el.hasChecked
				});
				if (temp && byhand) return
				if (!this.firstGetBleData) {
					if (this.forbidSwitchFn) return
					this.forbidSwitchFn = true
					this.$loading()
					setTimeout(() => {
						this.$hideLoading()
						this.activeFunc = func.key
						this.forbidSwitchFn = false
					}, 3000)
					return
				}
				this.firstGetBleData = false
				this.activeFunc = func.key
				this.ignoreGetBleData = true
				setTimeout(() => {
					this.ignoreGetBleData = false
				}, 3500)
			},
			local_recordMethod() {
				this.local_record = false
			},
			// 修改名字
			handleSettingPage() {
				this.$navigateTo('/pages/device/atmosphereLight/setting')
			},
			handleChangeSwitchOn() {
				setTimeout(() => {
					const flag = this.switchOn
					if (flag) {
						this.sendFn('open')
					} else {
						this.sendFn('close')
					}
				}, 100);
			},
			displayCurrentTime() {
				const currentDate = new Date();
				let hours = currentDate.getHours();
				let minutes = currentDate.getMinutes();
				let seconds = currentDate.getSeconds();
				// 格式化时间，确保小时、分钟和秒数始终显示两位数字
				hours = this.formatTime(hours);
				minutes = this.formatTime(minutes);
				seconds = this.formatTime(seconds);
				// 显示当前时间
				return `${hours}:${minutes}:${seconds}`;
			},
			formatTime(time) {
				if (time < 10) {
					return `0${time}`;
				}
				return time;
			},
			analysisBLEData(bleData) {

				try {



					// 基本数据校验
					if (!bleData || typeof bleData !== 'string' || bleData.length < 12) {
						console.error('无效的蓝牙数据:', bleData)
						return
					}
					if (this.devMode) {
						const nowDate = this.displayCurrentTime()
						this.errArr.unshift({
							type: `${nowDate}getbleData**`,
							err: bleData
						})
					}
					// hugo todo 返回值没有做校验和校验
					let dp = bleData.slice(8, 10)
					// console.log('bleData', bleData)
					// console.log(dp)
					if (bleData.length < 21) {
						this.switchOn = bleData.slice(10, 12) === '01'
					} else {
						dp = dp === '13' || dp === '0c' ? bleData.slice(8, 10) : bleData.slice(10, 12)
					}

					switch (dp) {
						case '13':
							this.analysisTimer(bleData)
							break;
						case '02':
							//单色模式
							this.analysisColor(bleData)
							break;
						case '07':
						case '08':
						case '09':
							//场景模式
							this.analysisScene(bleData)
							break;
						case '40':
							this.analyanalysisColorful(bleData)
							break;
						case '3e':
						case '0a':
							//律动模式
							this.analysisRhythm(bleData)
							break;
						case '05':
							//音乐模式
							this.analysisMusic(bleData)
							break;
						case '0c':
							this.analysisCount(bleData)
							break;
						default:
							break;
					}
					// 查下初始化的值查询完没有,如果没有要继续查
					this.checkAllStaus()
				} catch (error) {
					//TODO handle the exception
					console.error('蓝牙数据解析错误', e);
					// 标记当前任务失败，继续后续检查
					this.checkTodoList.forEach(task => {
						if (!task.hasChecked) task.retryCount = MAX_RETRY;
					});
				}
			},
			analyanalysisColorful(bleData) {
				this.checkTodoList[6].hasChecked = true
				if (!this.ignoreGetBleData) {
					// this.handleSwitchFunc('colorful', false)
					this.handleSwitchFunc({
						key: 'colorful',
					})
				}
				// if (this.activeFunc != 'colorful') {
				// 	return
				// }
				// console.log(bleData)
				const dp = bleData.slice(10, 12)
				this.getCount += 1
				if (this.getCount < 3) {
					this.switchOn = true
				} else {
					this.switchOn = bleData.slice(8, 10) === '01'
				}
				var tmode = ""
				var torder = 2
				let temDic = this.currentBLEData

				if (this.hasColorful) {

					if (dp === "0f") {
						tmode = "0F"
						let orderString = bleData.slice(12, 14)
						torder = parseInt(orderString, 16)
						temDic.order = torder
						this.currentBLEData = {
							...temDic
						}
					} else {
						const speedHexString = bleData.slice(16, 18)
						const brightHexString = bleData.slice(14, 16)
						const speed = parseInt(speedHexString, 16)
						const brightness = parseInt(brightHexString, 16)
						// console.log("BBBBB")
						// console.log(brightness)
						if (dp === '40') {
							tmode = bleData.slice(12, 14).toUpperCase()

						} else {
							tmode = dp.toUpperCase()
						}
						temDic.mode = tmode
						temDic.order = torder
						temDic.speed = speed
						temDic.brightness = brightness
						this.currentBLEData = {
							...temDic
						}

					}
				} else {}
				this.currentBrightness = brightness
				this.$forceUpdate()
			},

			analysisScene(bleData) {
				console.log('analysisScene', bleData)
				this.checkTodoList[6].hasChecked = true
				// 赋值模式
				if (!this.ignoreGetBleData) {
					this.handleSwitchFunc({
						key: 'scene'
					})
				}
				// if (this.activeFunc != 'scene') {
				// 	return
				// }
				// 赋值开机状态
				this.switchOn = bleData.slice(8, 10) === '01'
				// console.log(this.switchOn)
				// 赋值场景模式
				// 赋值RGBMode
				// 赋值速度
				// 赋值亮度
				const dp = bleData.slice(10, 12)
				var mode = ''
				var modeIndex = 0
				const sceneHexString = bleData.slice(12, 14)
				const speedHexString = bleData.slice(16, 18)
				const brightHexString = bleData.slice(14, 16)
				const scenesIndex = parseInt(sceneHexString, 16) - 1
				const speed = parseInt(speedHexString, 16)
				const brightness = parseInt(brightHexString, 16)
				this.currentBrightness = brightness
				switch (dp) {
					case '07':
						mode = 'gradientColor'
						modeIndex = 0
						break;
					case '08':
						mode = 'strobeMode'
						modeIndex = 1
						break;
					case '09':
						mode = 'jumpMode'
						modeIndex = 2
						break;
					default:
						break;
				}

				if (this.hasColorful) {
					let temDic = this.currentBLEData
					// temDic.currentRGB = ''
					temDic.currentMode = modeIndex
					temDic.brightness = brightness
					temDic.scene = scenesIndex
					temDic.speed = speed
					// this.$set(this.currentBLEData)
					this.currentBLEData = {
						...temDic
					}
				} else {

					let temDic = this.currentBLEData
					temDic.currentRGB = ''
					temDic.currentMode = modeIndex
					this.currentBLEData = {
						...temDic,
						brightness,
						scene: scenesIndex,
						speed
					}
				}
				this.$forceUpdate()
			},
			changCurrentBleData(model, scen) {
				// console.log(model,scen)
				// let temDic = this.currentBLEData
				// temDic.scene = scen
				// temDic.currentMode = model
				// this.currentBLEData = {
				// 	...temDic
				// }

			},

			analysisRhythm(bleData) {
				this.checkTodoList[6].hasChecked = true
				this.switchOn = bleData.slice(8, 10) === '01'
				if (!this.ignoreGetBleData) {
					this.handleSwitchFunc({
						key: 'rhythm'
					})
				}
				// if (this.activeFunc != 'rhythm') {
				// 	return
				// }
				if (this.has_local_rhythm) {
					this.local_record = true
					this.sensitivity = (parseInt(bleData.slice(14, 16), 16) > 100 ? 100 : parseInt(bleData.slice(14, 16),
						16)) || 50
				} else {
					this.sensitivity = (parseInt(bleData.slice(18, 20), 16) > 100 ? 100 : parseInt(bleData.slice(18, 20),
						16)) || 50
				}
				this.$forceUpdate()
			},
			analysisMusic(bleData) {
				this.checkTodoList[6].hasChecked = true
				this.switchOn = bleData.slice(8, 10) === '01'
				if (!this.ignoreGetBleData) {
					this.handleSwitchFunc({
						key: 'music'
					})
				}
			},
			analysisColor(bleData) {
				this.checkTodoList[6].hasChecked = true
				// 赋值模式
				if (!this.ignoreGetBleData) {
					this.handleSwitchFunc({
						key: 'color light'
					})
				}


				// if (this.activeFunc != 'color light') {
				// 	return
				// }
				// 赋值开机状态
				this.switchOn = bleData.slice(8, 10) === '01'

				// 赋值RGB
				// 计算并赋值明度
				// 赋值亮度
				const brightHexString = bleData.slice(18, 20)
				const brightness = parseInt(brightHexString, 16)
				this.currentBrightness = brightness
				if (this.hasColorful) {
					let temDic = this.currentBLEData
					temDic.currentRGB = bleData.slice(12, 18)
					temDic.RGBmode = 0
					temDic.brightness = brightness
					temDic.scene = 0
					this.currentBLEData = {
						...temDic
					}
				} else {
					this.currentBLEData = {
						currentRGB: bleData.slice(12, 18),
						RGBmode: 0,
						brightness,
						scene: 0,
						speed: 0
					}
				}
				// console.log(this.currentBLEData)
				this.$forceUpdate()
			},
			analysisTimer(bleData) {
				const weekOptionText = [
					'Sunday',
					'Saturday',
					'Friday',
					'Thursday',
					'Wednesday',
					'Tuesday',
					'Monday'
				]
				const weekOptions = []
				const timer = bleData.slice(10, 12)
				const status = bleData.slice(28, 30)
				let hour = parseInt(bleData.slice(20, 22), 16)
				let min = parseInt(bleData.slice(22, 24), 16)
				hour = hour < 10 ? `0${hour}` : hour
				min = min < 10 ? `0${min}` : min
				const week = parseInt(bleData.slice(26, 28), 16)
				let binary = week.toString(2); // 将 10 进制数转换成二进制字符串
				// 如果没有设置周几，给个默认的周一
				if (status === '00') {
					binary = '00000001'
				}
				// 如果二进制字符串不足 8 位，则在前面添加零，使其达到 8 位长度
				while (binary.length < 8) {
					binary = `0${binary}`;
				}
				const tempArr = binary.split('')
				tempArr.forEach((el, index) => {
					if (index > 0) {
						if (Number(el) === 1) {
							weekOptions.push(weekOptionText[index - 1])
						}
					}
				})
				const index = this.checkTodoList.findIndex(el => {
					return el.id === timer
				})
				this.checkTodoList[index].hasChecked = true
				if (status === '01' || status === '02') {
					this.countDownTaskCount++
				}
				const tempTimer = {
					active: status !== '03' && status !== '00',
					weekOptions,
					date: `${hour}:${min}`,
					turnOnLight: status === '01'
				}
				this.deviceStore.setCurrentTimer({
					currentTimer: tempTimer,
					index: Number(timer) - 1
				})
			},
			analysisCount(bleData) {
				this.checkTodoList[7].hasChecked = true
				this.initCount = bleData.slice(10, 16)
			},

			sendFn(type, after) {

				// 清除旧定时器
				if (this.bleTimeout) clearTimeout(this.bleTimeout);

				// 设置新定时器（5秒超时）
				this.bleTimeout = setTimeout(() => {
					// console.warn('蓝牙响应超时');
					this.checkAllStaus();
				}, 5000);
				let tempData = ''
				switch (type) {
					case 'checkData':
						tempData = calcSum(`CA${after}`)
						break;
					case 'open':
						tempData = calcSum('0101')
						break;
					case 'close':
						tempData = calcSum('0102')
						break;
					default:
						break;
				}
				wData(tempData, sres => {
					// console.log('sendFnSuc', sres)
					// console.log('sendtempData', tempData)
					if (this.devMode) {
						const nowDate = this.displayCurrentTime()
						this.errArr.unshift({
							type: `${nowDate}sendFnSuc--`,
							err: sres
						})
						// this.handleChangeSwitchOn(false)
					}
				}, err => {
					// console.log("AAAAA")
					// console.log(type, after)
					// console.log('sendtempData', tempData)
					if (this.devMode) {
						const nowDate = this.displayCurrentTime()
						this.errArr.unshift({
							type: `${nowDate}sendFnErr--`,
							err,
							tempData
						})
					}
					// console.log('sendFnErr', err)
				}, )
			},

			initBLEState() {
				const that = this
				getBLEData({
					success: data => {
						that.currentBackData = ab2hex(data.value)
						that.analysisBLEData(ab2hex(data.value))
					}
				})
				setTimeout(() => {
					that.checkAllStaus()
				}, 500)
				// 接收函数就绪之后开始查询设备状态
				this.checkAllStaus()
			},
			//赋值倒计时，赋值定时器，赋值模式，颜色值，亮度，速度，开关机状态
			checkAllStaus() {

				const MAX_RETRY = 2;
				const pendingTasks = this.checkTodoList.filter(task => !task.hasChecked);

				if (pendingTasks.length === 0) return;

				pendingTasks.forEach(task => {
					const index = this.checkTodoList.findIndex(t => t.id === task.id);

					// 初始化重试计数器
					if (this.checkTodoList[index].retryCount === undefined) {
						this.$set(this.checkTodoList, index, {
							...task,
							retryCount: 0
						});
					}

					// 重试逻辑
					if (this.checkTodoList[index].retryCount < MAX_RETRY) {
						// console.log(`检查 ${task.id}, 尝试 ${this.checkTodoList[index].retryCount + 1}次`);

						// 发送查询指令
						this.sendFn('checkData', task.id);

						// 延迟更新重试计数（等待蓝牙响应）
						setTimeout(() => {
							if (!this.checkTodoList[index].hasChecked) {
								this.$set(this.checkTodoList, index, {
									...this.checkTodoList[index],
									retryCount: this.checkTodoList[index].retryCount + 1
								});
								this.$forceUpdate();
							}
						}, 500); // 适当延迟
					} else {
						// console.log(`检查 ${task.id} 超过最大重试次数，标记为已检查`);
						this.$set(this.checkTodoList, index, {
							...task,
							hasChecked: true,
							retryCount: 0
						});
					}
				});

				// 使用轮询替代递归
				setTimeout(() => this.checkAllStaus(), 1000);



				// 	let that = this
				// 	const MAX_RETRY = 2; /

				// 	let index = this.checkTodoList.findIndex(el => !el.hasChecked)
				// 	if (index == -1) return
				// 	const temp = this.checkTodoList[index]

				// 	if (!temp) return;


				// 	if (temp.retryCount === undefined) {
				// 		this.checkTodoList[index].retryCount = 0;
				// 	}

				// 	if (temp.retryCount < MAX_RETRY) {
				// 		console.log(`检查 ${temp.id}, 尝试 ${temp.retryCount + 1}次`);
				// 		that.sendFn('checkData', temp.id);
				// 		console.log(temp.id)
				// 		this.checkTodoList[index].retryCount++;
				// 	} else {
				// 		console.log(`检查 ${temp.id} 超过最大重试次数，标记为已检查`);
				// 		this.checkTodoList[index].hasChecked = true;
				// 		this.checkTodoList[index].retryCount = 0; // 重置计数器
				// 		this.checkAllStaus(); // 继续检查下一个
				// 	}


			}
		},
		beforeDestroy() {
			this.currentDevice.state = this.switchOn
			this.deviceStore.saveCurrentDevice(this.currentDevice)
			this.deviceStore.setConnecting(false)
			uni.closeBLEConnection({
				deviceId: this.currentDevice && this.currentDevice.deviceId,
				success() {
					console.log('蓝牙适配器已关闭');
				},
				fail(err) {
					console.log('关闭蓝牙适配器失败', err);
				}
			});
		}
	}
</script>

<style lang="scss" scoped>
	.atmosphere-light-page {
		background: #2d2d2d;
		min-height: 100vh;
		position: relative;
		overflow-x: hidden;


		.blur-circle {
			// display: flex;
			position: absolute;
			top: 0;
			left: 0;
			background: #2d2d2d;
			width: 100vw;
			// justify-content: space-between;
			z-index: 0;
			// height: 600rpx;

			image {
				width: 100vw;
				aspect-ratio: 1/1;
				height: auto;

			}

			.red-one {
				background: rgba(255, 185, 185, 0.3);
				filter: blur(40px);
				width: 196px;
				height: 196px;
				border-radius: 100%;
				margin-left: -98px;
				margin-top: 100px;
			}

			.orange-one {
				background: rgba(255, 227, 185, 0.3);
				filter: blur(40px);
				width: 240px;
				height: 240px;
				border-radius: 100%;
				margin-right: -120px;
			}
		}
	}
</style>


<style lang="scss" scoped>
	.operate-page {
		position: relative;
		width: 100vw;

		.device_Box {
			position: relative;
			z-index: 4;

			.light_image {
				width: 100vw;
				aspect-ratio: 1/1;
				z-index: 3;

			}

			.light_bg {

				position: absolute;
				left: 0;
				top: 0;
				width: 100%;
				aspect-ratio: 1/2;
				z-index: 0;

			}

		}

		.options_bg {
			width: 100vw;
			// min-height: 100vh;
			position: relative;
			background-color: #2d2d2d;
			margin-top: -140rpx;
			z-index: 7;
			padding-bottom: 50rpx;

			&_functions {
				padding: 0 15rpx;
				margin: 0 20rpx;
				display: flex;
				justify-content: space-around;
				align-items: center;

				.item {
					font-size: 32rpx;
					font-weight: 600;
					color: white;
					height: 80rpx;

					line-height: 80rpx;

					.item_select {
						border-bottom: 4rpx solid #fff;
					}

					.item_normal {

						border-bottom: 4rpx solid transparent;
					}

				}
			}


			&_center_box {
				padding: 32rpx;
				margin: 0 32rpx;

				border-radius: 16rpx;
				background-color: #414141;
				z-index: 8;
				position: relative;
				top: -80rpx;
				box-shadow: 10rpx 10rpx 10rpx rgba(0, 0, 0, 0.3);


				.count-down_bg {
					// padding: 20rpx;
					margin-top: 20rpx;

					.line {
						height: 1rpx;
						background: repeating-linear-gradient(to right,
								#787878 0 10rpx,
								transparent 10rpx 15rpx);
					}

					.timer_box {

						display: flex;
						justify-content: flex-start;
						align-items: center;
						margin-top: 20rpx;

						.left_image {
							image {
								width: 450rpx;
								height: 130rpx;
								position: absolute;
								left: 0;
								top: 0;

							}

							width: 450rpx;
							height: 130rpx;
							position: relative;

							display: flex;

							.column_box {
								flex: 1;
								height: 130rpx;
								text-align: center;
								line-height: 130rpx;
								font-size: 80rpx;
								font-weight: 600;
								color: white;
							}
						}

						.right_image {
							width: 80rpx;
							height: 80rpx;
							margin-left: 60rpx;
						}

					}
				}

				.centet_top_box {
					display: flex;
					justify-content: flex-start;
					align-content: center;
					height: 50rpx;
					padding-right: 20rpx;
					// background-color: #DF0001;

					.myslider {
						flex: 1;
						// margin: 0 32rpx;
						margin-left: 40rpx;
						// background-color: red;
					}

					image {
						width: 40rpx;
						height: 40rpx;
						margin-left: 30rpx;
					}
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
						justify-content: space-between;
						align-items: center;
						color: white;
						font-weight: bold;
						font-size: 26rpx;
						width: calc(100% - 280rpx);
						flex-shrink: 0;
					}
				}

			}

		}

		.center_options {
			padding: 40rpx;
			background-color: #414141;
			box-shadow: 10rpx 10rpx 10rpx rgba(0, 0, 0, 0.3);
			margin-left: 30rpx;
			margin-right: 30rpx;
			z-index: 7;
			margin-bottom: -100rpx;
			border-radius: 16rpx;

		}



		&__header {
			top: 0;
			padding: 32rpx;
			display: flex;
			align-items: center;
			justify-content: space-between;
			position: fixed;
			left: 0;
			right: 0;
			background: #2d2d2d;
			z-index: 10;

			image {
				width: 48rpx;
				height: 48rpx;
			}
		}



		&-basic {
			// height: 760rpx;
			// margin-top: 60rpx;
			width: 100%;
			position: relative;
			z-index: 2;


			&-cover {
				// position: absolute;
				// right: 0rpx;
				// top: 0;
				width: 100vw;
				z-index: 3;
				display: flex;
				justify-content: center;
				align-content: center;
			}

			&-content {
				display: flex;
				flex-direction: column;
				padding-left: 32rpx;

				.content {
					width: 50%;
					word-break: break-all;
					font-size: 48rpx;
					color: #333;
					line-height: 66rpx;
				}

				.clock {
					display: inline-flex;
					border-radius: 16rpx;
					margin-top: 32rpx;
					width: 96rpx;
					height: 96rpx;
					position: relative;


					&__countdown-count {
						color: #fff;
						font-size: 20rpx;
						width: 32rpx;
						height: 32rpx;
						position: absolute;
						background: #DF0001;
						display: flex;
						justify-content: center;
						align-items: center;
						right: -16rpx;
						top: -16rpx;
						border-radius: 100%;
						z-index: 1;
					}

					&__image {
						width: 96rpx;
						height: 96rpx;
					}
				}
			}
		}

		//

		&-functions {
			.function-bar {
				margin: 32rpx 32rpx 0;
				background: #fff;
				padding: 24rpx 32rpx;
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
			}
		}

		.functions-tabs {
			display: flex;
			margin: 32rpx;
			justify-content: space-between;

			.function-tab {
				width: 25%;
				text-align: center;
				display: flex;
				flex-direction: column;
				align-items: center;

				&__title {
					font-size: 24rpx;
					font-weight: bold;
					line-height: 34rpx;
					margin-top: 8rpx;
				}

				&__icon {
					width: 96rpx;
					height: 96rpx;
					box-sizing: border-box;
					padding: 16rpx;
					border-radius: 16rpx;
					background: #fff;

					image {
						width: 64rpx;
						height: 64rpx;
					}
				}

				&.active {
					.function-tab__icon {
						background: linear-gradient(360deg, #4D4D4D 0%, #303030 100%);
					}
				}
			}
		}

		.functions-display {
			padding: 0 32rpx 32rpx;

		}

	}
</style>