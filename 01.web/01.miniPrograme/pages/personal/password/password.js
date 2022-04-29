//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    formNotePassSet: {
      notePass: '',
      confirmNotePass: ''
    },
    formPassEdit: {
      oldNotePass: '',
      newNotePass: '',
      confirmNotePass: ''
    },
    //是否设置隐私密码
    isSetPrivatePass: false,
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
              //未设置
              that.setData({
                isSetPrivatePass: false
              })
            } else if (result.data == 2) {
              //已设置
              that.setData({
                isSetPrivatePass: true
              })
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

  //设置初始密码
  SetNotePass(e) {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: app.globalData.domain + '/api.php?c=account&a=InitPrivatePass&t=mini',
        method: "post",
        header: {
          'content-type': 'application/json',
          'token': wx.getStorageSync('token')
        },
        data: {
          wechatUserEncrptPass: e.detail.value.notePass,
          wechatUserEncrptPassConfirm: e.detail.value.confirmNotePass,
        },
        success: res => {
          var result = res.data;
          if (result.status == 1) {
            wx.showToast({
              title: result.message,
              icon: 'success',
              duration: 1500
            })
            that.GetPrivatePassInfo();
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

  //修改密码
  EditNotePass(e) {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: app.globalData.domain + '/api.php?c=account&a=EditPrivatePass&t=mini',
        method: "post",
        header: {
          'content-type': 'application/json',
          'token': wx.getStorageSync('token')
        },
        data: {
          wechatUserEncrptPassOld: e.detail.value.oldNotePass,
          wechatUserEncrptPassNew: e.detail.value.newNotePass,
          wechatUserEncrptPassNewConfirm: e.detail.value.confirmNotePass,
        },
        success: res => {
          var result = res.data;
          if (result.status == 1) {
            wx.showToast({
              title: result.message,
              icon: 'success',
              duration: 1500
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.GetPrivatePassInfo();
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