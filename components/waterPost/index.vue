<template>
	<view style="padding: 0 0rpx ;" @click.stop="goToPostDetail(item)">
		<image class="backgroud-post-image" mode="scaleToFill" src="/static/images/343x288@3x.png" />

		<!-- <chaceImage v-if="imageCoverList[0].type === 'image'" class="post__image"
			:fileMd5="imageCoverList.length?imageCoverList[0].link:''"
			:src="imageCoverList.length?imageCoverList[0].link:''"> 
			 </chaceImage> -->
		<image v-if="imageCoverList[0].type === 'image'" class="post__image"
			:src="imageCoverList.length?imageCoverList[0].link:''" mode="aspectFill" />

		<view style="position: relative;" v-else>
			<image class="backgroud-post-image" mode="scaleToFill" src="/static/images/343x288@3x.png" />
			<!-- <chaceImage class="post__image" :fileMd5="imageCoverList.length?imageCoverList[0].link:''"
				:src="imageCoverList.length?imageCoverList[0].link:''"></chaceImage> -->
			<image v-if="imageCoverList[0].type === 'video'" mode="aspectFill" class="post__image"
				:src="imageCoverList.length?imageCoverList[0].link:''"></image>


			<image class="backgroud-post-image2" src="../../static/images/videoPlay.png"></image>
		</view>




		<!-- <image  class="img-tip" :src="item.img_urls[0]" mode="widthFix" lazy-load /> -->
		<view class="tit-tip multi-line-omit">{{item.title}}</view>
		<!-- <view class="desc-tip multi-line-omit">{{item.content}}</view> -->

		<view class="user_box">
			<view class="flex-both-center">
				<Avatar :url="item.app_user && item.app_user.avatar"
					:official="!!(item.app_user && item.app_user.official === 1)"
					@click.native.stop="goToUserDetail(item)" />

				<text class="user_box__username">{{ user_name }}</text>
			</view>


			<!-- 	<view v-if="showBlock" class="post__likes" @click.stop="handShowAlertTypePopup(item)">
					<image :src="require(`@images/common/warning-circle@2x.png`)" />
					<text>{{ $t("post_detail_page.block") }}</text>
				</view> -->
			<view class="user_box__likes" @click.stop="handleLikes(item)">
				<image mode="aspectFit" :src="`/static/images/post/likes${item.am_i_like ? '-active' : ''}.png`" />
				<text>{{ simplifyNumbers(item.praise_cnt ) }}</text>
			</view>
		</view>

	</view>

</template>

