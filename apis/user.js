/**
 * @description 跟用户相关的，就放这里
 * @param {*} http
 * @returns
 */
export default function(http) {
	return {
		// 获取二维码
		getRegisterCode: params => http.post('/user/register/code', params),
		thirdLogin: params => http.post('/user/third/login', params),
		bindThird: params => http.post('/user/third/bind', params),
		unbindThird: params => http.post('/user/third/unbind', params),
		bindThirdEmail: (id, params) => http.post(`/user/third/bind/${id}`, params),

		// 注册用户
		registerUser: params => http.post('/user/register', params),

		// 用户登录
		userLogin: params => http.post('/user/login', params),

		// 用户信息
		getUserInfo: params => http.get('/user/info', params),

		// 更新用户信息
		updateUserInfo: params => http.put('/user', params),

		// 修改密码
		changePassword: params => http.put('/user/changePasswd', params),

		// 忘记密码
		forgotPassword: params => http.put('/user/forgetPasswd', params),

		// 获取忘记密码的验证码
		getForgotPasswordCode: params => http.get('/user/forgetPasswd/code', params),

		// 获取他人用户信息
		getOtherUserInfo: params => http.get(`/user/info/${params.userId}`),

		// 绑定社区
		bindCommunity: params => http.put('/user/community', params),

		// 回馈
		postFeedback: params => http.post('/user/feedback', params),

		// 退出登陆
		userLogout: params => http.post('/user/login_out', params),
		deleteUser: () => http.delete('/user'),


		// 游客登陆
		touristModeLogin: params => http.post('/visitor/login', params),
		//三方登录
		thirdSDK: params => http.get('/third/sdk', params),
		//亚马逊获取
		amszonLogin: params => http.get('/amazon/profile', params),
		//头像
		avatars: params => http.get('/avatar', params),
		//快速登录
		loginQuick: params => http.post('/user/third/loginquick', params)



	}
}