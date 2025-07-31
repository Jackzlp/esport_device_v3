<template>
	<view class="cover">
		<u-popup :show.sync="showMediaPopup" round="20px" mode="bottom" @close="closePopup">
			<view class="upload-panel">
				<text class="upload-panel__title upload-panel__border">{{ popTitle }}</text>
				<text class="upload-panel__border" @click="choseMediaType('image')">
					{{ $t('image') }}
				</text>
				<text @click="choseMediaType('video')">{{ $t('video') }}</text>

				<text class="upload-panel__cancel" @click="closePopup">
					{{ $t('cancel') }}
				</text>
			</view>
		</u-popup>
		<u-popup :show.sync="showSourceTypePop" round="20px" mode="bottom" @close="closePopup2">
			<view class="upload-panel">
				<text class="upload-panel__title upload-panel__border">{{ popTitle }}</text>
				<text class="upload-panel__border" @click="updaloadImg('album')">
					{{ $t('album') }}
				</text>
				<text @click="updaloadImg('camera')">{{ $t('photograph') }}</text>

				<text class="upload-panel__cancel" @click="closePopup2">
					{{ $t('cancel') }}
				</text>
			</view>
		</u-popup>
	</view>
</template>

<script>
	export default {
		props: {
			showUploadPopup: {
				type: Boolean,
				default: false
			},
			popTitle: {
				type: String,
				default: ''
			},
			justChoose: {
				type: Boolean,
				default: false
			},
			showChooseMedia: {
				type: Boolean,
				default: false
			},
			count: {
				type: Number,
				default: 0
			}
		},
		data() {
			return {
				showSourceTypePop: false,
				showMediaPopup: false,
				mediaType: 'image'
			}
		},
		watch: {
			showUploadPopup(newVal) {
				if (this.showChooseMedia) {
					this.showMediaPopup = newVal
				} else {
					this.showSourceTypePop = newVal
				}
			}
		},
		methods: {
			closePopup() {
				this.$emit('update:showUploadPopup', false)
			},
			closePopup2() {
				if (this.showChooseMedia) {
					this.showSourceTypePop = false
				} else {
					this.closePopup()
				}
			},
			choseMediaType(type) {
				this.mediaType = type
				this.showSourceTypePop = true
				this.closePopup()
			},
			updaloadImg(sourceType) {
				setTimeout(() => {
						this.closePopup2()
					},
					600)
				const fn = this.justChoose ? '$justChooseFile' : '$handleChooseFile'
				const emitFn = this.justChoose ? 'chooseSucBack' : 'postSucBack'
				this[fn]({
					mediaType: this.mediaType,
					limitCount: this.count,
					sourceType: [sourceType],
					successCallBack: objStr => {
						this.$emit(emitFn, objStr, this.mediaType)
					},
					failCallBack: objStr => {
						uni.showModal({
							content: this.$t(objStr),
						})

					}


				})
			}
		}
	}
</script>