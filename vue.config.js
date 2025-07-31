// vue.config.js
module.exports = {
	chainWebpack: config => {
		config.plugin('define').tap(definitions => {
			// UniApp 特殊处理：合并到已有的全局变量中
			const vueI18nFlags = {
				__VUE_I18N_FULL_INSTALL__: 'false',
				__VUE_I18N_LEGACY_API__: 'false',
				__INTLIFY_PROD_DEVTOOLS__: 'false'
			};

			definitions[0].terserOptions.compress.drop_console = true
			definitions[0].terserOptions.compress.pure_funcs = [
				'__VUE_I18N_FULL_INSTALL__',
				'__VUE_I18N_LEGACY_API__'
			]
			// 兼容 UniApp 的全局变量
			definitions[0] = Object.assign(definitions[0] || {}, vueI18nFlags);
			return definitions;
		});
	}
};