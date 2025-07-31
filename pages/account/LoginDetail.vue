<template>
	<PageLayout :navigator-content="tempCommunityName">
		<view class="login-page">
			<view class="login-page__logo">
				<image src="/static/images/common/word-logo.png" />
			</view>
			<!-- form -->
			<view class="login-page__form">
				<u-input placeholderStyle='font-family: "Lato-Regular";' v-model.trim="email" class="common-input"
					:placeholder="$t('email')" border="bottom" clearable />
				<!-- 密码input -->
				<CustomPasswordInput class="common-input login-page__form--password" :password.sync="password" />
			</view>
			<!-- 文案 -->
			<view class="login-page__forgot-password"
				@click="$navigateTo(`/pages/account/forgotPassword?communityId=${tempCommunityId}&communityName=${tempCommunityName}`)">
				{{ $t('password_page.forgot_password') }}
			</view>
			<!-- 按钮 -->
			<view class="login-page__login-button" @click="login">
				{{ $t('login') }}
			</view>

			<view v-if="enableTouristMode" class="login-page__tourist-button" @click="touristMode">
				{{ $t('touristMode') }}
			</view>
			<!-- 协议 -->
			<view class="login-page__agreement">
				<Agreement :check-agreement.sync="checkAgreement" :temp-community-id="tempCommunityId" />
			</view>
			<!-- 新建账号 -->
			<view class="login-page__create"
				@click="$navigateTo(`/pages/account/register?communityId=${tempCommunityId}&communityName=${tempCommunityName}`)">
				<image src="/static/images/common/create-account.png" />
				<text>{{ $t('login_page.create_new_account') }}</text>
			</view>
			<!-- 第三方 -->
			<view class="login-page__thirdparty">
				<view class="login-page__thirdparty-content">
					<view class="line-left" />
					{{ $t('login_page.or_join_with') }}
					<view class="line-right" />
				</view>
				<view class="login-page__thirdparty-platform">
					<view v-for="(titem,index) in platforms" v-show="!titem.isHide" :key="titem.name"
						class="login-page__thirdparty-item" @click="clickPlatform(titem.name)">
						<image :src="titem.icon" />
					</view>
				</view>
			</view>
		</view>

		<u-modal :show="showShopify" cancel-color="#838181" confirm-color="#2E67F3" :show-cancel-button="true"
			:confirm-text="$t('skip')" :close-on-click-overlay="false" :cancel-text="$t('cancel')" width="468rpx"
			@confirm="confirmUpdate" @cancel="cancelUpdata">
			<view style="font-size: 32rpx; line-height: 44rpx; color: #333;">
				{{$t('login_page.email_unregistered')}}{{$t('shopifyContent')}}
			</view>
		</u-modal>
		<!-- 当有选中的社区才展示 -->
		<TouristModeConfirmDialog v-if="showTouristModeDialog" :temp-community-id="tempCommunityId"
			@cancel="showTouristModeDialog = false" @after-login="toHomePage" />
	</PageLayout>
</template>

