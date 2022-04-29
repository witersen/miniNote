//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //用户身份
    wechatRole: null,
    wechatRoleName: '未知',
    //授权提示框显示状态
    isShowLogin: false,
    //用户信息
    userInfo: [],
  },

  //跳转
  GotoPage(e) {
    if (!wx.getStorageSync('token') || wx.getStorageSync('token') == '') {
      wx.showToast({
        title: '请授权登录',
        icon: 'error',
        duration: 1500
      })
      return
    }
    //携带参数跳转到新页面
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    })
  },

  /**
   * 授权登录
   */
  loginNow() {
    let that = this;
    //隐藏之前的提示框
    that.setData({
      isShowLogin: false
    })
    wx.showLoading({
      title: 'loading',
    })
    //先进行弹框授权 调用 wx.getUserProfile
    wx.getUserProfile({
      desc: '用于用户登录',
      success: (res) => {
        //存入全局变量
        app.globalData.userInfo = res.userInfo
        //存入storage
        wx.setStorageSync('userInfo', res.userInfo)
        //用户同意后执行静默登录
        app.GetTokenByCode().then(function (res) {
          //将用户信息存入后端
          app.setWechatuserAvatarNickname().then(function (res) {
            wx.hideLoading();
            //成功提示
            wx.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 1500
            })
            //重新加载
            that.onLoad();
          })
        })
      },
      fail: (res) => {
        wx.hideLoading();
        //失败提示
        wx.showToast({
          title: '授权失败',
          icon: 'error',
          duration: 1500
        })
      }
    })
  },

  /**
   * 退出登录
   */
  loginOut() {
    let that = this;
    //清除本地token和userInfo
    wx.removeStorageSync('token', '');
    wx.removeStorageSync('userInfo', '');
    //清除变量
    that.userInfo = [];
    //延迟动画实现平滑退出登录
    wx.showLoading({
      title: 'loading',
    })
    setTimeout(function () {
      wx.hideLoading()
      //定时跳转
      wx.reLaunch({
        url: '/pages/note/index/index'
      })
    }, 800)
  },

  /**
   * 隐藏授权提示框
   */
  hideLoginModal() {
    this.setData({
      isShowLogin: false
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    //检查本地有无token
    if (!wx.getStorageSync('token') || wx.getStorageSync('token') == '') {
      //弹出授权框
      that.setData({
        isShowLogin: true,
      })
      return
    }
    // //有token
    // wx.showLoading({
    //   title: 'loading',
    //   mask: true,
    // })
    //读取个人头像和昵称信息
    that.setData({
      userInfo: wx.getStorageSync('userInfo')
    })
    // //停止动画
    // wx.hideLoading();
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
    let that = this;
    that.onLoad()
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