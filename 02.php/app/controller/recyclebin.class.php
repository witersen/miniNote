<?php
/*
 * @Author: witersen
 * @Date: 2022-04-29 19:17:37
 * @LastEditors: witersen
 * @LastEditTime: 2022-04-29 20:09:35
 * @Description: QQ:1801168257
 */

class Recyclebin extends Controller
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
     * [mini]取消删除笔记
     */
    function RecoveryNote($requestPayload)
    {
        $this->database->update('note', [
            'isInRecyclebin' => 0
        ], [
            'noteId' => $requestPayload['noteId']
        ]);
        $data['status'] = 1;
        $data['message'] = '成功';
        return $data;
    }
}
