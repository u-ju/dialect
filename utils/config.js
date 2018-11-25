// var fileHost = "http://game7911.oss-cn-hangzhou.aliyuncs.com"//阿里云地址
var fileHost ="https://game7911.oss-cn-hangzhou.aliyuncs.com";
var config = {
  //aliyun OSS config
  uploadImageUrl: `${fileHost}`, //默认存在根目录，可根据需求改
  AccessKeySecret: '33LVF6LrNJ3iDXBigWKecQccXsKPDS',//33LVF6LrNJ3iDXBigWKecQccXsKPDS
  OSSAccessKeyId: 'LTAIyqTw2ge3Gy6B',//LTAIyqTw2ge3Gy6B
  timeout: 87600,//这个是上传文件时Policy的失效时间
  BucketName :"game7911"
};
module.exports = config
