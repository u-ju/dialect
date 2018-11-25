// pages/release_video/release_video.js
const app = getApp();
var wxUtil = require("../../utils/util.js")
var template = require('../../Components/tab-bar/index.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isVertical:'contain',
    items: [{
      id: 1,
      // src: 'https://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400',
      // poster: 'http://ow74m25lk.bkt.clouddn.com/shilan.jpg'
      src: "",
      poster: ""
    }],
    // cj: ["公司团建", "聚会", "吃饭", "婚礼", "户外", "室内"],
    // gx: ["朋友", "情侣", "师生", "亲子", "上下级"],
    // rs: ["1人", "2人", "3人", "4人", "多人"],
    bq: [],
    // cj_check: 0,
    // gx_check: 0,
    // rs_check: 0,
    curr: {
      cj: 0,
      gx: 0,
      rs: 0
    },
    label: "",
    add_hidden: 1,
    rv_input: '',
    // link:1,
    // linkname: ["link1"],
    link: [
      { index: 1, linkname: "link1" },
    ],
    firstPlay: true, // 第一次播放
    isBtnHide: true, // 3个标签就隐藏添加按钮
    labels: [], // 标签搜索分类
    name: [], // 标签分类名称

    clickOne: false, // 非禁用状态
    uploadFinish: false, // 上传是否完成
    wxid: "",
    click:true,
    add_link:1,
    add_link_fir:0,
    fileName:"huhu"
  },
  outbtn(){
    this.setData({
      add_hidden:1,
      label:""
    })
  },
  inbtn(){
    console.log(1)
    this.setData({
      add_hidden: 0,
    })
  },
  link_fir(e){
    var that =this
    console.log(e.currentTarget.dataset.linkname)
    console.log(that.data.link)
    if (e.currentTarget.dataset.linkname == that.data.link.length){
      var add_link_fir=0
      if (e.detail.value){
        add_link_fir=1
      }else{
        add_link_fir=0
      }
      that.setData({
        add_link_fir: add_link_fir
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  
  getSignature: function (callback) {
    wx.request({
      url: app.globalData.api_url + "/video/cos",
      method: 'POST',
      
      dataType: 'json',
      success: function (res) {
        if (res.data.result =='success' && res.data.data) {
          console.log(res)
          return callback(res.data.data);
        } else {
          return '获取签名失败';
        }
      }
    });
  },
  onLoad: function (options) {
    var that = this;
    that.setData({
      wxid: wxUtil.getUserId()
    })
    
    if(!wx.getStorageSync("phone")){
      var formUser = {
        apiUrl: app.globalData.api_url + "/person/show", //  个人信息接口
        data: {
          wxid: wxUtil.getUserId(),
        }
      }
      wxUtil.postJSON(formUser, function (res) {
        console.log(res)
        if (res.data.result == "success") {
          var userInfo = res.data.data;
          console.log(userInfo)
          if (!userInfo.phone) {
            wx.showModal({
              content: '请先绑定手机号',
              showCancel: false,
              complete() {
                wx.navigateTo({
                  url: '../modification_infor/modification_infor',
                })
              }
            })
          }
        }
      });
    }
    
    var form = {
      apiUrl: app.globalData.api_url + "/search/tag",
    }

    wxUtil.postJSON(form, function (res) {
      if (res.statusCode == 200 && res.data.result == "success") {
        var labelItem = res.data.data;
        if (labelItem.length > 0) {
          var labels = labelItem,
            name = []
          for (var a = 0; a < labels.length; a++) {
            labels[a]["checked"] = -1
            name.push(labels[a].name)
          }
          console.log(labels);
          that.setData({
            labels: labels,
            name: name
          })
        }
      } else {
        console.log(res)
        wxUtil.info_dialog("网络连接超时!");
      }
    });
  },

  


  /**
   * 用户上传视屏
   */
  uploadVideo: function () {
    var that = this;
    var fileName = wxUtil.formatTime(new Date());
    console.log(fileName)
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      compressed:false,
      success(res) {
        console.log(res);
        var tempFilePaths = []; 
        tempFilePaths.push(res.tempFilePath);
        console.log(tempFilePaths);
        var tempFilesSize = res.size;
        if (tempFilesSize <= 25 * 1024 * 1024) {
          if (that.allowUploadFormat(tempFilePaths)) {
            wxUtil.loading("正在上传视频中 ....");
            wx.uploadFile({
              url: app.globalData.api_url + "/fileUpload", // 后台 java 上传接口
              filePath: res.tempFilePath,
              name: 'file',
              formData: { wxid: wxUtil.getUserId() },
              success(res) {
                console.log(res);
                var resp_data = JSON.parse(res.data); // JSON string 转换为 JSON object , resp_data 响应的数据包
                if (resp_data.result == "success") {
                  // 检测文件大小不合法提示
                  if (resp_data.status == 1) {
                    // 文件为空
                    wxUtil.info_dialog(resp_data.msg);
                    return false;
                  } else if (resp_data.status == 2) {
                    // 文件大小不合法
                    wxUtil.info_dialog("请选择小于25MB的视屏哦~");
                    return false;
                  }

                  wxUtil.info_dialog("视频上传已完成!");
                  console.log('-------------- upload finished -----------');
                  let videoUrl = resp_data.data.url;  // 视屏播放地址
                  let picUrl = app.globalData.img_url + resp_data.data.thumbSrc;    // 视屏封面地址

                  //  视屏播放地址 , 视屏封面地址 -> 相对路径
                  let video_url = resp_data.data.fileSrc;
                  let pic_url = resp_data.data.thumbSrc;

                  console.log(videoUrl);
                  console.log(resp_data);
                  console.log(picUrl);

                  var item = [];
                  item.push({
                    id: resp_data.data.id,
                    src: videoUrl,
                    poster: picUrl,
                    video_url: video_url,
                    pic_url: pic_url
                  });

                  that.setData({
                    uploadFinish: true,
                    items: item,
                    picUrl: picUrl
                  });
                  console.log(that.data.items)
                } else {
                  wxUtil.info_dialog("视频上传异常!");
                }
              },
              fail: function (res) {
                // console.log('视屏上传网络超时.')
                console.log(res)
                wxUtil.info_dialog("视屏上传网络超时!");
              }

            });
            
          } else {
            wxUtil.info_dialog("视频上传格式只允许MP4!")
          }
        } else {
          wxUtil.info_dialog("请选择小于25MB的视屏哦~");
        }

        console.log(tempFilesSize)

      }
    });
    wx.hideLoading();
  },
  add_pic() {
    console.log(1)
    var that = this;
    that.setData({
      add_hidden: 0
    })
  },
  /**
   * 上传头像格式验证
   * @param tempFiles 头像图片
   * @returns {boolean} true 检测通过 false 检测失败
   */
  allowUploadFormat: function (tempFiles = []) {
    // 允许上传的视屏格式
    var allow_head_photo = ['.mp4'];

    for (let idx in tempFiles) {
      if (tempFiles[idx].match(/\.mp4/)) {
        var upload_pic_ext = tempFiles[idx].match(/\.mp4/)[0].trim();
        var allow_format = allow_head_photo.join("");
        if (allow_format.indexOf(upload_pic_ext) >= 0) {
          return true;
        }
      }
      return false;
    }
  },

  /**
   * 视屏播放
   * @param e
   */
  videoPlay(e) {
    console.log(e);
    this.setData({
      curr_id: e.currentTarget.dataset.id,
    });
    this.videoContext.play();
    // 第一次播放，传递播放量
    if (this.data.firstPlay) {
      console.log("first play !")
      this.data.firstPlay = false;
    }

    // 播放或者暂停过不在执行
    if (!this.data.firstPlay) {
      this.data.firstPlay = false;
    }
  },

  checked(e) {
    var that = this;
    var tag_list = [], kwd = ''; // 标签列表, 关键词

    var labels = that.data.labels,
      name = that.data.name
    console.log(e.currentTarget.dataset.curr + "--------------" + e.currentTarget.dataset.index)
    
    for (var i in name) {
      if (e.currentTarget.dataset.curr == name[i]) {
        if (labels[i].checked == e.currentTarget.dataset.index){
          labels[i].checked = -1;
        }else{
          labels[i].checked = e.currentTarget.dataset.index;
        }
        
      }
    }
    console.log(labels)
    that.setData({
      labels: labels
    })

    for (var i in labels) {
      if (labels[i].checked > -1) {
        tag_list.push(labels[i].tags[labels[i].checked].tagName);
      }
    }
    
    that.setData({
      labelValue: tag_list.join(",")
    })
    console.log(that.data.labelValue)
  },
  label(e) {
    var that = this;
    that.setData({
      label: e.detail.value
    })
  },

  add_pic() {
    var that = this;
    that.setData({
      add_hidden: 0
    })
  },

  /**
   * 用户添加自定义标签
   */
  add() {
    var that = this;
    var bq = that.data.bq;
    // 每个字符长度最多为4
    if (that.data.label.length < 1 || that.data.label.length > 4) {
      wxUtil.info_dialog("请添加一个个性标签");
      return false;
    }

    // 用户自定义标签最多只能3个
    if (that.data.bq.length >= 3) {
      wxUtil.info_dialog("最多添加3个标签");
      return false;
    }

    if (that.data.label) {
      bq.push(that.data.label);
      console.log(bq);
      console.log(that.data.label);
      that.setData({
        bq: bq,
        add_hidden: 1,
        label: ""
      })
      console.log(bq)
      // 添加3个标签后，就隐藏添加标签按钮
      if (bq.length == 3) {
        console.log(bq.length)
        that.setData({
          bq: that.data.bq,
          add_hidden: 1,
          label: "",
          isBtnHide: false
        });
        return false;
      }

    } else {
      wx.showToast({
        title: '请输入标签',
        icon: "none"
      });
    }
  },
  add_link(e) {
    var that = this;
    var link = that.data.link
    var index_val = parseInt(link[link.length - 1].index) + 1;
    var newlink = { index: index_val, linkname: "link" + index_val };
    var add_link=1
    console.log(link.length)
    if (link.length==2){
      add_link=0
    }
    that.setData({
      link: link.concat(newlink),
      add_link: add_link,
      add_link_fir:0
    })
    console.log(that.data.link)
  },
  del_link(e) {
    var that = this;
    var link = that.data.link
    console.log(e.currentTarget.dataset.linkname)
    for (var a = 0; a < link.length; a++) {
      if (link[a].linkname == e.currentTarget.dataset.linkname) {
        link.splice(a, 1);
      }
    }

    that.setData({
      link: link,
      add_link:1,
    })
    console.log(that.data.link)
  },
  del_bq(e) {
    console.log(e.currentTarget.dataset.name)
    var bq = this.data.bq;
    var that = this;
    for (var key in bq) {
      console.log(bq[key])
      if (bq[key] == e.currentTarget.dataset.name) {

        wx.showModal({
          content: '确定删除[' + e.currentTarget.dataset.name + ']标签吗？',
          success: function (res) {
            if (res.cancel) { } else {
              bq.splice(key, 1);
              that.setData({
                bq: bq,
                add_hidden:1,
                isBtnHide: true
              })
            }
          },

        })
      }
    }

  },
  del_video() {
    var that = this;
    wx.showModal({
      content: '确定删除该视频吗？',
      success: function (res) {
        if (res.cancel) {

        } else {
          var form = {
            apiUrl: app.globalData.api_url + "/file/delete",  //  视屏发布接口
            data: {
              wxid: that.data.wxid,
              id: that.data.items[0].id
            }
          }
          wxUtil.postJSON(form, function (res) {
            // 防止用户多次提交
            that.btnDisable(that);
            console.log(res)
            // 用户发布视屏成功后, 启用按钮
          });
          var items = [{ id: 1, src: '', poster: '' }]
          that.setData({
            items: items
          })
        }
      },

    })
  },
  /**
   * 用户发布视屏信息
   * @param ev
   */
  // formSubmit: function (e){
  //   var that =this;
  //   var lables = that.data.labels,tags=[];
  //     for (var i in lables) {
  //     if (lables[i].checked > -1) {
  //       tags.push(lables[i].tags[lables[i].checked].tagName);
  //     }

  //   }
  //   console.log(tags)
  // },
  formSubmit: function (e) {
    var that = this;
    var dataForm = e.detail.value; // 表单提交数据, [ title, rule, link ]
    var tags = [];    // 全部数据,  ["吃饭", "师生", "3人"] tags
    var labelMy = that.data.bq // 自定义标签, 删除第一个"示例"
    var items = that.data.items[0]; // video [{ id: 1, src: video_url, poser: pic_url}]
    var wxid = that.data.wxid; // 获取发布用户wxid

    // 验证标题 和 网址   {rv_input: "1111", link1: "http:/www.baidu", rule: "2222"}
    var title = dataForm.rv_input.trim();
    var rule = dataForm.rule.trim();
    var links = [];
    var video_url = (items.video_url != undefined) ? items.video_url : ''; // 用户上传视屏的url
    var pic_url = (items.pic_url != undefined) ? items.pic_url : ''; // 用户上传视屏的封面url

    var lables = that.data.labels;

    for (var i in lables) {
      if (lables[i].checked > -1) {
        tags.push(lables[i].tags[lables[i].checked].tagName);
      }

    }

    // console.log('------------- data --------------');
    // console.log(tags);

    // console.log('------------- video --------------');
    // console.log(video_url);
    // console.log(pic_url);

    // 自定义标签如果只有一个设置为""
    labelMy = labelMy.join(",");

    // console.log('------------- dataform --------------');
    // console.log(dataForm);
    // console.log('------------- tags --------------');
    // console.log(tags);
    // console.log(labelMy);

    // 验证获取wxID 是否为空
    if (wxid == undefined) {
      wxUtil.info_dialog("抱歉,获取你的微信失败~");
      return false;
    }

    // 验证视屏上传是否完成
    if (!that.data.uploadFinish) {
      wxUtil.info_dialog("请选择要上传的视屏~02");
      return false;
    }

    //  用户必须上传视屏,才能发布小视频
    if (video_url == "" || pic_url == "") {
      wxUtil.info_dialog("请选择要上传的视屏~01");
      return false;
    }

    // 标题不为空，就提示验证
    if (title.length < 1 || title.length > 10) {
      wxUtil.info_dialog("请输入游戏名称,10字符以内");
      return false;
    }

    // 规则不为空，就验证
    if (rule != "") {
      if (rule.length < 1 || rule.length > 1000) {
        wxUtil.info_dialog("请简要介绍游戏规则，1000字符以内");
        return false;
      }
    }

    var linkNames = this.getLinkName(dataForm);
    // 网址不为空进行验证
    if (linkNames.length > 0) {
      for (let index in linkNames) {
        var linkOne = dataForm[linkNames[index]];
        console.log(linkNames[index]);
        console.log(linkOne);
        if (!wxUtil.isValidURL(linkOne)) {
          wxUtil.info_dialog("[" + linkOne + " ] 这条网址是无效的");
          return false;
        }
        links.push(linkOne);
      }

      // 合法网址填写个数验证
      if (linkNames.length < 1 || linkNames.length > 3) {
        wxUtil.info_dialog("你已填写 " + linkNames.length + "个, 只能填写3个");
        return false;
      }
    }

    // 如果没有填写网址
    links = (links.length == 0) ? '' : links.join(",");

    // 接口接收表单名称 [ title, pic_url, video_url, rule, my_label, links, tags ]
    var form = {
      apiUrl: app.globalData.api_url + "/publish/save",  //  视屏发布接口
      data: {
        wxid: wxid,
        title: title,
        tags: tags.join(","),
        selfTag: labelMy,
        rules: rule,
        linkUrl: links,
        fid: that.data.items[0].id
        // preImg: pic_url,
        // url: video_url
      }
    }

    // console.log("------------- send server ------------");
    // console.log(form);

    // post data to java
    if(that.data.click){
      that.setData({
        click: false,
        clickOne: true
      })
      console.log("疯狂按钮")
      wxUtil.postJSON(form, function (res) {
        // 网络延迟问题，防止多次提交
        that.btnEnable(that);
        // 用户发布视屏成功后, 启用按钮
        if (res.data.result == "success") {
          // 用户发布视屏成功后, 启用按钮
          that.btnDisable(that);
          wxUtil.info_dialog("开心, 发布视频成功~");
          
          // 延迟跳转默认3秒，可自定义
          wxUtil.deplay_redirect('/pages/personal_center/personal_center?ing=1');
        } else {
          wxUtil.info_dialog("发布视频失败");
          that.setData({
            click: true,
            clickOne: false
          })
        }
      });
    }
    
  },

  /**
   * 启用按钮
   * @param that
   */
  btnDisable: function (that = this) {
    that.setData({
      clickOne: true
    });
  },

  /**
   * 禁用按钮
   * @param that
   */
  btnEnable: function (that = this) {
    that.setData({
      clickOne: false
    });
  },

  /**
   * 返回用户填写的link 名称: link1, link2 ....
   * @param dataForm 表单数据 [ title, rule, link ]
   * @returns {string}
   */
  getLinkName: function (dataForm) {
    var linkNames = []; // 多个link 名称
    for (let index in dataForm) {
      if (dataForm[index] != "" && /^link/.test(index)) {
        linkNames.push(index);
      }
    }
    return linkNames;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.videoContext = wx.createVideoContext('myVideo');
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