<template>
	<PageLayout type="custom">
		<view class="nagavit_box" :style="{ paddingTop: `${systemBarHeight * 2 }rpx` }">
			<image class="mback-icon" src="/static/images/common/left-arrow.png" @click="$back"></image>
			<view class="back_title">{{$t('detectPage.connect')}}</view>
		</view>
		<view class="detect-page">
			<!-- <view class="detect-page__title">
				{{ isDetecting ? $t('detectPage.detectingTitle') : $t('detectPage.title') }}
			</view> -->
			<template v-if="!hasDetectedDevice">
				<view class="detect-page__blue-tooth">
					<div :class="['inner', isDetecting ? 'detect-animation' : '']" @click="toggleDetect">
						<image src="/static/images/phase2/bluetooth.png" alt="" />
					</div>

				</view>
				<view class="searchCover">
					<view class="strpke-text" @click="searchBlutoothMethod">{{$t('bluetoothHintRelate.connection')}}
					</view>
					<view class="center_image" @click="searchBlutoothMethod">
						<!-- 顶部虚化层（从下向上渐变） -->
						<image mode="aspectFill" class="main-img" src="/static/images/phase2/bluetooth_center.jpg">
						</image>
						<view class="blur-edge top-edge"></view>
						<!-- 底部虚化层（从上向下渐变） -->
						<view class="blur-edge bottom-edge"></view>
					</view>

					<view class="Buttons_box" @click="searchBlutoothMethod">
						<image src="/static/images/phase2/blutooth_link.png"></image>
						<view>{{ isDetecting?$t('detectPage.detectingTitle'): $t('bluetoothHintRelate.Accept')}}</view>
					</view>
					<view class="Buttons_box" @click="gotoDiscoverMethod">
						<image src="@/static/images/phase2/blutooth_search.png"></image>
						<view>{{$t('bluetoothHintRelate.discovery')}}</view>
					</view>
				</view>

				<!-- <view class="detect-page__hint">
					{{ $t('detectPage.hint') }}
				</view> -->
				<!-- 如果检测过，并且没有检测出来的设备 -->
				<!-- <view v-if="hasDetectedOnce && !hasDetectedDevice" class="detect-page__error-hint">
					<view v-for="instruction in INSTRUCTIONS" :key="instruction.title"
						class="detect-page__hint-fragment">
						<view class="title">{{ instruction.title }} </view>
						<template v-if="instruction.contents">
							<view v-for="content in instruction.contents" :key="content" class="content">{{ content }}
							</view>
						</template>
					</view>
				</view> -->
			</template>
			<!-- 有设备之后 -->
			<template v-else>
				<view class="detect-page__device-list">
					<!-- 检测出的设备列表 -->
					<view v-for="(device, index) in detectedList" :key="index"
						:class="['device', selectedDeviceIndex === index ? 'selected' : '']"
						@click="handleSelectDevice(index)">
						<chaceImage class="device__cover" mode="widthFix"
							:fileMd5="DEVICE_OPTIONS[device.type].cover(device.model)"
							:url='DEVICE_OPTIONS[device.type].cover(device.model)'></chaceImage>
					</view>
				</view>
				<view v-if="selectedDevice" class="detect-page__device-cover">
					<!-- <view>{{selectedDeviceCover}}</view> -->
					<!-- <image mode="widthFix" :src="selectedDeviceCover" /> -->
					<chaceImage mode="widthFix" :fileMd5="selectedDeviceCover" :url='selectedDeviceCover'></chaceImage>
				</view>
				<!-- 	<view class="detect-page__device-actions">
					
					<view class="detect-page__actions-button" @click="addDevice">
						{{ $t('detectPage.connect') }}
					</view>
				</view> -->
				<view class="Buttons_box" @click="addDevice">
					<image src="/static/phase2/blutooth_link.png"></image>
					<view>{{$t('detectPage.connect')}}</view>
				</view>

				<view class="Buttons_box" @click="gotoDiscoverMethod">
					<image src="@/static/images/phase2/blutooth_search.png"></image>
					<view>{{$t('bluetoothHintRelate.discovery')}}</view>
				</view>

				<!-- 	<view class="detect-page__result-hint">
					{{ $t('detectPage.resultHint') }}
				</view> -->
			</template>
			<view v-if="devMode">
				<view v-for="item,index in errArr" :key="index" class="for">
					{{ item.type }}:{{ item.err }}
				</view>
			</view>
		</view>
	</PageLayout>
