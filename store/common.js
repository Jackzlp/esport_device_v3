// @/store/common.js
import {
	defineStore
} from 'pinia';
import {
	setStorageSync,
	getStorageSync
} from '@/utils';
import {
	LOCALE_KEY,
	DEFAULT_LOCALE,
	DEFAULT_LOCALE_EN,
	getCurrentLocaleKey,
	FIRST_TIME_LAUNCH_KEY,
	USERINFO_KEY
} from '@/constant';
import {
	path
} from '@/utils';
import api from '@/apis';
import {
	currentTimeToTimestamp
} from '@/utils/date.js';

export const useCommonStore = defineStore('common', {
	state: () => ({
		lastVersion: '',
		currentVersion: '',
		showToastObj: null,
		needforceUpdate: false,
		MyforceUpdate: false, // 添加缺失的状态
		downloadUrl: '',
		locale: DEFAULT_LOCALE,
		localeEn: DEFAULT_LOCALE_EN,
		systemInfo: null,
		refresh: true,
		postDetail: null,
		shopUrl: 'https://gtracing.com/',
		showBlock: false,
		canLinkWebView: true
	}),

	getters: {
		systemBarHeight: (state) => {
			return path(state.systemInfo, 'statusBarHeight', 0);
		},
		languageType: (state) => {
			const languageMap = {
				'English': 1,
				'Japanese': 2,
				'German': 3,
				'Spanish': 4,
				'French': 5,
				'Italian': 6
			};
			return languageMap[state.localeEn] || 1;
		}
	},

	actions: {
		// 通用状态设置方法
		setState(name, value) {
			this[name] = value;
		},

		setNeedUpdata(updata) {
			this.needforceUpdate = updata;
		},

		// 切换语言
		switchLanguages(locale) {
			setStorageSync(LOCALE_KEY, locale);
			this.locale = locale;
			this.localeEn = getCurrentLocaleKey(locale);
		},

		setShopUrl(str) {
			this.shopUrl = str;
		},

		setcanLinkWebView(flag) {
			this.canLinkWebView = flag;
		},

		setshowBlock(flag) {
			this.showBlock = flag;
		},

		setUpdataState(updata) {
			this.needforceUpdate = updata;
		},

		setMyforceUpdate(updata) {
			this.MyforceUpdate = updata;
		},

		// 获取当前语言
		getLocaleLanguages() {
			const isFirstTimeLaunch = getStorageSync(FIRST_TIME_LAUNCH_KEY) &&
				JSON.parse(getStorageSync(FIRST_TIME_LAUNCH_KEY));
			let locale;

			if (!isFirstTimeLaunch) locale = this.systemInfo?.osLanguage;
			if (!getCurrentLocaleKey(locale)) {
				locale = getStorageSync(LOCALE_KEY) || DEFAULT_LOCALE;
			}
			this.switchLanguages(locale);
			setStorageSync(FIRST_TIME_LAUNCH_KEY, false);
		},

		setRefresh(data) {
			this.refresh = data;
		},

		setShowToastObj(data) {
			this.showToastObj = data;
		},

		setCurrentPostDetail(data) {
			this.postDetail = data;
		},

		// 获取系统栏高度
		getSysteminfo() {
			uni.getSystemInfo({
				success: (res) => {
					this.systemInfo = res;
				}
			});
		},

		async getShopUrl() {
			try {
				const {
					code,
					data
				} = await api.community.getShopUrl();
				if (code === 0) {
					let str = data;
					if (data.indexOf('https://') < 0) {
						str = `https://${data}`;
					}
					this.shopUrl = str;
				}
			} catch (error) {
				console.warn('getShopUrl', error);
			}
		},

		async getVersion() {
			let platform = 'Android';
			try {
				platform = plus.os.name === 'Android' ? 'Android' : 'IOS';
			} catch (error) {
				platform = 'Android';
			}

			try {
				const widgetInfo = await new Promise((resolve) => {
					plus.runtime.getProperty(plus.runtime.appid, (widgetInfo) => {
						resolve(widgetInfo);
					});
				});

				this.currentVersion = widgetInfo.version;
				const userInfo = getStorageSync(USERINFO_KEY);

				const params = {
					platform,
					currentVersion: widgetInfo.version,
					userId: (userInfo && userInfo.isTourist === false) ? userInfo.user_id : ''
				};

				const {
					code,
					data
				} = await api.community.getVerSion(params);

				if (code === 0 && data) {
					this.lastVersion = data.version;
					this.downloadUrl = data.download_url;

					if (data.force_update) {
						this.needforceUpdate = false;
						this.MyforceUpdate = (data.version !== this.currentVersion);
					} else {
						this.MyforceUpdate = false;
						if (data.version === this.currentVersion) {
							this.needforceUpdate = false;
						} else {
							const lastCancerTime = uni.getStorageSync('last_cancer_updata');
							if (!lastCancerTime) {
								this.needforceUpdate = true;
							} else {
								this.needforceUpdate = (currentTimeToTimestamp() - lastCancerTime) > 3600;
							}
						}
					}
				}
			} catch (error) {
				console.warn('getVersion', error);
			}
		}
	}
});