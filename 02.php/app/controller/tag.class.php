<?php
/*
 * @Author: witersen
 * @Date: 2022-04-29 19:17:37
 * @LastEditors: witersen
 * @LastEditTime: 2022-04-29 20:09:37
 * @Description: QQ:1801168257
 */

class Tag extends Controller
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
     * [mini]为某条笔记添加标签
     */
    function AddNoteTag($requestPayload)
    {
        if($requestPayload['noteId']==-1){
            $data['status'] = 0;
            $data['message'] = '非法操作';
            return $data;
        }
        $this->database->insert('tag',[
            'tagName'=>$requestPayload['tagName'],
            'tagBelongNoteId'=>$requestPayload['noteId'],
            'tagCreateTime'=>date('Y-m-d H:i:s')
        ]);

        $data['status'] = 1;
        $data['message'] = '成功';
        return $data;
    }

    /**
     * [mini]删除某条笔记的某个标签
     */
    function DelNoteTag($requestPayload)
    {
        $this->database->delete('tag',[
            'tagId'=>$requestPayload['tagId']
        ]);

        $data['status'] = 1;
        $data['message'] = '成功';
        return $data;
    }
}
