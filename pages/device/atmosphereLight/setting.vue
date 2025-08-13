<template>
	<PageLayout :showWhiteBack="true" :stabarColor="'#2d2d2d'" :navigatorContentStyle="'color:#fff;'"
		:navigator-content="$t('atmosphereLightPage.settings.devicesSetting')">
		<template v-if="hasHelpCenter" slot="header-right">
			<image class="help-center-icon" :src="`/static/images/phase2/help-center.png`"
				@click="goToHelpCenter('atmosphere-light')" />
		</template>
		<view class="common-setting">
			<view class="common-setting__main">
				<view class="common-setting__title">
					{{ $t('atmosphereLightPage.settings.deviceName') }}
				</view>
				<view class="common-setting__input">
					<u-input color=" #fff" v-model.trim="config.value" :maxlength="config.maxlength"
						class="common-input"
						:placeholder="$t('atmosphereLightPage.settings.input_placeholder', { params: this.$t(`atmosphereLightPage.settings.deviceName`)})"
						border="bottom">
						<image v-if="config.value" slot="suffix" class="common-input__clear"
							:src="`/static/images/clear-input.png`" @click="clearInput" />
					</u-input>
					<view class="common-setting__input-save" @click="confirm">
						{{ $t('save') }}
					</view>
				</view>
			</view>
			<view class="common-setting__delete">
				<view class="common-button revert" @click="showDeleteDialog = true">
					{{ $t('atmosphereLightPage.settings.deleteDevice') }}
				</view>
			</view>
		</view>
		<!-- 删除设备弹窗 -->
		<DeviceDeleteDialog v-if="showDeleteDialog" @delete="handleDeleteDevice" @close="showDeleteDialog = false" />
	</PageLayout>
</template>

<script>
	import PageLayout from '@/components/page-layout'
	import DeviceDeleteDialog from '@/components/deviceDeleteDialog'
	import {

		mapState
	} from 'pinia'
	import {
		useDeviceStore
	} from '../../../store/device'
	import {
		useCommunityStore
	} from '../../../store/community'
	import {
		calcSum,
		wData,
		closeBluetoothAdapter
	} from '../BLE/BLEfunction'
	export default {
		name: 'EditProfile',
		components: {
			PageLayout,
			DeviceDeleteDialog
		},
		data() {
			return {
				scene: 'deviceName',
				sceneConfig: {
					'deviceName': {
						placeholderKey: 'deviceName',
						key: 'deviceName',
						value: '',
						maxlength: 25
					}
				},
				saveLoading: false,
				deviceName: 'Device Name',
				showDeleteDialog: false, // 删除设备的弹窗
				// 是否有帮助中心
				hasHelpCenter: false,
				deviceStore: useDeviceStore(),
				communityStore: useCommunityStore()

			}
		},

		computed: {
			...mapState(useDeviceStore, ['currentDevice']),
			config() {
				return this.sceneConfig[this.scene]
			},
			// 当前的值
			params() {
				const {
					scene
				} = this
				let result = {}

				if (scene === 'deviceName') {
					result = {
						deviceName: this.config.value
					}
				}
				return result
			}
		},

		// 场景
		onLoad() {
			this.initHelpCenter()
		},

		methods: {
			// ...mapActions('community', ['getHelpCenterCategory']),
			// ...mapActions('device', ['addDeviceList', 'deleteDevice']),

			// 初始化帮助中心
			async initHelpCenter() {
				const result = await this.communityStore.getHelpCenterCategory({
					community_id: this.communityId,
					device_id: 1
				})
				this.hasHelpCenter = Boolean(result.length)
			},
			// 确定
			confirm() {
				if (this.saveLoading) return
				if (!this.validateForm()) return
				this.saveLoading = true
				this.$loading('', false)
				this.changeDeviceName()
			},
			changeDeviceName() {
				const asciiHex = []
				for (let i = 0; i < this.config.value.length; i++) {
					asciiHex.push(this.config.value.charCodeAt(i).toString(16).padStart(2, '0'));
				}
				// Pad with '00' if less than 25 bytes
				while (asciiHex.length < 25) {
					asciiHex.push('00');
				}
				const deviceId = this.currentDevice && this.currentDevice.deviceId
				// console.log(this.currentDevice)
				// return
				const obj = {
					deviceId,
					type: 1,
					name: this.config.value,
					model: this.currentDevice.model
				}
				this.deviceStore.addDeviceList(obj)

				setTimeout(() => {
					// hugo todo 改名出错处理
					this.$hideLoading()

					this.$toast({
						content: this.$t('name_change'),
						type: 'success'
					})
					this.$switchTab('/pages/home/index')
				}, 3000)

				// Combine into string
				const hexValue = asciiHex.join('');
				wData(calcSum(`14${hexValue}`), () => {
					console.log(555)
				})
			},

			// 校验表单
			validateForm() {
				// TODO 只能是assic码以内能表示的字符，要限制
				const {
					scene
				} = this
				let value = ''
				if (scene === 'deviceName') {
					value = this.config.value
				}

				if (!value) {
					this.$toast({
						content: this.$t('atmosphereLightPage.settings.input_placeholder', {
							params: this.$t(`atmosphereLightPage.settings.${this.config.placeholderKey}`)
						}),
						type: 'error'
					})
					return false
				}
				if (!this.isAsciiString(value)) {
					this.$toast({
						content: this.$t('atmosphereLightPage.settings.text_error'),
						type: 'error'
					})
					return false
				}
				return true
			},
			isAsciiString(str) {
				for (let i = 0; i < str.length; i++) {
					const unicodeValue = str.charCodeAt(i);
					console.log('unicodeValue', unicodeValue)
					if (unicodeValue > 127) {
						return false;
					}
				}
				return true;
			},

			// 清除input
			clearInput() {
				this.sceneConfig[this.scene].value = ''
			},

			// 去到帮助中心
			goToHelpCenter(scene) {
				this.$navigateTo('/pages/helpCenter/index', {
					scene
				})
			},

			// 删除设备
			handleDeleteDevice() {
				// 删除设备
				this.deviceStore.deleteDevice(this.currentDevice)
				closeBluetoothAdapter()
				setTimeout(() => {
					this.$switchTab('/pages/home/index')
				}, 2000)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.common-setting {
		padding: 16rpx 52rpx;

		height: calc(100vh - 100rpx);
		width: 100vw;
		display: flex;
		box-sizing: border-box;
		flex-direction: column;
		justify-content: space-between;
		background: #2d2d2d;

		position: fixed;
		overflow: hidden;

		&__title {
			font-size: 48rpx;
			font-weight: bold;
			color: #fff;
			line-height: 66rpx;
		}

		.common-input {
			&__clear {
				width: 28rpx;
				height: 28rpx;
			}
		}

		&__input {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-top: 48rpx;
			color: #fff;

			&-save {
				margin-left: 24rpx;
				color: #fff;
				font-size: 28rpx;
			}

			.uni-input-placeholder {
				color: #80858E;
				font-size: 32rpx;
			}
		}

		&__clear {
			width: 28rpx;
			height: 28rpx;
		}

		&__delete {

			padding-bottom: 100rpx;

			// margin: 30rpx 0 0;
			.common-button {

				&.revert {
					color: #DF0001;
					border-color: #DF0001;
					background-color: #80858E;
				}
			}
		}
	}

	.help-center-icon {
		width: 44rpx;
		height: 44rpx;
	}
</style>