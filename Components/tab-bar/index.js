//初始化数据
function tabbarinit() {
  return [{
      "current": 0,
      "pagePath": "../../pages/index/index",
      "iconPath": "../../images/N_tab_home@2x.png",
      "selectedIconPath": "../../images/S_tab_home@2x.png",
      "text": "主页"
    },
    {
      "current": 0,
      "pagePath": "../../pages/personal_center/personal_center",
      "iconPath": "../../images/N_tab_wode@2x.png",
      "selectedIconPath": "../../images/S_tab_my@2x.png",
      "text": "我的"
    },

  ]
}
//tabbar 主入口
function tabbarmain(bindName = "tabdata", id, target) {
  var that = target;
  var bindData = {};
  var otabbar = tabbarinit();
  if (id > 1) {
    bindData[bindName] = otabbar
    that.setData({
      bindData
    });
  } else {
    otabbar[id]['iconPath'] = otabbar[id]['selectedIconPath'] //换当前的icon
    otabbar[id]['current'] = 1;
    bindData[bindName] = otabbar
    that.setData({
      bindData
    });
  }

}

module.exports = {
  tabbar: tabbarmain
}