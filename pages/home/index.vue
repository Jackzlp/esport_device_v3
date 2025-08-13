<template>
	<PageLayout type="custom">
		<view class="stabbarHeight" :style="{height: `${systemBarHeight * 2}rpx`}">
		</view>
		<view class="home" :style="{paddingTop: `${systemBarHeight * 2}rpx`}">
			<view class="home__top" :style="{top:`${systemBarHeight * 2}rpx`}">
				<view class="home__top-content" @click="intoDevMode">
					<view :class="isMyDevice?'home__top-content-activity':'home__top-content-normal'"
						@click="changeTab(true)">
						{{ devMode ? 'dev mode': $t('homePage.myDevices') }}
					</view>
					<view class="home__top-content-line"> </view>
					<view :class="!isMyDevice?'home__top-content-activity':'home__top-content-normal'"
						@click="changeTab(false)">{{$t('bluetoothHintRelate.discovery')}}</view>
				</view>
				<view class="home__add">
					<image src="/static/images/phase2/plus.png" @click="addDevice" />
				</view>
			</view>


			<view v-if="isMyDevice" :style="{marginTop:`${systemBarHeight * 2}rpx`} ">
				<template v-if="hasDevice">
					<template v-if="SelectGroup">
						<HomeGroupList :SelectArr="SelectDevices" />
					</template>
					<template v-else-if="SelectLight">
						<LightGroup :SelectArr="SelectLights"></LightGroup>
					</template>
					<template v-else>
						<HomeDeviceList :force-update-flag="forceUpdateFlag" :statusChang="isEdit" />
					</template>
				</template>
				<template v-else>
					<HomeDefault :listdata="bannerList" @addDevice="addDevice" @switchDevice="switchDevice" />
				</template>
			</view>

			<view v-else>
				<AllproductList></AllproductList>
			</view>
			<TouristModeBlockDialog v-if="showTouristModeBlockDialog" @close="showTouristModeBlockDialog = false" />
			<Ballpop ref="Closefade" v-show="ballsVisible && isMyDevice"
				style="z-index: 999; position: fixed;bottom: 200px;right: 50px" @trigger="trigger" :Myball="myball">
			</Ballpop>
		</view>
		<!-- <Tabbar v-show="showTabbr" style="position: fixed;bottom: 0;" :current="0" @touristBlock="touristBlock" /> -->
		<!-- <homeguide v-if="showguide" class="full-page-cover"></homeguide> -->
	</PageLayout>
</template>

