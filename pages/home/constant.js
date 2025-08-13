// const baseImageAPI = 'https://mp-f4d3e28c-4ed0-473b-b8e3-6d224490cf79.cdn.bspapp.com/cloudstorage/device'
// const appVersion = uni.getSystemInfoSync().appVersion
// const appVersion = uni.getSystemInfoSync().appVersion
// 'http://clould.chinachairsfactory.com/device'
let temString = uni.getStorageSync('changeUrl')
const baseImageAPI = temString ? temString : 'http://clould.chinachairsfactory.com/device'

export const DEVICE_OPTIONS = {
	2: {
		cover: (type) => {
			// let temp = getImagewithModel(model)
			return 'https://lynck.s3.us-west-2.amazonaws.com/device/scooter/scooter-small.png'
			// return require('@images/device/scooter-small.png')
		},
		displayType: 'devices.scooter',
		route: '/pages/device/scooter/index',
		showPower: false // 有没有电源
	},
	1: {
		cover: (model) => {
			let temp = getImagewithModel(model)
			return temp != '' ? temp :
				`https://lynck.s3.us-west-2.amazonaws.com/device/desks/atmosphere-light.png`

			// if (!model) {
			// 	return temp != '' ? temp :
			// 		`https://lynck.s3.us-west-2.amazonaws.com/device/desk/atmosphere-light.png`

			// 	// return `${baseImageAPI}/atmosphere-light-small.png`
			// 	// return require('@images/device/atmosphere-light-small.png')
			// } else {
			// 	return temp != '' ? temp :
			// 		'https://lynck.s3.us-west-2.amazonaws.com/device/desk/atmosphere-light.png'
			// 	// return `${baseImageAPI}/${model}-shadow.png`
			// 	// return require(`@images/device/${model}-small.png`)
			// }
		},
		withShadow: (model = '') => {
			let temp = getImagewithModel(model)
			return temp != '' ? temp :
				`https://lynck.s3.us-west-2.amazonaws.com/device/desks/atmosphere-light.png`

			// if (!model) {
			// 	return `${baseImageAPI}/atmosphere-light-small.png`
			// 	// return require('@images/device/atmosphere-light-small.png')
			// } else {
			// 	return `${baseImageAPI}/${model}-shadow.png`
			// 	// return require(`@images/device/${model}-shadow.png`)
			// }
		},
		displayType: 'devices.atmosphereLight',
		route: '/pages/device/atmosphereLight/index',
		showPower: true // 有没有电源
	},

	3: {
		cover: (model = 'Unknown') => {
			let temp = getImagewithModel(model)
			return temp != '' ? temp :
				`https://lynck.s3.us-west-2.amazonaws.com/device/chairs/Unknown-shadow.png`
			// let temp = model
			// if (!temp) temp = 'Unknown'
			// return `${baseImageAPI}/esport-chair/${temp}-shadow.png`
			// return require(`@images/device/esport-chair/${temp}-small.png`)
		},
		withShadow: (model = 'Unknown') => {
			let temp = getImagewithModel(model)

			return temp != '' ? temp :
				`https://lynck.s3.us-west-2.amazonaws.com/device/chairs/Unknown-shadow.png`
			// let temp = model
			// if (!temp) temp = 'Unknown'
			// return `${baseImageAPI}/esport-chair/${temp}-shadow.png`
			// return require(`@images/device/esport-chair/${temp}-shadow.png`)
		},
		displayType: 'devices.esportChair',
		route: '/pages/device/esportChair/index',
		showPower: false // 有没有电源
	},
	4: {
		cover: (model = 'Unknown') => {

			let temp = getImagewithModel(model)
			return temp != '' ? temp : 'https://lynck.s3.us-west-2.amazonaws.com/device/couch/H7135-shadow.png'

			// if (temp != 'Unknown') {
			// 	return `${baseImageAPI}/esport-chair/${temp}-shadow.png`
			// }
			// return `${baseImageAPI}/boxInfo.png`

		},
		displayType: 'devices.heartRate',
		route: '/pages/device/heartRate/index',
		showPower: false // 有没有电源
	},
	5: {
		cover: (type) => {
			return "https://lynck.s3.us-west-2.amazonaws.com/device/treadmill/Treadmills.png"
			// return require('@images/device/Treadmills.png')
		},
		displayType: 'devices.Treadmills',
		route: '/pages/device/Treadmills/TreadmillsCeterPage',
		showPower: false // 有没有电源
	},
	6: {
		cover: (model = 'Unknown') => {
			let temp = getImagewithModel(model)
			return temp != '' ? temp :
				`https://lynck.s3.us-west-2.amazonaws.com/device/chairs/Unknown-shadow.png`
			// let temp = model
			// if (!temp) temp = 'Unknown'
			// return `${baseImageAPI}/esport-chair/${temp}-shadow.png`
			// return require(`@images/device/esport-chair/${temp}-small.png`)
		},
		withShadow: (model = 'Unknown') => {
			let temp = getImagewithModel(model)
			console.log(temp, model)

			return temp != '' ? temp :
				`https://lynck.s3.us-west-2.amazonaws.com/device/chairs/Unknown-shadow.png`
			// let temp = model
			// if (!temp) temp = 'Unknown'
			// return `${baseImageAPI}/esport-chair/${temp}-shadow.png`
			// return require(`@images/device/esport-chair/${temp}-shadow.png`)
		},
		displayType: 'devices.massager',
		route: '/pages/device/massager/index',
		showPower: false // 有没有电源
	},
	7: {
		cover: (model = 'Unknown') => {
			let temp = getImagewithModel(model)
			return temp != '' ? temp :
				`https://lynck.s3.us-west-2.amazonaws.com/device/chairs/Unknown-shadow.png`
			// let temp = model
			// if (!temp) temp = 'Unknown'
			// return `${baseImageAPI}/esport-chair/${temp}-shadow.png`
			// return require(`@images/device/esport-chair/${temp}-small.png`)
		},
		withShadow: (model = 'Unknown') => {
			let temp = getImagewithModel(model)
			compareVersions()
			return temp != '' ? temp :
				`https://lynck.s3.us-west-2.amazonaws.com/device/chairs/Unknown-shadow.png`
			// let temp = model
			// if (!temp) temp = 'Unknown'
			// return `${baseImageAPI}/esport-chair/${temp}-shadow.png`
			// return require(`@images/device/esport-chair/${temp}-shadow.png`)
		},
		displayType: 'devices.homeAppliances',
		route: '/pages/device/homeAppliances/index',
		showPower: false // 有没有电源
	}
}



