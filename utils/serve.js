import {
	getStorageSync,
	clearStorageSync
} from '@/utils';
import {
	TOKEN_KEY,
	USERINFO_KEY
} from '@/constant'
import i18n from '@/locales'
import store from '@/store'
import {
	getCurrentLocaleKey
} from '../constant';
import {
	useCommonStore
} from '@/store/common'; // 改为导入 store hook

let killUserDone = false


// 旧 'http://35.160.7.56:8001/api'

// 生产环境： http://54.208.193.140:8001/api
// 开发环境： http://8.134.23.124:8001/api

// const baseUrl = 'http://8.134.23.124:8001/api'
// const baseUrl = 'http://app.gtracing.com/api'


const baseUrl = 'https://app.gtlynck.com/api' //生产环境：

// const baseUrl = 'http://app.gtracing.com:8001/api' //开发环境：

let httpNum = 0;
let reLaunchPojecting = false;
const http = {
	post: '',
	get: '',
	put: ''
};
const typeArr = []
http.post = (api, data) => {
	const commonStore = useCommonStore();
	const locale = commonStore.locale;
	// 特殊接口处理
	if (httpNum <= 0) {
		// 显示loading
	}

	// 1. 声明并初始化 header 变量（关键修复）
	const header = {
		'Authorization': getStorageSync(TOKEN_KEY), // 默认携带 token
		'content-type': 'application/json' // 默认 content-type
	};

	// 2. 特殊接口处理（如果需要修改 content-type）
	if (typeArr.indexOf(api) >= 0) {
		header['content-type'] = 'application/x-www-form-urlencoded';
	}
	// const locale = store.state.common.locale
	const localeRelated = {
		language: getCurrentLocaleKey(locale)
	}
	httpNum++;
	return new Promise((resolve, reject) => {
		uni.request({
			data: {
				...localeRelated,
				...data
			},
			method: 'post',
			url: baseUrl + api,
			header: header,
			timeout: 10000,
			success(res) {
				httpNum--;
				if (httpNum <= 0) {
					// 隐藏loading
				}
				// console.log(getStorageSync(TOKEN_KEY))
				if ([1007, 1008].includes(res.data.code)) {
					if (reLaunchPojecting) {
						setTimeout(() => {
							reLaunchPojecting = false
						}, 5000);
						return
					}
					reLaunchPojecting = true
					clearStorageSync(USERINFO_KEY)
					clearStorageSync(TOKEN_KEY)
					uni.reLaunch({
						url: '/pages/index/index'
					})
					return
				}
				killUser(res.data.code)
				handleRequestSuccess(res, resolve)
			},
			fail(err) {
				httpNum--;
				// tip.loaded();
				// console.log(err)
				reject(err)
			}
		})
	});
}

http.get = (api, data) => {

	const commonStore = useCommonStore();
	const locale = commonStore.locale;

	// 特殊接口处理
	if (httpNum <= 0) {
		// 显示loading
	}

	// 1. 声明并初始化 header 变量（关键修复）
	const header = {
		'Authorization': getStorageSync(TOKEN_KEY), // 默认携带 token
		'content-type': 'application/json' // 默认 content-type
	};

	// 2. 特殊接口处理（如果需要修改 content-type）
	if (typeArr.indexOf(api) >= 0) {
		header['content-type'] = 'application/x-www-form-urlencoded';
	}
	httpNum++;
	return new Promise((resolve, reject) => {





		const localeRelated = {
			language: getCurrentLocaleKey(locale)
		}

		// console.log({
		// 	...localeRelated,
		// 	...data
		// })
		uni.request({
			data: {
				...localeRelated,
				...data
			},
			method: 'get',
			url: baseUrl + api,
			timeout: 10000,
			header: header,

			success(res) {
				httpNum--;
				if (httpNum <= 0) {
					// 隐藏loading
				}

				// console.log(getStorageSync(TOKEN_KEY))
				// 	console.log({
				// 	...localeRelated,
				// 	...data
				// })
				// console.log(getStorageSync(TOKEN_KEY))
				// console.log(baseUrl + api)

				if ([1007, 1008].includes(res.data.code)) {
					if (reLaunchPojecting) {
						setTimeout(() => {
							reLaunchPojecting = false
						}, 5000);
						return
					}
					reLaunchPojecting = true
					clearStorageSync(USERINFO_KEY)
					clearStorageSync(TOKEN_KEY)
					uni.reLaunch({
						url: '/pages/index/index'
					})
					return
				}
				killUser(res.data.code)
				handleRequestSuccess(res, resolve)
			},
			fail(err) {
				httpNum--;
				// tip.loaded();
				// console.log(err)
				reject(err)
			}
		})
	});
}


