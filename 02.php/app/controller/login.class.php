<?php
/*
 * @Author: witersen
 * @Date: 2022-04-29 19:17:37
 * @LastEditors: witersen
 * @LastEditTime: 2022-04-29 20:09:29
 * @Description: QQ:1801168257
 */

class Login extends Controller
{
    function __construct()
    {
        /*
         * 避免子类的构造函数覆盖父类的构造函数
         */
        parent::__construct();

        /*
         * 其它自定义操作
         */
    }

    /**
     * [web]web用户登录
     */
    function Login($requestPayload)
    {
        $result = $this->database->get('webUser', [
            'webUserId',
            'webUserRoleId',
            'webUserName',
            'webUserPass',
            'webUserCreateTime',
            'webUserLastLoginTime'
        ], [
            'webUserName' => $requestPayload['userName'],
            'webUserPass' => $requestPayload['userPass'],
        ]);

        if ($result == null) {
            $data['status'] = 0;
            $data['message'] = '登陆失败';
            return $data;
        } else {
            //记录登陆时间
            $this->database->update('webUser', [
                'webUserLastLoginTime' => date('Y-m-d H:i:s')
            ], [
                'webUserId' => $result['webUserId'],
            ]);
            $data['status'] = 1;
            $data['message'] = '登录成功';
            $data['userId'] = $result['webUserId'];
            $data['userName'] = $result['webUserName'];
            $data['userAvatar'] = '';
            $data['userRoleType'] = 1;
            $data['userRoleName'] = '系统管理员';
            $data['token'] = parent::CreateToken($result['webUserId']);
            return $data;
        }
    }

    /**
     * [web]web端请求新的QR信息
     */
    function GetQrInfo($requestPayload)
    {
        $qrContent = time() . mt_rand(0, 99) . mt_rand(100, 999) . rand(1000, 9999);

        //拼接文件名
        $fileName = $this->thisUserId . '.' . $qrContent . '.png';

        //服务器本地文件路径
        $localFilePath = BASE_PATH . '/data/qrcode/' . $fileName;

        //生成二维码到文件
        QRcode::png(json_encode([
            'qrContent' => $qrContent
        ]), $localFilePath, 0, 10, 4);

        //读取图片到base64
        $imageInfo = getimagesize($localFilePath);
        $base64 = "data:{$imageInfo['mime']};base64," . chunk_split(base64_encode(file_get_contents($localFilePath)));

        //将信息写入数据库
        $this->database->insert('qr', [
            'qrContent' => $qrContent,
            'qrCreateTime' => time(),
            'qrValidTime' => 20,
            'wechatUserToken' => ''
        ]);

        $data['status'] = 1;
        $data['message'] = '成功';
        $data['data'] = ['imgBase64' => $base64, 'qrContent' => $qrContent];
        return $data;
    }

    /**
     * [web]web端请求查询QR状态
     * 
     * status：
     * 0 qr信息不存在
     * 
     * data：
     * 1 qr过期
     * 2 qr未被扫码
     * token qr已被扫码登录
     * 
     * (登录时重置所有加密便签的解锁状态为已经上锁)
     */
    function GetQrStatus($requestPayload)
    {
        $qrContent = $requestPayload['qrContent'];

        $result = $this->database->get('qr', [
            '[>]wechatUser' => [
                'wechatUserToken' => 'wechatUserToken'
            ]
        ], [
            'qr.qrId',
            'qr.qrContent',
            'qr.qrCreateTime',
            'qr.qrValidTime',
            'qr.wechatUserToken',
            'wechatUser.wechatUserId',
            'wechatUser.wechatUserNickname',
            'wechatUser.wechatUserAvatarUrl',
        ], [
            'qr.qrContent' => $qrContent
        ]);

        if ($result == null) {
            $data['status'] = 0;
            $data['message'] = 'qr信息不存在';
            return $data;
        }

        if (time() > $result['qrCreateTime'] + $result['qrValidTime']) {
            $data['status'] = 1;
            $data['message'] = 'qr已过期';
            $data['data'] = 1;
            return $data;
        } else {
            if ($result['wechatUserToken'] == '') {
                $data['status'] = 1;
                $data['message'] = 'qr未被扫码登录';
                $data['data'] = 2;
                return $data;
            } else {
                //更新登陆时间
                $this->database->update('wechatUser', [
                    'wechatUserLastLoginTime' => date('Y-m-d H:i:s')
                ], [
                    'wechatUserId' => $result['wechatUserId']
                ]);
                //重置加密的笔记为上锁状态
                $this->database->update('note', [
                    'noteLockStatus' => 1
                ], [
                    'noteBelongUserId' => $result['wechatUserId']
                ]);
                $data['status'] = 1;
                $data['message'] = '登录成功';
                $data['userId'] = $result['wechatUserId'];
                $data['userName'] = $result['wechatUserNickname'];
                $data['userAvatar'] = $result['wechatUserAvatarUrl'];
                $data['userRoleType'] = 0;
                $data['userRoleName'] = '微信小程序用户';
                $data['token'] = $result['wechatUserToken'];
                return $data;
            }
        }
    }

