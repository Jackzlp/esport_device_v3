/**
 * @description 社区相关
 * @param {*} http
 * @returns
 */
export default function (http) {
    return {
        // 获取消息列表
        getMessageList: params => http.get('/message', params),
        // 一键已读
        readAllMessage: params => http.put('/message/read_all', params),

        // 获取官方消息
        getOfficialMessage: params => http.get(`/message/${params.id}`)
    }
}

