/**
 * @description 社区相关
 * @param {*} http
 * @returns
 */
export default function (http) {
    return {
        // 获取分类列表
        getHelpCenterCategory: params => http.get('/help_center_category/all', params),

        // 获取内容列表
        getCategoryContentList: params => http.get('/help_center_content/all', params),

        // 获取内容
        getContentDetail: params => http.get(`/help_center_content/${params.id}`, params)
    }
}

