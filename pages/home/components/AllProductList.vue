<template>
	<view>
		<view v-if="!showNav" class="base_box">
			<view class="left_box">
				<view class="left_content" @touchmove.stop.prevent="touchmove">
					<view v-for="(item,index) in devicelist"
						:class="index!=currentindex?'left_content-items':'left_content-activity'"
						@click="itemClick(index)">
						<view :class="index===currentindex?'line':'tline'"></view>
						<text>{{item.mainTile}}</text>
					</view>
				</view>

				<image v-show="bottom_img" mode="aspectFill" src="@/static/images/phase2/left_bottom.png"></image>


			</view>
			<view class="content_box" v-if="!showAndHidden">
				<view v-for="(item,index) in itemList" :key="index" class="image_box" @click="clickType(item)">
					<!-- <image class="image_box_img" mode="aspectFit" :src="item.img"></image> -->
					<chaceImage class="image_box_img" mode="aspectFit" :fileMd5="item.img" :url='item.img'></chaceImage>
					<text>{{item.name}}</text>
				</view>
			</view>

		</view>

		<view v-else>

			<view class="nagavit_box" :style="{ top:'0rpx',paddingTop: `${systemBarHeight * 2 }rpx` }">
				<image class="mback-icon" src="/static/images/common/left-arrow.png" @click="$back"></image>
				<view class="back_title">{{$t('bluetoothHintRelate.discovery')}}</view>
			</view>
			<view class="base_box" :style="{ paddingTop: `${systemBarHeight * 3 }rpx` }">
				<view class="left_box">
					<view class="left_content" @touchmove.stop.prevent="touchmove">
						<view v-for="(item,index) in devicelist"
							:class="index!=currentindex?'left_content-items':'left_content-activity'"
							@click="itemClick(index)">
							<view :class="index===currentindex?'line':'tline'"></view>
							<text>{{item.mainTile}}</text>
						</view>
					</view>
					<image v-show="bottom_img" mode="aspectFill" src="@/static/images/phase2/left_bottom.png"></image>

				</view>
				<view class="content_box">
					<view v-for="(item,index) in itemList" :key="index" class="image_box" @click="clickType(item)">
						<chaceImage class="image_box_img" mode="aspectFit" :fileMd5="item.img" :url='item.img'>
						</chaceImage>
						<text>{{item.name}}</text>

					</view>
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
	} from '@/store/common'
	export default {
		data() {
			return {
				devicelist: [],
				currentindex: 0,
				itemList: [],
				showNav: false,
				bottom_img: false,
				showAndHidden: false
			}
		},
		components: {
			chaceImage,
			PageLayout
		},
		computed: {
			...mapState(useCommonStore, ['systemBarHeight']),
		},
		mounted() {
			const myll = uni.getStorageSync('alldeviceList')

			let that = this

			setTimeout(() => {
				that.devicelist = myll

				that.itemList = that.devicelist[that.currentindex]?.subObject
				// console.log(that.itemList)
				that.$forceUpdate()
				this.bottom_img = true
			}, 200)

		},
		onLoad(op) {
			this.showNav = op.flag ? op.flag : false
		},
		methods: {
			touchmove() {},
			clickType(item) {

				uni.navigateTo({
					url: '/pages/home/DeviceDetailPage?item=' + JSON.stringify(item),
					success() {

					},
					fail(err) {
						console.log(err)
					}
				})
			},
			itemClick(index) {




				this.currentindex = index

				this.itemList = this.devicelist[index]?.subObject


				if (this.showNav) {
					uni.pageScrollTo({
						offsetTop: 0
					})
				} else {
					this.showAndHidden = true
					setTimeout(() => {
						this.showAndHidden = false
					}, 200)
				}


			}
		}
	}
</script>

<style lang="scss" scoped>
	.nagavit_box {
		position: fixed;
		display: flex;
		justify-content: flex-start;
		align-content: center;
		padding: 0 30rpx;
		width: 100%;
		left: 0;
		// height: 88rpx;
		z-index: 2;
		background-color: #f8f8f8;

		.mback-icon {
			width: 60rpx;
			height: 60rpx;
			z-index: 3;
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
			z-index: 3;
		}
	}

	.base_box {

		width: 100vw;
		height: calc(100vh - 180rpx);
		padding-top: 40rpx;
		position: relative;
		background-color: white;



		.left_box {
			width: 220rpx;
			height: calc(100vh - 210rpx);
			position: fixed;
			// top: 0rpx;
			top: 210rpx;
			left: 0;
			background-color: #f7f7f7;

			image {
				width: 100%;
				height: 300rpx;
			}


			.left_content {
				display: flex;
				justify-content: flex-start;
				align-items: center;
				flex-direction: column;

				&-items {
					padding: 30rpx 10rpx;
					width: 100%;
					color: black;

					display: flex;
					// flex-wrap: wrap;
					align-items: center;
					min-height: 120rpx;
					justify-content: center;
					text-align: center;

					// .tline {
					// 	height: 50rpx;
					// 	width: 4rpx;
					// 	background-color: #f7f7f7;
					// 	animation: leftlinee 0.5s both ease-out;

					// }

				}


				&-activity {
					padding: 30rpx 10rpx;
					width: 100%;
					color: rgb(145, 17, 36);
					background-color: white;
					display: flex;
					// flex-wrap: wrap;
					min-height: 120rpx;
					align-items: center;
					justify-content: center;
					text-align: center;

					.line {
						height: 40rpx;
						width: 8rpx;
						background-color: rgb(145, 17, 36);
						margin-right: 10rpx;
						animation: leftlinee 0.5s both ease-out;

					}

					@keyframes leftlinee {
						0% {
							height: 0rpx;
						}

						100% {
							height: 40rpx;
						}
					}

				}
			}



		}


		.content_box {
			width: calc(100% - 220rpx);
			display: flex;
			flex-wrap: wrap;
			justify-content: flex-start;
			padding-bottom: 100px;
			margin-left: 220rpx;
			padding-top: 0rpx;
			margin-top: 40rpx;
			z-index: 0;

			background-color: white;


			.image_box {
				flex: 0 0 45%;
				/* 每个元素占据45%的宽度，确保两个元素并列时有一定的间距 */
				margin: 2.5%;
				/* 外边距，用于调整元素之间的间距 */
				box-sizing: border-box;
				padding: 0.5%;
				display: flex;
				justify-content: center;
				align-items: center;
				flex-direction: column;


				/* 包括内边距和边框在内的元素总宽度和高度计算方式 */
				/* 示例背景色 */
				.image_box_img {
					padding: 20rpx;
					width: 100%;
					height: 260rpx;
					border-radius: 20rpx;
					background-color: #f7f7f7;

				}

				text {
					width: 100%;
					line-height: 60rpx;
					font-size: 30rpx;
					color: black;
					text-align: center;
					overflow: hidden;
					/* 超出隐藏 */
					display: -webkit-box;
					/* 将对象作为弹性伸缩盒子模型显示 */
					-webkit-box-orient: vertical;
					/* 设置或检索伸缩盒对象的子元素的排列方式 */
					-webkit-line-clamp: 1;
					/* 限制在一个块元素显示的文本的行数 */

				}
			}


		}
	}


	.strpke-text {
		font-size: 50px;
		color: white;

		text-shadow:
			-1px -1px 0 green,
			1px -1px 0 green,
			-1px 1px 0 green,
			1px 1px 0 green;
	}
</style>