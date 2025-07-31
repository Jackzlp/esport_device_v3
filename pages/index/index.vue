<template>
	<!-- 启动页 -->

	<PageLayout type="custom">
		<!-- <view class="initiate-page" style="background-color: red; width: 100%;height: 100%;">sdsd</view> -->
		<view class="initiate-page" :style="{ paddingTop: `${commonStore.systemBarHeight * 2}rpx` }">

			<image v-if="ad" mode="scaleToFill" class="initiate-page__ad" :class="{'zIndexSet': !trueHaveUserInfo}"
				:src="ad_url" @click.stop="goToLink" />
			<view v-if="userStore.userInfo  && trueHaveUserInfo" class="initiate-page__skip"
				@click.stop="gotoAPPDeatil">
				{{ $t('skip') }} {{ countdownTime }}
			</view>

			<view v-if="!userStore.userInfo || !trueHaveUserInfo"
				:class="['initiate-page__unlogin', ad ? 'has-ad' : '']" @click.stop="goToLink">
				<view v-if="!ad" class="initiate-page__logo">
					<image :src="'/static/images/common/word-logo.png'" />
				</view>
				<view class="initiate-page__actions">
					<view class="mcommon-button" @click.stop="gotoCommitswitch">

						{{ $t('select_area.community_join_title') }}
					</view>
				</view>
			</view>
		</view>
	</PageLayout>
</template>

<script>
	import {
		mapState
	} from 'pinia';
	import {
		useUserStore
	} from '@/store/user'
	import {
		useCommonStore
	} from '@/store/common'

	import {
		getCurrentLocaleKey
	} from '@/constant'
	import {
		getStorageSync
	} from '@/utils';
	import {
		USERINFO_KEY
	} from '@/constant'
	import {
		getImageCache
	} from '@/store/imageCache'
	import chaceImage from '@/components/image-cache'
	import PageLayout from '@/components/page-layout'


	import {
		getCurrentInstance
	} from 'vue'

	export default {
		components: {
			chaceImage,
			PageLayout

		},
		data() {
			return {
				ad: null,
				getAdImg: false,
				trueHaveUserInfo: false,
				countdownTimer: '', // 倒计时计数器
				countdownTime: 5, // 倒计时时间
				ad_url: '',
				isCountdownActive: false, // 新增倒计时活动标志
				userStore: useUserStore(),
				commonStore: useCommonStore()
			}
		},
		computed: {
			// 2. 使用创建 store 的函数映射状态（而非实例）
			...mapState(useCommonStore, ['systemBarHeight', 'locale']),
			...mapState(useUserStore, ['userInfo', 'communityId']),
			// $api() {
			// 	return getCurrentInstance()?.appContext.config.globalProperties.$api
			// }
		},

		mounted() {
			plus.screen.lockOrientation('portrait-primary');
			uni.hideTabBar()
			this.trueHaveUserInfo = !!getStorageSync(USERINFO_KEY)
			this.getAppLaunchedPage()


			// const commonStore = useCommonStore()
			// console.log('common store:', commonStore)
			// console.log('systemBarHeight:', commonStore.systemBarHeight)

		},
		methods: {

			gotoCommitswitch() {
				uni.navigateTo({
					url: '/pages/account/communitySwitch'
				})
			},

			// 获取未登陆广告
			async getAppLaunchedPage() {

				let that = this
				let tempId = this.userStore.communityId
				if (!this.trueHaveUserInfo) {
					tempId = ''
				}
				const params = {
					community_id: tempId,
					language: getCurrentLocaleKey(this.commonStore.locale)
				}

				try {

					const {
						data,
						code
					} = await this.$api.common.getAppLaunchedPage(params)
					this.getAdImg = true


					if (code === 0) {
						this.ad = data
						let storageKey = 'IMAGE_CACHE_INFO_' + data.img_url
						// 首先获取本地存储的数据，查询是否有对应文件路径，如果有缓存内容，直接返回
						const cacheFileInfo = getStorageSync(storageKey)
						this.ad_url = data.img_url

						if (cacheFileInfo) {
							this.ad_url = cacheFileInfo
						} else {
							this.ad_url = data.img_url
							getImageCache(data.img_url, data.img_url)
						}
						console.log(code, data)
						console.log(this.userStore.userInfo)
						this.$forceUpdate()
						if (this.userStore.userInfo && this.userStore.communityId && this.trueHaveUserInfo) {
							console.log(this.userInfo.userInfo)

							if (!data) {
								this.toHomePage()
								return
							}
							this.countDown()
						} else {
							console.log("QW")
							// this.countDown()
						}
					} else {
						console.log("QWEEEE")
						// this.toHomePage()
					}
				} catch (error) {

					if (this.userStore.userInfo && this.userStore.communityId && this.trueHaveUserInfo) {

						this.toHomePage()
						return
					} else if (!this.getAdImg) {
						setTimeout(() => {
							that.getAppLaunchedPage()
						}, 1000)
					}

					console.warn('getAppLaunchedPage', error);
					console.error('错误时的 this.$api:', this.$api) // 错误发生时再打印一次
					console.error('错误详情:', error)
				}
			},

			goToLink() {
				if (this.ad && this.ad.jump_url) {
					plus.runtime.openURL(this.ad.jump_url)
				}
			},
			gotoAPPDeatil() {
				this.stopCoundown()
				this.toHomePage()
			},

			// 倒计时
			countDown() {
				// if (this.countdownTimer) {
				// 	clearTimeout(this.countdownTimer)
				// 	this.countdownTimer = null
				// }
				// this.updateCountdown()
				console.log("ppppp")
				this.stopCountdown();
				this.isCountdownActive = true;
				this.countdownTime = 5;
				this.updateCountdown();
			},
			stopCountdown() {
				this.isCountdownActive = false;
				if (this.countdownTimer) {
					clearTimeout(this.countdownTimer);
					this.countdownTimer = null;
				}
			},
			updateCountdown() {
				// 检查倒计时是否仍应继续
				if (!this.isCountdownActive || !this.countdownTime) return;
				if (this.countdownTime > 1) {
					this.countdownTime -= 1; // 每次调用减少1秒
					// 每秒更新一次倒计时，并递归调用自己
					this.countdownTimer = setTimeout(() => {
						this.updateCountdown();
					}, 1000);

				} else {
					// 倒计时结束的回调
					console.log('倒计时结束');
					// 可以选择在这里清除定时器以防止内存泄漏，尽管在组件销毁时也应该清除定时器
					// clearTimeout(this.countdownTimer);
					// this.countdownTimer = null;
					// this.toHomePage()
					this.completeCountdown();
				}
			},
			completeCountdown() {
				this.isCountdownActive = false;
				this.countdownTimer = null;
				this.toHomePage();
			},
			stopCoundown() {
				if (this.countdownTimer) {
					clearTimeout(this.countdownTimer)
					this.countdownTimer = null
				}
			}
		},

		beforeDestroy() {
			this.stopCoundown()
			// clearInterval(this.countdownTimer)
			// this.countdownTimer = null
		},
		beforeUnmount() {
			this.stopCoundown()
		}
	}