<script>
	// firstLanchHome
	import {
		mapState
	} from 'pinia'

	// const baseImageAPI = 'https://static-mp-f4d3e28c-4ed0-473b-b8e3-6d224490cf79.next.bspapp.com/device'
	// import Tabbar from '@/components/Tabbar'
	import PageLayout from '@/components/page-layout'
	import HomeDeviceList from './components/deviceList.vue'
	import HomeGroupList from './components/DeviceGroup.vue'
	import HomeDefault from './components/default.vue'
	import LightGroup from './components/LightGroup.vue'
	import {
		currentTimeToTimestamp,
		getQuanxian
	} from '@/utils/date.js'
	import {
		closeBluetoothAdapter
	} from '../device/BLE/BLEfunction'
	import TouristModeBlockDialog from '@/components/touristModeBlockDialog'
	import {
		getImageCache,
		saveImageCache
	} from '@/store/imageCache.js'
	import {
		DEVICE_OPTIONS
	} from './constant'

	import {
		debounce
	} from '@/utils'
	import Ballpop from './components/BallPop.vue'
	// import homeguide from '../guidepage/homeguide/index.vue'
	import AllproductList from './components/AllProductList.vue'
	import {
		useCommonStore
	} from '@/store/common'
	import {
		useDeviceStore
	} from '@/store/device'
	import {
		useUserStore
	} from '@/store/user'
	// var testModel = uni.requireNativePlugin('login-AmazonLoginModel')
	export default {
		components: {
			// Tabbar,
			HomeDefault,
			HomeDeviceList,
			PageLayout,
			TouristModeBlockDialog,
			HomeGroupList,
			LightGroup,
			Ballpop,
			// homeguide,
			AllproductList

		},
		data() {
			return {
				countDevMode: 0,
				timeout: null,
				forceUpdateFlag: false,
				forbidLink: false,
				currentDevice: {},
				DEVICE_OPTIONS,
				showTouristModeBlockDialog: false, // 游客模式拦截弹窗
				// hasDevice: true // 是否有设备
				isEdit: false,
				SelectGroup: false,
				SelectLight: false,
				SelectDevices: [],
				SelectLights: [],
				content: [{
						text: 'Edit',
						seletText: 'Editing',
						defalutText: 'Edit',
						active: false
					},
					{
						text: 'combine',
						seletText: 'Combining',
						defalutText: 'combine',
						active: false
					},
					{
						text: 'lights',
						seletText: 'lights',
						defalutText: 'lights',
						active: false
					},
				],
				myball: [{
						angle: 330,
						position: {
							x: 0,
							y: 0
						},
						active: false,
						text: 'Edit',
						seletText: 'Editing',
						defalutText: 'Edit',
					},
					{
						angle: 270,
						position: {
							x: 0,
							y: 0
						},
						active: false,
						text: 'combine',
						seletText: 'Combining',
						defalutText: 'combine',
					},
					{
						angle: 210,
						position: {
							x: 0,
							y: 0
						},
						active: false,
						text: 'lights',
						seletText: 'lights',
						defalutText: 'lights',
					}
				],
				direction: 'horizontal',
				vertical: 'top',
				pattern: {
					color: '#3c3e49',
					backgroundColor: '#fff',
					selectedColor: '#f9ae3d',
					buttonColor: '#000000',
					iconColor: '#fff',
					icon: 'compose'
				},
				showPop: false,
				bannerList: [],
				ballsVisible: true,
				showguide: false,
				isMyDevice: true,
				ALLdevicelist: [],
				showTabbr: false,
				deviceStore: useDeviceStore()
			}
		},
		onLoad() {
			// getQuanxian()


		},
		unmounted() {
			uni.$off('globalClick', this.handleGlobalClick)
		},
		onHide() {
			this.$hideLoading()
			this.forbidLink = true
		},
		onReady() {
			uni.$on('globalClick', this.handleGlobalClick)
		},
		onShow() {

			// closeBluetoothAdapter()
			// this.forbidLink = false
			// this.$navigateTo(this.DEVICE_OPTIONS[2].route, { devi ceId: '' })
			closeBluetoothAdapter()
			this.$nextTick(() => {
				this.forceUpdateFlag = !this.forceUpdateFlag
			})
			this.isEdit = false
			this.SelectGroup = false
			this.SelectLight = false
			this.myball.map(item => {
				item.active = false
				item.text = item.defalutText
			})
			if (this.$refs.Closefade) {
				this.$refs.Closefade.close()
			}
			this.deviceStore.setConnecting(false)
		},
		computed: {

			...mapState(useCommonStore, ['systemBarHeight']),
			...mapState(useDeviceStore, ['deviceList', 'devMode', 'changeStatus', 'connecting']),
			...mapState(useUserStore, ['userInfo']),
			hasDevice() {
				// console.log('this.deviceList', this.deviceList)
				let flag = this.deviceList && this.deviceList.length !== 0
				return flag
			},
		},


		mounted() {
			let homeBannerString = uni.getStorageSync('homeBannerList')
			if (homeBannerString) {
				this.bannerList = JSON.parse(homeBannerString)
			}
			this.loadbannerMethod()
			this.loadImageUpData()
			setTimeout(() => {
				this.showTabbr = true
			}, 150)


		},
		methods: {

			// ...mapActions('device', ['setDevOpen', 'getDeviceList', 'setConnecting']),

			handlePageClick(event) {
				// 页面点击时触发全局事件
				uni.$emit('globalClick', {
					target: event.target
				})
			},

			showball() {
				this.ballsVisible = !this.ballsVisible
				// console.log('2134', this.ballsVisible)
			},

			handleGlobalClick(e) {


				// #ifdef H5
				if (!this.$refs.Closefade.contains(e.target)) {
					this.$refs.Closefade.close()
				}
				// #endif

				// #ifdef APP-PLUS
				const query = uni.createSelectorQuery().in(this);
				query.select('#Closefade').boundingClientRect(res => {
					if (!res) this.$refs.Closefade.close();
				}).exec();
				// #endif

			},

			changeTab(type) {
				this.isMyDevice = type
			},
			loadMethod() {
				// let temString = uni.getStorageSync('changeUrl')
				// const baseImageAPI = temString ? temString : 'http://clould.chinachairsfactory.com/device'
				uni.request({
					url: `${this.$uni_base_API}/finddeviceList`,
					success(res) {
						// console.log(res)
						if (res.statusCode === 200) {
							var list = res.data.list
							list.map(item => {
								switch (item.type) {
									case 1:
										item.img = DEVICE_OPTIONS[1]
											.withShadow(item.img)
										// `${baseImageAPI}/${item.img}-shadow.png`
										break;
									case 2:
										item.img = DEVICE_OPTIONS[2].cover()
										// `${baseImageAPI}/scooter-small.png`
										break;
									case 3:
										item.img = DEVICE_OPTIONS[3]
											.withShadow(item.img)

										// `${baseImageAPI}/esport-chair/${item.img}-shadow.png`
										break;
									case 4:
										item.img = DEVICE_OPTIONS[4].cover()

										// `${baseImageAPI}/esport-chair/${item.img}-shadow.png`
										break;
									case 5:
										item.img = DEVICE_OPTIONS[5].cover()
										// `${baseImageAPI}/Treadmills.png`
										break;
									default:
										break;
								}

								item.subObject.map(temp => {
									switch (temp.type) {
										case 1:
											// console.log(temp.name)
											temp.img = DEVICE_OPTIONS[1].withShadow(temp.name)
											// console.log(temp.name)
											// `${baseImageAPI}/${item.img}-shadow.png`
											break;
										case 2:
											temp.img = DEVICE_OPTIONS[2].cover()
											// `${baseImageAPI}/scooter-small.png`
											break;
										case 3:
											// console.log(temp.name)
											temp.img = DEVICE_OPTIONS[3]
												.withShadow(temp.name)

											// `${baseImageAPI}/esport-chair/${item.img}-shadow.png`
											break;
										case 4:
											temp.img = DEVICE_OPTIONS[4].cover()

											// `${baseImageAPI}/esport-chair/${item.img}-shadow.png`
											break;
										case 5:
											temp.img = DEVICE_OPTIONS[5].cover()
											break
											// case 1:
											// 	temp.img =
											// 		`${baseImageAPI}/${temp.name}-shadow.png`
											// 	break;
											// case 2:
											// 	temp.img = `${baseImageAPI}/scooter-small.png`
											// 	break;
											// case 3:
											// 	temp.img =
											// 		`${baseImageAPI}/esport-chair/${temp.name}-shadow.png`
											// 	break;
											// case 4:
											// 	temp.img =
											// 		`${baseImageAPI}/esport-chair/${temp.name}-shadow.png`
											// 	break;
											// case 5:
											// 	temp.img = `${baseImageAPI}/Treadmills.png`
											// 	break;
										default:
											break;
									}
								})
							})
							this.ALLdevicelist = list
							// console.log(list)
							uni.setStorageSync('alldeviceList', list)

						}
					},
					fail() {

					}
				})
			},


			loadImageUpData: debounce(async function() {
				let that = this
				let params = {
					perPage: 200
				}
				try {
					let res = await that.$api.common.getProduct(params)
					// console.log(res)
					if (res.code === 0) {
						let list = res.data.data
						var lightTyple = {} //灯带
						var chairtype = {} //椅子
						var hasLightChair = [] //二合一
						var hastreb = []
						var specialDeviceArr = []
						var colorful = []
						var heartModels = {}
						var spheartModels = []
						var timerChange = []
						var has_four_voice = []
						var has_local_rhythms = []
						var key_color_version = []
						var massager = {}
						var homeAppliances = {}
						var colortype = []
						var lcolortype = []
						var FColortype = []
						var normalList = []


						list.map(item => {
							if (item.link_type === 1) {
								lightTyple[item.hex] = item.model
								if (item.is_colorful === 1) {
									colorful.push(item.model)
								}
								if (item.has_timer === 1) {
									timerChange.push(item.push)
								}
								if (item.has_local_rhythm === 1) {
									has_local_rhythms.push(item.model)
								}
								if (item.key_color_version != 0) {
									key_color_version.push(item)
								}
							}
							if (item.link_type === 3) {
								chairtype[item.hex] = item.model
								if (item.is_colorful === 1) {
									hasLightChair.push(item.model)
								}
								if (item.has_high_low_audio === 1) {
									hastreb.push(item.model)
								}
								if (item.is_direct_plugin === 1) {
									specialDeviceArr.push(item.model)
								}
								if (item.has_4_voice === 1) {
									has_four_voice.push(item.model)
								}
							}
							if (item.link_type === 4) {
								heartModels[item.hex] = item.model
								if (item.motor_count > 1) {
									spheartModels.push(item.model)
								}
							}

							if (item.link_type === 6) {
								massager[item.hex] = item.model
							}
							if (item.link_type === 7) {
								homeAppliances[item.hex] = item.model
							}
							if (item.color_type === 1) {
								colortype.push(item.model)
							}
							if (item.color_type === 2) {
								lcolortype.push(item.model)
							}
							if (item.color_type == 3) {
								FColortype.push(item.model)
							}
							if (item.color_type === 4) {
								normalList.push(item.model)
							}
						})

						let body = {
							lightTyple: lightTyple,
							chairtype: chairtype,
							hasLightChair: hasLightChair,
							hastreb: hastreb,
							specialDeviceArr: specialDeviceArr,
							colorful: colorful,
							heartModels: heartModels,
							spheartModels: spheartModels,
							timerChange: timerChange,
							has_four_voice: has_four_voice,
							has_local_rhythm: has_local_rhythms,
							key_color_version: key_color_version,
							massager: massager,
							homeAppliances: homeAppliances,
							color_type: colortype,
							lcolortype: lcolortype,
							FColortype: FColortype,
							normalList: normalList
						}
						uni.setStorageSync('chairInfo', JSON.stringify(body))
						uni.setStorageSync('detcetList', JSON.stringify(list))
					}
					this.loadMethod()
					// console.log(res)
				} catch (error) {
					console.log("加载错误")
					//TODO handle the exception
				}

			}, 200),

			async loadbannerMethod() {
				// if (this.hasDevice) return
				let that = this
				try {
					const res = await this.$api.common.getHomenBanner()
					uni.setStorageSync('homeBannerList', JSON.stringify(res.data.data))
					that.bannerList = res.data.data
					that.bannerList.forEach(el => {
						getImageCache(el.image, el.image)
					});
				} catch (error) {
					//TODO handle the exception
				}

			},

			intoDevMode() {
				if (this.timeout) {
					clearTimeout(this.timeout)
				}
				this.timeout = null
				if (this.devMode) {
					this.countDevMode--
					if (this.countDevMode < 5) {
						this.countDevMode = 0
						this.deviceStore.setDevOpen(false)
					}
					this.timeout = setTimeout(() => {
						this.countDevMode = 11
					}, 3000)
					return
				}
				this.countDevMode++
				if (this.countDevMode > 10 || this.countDevMode === 10) {
					this.deviceStore.setDevOpen(true)
					return
				}
				this.timeout = setTimeout(() => {
					this.countDevMode = 0
				}, 3000)
				//     if (this.countDevMode > 5) return
				//     setTimeout(() => {
				//         if (this.countDevMode < 5) {
				//             this.countDevMode++
				//         }
				//     }, 5000)
			},
			// 去添加设备页面
			addDevice() {
				if (this.changeStatus) return
				// if (this.connecting) return
				this.$navigateTo('/pages/home/detect')
			},

			switchDevice(device) {
				this.currentDevice = device
			},
			gotoBanner() {

			},
			trigger(e) {

				// uni.navigateTo({
				// 	url: '/pages/device/heartRate/functions/ResultDetail/ResultDetail',
				// 	success() {

				// 	},
				// 	fail(err) {
				// 		console.log(err)
				// 	}
				// })
				// return

				// uni.navigateTo({
				// 	url: '/pages/device/homeAppliances/index',
				// 	success() {

				// 	},
				// 	fail(err) {
				// 		console.log(err)
				// 	}
				// })
				// return


				for (var i = 0; i < this.myball.length; i++) {
					if (i === e.index) {
						this.myball[i].active = !this.myball[i].active
						if (this.myball[i].active === true) {
							this.myball[i].text = this.myball[i].seletText
						} else {
							this.myball[i].text = this.myball[i].defalutText
						}
					} else {
						this.myball[i].active = false
						this.myball[i].text = this.myball[i].defalutText
					}
				}
				this.isEdit = this.myball[0].active
				this.SelectGroup = this.myball[1].active
				this.SelectLight = this.myball[2].active
				if (this.SelectGroup == true) {
					let that = this
					that.SelectDevices = []
					this.deviceList.map(item => {
						if (item.type === 3) {
							item.select = false
							that.SelectDevices.push(item)
						}
					})
				}
				if (this.SelectLight === true) { //判断是否是灯带，或则带有灯带的椅子
					let that = this
					this.SelectLights = []
					let special = uni.getStorageSync("chairInfo")
					const hasLightArr = JSON.parse(special).hasLightChair ? JSON.parse(special).hasLightChair : [
						'GTP-800',
						'GTW-500-BLK'
					]
					this.deviceList.map(item => {
						if (item.type === 1 || hasLightArr.includes(item.model)) {
							item.select = false
							that.SelectLights.push(item)
						}
					})
				}
				if (this.$refs.Closefade) {
					this.$refs.Closefade.close()
				}
			},
			compareVersions(currentVersion, nextVersion, charsToRemove) {
				const regex = new RegExp(`[${charsToRemove}]`, 'g');
				let current = parseInt(currentVersion.replace(regex, ''))
				let next = parseInt(nextVersion.replace(regex, ''))
				return current >= next;
			},
			// 拦截游客模式
			touristBlock() {
				this.showTouristModeBlockDialog = true
			}
		},
	}
