import i18n from '@/locales'

const isAndroid = uni.getSystemInfoSync().platform === 'android';

const deviceObjInfo = {
	deviceId: '',
	serviceId: '',
	notifyCharacteristicId: '',
	characteristicId: ''
};

let successCallBack = null;
let failCallBack = null;
let getBLEDataSuccess = null;
let getBLEDataFail = null;
let devices = [];
let currentServiceId = '';
let currentCharacteristicId = '';


// Cache for device filtering
// 使用Map替代Set，提高查找性能
const SERVICE_UUIDS = new Map([
	['0000AF30-0000-1000-8000-00805F9B34FB', true],
	['0000FD50-0000-1000-8000-00805F9B34FB', true],
	['0000FEFF-0000-1000-8000-00805F9B34FB', true],
	['00001826-0000-1000-8000-00805F9B34FB', true],
	['6E403900-B5A3-F393-E0A9-E50E24DCCA9E', true],
	['0000FFFE-0000-1000-8000-00805F9B34FB', true],
	['0000AF32-0000-1000-8000-00805F9B34FB', true]
]);


// Pre-compiled regex for hex string processing
const HEX_REGEX = /[\da-f]{2}/gi;

function getBLEData({
	success,
	fail
}) {
	getBLEDataSuccess = success;
	getBLEDataFail = fail;
}

function readData(deviceId, serviceId, characteristicId, sc, fc) {
	uni.readBLECharacteristicValue({
		deviceId,
		serviceId,
		characteristicId,
		success: sc,
		fail: fc
	});
}

function wData2(str, deviceId, serviceId, characteristicId, sc, fc) {
	const buffer = hexStringToBuffer(str);

	// #ifdef APP-PLUS
	uni.writeBLECharacteristicValue({
		deviceId,
		serviceId,
		characteristicId,
		value: buffer,
		success: sc,
		fail: fc
	});
	// #endif
}

function readDataNew(str, sc, fc) {
	const buffer = hexStringToBuffer(str);
	uni.readBLECharacteristicValue({
		deviceId: deviceObjInfo.deviceId,
		serviceId: deviceObjInfo.serviceId,
		characteristicId: deviceObjInfo.characteristicId,
		value: buffer,
		success: sc,
		fail: fc
	});
}

function wData3(buffer, sc, fc) {
	uni.writeBLECharacteristicValue({
		deviceId: deviceObjInfo.deviceId,
		serviceId: deviceObjInfo.serviceId,
		characteristicId: deviceObjInfo.characteristicId,
		value: buffer,
		success: sc,
		fail: fc
	});
}

function wData(str, sc, fc) {
	const buffer = hexStringToBuffer(str);
	uni.writeBLECharacteristicValue({
		deviceId: deviceObjInfo.deviceId,
		serviceId: deviceObjInfo.serviceId,
		characteristicId: deviceObjInfo.characteristicId,
		value: buffer,
		success: sc,
		fail: fc
	});
}

function setCallBackFn({
	suc,
	fail
}) {
	successCallBack = suc;
	failCallBack = fail;
}

function initBLEdevice({
	success,
	fail
}) {
	setCallBackFn({
		suc: success,
		fail
	});
	devices = [];
	currentServiceId = '';
	currentCharacteristicId = '';

	uni.openBluetoothAdapter({
		success: res => {
			console.log(res, '蓝牙初始化成功1');
			NoticeConnection();
			uni.getBluetoothAdapterState({ //蓝牙的匹配状态
				success: res1 => {
					console.log(res1, '“本机设备的蓝牙已打开”')
					startBluetoothDeviceDiscovery()
				},
				fail(error) {
					fail('getBluetoothAdapterState', error)
				}
			});
			// checkBluetoothState(startBluetoothDeviceDiscovery, fail);
		},
		fail: err => {
			fail('openBluetoothAdapter', err);
		}
	});
}

function initBLEdevice2(success, fail) {
	uni.openBluetoothAdapter({
		success: res => {
			console.log(res, '蓝牙初始化成功2');
			NoticeConnection();
			checkBluetoothState(success, fail);
		},
		fail: err => {
			fail('openBluetoothAdapter', err);
		}
	});
}

function checkBluetoothState(success, fail) {
	uni.getBluetoothAdapterState({
		success: res1 => {
			console.log(res1, '本机设备的蓝牙已打开');
			success(res1);
		},
		fail: error => {
			fail('getBluetoothAdapterState', error);
		}
	});
}

