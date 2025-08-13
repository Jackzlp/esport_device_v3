<template>
	<view class="device-list">
		<view v-for="(device, index) in deviceList" :key="index" class="device">
			<view style="position: relative;" class="device__image" @click="linkDevice(device)">
				<uni-icons v-if="statusChang" @click="handleDeleteDevice(device)" type="clear" size="30"
					style="width: 50rpx;height: 50rpx;top: 20rpx;left: 20rpx;position: absolute;z-index: 10;"></uni-icons>

				<!-- 	<image style="width: 50rpx;height: 50rpx;top: 30rpx;left: 20rpx;position: absolute;" v-if="statusChang"
					src="../../../static/images/clear-input.png" @click="handleDeleteDevice(device)"></image>
 -->
				<!-- <view
        class="device__image"
        @click="handleDeviceDetail(device)"
      > -->
				<chaceImage class="device-cover" mode="widthFix"
					:fileMd5="DEVICE_OPTIONS[device.type].cover(device.model)"
					:url='DEVICE_OPTIONS[device.type].cover(device.model)'></chaceImage>

				<!-- <image class="device-cover" mode="widthFix" :src="DEVICE_OPTIONS[device.type].cover(device.model)" /> -->
			</view>

			<view class="device__actions">
				<view class="device__name">
					{{ device.name }}
				</view>
				<!-- <u-switch v-if="DEVICE_OPTIONS[device.type].showPower" v-model="device.state" :disabled="connecting"
					active-color="#36EE54" size="20" inactive-color="#E7E7E7"
					@change="handleDeviceChangeStatus(device, index)" /> -->
			</view>
		</view>
		<!-- <view style="padding-top: 100px;height: 50px;background-color: antiquewhite;" @click="GotoBoxAndChair">组合样式
		</view> -->

	</view>
</template>

