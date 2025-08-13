<template>
	<view class="page-layout" :class="{
      'with-navigator': type === 'unify',
      'overflow-hidden': overFlowHidden
    }" :style="{
      paddingTop: type === 'unify' ? `${78 + systemBarHeight * 2}rpx` : '0',
      backgroundColor: stabarColor
    }">
		<!-- 状态栏 -->
		<view v-show="showTopNav" class="status_bar" :style="{ backgroundColor: stabarColor }" />

		<!-- 导航栏 -->
		<Navigator v-if="type === 'unify'" :showWhiteBack="showWhiteBack" :content="navigatorContent"
			:content-style="navigatorContentStyle" :show-back-icon="showBackIcon"
			:style="{ backgroundColor: stabarColor }">
			<template v-if="!showBackIcon" #left>
				<slot name="header-left" />
			</template>

			<template v-if="headerType === 'edit'" #right>
				<text class="navigator__confirm" @click="headerEditSave">
					{{ headerEditContent || $t('save') }}
				</text>
			</template>

			<template v-else #right>
				<slot name="header-right" />
			</template>
		</Navigator>

		<!-- 页面内容区域 -->
		<view class="page-content">
			<slot />
		</view>

		<!-- 版本更新模态框 -->
		<u-modal :show="needforceUpdate" cancel-color="#838181" confirm-color="#2E67F3" :show-cancel-button="true"
			:confirm-text="$t('version_page.upgrade')" :close-on-click-overlay="false" :cancel-text="$t('cancel')"
			width="468rpx" @confirm="confirmUpdate" @cancel="cancelUpdata">
			<view style="font-size: 32rpx; line-height: 44rpx; color: #333;">
				{{ $t('version_page.version_need_update', { Version: lastVersion }) }}
			</view>
		</u-modal>

		<u-modal :show="MyforceUpdate" cancel-color="#2E67F3" :show-cancel-button="false"
			:confirm-text="$t('version_page.upgrade')" :close-on-click-overlay="false" width="700rpx"
			@confirm="confirmUpdate">
			<view
				style="font-size: 45rpx; line-height: 50rpx; color: black; font-weight: bold; width: 100%; text-align: center;">
				{{ $t('version_page.force_update_title') }} {{ lastVersion }}
				<view class="force_updata_content">
					<text style="width: 40rpx; height: 40rpx; color: transparent;">..</text>
					{{ $t('version_page.force_update_content') }}
				</view>
			</view>
		</u-modal>

		<!-- 全局Toast -->
		<Toast ref="toast" />
	</view>
</template>

<script>
	import {
		defineComponent
	} from 'vue'
	import Navigator from '@/components/navigator'
	import Toast from '@/components/Toast'
	import {
		currentTimeToTimestamp
	} from '@/utils/date.js'
	import {
		useCommonStore
	} from '@/store/common.js'

	export default defineComponent({
		name: 'PageLayout',
		components: {
			Navigator,
			Toast
		},

		props: {
			// 布局类型：带导航栏(unify)或自定义(custom)
			type: {
				type: String,
				default: 'unify',
				validator: (val) => ['unify', 'custom'].includes(val)
			},

			// 是否隐藏溢出内容
			overFlowHidden: {
				type: Boolean,
				default: false
			},

			// 导航栏标题
			navigatorContent: {
				type: String,
				default: ''
			},

			// 导航栏标题样式
			navigatorContentStyle: {
				type: String,
				default: ''
			},

			// 是否显示返回按钮
			showBackIcon: {
				type: Boolean,
				default: true
			},

			// 页面高度（备用）
			pageHeight: {
				type: Number,
				default: 0
			},

			// 导航栏类型：普通(common)或编辑(edit)
			headerType: {
				type: String,
				default: 'common',
				validator: (val) => ['common', 'edit'].includes(val)
			},

			// 编辑状态下的确认文本
			headerEditContent: {
				type: String,
				default: ''
			},

			// 状态栏和导航栏背景色
			stabarColor: {
				type: String,
				default: ''
			},

			// 是否显示白色返回图标
			showWhiteBack: {
				type: Boolean,
				default: false
			}
		},

		data() {
			return {
				// 实例化Pinia仓库（避免在computed中重复调用）
				commonStore: useCommonStore()
			}
		},

		computed: {
			// 从Pinia获取状态
			systemBarHeight() {
				return this.commonStore.systemBarHeight
			},
			needforceUpdate() {
				return this.commonStore.needforceUpdate
			},
			MyforceUpdate() {
				return this.commonStore.MyforceUpdate
			},
			lastVersion() {
				return this.commonStore.lastVersion
			},
			downloadUrl() {
				return this.commonStore.downloadUrl
			},

			// 控制状态栏显示（排除启动页等不需要状态栏的页面）
			showTopNav() {
				const hideTopNavArr = [
					'pages/index/index', // 启动页路由（重点：避免遮挡index.vue）
					'pages/home/index',
					'pages/my/my',
					// 其他不需要状态栏的页面...
				]
				const pages = getCurrentPages()
				const currentPage = pages[pages.length - 1]
				return currentPage ? !hideTopNavArr.includes(currentPage.route) : false
			},

			// 特殊页面的状态栏（如社区页）
			showTopNav2() {
				const showTopNavArr = ['pages/community/index']
				const pages = getCurrentPages()
				const currentPage = pages[pages.length - 1]
				return currentPage ? showTopNavArr.includes(currentPage.route) : false
			}
		},

		methods: {
			// 取消非强制更新
			cancelUpdata() {
				uni.setStorageSync('last_cancer_updata', currentTimeToTimestamp())
				this.commonStore.setUpdataState(false)
			},

			// 确认更新（强制/非强制）
			confirmUpdate() {
				plus.runtime.openURL(this.downloadUrl)
				this.commonStore.setUpdataState(false)
			},

			// 触发编辑保存事件
			headerEditSave() {
				this.$emit('headerEditSave')
			}
		}
	})
