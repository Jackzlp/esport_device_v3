/**
 * @description 社区相关
 * @param {*} http
 * @returns
 */
export default function (http) {
    return {

        // 获取其他人的post
        getOtherUsersPost: params => http.get(`/post/list/${params.userId}`),

        // 获取其他人的关注列表
        getOtherUserFollows: params => http.get(`/${params.userId}/follow`, params),

        // 获取其他人的粉丝列表
        getOtherUserFans: params => http.get(`/${params.userId}/fans`, params),
        handleFollow: (id, params) => http.post(`/follow/${id}`, params)
    }
}

