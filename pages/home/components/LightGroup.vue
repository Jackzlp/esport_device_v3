<template>
	<view style="width: 100%;padding: 0 32rpx 50rpx 32rpx;">
		<view class="help_box" v-if="isFirstGroup">
			<view class="help_title_box">
				<view class="help_title">{{$t('setting_page.help_center')}}</view>
				<image @click="closeHelp" src="../../../static/images/clear-input.png"></image>
			</view>
			<view class="help_content">
				<image mode="widthFix" src="../../../static/images/343x288@3x.png"></image>
			</view>
		</view>
		<view v-if="SelectArr.length && isFirstGroup === false" class="device-list">
			<view v-for="(device, index) in SelectArr" :key="index" class="device">
				<view style="position: relative;" class="device__image" @click="handleDeviceDetail(device,index)">
					<uni-icons @click="handleDeviceDetail(device,index)"
						:type="device.select == true?'checkbox':'circle'" size="30"
						style="width: 50rpx;height: 50rpx;top: 20rpx;left: 20rpx;position: absolute;"></uni-icons>
					<!-- <image class="device-cover" mode="widthFix"
						:src="DEVICE_OPTIONS[device.type].cover(device.model)" /> -->
					<chaceImage class="device-cover" mode="widthFix"
						:fileMd5="DEVICE_OPTIONS[device.type].cover(device.model)"
						:url='DEVICE_OPTIONS[device.type].cover(device.model)'></chaceImage>
					<image class="device-cover__image" v-if="device.specialDevice"
						src="../../../static/images/device/boxInfo.png"></image>
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
		</view>
		<!-- </view> -->
		<view v-if="SelectArr.length && isFirstGroup === false" class="Group_Connect" @click="GotoBoxAndChair">
			{{this.$t("combine")}}
		</view>
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


	import chaceImage from '@/components/image-cache'
	export default {
		name: 'LightGroup',
		props: {
			SelectArr: {
				type: Array,
				default: [],
			},
		},
		components: {
			chaceImage
		},
		data() {
			return {
				DEVICE_OPTIONS,
				errArr: [],
				GroupList: [],
				temArr: [],
				serviceid_list: [],
				canClick: false,
				isFirstGroup: false
			}
		},
		created() {
			this.$forceUpdate()
			this.serviceid_list = []
			const isFirstGroup = uni.getSystemInfoSync('isFirstLight')
			if (!isFirstGroup) {
				this.isFirstGroup = true
			}
		},
		methods: {
			closeHelp() {
				this.isFirstGroup = false
				uni.setstorageSync('isFirstLight', '123')
			},
			GotoBoxAndChair() {
				if (this.canClick) return
				this.canClick = true
				this.GroupList = []
				this.serviceid_list = []
				this.SelectArr.forEach(item => {
					if (item.select === true) {
						this.GroupList.push(item)
					}
				})
				if (this.GroupList.length === 2) {
					this.LinkGroupDevice(this.GroupList[0])
					setTimeout(() => {
						this.LinkGroupDevice(this.GroupList[1])
					}, 10000)
				} else {
					uni.showToast({
						title: this.$t("twodevices"),
						icon: 'none'
					})
					this.canClick = false
					// console.log("选择合适的设备")
				}
			},
			LinkGroupDevice(device) {
				this.linkDevice(device, true)
			},

			// 跳转设备详情
			handleGroupDeviceDetail(deviceList, services_list) {
				this.canClick = false
				uni.navigateTo({
					url: '/pages/device/LightDeviceGroup/LightDeviceGroup?list=' + JSON.stringify(deviceList) +
						"&services_list=" + JSON.stringify(services_list),
					success() {
						this.serviceid_list = []
						uni.setStorageSync('isFirstGroup', '123')
					},
					fail() {}
				})
			},

			linkDevice(device, group) {
				if (!group) {
					if (this.connecting) return
					this.setConnecting(true)
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
							default:
								break;
						}

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
							this.deviceList[this.currentOptionIndex].state = !this.deviceList[this
									.currentOptionIndex]
								.state
						}
						this.setChangeStatus(false)
						this.setConnecting(false)
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
				let that = this
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
										that.setConnecting(false)
										that.setChangeStatus(false)
										that.$hideLoading()
									}, 300)
									// 目标蓝牙已在甲板上，可供调遣状态，此时蓝牙搜索已停止，将不会反馈新设备
									if (that.changeStatus) {
										that.sendDatatoBle(device)
									} else {
										that.handleDeviceDetail(device)
									}
								} else {
									console.log("CCCCCCCCCCCCCCCCCCCCCCCCCCCC")
									console.log(type)
									console.log(that.serviceid_list)
									let index = that.serviceid_list.findIndex(tem => {
										return tem.deviceId === devices.deviceId
									})
									if (index === -1) {
										that.serviceid_list.push(devices)
									}
									if (that.serviceid_list.length == 2) {
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
						that.canClick = false
						that.GroupList.map(item => {
							that.closeBleLink(item)
						})
						let str = ''
						setTimeout(() => {
							that.$hideLoading()
							if (!group) {
								if (that.changeStatus) {
									that.deviceList[that.currentOptionIndex].state = !that
										.deviceList[that
											.currentOptionIndex].state
								}
								that.setChangeStatus(false)
								that.setConnecting(false)
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
									content: that.$t(
										'bluetoothHintRelate.bluetoothStatusIncorrect'),
									type: 'plain'
								})
								console.log(type, err)
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
								if (!group) {

								}
								console.log(type, device.deviceId)
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
											'bluetoothHintRelate.bluetoothConnectionFailed'
										),
										type: 'plain',
										duration: 3000
									})
								}, 600)
								break;
							case 'getBLEDeviceServices':
								// 获取蓝牙设备服务失败
								that.$toast({
									content: that.$t(
										'bluetoothHintRelate.bluetoothDeviceServiceFailed'),
									type: 'plain'
								})
								console.log(type, err)
								break;
							case 'getBLEDeviceCharacteristics':
								// 获取蓝牙设备角色失败
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
					}
				})
			},

			handleDeviceDetail(device, index) {
				this.SelectArr[index].select = !this.SelectArr[index].select
				this.$forceUpdate()
			}

		}
	}
