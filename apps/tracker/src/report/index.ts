// 9.实现埋点报告
export const report = async (url: string, body: any) => {
    // sendBeacon 发送 Blob 时 NestJS body parser 无法正确解析 JSON
    // 改用 fetch + keepalive，兼顾页面卸载时也能成功发送
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        keepalive: true,
        headers: { 'Content-Type': 'application/json' }
    }).catch(() => {}) // 静默失败，不影响页面
}


export const reportFetch = async (url: string, body: any) => {
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        keepalive: true,
        headers: {
            'Content-Type': 'application/json'
        }
    })
    return response.json()
}