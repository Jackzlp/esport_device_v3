<template>
	<!-- 当有选中的社区才展示 -->
	<u-modal :show="showDialog" cancel-color="#838181" confirm-color="#2E67F3" :show-cancel-button="true"
		:confirm-text="$t('confirm')" :cancel-text="$t('cancel')" :close-on-click-overlay="true" @close="close"
		@cancel="close" @confirm="confirm">
		<view style="font-size: 32rpx; line-height: 44rpx; color: #333;">
			{{ $t('touristConfirmDialogContent') }}
		</view>
	</u-modal>
</template>

<script>
	// import { mapState } from 'vuex'
	import {
		useUserStore
	} from '@/store/user'

	import {
		mapState
	} from 'pinia'

	export default {
		props: {

		},
		data() {
			return {
				showDialog: true
			}
		},

		computed: {
			...mapState(useUserStore, ['userInfo'])
		},

		mounted() {

		},

		methods: {
			// 以游客模式登陆
			confirm() {
				console.log(this.userInfo)
				this.toLoginPage({
					communityId: this.userInfo ? this.userInfo.community_id : ''
				})
				this.close()
			},

			close() {
				this.showDialog = false
				this.$emit('close')
			}
		}
	}
</script>