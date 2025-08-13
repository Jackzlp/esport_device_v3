<template>
	<view class="atmosphere-light-music">
		<view :class="['music-player', musicList.length ? '' : 'no-list']">
			<view class="music-player__cover">
				<image :src="'./images/vinyl.png'" />
			</view>

			<view class="music-player__actions">
				<view class="music-player-top">
					<image class="pre" :class="{'onpress-pre': preMusicBtn}" :src="'./images/music-pre.png'"
						@click="preMusic" />

					<!-- 开始，结束 -->
					<image v-if="isPlaying" class="stop" :src="'./images/music-stop.png'" @click="stopPlaying" />
					<image v-else class="start" :src="'./images/music-start.png'" @click="startPlaying" />

					<image class="next" :class="{'onpress-next': nextMusicBtn}" :src="'./images/music-next.png'"
						@click="nextMusic" />
				</view>

				<u-slider v-model="currentTime" class="music-player__slider" active-color="#333" :block-size="9"
					:disabled="musicList.length === 0" step="1" min="0" max="100" @changing="handleChanging"
					@change="handleChanged" />

				<!-- <view
          v-if="currentSong && currentSong.src"
          class="music-player__duration"
        >
          {{ currentLeftTime }}
        </view> -->
			</view>
		</view>
		<view v-if="musicList.length && !isIos" class="music-list">
			<view v-for="(music, index) in musicList" :key="index" class="music" @click="switchMusic(index)">
				<view class="music__serial-number" :class="{'current-type':currentSongIndex === index}">
					{{ index + 1 }}
				</view>

				<view class="music-detail">
					<view>
						<view class="music__name" :class="{'current-type':currentSongIndex === index}">
							{{ music.name | nameText }}
						</view>
						<!-- <view class="music__author">{{ music.author }}</view> -->
					</view>

					<!-- <view class="music__duration">
            {{ music.duration }}
          </view> -->
				</view>
			</view>
		</view>
		<view v-if="isIos && musicList.length" class="music-list">
			<u-swipe-action>
				<u-swipe-action-item v-for="(music, index) in musicList" :key="music.name" :options="options"
					:disabled="false" @click="handleClickOptions(index)">
					<view :class="['music', index === 0 ? 'first-child' : '']" @click.stop="switchMusic(index)">
						<view class="music__serial-number">
							{{ index + 1 }}
						</view>

						<view class="music-detail">
							<view>
								<view class="music__name" :class="{'current-type':currentSongIndex === index}">
									{{ music.name | nameText }}
								</view>
								<!-- <view class="music__author">{{ music.author }}</view> -->
							</view>

							<!-- <view class="music__duration">
                {{ music.duration }}
              </view> -->
						</view>
					</view>
				</u-swipe-action-item>
			</u-swipe-action>
			<view />
		</view>

		<view v-if="isIos" class="add-music-button" @click="selecteMusic">
			<image :src="'/static/images/phase2/plus-white.png'" />

			{{ $t('atmosphereLightPage.addDevices') }}
		</view>
	</view>
</template>

