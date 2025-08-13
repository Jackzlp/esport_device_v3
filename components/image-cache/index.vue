<template>

	<image :src="src" :fileMd5="fileMd5" :mode="mode"></image>

</template>
<script>
	import {
		getImageCache
	} from '@/store/imageCache.js';
	export default {
		name: 'chaceImage',
		props: {
			url: {
				type: String,
				default () {
					return '';
				}
			},
			fileMd5: {
				type: String,
				default () {
					return '';
				}
			},
			mode: {
				type: String,
				default () {
					return 'aspectFill';
				}
			}
		},

		data() {
			return {
				src: ''
			};
		},
		watch: {
			fileMd5(val) {
				this.getImageCache1();
			}
		},
		created() {

			this.getImageCache1()
		},
		mounted() {
			// console.log(this.fileMd5)
			// if (this.url) {
			// 	uni.getImageInfo({
			// 		src: this.url ? this.url : this.fileMd5,
			// 		success: () => {
			// 			// console.log('Image loaded successfully');
			// 		},
			// 		fail: () => {
			// 			// console.log('Image failed to load');
			// 		}
			// 	})
			// }

		},
		methods: {
			// 查找获取图片缓存
			async getImageCache1() {
				// console.log(this.fileMd5)
				// #ifdef APP-PLUS
				var result = await getImageCache(this.url, this.fileMd5);
				if (result) {
					this.src = result;
				} else {
					this.src = this.url;
				}
				// #endif
				// #ifndef APP-PLUS
				this.src = this.url;
				// #endif
				this.$forceUpdate()
			},

		}
	};
	//在接口返回图片地址处调用，会优先使用缓存的图片，图片没有缓存就会被缓存   第二个参数表示图片的唯一标识
	// getImageCache(data.url,data.url) 
</script>
<style>
	image {
		position: relative;
	}
</style>