import {
	STORAGE_KEY
} from '@/constant'
const DEFAULT_CACHE_SPAN = 3600 * 24 * 10000 // 这里写了1000天，默认1000天


// 设置本地缓存的办法
export const setStorageSync = (key, value, seconds = DEFAULT_CACHE_SPAN) => myCache(key, value, seconds)

/**
 * 获取本地缓存方法
 * @param key
 */
export const getStorageSync = key => {
	return myCache(key)
}

/**
 * @description 清除缓存
 * @param {*} key
 * @returns
 */
export const clearStorageSync = key => {
	const finalKey = `${STORAGE_KEY}_${key}`
	// console.log(`清除${finalKey}`)
	uni.setStorageSync(finalKey, '')
}

// 缓存的函数
const myCache = (key, value, seconds) => {
	const nowTime = Date.parse(new Date()) / 1000;
	const finalKey = `${STORAGE_KEY}_${key}`

	if (finalKey && value) {
		const expire = nowTime + Number(seconds);
		uni.setStorageSync(finalKey, `${JSON.stringify(value)}|${expire}`)
		// console.log(`已经把${finalKey}存入缓存,过期时间为${expire}`)
	} else if (finalKey && !value) {
		const val = uni.getStorageSync(finalKey);
		if (val) {
			// 缓存存在，判断是否过期
			const temp = val.split('|')
			if (!temp[1] || temp[1] <= nowTime) {
				uni.removeStorageSync(finalKey)
				// console.log(`${finalKey}缓存已失效`)
				return '';
			}
			return JSON.parse(temp[0]);

		}
	}

}