</script>

<style lang="scss" scoped>
	.stabbarHeight {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		background-color: #f7f7f7;
		height: 160rpx;
		z-index: 999;

	}

	.editBox {
		position: fixed;
		right: 32px;
		bottom: 100px;
		width: 50px;
		height: 50px;
		background-color: red;
		border-radius: 25px;
		align-items: center;
		display: flex;
		justify-content: center;
	}

	.home {
		min-height: calc(100vh - 88rpx);
		background: #f7f7f7;
		padding: 0rpx 0 0;
		position: relative;
		overflow-x: hidden;
		position: relative;


		&__top {
			padding: 0 32rpx;
			padding-top: var(--status-bar-height);
			height: 66rpx;
			line-height: 56rpx;
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			position: fixed;
			left: 0;
			right: 0;
			z-index: 100;
			background-color: #f7f7f7;


			&-content {
				display: flex;
				justify-content: space-around;
				align-items: center;

				&-line {
					height: 30rpx;
					width: 5rpx;
					background-color: black
				}

				&-normal {
					color: black;
				}

				&-activity {
					color: rgb(145, 17, 36);
				}

				font-weight: bold;
				font-size: 35rpx;
				width: 450rpx;
			}
		}

		&__add {
			height: 66rpx;
			display: flex;
			align-items: center;

			image {
				width: 40rpx;
				height: 40rpx;
			}
		}
	}

	.iphonex {
		/* iphonex 等安全区设置，底部安全区适配 */
		/* #ifndef APP-NVUE */
		height: 0;
		height: constant(safe-area-inset-bottom);
		height: env(safe-area-inset-bottom);
		width: 750rpx;
		background-color: #FFFFFF;
		/* #endif */
	}

	.full-page-cover {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		// bottom: -(env(safe-area-inset-bottom));
		// width: 100vw;
		height: 100vh;
		// bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		/* 半透明背景 */
		z-index: 1050;

		// overflow: hidden;
	}
</style>