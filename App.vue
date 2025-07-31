<script>
	import {
		mapState
	} from 'pinia'
	import {
		useUserStore
	} from '@/store/user'

	export default {
		onReady() {

		},
		onLaunch: function() {

			console.log('App Launch')
		},
		onShow: function() {
			const userStore = useUserStore()
			userStore.getUserInfo()
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		data() {
			return {

			}
		},
		methods: {

		}
	}
</script>

<style lang="scss">
	// @import '@/static/styles/global.scss';
	// @import '@/uni_modules/uview-plus/index.scss';
	/*每个页面公共css */
</style>