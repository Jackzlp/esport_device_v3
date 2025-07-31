// store/user.js
import {
	defineStore
} from 'pinia'
import {
	setStorageSync,
	getStorageSync,
	path,
	clearStorageSync
} from '@/utils'
import {
	TOKEN_KEY,
	USERINFO_KEY
} from '@/constant'
import api from '@/apis'

export const useUserStore = defineStore('user', {
	// 状态定义
	state: () => ({
		// 用户信息
		userInfo: null,
		id: null,
		name: '未登录',
		token: "",
		profile: {
			avatar: '',
			points: 0
		},

		// 当前的社区
		community: {
			name: 'American community',
			icon: '/static/images/community/america.png'
		}
	}),

	// 获取器（等同于Vuex的getters）
	getters: {
		// 当前的社区ID
		communityId(state) {
			return state.userInfo ? path(state.userInfo, 'community_id', '') : ''
		},

		// 是否为游客
		isTourist(state) {
			return state.userInfo ? path(state.userInfo, 'isTourist', false) : false
		},
		isLogin: state => !!state.token,
		avatarUrl: state => state.profile.avatar
	},

	// 动作（等同于Vuex的actions）
	actions: {

		login(userData) {
			this.id = userData.id
			this.name = userData.name
			this.token = userData.token
			uni.setStorageSync('token', this.token)
		},
		logout() {
			this.$reset()
			uni.removeStorageSync('userToken')
		},
		updateProfile(profile) {
			this.profile = {
				...this.profile,
				...profile
			}
		},
		// 通用状态设置
		setState([name, value]) {
			// this[name] = value
			this.$patch({
				[name]: value
			})


		},

		// 获取用户信息
		getUserInfo() {
			const userInfo = getStorageSync(USERINFO_KEY)
			// console.log("获取")
			// console.log(userInfo)
			if (userInfo) this.setUserInfo(userInfo)
		},

		// 更新用户信息
		async updateUserInfo() {
			try {
				const {
					code,
					data
				} = await api.user.getUserInfo()
				if (code === 0) {
					this.setUserInfo(data)
					return data
				}
			} catch (error) {
				console.warn('getUserInfo', error)
			}
		},

		// 设置用户信息
		setUserInfo(userInfo) {
			console.log(userInfo)
			setStorageSync(USERINFO_KEY, userInfo, 3600 * 24 * 7000)
			setStorageSync(TOKEN_KEY, userInfo.token, 3600 * 24 * 7000)
			// console.log(getStorageSync(USERINFO_KEY))
			this.setState([USERINFO_KEY, userInfo])
		},

		// 退出登陆
		async userLogout() {
			try {
				const {
					code
				} = await api.user.userLogout()
				console.log(code)

				const acceptCode = [0, 1024]
				if (acceptCode.includes(code)) {
					this.clearUserInfo()
					return true
				}

				return false
			} catch (error) {
				console.warn('getUserInfo', error)
				return true
			}
		},

		// 清除用户信息
		clearUserInfo() {
			clearStorageSync(USERINFO_KEY)
			clearStorageSync(TOKEN_KEY)
			uni.removeStorageSync('searchKey')
			this.setState([USERINFO_KEY, null])
		}
	},

})


// import {
// 	defineStore
// } from 'pinia'


// import {
// 	setStorageSync,
// 	getStorageSync,
// 	path,
// 	clearStorageSync
// } from '@/utils'
// import {
// 	TOKEN_KEY,
// 	USERINFO_KEY
// } from '@/constant'
// import api from '@/apis'
// export const useUserStore = defineStore('user', {
// 	state: () => ({
// 		id: null,
// 		name: '未登录',
// 		token: "",
// 		profile: {
// 			avatar: '',
// 			points: 0
// 		},
// 		// 用户信息
// 		userInfo: null,
// 		profile: {
// 			avatar: '',
// 			points: 0
// 		},

// 		// 当前的社区
// 		community: {
// 			name: 'American community',
// 			icon: '/static/images/community/america.png'
// 		}
// 	}),
// 	actions: {
// 		login(userData) {
// 			this.id = userData.id
// 			this.name = userData.name
// 			this.token = userData.token
// 			uni.setStorageSync('token', this.token)
// 		},
// 		logout() {
// 			this.$reset()
// 			uni.removeStorageSync('userToken')
// 		},
// 		updateProfile(profile) {
// 			this.profile = {
// 				...this.profile,
// 				...profile
// 			}
// 		}

// 	},
// 	getters: {
// 		isLogin: state => !!state.token,
// 		avatarUrl: state => state.profile.avatar
// 	}
// })