function getImagewithModel(model) {
	let temp = uni.getStorageSync('detcetList')
	if (model === '' || model === 'Unknown') {
		return ''
	}

	if (temp) {
		let list = JSON.parse(temp)

		let index = list.findIndex(item => {
			return item.model === model
		})
		// console.log(list)
		// console.log(index, model)
		if (index != -1) {
			if (compareVersions()) {

				if (list[index].pic_v2 && list[index].pic_v2.length) {
					return list[index].pic_v2
				} else {
					return list[index].pic
				}
			}
			// console.log(list[index].pic)
			return list[index].pic
		}
		console.log("修改了")
		return ''
	}
	return ''
}

function compareVersions() {
	let nextVersion = uni.getSystemInfoSync().appVersion
	// console.log(currentVersion)
	let currentVersion = '1.5.2'

	const regex = new RegExp(`[.]`, 'g');
	let current = parseInt(currentVersion.replace(regex, ''))
	let next = parseInt(nextVersion.replace(regex, ''))
	// console.log(current, next)
	return current <= next;
}


// export const DEVICE_OPTIONS = {
// 	2: {
// 		cover: (type) => {
// 			return require('@images/device/scooter-small.png')
// 		},
// 		displayType: 'devices.scooter',
// 		route: '/pages/device/scooter/index',
// 		showPower: false // 有没有电源
// 	},
// 	1: {
// 		cover: (model) => {
// 			if (!model) {
// 				return require('@images/device/atmosphere-light-small.png')
// 			} else {
// 				return require(`@images/device/${model}-small.png`)
// 			}

// 		},
// 		withShadow: (model = '') => {
// 			if (!model) {
// 				return require('@images/device/atmosphere-light-small.png')
// 			} else {
// 				return require(`@images/device/${model}-shadow.png`)
// 			}
// 		},
// 		displayType: 'devices.atmosphereLight',
// 		route: '/pages/device/atmosphereLight/index',
// 		showPower: true // 有没有电源
// 	},

// 	3: {
// 		cover: (model = 'Unknown') => {
// 			let temp = model
// 			if (!temp) temp = 'Unknown'
// 			return require(`@images/device/esport-chair/${temp}-small.png`)
// 		},
// 		withShadow: (model = 'Unknown') => {
// 			let temp = model

// 			if (!temp) temp = 'Unknown'

// 			return require(`@images/device/esport-chair/${temp}-shadow.png`)
// 		},
// 		displayType: 'devices.esportChair',
// 		route: '/pages/device/esportChair/index',
// 		showPower: false // 有没有电源
// 	},
// 	4: {
// 		cover: (type) => {
// 			return require('@images/device/boxInfo.png')
// 		},

// 		displayType: 'devices.heartRate',
// 		route: '/pages/device/heartRate/index',
// 		showPower: false // 有没有电源
// 	},
// 	5: {
// 		cover: (type) => {
// 			return require('@images/device/Treadmills.png')
// 		},

// 		displayType: 'devices.Treadmills',
// 		route: '/pages/device/Treadmills/TreadmillsCeterPage',
// 		showPower: false // 有没有电源
// 	}
// }