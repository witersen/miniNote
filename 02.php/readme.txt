
登录
web系统加密、删除、移动、解密等对话框

login.class.php
	[web]web端请求新的QR信息
	[web]web端请求查询QR状态(登录时重置所有加密便签的解锁状态为已经上锁)
	[mini]小程序授权登录
	[mini]保存用户头像和昵称信息到后端
	[mini]小程序端扫码请求
	[web]web用户登录
	
account.class.php
	[web]获取所有微信用户列表
	[web]修改个人密码
	[mini]获取隐私密码设置情况
	[mini]初次设置隐私密码
	[mini]修改隐私密码
	
note.class.php
	[mini]添加笔记
	[mini]修改笔记内容
	[mini]修改笔记标题
	[mini]删除某条笔记
	[mini]获取个人的全部笔记列表(带有搜索关键词、排序方式)
	[mini]为笔记上传图片
	[mini]将某条笔记加密
	[mini]为某条笔记去除密码
	[mini]移动某条笔记到某个分类下
	[mini]通过输入密码查看笔记内容(将数据库中此条加密笔记的状态标记为已解锁、解锁状态在退出登录或下次登录被重置)
	[mini]为某条笔记添加标签
	[mini]删除某条笔记的某个标签

classs.class.php
	[mini]添加分类
	[mini]修改某个分类名称
	[mini]删除某个分类
	[mini]获取个人的分类列表
	[mini]获取个人的分类列表以及某个笔记的所在分类

recyclebin.class.php
	[mini]取消删除回收站的笔记
	