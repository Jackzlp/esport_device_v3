<template>
	<PageLayout type="custom">
		<page-meta :page-style="'overflow:' + (showUploadPopup ? 'hidden' : 'visible')" />
		<view class="community-page" :style="{ paddingTop: `${systemBarHeight * 2}rpx` }">
			<!-- 顶部 -->
			<view class="community-page__header">
				<!-- name -->
				<Avatar :size="44" :show-message-dot="hasUnreadMessage" :url="(userInfo && userInfo.avatar) || ''"
					:official="userInfo && !!userInfo.official" @click.native.stop="goToUserDetail" />
				<view class="user__name ellipsis">
					<!-- 如果是游客模式展示这个 -->
					<text v-if="isTourist">
						{{ $t('guest') }}
					</text>
					<template v-else>
						<text>
							{{ userInfo && userInfo.nick_name }}
						</text>
						<image src="/static/images/shake.png" />
					</template>
					<!-- <image class="contryImage" mode="aspectFit"
						:src="communityDisplayInfo && communityDisplayInfo.icon"></image> -->
				</view>
				<view class="user__post-trigger" @click="handleCreatePost">
					<image src="/static/images/post.png" />
				</view>
				<view style="position: relative;">
					<view v-if="hasUnreadMessage"
						style="position: absolute;right: 5rpx;top: 10rpx;width: 20rpx;height: 20rpx;border-radius: 10rpx;background-color: #16C43A;">
					</view>
					<uni-icons style="margin-left: 10px;" size="70rpx" @click="chatIconMethod" type="chat"></uni-icons>
				</view>
			</view>
			<!-- 社区名称 -->
			<!-- <view class="community-page__name">
				
				<view class="community-page__name-icon">
					<chaceImage :fileMd5="communityDisplayInfo && communityDisplayInfo.icon"
						:url='communityDisplayInfo && communityDisplayInfo.icon'>
					</chaceImage>
					
				</view>
				<text class="ellipsis">{{ communityDisplayInfo && communityDisplayInfo[localeEn] }}</text>
			</view> -->

			<view class="community-page__search-cover" style="padding-left: 32rpx; padding-right: 32rpx"
				@click="$navigateTo('/pages/search/index')">
				<view class="community-page__search">
					<image src="/static/images/search.png" />
					<text>{{ $t('community_page.search_placeholder') }}</text>
				</view>
			</view>
			<!-- banner -->
			<swiper v-if="banners.length > 0" :style="{ opacity: bannerOpacity }" class="community-page__banner"
				:indicator-dots="true" :autoplay="true" :interval="5000" :duration="500">
				<swiper-item v-for="(item, index) in banners" :key="index" @tap="gotoBanner(item)">
					<chaceImage :fileMd5="item.img_url" :url='item.img_url'></chaceImage>
					<!-- <image :src="item.img_url" /> -->
				</swiper-item>
			</swiper>

			<view class="community-page__tabs">
				<view v-for="(tab,index) in tabs" :key="tab.key + index" :class="[
                            'community-page__tab',
                            activeTab && tab.key === activeTab.key ? 'active' : '',
                            tab.key === 'hot' ? 'hot' : '',
                            tab.key === 'all' ? 'all-tab' : ''
                        ]" @click="switchTab(tab)">
					{{ tab.title }}
				</view>
				<image @click="changeFlow"
					style="width: 50rpx;height: 50rpx;position: absolute;top: 40rpx;right: 30rpx;"
					:src="isFlow?'../../static/images/flow.png':'../../static/images/card.png'"></image>
			</view>

			<u-skeleton v-if="page===1" style="margin-left: 30rpx;padding-top: 50rpx;" rows="3" :loading="page===1"
				avatarShape="square" avatar :title="false">

			</u-skeleton>

			<!-- 列表 -->
			<view class="community-page__list" v-if="!showorHidden">
				<template v-if="posts.length === 0 && isLoaded">
					<view class="community-page__no-post">
						<image src="/static/images/order/no-order.png" />
						<text>{{ $t('community_page.no_community') }}</text>
					</view>
				</template>

				<!-- postlist -->
				<template v-else>
					<!-- <view  > -->
					<view v-if="!isFlow" class="search-page__list">
						<view class="search-page__list__item" v-for="(Tpost) in posts" :key="Tpost.id">
							<Post style="width: 100%;" slot="body" :item="Tpost" @touristBlock="touristBlock"
								@handlePlayVideo="handlePlayVideo" @handleLikesSuc="handleLikesSuc"
								@errorResponse="reflashDeleItems" />
						</view>
					</view>
					<!-- 		<uni-list v-if="!isFlow" class="search-page__list" :border="false">
						<uni-list-item class="search-page__list__item" :border="false" v-for="(Tpost) in posts"
							:key="Tpost.id">
							<Post style="width: 100%;" slot="body" :item="Tpost" @touristBlock="touristBlock"
								@handlePlayVideo="handlePlayVideo" @handleLikesSuc="handleLikesSuc"
								@errorResponse="reflashDeleItems" />
						</uni-list-item>
					</uni-list> -->

					<view v-else class="container">
						<view class="cont-box"
							:style="{ '--layout-width': 100 / flowData.column - flowData.columnSpace + '%' }"
							v-for="(numVal, index) in flowData.column" :key="numVal">
							<view class="item-box" v-for="(item, j) in flowData[`column_${index + 1}`]" :key="j">
								<waterPost :item="item" @touristBlock="touristBlock" @handlePlayVideo="handlePlayVideo"
									@handleLikesSuc="handleLikesSuc" @errorResponse="reflashDeleItems"></waterPost>
							</view>
						</view>
					</view>

					<view class="load-more-container">
						<u-loadmore :status="status" :loading-text="$t('loading')" :loadmore-text="$t('loadMore')"
							:nomore-text="$t('noMore')" />
					</view>
				</template>
			</view>
		</view>

		<upload-media :show-upload-popup.sync="showUploadPopup" :count="9" :pop-title="$t('umf')" :just-choose="true"
			:show-choose-media="true" @chooseSucBack="chooseSucBack" />
		<video-play :show-video.sync="showVideo" :current-video-src="currentVideoSrc" @closeVideo="closeVideo" />

		<TouristModeBlockDialog v-if="showTouristModeBlockDialog" @close="showTouristModeBlockDialog = false" />

		<!-- <birthDayPopup :visible="isModalVisible" :popType="reminderType?reminderType.type:''" :name="userInfo.nick_name?userInfo.nick_name:''" @close="handleClose" @skiplinkMethod="handleSkiplink"></birthDayPopup> -->
		<!-- <Tabbar :current="1" @doubleClick="doubleClick" @touristBlock="touristBlock" /> -->

		<u-popup :show.sync="showServiceupdata" mode="center" round="20px" :mask-click="false">
			<view class="popup-content">
				<view class="popup-title">{{$t('servertitle')}}</view>
				<view class="popup-message">{{$t('servicecontent')}}</view>
			</view>
		</u-popup>
	</PageLayout>

	<!-- <communityguide v-if="showGuide" @skipCommiunt="handleskipCommiunt" @touchmove.stop.prevent class="full-page-cover"> -->
	<!-- </communityguide> -->

