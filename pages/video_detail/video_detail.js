// pages/video_detail/video_detail.js
// 公共部分
const app = getApp()
var wxUtil = require("../../utils/util.js")

Page({
    data: {
        curr_id: '',
        // items: [{
        //     id: 1,
        //     src: 'https://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400',
        //     poster: 'http://ow74m25lk.bkt.clouddn.com/shilan.jpg'
        // },],
        items: [],
        dianzan_con: [
            {
                id: 0,
                img: "../../images/N_icon_dianzan@2x.png",
                text: "点赞"
            },
            {
                id: 1,
                img: "../../images/S_icon_dianzan@2x.png",
                text: "已点赞"
            }
        ],
        dianzan_alert: ["点赞", "取消点赞"],
        shoucang_con: [
            {
                id: 0,
                img: "../../images/N_icon_shoucang@2x.png",
                text: "收藏"
            },
            {
                id: 1,
                img: "../../images/S_icon_shoucang@2x.png",
                text: "已收藏"
            }
        ],
        shoucang_alert: [],
        dianzan: {
            id: 0,
            img: "../../images/N_icon_dianzan@2x.png",
            text: "点赞"
        },
        shoucang: {
            id: 0,
            img: "../../images/N_icon_shoucang@2x.png",
            text: "收藏"
        },

        // 初始化前缀
        img_url: '',
        info: [],  // 视频信息
        videoId: 0, // 播放视频ID
        isZan: '', // 是否点赞

        firstPlay: true, // 第一次播放

    },
    onReady: function () {
        this.videoContext = wx.createVideoContext('myVideo')
    },
    /**
     * 视屏播放
     * @param e
     */
    videoPlay(e) {
        // 首次播放记录播放量
        if (this.data.firstPlay) {
            let videoId = this.data.videoId;
            console.log(' ----- first play video id is:' + videoId + ' ---------- ')
            // 1. 记录这个作品的播放量
            var formSubmit = {
                apiUrl: app.globalData.api_url + "/video/view",  //  播放量记录接口
                data: {
                    id: videoId,
                }
            }

            wxUtil.postJSON(formSubmit, function(res) {
                if (res.data.result == "success")
                {
                    console.log(res);
                    console.log("first play!")
                }
            });

            this.data.firstPlay = false;
        }

        // 非第一次播放, 执行事件
        if (!this.data.firstPlay) {
            this.data.firstPlay = false;
        }

        this.setData({
            curr_id: e.currentTarget.dataset.id,
        })
        this.videoContext.play()
    },

    /**
     * 视屏点赞
     * @param e
     */
    dianzan(e) {
        console.log(' ------ 视屏点赞 -----')
        console.log(Number(e.currentTarget.dataset.id));

        //  mid -> 微信用户id, vid -> 视屏id,
        var that = this, wxid = wxUtil.getUserId(), vid = this.data.videoId;


        if (!e.currentTarget.dataset.id) {
            // 已经点赞，取消点赞
            var form = {
                apiUrl: app.globalData.api_url + "/video/comment",  // 点赞接口
                data: {
                    vid: vid,
                    wxid: wxid,
                    type: 1,
                }
            }
        } else {
            // 没有点赞，进行点赞
            var form = {
                apiUrl: app.globalData.api_url + "/video/comment",  // 点赞接口
                data: {
                    vid: vid,
                    wxid: wxid,
                    type: 1,
                }
            }
        }

        wxUtil.postJSON(form, function (res) {
            if (res.statusCode == 200 && res.data.result == "success") {
                that.setData({
                    dianzan: that.data.dianzan_con[Number(!e.currentTarget.dataset.id)]
                });
            } else {
                wxUtil.info_dialog(res.data.data);
            }
            that.setData({
                dianzan: that.data.dianzan_con[Number(!e.currentTarget.dataset.id)]
            });
        });
    },

    /**
     * 视屏收藏
     * @param e
     */
    shoucang(e) {
        var that = this;

        //  mid -> 微信用户id, vid -> 视屏id,
        var that = this, wxid = wxUtil.getUserId(), vid = this.data.videoId;


        if (!e.currentTarget.dataset.id) {
            // 已经收藏，取消收藏
            var form = {
                apiUrl: app.globalData.api_url + "/video/comment",  // 点赞接口
                data: {
                    vid: vid,
                    wxid: wxid,
                    type: 2,
                }
            }
        } else {
            // 没有收藏，进行收藏
            var form = {
                apiUrl: app.globalData.api_url + "/video/comment",  // 收藏接口
                data: {
                    vid: vid,
                    wxid: wxid,
                    type: 2,
                }
            }
        }

        wxUtil.postJSON(form, function (res) {
            if (res.statusCode == 200 && res.data.result == "success") {
                that.setData({
                    shoucang: that.data.shoucang_con[Number(!e.currentTarget.dataset.id)]
                });
            } else {
                wxUtil.info_dialog(res.data.data);
            }
            that.setData({
                shoucang: that.data.shoucang_con[Number(!e.currentTarget.dataset.id)]
            });
        });
    },
    /**
     * 加载视屏信息
     * @param options
     */
    onLoad: function (options) {
        // 初始化 img_url
        let img_url = app.globalData.img_url;

        let wxid = wxUtil.getUserId();
        // 保存 this
        const that = this;
        // 视屏id
        that.data.videoId = options.vid;

        console.log(" ----- video id ----- " + that.data.videoId);

        let form = {
            apiUrl: app.globalData.api_url + "/video/info",
            method: "GET",
            data: {
                vid: this.data.videoId,
                wxid: wxid,
            }
        };
        wxUtil.loading();
        // 加载视屏信息
        wxUtil.postJSON(form, function (res) {
            if (res.statusCode == 200 && res.data.result == "success") {
                let video = res.data.data;

                // 如果是自己发布的视频，咱们就跳转到自己的视频详情. 要乖, 不能给自己点赞、收藏哦



                // 视屏播放信息
                let item = [{
                    id: video.id,
                    src: img_url + video.url,
                    poster: img_url + video.thumb,
                }];

                // 视屏信息
                let video_item = {
                    title: video.title,
                    intro: video.rules,
                    tag: wxUtil.replaceStr(video.tag)
                };

                // 点赞 和 收藏显示
                let zan_idx = (Number(video.zan) == 1) ? 1 : 0;
                let shoucnag_idx = (Number(video.collect) == 1) ? 1 : 0;

                that.setData({
                    items: item,
                    info: video_item,
                    dianzan: that.data.dianzan_con[zan_idx],
                    shoucang: that.data.shoucang_con[shoucnag_idx],
                });
            } else {
                wxUtil.info_dialog("视频加载超时.");
            }
        });
        
    }
})