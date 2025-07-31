<template>
	<PageLayout type="custom">
		<!-- 选择社区 -->
		<view class="choose-panel" :style="{ paddingTop: `${systemBarHeight * 2}rpx` }">
			<!-- 头部 -->
			<view class="choose-panel__title">
				{{ $t('select_area.community_join_title') }}
			</view>
			<view class="choose-panel__hint">
				{{ $t('select_area.community_area_hint') }}
			</view>
			<!-- 社区列表 -->
			<view class="choose-panel__communities">
				<view class="sub-title">
					{{ $t('select_area.community_join_sub_title') }}
				</view>
				<view class="choose-panel__list">

					<view v-for="community in communities" :key="community.name"
						:class="['choose-panel__community', selectedCommunity && selectedCommunity.name === community.name ? 'selected' : '']">
						<view class="choose-panel__community-cover">
							<image :src="community.icon" />
						</view>
						<view class="choose-panel__community-title" @click="switchCommunity(community)">
							{{ community[nowLanguage] }}
						</view>
						<image v-if="selectedCommunity && selectedCommunity.name === community.name"
							class="choose-panel__community-check" :src="'/static/images/community/confirm.png'" />
					</view>
				</view>
				<!-- <view
          class="common-button"
          @click="handleShowConfirmModal"
        >
          {{ $t('select_area.community_join_confirm') }}
        </view> -->
			</view>
		</view>

		<!-- 当有选中的社区才展示 -->
		<u-modal v-if="selectedCommunity" :show="showConfirmModal" cancel-color="#838181" confirm-color="#E21D1C"
			:show-cancel-button="true" :confirm-text="$t('confirm')" :cancel-text="$t('cancel')"
			:close-on-click-overlay="true" @close="showConfirmModal = false" @cancel="showConfirmModal = false"
			@confirm="confirmJoin">
			<view style="font-size: 32rpx; line-height: 44rpx; color: #333;">
				{{ $t('select_area.community_join_hint', { communityName: selectedCommunity.name }) }}
			</view>
		</u-modal>

		<u-popup :show.sync="showServiceupdata" mode="center" round="20px" :mask-click="false">
			<view class="popup-content">
				<view class="popup-title">{{$t('servertitle')}}</view>
				<view class="popup-message">{{$t('servicecontent')}}</view>
			</view>
		</u-popup>
	</PageLayout>
</template>

