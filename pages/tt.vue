<template>
	<view>

	</view>
</template>

<script>
	import {
		useUserStore
	} from '@/store/user'
	import {
		useCommonStore
	} from '@/store/common'

	import {
		mapState
	} from 'pinia';
	export default {
		data() {
			return {

			}
		},
		computed: {
			// 2. 使用创建 store 的函数映射状态（而非实例）
			...mapState(useUserStore, ['userInfo', 'communityId']),
			...mapState(useCommonStore, ['systemBarHeight', 'locale']),
		},
		mounted() {
			const user = useUserStore()
			const common = useCommonStore()
			console.log('aaa' + user.name)
			console.log('bbbb' + common.systemBarHeight)
		},

		methods: {

		}
	}
</script>

<style>

</style>