</script>

<style lang="scss" scoped>
	.help_box {
		background-color: #fff;
		border-radius: 24rpx;
		min-height: 100vh;
		z-index: 100;

		.help_title_box {
			display: flex;
			justify-content: flex-end;
			align-items: center;
			color: black;
			font-size: 36rpx;
			padding: 20rpx;

			.help_title {
				width: calc(100% - 60rpx);
				text-align: center;
			}

			image {
				width: 60rpx;
				height: 60rpx;

			}
		}

		.help_content {
			image {
				width: calc(100% - 40rpx);
				margin-left: 20rpx;
			}
		}
	}

	.Group_Connect {

		height: 112rpx;
		color: #fff;
		background: linear-gradient(360deg, #4D4D4D 0%, #303030 100%);
		border-radius: 8px;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 36rpx;
		margin-top: 45rpx;
		padding: 48rpx 32rpx;
	}

	.device-list {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		flex-wrap: wrap;
		padding: 48rpx 0rpx;
		padding-left: 20rpx;

		.device {
			width: calc(50% - 24rpx);
			box-sizing: border-box;
			background: #fff;
			border-radius: 16rpx;
			display: inline-block;
			margin-bottom: 32rpx;


			&:nth-child(2n) {
				margin-left: 32rpx;
			}




			&__image {
				padding: 28rpx 28rpx 0;

				.device-cover {
					width: 100%;
					position: relative;
				}

				.device-cover__image {
					position: absolute;
					bottom: 0rpx;
					left: 20rpx;
					width: 40rpx;
					height: 40rpx;
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
			width: calc(50vw - 80rpx);
			text-overflow: ellipsis;
			white-space: nowrap;
			overflow: hidden;
		}
	}
</style>