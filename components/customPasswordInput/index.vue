<template>
	<view class="common-input custom-password-input ">
		<input :type="!passwordState ? 'password' : 'text'" :maxlength="20" @input="handleInputChange" />
		<text v-if="displayPlaceHolder" class="placeholder">
			{{ placeholder || $t('password') }}
		</text>
		<image :src="`/static/images/login/password-${ passwordState ? '' : 'un'}available.png`"
			@click="switchPasswordState" />
	</view>
</template>

<script>
	export default {
		props: {
			password: {
				type: [String, Number],
				required: true
			},

			placeholder: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				passwordState: false,
				val: this.password
			}
		},

		computed: {
			displayPlaceHolder() {
				return this.val === ''
			}
		},

		methods: {
			switchPasswordState() {
				this.passwordState = !this.passwordState
			},

			// 更新input
			handleInputChange(val) {
				const result = val.detail.value
				this.$emit('update:password', result)
				this.val = result
			}
		}
	}
</script>

<style lang="scss" scoped>
	.custom-password-input {
		position: relative;
		display: flex;
		border-bottom: 2rpx solid #E2E2E2;
		font-size: 32rpx;
		padding: 12rpx 18rpx 20rpx;

		.placeholder {
			position: absolute;
			color: #888;
			left: 18rpx;
			top: auto !important;
			overflow: hidden;
			text-overflow: clip;
			white-space: pre;
			word-break: keep-all;
			pointer-events: none;
			line-height: inherit;
		}

		input::placeholder {
			color: #888;
			font-family: "Lato-Regular";
		}

		input {
			flex: 1;
			height: 24px;
		}

		image {
			height: 48rpx;
			width: 48rpx;
		}
	}
</style>