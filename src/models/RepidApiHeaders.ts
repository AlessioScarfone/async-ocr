/**
 * Headers sent from the RapidAPI Proxy to your API
 * https://docs.rapidapi.com/docs/additional-request-headers
 */
export default class RapidApiHeaders {
    public static readonly proxySecret = "X-RapidAPI-Proxy-Secret";
    public static readonly user = "X-RapidAPI-User";
    public static readonly subscription = "X-RapidAPI-Subscription";
    public static readonly versione = "X-RapidAPI-Version";
    public static readonly forwarded = "X-Forwarded-For";
}