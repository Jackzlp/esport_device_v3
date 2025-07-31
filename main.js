import App from './App'
import {
	createPinia
} from 'pinia'
import
i18n
from './locales'
import api, {
	install as apiInstall
} from './apis'

import uView from 'uview-plus'
import 'uview-plus/index.scss'
import globalMixin from './mixins/global'
import {
	useCommonStore
} from './store/common'; // 必须引入 common 模块

import {
	createSSRApp
} from 'vue'
export function createApp() {
	const app = createSSRApp(App)
	app.config.globalProperties.$api = api
	const pinia = createPinia()
	app.use(pinia)
	app.use(i18n)
	app.use(apiInstall)
	app.use(uView)
	app.mixin(globalMixin)

	return {
		app
	}
}