</template>

<script>
	//firstLanchCommunity

	import {
		mapState,

	} from 'pinia';
	import {
		useUserStore
	} from '@/store/user';
	import {
		useCommunityStore
	} from '@/store/community';
	import {
		useCommonStore
	} from '@/store/common';

	import uploadMedia from '@/components/uploadMedia';
	import videoPlay from '@/components/videoPlay';
	import Post from '@/components/post';
	import PageLayout from '@/components/page-layout';
	// import Tabbar from '@/components/Tabbar';
	import Avatar from '@/components/avatar';
	import TouristModeBlockDialog from '@/components/touristModeBlockDialog';
	// import {
	// 	th
	// } from '@dcloudio/vue-cli-plugin-uni/packages/postcss/tags';
	import {
		getImageCache,
		saveImageCache
	} from '@/store/imageCache.js'
	import chaceImage from '@/components/image-cache'
	import {
		getStorageSync,
		setStorageSync
	} from '../../utils';
	import {
		debounce
	} from '@/utils'
	import waterPost from '@/components/waterPost'
	// import birthDayPopup from '@/components/BirthDayPopup'
	// import BirthdayReminder from '@/utils/BirthdayPopup.js'
	// import communityguide from '../guidepage/communityguide/index.vue'
	export default {
		components: {
			Post,
			PageLayout,
			videoPlay,
			uploadMedia,
			// Tabbar,
			Avatar,
			TouristModeBlockDialog,
			chaceImage,
			waterPost,
			// birthDayPopup,
			// communityguide
		},
		onPullDownRefresh() {
			setTimeout(() => {
				this.switchTab(this.activeTab || this.tabs[0]);
			}, 200);
		},

		data() {
			return {
				bannerOpacity: 1,
				showVideo: false,
				currentVideoSrc: '',
				showUploadPopup: false,
				postTypeId: '', //当前帖子分类id
				postType: 'all', //all 标识全部分类，isHot热门， other 标识其他分类
				page: 1,
				pageSize: 10,
				posts: [], // 当前列表
				isLoaded: false,
				status: 'loadmore',
				activeTab: null,
				banners: [],
				tabsOriginData: [],
				detaileItem: '',
				// 当前的tabs
				tabs: [{
						title: this.$t('all'),
						key: 'all'
					},
					{
						title: `🔥${this.$t('hot')}`,
						key: 'hot'
					}
				],

				showTouristModeBlockDialog: false, // 游客模式拦截弹窗
				currentHot: false,
				flowData: {
					list: [], // 数据值
					column: 2, // 瀑布列数
					columnSpace: 2 // 瀑布列宽间距
				},
				isFlow: false,
				isModalVisible: false,
				birthdayReminder: null,
				reminderType: '',
				showGuide: false,
				showServiceupdata: false,
				showorHidden: false,
				isFirstLanch: true,
				loadCount: 0,
				communityStore: useCommunityStore(),
				commonStore: useCommonStore()

			};
		},

		computed: {
			...mapState(useUserStore, ['userInfo']),
			...mapState(useCommunityStore, ['NeedRreflash', 'PostList', 'communityList', 'hasUnreadMessage']),
			...mapState(useCommonStore, ['refresh', 'postDetail', 'canLinkWebView']),
			...mapState(useCommonStore, ['systemBarHeight']),

			communityDisplayInfo() {
				const result = this.communityList.length ?
					this.communityList.find(el => el.id === +this.communityId) :
					null;
				return result;
			}
		},
		onShow() {

			// uni.hideTabBar({
			// 	animation: false,
			// });
			let that = this
			if (this.NeedRreflash) {
				setTimeout(() => {
					that.reflashPage();
					this.communityStore.setNeedReflash(false)
				}, 100)
			}

			!this.isTourist && this.getUnreadCount();
			setTimeout(() => {
				that.getPostType();
			}, 200)

			// if (!this.isTourist && this.userInfo.birthday.length > 0) {//生日弹窗功能
			// 	this.reminderType = this.birthdayReminder.checkReminder();
			// }
		},

		onLoad() {

			if (!this.userInfo) {
				uni.reLaunch({
					url: '/pages/index/index'
				});
				return;
			}
			uni.pageScrollTo(0);
			this.checkUserInfo();
			!this.isTourist && this.getUnreadCount();
			// if (!this.isTourist && this.userInfo.birthday.length > 0) {//生日弹窗功能
			// 	// const birthdayStr = this.userInfo.birthday; // 示例生日日期
			// 	const birthdayStr = '2025-01-04';
			// 	this.birthdayReminder = new BirthdayReminder(birthdayStr);
			// }
			let that = this
			uni.request({
				url: `${this.$uni_base_API}/serviceupkeep`,
				success(res) {
					// console.log(res)
					that.showServiceupdata = res.data ? res.data : false
					that.$forceUpdate
				},

				fail(error) {}
			})

		},
		mounted() {
			let that = this
			that.communityStore.getCommunity();
			setTimeout(() => {
				that.loadbannerMethod()
			}, 400)

			setTimeout(() => {
				that.checkCanGotoWebView()
			}, 300)

			let obj = getStorageSync('isFlow')
			if (obj === "1") {
				this.isFlow = true
			} else {
				this.isFlow = false
			}

		},
		// onPageScroll(res) {
		//     const top = res.scrollTop
		//     if (top > 300) {
		//         this.bannerOpacity = 0
		//     } else {
		//         this.bannerOpacity = (100 - top) / 100
		//     }
		// },
		methods: {
			// ...mapActions('community', [
			// 	'setNeedReflash',
			// 	'getPostList',
			// 	'getCommunity',
			// 	'setTempFileList',
			// 	'setTempFileType',
			// 	'setHasUnreadMessage',
			// 	'clearPostStorage',
			// 	'addPostList'
			// ]),
			// ...mapActions('common', ['setRefresh', 'setcanLinkWebView', 'setshowBlock']),



			chatIconMethod() {
				if (this.isTourist) return this.touristBlock();
				uni.navigateTo({
					url: '/pages/my/message'
				})
			},

			handleskipCommiunt() {
				this.showGuide = false
				this.$off("skipCommiunt")
			},
			stopClick() {
				return false
			},

			handleClose() { //关闭生日弹框
				this.isModalVisible = false
				this.$forceUpdate()
			},
			handleSkiplink() {
				// this.isModalVisible = false

				if (this.reminderType.type === "oneWeek") {
					this.reminderType.type = 'twoWeeks'
				} else {
					this.reminderType.type = 'oneWeek'
				}
			},

			changeFlow() {
				this.isFlow = !this.isFlow
				setStorageSync("isFlow", this.isFlow == true ? "1" : "2")
				uni.pageScrollTo(0);
			},

			/** 数据动态分组
			 * @param {Object} data 分组的数据列表
			 * @param {Object} i 需要分几组
			 * @returns {Array} groups 已分组的数据
			 */
			dynamicGrouping(data, i) {
				if (i <= 0) return "分组数必须大于0";
				const groups = [];
				for (let j = 0; j < i; j++) {
					groups.push([]);
				}
				for (let k = 0; k < data.length; k++) {
					const groupIndex = k % i;
					groups[groupIndex].push(data[k]);
				}
				return groups;
			},
			checkCanGotoWebView() {
				let that = this
				this.commonStore.setshowBlock(false)
				this.commonStore.setcanLinkWebView(true)

				uni.getSystemInfo({
					success(res) {
						if (res.platform === 'ios') {
							uni.request({
								url: `${that.$uni_base_API}/reviewVersion`,
								success(vres) {

									uni.setStorageSync('changeUrl', vres.data.changeUrl)
									if (vres.data.version === res.appVersion) {
										that.commonStore.setshowBlock(true)
										that.commonStore.setcanLinkWebView(false)
										// uni.setStorage({
										// 	data:vres.data.changeUrl,
										// 	key:"changeUrl"
										// })
										// console.log(that.canLinkWebView)
									} else {
										that.commonStore.setshowBlock(false)
										that.commonStore.setcanLinkWebView(true)
									}
									// console.log(vres)
								},
								fail(err) {
									console.log(err)
								}
							})
						} else {

						}
					}
				})
			},
			loadbannerMethod: debounce(async function() {
				// if (this.hasDevice) return
				let that = this
				try {
					const res = await this.$api.common.getHomenBanner()

					uni.setStorageSync('homeBannerList', JSON.stringify(res.data.data))
					that.bannerList = res.data.data
					that.bannerList.forEach(el => {
						getImageCache(el.image, el.image)
					});
				} catch (error) {
					//TODO handle the exception
				}

			}, 200),
			reflashDeleItems(item) {
				let index = this.posts.findIndex(el => {
					return el.id === item.id
				})
				if (index > -1) {
					this.posts.splice(index, 1)
				}
			},
			doubleClick() {
				let that = this

				uni.pageScrollTo(0);
				setTimeout(() => {
					that.switchTab(this.activeTab || this.tabs[0]);
				}, 100);
			},
			reflashPage() {

				uni.pageScrollTo(0);
				this.checkUserInfo();
				this.communityStore.setNeedReflash(false);
			},


			async getUnreadCount() {

				try {
					const res = await this.$api.community.getUnreadCount();
					// console.log(res)
					if (res.code === 0) {
						this.communityStore.setHasUnreadMessage(res.data > 0);
					}
				} catch (error) {
					console.warn('postActiveData', error);
				}
			},
			handlePlayVideo(url) {
				this.currentVideoSrc = url;
				this.showVideo = true;
			},
			closeVideo() {
				this.currentVideoSrc = '';
				this.showVideo = false;
			},

			handleLikesSuc(obj, likeNum) {
				const index = this.posts.findIndex(el => {
					return el.id === obj.id;
				});
				if (index > -1) {
					this.posts[index].praise_cnt = Number(this.posts[index].praise_cnt) + likeNum;
					this.posts[index].am_i_like = Number(this.posts[index].am_i_like) + likeNum;
				}
			},
			handleCreatePost() {
				// 如果是游客模式
				if (this.isTourist) return this.touristBlock();
				this.showUploadPopup = true;
			},
			chooseSucBack(arr, type) {
				this.communityStore.setTempFileList(arr);
				this.communityStore.setTempFileType(type);
				this.$navigateTo('/pages/community/postEdit');
			},
			gotoBanner(obj) {
				plus.runtime.openURL(obj.jump_url);
			},
			checkUserInfo() {
				this.getBanner();
				this.getPostType();
				this.switchTab(this.tabs[0]);
				!this.isTourist && this.postActiveUser();
			},
			postActiveUser() {
				const arr = uni.getStorageSync('activeUserArr');
				if (arr && arr.length > 0) {
					const now = new Date();
					const today = parseInt(now / 86400000) * 86400000;
					const index = arr.findIndex(el => {
						return this.userInfo.email === el.who;
					});
					if (index < 0) {
						this.postActiveData();
						return;
					}
					if (arr[index].time < today) {
						this.postActiveData();
					}
				} else {
					this.postActiveData();
				}
			},
			setPostActiveArr(checkinObj) {
				const activeUserArr = uni.getStorageSync('activeUserArr') || [];
				if (activeUserArr && activeUserArr.length > 0) {
					const index = activeUserArr.findIndex(el => {
						return el.who === checkinObj.who;
					});
					if (index < 0) {
						activeUserArr.push({
							who: checkinObj.who,
							time: checkinObj.time
						});
					} else {
						activeUserArr[index].time = checkinObj.time;
					}
				} else {
					activeUserArr.push({
						who: checkinObj.who,
						time: checkinObj.time
					});
				}
				uni.setStorage('activeUserArr', activeUserArr);
			},
			async postActiveData() {
				try {
					const res = await this.$api.community.activePost();
					if (res.code === 0) {
						const checkInObj = {
							who: this.userInfo && this.userInfo.email,
							time: new Date().getTime()
						};
						this.setPostActiveArr(checkInObj);
					}
				} catch (error) {
					console.warn('postActiveData', error);
				}
			},
			async getBanner() {

				let banners = getStorageSync('communityBanner')
				if (banners) {
					this.banners = JSON.parse(banners)
				}
				const params = {
					community_id: this.communityId
				};
				try {
					const res = await this.$api.community.getBannerList(params);
					// console.log(res)
					if (res.code === 0) {
						this.banners = res.data;
						setStorageSync('communityBanner', JSON.stringify(res.data ? res.data : []))
						// console.log('getBanner res.data', res.data);
					}
				} catch (error) {
					console.warn('getBanner', error);
				}
			},
			async getPostType() {
				const params = {
					community_id: this.communityId
				};
				try {
					const res = await this.$api.community.getPostTypeList(params);
					if (res.code === 0) {
						this.tabsOriginData = res.data;
						this.processTabsData();
					}
				} catch (error) {
					console.warn('getPostType', error);
				}
			},
			processTabsData() {
				this.tabs = [{
						title: this.$t('all'),
						key: 'all'
					},
					{
						title: `🔥${this.$t('hot')}`,
						key: 'hot'
					}
				];
				const tempArr = this.tabsOriginData.map(el => {
					return {
						title: el[this.localeEn],
						key: el.id
					};
				});
				this.tabs = this.tabs.concat(tempArr);
			},
			switchTab(tab) {
				this.page = 1;
				this.lastId = '';
				this.isLoaded = false;
				this.status = 'loadmore';
				this.activeTab = tab;
				this.postTypeId = tab.key;
				this.posts = [];
				var isHot = false;
				if (tab.key === 'all') {
					this.postTypeId = '';
				} else if (tab.key === 'hot') {
					this.postTypeId = '';
					isHot = true;
				}
				this.showorHidden = true
				setTimeout(() => {
					this.showorHidden = false
				}, 200)

				uni.pageScrollTo(0);
				// 重新搜索
				this.getPostList(isHot);
			},
			// 获取post
			async getPostList(isHot) {

				// console.log(this.loadCount++)
				if (this.status === 'loading') return;
				this.status = 'loading';
				const params = {
					post_type_id: this.postTypeId,
					per_page: this.pageSize,
					last_id: this.lastId
				};
				if (isHot && isHot == true) {
					params.is_hot = 1;
				}
				try {
					const res = await this.$api.community.getPostList(params);

					uni.stopPullDownRefresh();
					if (res.code === 0) {
						const arr = res.data.data.map(el => {
							return {
								...el,
								isMine: el.user_id === this.userInfo.user_id
							};
						});

						if (this.posts.length > 0) {
							if (arr.length) {
								if (this.posts[0].id != arr[0].id) {
									this.posts = this.posts.concat(arr);
								}
							} else {
								this.posts = this.posts.concat(arr);
							}
						} else {
							this.posts = this.posts.concat(arr);
						}
						const length = res.data.data.length;
						if (length > 0) {
							this.lastId = res.data.data[length - 1].id;
						}
						this.page += 1;
						this.flowData.list = this.posts
						let groupList = this.dynamicGrouping(this.flowData.list, this.flowData.column)
						groupList.forEach((item, i) => (this.flowData[`column_${i + 1}`] = item))
						if (res.data.total < this.pageSize) {
							this.status = 'nomore';
						} else {
							this.status = 'loadmore';
						}
						this.isLoaded = true;
						this.$forceUpdate()
					}
				} catch (error) {
					uni.stopPullDownRefresh();
					// console.warn('getPostList', error);
				}
			},

			// 去用户中心
			goToUserDetail() {
				// 如果是游客模式
				if (this.isTourist) return this.touristBlock();
				this.$navigateTo('/pages/my/userInfo', {
					user_id: this.userInfo.user_id
				});
			},

			onReachBottom() {
				if (this.status === 'nomore') return;
				// this.page += 1 //暂定
				this.getPostList();
			},

			// 拦截游客模式
			touristBlock() {
				this.showTouristModeBlockDialog = true;
				// console.log('userInfo', this.userInfo);
			}
		}
	};
