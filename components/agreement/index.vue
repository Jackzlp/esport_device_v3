<template>
	<!-- 协议 -->
	<view class="agreement">
		<image :src="`/static/images/common/agreement-${checkAgreement ? 'checked' : 'unchecked'}.png`"
			@click="switchAgreement" />

		<view class="agreement__content">
			<!-- 中文 -->
			<template v-if="locale === 'zh-CN'">
				阅读并同意<text class="trigger" @click="goToAgreement">
					用户协议
				</text>、
				<text class="trigger" @click="goToAgreement">
					隐私协议
				</text>
			</template>

			<!-- 英语 -->
			<template v-else-if="locale === 'en-US'">
				Read and agree to the
				<text class="trigger" @click="goToAgreement">
					<{{ $t('agreement.userAgreement')  }}>
				</text>
				and
				<text class="trigger" @click="goToAgreement">
					<{{ $t('agreement.privacyAgreement')  }}>
				</text>
			</template>

			<!-- 日语 -->
			<template v-else-if="locale === 'ja-JP'">
				進む前に、必ず
				<text class="trigger" @click="goToAgreement">
					<{{ '利用規約'  }}>
				</text>
				と
				<text class="trigger" @click="goToAgreement">
					<{{ 'プライバシーポリシー' }}>
				</text>
				をお読みいただき、同意してください。
			</template>

			<!-- 德语 -->
			<template v-else-if="locale === 'de-DE'">
				Stimmen zu
				<text class="trigger" @click="goToAgreement">
					<{{ $t('agreement.userAgreement')  }}>
				</text>
				und die
				<text class="trigger" @click="goToAgreement">
					<{{ $t('agreement.privacyAgreement')  }}>
				</text>
			</template>

			<!-- 西班牙语 -->
			<template v-else-if="locale === 'es-ES'">
				{{ 'He leído y acepto las condiciones de uso del ' }}
				<text class="trigger" @click="goToAgreement">
					servicio y la política de privacidad
				</text>
			</template>

			<!-- 法语 -->
			<template v-else-if="locale === 'fr-FR'">
				Lisez et acceptez les
				<text class="trigger" @click="goToAgreement">
					<{{ $t('agreement.userAgreement')  }}>
				</text>
				et l'
				<text class="trigger" @click="goToAgreement">
					<{{ $t('agreement.privacyAgreement') }}>
				</text>
			</template>

			<!-- 意大利语 -->
			<template v-else-if="locale === 'it-IT'">
				Leggere e accettare il
				<text class="trigger" @click="goToAgreement">
					<{{ $t('agreement.userAgreement')  }}>
				</text>
				e il
				<text class="trigger" @click="goToAgreement">
					<{{ $t('agreement.privacyAgreement')  }}>
				</text>
			</template>

			<template v-else />
		</view>
	</view>
</template>

<script>
	import {
		useCommonStore
	} from '@/store/common'
	import {
		mapState
	} from 'pinia'
	export default {
		props: {
			checkAgreement: {
				type: Boolean,
				default: false
			},
			tempCommunityId: {
				type: [String, Number],
				required: true
			},
			// locale: {
			// 	type: String,
			// 	default: 'en-US' // 默认值
			// }
		},
		data() {
			return {}
		},

		// filters: {
		// 	addTag(text) {
		// 		return `<${text}>`
		// 	}
		// },
		computed: {
			...mapState(useCommonStore, ['locale'])
		},

		mounted() {
			this.initAgreement()
		},

		methods: {
			addTag(text) {


			},
			// 切换同意协议
			switchAgreement() {
				this.$emit('update:checkAgreement', !this.checkAgreement)

				uni.setStorageSync('checkAgreement', !this.checkAgreement)
			},

			// 初始化同意协议
			initAgreement() {
				uni.setStorageSync('checkAgreement', true) // 应产品要求要默认勾选
				const checkAgreement = uni.getStorageSync('checkAgreement')

				this.$emit('update:checkAgreement', !!checkAgreement)
			},

			goToAgreement() {
				this.$navigateTo(`/pages/account/agreement?communityId=${this.tempCommunityId}`)
			}
		}
	}
</script>

<style lang="scss">
	.agreement {
		display: flex;
		justify-content: flex-start;
		align-items: flex-start;
		font-family: "Lato-Bold";

		image {
			width: 22rpx;
			height: 22rpx;
			margin-right: 10rpx;
			margin-top: 5rpx;
		}

		&__content {
			word-break: break-all;
			font-size: 20rpx;
			color: #808690;

			.trigger {
				color: #333;
				padding: 0 6rpx;
			}
		}
	}
</style>