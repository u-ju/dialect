const app = getApp();
var wxUtil = require("../../utils/util.js")

Page({
    data: {
        curr_id: '',
        items: [{
            id: 1,
            src: 'https://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400',
            poster: 'http://ow74m25lk.bkt.clouddn.com/shilan.jpg'
        },],
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
        detail: [] // 视频详情
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
        var that = this;
        var vid = options.vid;
        that.setData({
          wxid:wx.getStorageSync("wxid")
        })
      var wxid = wx.getStorageSync("wxid");
        console.log('------------ vid --------- ' + vid);

        var dataForm = {
            apiUrl: app.globalData.api_url + "/perVideo/info",  //  个人视屏详情信息接口
            data: {
                wxid: wxid,
                vid: vid
            }
        }

        wxUtil.postJSON(dataForm, function (res) {
            if (res.data.result == "success") {
                // 视频详情
                var detailVideo = res.data.data;

                var items = [];
                var json = {
                    id: 1,
                    poster: app.globalData.img_url + detailVideo.thumb,
                    src: app.globalData.img_url + detailVideo.url,
                }
                items.push(json);
                console.log(items);

                that.setData({
                    detail: detailVideo,
                    tag: wxUtil.replaceStr(detailVideo.tag),
                    items: items,
                });
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