</script>
<style lang="scss">
	.page-layout {
		min-height: calc(100vh - 168rpx);
		box-sizing: border-box;
		z-index: 998;
		position: static;
		width: 100vw;
		margin-top: var(--status-bar-height);
		// overflow: visible;
		// position: relative;

		&.overflow-hidden {
			overflow: hidden;
			// height: 100vh;
			// min-height: unset;
		}


	}

	.status_bar {
		position: fixed;
		top: 0;
		height: var(--status-bar-height);
		width: 100%;
		background: #fff;
		z-index: 1000;
	}

	.status_bar2 {
		position: fixed;
		top: 0;
		height: var(--status-bar-height);
		width: 100%;
		background: #f8f8f8;
		z-index: 1000;
	}

	.force_updata_content {
		font-size: 32rpx;
		line-height: 44rpx;
		color: #333;
		width: 100%;
		text-align: left;
		margin-top: 20rpx;
		color: #333;
	}
</style>


<!-- <template>
	<view :class="['page-layout',type === 'unify'?'with-navigator':'',overFlowHidden ? 'overflow-hidden' : '']"
		:style="{ paddingTop: type === 'unify' ? `${78 + systemBarHeight * 2}rpx` : `0`},{background:`${stabarColor}`}">
		<view v-show="showTopNav" class="status_bar" :style="`background:${stabarColor}`" />
		<view v-show="showTopNav2" class="status_bar2" :style="`background:${stabarColor}`" />
		<Navigator :showWhiteBack="showWhiteBack" v-if="type === 'unify'" :content="navigatorContent"
			:content-style="navigatorContentStyle" :show-back-icon="showBackIcon" :style="`background:${stabarColor}`">
			<template v-if="!showBackIcon" slot="left">
				<slot name="header-left" />
			</template>

			<template v-if="headerType === 'edit'" slot="right">
				<text class="navigator__confirm" @click="headerEditSave">
					{{ headerEditContent || $t('save') }}
				</text>
			</template>
			<template v-else slot="right">
				<slot name="header-right" />
			</template>
		</Navigator>

	
		<template>
			<slot />
		</template>


		<u-modal :show="needforceUpdate" cancel-color="#838181" confirm-color="#2E67F3" :show-cancel-button="true"
			:confirm-text="$t('version_page.upgrade')" :close-on-click-overlay="false" :cancel-text="$t('cancel')"
			width="468rpx" @confirm="confirmUpdate" @cancel="cancelUpdata">
			<view style="font-size: 32rpx; line-height: 44rpx; color: #333;">
				{{ $t('version_page.version_need_update', { Version: lastVersion }) }}
			</view>
		</u-modal>

		<u-modal :show="MyforceUpdate" cancel-color="#2E67F3" :show-cancel-button="false"
			:confirm-text="$t('version_page.upgrade')" :close-on-click-overlay="false" width="700rpx"
			@confirm="confirmUpdate">

			<view
				style="font-size: 45rpx;line-height: 50rpx;color: black;font-weight: bold;width: 100%;text-align: center;">
				{{$t('version_page.force_update_title')}} {{lastVersion}}

				<view class="force_updata_content">
					<text style="width: 40rpx;height: 40rpx;color: transparent;">..</text>
					{{$t('version_page.force_update_content')}}
				</view>
			</view>



		</u-modal>


		<Toast ref="toast" />
	</view>