function getConnectedBluetoothDevices(success, fail) {
	uni.getConnectedBluetoothDevices({
		services: [
			'0000AE31-0000-1000-8000-00805F9B34FB',
			'00007001-0000-1000-8000-00805F9B34FB',
			'0000AE30-0000-1000-8000-00805F9B34FB',
			'00001826-0000-1000-8000-00805F9B34FB',
			'6E403900-B5A3-F393-E0A9-E50E24DCCA9E',
			'0000FFFE-0000-1000-8000-00805F9B34FB',
			'0000AE32-0000-1000-8000-00805F9B34FB'
		],
		success,
		fail
	});
}

function NoticeConnection() {
	console.log('开始监听蓝牙状态1');
	uni.onBLEConnectionStateChange(res => {
		console.log('开始监听蓝牙状态2', res);
		if (!res.connected) {
			console.log('连接已断开');
			setTimeout(() => {
				uni.switchTab({
					url: '/pages/home/index'
				});
			}, 500);

			uni.showToast({
				icon: 'none',
				title: i18n.$t('bluetoothHintRelate.linkFailedReconnect')
			});
			closeBluetoothAdapter();
		}
	});
}

function stopBluetoothDevicesDiscovery() {
	uni.stopBluetoothDevicesDiscovery({
		success: e => {
			console.log(`停止搜索蓝牙设备:${e.errMsg}`);
		},
		fail: e => {
			console.log(`停止搜索蓝牙设备失败，错误码：${e.errCode}`);
		}
	});
}

function startBluetoothDeviceDiscovery() {
	uni.startBluetoothDevicesDiscovery({
		allowDuplicatesKey: isAndroid ? false : true,
		success: res => {
			console.log(res);
			setupDeviceFoundListener();
		},
		fail: err => {
			console.log(err, '错误信息');
			failCallBack('startBluetoothDevicesDiscovery', err);
		}
	});
}

function setupDeviceFoundListener() {

	uni.onBluetoothDeviceFound(res => {
		if (devices.indexOf(res.devices[0].deviceId) === -1) {
			const device = filterDevice(res.devices[0])
			if (device) {
				devices.push(device)
			}
			successCallBack('search', devices)
		}
	})
	// uni.onBluetoothDeviceFound(res => {
	// 	if (!devices.some(d => d.deviceId === res.devices[0].deviceId)) {
	// 		const device = filterDevice(res.devices[0]);
	// 		if (device) {
	// 			devices.push(device);
	// 			successCallBack('search', devices);
	// 		}
	// 	}
	// });
}
// function onBluetoothDeviceFound() {
// 	uni.onBluetoothDeviceFound(res => {
// 		if (devices.indexOf(res.devices[0].deviceId) === -1) {
// 			const device = filterDevice(res.devices[0])
// 			if (device) {
// 				devices.push(device)
// 				// console.log('devices', devices)
// 			}
// 			successCallBack('search', devices)
// 		}
// 	})
// }

function filterDevice(device) {
	// Check service UUIDs first
	if (device.advertisServiceUUIDs &&
		device.advertisServiceUUIDs.some(uuid => SERVICE_UUIDS.has(uuid))) {
		return device;
	}
	// Check advertiser data if no matching service UUIDs
	if (device.advertisData) {
		const tempData = ab2hex(device.advertisData);
		if (tempData.slice(4, 12) === '14170713') {
			return device;
		}
	}
	return false;
}

function createBLEConnection(deviceObj) {
	Object.assign(deviceObjInfo, deviceObj);
	console.log(deviceObj);
	const connectTimeout = isAndroid ? 12000 : 10000;
	uni.createBLEConnection({
		deviceId: deviceObj.deviceId,
		timeout: connectTimeout,
		success: res => {
			console.log('蓝牙连接成功', res);
			// Reduced delay for service discovery
			const delay = isAndroid ? 3000 : 1000;
			refreshGattCache(deviceObj.deviceId, () => {
				getBLEDeviceServices()
			})
		},
		fail: err => {
			console.log('蓝牙连接失败', err);
			failCallBack('createBLEConnection', err);
		}
	});
}

function outNowTimeStr() {
	const now = new Date();
	const year = Number(now.getFullYear().toString().slice(-2)).toString(16).padStart(2, '0');
	const month = (now.getMonth() + 1).toString(16).padStart(2, '0');
	const date = now.getDate().toString(16).padStart(2, '0');
	const hours = now.getHours().toString(16).padStart(2, '0');
	const minutes = now.getMinutes().toString(16).padStart(2, '0');
	const seconds = now.getSeconds().toString(16).padStart(2, '0');
	let week = now.getDay().toString(16).padStart(2, '0');
	week = week === '00' ? '07' : week;
	return `${year}${month}${date}${hours}${minutes}${seconds}${week}`;
}

