//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //搜索笔记关键词
    searchNoteKeyword: '',
    //导航栏
    CustomBar: app.globalData.CustomBar,
    /**
     * 对话框
     */
    modalShowNote: false,//笔记对话框显示
    modalShowClass: false,//分类对话框显示
    modalShowType: false,//点击新建 选择类型 文件夹或者笔记
    modalShowInputClass: false,//新建文件夹时的弹出输入框
    modalShowInputUnlock: false,//输入密码查看笔记内容
    modalShowInputDecrypt: false,//输入密码取消加密笔记
    modalShowClass2: false,//移动笔记
    modalShowEditNoteTitle: false,//修改笔记标题

    /**
     * 临时变量
     */
    tempClassName: '',//新建文件夹的输入名称
    tempUnlockPass: '',//解锁笔记密码
    tempDecryptPass: '',//解密笔记密码
    tempEditClassName: '',//编辑文件夹名称
    tempEditNoteTitle: '',//编辑笔记标题

    /**
     * 文件夹信息
     */
    classList: [],
    classList2: [],

    /**
     * 笔记信息
     */
    formNoteInfo: {
      //导航类型
      navTitle: "全部笔记", //全部笔记、按分类查看笔记、回收站笔记
      //导航类型
      navType: 0, //全部笔记 0、按分类查看笔记 1、回收站笔记 2
      //笔记数量
      noteCount: 9,
      //排序方式
      sortType: 1, //按照编辑时间排序 0、按照创建时间排序 1
      //是否可编辑内容
      editAble: 1, //可编辑 0、不可编辑 1
      //当前笔记搜索关键词
      searchNoteKeyWord: "",
      //笔记内容
      noteList: [],
    },
    /**
     * 选中信息
     */
    formCurrentSelect: {
      classId: 0,
      classIndex: 0,
      noteIndex: 0,
      noteId: 0,
      //笔记栏的标题内容
      className: "",
      //笔记栏的标题可编辑状态
      classTitleReadonly: false,
    },
  },

  //扫码登录
  ScanQr() {
    if (!wx.getStorageSync('token') || wx.getStorageSync('token') == '') {
      wx.showToast({
        title: '请授权登录',
        icon: 'error',
        duration: 1500
      })
      return
    }
    var that = this
    wx.showLoading({
      title: 'loading',
      mask: true,
    })
    // 允许从相机和相册扫码
    wx.scanCode({
      success(scanResult) {
        return new Promise(function (resolve, reject) {
          wx.request({
            url: app.globalData.domain + '/api.php?c=login&a=ScanQr&t=mini',
            method: "post",
            header: {
              'content-type': 'application/json',
              'token': wx.getStorageSync('token')
            },
            data: {
              scanResult: scanResult.result
            },
            success: res => {
              wx.hideLoading()
              var result = res.data;
              if (result.status == 1) {
                if (result.data == 1) {
                  //过期
                  wx.showToast({
                    title: result.message,
                    icon: 'error',
                    duration: 2000
                  })
                } else if (result.data == 3) {
                  //已经扫码成功过
                  wx.showToast({
                    title: result.message,
                    icon: 'error',
                    duration: 2000
                  })
                } else {
                  //未扫码 本地扫码成功
                  wx.showToast({
                    title: result.message,
                    icon: 'success',
                    duration: 2000
                  })
                }
              } else {
                wx.showToast({
                  title: result.message,
                  icon: 'error',
                  duration: 2000
                })
              }
              resolve(res);
            },
            fail: res => {
              wx.hideLoading()
              reject(res);
            }
          })
        })
      }
    })
  },

  //添加笔记或文件夹对话框
  ModalShowType() {
    this.setData({
      modalShowType: true
    })
  },

  //隐藏添加笔记或文件夹对话框
  ModalHideType() {
    this.setData({
      modalShowType: false
    })
  },

  //添加笔记
  AddNote() {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: app.globalData.domain + '/api.php?c=note&a=AddNote&t=mini',
        method: "post",
        header: {
          'content-type': 'application/json',
          'token': wx.getStorageSync('token')
        },
        data: {
          classId: that.data.formCurrentSelect.classId
        },
        success: res => {
          var result = res.data;
          if (result.status == 1) {
            //隐藏两层弹出框
            that.setData({
              modalShowInputClass: false,
              modalShowType: false
            })
            wx.showToast({
              title: result.message,
              icon: 'success',
              duration: 1500
            })
            that.GetNoteList();
          } else {
            wx.showToast({
              title: result.message,
              icon: 'error',
              duration: 1500
            })
          }
          resolve(res);
        },
        fail: res => {
          reject(res);
        }
      })
    })
  },

  //显示输入文件夹名称
  ModalShowInputClass() {
    this.setData({
      modalShowInputClass: true
    })
  },

  //隐藏输入文件夹名称
  ModalHideInputClass() {
    this.setData({
      modalShowInputClass: false
    })
  },

  //绑定输入文件夹名称
  BindInputClass(e) {
    this.setData({
      tempClassName: e.detail.value
    })
  },

  //显示输入密码解锁笔记对话框
  ModalShowInputUnlock() {
    this.setData({
      modalShowInputUnlock: true
    })
  },

  //隐藏输入密码解锁笔记对话框
  ModalHideInputUnlock() {
    this.setData({
      modalShowInputUnlock: false
    })
  },

  //绑定输入解锁查看内容笔记密码
  BindInputUnlock(e) {
    this.setData({
      tempUnlockPass: e.detail.value
    })
  },

  //确定解锁
  ConfirmInputUnlock() {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: app.globalData.domain + '/api.php?c=note&a=UnlockNote&t=mini',
        method: "post",
        header: {
          'content-type': 'application/json',
          'token': wx.getStorageSync('token')
        },
        data: {
          wechatUserEncrptPass: that.data.tempUnlockPass,
          noteId: that.data.formCurrentSelect.noteId,
        },
        success: res => {
          var result = res.data;
          if (result.status == 1) {
            that.setData({
              modalShowInputUnlock: false
            })
            wx.showToast({
              title: result.message,
              icon: 'success',
              duration: 1500
            })
            that.GetNoteList()
          } else {
            wx.showToast({
              title: result.message,
              icon: 'error',
              duration: 1500
            })
          }
          resolve(res);
        },
        fail: res => {
          reject(res);
        }
      })
    })
  },

  //显示取消加密笔记对话框
  ModalShowInputDecrypt() {
    this.setData({
      modalShowInputDecrypt: true
    })
  },

  //隐藏取消加密笔记对话框
  ModalHideInputDecrypt() {
    this.setData({
      modalShowInputDecrypt: false
    })
  },

  //绑定输入取消加密笔记对话框
  BindInputDecrypt(e) {
    this.setData({
      tempDecryptPass: e.detail.value
    })
  },

  //确定解密
  ConfirmInputDecrypt() {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: app.globalData.domain + '/api.php?c=note&a=DecryptNote&t=mini',
        method: "post",
        header: {
          'content-type': 'application/json',
          'token': wx.getStorageSync('token')
        },
        data: {
          noteId: that.data.formCurrentSelect.noteId,
          wechatUserEncrptPass: that.data.tempDecryptPass
        },
        success: res => {
          var result = res.data;
          if (result.status == 1) {
            that.setData({
              modalShowInputDecrypt: false,
              modalShowNote: false,
            })
            wx.showToast({
              title: result.message,
              icon: 'success',
              duration: 1500
            })
            that.GetNoteList()
          } else {
            wx.showToast({
              title: result.message,
              icon: 'error',
              duration: 1500
            })
          }
          resolve(res);
        },
        fail: res => {
          reject(res);
        }
      })
    })
  },

  //确定新建文件夹
  ConfirmInputClass() {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: app.globalData.domain + '/api.php?c=classs&a=AddClass&t=mini',
        method: "post",
        header: {
          'content-type': 'application/json',
          'token': wx.getStorageSync('token')
        },
        data: {
          className: that.data.tempClassName
        },
        success: res => {
          var result = res.data;
          if (result.status == 1) {
            //隐藏两层弹出框
            that.setData({
              modalShowInputClass: false,
              modalShowType: false
            })
            wx.showToast({
              title: result.message,
              icon: 'success',
              duration: 1500
            })
            that.GetClassList();
          } else {
            wx.showToast({
              title: result.message,
              icon: 'error',
              duration: 1500
            })
          }
          resolve(res);
        },
        fail: res => {
          reject(res);
        }
      })
    })
  },

  //获取笔记列表
  GetNoteList() {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: app.globalData.domain + '/api.php?c=note&a=GetNoteList&t=mini',
        method: "post",
        header: {
          'content-type': 'application/json',
          'token': wx.getStorageSync('token')
        },
        data: {
          //由于存在长按操作 所以classId要从storage取值 不能从变量取值
          classId: wx.getStorageSync('currentSelectClassId'),
          sortType: that.data.formNoteInfo.sortType,
          searchNoteKeyWord: that.data.formNoteInfo.searchNoteKeyWord
        },
        success: res => {
          var result = res.data;
          if (result.status == 1) {
            that.setData({
              ['formNoteInfo.noteList']: result.data
            })
          } else {
            wx.showToast({
              title: result.message,
              icon: 'error',
              duration: 1500
            })
          }
          resolve(res);
        },
        fail: res => {
          reject(res);
        }
      })
    })
  },

  //获取分类列表
  GetClassList() {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: app.globalData.domain + '/api.php?c=classs&a=GetClassList&t=mini',
        method: "post",
        header: {
          'content-type': 'application/json',
          'token': wx.getStorageSync('token')
        },
        data: {},
        success: res => {
          var result = res.data;
          if (result.status == 1) {
            that.setData({
              classList: result.data
            })
          } else {
            wx.showToast({
              title: result.message,
              icon: 'error',
              duration: 1500
            })
          }
          resolve(res);
        },
        fail: res => {
          reject(res);
        }
      })
    })
  },

  //搜索框的输入值
  BindNoteSearch(e) {
    var that = this;
    that.setData({
      ['formNoteInfo.searchNoteKeyWord']: e.detail.value
    })
    //请求
    that.GetNoteList();
  },

  //点击笔记跳转
  ClickNote(e) {
    var that = this;
    //存储
    wx.setStorageSync('currentSelectNoteId', e.currentTarget.dataset.noteid);
    wx.setStorageSync('currentSelectNoteIndex', e.currentTarget.dataset.noteindex);
    //赋值
    that.setData({
      ['formCurrentSelect.noteId']: e.currentTarget.dataset.noteid,
      ['formCurrentSelect.noteIndex']: e.currentTarget.dataset.noteindex,
    })
    if (that.data.formNoteInfo.noteList[e.currentTarget.dataset.noteindex].noteEncryptStatus == 1 && that.data.formNoteInfo.noteList[e.currentTarget.dataset.noteindex].noteLockStatus == 1) {
      that.setData({
        modalShowInputUnlock: true
      })
      return;
    }
    wx.navigateTo({
      url: '/pages/note/noteContent/noteContent',
    })
  },

  //点击分类跳转
  ClickClass(e) {
    var that = this;
    //存储
    wx.setStorageSync('currentSelectClassId', e.currentTarget.dataset.classid);
    wx.setStorageSync('currentSelectClassIndex', e.currentTarget.dataset.classindex);
    //赋值
    that.setData({
      ['formCurrentSelect.classId']: e.currentTarget.dataset.classid,
      ['formCurrentSelect.classIndex']: e.currentTarget.dataset.classindex,
    })
    wx.navigateTo({
      url: '/pages/note/folderContent/folderContent',
    })
  },

  /**
   * 长按笔记触发
   * 
   * 设置为私密
   * 删除
   * 移动到
   */
  LongperssNote(e) {
    var that = this;
    //存储
    wx.setStorageSync('currentSelectNoteId', e.currentTarget.dataset.noteid);
    wx.setStorageSync('currentSelectNoteIndex', e.currentTarget.dataset.noteindex);
    //赋值
    that.setData({
      //保存index可用于渲染时直接使用下标拿到更到的值
      ['formCurrentSelect.noteIndex']: e.currentTarget.dataset.noteindex,
      //保存id可用于请求时直接传递id
      ['formCurrentSelect.noteId']: e.currentTarget.dataset.noteid,
      modalShowNote: true
    })
  },

  /**
   * 长按分类触发
   * 
   * 删除
   * 重命名
   */
  LongperssClass(e) {
    var that = this;
    //存储(长按分类由于不触发跳转 所以只赋值不存储)
    // wx.setStorageSync('currentSelectClassId', e.currentTarget.dataset.classid);
    // wx.setStorageSync('currentSelectClassIndex', e.currentTarget.dataset.classindex);
    //赋值
    that.setData({
      ['formCurrentSelect.classIndex']: e.currentTarget.dataset.classindex,
      ['formCurrentSelect.classId']: e.currentTarget.dataset.classid,
      modalShowClass: true
    })
  },

  //隐藏笔记对话框
  ModalHideNote() {
    this.setData({
      modalShowNote: false
    })
  },

  //隐藏分类对话框
  ModalHideClass() {
    this.setData({
      modalShowClass: false
    })
  },

  //设置笔记为私密
  EncryptNote() {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: app.globalData.domain + '/api.php?c=note&a=EncryptNote&t=mini',
        method: "post",
        header: {
          'content-type': 'application/json',
          'token': wx.getStorageSync('token')
        },
        data: {
          noteId: that.data.formCurrentSelect.noteId
        },
        success: res => {
          var result = res.data;
          if (result.status == 1) {
            //隐藏弹出框
            that.setData({
              modalShowNote: false
            })
            wx.showToast({
              title: result.message,
              icon: 'success',
              duration: 1500
            })
            that.GetNoteList();
          } else {
            wx.showToast({
              title: result.message,
              icon: 'error',
              duration: 1500
            })
          }
          resolve(res);
        },
        fail: res => {
          reject(res);
        }
      })
    })
  },

  //取消加密笔记
  DecryptNote() {
    this.setData({
      modalShowInputDecrypt: true
    })
  },

  //删除笔记
  DelNote() {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: app.globalData.domain + '/api.php?c=note&a=DelNote&t=mini',
        method: "post",
        header: {
          'content-type': 'application/json',
          'token': wx.getStorageSync('token')
        },
        data: {
          noteId: that.data.formCurrentSelect.noteId
        },
        success: res => {
          var result = res.data;
          if (result.status == 1) {
            that.setData({
              modalShowNote: false
            })
            wx.showToast({
              title: result.message,
              icon: 'success',
              duration: 1500
            })
            that.GetNoteList()
          } else {
            wx.showToast({
              title: result.message,
              icon: 'error',
              duration: 1500
            })
          }
          resolve(res);
        },
        fail: res => {
          reject(res);
        }
      })
    })
  },

  //移动笔记到文件夹
  RemoveNote() {
    var that = this;
    that.GetClassList2();
    that.setData({
      modalShowClass2: true
    })
  },

  //删除分类以及分类下的笔记
  DelClass() {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: app.globalData.domain + '/api.php?c=classs&a=DelClass&t=mini',
        method: "post",
        header: {
          'content-type': 'application/json',
          'token': wx.getStorageSync('token')
        },
        data: {
          classId: that.data.formCurrentSelect.classId,
        },
        success: res => {
          var result = res.data;
          if (result.status == 1) {
            that.setData({
              modalShowClass: false,
            })
            wx.showToast({
              title: result.message,
              icon: 'success',
              duration: 1500
            })
            that.GetNoteList();
            that.GetClassList();
          } else {
            wx.showToast({
              title: result.message,
              icon: 'error',
              duration: 1500
            })
          }
          resolve(res);
        },
        fail: res => {
          reject(res);
        }
      })
    })
  },

  //编辑分类
  EditClass() {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: app.globalData.domain + '/api.php?c=classs&a=EditClass&t=mini',
        method: "post",
        header: {
          'content-type': 'application/json',
          'token': wx.getStorageSync('token')
        },
        data: {
          classId: that.data.formCurrentSelect.classId,
          className: that.data.tempEditClassName
        },
        success: res => {
          var result = res.data;
          if (result.status == 1) {
            that.setData({
              modalShowEditClass: false,
              modalShowClass: false
            })
            wx.showToast({
              title: result.message,
              icon: 'success',
              duration: 1500
            })
            that.GetClassList();
          } else {
            wx.showToast({
              title: result.message,
              icon: 'error',
              duration: 1500
            })
          }
          resolve(res);
        },
        fail: res => {
          reject(res);
        }
      })
    })
  },

  //获取微信用户隐私密码设置状态
  GetPrivatePassInfo() {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: app.globalData.domain + '/api.php?c=account&a=GetPrivatePassInfo&t=mini',
        method: "post",
        header: {
          'content-type': 'application/json',
          'token': wx.getStorageSync('token')
        },
        data: {},
        success: res => {
          var result = res.data;
          if (result.status == 1) {
            if (result.data == 1) {
              wx.showToast({
                title: '未设置隐私密码',
                icon: 'error',
                duration: 1500
              })
              that.setData({
                modalShowNote: false
              })
            } else if (result.data == 2) {
              that.EncryptNote();
            }
          } else {
            wx.showToast({
              title: result.message,
              icon: 'error',
              duration: 1500
            })
          }
          resolve(res);
        },
        fail: res => {
          reject(res);
        }
      })
    })
  },

  //显示编辑文件夹对话框
  ModalShowEditClass() {
    this.setData({
      modalShowEditClass: true
    })
  },

  //隐藏编辑文件夹对话框
  ModalHideEditClass() {
    this.setData({
      modalShowEditClass: false
    })
  },

  //绑定
  BindEditClass(e) {
    this.setData({
      tempEditClassName: e.detail.value
    })
  },

  //
  ModalShowClass2() {
    this.setData({
      modalShowClass2: true
    })
  },

  //
  ModalHideClass2() {
    this.setData({
      modalShowClass2: false
    })
  },

  //获取文件夹列表2
  GetClassList2() {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: app.globalData.domain + '/api.php?c=classs&a=GetClassList2&t=mini',
        method: "post",
        header: {
          'content-type': 'application/json',
          'token': wx.getStorageSync('token')
        },
        data: {
          noteId: that.data.formCurrentSelect.noteId
        },
        success: res => {
          var result = res.data;
          if (result.status == 1) {
            that.setData({
              classList2: result.data
            })
          } else {
            wx.showToast({
              title: result.message,
              icon: 'error',
              duration: 1500
            })
          }
          resolve(res);
        },
        fail: res => {
          reject(res);
        }
      })
    })
  },

  //点击单选按钮
  ChangeRadio(e) {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: app.globalData.domain + '/api.php?c=note&a=RemoveNote&t=mini',
        method: "post",
        header: {
          'content-type': 'application/json',
          'token': wx.getStorageSync('token')
        },
        data: {
          classId: e.currentTarget.dataset.classid,
          noteId: that.data.formCurrentSelect.noteId
        },
        success: res => {
          var result = res.data;
          if (result.status == 1) {
            wx.showToast({
              title: result.message,
              icon: 'success',
              duration: 1500
            })
            that.GetClassList();
            that.GetClassList2();
          } else {
            wx.showToast({
              title: result.message,
              icon: 'error',
              duration: 1500
            })
          }
          resolve(res);
        },
        fail: res => {
          reject(res);
        }
      })
    })
  },

  //显示修改笔记标题
  ModalShowEditNoteTitle() {
    this.setData({
      modalShowEditNoteTitle: true
    })
  },

  //隐藏显示修改笔记标题
  ModalHideEditNoteTitle() {
    this.setData({
      modalShowEditNoteTitle: false
    })
  },

  //绑定输入
  BindEditNoteTitle(e) {
    this.setData({
      tempEditNoteTitle: e.detail.value
    })
  },

  //确定重命名笔记
  EditNoteTitle() {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: app.globalData.domain + '/api.php?c=note&a=EditNoteTitle&t=mini',
        method: "post",
        header: {
          'content-type': 'application/json',
          'token': wx.getStorageSync('token')
        },
        data: {
          noteId: that.data.formCurrentSelect.noteId,
          noteTitle: that.data.tempEditNoteTitle
        },
        success: res => {
          var result = res.data;
          if (result.status == 1) {
            //隐藏两层弹出框
            that.setData({
              modalShowEditNoteTitle: false,
              modalShowNote: false
            })
            wx.showToast({
              title: result.message,
              icon: 'success',
              duration: 1500
            })
            that.GetNoteList();
          } else {
            wx.showToast({
              title: result.message,
              icon: 'error',
              duration: 1500
            })
          }
          resolve(res);
        },
        fail: res => {
          reject(res);
        }
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //设置
    this.GetNoteList();
    this.GetClassList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //在此页面要恢复选中的class信息为默认
    var that = this;
    //存储
    wx.setStorageSync('currentSelectClassId', 0);
    wx.setStorageSync('currentSelectClassIndex', 0);
    //赋值
    that.setData({
      ['formCurrentSelect.classId']: 0,
      ['formCurrentSelect.classIndex']: 0,
    })
    //
    that.onLoad();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})