</script>

<style lang="scss">
	.community-page {
		// padding: 32rpx;
		background: #f8f8f8;
		min-height: 100vh;
		// width: calc(100vw - 32rpx);

		&__header {
			padding: 0 34rpx 20rpx;
			display: flex;
			align-items: center;
			position: sticky;
			background: #f8f8f8;
			top: var(--status-bar-height);
			z-index: 15;
			padding-bottom: 20rpx;

			.contryImage {
				// position: absolute;
				width: 50rpx;
				height: 24rpx;
				// bottom: 15rpx;
				// left: 88rpx;
				z-index: 16;
			}

			.user__avatar {
				height: 88rpx;
				width: 88rpx;
				border-radius: 44rpx;
				overflow: hidden;
				position: relative;

				image {
					width: 100%;
					height: 100%;
				}

				// &.online:after {
				//   content: '';
				//   position: absolute;
				//   right: 0;
				//   top: 4rpx;
				//   background: #16C43A;
				//   width: 18rpx;
				//   height: 18rpx;
				//   border: 2rpx solid #fff;
				//   border-radius: 18rpx;
				// }
			}

			.user__name {
				flex: 1;
				margin: 0 20rpx;
				font-weight: bold;
				font-size: 36rpx;
				color: #272525;

				image {
					display: inline-block;
					vertical-align: middle;
					width: 48rpx;
					height: 48rpx;
					margin-left: 6rpx;
				}
			}

			.user__post-trigger {
				width: 66rpx;
				height: 66rpx;
				background: linear-gradient(360deg, #4d4d4d 0%, #303030 100%);
				border-radius: 44rpx;
				display: flex;
				justify-content: center;
				align-items: center;

				image {
					margin-right: 10rpx;
					width: 48rpx;
					height: 48rpx;
				}
			}
		}

		&__name {
			z-index: 15;
			background: #f8f8f8;
			padding: 36rpx 32rpx;
			display: flex;
			align-items: center;
			width: 100%;
			position: sticky;
			top: calc(var(--status-bar-height) + 88rpx);

			&-icon {
				display: flex;
				align-items: center;
				border: 2rpx solid #d8d8d8;
				border-radius: 4rpx;
				padding: 10rpx 6rpx;

				image {
					width: 70rpx;
					height: 40rpx;
				}
			}

			text {
				font-weight: bold;
				font-size: 48rpx;
				flex: 1;
				margin-left: 20rpx;
			}
		}

		// .swiper-position {
		//   height: 410rpx;
		// }

		&__banner {
			padding: 36rpx 32rpx 0;
			height: 410rpx;
			// position: sticky;
			left: 0;
			right: 0;
			top: calc(var(--status-bar-height) + 200rpx);
			z-index: 0;

			image {
				width: 100%;
				height: 374rpx;
				border-radius: 20rpx;
			}
		}

		&__search-cover {
			background: #f8f8f8;
			position: sticky;
			z-index: 15;
			top: calc(var(--status-bar-height) + 88rpx);
			padding-top: 30rpx;
			padding-bottom: 10rpx;
		}

		&__search {
			border-radius: 60rpx;
			background: #fff;
			padding: 22rpx;
			display: flex;
			align-items: center;
			color: #c1c1c1;
			font-size: 32rpx;

			image {
				width: 48rpx;
				height: 48rpx;
				margin-right: 20rpx;
			}
		}

		&__tabs {
			padding-left: 32rpx;
			padding-top: 18px;
			background: #f8f8f8;
			border-bottom: 2rpx solid #e5e5e5;
			overflow-x: scroll;
			white-space: nowrap;
			position: sticky;
			z-index: 15;
			top: calc(var(--status-bar-height) + 88rpx + 20rpx + 110rpx);
			// position: relative;
		}

		&__tab {
			display: inline-block;
			padding: 0 30rpx 20rpx;
			line-height: 44rpx;
			font-size: 32rpx;
			color: #808690;

			&.active {
				border-bottom: 2rpx solid #272525;
				font-weight: bold;
			}

			&.hot {
				color: #ea2700;
			}
		}

		&__list {
			margin: 0rpx 0rpx 0;
			background: #f8f8f8;
			min-height: 100vh;
			padding: 32rpx;


			&__item {
				background: #f8f8f8;
			}
		}

		&__no-post {
			display: flex;
			flex-direction: column;
			align-items: center;
			padding-top: 300rpx;

			image {
				width: 160rpx;
				height: 160rpx;
			}

			text {
				font-size: 32rpx;
				margin: 16rpx 0 0;
				line-height: 44rpx;
				color: #808690;
			}
		}

		.header-cover {
			background: #f8f8f8;
			// position: fixed;
			z-index: 15;
			width: 100vw;
			top: calc(var(--status-bar-height) - 520rpx);
		}

		.position-cover {
			height: calc(720rpx + var(--status-bar-height));
		}
	}

	.all-tab {
		color: #272525;
	}


	///2134567
	.container {
		display: flex;
		justify-content: space-between;
		padding: 20rpx;
		max-width: 100%;
		width: 100%;
		$borderRadius: 12rpx;

		.cont-box {
			width: var(--layout-width);

			.item-box {
				width: 100%;
				padding-bottom: 20rpx;
				margin-bottom: 30rpx;
				border-radius: $borderRadius;

				// box-shadow: 0rpx 3rpx 6rpx rgba(0, 46, 37, 0.08);
				.img-tip {
					width: 100%;
					border-radius: $borderRadius $borderRadius 0 0;
					// background-color: red;
				}

				.tit-tip {
					text-align: justify;
					font-size: 30rpx;
					padding: 10rpx 20rpx 0;
					font-weight: 900;
				}

				.desc-tip {
					text-align: justify;
					font-size: 26rpx;
					padding: 5rpx 20rpx 0;
					margin-top: 10rpx;
				}
			}
		}
	}

	/* 多行省略 */
	.multi-line-omit {
		word-break: break-all; // 允许单词内自动换行，如果一个单词很长的话
		text-overflow: ellipsis; // 溢出用省略号显示
		overflow: hidden; // 超出的文本隐藏
		display: -webkit-box; // 作为弹性伸缩盒子模型显示
		-webkit-line-clamp: 2; // 显示的行
		-webkit-box-orient: vertical; // 设置伸缩盒子的子元素排列方式--从上到下垂直排列
	}

	/* 单行省略 */
	.one-line-omit {
		width: 100%; // 宽度100%：1vw等于视口宽度的1%；1vh等于视口高度的1%
		white-space: nowrap; // 溢出不换行
		overflow: hidden; // 超出的文本隐藏
		text-overflow: ellipsis; // 溢出用省略号显示
	}

	.full-page-cover {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		// bottom: -(env(safe-area-inset-bottom));
		// width: 100vw;
		height: 100vh;
		// bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		/* 半透明背景 */
		// display: flex;
		// justify-content: center;
		// align-items: center;
		z-index: 1050;
		// overflow: hidden;

		.content {
			/* 这里设置你的内容样式 */
			padding: 20px;
			background-color: #fff;
			border-radius: 10px;
		}
	}

	.popup-content {
		background-color: #fff;
		padding: 20px;
		border-radius: 10px;
		text-align: center;

	}

	.popup-title {
		font-size: 20px;
		font-weight: bold;
		margin-bottom: 10px;
	}

	.popup-message {
		font-size: 16px;
		color: #666;
	}
</style>