</script>

<style lang="scss">
	.initiate-page {
		position: relative;
		width: 100%;
		height: 100vh;

		// overflow: hidden;


		&__ad {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			height: 100vh;
			width: 100vw;

			// padding: 10px;
			// background-color: red;
		}

		&__skip {
			position: absolute;
			right: 0;
			padding: 8rpx 26rpx;
			top: 200rpx;
			color: #fff;
			border-radius: 40rpx 0 0 40rpx;
			z-index: 1;
			background: rgba(49, 51, 51, 0.7);
		}

		&__logo {
			display: flex;
			justify-content: center;
			margin-top: 120rpx;

			image {
				height: 56rpx;
				width: 380rpx;
			}
		}

		&__unlogin {
			padding: 0 48rpx;
			display: flex;
			flex-direction: column;
			height: 100vh;
			width: calc(100vw - 96rpx);
			;
			justify-content: space-between;
			z-index: 2;

			&.has-ad {
				justify-content: flex-end;
			}
		}

		&__actions {
			margin-bottom: 80rpx;
			// background-color: white;


			.mcommon-button {
				height: 112rpx;
				width: 100%;
				color: #fff;
				margin-left: 0;
				background: linear-gradient(360deg, #4D4D4D 0%, #303030 100%);
				border-radius: 8px;
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 36rpx;

				// &.revert {
				// 	height: 108rpx;
				// 	background: #fff;
				// 	color: #333333;
				// 	border: 2rpx solid #333333;
				// }

				// &:not(:first-child) {
				// 	margin: 32rpx;
				// }
			}
		}

		.zIndexSet {
			z-index: -1;
		}
	}
</style>