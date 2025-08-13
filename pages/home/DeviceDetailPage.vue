<template>
	<view class="contant_box_bg">
		<image mode="aspectFill" class="bagImage" src="@/static/images/phase2/detail_bg.png"></image>

		<view class="nagavit_box" :style="{ paddingTop: `${systemBarHeight * 2 }rpx` }">
			<image class="mback-icon" :src="'@images/common/left-arrow.png'" @click="$back"></image>
			<view class="back_title">{{$t('bluetoothHintRelate.discovery')}}</view>
		</view>
		<view class="contant_box">
			<view class="top_box">
				<view class="title">{{currentItem && currentItem.name}}</view>
				<view class="image_bg" @click="previewImageMethod(currentItem.img)">
					<!-- <image mode="aspectFit" :src="currentItem.img"></image> -->
					<chaceImage class="image_box" mode="aspectFit" :fileMd5="currentItem.img" :url='currentItem.img'>
					</chaceImage>
				</view>
				<view class="content_box">
					{{currentItem.des}}
				</view>
			</view>
		</view>
	</view>

</template>

<script>
	import chaceImage from '@/components/image-cache'
	import PageLayout from '@/components/page-layout'
	import {
		mapState
	} from 'pinia'
	import {
		useCommonStore
	} from '@/store/common.js'
	export default {
		data() {
			return {
				currentItem: ''
			}
		},
		computed: {
			...mapState(useCommonStore, ['systemBarHeight']),
		},
		components: {
			PageLayout,
			chaceImage
		},
		onLoad(option) {
			this.currentItem = option.item ? JSON.parse(option.item) : ''
		},
		methods: {
			previewImageMethod(src) {
				if (!src) return
				uni.previewImage({
					urls: [src]
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.contant_box_bg {
		position: relative;

		.bagImage {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			z-index: 1;
		}

		.nagavit_box {
			display: flex;
			justify-content: flex-start;
			align-content: center;
			padding: 0 30rpx;
			z-index: 20;


			.mback-icon {
				width: 60rpx;
				height: 60rpx;
				z-index: 21;
			}

			.back_title {
				width: calc(100% - 60rpx);
				font-size: 48rpx;
				font-weight: bold;
				color: #000000;
				line-height: 66rpx;
				display: flex;
				justify-content: center;
				align-items: center;
			}
		}

		.contant_box {
			position: relative;
			width: 100%;
			// height: 100vh;
			background-color: white;



			.top_box {
				padding: 60rpx;
				z-index: 10;

				.title {
					font-size: 60rpx;
					font-weight: bold;
					color: black;
				}

				.image_bg {
					// width: calc(100% - 120rpx);

					aspect-ratio: 1/1;
					border-radius: 40rpx;
					// padding: 40rpx;
					background-color: #f7f7f7;
					display: flex;
					justify-content: center;
					align-items: center;

					.image_box {
						width: 100%;
					}

				}

				.content_box {
					padding: 30rpx 0 0 0;
					font-size: 30rpx;

				}
			}
		}
	}
</style>