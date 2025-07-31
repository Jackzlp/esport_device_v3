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
	// import { mapActions } from 'vuex'

	import {
		mapState
	} from 'pinia'
	import {
		useUserStore
	} from '@/store/user'

	export default {
		props: {
			tempCommunityId: {
				type: String,
				default: '',
				required: true
			}
		},
		data() {
			return {
				showDialog: true,
				UserStore: useUserStore()
			}
		},

		methods: {
			// ...mapActions('user', ['setUserInfo']),
			// 以游客模式登陆
			async confirm() {
				const params = {
					community_id: this.tempCommunityId
				}

				// console.log(this.$api.user)
				try {
					const {
						data,
						code
					} = await this.$api.user.touristModeLogin(params)

					this.$loading()
					if (code === 0) {
						// console.log('data', data);
						// 设置用户信息
						this.UserStore.setUserInfo({
							...data,
							isTourist: true
						})

						this.$emit('after-login')
						// 游客登陆
					}
				} catch (error) {
					console.log('confirmTourist', error);
				} finally {
					// this.$hideLoading()
					this.close()
				}
			},

			close() {
				this.showDialog = false
				this.$emit('cancel')
			}
		}
	}
</script>