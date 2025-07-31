export default class BirthdayReminder {
	constructor(birthday) {
		this.birthday = new Date(birthday); // 生日日期，Date 对象
		this.storageKeyPrefix = 'birthdayReminder_'; // 用于存储标记的键前缀
		this.loadStoredStates(); // 加载存储的状态
		this.currentYear = new Date().getFullYear(); // 当前年份
	}
	// 加载存储的状态
	loadStoredStates() {
		const twoWeeksKey = this.storageKeyPrefix + 'hasShownTwoWeeksReminder';
		const oneWeekKey = this.storageKeyPrefix + 'hasShownOneWeekReminder';

		this.hasShownTwoWeeksReminder = uni.getStorageSync(twoWeeksKey) === 'true';
		this.hasShownOneWeekReminder = uni.getStorageSync(oneWeekKey) === 'true';
	}
	// 保存状态到存储
	saveStates() {
		const twoWeeksKey = this.storageKeyPrefix + 'hasShownTwoWeeksReminder';
		const oneWeekKey = this.storageKeyPrefix + 'hasShownOneWeekReminder';
		uni.setStorageSync(twoWeeksKey, this.hasShownTwoWeeksReminder.toString());
		uni.setStorageSync(oneWeekKey, this.hasShownOneWeekReminder.toString());
	}


	// 获取从今天到生日之间的天数（考虑闰年）
	getDaysUntilBirthday() {
		const today = new Date();
		let thisYearBirthday = new Date(this.currentYear, this.birthday.getMonth(), this.birthday.getDate());
		var daysLeft;

		if (today >= thisYearBirthday) {
			// 如果今年的生日已经过了，计算到明年的生日
			thisYearBirthday = new Date(this.currentYear + 1, this.birthday.getMonth(), this.birthday.getDate());
		}
		daysLeft = (thisYearBirthday - today) / (1000 * 60 * 60 * 24); // 转换为天数

		return Math.ceil(Math.abs(daysLeft)); // 返回天数的绝对值并向上取整
	}

	// 检查是否应该显示提醒，并返回提醒的类型或 null
	checkReminder() {


		const daysLeft = this.getDaysUntilBirthday();
		const isWithinTwoWeeksButMoreThanOneWeek = daysLeft <= 14 && daysLeft > 7;
		const isWithinOneWeek = daysLeft <= 7 && daysLeft >= 0;

		var shouldShow = false;
		var type;

		if (isWithinTwoWeeksButMoreThanOneWeek && !this.hasShownTwoWeeksReminder) {
			this.hasShownTwoWeeksReminder = true;
			shouldShow = true;
			type = 'twoWeeks';
		} else if (isWithinOneWeek && !this.hasShownOneWeekReminder) {
			this.hasShownOneWeekReminder = true;
			shouldShow = true;
			type = 'oneWeek';
		}

		// 保存状态
		this.saveStates();

		return {
			show: shouldShow,
			type: type
		};
	}

	// 重置标记以便下一年使用
	resetFlagsForNextYear() {

		this.hasShownTwoWeeksReminder = false;
		this.hasShownOneWeekReminder = false;
		this.saveStates();
	}
}