function getBLEDeviceServices(retryCount = 0) {
	const MAX_RETRIES = 3;
	const DELAY = 1100 * (retryCount + 1); // 1s, 2s, 3s

	console.log(`[Service Discovery] 尝试获取服务 (${retryCount + 1}/${MAX_RETRIES})`);

	uni.getBLEDeviceServices({
		deviceId: deviceObjInfo.deviceId,
		success: (res) => {
			if (res.services && res.services.length > 0) {
				console.log('[成功] 发现服务列表:', res.services.map(s => s.uuid));

				// 查找目标服务
				const targetService = res.services.find(s =>
					s.uuid.toLowerCase() === deviceObjInfo.serviceId.toLowerCase()
				);

				if (targetService) {
					currentServiceId = targetService.uuid;
					setTimeout(() => {
						stopBluetoothDevicesDiscovery();
						getBLEDeviceCharacteristics();
					}, 1100)

				} else {
					console.warn('[警告] 未找到目标服务，使用第一个服务作为备用');
					currentServiceId = res.services[0].uuid;
					deviceObjInfo.serviceId = res.services[0].uuid; // 动态调整目标UUID
					getBLEDeviceCharacteristics();
				}
			} else {
				console.warn('[警告] 服务列表为空');
				if (retryCount < MAX_RETRIES - 1) {
					console.log(`等待 ${DELAY}ms 后重试...`);
					setTimeout(() => {
						refreshGattCache(deviceObjInfo.deviceId, () => {
							getBLEDeviceServices(retryCount + 1);
						});
					}, DELAY);
				} else {
					// closeConnect()

					failCallBack('getBLEDeviceServices', '无法获取服务列表');
				}
			}
		},
		fail: (err) => {
			console.error('[失败] 获取服务错误:', err);
			if (retryCount < MAX_RETRIES - 1) {
				setTimeout(() => getBLEDeviceServices(retryCount + 1), DELAY);
			} else {
				failCallBack('getBLEDeviceServices', err);
			}
		}
	});
}

function closeConnect() {
	uni.closeBLEConnection({
		deviceId: deviceObjInfo.deviceId,
		success() {
			console.log('蓝牙适配器已关闭');
		},
		fail(err) {
			console.log('关闭蓝牙适配器失败', err);
		}
	});
}

// function getBLEDeviceServices() {

// 	uni.getBLEDeviceServices({
// 		deviceId: deviceObjInfo.deviceId,
// 		success: res => {
// 			console.log('device services:', res);
// 			const targetService = res.services.find(item =>
// 				deviceObjInfo.serviceId.toLowerCase() === item.uuid.toLowerCase()
// 			);

// 			if (targetService) {
// 				currentServiceId = targetService.uuid;
// 				console.log('拿到目标service', targetService);
// 				successCallBack('getBLEDeviceServices', deviceObjInfo.deviceId);
// 				setTimeout(() => {
// 					stopBluetoothDevicesDiscovery();
// 					getBLEDeviceCharacteristics();
// 				}, 1000)

// 			} else {
// 				failCallBack('getBLEDeviceServices', 'Service not found', deviceObjInfo.deviceId);
// 			}
// 		},
// 		fail: err => {
// 			console.log('获取蓝牙的所有服务失败', err);
// 			failCallBack('getBLEDeviceServices', err, deviceObjInfo.deviceId);
// 		}
// 	});
// }

function refreshGattCache(deviceId, callback) {
	// #ifdef APP-PLUS
	if (plus.os.name === 'Android') {
		try {
			const BluetoothAdapter = plus.android.importClass('android.bluetooth.BluetoothAdapter');
			const adapter = BluetoothAdapter.getDefaultAdapter();
			if (adapter) {
				const device = adapter.getRemoteDevice(deviceId);
				if (device) {
					// 修正后的反射调用方式
					const clazz = plus.android.invoke(device, 'getClass');
					const refreshMethod = plus.android.invoke(clazz, 'getMethod', 'refresh');
					plus.android.invoke(refreshMethod, 'invoke', device);
					console.log('GATT缓存刷新成功');
					setTimeout(callback, 800); // 延迟确保刷新生效
					return;
				}
			}
		} catch (e) {
			console.error('GATT缓存刷新失败（降级处理）:', e);
		}
	}
	// #endif
	callback(); // 非Android或失败时降级处理
}

function getBLEDeviceCharacteristics() {
	if (!currentServiceId) {
		failCallBack('getBLEDeviceCharacteristics', '未找到正确的Characteristics');
		return;
	}

	uni.getBLEDeviceCharacteristics({
		deviceId: deviceObjInfo.deviceId,
		serviceId: currentServiceId,
		success: res => {
			console.log('特征getBLEDeviceCharacteristics', res);
			const targetChar = res.characteristics.find(item =>
				deviceObjInfo.characteristicId.toLowerCase() === item.uuid.toLowerCase()
			);

			if (targetChar) {
				currentCharacteristicId = targetChar.uuid;
				res.deviceId = deviceObjInfo.deviceId;
				successCallBack('getBLEDeviceCharacteristics', res, deviceObjInfo.deviceId);
				notifyBLECharacteristicValueChange();
			} else {
				failCallBack('getBLEDeviceCharacteristics', 'Characteristic not found', deviceObjInfo
					.deviceId);
			}
		},
		fail: err => {
			failCallBack('getBLEDeviceCharacteristics', err, deviceObjInfo.deviceId);
		}
	});
}

