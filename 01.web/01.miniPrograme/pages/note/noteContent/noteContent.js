//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //
    formats: {},
    //默认内容
    placeholder: '开始书写...',
    //编辑器高度
    editorHeight: 300,
    //用户键盘高度
    keyboardHeight: 0,
    //是否为ios设备
    isIOS: false,

    //笔记内容
    formNoteContent: {
      noteId: null,
      noteTitle: '',
      noteContent: '',
      noteCreateTime: '',
      noteLastEditTime: '',
      noteEncryptStatus: null,
      noteLockStatus: null,
      tagList: []
    },

    formCurrentSelect: {
      noteId: null,
    },

    /**
     * 临时变量
     */
    tempTagName: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //键盘相关
    const platform = wx.getSystemInfoSync().platform
    const isIOS = platform === 'ios'
    this.setData({
      isIOS
    })
    const that = this
    this.updatePosition(0)
    let keyboardHeight = 0
    wx.onKeyboardHeightChange(res => {
      if (res.height === keyboardHeight) return
      const duration = res.height > 0 ? res.duration * 1000 : 0
      keyboardHeight = res.height
      setTimeout(() => {
        wx.pageScrollTo({
          scrollTop: 0,
          success() {
            that.updatePosition(keyboardHeight)
            that.editorCtx.scrollIntoView()
          }
        })
      }, duration)
    })

    //笔记相关

  },

  //键盘高度发生变化触发
  //初始时候会主动调用传入参数0
  updatePosition(keyboardHeight) {
    //导航栏高度
    const toolbarHeight = 60
    //获取设备窗口尺寸
    const {
      windowHeight,
      platform
    } = wx.getSystemInfoSync()
    //如果键盘高度大于0 即用户处于编辑状态 则将编辑器高度设置为：设备高度 - 键盘高度 - 导航栏高度
    //如果键盘高度小于等于0 则将编辑器高度设置为设备高度
    let editorHeight = keyboardHeight > 0 ? (windowHeight - keyboardHeight - toolbarHeight) : windowHeight
    this.setData({
      editorHeight,
      keyboardHeight
    })
    console.log('触发 updatePosition')
  },
  //编辑器ready后触发
  onEditorReady() {
    const that = this
    //选择器
    wx.createSelectorQuery().select('#editor').context(function (res) {
      that.editorCtx = res.context
      //获取html内容进行渲染
      that.GetNoteContent();
    }).exec()
    console.log('触发 onEditorReady')
  },
  //触摸结束触发
  format(e) {
    let {
      name,
      value
    } = e.target.dataset
    if (!name) return
    // console.log('format', name, value)
    this.editorCtx.format(name, value)
    console.log('触发 format')
    console.log(e.target.dataset)
  },
  //编辑器文本发生变化触发
  onStatusChange(e) {
    const formats = e.detail
    this.setData({
      formats
    })
  },
  //插入图片
  insertImage() {
    const that = this
    wx.chooseImage({
      count: 1,
      success: function (res) {
        that.editorCtx.insertImage({
          src: res.tempFilePaths[0],
          data: {
            id: 'abcd',
            role: 'god'
          },
          width: '80%',
          success: function () {
            console.log('insert image success')
          }
        })
      }
    })
    console.log('触发 insertImage')
  },

  //编辑器文本发生变化
  EditNoteContent(e) {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: app.globalData.domain + '/api.php?c=note&a=EditNoteContent&t=mini',
        method: "post",
        header: {
          'content-type': 'application/json',
          'token': wx.getStorageSync('token')
        },
        data: {
          noteId: wx.getStorageSync('currentSelectNoteId'),
          noteContent: e.detail.html,
          noteContentText: e.detail.text,
          noteContentDelta: e.detail.delta
        },
        success: res => {
          var result = res.data;
          if (result.status == 1) {
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

  //获取笔记内容和标签列表
  GetNoteContent() {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: app.globalData.domain + '/api.php?c=note&a=GetNoteContent&t=mini',
        method: "post",
        header: {
          'content-type': 'application/json',
          'token': wx.getStorageSync('token')
        },
        data: {
          noteId: wx.getStorageSync('currentSelectNoteId')
        },
        success: res => {
          var result = res.data;
          if (result.status == 1) {
            that.setData({
              formNoteContent: result.data
            })
            //为编辑器赋值
            that.editorCtx.setContents({
              html: result.data.noteContent
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

  //显示
  ModalShowTag() {
    this.setData({
      modalShowTag: true
    })
  },

  //隐藏
  ModalHideTag() {
    this.setData({
      modalShowTag: false
    })
  },

  //绑定输入
  BindInputTag(e) {
    this.setData({
      tempTagName: e.detail.value
    })
  },

  //确定添加
  AddNoteTag() {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: app.globalData.domain + '/api.php?c=tag&a=AddNoteTag&t=mini',
        method: "post",
        header: {
          'content-type': 'application/json',
          'token': wx.getStorageSync('token')
        },
        data: {
          noteId: wx.getStorageSync('currentSelectNoteId'),
          tagName: that.data.tempTagName
        },
        success: res => {
          var result = res.data;
          if (result.status == 1) {
            that.setData({
              modalShowTag: false
            })
            that.GetNoteContent();
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

  //删除
  DelNoteTag(e) {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: app.globalData.domain + '/api.php?c=tag&a=DelNoteTag&t=mini',
        method: "post",
        header: {
          'content-type': 'application/json',
          'token': wx.getStorageSync('token')
        },
        data: {
          tagId: e.currentTarget.dataset.tagid
        },
        success: res => {
          var result = res.data;
          if (result.status == 1) {
            wx.showToast({
              title: '已删除',
              icon: 'success',
              duration: 1500
            })
            that.GetNoteContent();
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