</template>

<script>
	import {
		initBLEdevice,
		createBLEConnection,
		stopBluetoothDevicesDiscovery,
		ab2hex
	} from '../device/BLE/BLEfunction'
	import PageLayout from '@/components/page-layout'
	// const KJPermission = uni.requireNativePlugin('KJ-Permission');

	import {
		DEVICE_OPTIONS
	} from './constant'
	import {
		mapState
	} from 'pinia'

	import {
		useDeviceStore
	} from '@/store/device'
	import {
		useCommonStore
	} from '@/store/common';


	import chaceImage from '@/components/image-cache'
	export default {
		name: 'HomeDetect',
		components: {
			PageLayout,
			chaceImage
		},
		data() {
			return {
				DEVICE_OPTIONS,
				isDetecting: false, // 是否正在检测
				connecting: false, // 是否正在链接
				detectedList: [],
				errArr: [],
				// 选中的设备
				selectedDeviceIndex: 0,
				currentSelectDevice: null,
				hasDetectedOnce: false, // 如果已经执行了一次搜索
				deviceStore: useDeviceStore(),
				KJPermission: null


			}
		},

		computed: {
			...mapState(useDeviceStore, ['devMode', 'deviceList']),
			...mapState(useCommonStore, ['systemBarHeight']),
			// 是否有设备
			hasDetectedDevice() {
				return this.detectedList.length
			},
			// 选中的设备
			selectedDevice() {
				// console.log(this.detectedList[this.selectedDeviceIndex] || {})
				return this.detectedList[this.selectedDeviceIndex] || {}
			},
			selectedDeviceCover() {
				return DEVICE_OPTIONS[this.selectedDevice.type].cover(this.selectedDevice.model)
			},
			// 指示
			INSTRUCTIONS() {
				return [{
					title: this.$t('detectPage.instruction.title'),
					contents: [
						this.$t('detectPage.instruction.one'),
						this.$t('detectPage.instruction.two'),
						this.$t('detectPage.instruction.three')
					]
				}]
			}
		},

		mounted() {
			// setTimeout(() => {
			// 	this.searchBlutoothMethod()
			// }, 2000)
			if (!this.KJPermission) {
				this.KJPermission = uni.requireNativePlugin('KJ-Permission')
			}
		},

		methods: {
			// ...mapActions('device', ['addDeviceList', 'saveCurrentDevice']),

			gotoDiscoverMethod() {
				uni.navigateTo({
					url: '/pages/home/components/AllProductList?flag=true'
				})
			},
			searchBlutoothMethod() {
				let that = this
				console.log(that.KJPermission)


				that.KJPermission.judgePermission({
					'name': 'android.permission.BLUETOOTH'
				}, res => {
					if (res.result && res.status === -1) {
						that.KJPermission.requestPermission({
							'name': 'android.permission.BLUETOOTH'
						}, res2 => {
							if (res2.result && res2.status === -1) {
								this.toggleDetect()
							}
						});
					} else {
						this.toggleDetect()
					}
					console.log(`judgePermission:${JSON.stringify(res)}`);
				});
			},
			// 触发蓝牙检测
			toggleDetect() {
				if (this.isDetecting) return
				this.isDetecting = true
				this.triggerBlueTooth()
			},
			handleSelectDevice(index) {
				this.selectedDeviceIndex = index
			},
			// 触发蓝牙
			triggerBlueTooth() {
				const that = this
				initBLEdevice({
					deviceObj: {
						serviceId: '',
						characteristicId: ''
					},
					success(type, devices) {
						switch (type) {
							case 'search':
								// 搜索到蓝牙设备，每次搜索到新的蓝牙设备都会被触发一次
								that.getBlueToothDevice(devices)
								break;
							case 'getBLEDeviceServices':
								// 已与目标蓝牙设备建立链接
								that.hasDetectedOnce = true
								break;
							case 'getBLEDeviceCharacteristics':
								setTimeout(() => {
									that.$hideLoading()
								}, 300)
								// 目标蓝牙已在甲板上，可供调遣状态，此时蓝牙搜索已停止，将不会反馈新设备
								that.connecting = false
								that.hasDetectedOnce = true
								that.saveDevice()
								that.handleDeviceDetail()
								break;
							default:
								break;
						}
					},
					fail(type, err) {
						var str = ''
						setTimeout(() => {
							that.$hideLoading()
						}, 300)
						setTimeout(() => {
							switch (type) {
								case 'openBluetoothAdapter':
									//蓝牙未打开
									console.log(type, err)
									// 蓝牙未打开
									that.$toast({
										content: that.$t(
											'bluetoothHintRelate.bluetoothNotEnabled'),
										type: 'plain'
									})
									setTimeout(() => {
										that.$switchTab('/pages/home/index')
									}, 1200)
									break;
								case 'getBluetoothAdapterState':
									//蓝牙状态不对
									that.$toast({
										content: that.$t(
											'bluetoothHintRelate.bluetoothStatusIncorrect'),
										type: 'plain'
									})
									console.log(type, err)
									break;
								case 'startBluetoothDevicesDiscovery':
									//蓝牙搜索有问题
									that.$toast({
										content: that.$t(
											'bluetoothHintRelate.bluetoothSearchIssue'),
										type: 'plain'
									})
									console.log(type, err)
									break;
								case 'createBLEConnection':
									//蓝牙链接设备失败
									console.log(type, err)
									try {
										str = JSON.stringify(err)
									} catch (error) {
										str = err
									}
									that.errArr.push({
										type,
										err: str
									})
									that.connecting = false
									// 蓝牙链接失败
									that.$toast({
										content: that.$t(
											'bluetoothHintRelate.bluetoothConnectionFailed'),
										type: 'plain',
										duration: 3000
									})
									break;
								case 'getBLEDeviceServices':
									// 获取蓝牙设备服务失败
									that.$toast({
										content: that.$t(
											'bluetoothHintRelate.bluetoothDeviceServiceFailed'
										),
										type: 'plain'
									})
									console.log(type, err)
									break;
								case 'getBLEDeviceCharacteristics':
									// 获取蓝牙设备角色失败
									that.connecting = false
									that.$toast({
										content: that.$t(
											'bluetoothHintRelate.bluetoothDeviceRoleFailed'),
										type: 'plain'
									})
									console.log(type, err)
									break;
								default:
									break;
							}
						}, 600)
					}
				})
			},
			saveDevice() {
				const current = this.detectedList[this.selectedDeviceIndex]
				const device = {
					type: current.type,
					name: current.name,
					model: current.model,
					deviceId: current.deviceId
				}
				this.deviceStore.saveCurrentDevice(device)
				this.deviceStore.addDeviceList(device)
			},
			// 获取电竞椅型号
			checkModel(type) {

				let chairType = uni.getStorageSync("chairInfo")
				// console.log(type)
				if (chairType.length > 0) {
					let obj = JSON.parse(chairType)
					let tempeObj = obj.chairtype
					if (Object.keys(tempeObj).length > 0) {
						return tempeObj[type] || ''
					}
				}
				// console.log(type)
				const typeObj = {
					'01': 'GTW100', //GTW-100
					'02': 'GT890M',
					'03': 'GT890MF',
					'04': 'GT909MF',
					'05': 'GT208M',
					'06': 'ACE-PRO',
					'07': 'ACE-DRAGON',
					'08': 'ACE-ZEUS',
					'09': 'ACE-MARS',
					'0a': 'ACE-ARTHUR',
					'0b': 'ACE-320PLS',
					'0c': 'H7237',
					'0d': 'H7134M',
					'0e': 'ARTHAS',
					'0f': 'GB-BRC-02',
					'10': 'GT901MF',
					'11': 'GT-Accompany',
					'12': 'GT-LVY',
					'13': 'IMPERIAL',
					// '14': 'GT890-SEAT',
					'15': 'MTFUJI',
					'16': 'VISSEL',
					// '17': 'FR-02', //暂定
					'18': 'GT-LYNCK-HOME-F', //木箱音响
					'19': 'GT-Spker-2', //电竞音响
					'20': 'GT-LYNCK-PRO-3', //电竞木箱音响
					'21': 'GT-LYNCK-HOME-B', //沙发音响
					'22': 'GTP-800',
					'23': 'LUFT-600-Speaker',
					'24': 'GTW-100-BLK',
					'25': 'X3-ZEUS', //1
					'26': 'X3-890', //
					'27': 'GTW-500-BLK',
					'28': 'IIILV', //
					'29': 'SAMURAI',
					'2a': 'SAKURA', //
				}
				return typeObj[type] || ''
			},
			checklighModel(type) {
				console.log(type)
				console.log("AAAAA")
				let lightTyple = uni.getStorageSync("chairInfo")
				// console.log(lightTyple)
				if (lightTyple.length > 0) {
					let obj = JSON.parse(lightTyple)
					let tempeObj = obj.lightTyple
					if (Object.keys(tempeObj).length > 0) {
						return tempeObj[type] || ''
					}
				}
				const typeObj = {
					'02': 'LUFT-600-LS',
					'03': 'GTP-600',
				}
				return typeObj[type] || ''
			},
			checkScooter(type) { //判断滑板车的类型
			},
			checkHeart(type) {


				let lightTyple = uni.getStorageSync("chairInfo")
				if (lightTyple.length > 0) {
					let obj = JSON.parse(lightTyple)

					let tempeObj = obj.heartModels

					if (Object.keys(tempeObj).length > 0) {
						return tempeObj[type] || ''
					}
				}
				let typeObj = {
					'01': 'H7135',
				}
				return typeObj[type] || ''
			},
			checkmassager(type) {

				let lightTyple = uni.getStorageSync("chairInfo")
				if (lightTyple.length > 0) {
					let obj = JSON.parse(lightTyple)
					let tempeObj = obj.massager
					if (Object.keys(tempeObj).length > 0) {
						return tempeObj[type] || ''
					}
				}
				let typeObj = {
					'01': 'H7135', //TODO更换默认的
				}
				return typeObj[type] || ''
			},
			checkhomeApplineces(type) {

				let lightTyple = uni.getStorageSync("chairInfo")
				if (lightTyple.length > 0) {
					let obj = JSON.parse(lightTyple)
					let tempeObj = obj.homeAppliances
					if (Object.keys(tempeObj).length > 0) {
						return tempeObj[type] || ''
					}
				}
				let typeObj = {
					'01': 'EH02-WT', //TODO更换默认的
				}
				return typeObj[type] || ''
			},
			// 获取蓝牙设备
			getBlueToothDevice(devices) {
				// hugo todo 分别过滤不同设备电竞椅 接收器 灯条
				// console.log('devices', devices)
				const result = devices.map(el => {
					const tempData = ab2hex(el.advertisData)
					// console.log('tempData', tempData)
					var flag = tempData.slice(4, 12) === '14170713'
					if (flag) {
						return {
							...el,
							type: 3,
							model: this.checkModel(tempData.slice(12, 14))
						}
					}
					if (!flag) {
						// 判断是否是按摩
						if (el.advertisServiceUUIDs && el.advertisServiceUUIDs[0] ===
							'0000FFFE-0000-1000-8000-00805F9B34FB') { //TODO 更换 ID
							const Data = ab2hex(el.advertisData)
							return {
								...el,
								type: 6,
								model: this.checkmassager(Data.slice(12, 14)) //TODO 更换 ID
							}
						}
					}
					if (!flag) {
						// 判断是否是家电
						// console.log('加湿器')
						if (el.advertisServiceUUIDs && el.advertisServiceUUIDs[0] ===
							'0000AF32-0000-1000-8000-00805F9B34FB') { //TODO 更换 ID
							const Data = ab2hex(el.advertisData)
							return {
								...el,
								type: 7,
								model: this.checkhomeApplineces(Data.slice(12, 14)) //TODO 更换 ID
							}
						}
					}


					if (!flag) {
						// 判断是不是滑板车
						if (el.advertisServiceUUIDs && el.advertisServiceUUIDs[0] ===
							'0000FEFF-0000-1000-8000-00805F9B34FB') {
							return {
								...el,
								type: 2,
							}
						}
					}
					if (!flag) { //心率

						if (el.advertisServiceUUIDs && el.advertisServiceUUIDs[0] ===
							"6E403900-B5A3-F393-E0A9-E50E24DCCA9E") {

							// console.log(ab2hex(el.advertisData))
							const Data = ab2hex(el.advertisData)
							// console.log(Data)
							return {
								...el,
								model: this.checkHeart(Data.slice(0, 2)),
								type: 4,
							}
						}
					}
					if (!flag) { //判断是不是跑步机
						if (el.advertisServiceUUIDs && el.advertisServiceUUIDs[0] ===
							'00001826-0000-1000-8000-00805F9B34FB') {
							return {
								...el,
								type: 5,
							}
						}
					}
					if (!flag) {
						if (el.advertisServiceUUIDs && el.advertisServiceUUIDs[0] ===
							'0000AF30-0000-1000-8000-00805F9B34FB') {
							const Data = ab2hex(el.advertisData)
							// console.log(Data)
							if (Data) {
								return {
									...el,
									model: this.checklighModel(Data.slice(12, 14)),
									type: 1
								}
							}
							return {
								...el,
								type: 1,
								model: ''
							}
						}
					}

					return {
						...el,
						type: 1
					}
				})
				setTimeout(() => {
					// 如果有长度的话
					if (result.length) {
						const tempList = result.filter(el => {
							const index = this.deviceList.findIndex(i => {
								return el.deviceId === i.deviceId
							})
							if (index < 0) {
								return true
							}
							return false
						})
						tempList.map(el => {
							const mindex = this.detectedList.findIndex(item => item.type === 6 && item
								.model.length === 0);
							if (mindex !== -1) this.detectedList.splice(mindex, 1);

							const index = this.detectedList.findIndex(i => {
								return el.deviceId === i.deviceId
							})
							if (index < 0) {
								this.detectedList.push(el)
							}
						})
					}
					this.hasDetectedOnce = true
				}, 2000)
			},
			// 将16进制的内容转成我们看得懂的字符串内容
			hexCharCodeToStr(hexCharCodeStr) {
				//有效字符
				var validStr = "";
				//组装的mac
				var resultStr = "";
				var tmp = "";
				var maclength = macAdd.length;
				//只有数字或字母
				var reg = new RegExp(/^[a-zA-Z0-9]+$/);
				//汉字
				var patrn = new RegExp("[\\u4E00-\\u9FFF]+", "g");

				for (var j = 0; j < maclength; j++) {
					//从第一个字母或数字开始
					if (reg.test(macAdd[j])) {
						//第一个有效字符后面没有12个字符
						if ((j + 12) > maclength) {
							break;
						} else {
							var validStr1 = macAdd.substring(j, j + 12);
							//没有中文,截取字符串
							if (!patrn.exec(validStr1)) {
								validStr = validStr1;
								break;
							} else {
								//有中文
								break;
							}
						}
					} else {
						continue;
					}
				}
				//如果截取到了有效字符串,开始组装FF-FF-FF-FF-FF-FF
				if (validStr != "" && validStr.length == 12) {
					for (var n = 0; n < 6; n++) {
						resultStr = validStr.substring(2 * n, 2 * n + 2);
						if (n < 5) {
							resultStr = resultStr + "-";
						}
						tmp = tmp + resultStr;
					}
				}
				resultStr = tmp;
				return resultStr;
			},
			// 确保当前蓝牙打开
			checkBlueToothAvailable() {
				// TODO: 判断蓝牙按钮
			},
			// 蓝牙回调失败
			handleErrorBlueToothCallback() {
				const isBlueToothAvailable = this.checkBlueToothAvailable() //当前设备是否开启蓝牙
				const noDeviceDetected = false // 没有设备被检测到
				const type = 'plain'
				let content = ''
				if (isBlueToothAvailable) content = this.$('detectPage.bluetoothHint')
				if (noDeviceDetected) content = this.$('detectPage.noDeviceHint')
				if (content) this.$toast({
					content,
					type
				})
			},
			addDevice() {
				let that = this
				console.log('addDevice', this.detectedList[this.selectedDeviceIndex])
				if (this.connecting) return
				this.connecting = true
				this.$loading('', false)
				const item = this.detectedList[this.selectedDeviceIndex]
				this.currentSelectDevice = JSON.parse(JSON.stringify(item))
				if (item.type === 1) {
					// 灯条
					let serviceId = '0000AE31-0000-1000-8000-00805F9B34FB'
					let characteristicId = '0000AE02-0000-1000-8000-00805F9B34FB'
					let notifyCharacteristicId = '0000AE06-0000-1000-8000-00805F9B34FB'
					// 设备链接已开始，等待甲板响应，响应后处理代码请写在上下文： getBLEDeviceCharacteristics 处
					createBLEConnection({
						deviceId: item.deviceId,
						serviceId,
						notifyCharacteristicId,
						characteristicId
					})
				}
				if (item.type === 2) {
					//滑板车
					let serviceId = '00007777-0000-1000-8000-00805F9B34FB'
					let characteristicId = '00008877-0000-1000-8000-00805F9B34FB'
					let notifyCharacteristicId = '00008888-0000-1000-8000-00805F9B34FB'
					// 设备链接已开始，等待甲板响应，响应后处理代码请写在上下文： getBLEDeviceCharacteristics 处
					createBLEConnection({
						deviceId: item.deviceId,
						serviceId,
						notifyCharacteristicId,
						characteristicId
					})
				}
				if (item.type === 3) {
					// 接收器
					let serviceId = '00007001-0000-1000-8000-00805F9B34FB'
					let characteristicId = '00006001-0000-1000-8000-00805F9B34FB'
					let notifyCharacteristicId = '00006002-0000-1000-8000-00805F9B34FB'

					uni.setBLEMTU({
						deviceId: item.deviceId,
						mtu: 300
					})
					// 设备链接已开始，等待甲板响应，响应后处理代码请写在上下文： getBLEDeviceCharacteristics 处
					createBLEConnection({
						deviceId: item.deviceId,
						serviceId,
						notifyCharacteristicId,
						characteristicId
					})
				}
				if (item.type === 4) {
					//心率
					//需要修改
					let serviceId = '6E403900-B5A3-F393-E0A9-E50E24DCCA9E'
					let characteristicId = '6E403901-B5A3-F393-E0A9-E50E24DCCA9E'
					let notifyCharacteristicId = '6E403903-B5A3-F393-E0A9-E50E24DCCA9E'
					// 设备链接已开始，等待甲板响应，响应后处理代码请写在上下文： getBLEDeviceCharacteristics 处
					// console.log(item.deviceId)
					createBLEConnection({
						deviceId: item.deviceId,
						serviceId,
						notifyCharacteristicId,
						characteristicId
					})
				}
				if (item.type === 5) {
					//走步机
					let serviceId = '00001826-0000-1000-8000-00805F9B34FB'
					let characteristicId = 'A580D216-7087-5E6C-36B3-77C02F551C85'
					let notifyCharacteristicId = '00002ADA-0000-1000-8000-00805F9B34FB'
					createBLEConnection({
						deviceId: item.deviceId,
						serviceId,
						notifyCharacteristicId,
						characteristicId
					})
				}

				if (item.type === 6) {
					//按摩器
					let serviceId = '0000FFF0-0000-1000-8000-00805F9B34FB'
					let characteristicId = '0000FFF1-0000-1000-8000-00805F9B34FB'
					let notifyCharacteristicId = '0000FFF2-0000-1000-8000-00805F9B34FB'
					createBLEConnection({
						deviceId: item.deviceId,
						serviceId,
						notifyCharacteristicId,
						characteristicId
					})
				}

				if (item.type === 7) {
					//按摩器
					let serviceId = '0000AE32-0000-1000-8000-00805F9B34FB'
					let characteristicId = '0000AE02-0000-1000-8000-00805F9B34FB'
					let notifyCharacteristicId = '0000AE06-0000-1000-8000-00805F9B34FB'
					createBLEConnection({
						deviceId: item.deviceId,
						serviceId,
						notifyCharacteristicId,
						characteristicId
					})
				}
			},
			handleDeviceDetail() {
				const {
					type,
					deviceId
				} = this.currentSelectDevice;
				const {
					route
				} = this.DEVICE_OPTIONS[type]
				console.log('route', route);
				if (!route) {
					this.errArr.push({
						type: '未知设备类型',
						err: type
					})
					console.warn('未知设备类型')
					return
				}
				this.$redirectTo(route, {
					'deviceId': deviceId,
					'lanch': true
				})
			}
		},
		beforeDestroy() {

			// {
			// 	"characteristics": [{
			// 		"properties": {
			// 			"indicate": false,
			// 			"notify": false,
			// 			"read": true,
			// 			"write": true
			// 		},
			// 		"uuid": "0000FFF1-0000-1000-8000-00805F9B34FB"
			// 	}, {
			// 		"properties": {
			// 			"indicate": false,
			// 			"notify": true,
			// 			"read": false,
			// 			"write": false
			// 		},
			// 		"uuid": "0000FFF2-0000-1000-8000-00805F9B34FB"
			// 	}],
			// 	"errMsg": "getBLEDeviceCharacteristics:ok"
			// }


			stopBluetoothDevicesDiscovery()
		},
	}
