import WeCropper from '../we-cropper/we-cropper.js'

const device = wx.getSystemInfoSync()
const width = device.windowWidth
const height = device.windowHeight - 50
const app = getApp()
var wxUtil = require("../../utils/util.js")
Page({
  data: {
    cropperOpt: {
      id: 'cropper',
      width,
      height,
      scale: 2.5,
      zoom: 8,
      cut: {
        x: (width - 300) / 2,
        y: (height - 300) / 2,
        width: 300,
        height: 300
      }
    }
  },
  touchStart (e) {
    this.wecropper.touchStart(e)
  },
  touchMove (e) {
    this.wecropper.touchMove(e)
  },
  touchEnd (e) {
    this.wecropper.touchEnd(e)
  },
  getCropperImage () {
    var that = this;

    this.wecropper.getCropperImage((avatar) => {
      if (avatar) {
        console.log(avatar)
        //  获取到裁剪后的图片
        
        wx.uploadFile({
          url: app.globalData.api_url + "/fileUpload", // 后台 java 上传接口
          filePath: avatar,
          name: 'file',
          formData:
              {
                  wxid: wxUtil.getUserId()
              },
          success(res) {
              console.log('------------ res.data --------- ')
              var resp_data = JSON.parse(res.data);

              console.log(resp_data);
              if (resp_data.result == "success") {
                  console.log(app.globalData.img_url + resp_data.data.fileSrc);
                  that.setData({
                      id: resp_data.data.id,
                      avator_url: resp_data.data.fileSrc,
                      head_url: app.globalData.img_url + resp_data.data.fileSrc,
                      save: false
                  });
                // var pages = getCurrentPages(); // 获取页面栈

                // var currPage = pages[pages.length - 1]; // 当前页面

                // var prevPage = pages[pages.length - 2]; // 上一个页面

                // prevPage.setData({
                //   mydata: { 
                //     id: resp_data.data.id,
                //     avator_url: resp_data.data.fileSrc,
                //     head_url: app.globalData.img_url + resp_data.data.fileSrc,
                //     save: false
                //    } // 假数据
                // })
                let pages = getCurrentPages();
                let prevPage = pages[pages.length - 2];
                prevPage.setData({
                  id: resp_data.data.id,
                  avator_url: resp_data.data.fileSrc,
                  head_url: app.globalData.img_url + resp_data.data.fileSrc,
                  save: false
                })
                wx.navigateBack({
                  delta: 1,
                })
                
          
              }
                // wx.navigateBack({
                //   delta: 1
                // })
                
            },
            fail: function (errMsg) {
                console.log(errMsg);
            }
        });
      } else {
        console.log('获取图片失败，请稍后重试')
      }
    })
  },
  uploadTap () {
    const self = this

    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success (res) {
        const src = res.tempFilePaths[0]
        //  获取裁剪图片资源后，给data添加src属性及其值

        self.wecropper.pushOrign(src)
      }
    })
  },
  onLoad (option) {
    const { cropperOpt } = this.data

    if (option.src) {
      cropperOpt.src = option.src
      new WeCropper(cropperOpt)
        .on('ready', (ctx) => {
          console.log(`wecropper is ready for work!`)
        })
        .on('beforeImageLoad', (ctx) => {
          console.log(`before picture loaded, i can do something`)
          console.log(`current canvas context:`, ctx)
          wx.showToast({
            title: '上传中',
            icon: 'loading',
            duration: 20000
          })
        })
        .on('imageLoad', (ctx) => {
          console.log(`picture loaded`)
          console.log(`current canvas context:`, ctx)
          wx.hideToast()
        })
        .on('beforeDraw', (ctx, instance) => {
          console.log(`before canvas draw,i can do something`)
          console.log(`current canvas context:`, ctx)
        })
        .updateCanvas()
    }
  }
})
