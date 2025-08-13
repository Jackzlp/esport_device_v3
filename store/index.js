// store/index.js


import {
	defineStore,
	getActivePinia
} from 'pinia';

// 动态加载模块
const modules = {};

const requireStoreModules = import.meta.glob(
	'./modules/!(index).js', {
		eager: true
	}
);

// 自动注册模块
Object.entries(requireStoreModules).forEach(([fileName, module]) => {
	const moduleName = fileName
		.split('/')
		.pop()
		.split('.')
		.shift();

	modules[moduleName] = defineStore(moduleName, {
		state: () => (module.state || {}),
		getters: module.getters || {},
		actions: module.actions || {}
	});
});

// 辅助函数：获取指定模块的 store
export function useStore(moduleName) {
	const pinia = getActivePinia();
	if (!pinia) {
		throw new Error('Pinia instance not found!');
	}

	const storeCreator = modules[moduleName];
	if (!storeCreator) {
		console.warn(`Store module "${moduleName}" not found`);
		return null;
	}

	return storeCreator(pinia);
}

// 创建全局 store
export const useGlobalStore = defineStore('global', {
	state: () => ({
		test: 'global store value'
	}),

	actions: {
		setState(payload) {
			const {
				name,
				value
			} = payload;
			const parts = name.split('/');

			if (parts.length === 1) {
				// 设置全局状态
				this[name] = value;
			} else if (parts.length === 2) {
				// 设置模块状态
				const [moduleName, stateName] = parts;
				const moduleStore = useStore(moduleName);

				if (moduleStore) {
					moduleStore.$patch({
						[stateName]: value
					});
				}
			}
		}
	}
});

export default modules;

// import {
// 	defineStore
// } from 'pinia'

// // 动态加载模块
// const modules = {};

// const requireStoreModules = import.meta.glob(
// 	// 匹配所有 .js 文件（除了 index.js）
// 	'./modules/!(index).js', {
// 		eager: true
// 	}
// );

// // 自动注册模块
// Object.entries(requireStoreModules).forEach(([fileName, module]) => {
// 	// 通过路径获取模块名
// 	const moduleName = fileName
// 		.split('/')
// 		.pop()
// 		.split('.')
// 		.shift();

// 	// 使用 defineStore 创建 Pinia store
// 	modules[moduleName] = defineStore(moduleName, {
// 		state: () => (module.state || {}),
// 		getters: module.getters || {},
// 		actions: module.actions || {}
// 	});
// });

// // 创建全局 store
// export const useGlobalStore = defineStore('global', {
// 	state: () => ({
// 		test: 'fuck you'
// 	}),
// 	actions: {
// 		// 通用状态设置方法
// 		setState(payload) {
// 			const {
// 				name,
// 				value
// 			} = payload;
// 			const parts = name.split('/');

// 			if (parts.length === 1) {
// 				// 设置全局状态
// 				this[name] = value;
// 			} else if (parts.length === 2) {
// 				// 设置模块状态
// 				const [moduleName, stateName] = parts;
// 				const moduleStore = useStore(moduleName);

// 				if (moduleStore) {
// 					// moduleStore.$patch(state => {
// 					// 	if (typeof value === 'object' && value !== null) {
// 					// 		state[stateName] = Object.assign({}, value);
// 					// 	} else {
// 					// 		state[stateName] = value;
// 					// 	}
// 					// });
// 				}
// 			}
// 		}
// 	}
// });

// // 辅助函数：获取指定模块的 store
// export function useStore(moduleName) {
// 	const storeCreator = modules[moduleName];
// 	if (!storeCreator) {
// 		console.warn(`Store module "${moduleName}" not found`);
// 		return null;
// 	}
// 	return storeCreator();
// }

// // 导出所有模块
// export default modules;