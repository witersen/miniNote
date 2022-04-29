<?php
/*
 * @Author: witersen
 * @Date: 2022-04-29 19:17:37
 * @LastEditors: witersen
 * @LastEditTime: 2022-04-29 20:09:24
 * @Description: QQ:1801168257
 */

class Classs extends Controller
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
     * [mini]添加分类
     */
    function AddClass($requestPayload)
    {
        $this->database->insert('class', [
            'className' => $requestPayload['className'],
            'classCreateTime' => date('Y-m-d H:i:s'),
            'classBelongUserId' => $this->thisWechatId
        ]);

        $data['status'] = 1;
        $data['message'] = '成功';
        return $data;
    }

    /**
     * [mini]修改某个分类名称
     */
    function EditClass($requestPayload)
    {
        $this->database->update('class', [
            'className' => $requestPayload['className']
        ], [
            'classId' => $requestPayload['classId']
        ]);

        $data['status'] = 1;
        $data['message'] = '成功';
        return $data;
    }

    /**
     * [mini]删除某个分类
     */
    function DelClass($requestPayload)
    {
        //删除分类包含的笔记(移动到回收站)
        $this->database->update('note', [
            'isInRecyclebin' => 1
        ], [
            'noteEncryptStatus' => 0, //上锁 以防万一
            'belongClassId' => $requestPayload['classId']
        ]);

        //删除分类
        $this->database->delete('class', [
            'classId' => $requestPayload['classId']
        ]);

        $data['status'] = 1;
        $data['message'] = '成功';
        return $data;
    }

    /**
     * [mini]获取个人的分类列表
     */
    function GetClassList($requestPayload)
    {
        $list = $this->database->select('class', [
            'classId',
            'className',
        ], [
            'classBelongUserId' => $this->thisWechatId
        ]);

        foreach ($list as $key => $value) {
            $noteCount = $this->database->count('note', [
                'belongClassId' => $value['classId'],
                // 'noteBelongUserId' => $this->thisWechatId,
                'isInRecyclebin' => 0,
            ]);
            $list[$key]['noteCount'] = $noteCount;
        }

        $data['status'] = 1;
        $data['message'] = '成功';
        $data['data'] = $list;
        return $data;
    }

    /**
     * [mini]获取个人的分类列表以及某个笔记的所在分类
     */
    function GetClassList2($requestPayload)
    {
        $info = $this->database->get('note', [
            'belongClassId'
        ], [
            'noteId' => $requestPayload['noteId']
        ]);

        $list = $this->database->select('class', [
            'classId',
            'className',
        ], [
            'classBelongUserId' => $this->thisWechatId
        ]);

        foreach ($list as $key => $value) {
            $list[$key]['selectStatus'] = 0;
            if ($value['classId'] == $info['belongClassId']) {
                $list[$key]['selectStatus'] = 1;
            }
        }

        $data['status'] = 1;
        $data['message'] = '成功';
        $data['data'] = $list;
        return $data;
    }
}