</template>

<script>
	import {
		currentTimeToTimestamp
	} from '@/utils/date.js'
	import {
		useCommonStore
	} from '@/store/common.js'
	import {
		mapState
	} from 'pinia'
	import {
		mapActions
	} from 'pinia'
	import Navigator from '@/components/navigator'
	import Toast from '@/components/Toast'
	export default {
		name: "page-layout",
		components: {
			Navigator,
			Toast
		},
		computed: {
			systemBarHeight() {
				return useCommonStore().systemBarHeight
			},
			...mapState(useCommonStore, [
				'needforceUpdate',
				'MyforceUpdate',
				'lastVersion',
				'downloadUrl'

			]),
			showTopNav() {
				const hideTopNavArr = [
					'pages/home/index',
					'pages/my/my',
					'pages/community/index',
					'pages/my/userInfo',
					'pages/community/sharePicture',
					'pages/device/atmosphereLight/index',
					'pages/device/scooter/index',
					'pages/device/esportChair/index',
					'pages/device/heartRate/index',
					'pages/device/heartRate/Physical',
					'pages/device/heartRate/functions/RateResult/RateResult',
					'pages/device/Treadmills/TreadmillsCeterPage',
					'pages/device/Treadmills/index',
					'pages/account/setNewpassward',
					'pages/device/heartRate/functions/ResultDetail/ResultDetail',
					'pages/device/heartRate/functions/Records/Records'


				]
				const pages = getCurrentPages();
				const page = pages[pages.length - 1];
				if (!page) {
					return
				}
				return !(hideTopNavArr.indexOf(page.route) > -1)
			},
			showTopNav2() {
				const showTopNavArr = ['pages/community/index']
				const pages = getCurrentPages();
				const page = pages[pages.length - 1];
				if (!page) {
					return
				}
				return showTopNavArr.indexOf(page.route) > -1
			}
		},
		props: {
			// 统一头部
			type: {
				type: String,
				default: 'unify',
				validator: type => {
					return ['unify', 'custom'].includes(type)
				}
			},

			// 特殊需求
			overFlowHidden: {
				type: Boolean,
				default: false
			},

			// 标题
			navigatorContent: {
				default: '',
				type: String
			},

			// 标题的对齐
			navigatorContentStyle: {
				type: String,
				default: ''
			},

			// 隐藏返回的按钮
			showBackIcon: {
				default: true,
				type: Boolean
			},
			//pageHeight
			pageHeight: {
				default: 0,
			},

			// 顶部的类型
			headerType: {
				type: String,
				default: 'common',
				validator: type => {
					return ['common', 'edit'].includes(type)
				}
			},

			// 顶部右边
			headerEditContent: {
				type: String,
				default: ''
			},
			stabarColor: {
				type: String,
				default: ""
			},
			showWhiteBack: {
				type: Boolean,
				default: false
			}
		},


		data() {
			return {

			};
		},
		methods: {
			...mapActions(useCommonStore, [
				'setUpdataState',
				'setMyforceUpdate'
			]),

			cancelUpdata() {
				uni.setStorageSync("last_cancer_updata", currentTimeToTimestamp())
				this.setUpdataState(false)
			},
			confirmUpdate() {
				plus.runtime.openURL(this.downloadUrl)
				this.setUpdataState(false)
			},
			headerEditSave() {
				this.$emit('headerEditSave')
			}
		}
	}
</script>

<style lang="scss">
	.page-layout {
		min-height: 100vh;
		/* 改为完整高度 */
		box-sizing: border-box;
		z-index: 1;
		/* 降低层级，避免遮挡子组件 */
		position: relative;
		/* 确保定位上下文正确 */
		// background-color: yellow;

		&.overflow-hidden {
			overflow: hidden;
			height: 100vh;
			/* 明确设置高度 */
		}
	}

	.status_bar,
	.status_bar2 {
		z-index: 1000;
		/* 仅提升状态栏的层级 */
	}




	.force_updata_content {
		font-size: 32rpx;
		line-height: 44rpx;
		color: #333;
		width: 100%;
		text-align: left;
		margin-top: 20rpx;
		color: #333;
	}
</style> -->