    /**
     * [mini]小程序授权登录
     */
    function GetTokenByCode($requestPayload)
    {
        $code = trim($requestPayload['code']);

        if (empty($code)) {
            $data['status'] = 0;
            $data['message'] = '参数不完整';
            return $data;
        }

        $requestUrl = "https://api.weixin.qq.com/sns/jscode2session?appid=" . Config::$appid . "&secret=" . Config::$secret . "&js_code=" . $code . "&grant_type=authorization_code";
        $result = curl_request($requestUrl);

        $result = json_decode($result, true);

        $openid = $result['openid'];
        $token = parent::CreateToken($openid);

        $info = $this->database->get('wechatUser', ['wechatUserId'], ['wechatUserOpenid' => $openid]);

        if ($info == null) {
            $this->database->insert('wechatUser', [
                'wechatUserOpenid' => $openid,
                'wechatUserToken' => $token,
                'wechatUserRegTime' => date('Y-m-d H:i:s')
            ]);
        } else {
            $this->database->update('wechatUser', [
                'wechatUserToken' => $token,
            ], [
                'wechatUserOpenid' => $openid
            ]);
            //更新登陆时间
            $this->database->update('wechatUser', [
                'wechatUserLastLoginTime' => date('Y-m-d H:i:s')
            ], [
                'wechatUserId' => $info['wechatUserId']
            ]);
            //重置加密的笔记为上锁状态
            $this->database->update('note', [
                'noteLockStatus' => 1
            ], [
                'noteBelongUserId' => $info['wechatUserId']
            ]);
        }

        $data['status'] = 1;
        $data['message'] = '获取token成功';
        $data['data'] = $token;
        return $data;
    }

    /**
     * [mini]保存用户头像和昵称信息到后端
     */
    function setWechatuserAvatarNickname($requestPayload)
    {
        $this->database->update("wechatUser", [
            "wechatUserAvatarUrl" => $requestPayload['wechatUserAvatarUrl'],
            "wechatUserNickname" => $requestPayload['wechatUserNickname'],
        ], [
            "wechatUserId" => $this->thisWechatId
        ]);

        //返回
        $data['status'] = 1;
        $data['message'] = '保存成功';
        return $data;
    }

    /**
     * [mini]小程序端扫码请求
     * 
     * status：
     * 0 qr信息不存在
     * 
     * data：
     * 1 qr过期
     * 2 扫码登录成功
     * 3 qr已被扫码登录
     */
    function ScanQr($requestPayload)
    {
        $scanResult = json_decode($requestPayload['scanResult'], true);
        if ($scanResult != null && array_key_exists('qrContent', $scanResult)) {
            $qrContent = $scanResult['qrContent'];
        } else {
            $data['status'] = 0;
            $data['message'] = '二维码无效';
            return $data;
        }

        $result = $this->database->get('qr', [
            'qrId',
            'qrContent',
            'qrCreateTime',
            'qrValidTime',
            'wechatUserToken'
        ], [
            'qrContent' => $qrContent
        ]);

        if ($result == null) {
            $data['status'] = 0;
            $data['message'] = 'qr信息不存在';
            return $data;
        }

        if (time() > $result['qrCreateTime'] + $result['qrValidTime']) {
            $data['status'] = 1;
            $data['message'] = 'qr已过期';
            $data['data'] = 1;
            return $data;
        } else {
            if ($result['wechatUserToken'] == '') {
                //写入用户信息
                $this->database->update('qr', [
                    'wechatUserToken' => GlobalToken
                ], [
                    'qrContent' => $qrContent
                ]);
                //登录成功
                $data['status'] = 1;
                $data['message'] = '扫码登录成功';
                $data['data'] = 2;
                return $data;
            } else {
                $data['status'] = 1;
                $data['message'] = 'qr已被扫码登录';
                $data['data'] = 3;
                return $data;
            }
        }
    }
}
