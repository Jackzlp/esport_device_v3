<template>
	<view v-show="showVideo" class="video-cover">
		<video v-if="showVideo" @timeupdate="timeUpdateMethod" id="video_play" :show-progress="true"
			:show-fullscreen-btn="true" @fullscreenchange="handleFullscreenChange" controls :src="currentVideoSrc"
			:style="videoStyle" />
		<image class="control-button" src="/static/images/post/deletImg.png" @click.stop="closeVideo" />
	</view>
</template>

<script>
	export default {
		props: {
			showVideo: {
				type: Boolean,
				default: false
			},
			currentVideoSrc: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				videoContext: null,
				isFullScreen: false,
			}
		},
		computed: {
			videoStyle() {
				const systemInfo = uni.getSystemInfoSync()
				let parms = {
					width: '100vw',
					height: this.isFullScreen ? `100vw` : `${systemInfo.windowHeight * 0.8}px`
				}
				return parms
			}
		},
		watch: {

			showVideo(newVal) {
				// console.log("1234")
				if (newVal) {
					this.$forceUpdate()
					this.showViedeoTem = newVal
					this.$nextTick(() => {
						this.videoContext.play()
					})
				}
			}
		},
		unmounted() {
			// #ifdef APP-PLUS
			plus.screen.lockOrientation('portrait-primary')
			// #endif
		},
		mounted() {
			this.videoContext = uni.createVideoContext('video_play');
			// #ifdef APP-PLUS
			plus.screen.lockOrientation('portrait-primary')
			// #endif
		},

		methods: {

			handleFullscreenChange(e) {
				let that = this
				this.isFullScreen = e.detail.fullScreen
				if (!this.isFullScreen) {
					// console.log("竖屏")
					// #ifdef APP-PLUS
					plus.screen.lockOrientation('portrait-primary')
					// #endif
				} else {
					// console.log("横屏")
					// #ifdef APP-PLUS
					plus.screen.lockOrientation('landscape-primary')
					// #endif
				}
				this.$nextTick(() => {
					that.$forceUpdate()
				})
			},

			closeVideo() {
				this.videoContext.seek(0)
				plus.screen.lockOrientation('portrait-primary')
				this.$nextTick(() => {
					this.videoContext.stop()
					this.$emit('closeVideo')
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.video-cover {
		position: fixed;
		top: 0;
		// bottom: 0;
		left: 0;
		// right: 0;
		width: 100vw;
		height: 100vh;
		padding-top: 10vh;
		background: #000;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;

		video {
			z-index: 1001;
			transition: all 0.3s;
		}

		.control-button {
			position: absolute;
			z-index: 100;
			height: 60rpx !important;
			width: 60rpx !important;
			border-radius: 50% !important;
			top: var(--status-bar-height);
			margin-top: 8rpx;
			right: 20rpx;
			z-index: 1002;
		}
	}
</style>