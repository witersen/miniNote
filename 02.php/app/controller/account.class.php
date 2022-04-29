<?php
/*
 * @Author: witersen
 * @Date: 2022-04-29 19:17:37
 * @LastEditors: witersen
 * @LastEditTime: 2022-04-29 20:09:21
 * @Description: QQ:1801168257
 */

class Account extends Controller
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
     * [web]管理员获取所有微信用户列表
     */
    function GetWechatUserList($requestPayload)
    {
        $pageSize = $requestPayload['pageSize'];
        $currentPage = $requestPayload['currentPage'];
        $wechatSearchKeywords = trim($requestPayload['wechatSearchKeywords']);

        //分页
        $begin = $pageSize * ($currentPage - 1);
        //查询
        $list = $this->database->select('wechatUser', [
            'wechatUserId',
            'wechatUserNickname',
            'wechatUserAvatarUrl',
            'wechatUserRegTime',
            'wechatUserOpenid',
            'wechatUserLastLoginTime',
        ], [
            'AND' => [
                'OR' => [
                    "wechatUserNickname[~]" => $wechatSearchKeywords,
                ],
            ],
            'LIMIT' => [$begin, $pageSize]
        ]);
        //便签数量
        foreach ($list as $key => $value) {
            $noteCount = $this->database->count('note', [
                'noteBelongUserId' => $value['wechatUserId'],
                'isInRecyclebin' => 1
            ]);
            $list[$key]['noteCount'] = $noteCount;
        }
        //计数
        $total = $this->database->count('wechatUser', [
            'AND' => [
                'OR' => [
                    'wechatUserNickname[~]' => $wechatSearchKeywords,
                ],
            ],
        ]);

        //返回
        $data['status'] = 1;
        $data['message'] = '成功';
        $data['data'] = $list;
        $data['total'] = $total;
        return $data;
    }

    /**
     * [web]管理员修改个人密码
     */
    function EditAdminInfo($requestPayload)
    {
        if ($requestPayload['webUserPass'] != $requestPayload['webUserPassConfirm']) {
            $data['status'] = 0;
            $data['message'] = '新密码不一致';
            return $data;
        }
        $result =  $this->database->update('webUser', [
            'webUserPass' => $requestPayload['webUserPass'],
        ], [
            'webUserId' => $this->thisUserId
        ]);

        $data['status'] = 1;
        $data['message'] = '成功';
        return $data;
    }

    /**
     * [mini]微信用户获取隐私密码设置情况
     * 
     * status:
     * 0 无此用户
     * 
     * data:
     * 1 未设置过密码
     * 2 设置过密码
     */
    function GetPrivatePassInfo($requestPayload)
    {
        $result = $this->database->get('wechatUser', [
            'wechatUserEncrptPass'
        ], [
            'wechatUserId' => $this->thisWechatId
        ]);
        if ($result['wechatUserEncrptPass'] == '' || $result['wechatUserEncrptPass'] == null) {
            $data['status'] = 1;
            $data['message'] = '成功';
            $data['data'] = 1;
            return $data;
        } else {
            $data['status'] = 1;
            $data['message'] = '成功';
            $data['data'] = 2;
            return $data;
        }
    }

    /**
     * [mini]微信用户初次设置隐私密码
     */
    function InitPrivatePass($requestPayload)
    {
        if ($requestPayload['wechatUserEncrptPass'] != $requestPayload['wechatUserEncrptPassConfirm']) {
            $data['status'] = 0;
            $data['message'] = '密码不匹配';
            return $data;
        }
        $result =  $this->database->update('wechatUser', [
            'wechatUserEncrptPass' => $requestPayload['wechatUserEncrptPass'],
        ], [
            'wechatUserId' => $this->thisWechatId
        ]);
        $data['status'] = 1;
        $data['message'] = '成功';
        return $data;
    }

    /**
     * [mini]微信用户修改隐私密码
     */
    function EditPrivatePass($requestPayload)
    {
        if ($requestPayload['wechatUserEncrptPassNew'] != $requestPayload['wechatUserEncrptPassNewConfirm']) {
            $data['status'] = 0;
            $data['message'] = '新密码不一致';
            return $data;
        }
        $result = $this->database->get('wechatUser', [
            'wechatUserEncrptPass'
        ], [
            'wechatUserId' => $this->thisWechatId
        ]);
        if ($result['wechatUserEncrptPass'] != $requestPayload['wechatUserEncrptPassOld']) {
            $data['status'] = 0;
            $data['message'] = '旧密码不匹配';
            return $data;
        }
        $result =  $this->database->update('wechatUser', [
            'wechatUserEncrptPass' => $requestPayload['wechatUserEncrptPassNew'],
        ], [
            'wechatUserId' => $this->thisWechatId
        ]);

        $data['status'] = 1;
        $data['message'] = '成功';
        return $data;
    }
}