<script>
	import {
		simplifyNumbers,
		getStorageSync,
	} from '@/utils'
	import Avatar from '@/components/avatar'
	import {
		mapState
	} from 'pinia'
	import {
		useCommonStore
	} from '@/store/common'
	import {
		useCommunityStore
	} from '@/store/community'
	import {
		useUserStore
	} from '@/store/user'
	import TouristModeBlockDialog from '@/components/touristModeBlockDialog'
	import chaceImage from '@/components/image-cache'
	import {
		getImageCache
	} from '@/store/imageCache.js'
	import {
		currentTimeToTimestamp
	} from '../../utils/date'
	export default {
		components: {
			Avatar,
			chaceImage,
			TouristModeBlockDialog,
		},
		props: {
			item: {
				type: Object,
				required: true
			},
			userCenterId: {
				type: String,
				default: ''
			},
			isMinePage: {
				type: Boolean,
				required: false
			},
		},

		computed: {
			...mapState(useUserStore, ['userInfo']),
			postTypeName() {
				const postType = this.item && this.item.post_type
				return postType[this.localeEn]
			},

			user_name() {
				let name = this.item.app_user && this.item.app_user.nick_name
				return name.length > 10 ? name.substring(0, 10) + '...' : name;
			},

			imageCoverList() {
				const arr = []
				let that = this
				if (this.item.img_urls) {
					this.item.img_urls.forEach(el => {
						getImageCache(el, el)


						let storageKey = 'IMAGE_CACHE_INFO_' + el
						// 首先获取本地存储的数据，查询是否有对应文件路径，如果有缓存内容，直接返回
						// console.log(storageKey)
						const cacheFileInfo = getStorageSync(storageKey)

						if (cacheFileInfo) {
							arr.push({
								link: cacheFileInfo,
								type: 'image'
							})
						} else {
							arr.push({
								link: el,
								type: 'image'
							})
						}


					});
				}
				if (this.item.video_urls) {
					this.item.video_urls.forEach(el => {
						try {
							1
							const tempVideoShotsnap =
								`https://gtracing2.s3.us-west-2.amazonaws.com/snapshot-${el.split('amazonaws.com/')[1].split('.')[0]}.png`
							getImageCache(tempVideoShotsnap, tempVideoShotsnap)

							let storageKey = 'IMAGE_CACHE_INFO_' + tempVideoShotsnap
							// 首先获取本地存储的数据，查询是否有对应文件路径，如果有缓存内容，直接返回
							// console.log(storageKey)
							const cacheFileInfo = getStorageSync(storageKey)

							if (cacheFileInfo) {
								arr.push({
									link: cacheFileInfo,
									type: 'video'
								})
							} else {
								arr.push({
									link: tempVideoShotsnap,
									type: 'video'
								})
							}



						} catch (error) {
							arr.push({
								link: '',
								type: 'video'
							})
							console.log(error)
						}



					});
				}
				// console.log(arr)
				that.$forceUpdate()
				return arr
			}
		},



		// filters: {
		// 	simplifyNumbers(number) {
		// 		return simplifyNumbers(number, 1)
		// 	}
		// },

		data() {
			return {
				likePosting: false,
				showDeleteModal: false, // 展示删除提示
				showFullText: false,
				fullStyle: `max-height:88rpx`,
				hasMoreLines: false,
				commonStore: useCommonStore(),
				communityStore: useCommunityStore()

			}
		},


		methods: {
			// ...mapActions('common', ['setRefresh', 'setCurrentPostDetail']),
			// ...mapActions('community', [
			// 	'setNeedReflash'
			// ]),
			simplifyNumbers,



			async goToPostDetail(item) {

				this.commonStore.setCurrentPostDetail(item)

				// this.$navigateTo('/pages/community/postDetail', {
				// 	userCenterId: this.userCenterId,
				// 	id: item.id || Math.random(0, 200)
				// })
				uni.navigateTo({
					url: '/pages/community/postDetail?userCenterId=' + this.userCenterId + '&id=' + (item.id ||
						Math.random(0, 200)),
					animationType: 'fade-in',
					animationDuration: 200
				})
				let that = this
				uni.$on("reouseDeleted", function(tem) {
					if (tem) {
						that.$emit('errorResponse', tem)
					}
					uni.$off()
				})
			},
			pushMethod(params) {
				params.request_id = currentTimeToTimestamp()
				this.$pushMethod(params)
				// uni.request({
				// 	url: `${this.$uni_base_API}/push`,
				// 	data: params,
				// 	success(res) {
				// 		console.log(res)
				// 	},
				// 	fail(err) {
				// 		console.log(err)
				// 	}

				// })
			},
			//前端直接处理点赞的变化
			processLikeFn(item) {
				if (item.am_i_like) {
					this.$emit('handleLikesSuc', item, -1)
				} else {
					this.$emit('handleLikesSuc', item, 1)
				}
			},

			async handleLikes(item) {
				// 游客模式
				if (this.isTourist) return this.$emit('touristBlock')

				if (this.likePosting) return
				const params = {
					post_id: item.id,
					comment_id: 0,
					action: item.am_i_like ? 'unlike' : 'like'
				}
				let that = this
				try {
					this.likePosting = true
					// 请求之前就执行，优化体验
					this.processLikeFn(item)
					const res = await this.$api.community.handleLikes(params)
					setTimeout(() => {
						this.likePosting = false
					}, 1000)
					if (res.code === 0) {
						console.log('suc')
						if (params.action === 'like') {
							const pushParams = {
								user_id: that.item.app_user.user_id,
								content: that.$t('my_message_page.likes'),
							}
							that.pushMethod(pushParams)
						}
					} else {
						// 如果失败要回退
						this.processLikeFn(item)
					}
				} catch (error) {
					this.likePosting = false
					// 如果失败要回退
					this.processLikeFn(item)
					console.warn('getBanner', error);
				}
			},

			// 去用户中心
			goToUserDetail(item) {
				const tempArr = ['pages/my/userInfo', 'pages/my/my']
				const pages = getCurrentPages();
				const page = pages[pages.length - 1];
				if (tempArr.indexOf(page.route) > -1) return
				this.$navigateTo('/pages/my/userInfo', {
					user_id: item.user_id
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.post__image {
		width: 102%;
		border-radius: 12rpx;
		min-height: 465rpx;
		// z-index: 1;
	}

	.backgroud-post-image2 {
		position: absolute;
		border-radius: 12rpx;
		width: 80rpx;
		height: 80rpx;
		left: calc(50% - 40rpx);
		top: calc(50% - 40rpx);
		// z-index: 2;
	}

	.backgroud-post-image {
		position: absolute;
		width: calc(50% - 30rpx);
		height: 465rpx;
		// left: 50%;
		// z-index: 0;
	}

	.user_box {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 10rpx;

		&__likes {
			display: flex;
			align-items: center;

			image {
				width: 48rpx;
				height: 48rpx;
			}

			text {
				color: #333333;
				line-height: 40rpx;
				font-size: 32rpx;
				margin-left: 4rpx;
			}
		}

		&__username {
			margin-left: 20rpx;
			font-size: 28rpx;
			color: #333;
			max-width: 210rpx;
			// background-color: red;
		}
	}

	.img-tip {
		width: 100%;
		border-radius: 12rpx;
	}

	.tit-tip {

		font-size: 30rpx;
		padding: 10rpx 20rpx 0 4rpx;
		font-weight: 900;

		// overflow: hidden;
		// position: relative;
		// line-height: 1.5;
		// max-height: 3em;

	}

	// .tit-tip::after {
	// 	content: '...';
	// 	position: absolute;
	// 	right: 0;
	// 	bottom: 0;

	// }

	.desc-tip {
		text-align: justify;
		font-size: 26rpx;
		padding: 5rpx 20rpx 0;
		margin-top: 10rpx;
	}





	/* 多行省略 */
	.multi-line-omit {
		// 允许单词内自动换行，如果一个单词很长的话
		text-overflow: ellipsis; // 溢出用省略号显示
		overflow: hidden; // 超出的文本隐藏
		display: -webkit-box; // 作为弹性伸缩盒子模型显示
		-webkit-line-clamp: 2; // 显示的行
		-webkit-box-orient: vertical; // 设置伸缩盒子的子元素排列方式--从上到下垂直排列
		padding-right: 10rpx;
		white-space: pre-wrap;

	}

	/* 单行省略 */
	.one-line-omit {
		width: 100%; // 宽度100%：1vw等于视口宽度的1%；1vh等于视口高度的1%
		white-space: nowrap; // 溢出不换行
		overflow: hidden; // 超出的文本隐藏
		text-overflow: ellipsis; // 溢出用省略号显示
	}
</style>