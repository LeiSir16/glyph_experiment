# Glyph实验

## 1. 项目运行
### 1.1 安装`npm`
```
npm install
```
### 1.2 编译并运行项目
```
npm run serve
```
### 1.3 打包项目
```
npm run build
```
## 2. 差值实验
### 2.1 实验数据记录
#### 2.1.1 文件格式
```
Json
```
#### 2.1.2 字段说明
```
{
  // 用户信息
  "userInfor": {
    "sId": 自动生成的用户id,年月日时分秒拼串
    "sex": 性别,
    "name": 用户名,
    "age": 年龄
  },
  // 第一个实验：差值实验
  "ExperimentB": {
    "startTime": 整个实验开始时间，精确到毫秒，例如"2022-12-03 18:47:05.126",
    "endTime": 整个实验结束时间，精确到毫秒，例如"2022-12-03 18:47:46.294",
    // 每一个小实验，数组存储
    "childExperiment": [
      {
        "glyphType": glyph类型，1为peaGlyph，2为stripeGlyph,
        "stripeNum": glyph的圆圈或条纹数量，10,20,40
        "stripeValue": glyph中单个圆圈或条纹编码的值，如1,
        "startTime": 该小实验开始的时间，精确到毫秒，如"2022-12-03 18:47:23.703",
        "endTime": 该小实验结束的时间，精确到毫秒，如"2022-12-03 18:47:27.630",
        "submitResultTime": 用户保存结果的时间，精确到毫秒，如"2022-12-03 18:47:26.656",
        "chooseValue": 用户选择的值，保留小数点两位，0.02,
        "correctValue": 正确的值，2.23155007531387,
        "countryInfo": [    // 随机的ssi数据 2个城市
          {
            "id": 自动生成的id字符串,
            "index": 国家编号,
            "city": 国家名,
            "data": [   //数据
              {
                "name": 数据名,
                "value": 数据值
              }]
        ],
        "findAttr": 任务要求用户查找的数据，如"Population_Growth"
      }  
    ]
  }
}
```

