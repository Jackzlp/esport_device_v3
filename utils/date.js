//当前时间转时间戳（秒级）
export function currentTimeToTimestamp() {
	return Date.parse(new Date()) / 1000;
}
//时间戳转当前时间
function TimeStampToLocalTime(timeStamp) {
	if (!timeStamp) {
		return ""
	}

}

export function formatDateValue(value) {

	if (value === '') {

		return ''
	}
	var date = new Date(value)
	let year = date.getFullYear();
	let month = (date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1);
	let day = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
	let hour = date.getHours();
	let minute = date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes();
	let second = date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds();
	return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
}

export function formartCurrentTime(value) {
	var date = new Date();

	date.setDate(date.getDate() - value)
	let year = date.getFullYear();
	let month = (date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1);
	let day = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
	let hour = date.getHours();
	let minute = date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes();
	let second = date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds();
	return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
}


export function getQuanxian(title, content) {
	let platform = uni.getSystemInfoSync().platform; //首先判断app是安卓还是ios
	let notice = uni.getStorageSync('openNotice')
	if (platform == "ios") { //这里是ios的方法

		var UIApplication = plus.ios.import("UIApplication");
		var app = UIApplication.sharedApplication();
		var enabledTypes = 0;
		if (app.currentUserNotificationSettings) {
			var settings = app.currentUserNotificationSettings();
			enabledTypes = settings.plusGetAttribute("types");
			if (enabledTypes == 0) { //如果enabledTypes = 0 就是通知权限没有开启
				if (notice && currentTimeToTimestamp() - notice > 259200) { //259200

					uni.setStorageSync('openNotice', currentTimeToTimestamp())
					uni.showModal({
						title: title,
						content: content,
						success: res => {
							if (res.confirm) {
								openTongZhi()
							} else if (res.cancel) {

							}
						}
					});
				} else {
					uni.setStorageSync('openNotice', currentTimeToTimestamp())
				}

			} else {
				// uni.showToast({
				// 	title: '已开启',
				// 	icon: "none"
				// })
			}
		}
		plus.ios.deleteObject(settings);
	} else if (platform == "android") { //下面是安卓的方法
		requestPermission()
		// console.log("我是安卓", plus.android);
		var main = plus.android.runtimeMainActivity();
		var pkName = main.getPackageName();
		var uid = main.getApplicationInfo().plusGetAttribute("uid");
		var NotificationManagerCompat = plus.android.importClass(
			"android.support.v4.app.NotificationManagerCompat"
		);
		//android.support.v4升级为androidx
		if (NotificationManagerCompat == null) {
			NotificationManagerCompat = plus.android.importClass(
				"androidx.core.app.NotificationManagerCompat"
			);
		}
		var areNotificationsEnabled =
			NotificationManagerCompat.from(main).areNotificationsEnabled();
		// console.log(areNotificationsEnabled);
		// 未开通‘允许通知’权限，则弹窗提醒开通，并点击确认后，跳转到系统设置页面进行设置
		// if (!areNotificationsEnabled) {
		// 	this.tongzhi = true; //这里也一样未开启权限，弹出弹窗
		// }

		if (areNotificationsEnabled) {

		} else {
			requestPermission()
			// if (!notice || currentTimeToTimestamp() - notice > 259200) { //259200
			// 	uni.setStorageSync('openNotice', currentTimeToTimestamp())
			// 	uni.showModal({
			// 		title: title,
			// 		content: content,
			// 		success: res => {
			// 			if (res.confirm) {
			// 				openTongZhi()
			// 			} else if (res.cancel) {
			// 				console.log('用户点击取消');
			// 			}
			// 		}
			// 	});
			// }
		}
	}
}

function requestPermission() {
	const Build = plus.android.importClass("android.os.Build");
	console.log(Build.VERSION.SDK_INT)
	if (Build.VERSION.SDK_INT >= 33) {
		plus.android.requestPermissions(
			["android.permission.POST_NOTIFICATIONS"],
			(resultObj) => {
				// console.log(resultObj);
				// console.log(Build.VERSION.SDK_INT)
			},
			(error) => {
				console.log("申请权限错误：" + error.code + " = " + error.message);
			}
		);
	}
}

function openTongZhi() { //弹窗按钮绑定方法


	let platform = uni.getSystemInfoSync().platform; //获取安卓还是ios
	if (platform == "ios") { //如果机型是ios，ios由于权限问题，可能需要手动开启

		var app = plus.ios.invoke('UIApplication', 'sharedApplication');
		var setting = plus.ios.invoke('NSURL', 'URLWithString:', 'app-settings:');
		plus.ios.invoke(app, 'openURL:', setting);
		plus.ios.deleteObject(setting);
		plus.ios.deleteObject(app);

	} else if (platform == "android") { //如果机型是安卓
		var main = plus.android.runtimeMainActivity();
		var pkName = main.getPackageName();
		var uid = main.getApplicationInfo().plusGetAttribute("uid");
		var Intent = plus.android.importClass("android.content.Intent");
		var Build = plus.android.importClass("android.os.Build");
		//android 8.0引导
		if (Build.VERSION.SDK_INT >= 26) { //判断安卓系统版本
			var intent = new Intent("android.settings.APP_NOTIFICATION_SETTINGS");
			intent.putExtra("android.provider.extra.APP_PACKAGE", pkName);
		} else if (Build.VERSION.SDK_INT >= 21) { //判断安卓系统版本
			//android 5.0-7.0
			var intent = new Intent("android.settings.APP_NOTIFICATION_SETTINGS");
			intent.putExtra("app_package", pkName);
			intent.putExtra("app_uid", uid);
		} else {
			//(<21)其他--跳转到该应用管理的详情页
			intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
			var uri = Uri.fromParts(
				"package",
				mainActivity.getPackageName(),
				null
			);
			intent.setData(uri);
		}
		// 跳转到该应用的系统通知设置页
		main.startActivity(intent);
	}
}