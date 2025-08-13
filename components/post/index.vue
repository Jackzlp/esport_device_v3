<template>
	<view :class="['post', item.isMine ? 'my-post' : '']" @click.stop="goToPostDetail(item)">
		<!-- 头部 -->
		<view class="post-header">
			<view class="flex-both-center">
				<Avatar :url="item.app_user && item.app_user.avatar"
					:official="!!(item.app_user && item.app_user.official === 1)"
					@click.native.stop="goToUserDetail(item)" />

				<text class="post__username ellipsis">{{ item.app_user && item.app_user.nick_name }}</text>
			</view>

			<view class="post__likes" @click.stop="handleLikes(item)">
				<image mode="aspectFit" :src="`/static/images/post/likes${item.am_i_like ? '-active' : ''}.png`" />
				<text>{{ simplifyNumbers(item.praise_cnt) }}</text>
			</view>
		</view>

		<!-- 内容 -->
		<view class="post-title">
			{{ item.title }}
		</view>
		<view id="contentBox" :class=" showFullText? 'post-fullContet':'post-content'">
			{{ 0 > item.content ? 0 : item.content }}
		</view>
		<text v-if="hasMoreLines && !showFullText " class="post-openOrClose"
			@click.stop="showFullTextMethod">{{ $t('seeMore')}}</text>
		<!-- 图片，视频等 -->
		<view class="post-material">
			<view v-show="item.top_at && item.isMine && isMinePage" class="top-tip">
				{{ $t('TOP') }}
			</view>
			<!-- image -->
			<view v-if="imageCoverList.length > 0"
				:class="[ 'post__images', imageCoverList.length === 1 ? 'one' : '', imageCoverList.length === 4 ? 'four' : ''  ]">
				<template v-for="(cover,index) in imageCoverList" :key="index">
					<!-- 需要知道当前图片的宽高比，才能 heightFix 和 widthFix -->
					<view v-if="imageCoverList.length === 1" class="cover-content"
						:class="{'video-img-style': cover.type === 'video'}">
						<image class="backgroud-post-image" mode="aspectFill" src="/static/images/343x288@3x.png" />
						<chaceImage class="post__image" mode="aspectFill" :fileMd5="cover.link" :url='cover.link'>
						</chaceImage>
						<!--  <image class="post__image" mode="aspectFill":src="cover.link" /> -->
						<image v-show="cover.type === 'video'" class="video-play-icon"
							src="/static/images/videoPlay.png" />
					</view>
					<view v-else class="cover-content">
						<view class="post__image">
							<image v-show="cover.type === 'video'" class="backgroud-post-image2"
								src="/static/images/105x105@3x.png" />
							<chaceImage class="post__image" mode="aspectFill" :fileMd5="cover.link" :url='cover.link'>
							</chaceImage>
							<!-- <image mode="aspectFill" class="cover-link" :src="cover.link" /> -->
						</view>
						<image v-show="cover.type === 'video'" class="video-play-icon"
							src="/static/images/videoPlay.png" />
					</view>
				</template>
			</view>
			<!-- video -->
		</view>

		<!-- classifications -->
		<view class="post-classifications">
			<view class="post__classification">
				<image src="/static/images/post/classification.png" />
				{{ postTypeName }}
			</view>

			<view v-if="item.isMine && isMinePage" class="post__actions">
				<image :class="{'untop-action-style': item.top_at}" src="/static/images/set-top.png"
					@click.stop="handleTop" />
				<image :src="`/static/images/login/password-${item.hidden === 0 ? 'available' : 'unavailable'}.png`"
					@click.stop="handleVisible" />
				<image src="/static/images/search-delete.png" @click.stop="handlePreDelete" />
			</view>
		</view>

		<u-modal :show="showDeleteModal" cancel-color="#838181" confirm-color="#E21D1C" :show-cancel-button="true"
			:confirm-text="$t('post.delete_confirm')" :cancel-text="$t('cancel')" :close-on-click-overlay="true"
			width="468rpx" @close="showDeleteModal = false" @cancel="showDeleteModal = false" @confirm="handleDelete">
			<view style="font-size: 32rpx; line-height: 44rpx; color: #333;">
				{{ $t('post.delete_hint') }}
			</view>
		</u-modal>
	</view>