<script>
	// const pluginMobShare = uni.requireNativePlugin('mob-sharesdk');
	// const instagramModule = uni.requireNativePlugin('BenBen-InstagramLogin')
	import Agreement from '@/components/agreement'
	import {
		mapState
	} from 'pinia'
	import {
		debounce
	} from '@/utils'
	import PageLayout from '@/components/page-layout'
	import CustomPasswordInput from '@/components/customPasswordInput'
	import TouristModeConfirmDialog from '@/components/touristModeConfirmDialog'

	import {
		LANGUAGES,
		getCurrentLocaleKey,
		LOCALE_KEY,
	} from '@/constant';
	import {
		clearStorageSync,
		setStorageSync,
		getStorageSync
	} from '@/utils';

	import {
		useUserStore
	} from '@/store/user'
	import {
		useDeviceStore
	} from '@/store/device'
	import {
		useCommonStore
	} from '@/store/common'
	export default {
		components: {
			PageLayout,
			Agreement,
			CustomPasswordInput,
			TouristModeConfirmDialog
		},
		data() {
			return {
				userStore: useUserStore(),
				deviceStore: useDeviceStore(),
				commonStore: useCommonStore(),
				email: '', // 邮箱
				tempCommunityId: '', // 临时社区id
				tempCommunityName: '', // 临时社区名称
				password: '', // 密码
				checkAgreement: true, // 是否同意协议
				currentIOSSys: false, // 是否是IOS系统
				platforms: [{
						name: 'apple',
						isHide: false,
						icon: '/static/images/settings/apple.png',
					},
					{
						name: 'google',
						icon: '/static/images/settings/google.png',
						isHide: false,
					},
					// {
					// 	name: 'facebook',
					// 	icon: require('@images/settings/facebook.png'),

					// },
					// {
					// 	name: 'twitter',
					// 	icon: require('@images/settings/twitter.png')
					// },
					{
						name: 'amazon',
						icon: '/static/images/settings/amazon.png',
						isHide: false,
					},
					{
						name: 'instagram',
						isHide: true,
						icon: '/static/images/settings/instagram.png',
					}
				],

				showTouristModeDialog: false, // 游客模式
				isToHome: false,
				showShopify: false
			}
		},
		onLoad(option) {
			console.log(option)

			this.tempCommunityId = option.communityId || ''
			this.isToHome = option.isToHome || false

			const locale = getStorageSync(LOCALE_KEY)
			// const localeKey = getCurrentLocaleKey(locale)
			// console.log(localeKey)
			this.commonStore.switchLanguages(locale)
			if (!this.tempCommunityId) return this.toCommunitySwitch()
			this.tempCommunityName = option.communityName || ''
			this.currentIOSSys = plus.os.name !== 'Android'
			console.log(plus.os.name)
			// if (plus.os.name === 'iOS') {
			// 	this.platforms[1].isHide = true
			// }
			// if (plus.os.name === 'Android') {
			// 	this.platforms[0].isHide = true
			// 	this.platforms[3].isHide = true
			// }
		},

		computed: {
			...mapState(useUserStore, ['userInfo']),
			...mapState(useDeviceStore, ['channel_id', 'channel_secret'])
		},
		mounted() {

		},
		onShow() {
			this.$hideLoading()
		},

		methods: {


			// ...mapActions('common', ['switchLanguages']),
			// ...mapActions('user', ['setUserInfo']),
			login: debounce(async function() {

				// 校验agreement
				if (!this.validateAgreement()) return

				// 校验表单，不成功就回退
				if (!this.validateForm()) return

				const params = {
					email: this.email,
					community_id: +(this.tempCommunityId || this.communityId),
					passwd: this.password
				}
				this.$loading()
				this.showShopify = false
				try {
					const {
						code,
						data,
						msg
					} = await this.$api.user.userLogin(params)
					let content = this.$t('login_page.success_login')
					let type = 'success'

					console.log(code, data, msg)

					this.$hideLoading()
					if (code === 0) {
						// 设置用户信息
						this.userStore.setUserInfo({
							...data,
							isTourist: false
						})
						uni.removeStorage({
							key: 'hasChangeKey'
						})
						console.log(data)
						// this.loginJinfanServer({
						// 	'name': data.user_id,
						// 	'secret': data.email
						// })
						// uni.getPushClientId({
						// 	success: (res) => {
						// 		console.log(res)
						// 		if (!res.cid || res.cid.length == 0) return
						// 		// 获取cid
						// 		let params = {
						// 			"user_id": data.user_id,
						// 			"cid": res.cid
						// 		}
						// 		uni.request({
						// 			url: `${this.$uni_base_API}/clientInfo`,
						// 			data: params,
						// 			success(re) {},
						// 			fail(err) {}
						// 		})
						// 		this.$api.common.postCid(params).then(res => {
						// 			console.log(res)
						// 		})
						// 	},
						// 	fail: () => {}
						// })
						this.$getPushCid(data.user_id)

						uni.request({
							url: `${this.$uni_base_API}/uploadUserinfo`,
							data: data,
							success(dres) {},
							fail() {

							}
						})
						// 判断选择社区
						// if (!this.communityId) return this.$navigateTo('/pages/account/communitySwitch');
						console.log(this.isToHome)
						if (this.isToHome) {
							this.$toast({
								content,
								type
							})
							uni.navigateBack()
							return
						} else {
							this.$toast({
								content,
								type
							})
							// 去主页
							return this.toHomePage()
						}
					} else {

					}
					if (code === 1012 || code === 1010 || code === 1000) {
						this.showShopify = true
						return
					}
					// 异常处理
					const codeMap = {
						1010: this.$t('login_page.email_unregistered'), // 用户未注册
						1013: this.$t('login_page.password_invalid'), // 密码错误
						1030: this.$t('login_page.account_restricted') // 账号被限制了 未确
					}
					content = codeMap[code] || msg
					type = 'error'
					this.$toast({
						content,
						type
					})
				} catch (error) {
					console.warn('login', error)
					this.$hideLoading()
				} finally {
					this.$hideLoading()
				}
			}, 200),

			confirmUpdate() {
				plus.runtime.openURL('https://gtracing.com/accxount/login')
			},
			cancelUpdata() {
				this.showShopify = false
			},

			loginJinfanServer(dic) { //登录或则注册
				dic.channel_id = this.channel_id
				dic.channel_secret = this.channel_secret
				uni.request({
					url: 'https://hapi.jingfantech.com/V2.0/register_step_2',
					data: JSON.stringify(dic),
					method: 'POST',
					success(res) {
						if (res.statusCode === 200) {
							switch (res.data.errcode) {
								case 0: //注册成功
									break
								case 11: //已经注册了
									break
								default: { //失败
								}
							}
							if (res.data.errcode === 0) {}
						}
						console.log(res)
					},
					fail(err) {
						console.log(err)
					}
				})
			},

			// 校验协议
			validateAgreement() {
				if (this.checkAgreement) return true
				this.$toast({
					content: this.$t('login_page.agreement_hint'),
					type: 'plain'
				})
				return false
			},

			// 校验表单
			validateForm() {
				// 邮箱是否有效
				const isEmailValid = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(this
					.email)

				// 展示邮箱错误的提示
				this.isEmailValid = isEmailValid
				let content = ''
				const type = 'error'
				if (!isEmailValid) {
					content = this.$t('login_page.email_error_hint')
				} else if (!this.password) {
					content = this.$t('edit_profile_page.input_placeholder', {
						params: this.$t('password')
					})
				} else if (this.password.length < 5) {
					content = this.$t('password_page.password_invalid_hint')
				}
				if (content) this.$toast({
					content,
					type
				})
				return !content
			},

			// 点击第三方平台
			clickPlatform(platform) {
				const MobArr = ['twitter', 'instagram', 'amazon']
				const that = this
				console.log('clickPlatform', platform)
				if (plus.os.name == 'Android') {
					switch (platform) {
						case 'facebook':
							if (!plus.runtime.isApplicationExist({
									pname: 'com.facebook.katana'
								})) {
								plus.runtime.openURL('https://play.google.com/store/apps/details?id=com.facebook.katana')
								return
							}
							break;
						case 'twitter':
							if (!plus.runtime.isApplicationExist({
									pname: 'com.twitter.android'
								})) {
								plus.runtime.openURL('https://play.google.com/store/apps/details?id=com.twitter.android')
								return
							}
							break;
						case 'instagram':
							if (!plus.runtime.isApplicationExist({
									pname: 'com.instagram.android'
								})) {
								plus.runtime.openURL('https://play.google.com/store/apps/details?id=com.instagram.android')
								return
							}
							break;
						default:
							break;
					}
				}
				if (MobArr.indexOf(platform) > -1) {

					if (platform === "amazon") {
						this.handleAmazonLogin()
					} else {
						this.handleMobLogin(platform)
					}

					// 回传隐私授权状态
					// pluginMobShare.submitPrivacyGrantResult({
					// 	isUrl: 'true',
					// 	mobAppkey: this.$mobAppkey,
					// 	mobSecret: this.$mobSecret
					// }, result => {
					// 	const msg = JSON.stringify(result);
					// 	console.log('submitPrivacyGrantResult', msg)
					// 	this.handleMobLogin(platform)
					// });
					return
				}

				uni.login({
					provider: platform,
					success(loginRes) {
						console.log('loginRes', loginRes)
						that.$loading()
						// 登录成功
						uni.getUserInfo({
							provider: platform,
							success(info) {
								console.log('info', info)
								if (platform === 'apple') {
									that.thirdLogin(info.userInfo, platform)
								} else {
									that.quickThirdLogin(info.userInfo, platform)
								}

								// that.thirdLogin(info.userInfo, platform)
								var third = null
								var thirdDic = {}
								plus.oauth.getServices(function(services) {
									for (var i = 0; i < services.length; i++) {
										let service = services[i]
										thirdDic[service.id] = service
									}
									third = thirdDic[platform]
									if (!third) return

									third.logout(function(sc) {
										console.log(sc)
									}, function(e) {
										console.log(err)
									})

								}, function(e) {

								})
								// 获取用户信息成功, info.authResult保存用户信息
							},
							fail(err) {
								that.$hideLoading()
								console.log('clickPlatform1', err)
							}
						})
					},
					fail(err) {
						that.$hideLoading()
						console.log('clickPlatform2', err)
						// that.$toast({
						// 	content: `errcode:${err.errCode}`,
						// 	type: 'error'
						// })
						if (platform === "amazon") {
							return
						}
						let content = that.$t('login_page.authorization_error')
						that.$toast({
							content: content,
							type: 'error'
						})

						// 登录授权失败
						// err.code是错误码
					}
				});
			},

			handleAmazonLogin() {
				const clientId = 'amzn1.application-oa2-client.034292886c31498d9261e8ddd50286a0';
				const redirectUri = 'https://app.gtlynck.com/static/amazon_login.html';
				const scope = 'profile';
				const authUrl =
					`https://www.amazon.com/ap/oa?client_id=${clientId}&scope=${scope}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`;
				uni.navigateTo({
					url: `/pages/account/auth?authUrl=${encodeURIComponent(authUrl)}&communityName=${this.tempCommunityName}&communityId=${this.tempCommunityId}`
				});
			},

			handleMobLogin(platform) {
				// try {



				// 	instagramModule.instagramLogin({
				// 			'instagram_client_id': this.$instagram_client_id,
				// 			'instagram_secret': this.$instagram_secret,
				// 			'instagram_redirect_url': this.$instagram_redirect_url
				// 		},
				// 		ret => {
				// 			console.log(JSON.parse(ret))
				// 			let obj = null
				// 			if (typeof ret === 'string') {
				// 				obj = JSON.parse(ret)
				// 			} else {
				// 				obj = ret
				// 			}
				// 			if (obj.code === 1) {
				// 				this.$loading()
				// 				this.thirdLogin(obj && obj.data, platform)
				// 			} else {
				// 				this.$hideLoading()
				// 			}
				// 		})
				// 	// pluginMobShare.getUserInfo({
				// 	//     platName: platformJSON[platform]
				// 	//     // mobAppkey: this.$mobAppkey,
				// 	//     // mobSecret: this.$mobSecret
				// 	// }, result => {
				// 	//     this.$loading()
				// 	//     console.log('handleMobLogin1', result)
				// 	//     if (result.state === 1) {
				// 	//         this.thirdLogin(result.userData && result.userData.rawData, platform)
				// 	//     } else {
				// 	//         this.$hideLoading()
				// 	//     }

				// 	// });

				// } catch (error) {
				// 	console.log('handleMobLogin2', error)
				// }
			},
			// getMobUserInfo() {
			//     pluginMobShare.getUserInfo({
			//         platName: '24',
			//         mobAppkey: 'moba0b0c0d0',
			//         mobSecret: '5713f0d88511f9f4cf100cade0610a34'
			//     }, result => {
			//         console.log('getMobUserInfo', result)
			//         switch (result.type) {
			//         case 'onComplete':
			//             console.log(`callback---onComplete--${result.onCompleteResult}`);
			//             break;
			//         case 'onError':
			//             console.log(`callback---onError--${result.onErrorResult}`);
			//             break;
			//         case 'onCancel':
			//             console.log('callback---onCancel--');
			//             break;
			//         default:
			//             break
			//         }
			//     });
			// },

			async quickThirdLogin(obj, platform) {
				let that = this
				const changeKey = {
					facebook: 'Facebook',
					twitter: 'Twitter',
					google: 'Google',
					instagram: 'Instagram',
					apple: 'Apple',
					amazon: 'Amazon'
				}
				const quickParams = {
					open_id: obj.open_id || obj.openId || obj.id,
					platform: changeKey[platform],
					community_id: this.tempCommunityId,
					email: obj.email
				}

				try {
					let {
						code,
						data,
						msg
					} = await this.$api.user.loginQuick(quickParams)
					console.log(code, data, msg)
					console.log(quickParams)
					setTimeout(() => {
						this.$hideLoading()
					}, 600)
					let content = this.$t('login_page.success_login')
					let type = 'success'

					if (code === 0) {
						// 设置用户信息
						this.userStore.setUserInfo({
							...data,
							isTourist: false
						})
						uni.removeStorage({
							key: 'hasChangeKey'
						})

						// 判断选择社区
						// if (!this.communityId) return this.$navigateTo('/pages/account/communitySwitch');
						// 去主页

						if (data.is_reg === 1) {

							uni.navigateTo({
								url: './setNewpassward',
								animationType: 'zoom-fade-out',
								success() {

								},
								fail(err) {
									console.log(err)
								}
							})

							// that.$refs.newUser.open()
							return
						} else {
							that.$toast({
								content,
								type
							})
							return that.toHomePage()
						}

					}


					// 异常处理
					const codeMap = {
						1010: this.$t('login_page.email_unregistered'), // 用户未注册
						1013: this.$t('login_page.password_invalid'), // 用户已存在
						1030: this.$t('login_page.account_restricted'), // 账号被限制了 未确定
						1021: this.$t('login_page.thirdHasBindEmail', {
							email: msg
						}),
						1023: this.$t('login_page.emailHasBindThird', {
							email: msg
						})

					}
					content = codeMap[code] || msg
					let duration = code === 1021 ? 5000 : code === 1023 ? 5000 : 1500
					type = 'error',
						this.$toast({
							content,
							type,
							duration: duration
						})

				} catch {
					this.$hideLoading()
					this.$toast({
						content: error,
						type: 'error'
					})
				}
			},



			async thirdLogin(obj, platform) {
				const changeKey = {
					facebook: 'Facebook',
					twitter: 'Twitter',
					google: 'Google',
					instagram: 'Instagram',
					apple: 'Apple',
					amazon: 'Amazon'
				}
				const nick_name = (obj.nickname || obj.name || obj.username || obj.email || obj.authorizationCode ||
					'xxx').substring(0, 24)
				console.log('thirdLogin-nick_name', nick_name)
				const params = {
					nick_name,
					community_id: this.tempCommunityId,
					avatar: obj.avatarUrl,
					gender: obj.gender || 'unknow',
					open_id: obj.open_id || obj.openId || obj.id,
					platform: changeKey[platform]
				}
				try {
					console.log('thirdLogin-params', params)
					const {
						code,
						data,
						msg
					} = await this.$api.user.thirdLogin(params)

					console.log('thirdLogin', code, data, msg)
					setTimeout(() => {
						this.$hideLoading()
					}, 600)
					let content = this.$t('login_page.success_login')
					let type = 'success'

					if (code === 0) {
						// 设置用户信息
						this.userStore.setUserInfo({
							...data,
							isTourist: false
						})
						this.$toast({
							content,
							type
						})
						uni.removeStorage({
							key: 'hasChangeKey'
						})
						// 判断选择社区
						// if (!this.communityId) return this.$navigateTo('/pages/account/communitySwitch');
						// 去主页
						return this.toHomePage()
					}
					if (code === 1012) return
					if (code === 1020) {
						console.log('生效了么')
						// this.$toast({ content: this.$t('login_page.email_unregistered'), type: 'error' })
						this.$navigateTo(
							`/pages/account/thirdParty?platform=${changeKey[platform]}&id=${data.id}&name=${nick_name}&email=${obj.email}&openId=${obj.openId || obj.id}&communityName=${this.tempCommunityName}&communityId=${this.tempCommunityId}`
						)
						return
					}
					// 异常处理
					const codeMap = {
						1010: this.$t('login_page.email_unregistered'), // 用户未注册
						1013: this.$t('login_page.password_invalid'), // 用户已存在
						1030: this.$t('login_page.account_restricted') // 账号被限制了 未确定
					}
					content = codeMap[code] || msg
					type = 'error'

					this.$toast({
						content,
						type
					})
				} catch (error) {
					this.$hideLoading()
					this.$toast({
						content: error,
						type: 'error'
					})
					console.warn('login', error)
				}
			},

			touristMode() {
				this.showTouristModeDialog = true

			}
		}
	}
