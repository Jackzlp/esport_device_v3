<template>
	<view class="avatar" :style="`width: ${size * 2}rpx; height: ${size * 2}rpx; ${extraStyle}`">
		<image v-if="!isTourist && showDefalut==false" class="avatar__image" @error="imageError" :src="avatarUrl"
			mode="aspectFill" :style="`border-radius: ${size / 4}rpx`"></image>
		<image v-if="!isTourist && showDefalut" class="avatar__image" src="../../static/images/defaultIcon.jpg"
			mode="aspectFill" :style="`border-radius: ${size / 4}rpx`"></image>

		<image v-if="isTourist && showDefalut==false" class="avatar__image" @error="imageError" :src="avatarUrl"
			mode="aspectFill" :style="`border-radius: ${size / 4}rpx`"></image>

		<image v-if="isTourist && showDefalut" class="avatar__image" src="../../static/images/defaultIcon.jpg"
			mode="aspectFill" :style="`border-radius: ${size / 4}rpx`"></image>


		<image v-if="official" class="avatar__official"
			:style="`width: ${14 * scale * 2}rpx; height: ${14 * scale * 2}rpx`" src="/static/images/official.png" />
		<!-- <view v-show="showMessageDot" class="message-dot" /> -->
	</view>
</template>



<script>
	import chaceImage from '@/components/image-cache'
	import {
		getImageCache
	} from '@/store/imageCache.js'
	import {
		getStorageSync
	} from '@/utils';
	import {
		mapState,

	} from 'pinia';
	export default {
		name: 'Avatar',
		props: {
			extraStyle: {
				type: String,
				default: ''
			},
			url: {
				type: String,
				default: '/static/images/defaultIcon.jpg'
			},

			// 是否为官方
			official: {
				type: Boolean,
				default: false
			},
			showMessageDot: {
				type: Boolean,
				default: false
			},

			size: {
				type: [String, Number],
				default: 32
			}
		},
		data() {
			return {
				showDefalut: false
			}
		},
		components: {
			chaceImage
		},

		computed: {
			// 缩放比例
			scale() {
				return this.size / 32 * 0.8
			},

			avatarUrl() {
				if (!this.url) return '/static/images/defaultIcon.jpg'
				// console.log(this.url)
				let storageKey = 'IMAGE_CACHE_INFO_' + this.url
				// 首先获取本地存储的数据，查询是否有对应文件路径，如果有缓存内容，直接返回
				const cacheFileInfo = getStorageSync(storageKey)

				// console.log(cacheFileInfo)
				if (cacheFileInfo) {
					return cacheFileInfo
				} else {
					getImageCache(this.url, this.url)
					return this.url

				}

				// return this.url || require('@images/default-avatar.png')
			},

		},
		methods: {
			imageError() {
				this.showDefalut = true
				this.avatarUrl = '../../static/images/defaultIcon.jpg'

			},
		}

	}
</script>


<style lang="scss" scoped>
	.avatar {
		position: relative;


		&__image {
			width: 100%;
			height: 100%;
			border: #ededed solid 2rpx;
		}

		&__official {
			position: absolute;
			width: 32rpx;
			height: 32rpx;
			right: 0;
			bottom: 0;
		}

		.message-dot {
			width: 20rpx;
			height: 20rpx;
			border-radius: 50%;
			background: #16C43A;
			border: 1px solid #fff;
			position: absolute;
			top: 0;
			right: 0;
		}
	}
</style>