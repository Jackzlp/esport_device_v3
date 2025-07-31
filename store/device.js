// store/device.js
import {
	defineStore
} from 'pinia'
import {
	setStorageSync,
	getStorageSync
} from '@/utils'

const DEVICE_CACHE_LIST = 'DEVICE_CACHE_LIST'
const BODYINFO_KEY = 'BODYINFO_KEY'

const defaultData = [{
		type: 2,
		name: '滑板车'
	},
	{
		type: 1,
		name: '氛围灯'
	},
	{
		type: 1,
		name: '氛围灯'
	},
	{
		type: 3,
		name: '电竞椅'
	},
	{
		type: 4,
		name: '心率检测'
	}
]

export const useDeviceStore = defineStore('device', {
	// 状态定义
	state: () => ({
		brightness: 0,
		speed: 0,
		otherBleData: {
			batteryTemperature: 0,
			currentVoltage: 1,
			currentUnit: 'Km',
			firstGearSpeed: '12',
			secondGearSpeed: '16',
			thirdGearSpeed: '26',
			currentA: 0,
			tempJoinData: ''
		},
		devMode: false,
		audioContextAlreadySign: false,
		changeStatus: false,
		IOSMusicList: getStorageSync('ios_music_list') || [],
		connecting: false,
		deviceList: getStorageSync(DEVICE_CACHE_LIST) || [],
		currentDevice: null,
		activeDeviceId: '',
		currentTimerArr: [{
				active: true,
				weekOptions: ['Monday'],
				date: '14:30',
				turnOnLight: true
			},
			{
				active: false,
				weekOptions: ['Monday'],
				date: '16:30',
				turnOnLight: true
			},
			{
				active: true,
				weekOptions: ['Monday'],
				date: '14:30',
				turnOnLight: false
			},
			{
				active: false,
				weekOptions: ['Monday'],
				date: '16:30',
				turnOnLight: false
			},
			{
				active: true,
				weekOptions: ['Monday'],
				date: '14:30',
				turnOnLight: true
			},
			{
				active: false,
				weekOptions: ['Monday'],
				date: '16:30',
				turnOnLight: false
			}
		],
		channel_id: 'jfEntestgdszmyidltd',
		channel_secret: 'NL9%5JctVi&Q',
		bodyInfo: getStorageSync(BODYINFO_KEY) || []
	}),

	// 动作（等同于Vuex的actions）
	actions: {
		// 通用状态设置
		setState([name, value]) {
			this[name] = value
		},

		// 同步设备列表到本地存储
		syncDeviceStorage(deviceList) {
			this.deviceList = deviceList
			setStorageSync(DEVICE_CACHE_LIST, deviceList)
		},

		// 同步定时器设置
		syncCurrentTimer([currentTimer, index]) {
			this.currentTimerArr[index] = currentTimer
		},

		// 设置亮度
		setBrightness(res) {
			this.brightness = res
		},

		// 设置速度
		setSpeed(res) {
			this.speed = res
		},

		// 保存用户身体信息
		setUserBodyInfo(params) {
			this.bodyInfo = params
			setStorageSync(BODYINFO_KEY, params)
		},

		// 设置BLE数据
		setOtherBleData(res) {
			for (const key in res) {
				if (res.hasOwnProperty(key)) {
					this.otherBleData[key] = res[key]
				}
			}
		},

		// 设置当前激活的设备ID
		setActiveDeviceId(id) {
			this.activeDeviceId = id
		},

		// 保存设备开关状态
		saveDevOpen(type) {
			this.devMode = type
		},

		// 设置当前设备
		setCurrentDevice(device) {
			this.currentDevice = device
		},

		// 设置当前设备版本
		setCurrentDeviceVersion(version) {
			this.bLEversion = version
		},

		// 设置当前设备类型
		setCurrentDeviceType(type) {
			this.deviceInfo = type
		},

		// 保存状态变更
		saveChangeStatus(type) {
			this.changeStatus = type
		},

		// 保存连接状态
		saveConnecting(type) {
			this.connecting = type
		},

		// 保存iOS音乐列表
		saveIosMusicList(arr) {
			this.IOSMusicList = arr
			setStorageSync('ios_music_list', arr)
		},

		// 设置音频上下文状态
		setAudioContextAlreadySign(Boolean) {
			this.audioContextAlreadySign = Boolean
		},

		// 获取设备列表
		getDeviceList() {
			const deviceList = getStorageSync(DEVICE_CACHE_LIST) || []
			// this.setState(['deviceList', deviceList])
			this.deviceList = deviceList
		},

		// 设置设备开关
		setDevOpen(type) {
			this.saveDevOpen(type)
		},

		// 获取用户身体信息
		getUserBodyInfo() {
			const bodyInfo = getStorageSync(BODYINFO_KEY) || []
			// this.setState(['bodyInfo', bodyInfo])
			this.bodyInfo = bodyInfo
		},

		// 设置用户身体信息
		setBoydyInfo(params) {
			this.setUserBodyInfo(params)
		},

		// 设置状态变更
		setChangeStatus(type) {
			this.saveChangeStatus(type)
		},

		// 设置连接状态
		setConnecting(type) {
			this.saveConnecting(type)
		},

		// 添加设备
		addDeviceList(device) {
			const deviceList = this.deviceList
			const index = deviceList.findIndex(el => {
				return device.deviceId === el.deviceId
			})
			if (index < 0) {
				deviceList.push(device)
			} else {
				deviceList[index] = device
			}
			this.syncDeviceStorage(deviceList)
		},

		// 保存当前设备
		saveCurrentDevice(device) {
			this.setCurrentDevice(device)
		},

		// 保存当前设备版本
		saveCurrentDeviceVersion(version) {
			this.setCurrentDeviceVersion(version)
		},

		// 保存当前设备类型
		saveCurrentDeviceType(type) {
			this.setCurrentDeviceType(type)
		},

		// 删除设备
		deleteDevice(device) {
			const deviceList = this.deviceList
			const index = deviceList.findIndex(item => item.deviceId === device.deviceId)
			if (index >= 0) {
				deviceList.splice(index, 1)
				this.syncDeviceStorage(deviceList)
			}
		},

		// 同步定时器
		setCurrentTimer({
			currentTimer,
			index
		}) {
			this.syncCurrentTimer([currentTimer, index])
		}
	}
})