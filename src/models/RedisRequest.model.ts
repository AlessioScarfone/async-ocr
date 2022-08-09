export default interface RedisRequestModel {
    //requestId
    key: string,
    value: {
        url: string,
        lang: string
    }
}