<script>
	import {
		calcSum,
		wData
	} from '../../../BLE/BLEfunction'
	// const filePlugin = uni.requireNativePlugin('leruge-file')
	const xiaogeFile = uni.requireNativePlugin('xiaoge-file');
	const KJPermission = uni.requireNativePlugin('KJ-Permission');
	import {
		mapState,

	} from 'pinia'
	import {
		useDeviceStore
	} from '../../../../../store/device';
	const audioContext = uni.getBackgroundAudioManager()
	export default {
		name: 'AtmosphereLightMusic',
		props: {
			switchOn: {
				type: Boolean,
				default: true
			},
			isPageShow: {
				type: Boolean,
				default: true
			},
			isGroup: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				isPlaying: false,
				nextMusicBtn: false,
				preMusicBtn: false,
				switchMusicIng: false,
				onhanDOption: false,
				forbidPlayClick: false,
				forbidSend: false,
				isFirstPlay: true,
				isIos: false,
				currentSongIndex: '-1',
				myTimer: null,
				deviceStore: useDeviceStore(),

				currentSong: {
					src: '',
					name: '',
					duration: ''
				},
				currentTime: 0,

				musicList: []
			}
		},

		computed: {
			...mapState(useDeviceStore, ['IOSMusicList', 'audioContextAlreadySign']),
			options() {
				return [{
					text: this.$t('my_center_page.delete'),
					style: {
						backgroundColor: '#f56c6c',
						height: 'calc(100% - 10rpx)',
						marginTop: '5rpx'
					}
				}]
			}
		},
		watch: {
			switchOn(newVal) {
				if (!newVal) {
					if (!audioContext.paused) {
						this.stopPlaying()
					}
				}
			}
		},
		filters: {
			nameText(val) {
				if (val.endsWith('.mp3') || val.endsWith('.MP3')) {
					return val.slice(0, -4);
				}
				return val;
			}
		},
		// computed: {
		//     currentLeftTime() {
		//         const sec = parseInt(this.currentSong.duration - (this.currentTime / 100 * this.currentSong.duration))
		//         const hours = Math.floor(sec / 3600);
		//         const minutes = Math.floor((sec % 3600) / 60);
		//         const remainingSeconds = sec % 60;

		//         let formattedTime = '';

		//         if (hours > 0) {
		//             formattedTime += `${hours.toString().padStart(2, '0')}:`;
		//         }

		//         formattedTime += `${minutes.toString().padStart(2, '0')}:${
		//             remainingSeconds.toString().padStart(2, '0')}`;

		//         return formattedTime;
		//     }
		// },
		mounted() {
			this.getSystemMusic()
			// setTimeout(() => {
			//     plus.io.resolveLocalFileSystemURL('/iTunes Control/Music', dirEntry => {
			//         const directoryReader = dirEntry.createReader()
			//         console.log('directoryReader', directoryReader)
			//         directoryReader.readEntries(
			//             entries => {//历遍子目录即可
			//                 console.log('entries', entries)
			//                 for (let i = 0; i < entries.length; i++) {
			//                     console.log(`文件信息:${entries[i].name}`)
			//                     console.log(`文件信息2:${entries[i].fullPath}`)
			//                     this.musicList.push({
			//                         name: entries[i].name,
			//                         author: 'Justin Bieber',
			//                         duration: '03file:///storage/emulated/0/Music:12'
			//                     })
			//                 }
			//             })
			//     }, 2000)})
		},

		methods: {
			// ...mapMutations('device', ['saveIosMusicList', 'setAudioContextAlreadySign']),




			getSystemMusic() {
				console.log('getSystemMusic')
				const that = this
				this.initMusic()
				uni.getSystemInfo({
					success(res) {

						console.log('getSystemMusic1', res)
						if (res.platform === 'android') {
							that.getMusicForAndroid()
						} else if (res.platform === 'ios') {
							that.isIos = true
							// that.musicList = that.IOSMusicList
							// that.getMusicForIOS()
						} else {
							console.log('设备不是安卓也是iOS');
						}
					}
				});
			},
			handleChanging() {
				this.onhanDOption = true
			},
			handleChanged(value) {
				audioContext.seek(this.currentSong.duration / 100 * value)
				setTimeout(() => {
					this.onhanDOption = false
				}, 200)
			},
			getMusicForAndroid() {
				KJPermission.judgePermission({
					'name': 'android.permission.READ_EXTERNAL_STORAGE'
				}, res => {
					if (res.result && res.status === -1) {
						KJPermission.requestPermission({
							'name': 'android.permission.READ_EXTERNAL_STORAGE'
						}, res2 => {
							if (res2.result && res2.status === -1) {
								this.checkFileList()
							}
						});
					} else {
						this.checkFileList()
					}
					console.log(`judgePermission:${JSON.stringify(res)}`);
				});
			},
			getMusicForIOS() {
				// filePlugin.open(res => {
				//     if (res.code === 1) {
				//         if (res.file.endsWith('.mp3')) {
				//             const index = this.musicList.findIndex(el => {
				//                 return el.src === `file:///${res.file}`
				//             })
				//             if (index < 0) {
				//                 const tempName = decodeURIComponent(res.file.substring( res.file.lastIndexOf('/') + 1))
				//                 this.musicList.push({
				//                     name: tempName,
				//                     src: `file:///${res.file}`
				//                 })
				//                 if (this.isIos) {
				//                     if (this.musicList.length === 1) {
				//                         this.forbidPlayClick = true
				//                         setTimeout(() => {
				//                             this.forbidPlayClick = false
				//                         }, 1500)
				//                     }
				//                     // this.saveIosMusicList(this.musicList)
				//                 }
				//             } else {
				//                 // @laotan 国际化 toast提示用户 “该音乐已在列表中”
				//                 // 获取蓝牙设备服务失败
				//                 this.$toast({
				//                     content: this.$t('bluetoothHintRelate.musicAlreadyInList'),
				//                     type: 'plain'
				//                 })
				//                 console.log('getMusicForIOS', res.file)
				//             }
				//         } else {
				//         // @laotan 国际化 toast提示用户 “选取的文件非音乐文件”
				//             console.log('getMusicForIOS', res.file)
				//             this.$toast({
				//                 content: this.$t('bluetoothHintRelate.nonMusicFileSelected'),
				//                 type: 'plain'
				//             })
				//         }
				//     }
				// })
			},
			checkFileList() {
				// 有时会出现找不到音乐的问题 Attempt to get length of null array
				xiaogeFile.getList('Music', res => {
					console.log(' arr.filter', res)
					const arr = res.data || [];
					let temp = arr.filter(el => {
						return !el.isDirectory && el.name.endsWith('.mp3')
					})
					temp = temp || []
					temp.map(el => {
						this.musicList.push({
							name: el.name,
							src: `file:///${el.absolutePath}`
						})
					})
					console.log('getList', arr);
				})
			},
			selecteMusic() {
				this.getMusicForIOS()
			},
			getResolveLocalFileSystemURL(url) {
				setTimeout(() => {
					plus.io.resolveLocalFileSystemURL(url, entry => {
						// 递归遍历文件夹
						console.log('resolveLocalFileSystemURL-entry', entry.toLocalURL())
						this.traverseFolder(entry);
					}, error => {
						console.log(`扫描地文件失败：${error.message}`);
					})
				}, 1000)
			},
			traverseFolder(directoryEntry) {
				const directoryReader = directoryEntry.createReader();
				directoryReader.readEntries(entries => {
					console.log('readEntries-entries', entries)
					for (let i = 0; i < entries.length; i++) {
						const entry = entries[i];
						if (entry.isDirectory) {
							// 如果是文件夹，则递归遍历
							this.traverseFolder(entry);
						} else if (entry.isFile) {
							// 如果是文件，则判断是否为音乐文件
							if (this.isMusicFile(entry.name)) {
								// 处理音乐文件
								this.handleMusicFile(entry);
							}
						}
					}
				}, error => {
					console.log(`读取文件夹内容失败：${error.message}`);
				});
			},
			functionMusicFile(fileName) {
				const ext = fileName.substr(fileName.lastIndexOf('.') + 1).toLowerCase();
				return ext === 'mp3' || ext === 'wav' || ext === 'ogg';
			},
			// 处理音乐文件
			handleMusicFile(fileEntry) {
				console.log('handleMusicFile', fileEntry)
				// 获取音乐文件路径
				const musicPath = fileEntry.toLocalURL();

				// 在页面上展示音乐文件信息，这里仅作示例
				console.log(`音乐文件路径：${musicPath}`);
			},
			// 开始播放
			startPlaying() {
				if (this.forbidPlayClick) return
				console.log('this.currentSong.src', this.currentSong.src)
				if (this.currentSong.src === '') {
					this.switchMusic(0, true)
					return
				}

				if (audioContext.paused) {
					audioContext.play()
				}
				this.$emit('startPlaying')
				this.isPlaying = true
				if (this.isFirstPlay) {
					this.isFirstPlay = false
					this.sendBleFn('AA5501010AB1851C6402c155AA')
				}
				console.log('this.myTimer1', this.myTimer)
				clearInterval(this.myTimer)
				this.myTimer = null
				console.log('this.myTimer3', this.myTimer)
				this.myTimer = setInterval(() => {
					this.currentTime = parseInt(audioContext.currentTime / this.currentSong.duration * 100)
					this.sendBleFn()
				}, 500)
				console.log('this.myTimer4', this.myTimer)
			},
			sendBleFn(BLEData) {
				if (this.forbidSend) return
				this.forbidSend = true
				setTimeout(() => {
					this.forbidSend = false
				}, 200)
				let tempData = ''
				tempData = BLEData || calcSum(`05${this.getRandomHexColor()}`)


				if (this.isGroup) {
					this.$emit('sceneNotice', tempData, "music", '')
					// wData2()
				} else {
					wData(tempData, sres => {
						console.log('sendFnSuc', sres)
					}, err => {
						console.log('sendFnErr', err)
					})
				}

			},
			getRandomHexColor() {
				const letters = '0123456789ABCDEF';
				let color = '';
				for (let i = 0; i < 6; i++) {
					color += letters[Math.floor(Math.random() * 16)];
				}
				return color;
			},

			// 停止播放
			stopPlaying() {
				if (!audioContext.paused) {
					audioContext.pause()
				}
				this.isPlaying = false
				this.isRecording = false
				console.log('this.myTimer2', this.myTimer)
				clearInterval(this.myTimer)
				this.myTimer = null
			},
			initMusic() {
				// if (this.audioContextAlreadySign) return
				// console.log('this.$audioContextAlreadySign', this.audioContextAlreadySign)
				setTimeout(() => {
					audioContext.onEnded(res4 => {
						console.log('onSeekingonSeeking4', res4)
						setTimeout(() => {
							this.nextMusic()
						}, 200)
					})
					audioContext.onError(err => {
						console.log('onError', err)
					})
					audioContext.onPlay(err => {
						console.log('onPlay', err)
						if (this.isPageShow) return
						this.startPlaying()
					})
					audioContext.onPause(err => {
						console.log('onPause', err)
						if (this.isPageShow) return
						this.stopPlaying()
					})
					audioContext.onCanplay(res => {
						console.log('onCanplay', res)
						this.currentSong.duration = audioContext.duration
						console.log('this.currentSong', this.currentSong.duration)
						// this.startPlaying()
					})
					// this.setAudioContextAlreadySign(true)
				}, 100)
			},

			// 切换音乐
			switchMusic(index, clickPlayBtn) {
				console.log('switchMusic-index', index)
				console.log('switchMusic-currentSongIndex', this.currentSongIndex)
				if (index === this.currentSongIndex) return
				if (this.forbidPlayClick) return
				if (this.switchMusicIng) return
				this.switchMusicIng = true
				setTimeout(() => {
					this.switchMusicIng = false
				}, 800)
				this.currentSongIndex = index
				if (!audioContext.paused) {
					this.stopPlaying()
				}
				const music = this.musicList[index]
				console.log('music', music)
				audioContext.src = music.src
				this.currentSong = music
				console.log('audioContext.paused', audioContext.paused)
				if (clickPlayBtn) {
					setTimeout(() => {
						if (audioContext.paused) {
							audioContext.play()
						}
					}, 1000)
				} else {
					setTimeout(() => {
						this.startPlaying()
					}, 500)
				}
				console.log('this.currentSong-switchMusic', this.currentSong.src)
			},
			nextMusic() {
				this.nextMusicBtn = true
				setTimeout(() => {
					this.nextMusicBtn = false
				}, 500)
				const length = this.musicList.length - 1
				let temp = 0
				if (this.currentSongIndex === length || this.currentSongIndex > length) {
					temp = 0
				} else {
					temp = (this.currentSongIndex || 0) + 1
				}
				this.switchMusic(temp)
			},
			preMusic() {
				this.preMusicBtn = true
				setTimeout(() => {
					console.log('preMusicBtn', this.preMusicBtn)
					this.preMusicBtn = false
				}, 500)
				const length = this.musicList.length - 1
				let temp = 0
				if (this.currentSongIndex === 0 || this.currentSongIndex < 0) {
					temp = length
				} else {
					temp = (this.currentSongIndex || 0) - 1
				}
				this.switchMusic(temp)
			},

			// 读取音乐列表
			initMusicList() {

			},

			// 点击选项
			handleClickOptions(index) {
				// hugo 看这里 index代表索引，直接执行delete就行了
				this.musicList.splice(index, 1)
				// this.saveIosMusicList(this.musicList)
			}
		},
		beforeDestroy() {
			console.log('beforeDestroy到底执行没有')
			audioContext.stop()
			this.stopPlaying()
		}
	}
