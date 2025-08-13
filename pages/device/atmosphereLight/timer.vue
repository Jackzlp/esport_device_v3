<template>
	<PageLayout :navigator-content="$t('atmosphereLightPage.timerSettings.title')">
		<view class="timer-setting">
			<view v-for="(timer, timerIndex) in timers" :key="timerIndex"
				:class="['timer', timer.active ? 'active' : '']">
				<view class="timer__period">
					<view>{{ dateText(timer.date) }}</view>
					<u-switch v-model="timer.active" active-color="#36EE54" size="20" inactive-color="#E7E7E7"
						@change="switchTimerStatus(timerIndex)" />
				</view>

				<view class="timer-bottom">
					<view class="timer__detail">
						<!-- 时间 -->
						<view class="timer__date" @click="showTimerDateDialog(timerIndex)">
							<image :src="'./images/date.png'" />
							{{ timer.date }}
						</view>
						<!-- 一周的日期📅 -->
						<view class="timer__week" @click="showTimerWeekDialog(timerIndex)">
							<image :src="'./images/week.png'" />
							{{ handleWeekText(timer.weekOptions) }}
						</view>
					</view>

					<!-- 封面 -->
					<view :class="['timer__cover', timer.turnOnLight ? 'active' : '']"
						@click="toggleTurnOnLight(timerIndex)">
						<!-- 定时器 -->
						<image v-if="timer.turnOnLight" :src="'./images/clock-active.png'" />
						<image v-else :src="'./images/clock.png'" />
					</view>
				</view>
			</view>
		</view>
		<!-- 时间选择器 -->
		<u-datetime-picker v-model="dateTime" :show="isShowTimerDateDialog" :close-on-click-overlay="true" :min-date="0"
			:max-date="new Date().getTime()" mode="time" :confirm-text="$t('confirm')" :cancel-text="$t('cancel')"
			@cancel="isShowTimerDateDialog = false" @close="isShowTimerDateDialog = false"
			@confirm="confirmTimersDate" />

		<!-- 性别选择器 -->
		<u-popup :show.sync="isShowWeekDateDialog" round="20px" mode="bottom" @close="isShowWeekDateDialog = false">
			<view class="week-panel">
				<text
					class="week-panel__title week-panel__border">{{ $t('atmosphereLightPage.timerSettings.chooseWeek') }}</text>
				<view class="week-panel-options">
					<text v-for="option in weekOptions" :key="option.key"
						:class="['week-panel-option', tempWeekOptions.includes(option.key) ? 'selected' : '']"
						@click="toggleWeekOption(option)">
						{{ option.title }}
					</text>
				</view>
				<text class="week-panel__confirm" @click="confirmTimersWeek">
					{{ $t('confirm') }}
				</text>
			</view>
		</u-popup>
	</PageLayout>
</template>