</script>

<style lang="scss" scoped>
	.nagavit_box {
		display: flex;
		justify-content: flex-start;
		align-content: center;
		padding: 0 30rpx;

		.mback-icon {
			width: 60rpx;
			height: 60rpx;
		}

		.back_title {
			width: calc(100% - 100rpx);
			font-size: 48rpx;
			font-weight: bold;
			color: #000000;
			line-height: 66rpx;
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}

	.detect-page {
		// padding: 32rpx;

		// background-color: #f7f7f7;
		// min-height: 100vh;
		padding-top: 0 !important;
		padding-bottom: -100px !important;
		position: relative;

		.searchCover {
			width: 100%;
			height: 100vh;
			padding-top: 20rpx;
			// margin-top: 200rpx;
			position: relative;
			z-index: 100;


			.strpke-text {
				font-size: 50px;
				color: white;
				white-space: pre-wrap;
				text-align: center;

				text-shadow:
					-1px -1px 0 rgba(145, 17, 36, 1),
					1px -1px 0 rgba(145, 17, 36, 1),
					-1px 1px 0 rgba(145, 17, 36, 1),
					1px 1px 0 rgba(145, 17, 36, 1);
			}

			.center_image {
				width: 100%;
				margin-top: 60rpx;
				position: relative;
				z-index: 103;
				margin-bottom: 120rpx;

				.main-img {
					display: block;
					width: 100%;
					z-index: 104;
				}

				.blur-edge {
					position: absolute;
					left: 0;
					right: 0;

					height: 40px; // 虚化区域高度
					z-index: 105;

					&::after {
						content: '';
						position: absolute;
						width: 100%;
						height: 200%; // 扩大绘制区域
						filter: blur(8px);
					}
				}

				.top-edge {
					top: -80rpx;

					&::after {
						background: linear-gradient(to top, // 关键修改点：渐变方向改为向上
								rgba(224, 225, 226, 1) 20%,
								rgba(224, 225, 226, 0) 80%);
						transform: translateY(-30%);
					}
				}

				.bottom-edge {
					bottom: 9rpx;

					&::after {
						background: linear-gradient(to bottom, // 关键修改点：保持向下但调整定位
								rgba(224, 225, 226, 1) 20%,
								rgba(224, 225, 226, 0) 80%);
						transform: translateY(30%);
					}
				}
			}

			.Buttons_box {
				display: flex;
				justify-content: center;
				align-items: center;
				margin-top: 30rpx;
				height: 100rpx;
				border-radius: 50rpx;
				border: 4rpx solid rgba(145, 17, 36, 1);
				width: 600rpx;
				margin-left: calc(50% - 300rpx);
				font-size: 40rpx;

				image {
					width: 60rpx;
					height: 60rpx;
					margin-right: 10rpx;
				}
			}


		}

		&__title {
			font-size: 48rpx;
			font-weight: bold;

		}

		&__blue-tooth {
			display: flex;
			justify-content: center;
			align-items: center;
			// margin-top: 280rpx;
			// position: relative;
			position: absolute;
			top: 280rpx;
			left: 0;
			right: 0;
			z-index: 1;



			.inner {
				display: flex;
				position: relative;
				justify-content: center;
				align-items: center;
				width: 80rpx;
				height: 80rpx;
				background-color: rgba(0, 0, 0, 0);
				border-radius: 50%;
				box-shadow: 0rpx 2rpx 8rpx 4rpx rgba(145, 17, 36, 1);
				z-index: 2;

				// 
				image {
					width: 80rpx;
					height: 80rpx;
				}

				&::after,
				&::before {
					content: '';
					position: absolute;
					top: 0;
					left: 0;
					transform-origin: center;
					width: 100%;
					height: 100%;
					border-radius: 50%;
					box-shadow: 0rpx 2rpx 8rpx 4rpx rgba(145, 17, 36, 1);
					transform: scale(1);
				}

				&::after {
					transform: scale(1.37);
				}

				&::before {
					transform: scale(1.37);
				}

				&.detect-animation::after {
					animation: pulse 1s infinite;
					transform: scale(1);
					animation-delay: 0.4s;
				}

				&.detect-animation::before {
					animation: pulse 1s infinite;
					transform: scale(1.3);
				}

				@keyframes pulse {
					0% {
						transform: scale(1);
					}

					10% {
						transform: scale(1.6)
					}

					20% {
						transform: scale(2.2)
					}

					30% {
						transform: scale(2.8)
					}

					40% {
						transform: scale(3.4)
					}

					50% {
						transform: scale(4.0);
					}

					60% {
						transform: scale(4.6);
					}

					70% {
						transform: scale(5.2);
					}

					80% {
						transform: scale(5.6);
						opacity: 0.8;
					}

					90% {
						transform: scale(6.2);
						opacity: 0.6;
					}

					100% {
						transform: scale(6.8);
						opacity: 0.1;
					}
				}
			}


			.inner2 {
				display: flex;
				position: absolute;
				justify-content: center;
				align-items: center;
				width: 100rpx;
				height: 100rpx;
				background-color: rgba(0, 0, 0, 0);
				border-radius: 50%;
				box-shadow: 0rpx 2rpx 8rpx 4rpx rgba(145, 17, 36, 1);

				// 
				image {
					width: 100rpx;
					height: 100rpx;
				}

				&::after,
				&::before {
					content: '';
					position: absolute;
					top: 0;
					left: 0;
					transform-origin: center;
					width: 100%;
					height: 100%;
					border-radius: 50%;
					box-shadow: 0rpx 2rpx 8rpx 4rpx rgba(145, 17, 36, 1);
					transform: scale(1);
				}

				&::after {
					transform: scale(1.37);
				}

				&::before {
					transform: scale(1.37);
				}

				&.detect-animation::after {
					animation: pulse 1.5s infinite;
					transform: scale(1);
					animation-delay: 0.6s;
				}

				&.detect-animation::before {
					animation: pulse 1.5s infinite;
					transform: scale(1.3);
				}

				@keyframes pulse {
					0% {
						transform: scale(1);
					}

					10% {
						transform: scale(1.6)
					}

					20% {
						transform: scale(2.2)
					}

					30% {
						transform: scale(2.8)
					}

					40% {
						transform: scale(3.4)
					}

					50% {
						transform: scale(4.0);
					}

					60% {
						transform: scale(4.6);
					}

					70% {
						transform: scale(5.2);
					}

					80% {
						transform: scale(5.6);
						opacity: 0.8;
					}

					90% {
						transform: scale(6.2);
						opacity: 0.6;
					}

					100% {
						transform: scale(6.8);
						opacity: 0.1;
					}
				}
			}

		}

		.Buttons_box {
			display: flex;
			justify-content: center;
			align-items: center;
			margin-top: 30rpx;
			height: 100rpx;
			border-radius: 50rpx;
			border: 4rpx solid rgba(145, 17, 36, 1);
			width: 600rpx;
			margin-left: calc(50% - 300rpx);
			font-size: 40rpx;

			image {
				width: 60rpx;
				height: 60rpx;
				margin-right: 10rpx;
			}
		}

		&__hint {
			margin-top: 148rpx;
			text-align: center;
			line-height: 44rpx;
			font-size: 32rpx;
		}

		// 提示
		&__error-hint {
			margin: 150rpx 0 0;
			padding: 0 0;

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

		&__actions {

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

		// 结果页

		&__device-list {
			padding: 32rpx;
			white-space: nowrap;
			overflow-x: scroll;

			.device {
				width: 112rpx;
				height: 112rpx;
				border-radius: 100%;
				transform-origin: center;
				transition: all 0.33s;
				display: inline-flex;
				justify-content: center;
				align-items: center;
				border: 1px solid #D7D7D7;
				background: #fff;

				&:not(:first-child) {
					margin-left: 32rpx;
				}

				&__cover {
					width: 70rpx;
					min-height: 70rpx;
				}

				&.selected {
					background: #F0F0F0;
					transform: scale(1.18);
					border-color: #333333;
				}

			}
		}

		&__device-cover {
			text-align: center;

			image {
				width: 540rpx;
				margin: 40rpx auto 0;
			}
		}

		&__result-hint {
			margin: 40rpx auto 0;
			width: 400rpx;
			font-weight: bold;
			font-size: 32rpx;
		}
	}
</style>