</script>


<style lang="scss" scoped>
	.atmosphere-light-music {
		border-radius: 16rpx;

		.music-player {
			display: flex;
			align-items: center;
			padding: 24rpx 32rpx;
			background: #fff;
			border-radius: 16rpx;
			position: relative;
			box-sizing: border-box;
			width: 100%;

			&.no-list {
				&:after {
					background: hsla(0, 0%, 100%, 0.7);
					position: absolute;
					content: '';
					width: calc(100% - 32rpx);
					height: 100%;
				}
			}

			&__cover {
				image {
					height: 200rpx;
					width: 200rpx;
				}
			}

			&__actions {
				margin-left: 20rpx;
				margin-top: 44rpx;
				flex: 1;
			}

			&-top {
				display: flex;
				align-items: center;
				justify-content: center;

				.pre,
				.next {
					width: 40rpx;
					height: 40rpx;
				}

				.stop,
				.start {
					margin: 0 48rpx;
					width: 64rpx;
					height: 64rpx;
				}
			}

			&__slider {
				margin: 24rpx 0 0;
			}

			&__duration {
				text-align: right;
				font-size: 24rpx;
				color: #838181;
			}
		}

		.music-list {
			background: #fff;
			border-radius: 16rpx;
			padding: 0 32rpx 32rpx;
			margin-top: 32rpx;

			.music {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-top: 32rpx;
				padding: 0 12rpx;
				box-sizing: border-box;
				min-height: 84rpx;

				&__serial-number {
					margin-right: 32rpx;

				}

				&-detail {
					display: flex;
					justify-content: space-between;
					align-items: center;
					flex: 1;
				}

				&__name {
					font-size: 32rpx;
					color: #333333;
					line-height: 44rpx;
				}

				&__author {
					font-size: 24rpx;
					color: #838181;
					line-height: 34rpx;
				}

				&__duration {
					font-size: 28rpx;
					color: #838181;
					line-height: 40rpx;
				}
			}
		}

		.add-music-button {
			height: 112rpx;
			color: #fff;
			background: linear-gradient(360deg, #4D4D4D 0%, #303030 100%);
			border-radius: 8px;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 36rpx;
			margin-top: 32rpx;

			image {
				width: 40rpx;
				height: 40rpx;
				margin-right: 32rpx;
			}
		}

		.current-type {
			color: red !important;
		}

		.music__name {
			text-overflow: ellipsis;
			white-space: nowrap;
			overflow: hidden;
			width: 60vw;
		}
	}

	.onpress-next,
	.onpress-pre {
		opacity: 0.5;
	}
</style>