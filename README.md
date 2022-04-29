# 便签
1、该系统为使用PHP作为后端接口开发的可在小程序端和web端使用的便签应用

2、开发技术或框架

- 小程序端：
  - colorUI（作者文晓港）
- 管理系统
  - Vue.js
  - ViewUI
  - axios
  - mavon-editor
  - vue-router
- 后端接口
  - 原生PHP实现后端框架
  - Medoo（数据库框架）

3、支持PHP版本：PHP5.4+

4、支持数据库：MySQL

6、支持功能：创建便签、加密解密便签、删除便签、创建文件夹、修改文件夹、删除文件夹、快捷搜索、管理系统扫码登陆、便签回收站...

## 一、部署
- 小程序端配置
  - 将project.config.json文件中的appid换为自己的
  - 将app.js的globalData下的domain换成自己的域名：https://test.com

- web管理系统配置
  - 如果要开发调试 则将webpack.dev.config.js 中 devServer下的proxy下的target换成自己的后端接口地址： https://test.com/api.php
  - 如果要打包部署 直接运行npm install后运行npm run build打包即可

- 后端php接口配置
  - config/config.php 中填写数据库信息
  - 安装MySQL或者MariaDb数据库
  - 创建数据库note导入数据库文件
  - 安装nginx或者apache服务器
  - 安装PHP（版本大于5.4）
  - 安装php依赖
    - php-json
    - php-mysqlnd
    - php-gd
    - php-mbstring

## 二、功能介绍

- 授权登录

  ![](./00.static/01.images/01.jpg)
  
- 登陆成功

  ![](./00.static/01.images/02.jpg)
  
- 便签管理

  ![](./00.static/01.images/03.jpg)
  
- 选择创建类型

  ![](./00.static/01.images/04.jpg)
  
- 创建文件夹会提示该文件夹包含多少便签

  ![](./00.static/01.images/05.jpg)
  
- 创建笔记默认名称都为未命名笔记

  ![](./00.static/01.images/06.jpg)
  
- 长按笔记多个选项

  ![](./00.static/01.images/07.jpg)
  
- 点击笔记开始编辑

  ![](./00.static/01.images/08.jpg)
  
- 键盘上方有便捷按钮

  ![](./00.static/01.images/09.jpg)
  
- 可以自己为便签加标签

  ![](./00.static/01.images/10.jpg)
  
- 标签添加成功

  ![](./00.static/01.images/11.jpg)
  
- 可以对文件夹进行删除或者重命名操作

  ![](./00.static/01.images/12.jpg)
  
- 可以对笔记进行加锁

  ![](./00.static/01.images/13.jpg)
  
- 小程序用户可以在小程序内通过扫码进行登录

  ![](./00.static/01.images/14.jpg)
  
- 管理员通过账号密码登录

  ![](./00.static/01.images/15.jpg)
  
- 扫码登陆成功会有提示

  ![](./00.static/01.images/16.jpg)
  
- 用户的主界面

  ![](./00.static/01.images/17.jpg)
  
- 点击进入文件夹内部

  ![](./00.static/01.images/18.jpg)
  
- 鼠标悬浮可以看到更多选项

  ![](./00.static/01.images/19.jpg)
  
- 笔记被加密需要解锁才能访问查看

  ![](./00.static/01.images/20.jpg)
  
- 使用markdown语法更方便

  ![](./00.static/01.images/21.jpg)
  
- 管理人员界面只能看到大致的用户基本信息

  ![](./00.static/01.images/22.jpg)