</template>

<script>
	import {
		simplifyNumbers
	} from '@/utils'
	import Avatar from '@/components/avatar'
	import {
		mapState
	} from 'pinia'
	import {
		useUserStore
	} from '@/store/user'
	import {
		useCommonStore
	} from '@/store/common'
	import {
		useCommunityStore
	} from '@/store/community'
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
		mounted() {
			this.getInnerWidth()
		},
		computed: {
			...mapState(useUserStore, ['userInfo']),
			postTypeName() {
				const postType = this.item && this.item.post_type
				return postType[this.localeEn]
			},
			imageCoverList() {
				const arr = []
				if (this.item.img_urls) {
					this.item.img_urls.forEach(el => {
						getImageCache(el, el)
						arr.push({
							link: el,
							type: 'image'
						})
					});
				}
				if (this.item.video_urls) {
					this.item.video_urls.forEach(el => {
						try {
							1
							const tempVideoShotsnap =
								`https://gtracing2.s3.us-west-2.amazonaws.com/snapshot-${el.split('amazonaws.com/')[1].split('.')[0]}.png`
							getImageCache(tempVideoShotsnap, tempVideoShotsnap)
							arr.push({
								link: tempVideoShotsnap,
								type: 'video'
							})
						} catch (error) {
							arr.push({
								link: '',
								type: 'video'
							})
							console.log(error)
						}

					});
				}
				return arr
			}
		},

		// filters: {
		// 	simplifyNumbers(number) {
		// 		return simplifyNumbers(number, 1)
		// 	}
		// },

		methods: {
			// ...mapActions('common', ['setRefresh', 'setCurrentPostDetail']),
			// ...mapActions('community', [
			// 	'setNeedReflash'
			// ]),

			simplifyNumbers,

			getInnerWidth() {
				const query = uni.createSelectorQuery().in(this);
				query.select('#contentBox').boundingClientRect(data => {
					if (data) {
						const textHeight = data.height
						const textLines = Math.floor(textHeight / 22)
						this.hasMoreLines = textHeight > 44;

					} else {
						this.getInnerWidth()
					}

				}).exec();
			},


			showFullTextMethod() {
				this.showFullText = !this.showFullText
				if (this.showFullText) {
					this.fullStyle = `max-height:auto`
				} else {
					this.fullStyle = `max-height:88rpx`
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
					// console.log(this.likePosting)
					// console.log("AAAAA")
					// setTimeout(() => {
					// 	this.likePosting = false
					// }, 1000)
					// console.log(this.likePosting)
					// console.log("BBBB")
					if (res.code === 0) {
						console.log('suc')

						if (params.action === 'like') {
							const pushParams = {
								user_id: that.item.app_user.user_id,
								content: that.$t('my_message_page.likes'),

							}
							that.pushMethod(pushParams)
						}
						this.likePosting = false
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
			pushMethod(params) {
				params.request_id = currentTimeToTimestamp()
				this.$pushMethod(params)

			},
			//前端直接处理点赞的变化
			processLikeFn(item) {
				if (item.am_i_like) {
					this.$emit('handleLikesSuc', item, -1)
				} else {
					this.$emit('handleLikesSuc', item, 1)
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

			// 去post详情
			async goToPostDetail(item) {

				this.commonStore.setCurrentPostDetail(item)

				// this.$navigateTo('/pages/community/postDetail', {
				// 	userCenterId: this.userCenterId,
				// 	id: item.id || Math.random(0, 200)
				// })
				uni.navigateTo({
					url: '/pages/community/postDetail?userCenterId=' + this.userCenterId + '&id=' + (item.id ||
						Math.random(0, 200)),
					animationType: 'zoom-fade-out',
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
			previewImage(index) {
				if (this.imageCoverList[index].type === 'image') {
					this.commonStore.setRefresh(false)
					uni.previewImage({
						current: this.imageCoverList[index].link, //  传 Number H5端出现不兼容
						urls: this.item.img_urls
					});
				} else {
					const tempIndex = index - this.item.img_urls.length
					this.$emit('handlePlayVideo', this.item.video_urls[tempIndex])
				}
			},
			// 可见
			async handleVisible() {
				const tempHidden = this.item.hidden === 1 ? 0 : 1
				const params = {
					hidden: tempHidden
				}
				try {
					const res = await this.$api.community.hiddenPost(this.item.id, params)
					if (res.code === 0) {
						this.item.hidden = tempHidden
						const content = this.$t('post_edit_page.success_post')
						const type = 'success'
						this.$toast({
							content,
							type
						})
						this.$emit('handleVisible', this.item)
					} else {
						const content = this.$t('post_edit_page.fail_post')
						const type = 'error'
						this.$toast({
							content,
							type
						})
					}
				} catch (error) {
					console.warn('handleVisible', error);
				}
			},
			handlePreDelete() {
				this.showDeleteModal = true
			},
			// 删除
			async handleDelete() {
				this.$loading()
				try {
					const res = await this.$api.community.deletPost(this.item.id)
					this.$hideLoading()
					if (res.code === 0) {
						const content = this.$t('successOption')
						const type = 'success'
						this.$toast({
							content,
							type
						})
						this.$emit('deletPostSuc', this.item.id)
					} else {
						const content = this.$t('Failed')
						const type = 'error'
						this.$toast({
							content,
							type
						})
					}
					this.showDeleteModal = false
				} catch (error) {
					this.$hideLoading()
					this.showDeleteModal = false
					console.warn('handleDelete', error);
				}
			},
			// 置顶
			async handleTop() {
				const tempTopStatus = this.item.top_at ? 'untop' : 'top'
				const params = {
					action: tempTopStatus
				}
				try {
					this.$loading()
					const res = await this.$api.community.topOptionPost(this.item.id, params)
					this.$hideLoading()
					if (res.code === 0) {
						this.$emit('handleTopOption', this.item.id, tempTopStatus)
						const content = this.$t('post_edit_page.success_post')
						const type = 'success'
						this.$toast({
							content,
							type
						})
					} else {
						const content = this.$t('post_edit_page.fail_post')
						const type = 'error'
						this.$toast({
							content,
							type
						})
					}
				} catch (error) {
					this.$hideLoading()
					console.warn('handleTop', error);
				}
			},

			// 确定删除
			confirmDelete() {

			}
		}
	}
</script>

<style lang="scss">
	.post {
		padding: 20rpx 0;
		border-bottom: 2rpx solid #E5E5E5;

		&-header {
			display: flex;
			justify-content: space-between;
		}

		&-title {
			line-height: 44rpx;
			color: #333;
			font-size: 36rpx;
			margin: 20rpx 0 0;
			margin-top: 28rpx;
			font-weight: bold;
			white-space: normal;
			word-break: break-all;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		&-openOrClose {
			color: #6D97FF;
			font-size: 28rpx;
			height: 30rpx;
			text-align: right;
			// background-color: red;
		}

		&-fullContet {
			line-height: 22px;
			color: #333;
			font-size: 32rpx;
			margin: 20rpx 0 0;

			white-space: normal;
			word-break: break-all;
			max-height: none;
		}

		&-content {
			line-height: 22px;
			color: #333;
			font-size: 32rpx;
			margin: 20rpx 0 0;

			white-space: normal;
			word-break: break-all;
			overflow: hidden;
			text-overflow: ellipsis;
			max-height: 44.5px;
			// white-space: nowrap;
		}

		&-material {
			margin: 20rpx 0 0;
		}

		&-classifications {
			display: flex;
			justify-content: space-between;
		}

		// 单个元素
		&__avatar {
			border-radius: 32rpx;
			width: 64rpx;
			height: 64rpx;
		}

		&__official {
			margin-left: 10rpx;
			width: 75rpx;
			height: 24rpx;
			border-radius: 4rpx;
		}

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
			max-width: 70vw;
		}

		&__classification {
			padding: 10rpx 20rpx;
			margin-top: 20rpx;
			background: #EEEEEE;
			border-radius: 28rpx;
			color: #838181;
			font-size: 24rpx;
			margin-right: 20rpx;
			display: flex;
			align-items: center;

			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;

			image {
				width: 24rpx;
				height: 24rpx;
				margin-right: 10rpx;
			}
		}

		&__images {
			display: flex;
			flex-wrap: wrap;

			.post__image,
			.cover-content {
				border-radius: 20rpx;
				width: calc(100vw / 3 - 40rpx);
				height: calc(100vw / 3 - 40rpx);
				object-fit: contain;

				&:not(:nth-child(3n + 1)) {
					margin-left: 20rpx;
				}

				&:nth-child(n + 4) {
					margin-top: 20rpx;
				}

				.cover-link {
					width: calc(100vw / 3 - 40rpx);
					height: calc(100vw / 3 - 40rpx);
					object-fit: contain;
					border-radius: 20rpx;
				}

				.backgroud-post-image2 {
					position: absolute;
					width: calc(100vw / 3 - 40rpx);
					height: calc(100vw / 3 - 40rpx);
				}
			}

			.cover-content {
				position: relative;

				.video-play-icon {
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translateX(-40rpx) translateY(-40rpx);
					width: 80rpx;
					height: 80rpx;
				}
			}

			.video-img-style {
				display: flex;
				align-items: center;
				justify-content: flex-start;
				width: 100%;
			}

			&.one {

				.cover-content,
				.post__image {
					max-width: 100%;
					max-height: 576rpx;
					width: 100%;
					height: 576rpx;
					margin-left: 0;
				}

				.backgroud-post-image {
					position: absolute;
					max-width: 100%;
					max-height: 576rpx;
					width: 100%;
					height: 576rpx;
				}
			}

			&.four {
				margin-right: 40rpx;

				.cover-content {

					&:not(:nth-child(3n + 1)) {
						margin-left: 0rpx;
					}

					&:nth-child(n + 4) {
						margin-top: 0rpx;
					}

					&:not(:nth-child(2n + 1)) {
						margin-left: 20rpx;
					}

					&:nth-child(n + 3) {
						margin-top: 20rpx;
					}


				}
			}
		}

		&__actions {
			display: flex;
			margin-left: 24rpx;
			align-items: center;
			justify-content: space-between;

			image {
				width: 48rpx;
				height: 48rpx;
				margin-right: 40rpx;

				&:last-child {
					margin-right: 0;
				}
			}
		}

		.post-material {
			position: relative;

			.top-tip {
				z-index: 1;
				top: 10rpx;
				left: 10rpx;
				position: absolute;
				width: 60rpx;
				height: 36rpx;
				line-height: 36rpx;
				text-align: center;
				background: linear-gradient(360deg, #4D4D4D 0%, #303030 100%);
				border-radius: 4rpx;
				color: #fff;
				font-size: 16rpx;
			}
		}

		// 我的帖子
		&.my-post {

			.post-classifications {
				margin: 20rpx 0 0;
			}

			.post__classification {
				margin-top: 0rpx;
				max-width: 436rpx;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;

				image {
					min-width: 24rpx;
				}
			}

		}

		.untop-action-style {
			transform: rotateX(180deg);
		}
	}
</style>