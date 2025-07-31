// src/locales/index.js
import {
	createI18n
} from 'vue-i18n'

import en from './en-US.js'
import de from './de-DE.js'
import es from './es-ES.js'
import fr from './fr-FR.js'
import it from './it-IT.js'
import ja from './ja-JP.js'

// 语言映射关系 - 使用更友好的移动端显示名称
const languageMap = {
	de: {
		name: 'Deutsch',
		flag: '🇩🇪'
	}, // 德语
	en: {
		name: 'English',
		flag: '🇺🇸'
	}, // 英语
	es: {
		name: 'Español',
		flag: '🇪🇸'
	}, // 西班牙语
	fr: {
		name: 'Français',
		flag: '🇫🇷'
	}, // 法语
	it: {
		name: 'Italiano',
		flag: '🇮🇹'
	}, // 意大利语
	ja: {
		name: '日本語',
		flag: '🇯🇵'
	} // 日语
}

const messages = {
	de,
	en,
	es,
	fr,
	it,
	ja
}

// Uniapp 移动端语言检测
const getMobileLocale = () => {
	try {
		// 1. 优先使用用户保存的语言
		const savedLocale = uni.getStorageSync('appLocale')
		if (savedLocale) return savedLocale

		// 2. 获取系统语言 (Uniapp 方式)
		const systemInfo = uni.getSystemInfoSync()
		const systemLang = systemInfo.language || 'en'

		// 3. 简化语言代码 (zh_CN → zh, en-US → en)
		const normalizedLang = systemLang.replace('_', '-').toLowerCase()
		const simpleLang = normalizedLang.split('-')[0]

		// 4. 支持的语言列表
		const supportedLangs = Object.keys(messages)

		// 5. 检查完整匹配 (如 zh-CN)
		if (supportedLangs.includes(normalizedLang)) {
			return normalizedLang
		}

		// 6. 检查简化匹配 (如 zh)
		if (supportedLangs.includes(simpleLang)) {
			return simpleLang
		}
	} catch (e) {
		console.error('Failed to detect language:', e)
	}

	// 7. 默认英语
	return 'en'
}

// 创建 i18n 实例
const i18n = createI18n({
	legacy: false, // 必须设置为 false (Composition API)
	globalInjection: true,
	locale: getMobileLocale(), // 当前语言
	fallbackLocale: 'en', // 回退语言
	messages,
	silentTranslationWarn: true, // 禁用警告
	missingWarn: false, // 禁用缺失翻译警告
	fallbackWarn: false, // 禁用回退警告

})

// 添加 Uniapp 辅助方法
i18n.getLanguageDisplay = function(code) {
	const lang = languageMap[code] || {
		name: code,
		flag: ''
	}
	return `${lang.flag} ${lang.name}`
}

i18n.getAvailableLanguages = function() {
	return Object.keys(languageMap).map(code => ({
		code,
		name: languageMap[code].name,
		flag: languageMap[code].flag
	}))
}

// Uniapp 语言切换方法
i18n.changeLanguage = function(lang) {
	this.global.locale = lang
	uni.setStorageSync('appLocale', lang)

	// 设置应用语言 (Uniapp 特有方法)
	uni.setLocale(lang)

	// 处理 RTL 语言 (如果需要)
	if (['ar', 'he'].includes(lang)) {
		uni.setNavigationBarStyle({
			pageOrientation: 'auto'
		})
	}
}

export default i18n





// <script>
// export default {
//   data() {
//     return {
//       userName: 'User',
//       features: [1, 2, 3] // 用于循环显示特性
//     }
//   },

//   computed: {
//     // 当前语言显示名称
//     currentLanguageDisplay() {
//       return this.$i18n.getLanguageDisplay(this.$i18n.global.locale)
//     },

//     // 可用的语言列表
//     availableLanguages() {
//       return this.$i18n.getAvailableLanguages().map(lang => ({
//         ...lang,
//         display: `${lang.flag} ${lang.name}`
//       }))
//     }
//   },

//   methods: {
//     // 切换语言
//     onLanguageChange(e) {
//       const index = e.detail.value
//       const lang = this.availableLanguages[index].code
//       this.$i18n.changeLanguage(lang)
//     },

//     // 显示问候语
//     showGreeting() {
//       uni.showToast({
//         title: this.$t('greeting', { name: this.userName }),
//         icon: 'none'
//       })
//     },

//     // 初始化检查
//     initLanguage() {
//       // 确保语言设置生效
//       uni.setLocale(this.$i18n.global.locale)
//     }
//   },

//   mounted() {
//     this.initLanguage()
//   }
// }
// </script>