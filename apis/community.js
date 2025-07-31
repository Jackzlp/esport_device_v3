/**
 * @description 社区相关
 * @param {*} http
 * @returns
 */
export default function(http) {
	return {
		// 获取社区列表
		getCommunityList: params => http.get('/community', params),
		getShopDisplay: id => http.get(`/community/${id}/site_display`),
		getBannerList: params => http.get('/banner', params),
		getPostTypeList: params => http.get('/post_type', params),
		getPostList: params => http.get('/post', params),
		publishPost: params => http.post('/post', params),
		getRelation: id => http.get(`/follow/relation/${id}`),
		hiddenPost: (id, params) => http.put(`/post/${id}`, params),
		editPost: (params, id) => http.put(`/post/${id}`, params),
		deletPost: id => http.delete(`/post/${id}`),
		topOptionPost: (id, params) => http.put(`/post/top/${id}`, params),
		handleLikes: params => http.post('/postLike', params),
		getPostDetail: params => http.get(`/post/${params}`),
		updateComment: params => http.post('/post/comment', params),
		getCommentList: params => http.get('/post/comment', params),
		getMoreReply: params => http.get('/post/comment/moreReply', params),
		getUploadSign: params => http.get('/get_aws_sign', params),
		getShopUrl: params => http.get('/shopify/redirect_url', params),
		sharePost: params => http.post('/post/share', params),
		activePost: () => http.post('/user/active'),
		getVerSion: params => http.get('/app_version/latest', params),
		getUnreadCount: () => http.get('/message/unread_count'),
		blockMan: params => http.post('/block_list', params),
		getBlacklist: () => http.get('/block_list'),
		cancelBlock: params => http.delete('/block_list', params),
		//等待实现
		deleteComment: id => http.delete(`/post/comment/${id}`),
		searchUsers: params => http.get('/search/userList', params)
	}
}