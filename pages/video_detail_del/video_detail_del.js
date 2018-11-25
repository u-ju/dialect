const app = getApp();
var wxUtil = require("../../utils/util.js")

Page({
    data: {
        curr_id: '',
        items: '',
        dianzan_con: [{
            id: 0,
            img: "../../images/N_icon_dianzan@2x.png",
            text: 14253
        },
            {
                id: 1,
                img: "../../images/S_icon_dianzan@2x.png",
                text: 14253
            }
        ],
        

        dianzan: {
            id: 1,
          img: "../../images/S_icon_dianzan@2x.png",
            text: 14253
        },
        detail: [], // 视频详情
      width: 750,
      height: 400
    },
    hhh(e) {
      console.log(e)
    },
    onReady: function () {
        this.videoContext = wx.createVideoContext('myVideo')
    },

    /**
     * 播放视频
     * @param e
     */
    videoPlay(e) {
        this.setData({
            curr_id: e.currentTarget.dataset.id,
        })
        this.videoContext.play();
    },

    dianzan_num(e) {
        var that = this;
        that.setData({
            dianzan: that.data.dianzan_con[Number(!e.currentTarget.dataset.id)],
            "dianzan.text": parseInt(that.data.dianzan.text) + 1,
        });
    },

    shoucang(e) {
        var thst = this;
        thst.setData({
            shoucang: thst.data.shoucang_con[Number(!e.currentTarget.dataset.id)]
        })
    },

    onLoad: function (options) {
      wx.showLoading()
        var that = this;
        var vid = options.vid;
        that.setData({
          wxid:wxUtil.getUserId()
        })
      var wxid = wxUtil.getUserId();
        console.log('------------ vid --------- ' + vid);

        var dataForm = {
            apiUrl: app.globalData.api_url + "/perVideo/info",  //  个人视屏详情信息接口
            data: {
                wxid: wxid,
                vid: vid
            }
        }

        wxUtil.postJSON(dataForm, function (res) {
          var video=res.data.data
            if (res.data.result == "success") {
              
                // 视频详情
              
                var detailVideo = res.data.data;

                var items = [];
                var json = {
                    id: 1,
                    poster: app.globalData.img_url + detailVideo.thumb,
                    src: detailVideo.url,
                }
                items.push(json);
                console.log(items);

                that.setData({
                    detail: detailVideo,
                    tag: wxUtil.replaceStr(detailVideo.tag),
                    items: items,
                });
              wx.hideLoading()
            } else {
              wxUtil.info_dialog("视频加载超时.");
            }
        });

    },

    // 删除视屏
    trash_video: function () {
        var that = this;
        var wxid = that.data.wxid;
        var vid = that.data.detail.id;
        var title = that.data.detail.title;

        wx.showModal({
            title: '删除视频',
            content: '确定删除 [ ' + title + ' ] 这部作品吗？',
            success: function (sm) {
                if (sm.confirm) {
                    var dataForm = {
                        apiUrl: app.globalData.api_url + "/perVideo/delete",  //  个人视屏详情信息接口
                        data: {
                            wxid: wxid,
                            id: vid
                        }
                    }

                    wxUtil.postJSON(dataForm, function (res) {
                        if (res.data.result == "success") {
                            wxUtil.info_dialog("删除成功~");
                            wx.navigateBack()
                        }
                    });

                }
            }
        });
    }
})