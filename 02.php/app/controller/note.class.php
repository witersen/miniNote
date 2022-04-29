<?php
/*
 * @Author: witersen
 * @Date: 2022-04-29 19:17:37
 * @LastEditors: witersen
 * @LastEditTime: 2022-04-29 20:09:31
 * @Description: QQ:1801168257
 */

class Note extends Controller
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
     * [mini]微信用户添加笔记
     */
    function AddNote($requestPayload)
    {
        $this->database->insert('note', [
            'noteTitle' => '未命名笔记',
            'noteContent' => '',
            'noteCreateTime' => date('Y-m-d H:i:s'),
            'noteLastEditTime' => date('Y-m-d H:i:s'),
            'noteBelongUserId' => $this->thisWechatId,
            'noteEncryptStatus' => 0,
            'noteLockStatus' => 1,
            'belongClassId' => $requestPayload['classId'],
            'isInRecyclebin' => 0
        ]);

        $data['status'] = 1;
        $data['message'] = '成功';
        return $data;
    }

    /**
     * [mini]修改笔记内容
     */
    function EditNoteContent($requestPayload)
    {
        $this->database->update('note', [
            'noteContent' => $requestPayload['noteContent'],
            'noteLastEditTime' => date('Y-m-d H:i:s'),
        ], [
            'noteId' => $requestPayload['noteId']
        ]);

        $data['status'] = 1;
        $data['message'] = '成功';
        return $data;
    }

    /**
     * [mini]修改笔记标题
     */
    function EditNoteTitle($requestPayload)
    {
        $this->database->update('note', [
            'noteTitle' => $requestPayload['noteTitle']
        ], [
            'noteId' => $requestPayload['noteId']
        ]);

        $data['status'] = 1;
        $data['message'] = '成功';
        return $data;
    }

    /**
     * [mini]删除某条笔记
     */
    function DelNote($requestPayload)
    {
        $info = $this->database->get('note', [
            'isInRecyclebin'
        ], [
            'noteId' => $requestPayload['noteId']
        ]);
        if ($info == null || $info == '') {
            $data['status'] = 0;
            $data['message'] = '笔记不存在';
            return $data;
        }
        if ($info['isInRecyclebin'] == 1) {
            //在回收站直接删除
            $this->database->delete('note', [
                'noteId' => $requestPayload['noteId']
            ]);
            $data['status'] = 1;
            $data['message'] = '成功';
            return $data;
        } else {
            //不在回收站移动到回收站
            $this->database->update('note', [
                'isInRecyclebin' => 1,
                'noteLockStatus' => 1
            ], [
                'noteId' => $requestPayload['noteId']
            ]);
            $data['status'] = 1;
            $data['message'] = '成功';
            return $data;
        }
    }

    /**
     * [mini]获取个人的全部笔记列表
     * 
     * (带有搜索关键词、排序方式)
     */
    function GetNoteList($requestPayload)
    {
        //所属分类id
        $classId = isset($requestPayload['classId']) ? $requestPayload['classId'] : 0;
        //按照编辑时间排序 0
        //按照创建时间排序 1
        $sortType = $requestPayload['sortType'];
        //关键词
        $searchNoteKeyWord = $requestPayload['searchNoteKeyWord'];
        //所属分类id
        // $belongClassId = $requestPayload['belongClassId'];

        if ($classId == 0) {
            //无需分类 获取全部数据(不在垃圾桶的)
            $list = $this->database->select('note', [
                'noteId',
                'noteTitle',
                'noteContent',
                'noteCreateTime',
                'noteLastEditTime',
                'noteEncryptStatus',
                'noteLockStatus',
            ], [
                'AND' => [
                    'OR' => [
                        'noteTitle[~]' => $searchNoteKeyWord,
                        'noteContent[~]' => $searchNoteKeyWord,
                    ],
                ],
                'noteBelongUserId' => $this->thisWechatId,
                'isInRecyclebin' => 0,
                'ORDER' => [$sortType == 0 ? 'noteLastEditTime' : 'noteCreateTime' => 'DESC'],
            ]);

            foreach ($list as $key => $value) {
                $tagList = $this->database->select('tag', [
                    'tagId',
                    'tagName'
                ], [
                    'tagBelongNoteId' => $value['noteId']
                ]);
                $list[$key]['tagList'] = $tagList;
            }

            $noteCount = $this->database->count('note', [
                'AND' => [
                    'OR' => [
                        'noteTitle[~]' => $searchNoteKeyWord,
                        'noteContent[~]' => $searchNoteKeyWord,
                    ],
                ],
                'noteBelongUserId' => $this->thisWechatId,
                'isInRecyclebin' => 0,
                'ORDER' => [$sortType == 0 ? 'noteLastEditTime' : 'noteCreateTime' => 'DESC'],
            ]);

            foreach ($list as $key => $value) {
                if ($value['noteEncryptStatus'] == 1 && $value['noteLockStatus'] == 1) {
                    $list[$key]['noteDescription'] = '';
                    $list[$key]['noteContent'] = '';
                    $list[$key]['tagList'] = [];
                } else {
                    $list[$key]['noteDescription'] = strlen($value['noteContent']) > 10 ? mb_substr($value['noteContent'], 0, 10) . '...' : mb_substr($value['noteContent'], 0, 10);
                }
            }

            $data['status'] = 1;
            $data['message'] = '成功';
            $data['data'] = $list;
            $data['noteCount'] = $noteCount;
            return $data;
        } else if ($classId == -1) {
            //获取处于垃圾桶中的列表
            $list = $this->database->select('note', [
                'noteId',
                'noteTitle',
                'noteContent',
                'noteCreateTime',
                'noteLastEditTime',
                'noteEncryptStatus',
                'noteLockStatus',
            ], [
                'AND' => [
                    'OR' => [
                        'noteTitle[~]' => $searchNoteKeyWord,
                        'noteContent[~]' => $searchNoteKeyWord,
                    ],
                ],
                'noteBelongUserId' => $this->thisWechatId,
                'isInRecyclebin' => 1,
                'ORDER' => [$sortType == 0 ? 'noteLastEditTime' : 'noteCreateTime' => 'DESC'],
            ]);
            $noteCount = $this->database->count('note', [
                'AND' => [
                    'OR' => [
                        'noteTitle[~]' => $searchNoteKeyWord,
                        'noteContent[~]' => $searchNoteKeyWord,
                    ],
                ],
                'noteBelongUserId' => $this->thisWechatId,
                'isInRecyclebin' => 1,
                'ORDER' => [$sortType == 0 ? 'noteLastEditTime' : 'noteCreateTime' => 'DESC'],
            ]);

            foreach ($list as $key => $value) {
                if ($value['noteEncryptStatus'] == 1 && $value['noteLockStatus'] == 1) {
                    $list[$key]['noteDescription'] = '';
                } else {
                    $list[$key]['noteDescription'] = strlen($value['noteContent']) > 10 ? mb_substr($value['noteContent'], 0, 10) . '...' : mb_substr($value['noteContent'], 0, 10);
                }

                // $list[$key]['noteDescription'] = strlen($value['noteContent']) > 10 ? mb_substr($value['noteContent'], 0, 10) . '...' : mb_substr($value['noteContent'], 0, 10);
            }

            $data['status'] = 1;
            $data['message'] = '成功';
            $data['data'] = $list;
            $data['noteCount'] = $noteCount;
            return $data;
        } else {
            //获取指定分类id下的数据
            $list = $this->database->select('note', [
                'noteId',
                'noteTitle',
                'noteContent',
                'noteCreateTime',
                'noteLastEditTime',
                'noteEncryptStatus',
                'noteLockStatus',
            ], [
                'AND' => [
                    'OR' => [
                        'noteTitle[~]' => $searchNoteKeyWord,
                        'noteContent[~]' => $searchNoteKeyWord,
                    ],
                ],
                'belongClassId' => $classId,
                'noteBelongUserId' => $this->thisWechatId,
                'isInRecyclebin' => 0,
                'ORDER' => [$sortType == 0 ? 'noteLastEditTime' : 'noteCreateTime' => 'DESC'],
            ]);

            foreach ($list as $key => $value) {
                $tagList = $this->database->select('tag', [
                    'tagId',
                    'tagName'
                ], [
                    'tagBelongNoteId' => $value['noteId']
                ]);
                $list[$key]['tagList'] = $tagList;
            }

            $noteCount = $this->database->count('note', [
                'AND' => [
                    'OR' => [
                        'noteTitle[~]' => $searchNoteKeyWord,
                        'noteContent[~]' => $searchNoteKeyWord,
                    ],
                ],
                'belongClassId' => $classId,
                'noteBelongUserId' => $this->thisWechatId,
                'isInRecyclebin' => 0,
                'ORDER' => [$sortType == 0 ? 'noteLastEditTime' : 'noteCreateTime' => 'DESC'],
            ]);

            foreach ($list as $key => $value) {
                if ($value['noteEncryptStatus'] == 1 && $value['noteLockStatus'] == 1) {
                    $list[$key]['noteDescription'] = '';
                    $list[$key]['noteContent'] = '';
                    $list[$key]['tagList'] = [];
                } else {
                    $list[$key]['noteDescription'] = strlen($value['noteContent']) > 10 ? mb_substr($value['noteContent'], 0, 10) . '...' : mb_substr($value['noteContent'], 0, 10);
                }

                // $list[$key]['noteDescription'] = strlen($value['noteContent']) > 10 ? mb_substr($value['noteContent'], 0, 10) . '...' : mb_substr($value['noteContent'], 0, 10);
            }

            $data['status'] = 1;
            $data['message'] = '成功';
            $data['data'] = $list;
            $data['noteCount'] = $noteCount;
            return $data;
        }
    }

    /**
     * [mini]为笔记上传图片
     */
    function UploadImage($requestPayload)
    {
    }

    /**
     * [mini]将某条笔记加密
     */
    function EncryptNote($requestPayload)
    {
        $this->database->update('note', [
            'noteEncryptStatus' => 1,
            'noteLockStatus' => 1
        ], [
            'noteId' => $requestPayload['noteId']
        ]);

        $data['status'] = 1;
        $data['message'] = '成功';
        return $data;
    }

    /**
     * [mini]为某条笔记去除密码
     */
    function DecryptNote($requestPayload)
    {
        $info = $this->database->get('wechatUser', [
            'wechatUserEncrptPass'
        ], [
            'wechatUserId' => $this->thisWechatId
        ]);
        if ($info['wechatUserEncrptPass'] != $requestPayload['wechatUserEncrptPass']) {
            $data['status'] = 0;
            $data['message'] = '隐私密码错误';
            return $data;
        }
        $this->database->update('note', [
            'noteEncryptStatus' => 0
        ], [
            'noteId' => $requestPayload['noteId']
        ]);

        $data['status'] = 1;
        $data['message'] = '成功';
        return $data;
    }

    /**
     * [mini]移动某条笔记到某个分类下
     * 
     * 如果要移动的目标文件夹已经包含该笔记 则进行移除操作
     */
    function RemoveNote($requestPayload)
    {
        $info = $this->database->get('note', [
            'belongClassId'
        ], [
            'noteId' => $requestPayload['noteId']
        ]);

        $this->database->update('note', [
            'belongClassId' => $info['belongClassId'] == $requestPayload['classId'] ? 0 : $requestPayload['classId']
        ], [
            'noteId' => $requestPayload['noteId']
        ]);

        $data['status'] = 1;
        $data['message'] = '成功';
        return $data;
    }

    /**
     * [mini]通过输入密码查看笔记内容
     * 
     * (将数据库中此条加密笔记的状态标记为已解锁、解锁状态在退出登录或下次登录被重置)
     */
    function UnlockNote($requestPayload)
    {
        $info = $this->database->get('wechatUser', [
            'wechatUserEncrptPass'
        ], [
            'wechatUserId' => $this->thisWechatId
        ]);

        if ($info['wechatUserEncrptPass'] != $requestPayload['wechatUserEncrptPass']) {
            $data['status'] = 0;
            $data['message'] = '密码错误';
            return $data;
        }
        $this->database->update('note', [
            'noteLockStatus' => 0
        ], [
            'noteId' => $requestPayload['noteId']
        ]);

        $data['status'] = 1;
        $data['message'] = '成功';
        return $data;
    }

    /**
     * [mini]获取笔记内容和标签列表
     */
    function GetNoteContent($requestPayload)
    {
        $list = $this->database->get('note', [
            'noteId',
            'noteTitle',
            'noteContent',
            'noteCreateTime',
            'noteLastEditTime',
            'noteEncryptStatus',
            'noteLockStatus',
        ], [
            'noteId' => $requestPayload['noteId'],
        ]);

        $tagList = $this->database->select('tag', [
            'tagId',
            'tagName'
        ], [
            'tagBelongNoteId' => $requestPayload['noteId']
        ]);
        $list['tagList'] = $tagList;

        $data['status'] = 1;
        $data['message'] = '成功';
        $data['data'] = $list;
        return $data;
    }
}