<script>
	import PageLayout from '@/components/page-layout'
	import {

		mapState
	} from 'pinia'
	import {
		calcSum,
		wData,
		outNowTimeStr
	} from '../BLE/BLEfunction'
	import {
		useDeviceStore
	} from '../../../store/device'
	export default {
		name: 'TimerSetting',
		components: {
			PageLayout
		},
		data() {
			return {
				// 获取定时器配置
				timers: [],
				// 编辑相关
				// 修改Timer的弹窗
				isShowTimerDateDialog: false,
				currentEditingTimerIndex: '',
				dateTime: '',
				// 修改一周的弹窗
				isShowWeekDateDialog: false,
				currentEditingDateIndex: '',
				tempWeekOptions: [],
				weekOptionText: ['Sunday', 'Saturday', 'Friday', 'Thursday', 'Wednesday', 'Tuesday', 'Monday'],
				deviceStore: useDeviceStore(),
				// 每周的选项
			}
		},
		computed: {
			...mapState(useDeviceStore, ['currentTimerArr', 'currentDevice']),
			// 每周的选项
			weekOptions() {
				return [{
						key: 'Monday',
						title: this.$t('atmosphereLightPage.timerSettings.Monday')
					},
					{
						key: 'Tuesday',
						title: this.$t('atmosphereLightPage.timerSettings.Tuesday')
					},
					{
						key: 'Wednesday',
						title: this.$t('atmosphereLightPage.timerSettings.Wednesday')
					},
					{
						key: 'Thursday',
						title: this.$t('atmosphereLightPage.timerSettings.Thursday')
					},
					{
						key: 'Friday',
						title: this.$t('atmosphereLightPage.timerSettings.Friday')
					},
					{
						key: 'Saturday',
						title: this.$t('atmosphereLightPage.timerSettings.Saturday')
					},
					{
						key: 'Sunday',
						title: this.$t('atmosphereLightPage.timerSettings.Sunday')
					}
				]
			}
		},

		mounted() {
			this.getTimerSetting()
		},

		methods: {
			// ...mapActions('device', ['setCurrentTimer']),
			getTimerSetting() {

				let special = uni.getStorageSync("chairInfo")
				const specialDeviceArr = JSON.parse(special).timerChange ? JSON.parse(special).timerChange : [
					// "GTZ-510-RGB", 'DL005'
				]
				const model = this.currentDevice && this.currentDevice.model
				if (specialDeviceArr.includes(model)) {
					this.timers = JSON.parse(JSON.stringify(this.currentTimerArr)).length ? [JSON.parse(JSON.stringify(this
						.currentTimerArr))[0]] : []
				} else {
					this.timers = JSON.parse(JSON.stringify(this.currentTimerArr))
				}
			},
			dateText(date) {
				const temp = date.split(':')[0]
				return temp < 12 ? this.$t('atmosphereLightPage.timerSettings.Morning') : this.$t(
					'atmosphereLightPage.timerSettings.Afternoon')
			},

			handleWeekText(weekOptions) {
				if (weekOptions.length === 7) return this.$t('atmosphereLightPage.timerSettings.Everyday')

				return this.weekOptions
					// 先过滤出来
					.filter(weekOption => weekOptions.includes(weekOption.key))
					.map(item => item.key)
					.map(item => {
						return this.$t(`atmosphereLightPage.timerSettings.${item}Abbreviation`)
					}).join(', ')
			},

			// 切换定时器状态
			switchTimerStatus(index) {
				this.timers[index].status = !this.timers[index].status
				this.deviceStore.setCurrentTimer({
					currentTimer: this.timers[index],
					index
				})
				this.sendFn(index)
			},

			// 展示Timer的日期弹窗
			showTimerDateDialog(index) {
				this.currentEditingTimerIndex = index;
				this.isShowTimerDateDialog = true
			},
			// 确定选择timer时间
			confirmTimersDate(result) {
				const index = this.currentEditingTimerIndex
				this.timers[index].date = result.value
				this.isShowTimerDateDialog = false
				this.deviceStore.setCurrentTimer({
					currentTimer: this.timers[index],
					index
				})
				this.sendFn(index)
			},

			// 展示Week的日期弹窗
			showTimerWeekDialog(index) {
				this.currentEditingTimerIndex = index;
				// 赋值当前的weekOptions
				this.tempWeekOptions = [...this.timers[index].weekOptions];
				this.isShowWeekDateDialog = true
			},

			// 周的类型
			toggleWeekOption(weekOption) {
				const weekOptionIndex = this.tempWeekOptions.findIndex(item => item === weekOption.key);
				// 如果他存在，就删除
				if (weekOptionIndex > -1) {
					this.tempWeekOptions.splice(weekOptionIndex, 1)
				} else {
					this.tempWeekOptions.push(weekOption.key)
				}
			},

			// 确定选择timer日期
			confirmTimersWeek() {
				if (this.tempWeekOptions.length === 0) return
				const index = this.currentEditingTimerIndex
				this.timers[index].weekOptions = [...this.tempWeekOptions]
				this.isShowWeekDateDialog = false
				this.tempWeekOptions = []
				this.deviceStore.setCurrentTimer({
					currentTimer: this.timers[index],
					index
				})
				this.sendFn(index)
			},

			// 切换当前灯的状态
			toggleTurnOnLight(index) {
				// 切换当前切换灯的状态
				this.timers[index].turnOnLight = !this.timers[index].turnOnLight
				this.deviceStore.setCurrentTimer({
					currentTimer: this.timers[index],
					index
				})
				this.sendFn(index)
			},
			sendCalcDate() {
				let tempData = ''
				tempData = calcSum(`1014${outNowTimeStr()}`)
				wData(tempData, sres => {
					console.log('sendFnSuc', sres)
				}, err => {
					console.log('sendFnErr', err)
				}, )
			},
			sendFn(index) {
				// 每次执行定时任务都需要校准
				this.sendCalcDate()
				setTimeout(() => {
					console.log(this.timers[index])
					//hugo todo 此处应该在校准确认之后调用，求快先用400代替
					let tempData = ''
					const now = new Date();
					const year = Number(now.getFullYear().toString().slice(-2)).toString(16).padStart(2, '0');
					const month = (now.getMonth() + 1).toString(16).padStart(2, '0');
					const date = now.getDate().toString(16).padStart(2, '0');
					const hour = Number(this.timers[index].date.split(':')[0]).toString(16).padStart(2, '0')
					const min = Number(this.timers[index].date.split(':')[1]).toString(16).padStart(2, '0')
					const sec = '00'
					const weekArr = this.timers[index].weekOptions
					const arr = [0, 0, 0, 0, 0, 0, 0, 0]
					weekArr.forEach(el => {
						const index2 = this.weekOptionText.findIndex(i => {
							return i === el
						})
						arr[index2 + 1] = 1
					})
					if (weekArr.length > 1) {
						arr[0] = 1
					}
					const tempWeek = parseInt(arr.join(''), 2).toString(16).padStart(2, '0').toUpperCase()
					let tempMode = ''
					if (this.timers[index].active) {
						if (this.timers[index].turnOnLight) {
							tempMode = '01'
						} else {
							tempMode = '02'
						}
					} else {
						tempMode = '03'
					}
					tempData = calcSum(
						`130${index + 1}14${year}${month}${date}${hour}${min}${sec}${tempWeek}${tempMode}`)
					wData(tempData, sres => {
						console.log('sendFnSuc', sres)
					}, err => {
						console.log('sendFnErr', err)
					}, )
				}, 400)
			}
		}


	}
