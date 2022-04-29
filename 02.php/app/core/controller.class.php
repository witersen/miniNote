<?php
/*
 * @Author: witersen
 * @Date: 2022-04-29 19:17:37
 * @LastEditors: witersen
 * @LastEditTime: 2022-04-29 20:09:42
 * @Description: QQ:1801168257
 */

/*
 * 控制器基类，所有的控制器都要继承此类
 */

//require model
require_once BASE_PATH . '/app/model/connModel.class.php';

//require controller
require_once BASE_PATH . '/app/controller/account.class.php';
require_once BASE_PATH . '/app/controller/classs.class.php';
require_once BASE_PATH . '/app/controller/login.class.php';
require_once BASE_PATH . '/app/controller/note.class.php';
require_once BASE_PATH . '/app/controller/recyclebin.class.php';
require_once BASE_PATH . '/app/controller/tag.class.php';

//require function
require_once BASE_PATH . '/app/function/curl.function.php';
require_once BASE_PATH . '/app/function/array.function.php';

//require extension
require_once BASE_PATH . '/extension//PHPQRCode/phpqrcode.php';

class Controller
{

    public $database;
    public $thisUserName;
    public $thisUserId;
    public $thisWechatId;

    function __construct()
    {
        //数据库连接
        $this->database = (new connModel())->GetConn();

        //非白名单接口请求
        if (GlobalType == 'web') {
            //通过带有用户id的token获取用户名和id信息
            $this->thisUserName = $this->GetUserNameByToken();
            $this->thisUserId = $this->GetUserIdByToken();
        } else if (GlobalType == 'mini') {
            //通过带有openid的token获取微信用户id
            $this->thisWechatId = $this->GetWechatIdByToken();
        }
    }

    /**
     * 预操作 检查token
     */
    final function PreHandler()
    {
        /**
         * 小程序接口和web接口
         */
        if (GlobalType === "mini") {
            //无需鉴权
            if (in_array(GlobalAction, Config::$miniWhiteFunction)) {
                return true;
            }
            //需要鉴权 只查询该token是否在数据库有记录 不进行有效性和过期校验
            $result = $this->database->get("wechatUser", ["wechatUserId"], ["wechatUserToken" => GlobalToken]);
            if ($result == null) {
                return false;
            }
        } else if (GlobalType == "web") {
            //无需鉴权
            if (in_array(GlobalAction, Config::$webWhiteFunction)) {
                return true;
            }
            //需要鉴权 进行有效性和过期校验
            $data = $this->CheckToken(GlobalToken);
            if ($data['code'] != '200') {
                return false;
            }
        } else {
            //未知接口类型 鉴权不通过
            return false;
        }
        return true;
    }

    /**
     * 检查token
     */
    final function CheckToken($token)
    {
        if (!isset($token) || empty($token)) {
            $data['code'] = '400';
            $data['message'] = '非法请求';
            return $data;
        }
        //对比token
        $explode = explode('.', $token); //以.分割token为数组
        if (!empty($explode[0]) && !empty($explode[1]) && !empty($explode[2]) && !empty($explode[3])) {
            $info = $explode[0] . '.' . $explode[1] . '.' . $explode[2]; //信息部分
            $true_signature = hash_hmac('md5', $info, SIGNATURE); //正确的签名
            if (time() > $explode[2]) {
                $data['code'] = '401';
                $data['message'] = 'Token已过期,请重新登录';
                return $data;
            }
            if ($true_signature == $explode[3]) {
                $data['code'] = '200';
                $data['message'] = 'Token合法';
                return $data;
            } else {
                $data['code'] = '400';
                $data['message'] = 'Token不合法';
                return $data;
            }
        } else {
            $data['code'] = '400';
            $data['message'] = 'Token不合法';
            return $data;
        }
    }

    /**
     * 使用openid为微信用户生成token
     * 或使用userid为web用户生成token
     */
    final function CreateToken($openidOruserid)
    {
        $time = time();
        $end_time = time() + 86400;
        $info = $openidOruserid . '.' . $time . '.' . $end_time; //设置token过期时间为一天
        //根据以上信息信息生成签名（密钥为 siasqr)
        $signature = hash_hmac('md5', $info, SIGNATURE);
        //最后将这两部分拼接起来，得到最终的Token字符串
        return $token = $info . '.' . $signature;
    }

    /**
     * 根据token获取用户id(web用户)
     */
    final function GetUserIdByToken()
    {
        $explode = explode('.', GlobalToken);
        return $explode[0];
    }

    /**
     * 根据token获取用户名(web用户)
     */
    final function GetUserNameByToken()
    {
        $explode = explode('.', GlobalToken);
        $result = $this->database->get("webUser", ["webUserName"], ["webUserId" => $explode[0]]);
        return $result == null ? '' : $result['webUserName'];
    }

    /**
     * 根据token获取微信用户id(小程序用户)
     */
    final function GetWechatIdByToken()
    {
        $result = $this->database->get("wechatUser", ["wechatUserId"], ["wechatUserToken" => GlobalToken]);
        return $result == null ? '' : $result['wechatUserId'];
    }
}