function notifyBLECharacteristicValueChange() {
	if (!currentCharacteristicId) {
		failCallBack('notifyBLECharacteristicValueChange', '未找到正确的characteristicId');
		return;
	}

	uni.notifyBLECharacteristicValueChange({
		state: true,
		deviceId: deviceObjInfo.deviceId,
		serviceId: currentServiceId,
		characteristicId: deviceObjInfo.notifyCharacteristicId,
		success: res => {
			console.log('notifyBLECharacteristicValueChange success', res.errMsg);
			onBLECharacteristicValueChange();
		},
		fail: err => {
			failCallBack('notifyBLECharacteristicValueChange', err, deviceObjInfo.deviceId);
		}
	});
}

function onBLECharacteristicValueChange() {
	uni.onBLECharacteristicValueChange(res => {
		getBLEDataSuccess(res);
	});
}

function closeBluetoothAdapter() {
	uni.closeBluetoothAdapter({
		success: res => {
			console.log('closeBluetoothAdapter', res);
		},
		fail: err => {
			console.log('closeBluetoothAdapter', err);
		}
	});
}

// Helper functions
function hexStringToBuffer(str) {
	const typedArray = new Uint8Array(str.match(HEX_REGEX).map(h => parseInt(h, 16)));
	return typedArray.buffer;
}

function ab2hex(buffer) {
	return Array.from(new Uint8Array(buffer))
		.map(bit => (`00${bit.toString(16)}`).slice(-2))
		.join('');
}

function ab3hex(buffer) {
	return Array.from(new Uint16Array(buffer))
		.map(bit => bit.toString(16).padStart(4, '0'))
		.join('');
}

// Checksum calculation functions remain the same as original
function calcSum(val, pre = 'AA550101') {
	const str = pre + String(val);
	const hexArray = str.match(/.{1,2}/g);
	let sum = hexArray.reduce((acc, val2) => acc + parseInt(val2, 16), 0);
	sum = sum.toString(16).padStart(4, '0');
	return str + sum + '55AA';
}

function calcSum6(val, pre = 'AA550501', trail = '000000000000') {
	const str = pre + String(val) + trail;
	const hexArray = str.match(/.{1,2}/g);
	let sum = hexArray.reduce((acc, val2) => acc + parseInt(val2, 16), 0);
	sum = sum.toString(16).padStart(4, '0');
	return str + sum + '55AA';
}

function calcSum2(val, pre = '55aa00') {
	const str = pre + String(val);
	const hexArray = str.match(/.{1,2}/g);
	let sum = hexArray.reduce((acc, val2) => acc + parseInt(val2, 16), 0);
	sum = (sum % 256).toString(16).padStart(2, '0');
	return str + sum;
}

function calcSum3(val, pre = 'FF55') {
	const hexStr = pre + String(val);
	let result = 0;
	for (let i = 0; i < hexStr.length; i += 2) {
		result ^= parseInt(hexStr.substr(i, 2), 16);
	}
	return hexStr + result.toString(16).padStart(2, '0').toUpperCase();
}

function calcSum4(val, pre, tail) {
	const hexStr = String(val) + pre + tail;
	let result = 0;
	for (let i = 0; i < hexStr.length; i += 2) {
		result ^= parseInt(hexStr.substr(i, 2), 16);
	}
	return hexStr + result.toString(16).padStart(2, '0').toUpperCase();
}

function calcSum5(val, pre, tail) {
	let type = val.toString(16).padStart(2, '0');
	const hexStr = type + pre + tail;
	let result = 0;
	for (let i = 0; i < hexStr.length; i += 2) {
		result ^= parseInt(hexStr.substr(i, 2), 16);
	}
	return hexStr;
}

export {
	initBLEdevice,
	createBLEConnection,
	getBLEData,
	wData,
	wData2,
	calcSum,
	calcSum2,
	calcSum3,
	calcSum4,
	calcSum5,
	calcSum6,
	closeBluetoothAdapter,
	outNowTimeStr,
	stopBluetoothDevicesDiscovery,
	getConnectedBluetoothDevices,
	setCallBackFn,
	initBLEdevice2,
	ab2hex,
	readData,
	ab3hex,
	readDataNew,
	wData3
};