</script>

<style lang="scss" scoped>
	.timer-setting {
		background: #F7F7F7;
		min-height: 100vh;
		position: relative;
		padding: 32rpx;

		.timer {
			padding: 32rpx;
			border-radius: 16rpx;
			margin-top: 32rpx;
			background: #fff;

			&__period {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding-bottom: 20rpx;
				border-bottom: 2rpx solid #E2E2E2;
			}

			&-bottom {
				padding-top: 24rpx;
				display: flex;
				align-items: center;
				justify-content: space-between;
			}

			&__detail {
				color: #333;
				font-size: 28rpx;
			}

			&__date {
				display: flex;
				align-items: center;
				font-size: 32rpx;

				image {
					width: 60rpx;
					height: 60rpx;
					margin-right: 20rpx;
				}
			}

			&__week {
				display: flex;
				font-size: 32rpx;
				align-items: center;
				margin-top: 30rpx;

				image {
					width: 60rpx;
					height: 60rpx;
					margin-right: 20rpx;
				}
			}

			&__cover {
				border-radius: 16rpx;

				image {
					width: 96rpx;
					height: 96rpx;
				}

				// &.active {
				//     border: unset;
				//     background: linear-gradient(360deg, #4D4D4D 0%, #303030 100%);
				// }
			}

			&.active {
				.timer__detail {
					color: #333;
				}
			}
		}

	}
</style>