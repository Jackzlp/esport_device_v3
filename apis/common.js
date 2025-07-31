/**
 * @description 社区相关
 * @param {*} http
 * @returns
 */
export default function(http) {
	return {
		// app启动页
		getAppLaunchedPage: params => http.get('/app_start_page', params),
		uploadFireApi: params => http.post('/upload', params),
		uploadTreadApi: params => http.post('/tread_run/upload', params),
		getMydata: params => http.get('/tread_run/getmydata', params),
		getMonthData: params => http.get('/tread_run/getrankmonth', params),
		getTotalData: params => http.get('/tread_run/getranktotal', params),
		getProduct: parmas => http.get('/product', parmas),
		postCid: params => http.post('/device', params),
		getCid: user_id => http.get(`/device/${user_id}`),
		getHomenBanner: params => http.get('/devicebanner', params),
		
		//心率相关接口
		getbodyInfoList:params => http.get('/body_info',params),
		createbodyInfo:params => http.post('/body_info',params),
		editbodyInfo: (id, params) => http.put(`/body_info/${id}`, params),
		deletebodyInfo:(id) => http.delete(`/body_info/${id}`),
		createBodyRecord:params =>http.post('/body_record',params),
		getBodyRecordList:params =>http.get('/body_record',params)
	}
}