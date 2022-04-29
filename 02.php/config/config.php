<?php
/*
 * @Author: witersen
 * @Date: 2022-04-29 19:17:37
 * @LastEditors: witersen
 * @LastEditTime: 2022-04-29 20:09:02
 * @Description: QQ:1801168257
 */

/*
 * 数据库信息
 */
define("DB_TYPE", "mysql");
define("DB_HOST", "localhost");
define("DB_PORT", "3306");
define("DB_USER", "数据库用户名");
define("DB_PASSWORD", "数据库用户名对应的密码");
define("DB_NAME", "数据库名");
define("DB_CHARSET", "utf8");

/*
 * jwt的token模式中的签名
 */
define("SIGNATURE", "U8JWEFK9WEF8WE8923TK");

class Config
{
    /**
     * 请求超时时间设置
     * 可根据实时的网络状态自行调整
     * 单位：秒
     */
    public static $requestTimeout =  array(
        "curl_request" => 5, //正常模式 主请求的超时等待时间
    );

    /**
     * 小程序配置
     */
    public static $appid = "填写你的小程序appid";
    public static $secret = "填写你的小程序密钥";

    /**
     * 小程序接口无需校验白名单
     */
    public static $miniWhiteFunction = array(
        'GetTokenByCode'
    );

    /**
     * 管理系统接口无需鉴权白名单
     */
    public static $webWhiteFunction = array(
        'Login',
        'GetQrInfo',
        'GetQrStatus'
    );
}