</script>

<style lang="scss">
	.login-page {
		padding: 32rpx;
		display: flex;
		flex-direction: column;
		// height: 100vh;
		// width: 100vw;

		&__logo {
			display: flex;
			justify-content: center;
			margin-top: 120rpx;

			image {
				height: 56rpx;
				width: 380rpx;
			}
		}

		&__available {
			height: 48rpx;
			width: 48rpx;
		}

		&__form {
			margin: 120rpx 0 0;

			&--password {
				margin: 100rpx 0 0;
			}
		}

		&__forgot-password {
			margin: 30rpx 0 0;
			text-align: right;
		}

		&__login-button {
			height: 112rpx;
			color: #fff;
			background: linear-gradient(360deg, #4D4D4D 0%, #303030 100%);
			border-radius: 8px;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 36rpx;
			margin-top: 96rpx;
		}

		&__tourist-button {
			height: 112rpx;
			color: #333;
			border: 1rpx solid #333333;
			background: #fff;
			border-radius: 8px;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 36rpx;
			margin-top: 16rpx;
		}

		&__agreement {
			margin: 22rpx 0 0;
		}

		&__create {
			display: flex;
			align-items: center;
			justify-content: center;
			color: #3067F0;
			font-size: 28rpx;
			margin-top: 50rpx;

			image {
				margin-right: 10rpx;
				width: 48rpx;
				height: 48rpx;
			}
		}

		&__thirdparty {
			margin: 50rpx 0 0;

			&-content {
				color: #808690;
				display: flex;
				align-items: center;

				.line-left,
				.line-right {
					flex: 1;
					height: 2rpx;
					background: #e2e2e2;
				}

				.line-left {
					margin-right: 50rpx;
				}

				.line-right {
					margin-left: 50rpx;
				}
			}

			&-platform {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-top: 40rpx;
			}

			&-item {
				display: flex;
				align-items: center;
				justify-content: center;
				background: #f2f2f2;
				border-radius: 96rpx;
				height: 96rpx;
				width: 96rpx;

				image {
					width: 48rpx;
					height: 48rpx;
				}
			}
		}

		.common-button {
			height: 112rpx;
			color: #fff;
			background: linear-gradient(360deg, #4D4D4D 0%, #303030 100%);
			border-radius: 8px;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 36rpx;

			&.revert {
				height: 108rpx;
				background: #fff;
				color: #333333;
				border: 2rpx solid #333333;
			}

			&:not(:first-child) {
				margin: 32rpx 0 0;
			}
		}
	}
</style>