// vue.config.js
module.exports = {
	transpileDependencies: ['uview-plus'],
	configureWebpack: {
		module: {
			rules: [{
				test: /\.vue$/,
				use: {
					loader: 'vue-loader',
					options: {
						compilerOptions: {
							// 解决 u- 组件识别问题
							isCustomElement: tag => tag.startsWith('u-')
						}
					}
				}
			}]
		}
	},
	chainWebpack: config => {


		config.plugin('define').tap(definitions => {
			// UniApp 特殊处理：合并到已有的全局变量中
			const vueI18nFlags = {
				__VUE_I18N_FULL_INSTALL__: 'false',
				__VUE_I18N_LEGACY_API__: 'false',
				__INTLIFY_PROD_DEVTOOLS__: 'false'
			};
			config.plugin('define').tap(args => {
				args[0] = args[0] || {}
				args[0].UNI_PLATFORM = JSON.stringify(process.env.UNI_PLATFORM)
				return args
			})

			config.resolve.alias
				.set('@', resolve(''))
				.set('@pages', resolve('pages'))
				.set('@static', resolve('static'))
				.set('@images', resolve('static/images'))
				.set('@apis', resolve('static/apis'))

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