import http from '@/utils/serve'
// import Vue from 'vue'
import {
	getCurrentInstance
} from 'vue'

const api = {}

// 使用 import.meta.glob 替代 require.context
const requireApiModules = import.meta.glob(
	// 匹配当前目录下除 index.js 外的所有 .js 文件
	'./*.js', {
		eager: true, // 同步加载模块（类似 require.context）
		import: 'default' // 直接导入默认导出（可选优化）
	}
)

// 自动导入模块逻辑（保持原有处理逻辑不变）
Object.entries(requireApiModules).forEach(([filePath, module]) => {
	const moduleName = filePath
		.split('/')
		.pop()
		.split('.')
		.shift()

	// console.log('Loading module:', moduleName, module) // 添加调试日志

	if (moduleName !== 'index') {
		api[moduleName] = module(http)
		// console.log('Loaded module:', moduleName, api[moduleName]) // 添加调试日志
	}
})


// 创建全局属性安装方法
const install = (app) => {
	// 注册全局属性
	app.config.globalProperties.$api = api
	app.config.globalProperties.$instagram_client_id = '545964934066147'
	app.config.globalProperties.$instagram_secret = '53dcdc30a6047d30e9c928d367668741'
	app.config.globalProperties.$instagram_redirect_url = 'https://app.gtlynck.com/'
	app.config.globalProperties.$uni_base_API = "https://fc-mp-5febd8bb-2d77-466e-baa5-e0f83abacc8e.next.bspapp.com"
}

// 提供在组合式 API 中访问这些全局属性的方法
const useGlobals = () => {
	const instance = getCurrentInstance()
	return {
		$api: instance?.appContext.config.globalProperties.$api,
		$instagram_client_id: instance?.proxy?.$instagram_client_id,
		$instagram_secret: instance?.proxy?.$instagram_secret,
		$instagram_redirect_url: instance?.proxy?.$instagram_redirect_url,
		$uni_base_API: instance?.proxy?.$uni_base_API,
		proxy: instance?.proxy
	}
}

export default api
export {
	install,
	useGlobals
}