<script>
	import {
		DEVICE_OPTIONS
	} from '../constant'
	import {

		mapState
	} from 'pinia'
	import {
		getConnectedBluetoothDevices,
		createBLEConnection,
		setCallBackFn,
		initBLEdevice2,
		wData,
		closeBluetoothAdapter
	} from '../../device/BLE/BLEfunction'
	import {
		useDeviceStore
	} from '../../../store/device'

	import chaceImage from '@/components/image-cache'
	export default {
		name: 'HomeDeviceList',
		props: {
			forceUpdateFlag: {
				type: Boolean,
				default: false
			},
			statusChang: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				DEVICE_OPTIONS,
				errArr: [],
				GroupList: [],
				temArr: [],
				serviceid_list: [],
				deviceStore: useDeviceStore()
			}
		},
		components: {
			chaceImage
		},
		computed: {
			...mapState(useDeviceStore, ['deviceList', 'activeDeviceId', 'changeStatus', 'connecting'])
		},
		watch: {
			forceUpdateFlag() {
				this.$forceUpdate()
			},
			statusChang(newValue) {
				// console.log(newValue)
			}
		},


		methods: {
			// ...mapActions('device', ['getDeviceList', 'setActiveDeviceId', 'saveCurrentDevice', 'setChangeStatus',
			// 	'setConnecting', 'deleteDevice'
			// ]),

			// 删除设备
			handleDeleteDevice(device) {
				console.log(device)
				setTimeout(() => {
					closeBluetoothAdapter()
					this.deviceStore.setConnecting(false)
				}, 1000)
				this.deviceStore.deleteDevice(device)
			},
			GotoBoxAndChair() {

				this.GroupList = []
				this.deviceList.forEach(item => {
					if (this.GroupList.length < 3 && item.type === 3) {
						this.GroupList.push(item)
					}
				})
				// console.log(this.GroupList)
				if (this.GroupList.length === 2) {
					this.LinkGroupDevice(this.GroupList[0])
					setTimeout(() => {
						this.LinkGroupDevice(this.GroupList[1])
					}, 3000)
				}
			},

			LinkGroupDevice(device) {
				this.linkDevice(device, true)
			},

			// 跳转设备详情
			handleGroupDeviceDetail(deviceList, services_list) {
				uni.navigateTo({
					url: '/pages/device/BoxAndChair/index?list=' + JSON.stringify(this.GroupList) +
						"&services_list=" + JSON.stringify(services_list),
					success() {},
					fail() {}
				})
			},


			// 设备状态切换的时候
			handleDeviceChangeStatus(device, index) {
				if (this.connecting) return
				this.deviceStore.setChangeStatus(true)
				// TODO: 切换设备状态
				this.currentOptionIndex = index
				this.linkDevice(device)
			},
			checkConnectStatus(device) {
				getConnectedBluetoothDevices(
					res => {
						console.log('getConnectedBluetoothDevices', res)
						if (res && res.devices && res.devices.length === 0) {
							this.linkDevice(device)
						} else {
							// hugo todo 判断当前链接的设备是不是点击的设备
							console.log("AASSSS")
							this.handleDeviceDetail(device)
						}
					},
					err => {
						this.linkDevice(device)
						console.log('getConnectedBluetoothDevices', err)
					})
			},

			linkDevice(device, group) {
				// console.log(this.connecting, this.statusChang)
				if (!group) {
					if (this.connecting) return
					this.deviceStore.setConnecting(true)
					if (this.statusChang == true) {
						return
					}
				}
				// hugo todo 检查蓝牙是否开启，检查蓝牙是否初始化
				initBLEdevice2(res1 => {
						console.log(res1, '“本机设备的蓝牙已打开”')
						this.setCallBackFnLoc(device, group)
						console.log('device', device)
						let serviceId = '0000AE31-0000-1000-8000-00805F9B34Fb'
						let characteristicId = '0000AE02-0000-1000-8000-00805F9B34FB'
						let notifyCharacteristicId = '0000AE06-0000-1000-8000-00805F9B34FB'
						switch (device.type) {
							case 1:
								serviceId = '0000AE31-0000-1000-8000-00805F9B34FB'
								characteristicId = '0000AE02-0000-1000-8000-00805F9B34FB'
								notifyCharacteristicId = '0000AE06-0000-1000-8000-00805F9B34FB'
								break;
							case 2:
								serviceId = '00007777-0000-1000-8000-00805F9B34FB'
								characteristicId = '00008877-0000-1000-8000-00805F9B34FB'
								notifyCharacteristicId = '00008888-0000-1000-8000-00805F9B34FB'
								break;
							case 3:
								serviceId = '00007001-0000-1000-8000-00805F9B34FB'
								characteristicId = '00006001-0000-1000-8000-00805F9B34FB'
								notifyCharacteristicId = '00006002-0000-1000-8000-00805F9B34FB'
								break;
							case 4:
								serviceId = '6E403900-B5A3-F393-E0A9-E50E24DCCA9E'
								characteristicId = '6E403901-B5A3-F393-E0A9-E50E24DCCA9E'
								notifyCharacteristicId = '6E403903-B5A3-F393-E0A9-E50E24DCCA9E'
								break;
							case 5:
								serviceId = '00001826-0000-1000-8000-00805F9B34FB'
								characteristicId = '00002AD9-0000-1000-8000-00805F9B34FB'
								notifyCharacteristicId = '00002ADA-0000-1000-8000-00805F9B34FB'

								break;

							case 6:
								serviceId = '0000FFF0-0000-1000-8000-00805F9B34FB'
								characteristicId = '0000FFF1-0000-1000-8000-00805F9B34FB'
								notifyCharacteristicId = '0000FFF2-0000-1000-8000-00805F9B34FB'
								break;

							case 7:
								serviceId = '0000AE32-0000-1000-8000-00805F9B34FB'
								characteristicId = '0000AE02-0000-1000-8000-00805F9B34FB'
								notifyCharacteristicId = '0000AE06-0000-1000-8000-00805F9B34FB'
								break;

							default:
								break;
						}

						// if (device.type === 5) {
						// 	return
						// }

						this.$loading('', false)
						createBLEConnection({
							deviceId: device.deviceId,
							serviceId,
							notifyCharacteristicId,
							characteristicId
						})
					},
					error => {
						if (this.changeStatus) {
							this.deviceList[this.currentOptionIndex].state = !this.deviceList[this.currentOptionIndex]
								.state
						}
						this.deviceStore.setChangeStatus(false)
						this.deviceStore.setConnecting(false)
						console.log('getBluetoothAdapterState', error)
						// 蓝牙未打开
						this.$toast({
							content: this.$t('bluetoothHintRelate.bluetoothNotEnabled'),
							type: 'plain'
						})
					})
			},
			sendDatatoBle(device) {
				let tempData = ''
				const type = device.type
				switch (type) {
					case 1:
						if (device.state) {
							tempData = 'AA5501010101010355AA'
						} else {
							tempData = 'AA5501010102010455AA'
						}
						break;
					case 2:
						tempData = 'FF02030AFFAA'
						break;

					default:
						break;
				}
				setTimeout(() => {
					wData(tempData, sres => {
						this.closeBleLink(device)
						console.log('sendFnSuc', sres)
					}, err => {
						this.closeBleLink(device)
						console.log('sendFnErr', err)
					})
				}, 200)
			},
			closeBleLink(device) {

				uni.closeBLEConnection({
					deviceId: device && device.deviceId,
					success() {
						console.log('蓝牙适配器已关闭');
					},
					fail(err) {
						console.log('关闭蓝牙适配器失败', err);
					}
				});

			},
			setCallBackFnLoc(device, group) {
				const that = this
				setCallBackFn({
					suc(type, devices) {
						switch (type) {
							case 'getBLEDeviceServices':
								// 已与目标蓝牙设备建立链接
								if (!group) {
									that.hasDetectedOnce = true
								}
								break;
							case 'getBLEDeviceCharacteristics':
								if (!group) {
									setTimeout(() => {
										that.deviceStore.setChangeStatus(false)
										that.$hideLoading()
									}, 300)
									// 目标蓝牙已在甲板上，可供调遣状态，此时蓝牙搜索已停止，将不会反馈新设备
									if (that.changeStatus) {
										that.sendDatatoBle(device)
									} else {
										that.handleDeviceDetail(device)
									}
								} else {
									let index = that.serviceid_list.findIndex(tem => {
										return tem.deviceId === devices.deviceId
									})
									if (index === -1) {
										that.serviceid_list.push(devices)
									}
									if (that.serviceid_list.length == 2) {
										console.log(that.serviceid_list)
										that.$hideLoading()
										that.handleGroupDeviceDetail(that.GroupList, that.serviceid_list)
									}
								}
								break;
							default:
								break;
						}
					},
					fail(type, err) {

						that.GroupList.map(item => {
							that.closeBleLink(item)
						})
						let str = ''
						setTimeout(() => {
							that.$hideLoading()
							if (!group) {
								if (that.changeStatus) {
									that.deviceList[that.currentOptionIndex].state = !that.deviceList[that
										.currentOptionIndex].state
								}
								that.deviceStore.setChangeStatus(false)
								that.deviceStore.setConnecting(false)
							}

						}, 200)
						switch (type) {
							case 'openBluetoothAdapter':
								//蓝牙未打开
								console.log(type, err)
								// 蓝牙未打开
								that.$toast({
									content: that.$t('bluetoothHintRelate.bluetoothNotEnabled'),
									type: 'plain'
								})
								break;
							case 'getBluetoothAdapterState':
								//蓝牙状态不对
								that.$toast({
									content: that.$t('bluetoothHintRelate.bluetoothStatusIncorrect'),
									type: 'plain'
								})
								// console.log(type, err)
								break;
							case 'startBluetoothDevicesDiscovery':
								//蓝牙搜索有问题
								that.$toast({
									content: that.$t('bluetoothHintRelate.bluetoothSearchIssue'),
									type: 'plain'
								})
								console.log(type, err)
								break;
							case 'createBLEConnection':
								//蓝牙链接设备失败
								if (!group) {}
								// console.log(type, device.deviceId)
								try {
									str = JSON.stringify(err)
								} catch (error) {
									str = err
								}
								that.errArr.push({
									type,
									err: str
								})


								setTimeout(() => {
									// 蓝牙链接失败
									that.$toast({
										content: that.$t(
											'bluetoothHintRelate.bluetoothConnectionFailed'),
										type: 'plain',
										duration: 3000
									})
								}, 600)
								break;
							case 'getBLEDeviceServices':
								// 获取蓝牙设备服务失败
								that.$toast({
									content: that.$t('bluetoothHintRelate.bluetoothDeviceServiceFailed'),
									type: 'plain'
								})
								console.log(type, err)
								break;
							case 'getBLEDeviceCharacteristics':
								// 获取蓝牙设备角色失败
								that.$toast({
									content: that.$t('bluetoothHintRelate.bluetoothDeviceRoleFailed'),
									type: 'plain'
								})
								console.log(type, err)
								break;
							default:
								break;
						}
					}
				})
			},

			// 跳转设备详情
			handleDeviceDetail(device) {
				const {
					type,
					id
				} = device;
				const {
					route
				} = this.DEVICE_OPTIONS[type]
				console.log('route', route);
				if (!route) return console.warn('未知设备类型')
				this.deviceStore.saveCurrentDevice(device)
				this.$navigateTo(route, {
					deviceId: id
				})
			}
		},


	}
</script>

<style lang="scss" scoped>
	.device-list {
		display: flex;
		flex-wrap: wrap;
		padding: 48rpx 24rpx;
		width: 100%;
		padding-bottom: 120rpx;
		// background-color: red;


		.device {
			width: calc(50% - 16rpx);
			box-sizing: border-box;

			background: #fff;
			border-radius: 16rpx;
			min-height: 220rpx;

			&:nth-child(2n) {
				margin-left: 24rpx;
			}

			&:nth-child(n + 3) {
				margin-top: 24rpx;
			}

			&__image {
				padding: 24rpx 24rpx 0;

				.device-cover {
					width: 100%;
				}

			}

			&__name {
				font-size: 28rpx;
			}

			&__actions {
				display: flex;
				padding: 16rpx;
				justify-content: space-between;
				align-items: flex-end;
			}
		}

		.device__name {
			width: 100%;
			text-overflow: ellipsis;
			white-space: nowrap;
			overflow: hidden;
		}
	}
</style>