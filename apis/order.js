/**
 * @description 社区相关
 * @param {*} http
 * @returns
 */
export default function (http) {
    return {
        // app启动页
        getOrders: params => http.get('/user/orders', params)
    }
}