http.delete = (api, data) => {

	// 特殊接口处理
	if (httpNum <= 0) {
		// 显示loading
	}

	// 1. 声明并初始化 header 变量（关键修复）
	const header = {
		'Authorization': getStorageSync(TOKEN_KEY), // 默认携带 token
		'content-type': 'application/json' // 默认 content-type
	};

	// 2. 特殊接口处理（如果需要修改 content-type）
	if (typeArr.indexOf(api) >= 0) {
		header['content-type'] = 'application/x-www-form-urlencoded';
	}

	httpNum++;
	return new Promise((resolve, reject) => {
		const commonStore = useCommonStore();
		const locale = commonStore.locale;

		const localeRelated = {
			language: getCurrentLocaleKey(locale)
		}
		uni.request({
			data: {
				...localeRelated,
				...data
			},
			method: 'delete',
			url: baseUrl + api,
			header: header,
			timeout: 10000,
			success(res) {
				httpNum--;
				if (httpNum <= 0) {
					// 隐藏loading
				}

				if ([1007, 1008].includes(res.data.code)) {
					if (reLaunchPojecting) {
						setTimeout(() => {
							reLaunchPojecting = false
						}, 5000);
						return
					}
					reLaunchPojecting = true
					clearStorageSync(USERINFO_KEY)
					clearStorageSync(TOKEN_KEY)
					uni.reLaunch({
						url: '/pages/index/index'
					})
					return
				}
				killUser(res.data.code)
				handleRequestSuccess(res, resolve)
			},
			fail(err) {
				httpNum--;
				// tip.loaded();
				reject(err)
			}
		})
	});
}
http.put = (api, data) => {
	// 特殊接口处理
	if (httpNum <= 0) {
		// 显示loading
	}

	// 1. 声明并初始化 header 变量（关键修复）
	const header = {
		'Authorization': getStorageSync(TOKEN_KEY), // 默认携带 token
		'content-type': 'application/json' // 默认 content-type
	};

	// 2. 特殊接口处理（如果需要修改 content-type）
	if (typeArr.indexOf(api) >= 0) {
		header['content-type'] = 'application/x-www-form-urlencoded';
	}
	httpNum++;
	return new Promise((resolve, reject) => {
		const commonStore = useCommonStore();
		const locale = commonStore.locale;

		const localeRelated = {
			language: getCurrentLocaleKey(locale)
		}
		uni.request({
			data: {
				...localeRelated,
				...data
			},
			method: 'put',
			url: baseUrl + api,
			header: header,
			success(res) {
				httpNum--;

				if (httpNum <= 0) {
					// 隐藏loading
				}

				if ([1007, 1008].includes(res.data.code)) {
					if (reLaunchPojecting) {
						setTimeout(() => {
							reLaunchPojecting = false
						}, 5000);
						return
					}
					reLaunchPojecting = true
					clearStorageSync(USERINFO_KEY)
					clearStorageSync(TOKEN_KEY)
					uni.reLaunch({
						url: '/pages/index/index'
					})
					return
				}
				killUser(res.data.code)

				handleRequestSuccess(res, resolve)
			},
			fail(err) {
				httpNum--;
				// tip.loaded();
				reject(err)
			}
		})
	});
}
const killUser = code => {
	if ([1012].includes(code)) {
		if (killUserDone) return
		killUserDone = true
		uni.showModal({
			content: i18n.t('badUser'),
			showCancel: false,
			confirmText: i18n.t('confirm'),
			complete: () => {
				killUserDone = false
				store.dispatch('user/clearUserInfo')
				uni.reLaunch({
					url: '/pages/index/index'
				})
			}
		})
		return
	}
}

const loginExpired = () => {
	if (killUserDone) return
	killUserDone = true
	uni.showModal({
		content: i18n.t('loginOther'),
		showCancel: false,
		confirmText: i18n.t('confirm'),
		complete: () => {
			killUserDone = false
			store.dispatch('user/clearUserInfo')
			uni.reLaunch({
				url: '/pages/index/index'
			})
		}
	})
	return
}
const communityDie = () => {
	console.log('communityDie')
	if (killUserDone) return
	killUserDone = true
	uni.reLaunch({
		url: '/pages/account/communitySwitch'
	})
	setTimeout(() => {
		killUserDone = false
	}, 5000)
	return
}
const handleRequestSuccess = (res, resolve) => {
	if (res.statusCode == 200) {
		if (res.data.code == 1024) {
			loginExpired()
		} else if (res.data.code == 1019) {
			communityDie()
		} else {
			resolve(res.data)
		}
	} else if (res.statusCode == 1024) {
		loginExpired()
	} else {
		// 错误处理提示
		// tip.alertDialog(res.statusCode + '错误，请稍后再试')
	}
}

export default http;