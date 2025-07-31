/**
 * @description 社区相关
 * @param {*} http
 * @returns
 */
export default function (http) {
    return {
        // 获取我发布的post
        getMyPost: params => http.get('/post/my', params),

        // 获取我的关注列表
        getMyFollows: params => http.get('/follow', params),

        // 获取我的粉丝列表
        getMyFans: params => http.get('/fans', params)
    }
}