<script>
	import {
		mapState
	} from 'pinia';

	import {
		useCommunityStore
	} from '@/store/community'
	import {
		useCommonStore
	} from '@/store/common'
	import {
		useUserStore
	} from '@/store/user'
	import PageLayout from '@/components/page-layout'
	import store from '@/store'
	import {
		LANGUAGES,
		getCurrentLocaleKey,
		LOCALE_KEY,
	} from '@/constant';
	import {
		clearStorageSync,
		setStorageSync
	} from '@/utils';


	export default {
		components: {
			PageLayout
		},
		data() {
			return {
				selectedCommunity: null,
				showConfirmModal: false,
				nowLanguage: 'English',
				languages: LANGUAGES,
				showServiceupdata: false,
				communityStore: useCommunityStore(),
				userStore: useUserStore(),
				commonStore: useCommonStore()
			}
		},

		computed: {

			...mapState(useCommunityStore, ['communities']),
			...mapState(useCommonStore, ['systemBarHeight'])
		},
		watch: {
			communities(newVal) {
				if (newVal && newVal.length > 0) {
					// this.$hideLoading()
				}
			}
		},
		mounted() {
			if (this.communities && this.communities.length === 0) {
				// this.$loading()
			}
			this.communityStore.getCommunity()
			const locale = useCommonStore().locale

			this.nowLanguage = getCurrentLocaleKey(locale)

			let that = this
			uni.request({
				url: `${this.$uni_base_API}/serviceupkeep`,
				success(res) {
					// console.log(res)
					that.showServiceupdata = res.data ? res.data : false
					that.$forceUpdate()
				},
				fail(error) {}
			})
		},

		methods: {
			// ...mapActions('community', ['setNeedReflash', 'getCommunity']),
			// ...mapActions('user', ['updateUserInfo']),
			// ...mapActions('common', ['switchLanguages']),
			// 切换同意协议
			switchCommunity(community) {
				// this.selectedCommunity = community
				// if (community.id === 32) {
				// 	this.nowLanguage = getCurrentLocaleKey('ja-JP')
				// 	this._i18n.locale = 'ja-JP'
				// 	setStorageSync(LOCALE_KEY, 'ja-JP')
				// } else {
				// 	setStorageSync(LOCALE_KEY, 'en-US')
				// 	this.nowLanguage = getCurrentLocaleKey('en-US')
				// 	this._i18n.locale = 'en-US'
				// }
				this.selectedCommunity = community;

				// 2. 根据社区ID切换语言（通过 Pinia 的 commonStore 管理语言状态）
				const targetLocale = community.id === 32 ? 'ja-JP' : 'en-US';
				const targetLanguageKey = getCurrentLocaleKey(targetLocale);

				// 3. 更新 i18n  locale（Vue3 中通常通过 this.$i18n 访问）
				this.$i18n.locale = targetLocale;

				// 4. 同步到 Pinia 的 commonStore（保持状态统一）
				this.commonStore.switchLanguages(targetLocale); // 调用 commonStore 中定义的切换语言方法

				// 5. 同步到本地存储
				setStorageSync(LOCALE_KEY, targetLocale);

				// 6. 更新当前组件的语言标识
				this.nowLanguage = targetLanguageKey;

				this.confirmJoin()
			},

			// 展示确定弹窗
			handleShowConfirmModal() {
				// 没有选择则不展示
				if (!this.selectedCommunity) return this.$toast({
					content: this.$t('select_area.community_area_hint')
				})
				this.showConfirmModal = true
			},

			// 确定加入
			async confirmJoin() {
				const params = {
					community_id: this.selectedCommunity.id
				}
				this.showConfirmModal = false
				this.communityStore.setNeedReflash(true)
				uni.navigateTo({
					url: `/pages/account/login?communityId=${this.selectedCommunity.id}&communityName=${this.selectedCommunity[this.nowLanguage]}`,
					success() {

					},
					fail(err) {
						console.log(err)
					}
				})

				uni.setStorage({
					data: this.selectedCommunity.id ? this.selectedCommunity.id : "",
					key: "currentCommunityId"
				})
				// this.$loading()
				// try {
				//     const { code } = await this.$api.user.bindCommunity(params)
				//     this.$hideLoading()
				//     if (code === 0) {
				//         this.$toast({
				//             content: this.$t('thirdparty_bind_page.success_bind'),
				//             type: 'success'
				//         })

				//         await this.updateUserInfo()

				//         this.toHomePage()
				//     }
				// } catch (error) {
				//     this.$hideLoading()
				//     console.warn('confirmJoin', error);
				// }
			}
		}
	}
</script>

<style lang="scss" scoped>
	.choose-panel {
		background: #F9F9F9;
		border-radius: 40rpx 40rpx 0 0;
		position: relative;
		min-height: 100vh;
		display: flex;
		flex-direction: column;

		&__close {
			position: absolute;
			width: 72rpx;
			height: 72rpx;
			background: #fff;
			border-radius: 36rpx;

			display: flex;
			justify-content: center;
			align-items: center;
			right: 52rpx;
			top: -36rpx;

			image {
				width: 40rpx;
				height: 40rpx;
			}
		}

		&__title {
			padding: 112rpx 52rpx 0;
			font-size: 72rpx;
			line-height: 100rpx;
			font-weight: bold;
			color: #333;
		}

		&__hint {
			padding: 0 52rpx;
			margin: 28rpx 0 0;
			color: #b2b2b2;
			font-size: 32rpx;
			line-height: 44rpx;
		}

		&__subtitle {
			color: #333;
			font-size: 32rpx;
			font-weight: bold;
			line-height: 44rpx;
		}

		&__communities {
			flex: 1;
			margin: 52rpx 0 0;
			padding: 52rpx;
			border-radius: 40rpx 40rpx 0 0;
			background: #fff;

		}

		&__community {
			display: flex;
			justify-content: center;
			align-items: center;
			margin-top: 52rpx;
			color: #838181;

			&.selected {
				color: #E3211D;
				font-weight: bold;
			}

			&-cover {
				display: flex;
				align-items: center;
				padding: 8rpx 6rpx;
				border: 2rpx solid #D8D8D8;
				border-radius: 4rpx;

				image {
					width: 70rpx;
					height: 40rpx;
				}
			}

			&-title {
				margin-left: 32rpx;
				font-size: 32rpx;
				flex: 1;
			}

			&-check {
				width: 24rpx;
				height: 24rpx;
			}
		}

		.common-button {
			position: fixed;
			bottom: 28px;
			left: 28px;
			right: 28px;

			margin-top: 52rpx;
		}
	}

	.popup-content {
		background-color: #fff;
		padding: 20px;
		border-radius: 10px;
		text-align: center;

	}

	.popup-title {
		font-size: 20px;
		font-weight: bold;
		margin-bottom: 10px;
	}

	.popup-message {
		font-size: 16px;
		color: #666;
	}
</style>