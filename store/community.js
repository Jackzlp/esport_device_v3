// store/community.js
import {
	defineStore
} from 'pinia'
import api from '@/apis'
import {
	getStorageSync,
	path
} from '@/utils'
import {
	GOTODETAIL_KEY,
	LOCALE_KEY,
	getCurrentLocaleKey
} from '@/constant'
import {
	clearStorageSync
} from '../utils'
import {
	getcommunityList
} from '../store/communitylist.js'

export const useCommunityStore = defineStore('community', {
	// 状态定义（等同于Vuex的state）
	state: () => ({
		communityList: [],
		tempFilesList: [],
		tempFileType: 'image',
		tempSharePic: '',
		hasUnreadMessage: false,
		PostList: [],
		NeedRreflash: false
	}),

	// 获取器（等同于Vuex的getters）
	getters: {
		communities(state) {
			const locale = getStorageSync(LOCALE_KEY)
			const localeKey = getCurrentLocaleKey(locale)
			return state.communityList.map(community => {
				const {
					name,
					privacy_policy,
					protocol
				} = community
				const displayName = community[localeKey] || name
				const displayPrivacyPolicy = path(privacy_policy, `${localeKey}.content`, '')
				const displayProtocol = path(protocol, `${localeKey}.content`, '')
				return {
					...community,
					displayName,
					displayPrivacyPolicy,
					displayProtocol
				}
			})
		}
	},

	// 动作（等同于Vuex的actions）
	actions: {
		// 切换语言
		async getCommunity() {
			let list = getcommunityList()

			this.communityList = list
			try {
				const {
					code,
					data
				} = await api.community.getCommunityList()

				if (code === 0) {
					this.communityList = data
				}
			} catch (error) {
				console.warn('getCommunity', error)
			}
		},

		// 获取是否需要刷新
		setNeedReflash(data) {
			this.NeedRreflash = data || false
			// this.setState(['NeedRreflash', data || false])
		},

		// 获取变化的发布
		getPostList() {
			const PostList = getStorageSync(GOTODETAIL_KEY) || []
			// this.setState(['PostList', PostList])
			this.PostList = PostList
		},

		// 添加发布的变化
		addPostList(postItems) {
			const PostList = this.PostList
			var temArr = [].concat(PostList ? PostList : [])
			var indexArr = []
			if (temArr.length > 0) {
				for (var i = 0; i < postItems.length; i++) {
					let element = postItems[i]
					let eindex = temArr.findIndex(item => {
						return item.id === element.id
					})
					if (eindex > -1) {
						temArr[eindex].praise_cnt = element.praise_cnt
						temArr[eindex].am_i_like = element.am_i_like
						temArr[eindex].hidden = element.hidden
						indexArr.splice(0, 0, 1)
					}
				}
				for (let index in indexArr) {
					postItems.splice(index, 1)
				}
				temArr = temArr.concat(postItems)
			} else {
				temArr = temArr.concat(postItems)
			}
			this.syncPostListStorage(temArr)
		},

		// 清除发布缓存
		clearPostStorage() {
			clearStorageSync('GOTODETAIL_KEY')
		},

		// 设置临时文件列表
		async setTempFileList(arr) {
			// this.setState(['tempFilesList', arr])
			this.tempFilesList = arr
		},

		// 设置临时文件类型
		async setTempFileType(type) {
			this.tempFileType = type
			// this.setState(['tempFileType', type])
		},

		// 设置临时分享图片
		async setTempSharePic(url) {
			this.tempSharePic = url
			// this.setState(['tempSharePic', url])
		},

		// 设置是否有未读消息
		async setHasUnreadMessage(booleanVal) {
			// this.setState(['hasUnreadMessage', booleanVal])
			this.hasUnreadMessage = booleanVal
		},

		// 获取分类
		async getHelpCenterCategory(payload) {
			const params = payload
			try {
				const {
					code,
					data
				} = await api.helpCenter.getHelpCenterCategory(params)
				return code === 0 ? data : []
			} catch (error) {
				console.warn('getCategory', error)
			}
		}
	}
})