// mixins/global.js

import {
	getCurrentInstance
} from 'vue'
import {
	path,
	formatParams
} from '@/utils'

import {
	mapState
} from 'pinia'
import {
	useCommonStore
} from '@/store/common'
import {
	useUserStore
} from '@/store/user'

export default {
	beforeCreate() {
		const instance = getCurrentInstance()
		if (instance) {
			// 将 $api 添加到组件实例
			this.$api = instance.appContext.config.globalProperties.$api
		}
	},
	computed: {
		...mapState(useCommonStore, ['locale', 'currentVersion', 'downloadUrl', 'lastVersion', 'localeEn',
			'showToastObj'
		]),
		...mapState(useUserStore, ['communityId']),
		...mapState(useUserStore, ['isTourist'])
	},
	data() {
		return {
			$mobAppkey: '36c00b7518300',
			$mobSecret: '6e38cc0df7f172ef13501d4ad1fdb20d',
			$audioContextAlreadySign: false,
			enableTouristMode: true, // 是否打开游客模式
			commonStore: useCommonStore(),
			userStore: useUserStore()
		}
	},
	methods: {

		$path: path,

		// 返回
		$back() {
			// 回去
			const pages = getCurrentPages()
			if (pages.length > 1) return uni.navigateBack();
			if (pages.length === 1) {
				if (!this.userInfo) return this.toLoginPage()
				return this.toHomePage()
			}
		},

		// 去某个页面
		$navigateTo(url, params = {}) {
			uni.navigateTo({
				url: formatParams(url, params),
			})
		},

		// 重定向
		$redirectTo(url, params = {}) {
			console.log('$redirectTo', url, params)
			uni.redirectTo({
				url: formatParams(url, params)
			})
		},

		$switchTab(url, params = {}) {
			uni.switchTab({
				url: formatParams(url, params),
				success() {

				},
				fail(err) {
					console.log(err)
				}

			})
		},

		// 去主页
		toHomePage() {
			this.$hideLoading()
			this.$switchTab('/pages/community/index')
		},
		// 去登陆
		toLoginPage(params = {}) {
			this.$redirectTo('/pages/account/login', params)
		},

		toCommunitySwitch() {
			this.$redirectTo('/pages/account/communitySwitch')
		},
		// 提示
		$toast(params) {
			this.commonStore.setShowToastObj(params)
		},

		// loading
		$loading(title = '', mask = true) {
			uni.showLoading({
				title,
				mask
			})
		},

		// 隐藏loading
		$hideLoading() {
			uni.hideLoading()
		},

		// 判断邮箱是否正确
		$validateEmail(email) {
			// 邮箱是否有效
			const isEmailValid = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(email)

			// 展示邮箱错误的提示
			this.isEmailValid = isEmailValid

			if (!isEmailValid) {
				this.$toast({
					content: this.$t('login_page.email_error_hint'),
					type: 'error'
				})
				return false
			}
			return true
		},
		$dateText(val) {
			if (val && val.indexOf('T') < 0) {
				return val
			}
			const date = new Date(val)
			const year = date.getFullYear()
			const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
			const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
			const hour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()
			const minute = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
			const second = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds()
			return `${year}/${month}/${day}  ${hour}:${minute}:${second}`
		},
		// ! 游客模式
		touristMode() {

		}
	}


}