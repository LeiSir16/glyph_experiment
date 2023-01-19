import NewTask from "@/components/NewTask.vue";
import Description from "@/components/Description.vue";
import StripeGlyph from "@/components/StripeGlyph.vue";
import PeaGlyph from "@/components/PeaGlyph.vue";
import ColorLegend from "@/components/ColorLegend.vue";
import DrawQinlingMap from "@/components/DrawQinlingMap.vue";
import {nanoid} from "nanoid";
import {getCurrentTime} from "@/assets/js/tool";
import qinling from '@/assets/js/qinling';
import * as d3 from "d3";
// 实验B中数据固定显示
export const mixinExperimentBFixedData = {
    components: {NewTask, Description, StripeGlyph, PeaGlyph, ColorLegend},
    props: ['childExperimentNum'],
    data() {
        return {
            // 当前进行实验的编号 一共是childExperimentNum * circleNum.length * glyphType.length个实验
            curActive: 1,
            // 当前进行的实验
            curExperiment: {},
            // 每个小实验的圆圈的数量
            circleNum: [10, 20, 40],
            // glyph的类型，1 peaGlyph，2 stripeGlyph
            glyphType: [1, 2],
            glyphData: [],
            peaGlyphCondition: {
                circleNum: 20,
                circleValue: 0.5,
                glyphSize: 550,
                centerDis: 3,
                outlineDis: 0.5,
                outlineOffset: 1,
                outlineThickness: 1,
                circleThickness: 0.5
            },
            stripeGlyphCondition: {
                layer_out: 2,
                is_encoding_infor: true,
                glyph_size: 550,
                metaphor_color: "#878787",
                outline_color: "#000000",
                stripe_encoding: "#E31A1C",
                division_color: "#000000",
                bg_opacity: 0,
                division_opacity: 1,
                metaphor_opacity: 0.3,
                inner_opacity: 1,
                outer_opacity: 1,
                stripe_opacity: 1,
                layer_num: 7,
                inner_radius: 2.5,
                sector_interval: 3,
                outline_thickness: 0.5,
                division_thickness: 0.5,
                stripe_proportion: 0.1,
                stripe_B_A: 0.08,
                stripe_L_R: 0.15,
                stripe_thickness: 0.07,
                encoding_value: 0.5,
            },
        }
    },
    methods: {
        /**
         * 构造整个实验的实验数据：相同条件下数据一致
         * @return {{}} 每个条件下的所有实验数据
         */
        createExperimentData() {
            const vc = this;
            let dataField;
            // 根据是否是Demo加载不同的数据
            if (vc.experimentIsDemo) {
                dataField = "ExperimentB_10";
            } else {
                dataField = "ExperimentB_20";
            }
            // 从vuex中获取相应的数据
            const sourceData = this.$store.state.ExperimentBData[dataField];
            let result = {};
            // 相应的条件
            for (const circleNumElement of vc.circleNum) {
                let conditionData = [];
                // 每种条件下实验的数量
                for (let i = 0; i < vc.childExperimentNum; i++) {
                    // 每一组实验需要两个数据
                    let chooseData = vc.randomChooseFromSourceData(sourceData, 2);
                    // 阈值是一格的大小
                    let threshold = circleNumElement === 10 ? (vc.dataMax / circleNumElement / 2) : (vc.dataMax / circleNumElement);
                    let rightAttrs = vc.findAttrDifferSignificant(chooseData[0], chooseData[1], threshold);
                    let index = Math.floor(Math.random() * rightAttrs.length);
                    let chooseAttrs = rightAttrs[index];
                    let correctValue = vc.calculateDifference(chooseData[0], chooseData[1], chooseAttrs);
                    let e_d = {
                        id: nanoid(),
                        condition: circleNumElement,
                        experimentData: vc.randomChooseFromSourceData(sourceData, 2),
                        findAttr: chooseAttrs,
                        attrAlias: chooseAttrs.split(' ').join("_"),
                        correctValue,
                        // 这两个是用来标志是否被对应的Glyph实验选择过
                        peaGlyph: false,
                        stripeGlyph: false
                    };
                    conditionData.push(e_d);
                }
                result[circleNumElement] = conditionData;
            }
            return result;
        },
        /**
         * 改变glyph的条件来
         * @param glyphType glyph的类型
         * @param condition 条件
         */
        glyphConditionChange(glyphType, condition) {
            let circleValue = this.dataMax / condition;
            if (glyphType === 1) {
                this.$set(this.peaGlyphCondition, 'circleNum', condition);
                this.$set(this.peaGlyphCondition, 'circleValue', circleValue);
                let centerDis = 0;
                switch (condition) {
                    case 10:
                        centerDis = 12;
                        break;
                    case 20:
                        centerDis = 6;
                        break;
                    case 40:
                        centerDis = 3;
                        break;
                }
                this.$set(this.peaGlyphCondition, 'centerDis', centerDis);
            } else {
                let layNum = 0, stripeProportion = 0, stripe_B_A = 0, stripe_L_R = 0;
                switch (condition) {
                    case 10:
                        layNum = 4;
                        stripeProportion = .117;
                        stripe_B_A = .08;
                        stripe_L_R = .12;
                        break;
                    case 20:
                        layNum = 6;
                        stripeProportion = .083;
                        stripe_B_A = .07;
                        stripe_L_R = .15;
                        break;
                    case 40:
                        layNum = 10;
                        stripeProportion = .072;
                        stripe_B_A = .02;
                        stripe_L_R = .1;
                        break;
                }
                this.$set(this.stripeGlyphCondition, 'layer_num', layNum);
                this.$set(this.stripeGlyphCondition, 'stripe_proportion', stripeProportion);
                this.$set(this.stripeGlyphCondition, 'stripe_B_A', stripe_B_A);
                this.$set(this.stripeGlyphCondition, 'stripe_L_R', stripe_L_R);
                this.$set(this.stripeGlyphCondition, 'encoding_value', circleValue);
            }
        }
    },
    watch: {
        curActive: {
            immediate: true,
            handler(newVal, oldVal) {
                // oldVal是undefined的时候表示第一次执行需要先生成数据和决定从哪个Glyph开始实验
                if (!oldVal) {
                    // 获取实验数据
                    this.experimentAllData = this.createExperimentData();
                    // 实验开始前就确定首先从哪个实验开始
                    this.curShowGlyph = Math.random() > 0.5 ? 1 : 2;
                }
                if (newVal - 1 === this.totalExperimentNum / 2) {
                    // 当前这个Glyph实验结束的话就切换Glyph
                    this.curShowGlyph = this.curShowGlyph === 1 ? 2 : 1;
                }
                if (newVal !== 1 && this.experimentIsDemo === false) {
                    // 因为第一个实验的开始时间在切换到这个页面的时候已经记录过了，所以不需要记录
                    this.$set(this.childExperimentRecord, "startTime", getCurrentTime());
                }
                // 随机选择出来一个数据
                this.glyphData = this.randomChooseExperimentFromData();
                // 选择出来数据之后就更新glyph的结构
                this.glyphConditionChange(this.curShowGlyph, this.glyphData.condition);
                if (this.experimentIsDemo === false) {
                    // 记录下当前实验的glyph相关数据
                    this.childExperimentRecord = {
                        ...this.childExperimentRecord,
                        glyphType: this.curShowGlyph,
                        stripeNum: this.glyphData.condition,
                        stripeValue: this.dataMax / this.glyphData.condition,
                        correctValue: this.glyphData.correctValue,
                        countryInfo: {
                            dId: this.glyphData.id,
                            data: this.glyphData.experimentData
                        },
                        findAttr: this.glyphData.attrAlias
                    };
                }
            }
        }
    },
    computed: {
        taskCondition() {
            return {
                // 前两项主要用于绘制glyph
                experiment: this.experimentId,
                isDemo: this.experimentIsDemo,
                data: this.glyphData,
                dataMax: this.dataMax,
                totalExperiment: this.totalExperimentNum,
                curExperiment: this.curActive
            }
        },
        descriptionCondition() {
            let c = {};
            if (this.glyphData) {
                c = {
                    experiment: this.experimentId,
                    glyph: this.curShowGlyph,
                    value: this.dataMax / this.glyphData.condition,
                    max: this.glyphData.condition
                }
            }
            return c;
        },
        // 总的实验个数
        totalExperimentNum() {
            return this.childExperimentNum * this.circleNum.length * this.glyphType.length;
        }
    }
};

// 一些公共的方法
export const mixinPublicFunction = {
    data() {
        return {
            dataMax: 10,
            curShowGlyph: 1,
        }
    },
    methods: {
        /**
         * 判断对应条件下的Glyph实验是否已经全部完成
         * @param glyphType Glyph的类型
         * @param condition 对应的条件
         * @return {boolean}    是否完成
         */
        glyphExperimentIsFinish(glyphType, condition) {
            let experiment = this.experimentAllData[condition];
            let glyphName = glyphType === 1 ? "peaGlyph" : "stripeGlyph";
            for (const experimentElement of experiment) {
                if (experimentElement[glyphName] === false) {
                    return false;
                }
            }
            return true;
        },
        /**
         * 将对应的实验设置为已经选择
         * @param glyphType     glyph的类型
         * @param condition     条件
         * @param id            对应数据的id
         */
        setExperimentFinish(glyphType, condition, id) {
            let glyphName = glyphType === 1 ? "peaGlyph" : "stripeGlyph";
            this.experimentAllData[condition].forEach((item, index) => {
                if (item.id === id) {
                    this.$set(this.experimentAllData[condition][index], glyphName, true);
                }
            })
        },
        /**
         * 随机选择一个条件下的数据
         * @return {*}  选择的数据
         */
        randomChooseExperimentFromData() {
            let flag = true;
            let index = 0, condition = 0;
            let glyphName = this.curShowGlyph === 1 ? "peaGlyph" : "stripeGlyph";
            // 这里的选择数据一定是Glyph的实验没有完成的情况下
            while (flag) {
                index = Math.floor(Math.random() * this.circleNum.length);
                condition = this.circleNum[index];
                if (this.glyphExperimentIsFinish(this.curShowGlyph, condition) === false) {
                    // console.log(condition, "是没完成的")
                    flag = false;
                }
            }
            let data = [...this.experimentAllData[condition]];
            let chooseData;
            flag = true;
            while (flag && data.length !== 0) {
                // 再随机选择一个数据
                index = Math.floor(Math.random() * data.length);
                if (!data[index][glyphName]) {
                    flag = false;
                    chooseData = data[index];
                } else {
                    data.splice(index, 1);
                }
            }
            // 将原数据中的这个实验设置为已经选择的状态
            this.setExperimentFinish(this.curShowGlyph, condition, chooseData.id);
            return chooseData;
        },
        /**
         * 找到两个数据中对应属性差值大于threshold的所有属性
         * @param data1     数据1
         * @param data2     数据2
         * @param threshold 阈值
         * @return {*[]} 所有符合条件的属性名
         */
        findAttrDifferSignificant(data1, data2, threshold) {
            let satisfyConditionAttrs = [];
            data1.data.forEach((item, index) => {
                if (Math.abs(item.value - data2.data[index].value) >= threshold) {
                    satisfyConditionAttrs.push(item.name);
                }
            });
            // 如果没有符合条件的就从所有的属性中随机选择
            if (!satisfyConditionAttrs.length) {
                data1.data.forEach((item, index) => {
                    satisfyConditionAttrs.push(item.name);
                });
            }
            return satisfyConditionAttrs;
        },
        /**
         * 查找数据中某个属性的值
         * @param data  数据
         * @param attr  要找的属性
         * @return {*}  数据的值
         */
        findAttrValue(data, attr) {
            for (const datum of data) {
                if (datum.name === attr) {
                    return datum.value;
                }
            }
        },
        /**
         * 计算两个数据中指定属性的差值
         * @param data1
         * @param data2
         * @param attr
         */
        calculateDifference(data1, data2, attr) {
            return Math.abs(this.findAttrValue(data1.data, attr) - this.findAttrValue(data2.data, attr));
        },
        /**
         * 从数据集中随机选择数据
         * @param data  原数据
         * @param num   选择数据的数量
         * @return {*[]} 选择的num个数据，每个数据带有一个id
         */
        randomChooseFromSourceData(data, num) {
            // 数组的赋值是浅拷贝，共用一个内存地址，因此要用深拷贝来选择数据
            let result = [];
            let sourceData = [...data];
            while (num--) {
                // 随机获取一个下标
                let index = Math.floor(Math.random() * sourceData.length);
                // 加个id方便在v-for时给key赋值
                let tmp = {
                    id: nanoid(),
                    ...sourceData[index]
                }
                result.push(tmp);
                // 这个元素选择之后就要移除，防止下次还选择到这个元素
                sourceData.splice(index, 1);
            }
            return result;
        },
    }
};

export const mixinExperimentCFixedData = {
    components: {DrawQinlingMap, NewTask, Description, ColorLegend},
    props: ['childExperimentNum'],
    data() {
        return {
            curActive: 1,
            glyphType: [1, 2],
            circleNum: [10, 40],
            currentChooseGlyph: "",
            currentChooseData: {},
            curShowData: {},
        };
    },
    methods: {
        // 排序函数，可以将数据按照某个属性降序排序
        compare(property) {
            return function (a, b) {
                // 要两层data，因为数据嵌套了两层
                let value1 = a.data.data.filter((item) => {
                    return item.name === property;
                });
                let value2 = b.data.data.filter((item) => {
                    return item.name === property;
                });
                return value2[0].value - value1[0].value;
            }
        },
        /**
         * 判断当前选择的数据与已经选择的区域的数据是否重叠冲突
         * @param hasChoosen    已经选择的数据
         * @param candidate     候选区域数据
         * @param threshold     阈值，一般是glyph的尺寸
         * @return {boolean}    是否符合条件
         */
        regionIsValid(hasChoosen, candidate, threshold) {
            for (const resultElement of hasChoosen) {
                if (Math.abs(resultElement.centerPosition[0] - candidate.centerPosition[0]) < threshold && Math.abs(resultElement.centerPosition[1] - candidate.centerPosition[1]) < threshold) {
                    return false;
                }
            }
            return true;
        },
        /**
         * 从区域中选择数据
         * @param num       需要生成数据的数量
         * @param threshold 阈值
         * @return {*[]}    选择的数据
         */
        randomChooseSomeRegions(num, threshold) {
            let chooseRegionData = [];
            let mapFeatures = [...this.featuresAndProjection.features];
            let path = this.featuresAndProjection.path;
            if (mapFeatures) {
                let findTotalTimes = 0, tryNum = 30, lastLength = 0, times = 0;
                while (chooseRegionData.length < num && findTotalTimes < 30) {
                    // 如果连续30次都没找到正确的数据，就清空重新搜索
                    if (times > 30) {
                        chooseRegionData = [];
                        mapFeatures = [...this.featuresAndProjection.features];
                        findTotalTimes++;
                    }
                    // 每查找一个区域尝试查找tryNum次
                    for (let i = 0; i < tryNum; i++) {
                        // 先随机从所有区域中选择一个区域
                        let index = Math.floor(Math.random() * mapFeatures.length);
                        let region = mapFeatures[index].properties.省C[0];
                        // 获取该区域的数据
                        let data = this.glyphData[region];
                        // 计算当前区域的中心点位置
                        let centerPosition = path.centroid(mapFeatures[index]);
                        // 构造区域数据信息
                        let regionInfo = {
                            rId: nanoid(),
                            centerPosition,
                            data
                        }
                        if (chooseRegionData.length === 0) {
                            chooseRegionData.push(regionInfo);
                            // 移除这个区域数据防止下次被选择
                            mapFeatures.splice(index, 1);
                            break;
                        } else {
                            if (this.regionIsValid(chooseRegionData, regionInfo, threshold)) {
                                chooseRegionData.push(regionInfo);
                                // 移除这个区域数据防止下次被选择
                                mapFeatures.splice(index, 1);
                                break;
                            }
                        }
                    }
                    // 根据上次循环存储数据长度是否变化判断循环了几次
                    if (lastLength !== chooseRegionData.length) {
                        lastLength = chooseRegionData.length;
                        times = 0;
                    } else {
                        times++;
                    }
                }
                // 如果在上边这么多条件下都找不到相应数据的话就直接从预设数据中随机选择一组
                if (chooseRegionData.length < num) {
                    let index = Math.floor(Math.random() * this.presetGlyphData.length);
                    chooseRegionData = this.presetGlyphData[index];
                    console.log("使用了预设的数据");
                }
            }
            return chooseRegionData;
        },
        /**
         * 随机选择一种属性
         * @return {{findAttr: string, chineseName: *}} 属性的名字和中文名称
         */
        randomChooseAttrs() {
            let qinlingAttr = this.$store.state.qinlingColorName;
            let qinlingAttrKeys = Object.keys(qinlingAttr);
            let index = Math.floor(qinlingAttrKeys.length * Math.random());
            return {
                findAttr: qinlingAttrKeys[index],
                chineseName: qinlingAttr[qinlingAttrKeys[index]]
            };
        },
        /**
         * 在实验开始前就创建所有的实验数据
         * @return {{}} 所有条件的实验数据
         */
        createGlyphData() {
            let experimentData = {};
            for (const num of this.circleNum) {
                let conditionData = [];
                for (let i = 0; i < this.childExperimentNum; i++) {
                    let findAttr = this.randomChooseAttrs();
                    let d = this.randomChooseSomeRegions(10, this.glyphSize).sort(this.compare(findAttr.findAttr));
                    // 排序之后索引为1的就是第二大值
                    let correctRegion = d[1];
                    let c = {
                        id: nanoid(),
                        data: d,
                        condition: num,
                        ...findAttr,
                        correctRegion,
                        peaGlyph: false,
                        stripeGlyph: false
                    }
                    conditionData.push(c);
                }
                experimentData[num] = conditionData;
            }
            return experimentData;
        },
        /**
         * 在地图上点击选择glyph事件，以props参数形式传递
         * @param glyphOutline
         * @param data
         */
        chooseMethod(glyphOutline, data) {
            // 如果当前已经有选择的数据的时候需要点击重新选择按钮后才能重新选择
            if (this.currentChooseGlyph && this.currentChooseData) {
                this.$message({
                    message: '请勿多选，点击【重新选择】按钮之后再进行选择!',
                    type: 'warning',
                    duration: 1500
                });
            } else {
                // 如果没有选择数据才能继续选择
                this.currentChooseGlyph = glyphOutline;
                this.currentChooseData = data;
                // 显示轮廓
                this.currentChooseGlyph.select('rect').attr('stroke-opacity', 1);
            }
        }
    },
    mounted() {
        // 重置选择事件，清除已经选择的数据，并且隐藏边框
        this.$bus.$on('newResetGlyphChoose', () => {
            if (this.currentChooseGlyph && this.currentChooseData) {
                this.currentChooseGlyph.select('rect').attr('stroke-opacity', 0);
                this.currentChooseGlyph = '';
                this.currentChooseData = {};
            }
        });
    },
    watch: {
        curActive: {
            immediate: true,
            handler(newVal, oldVal) {
                // 每次进入新实验的时候，要清除存储的数据和选择的glyph
                this.currentChooseGlyph = '';
                this.currentChooseData = {};
                if (!oldVal) {
                    // 初始化数据
                    this.experimentAllData = this.createGlyphData();
                    this.curShowGlyph = Math.random() > 0.5 ? 1 : 2;
                }
                if (newVal !== 1 && this.experimentIsDemo === false) {
                    // 因为第一个实验的开始时间在切换到这个页面的时候已经记录过了，所以不需要记录
                    this.$set(this.childExperimentRecord, "startTime", getCurrentTime());
                }
                if (newVal === (this.totalExperimentNum / 2) + 1) {
                    // 当前这个Glyph实验结束的话就切换Glyph
                    this.curShowGlyph = this.curShowGlyph === 1 ? 2 : 1;
                }
                this.curShowData = this.randomChooseExperimentFromData();
                // 不是demo的话记录一些数据
                if (this.experimentIsDemo === false) {
                    this.childExperimentRecord = {
                        ...this.childExperimentRecord,
                        glyphType: this.curShowGlyph,
                        stripeNum: this.curShowData.condition,
                        findAttr: this.curShowData.findAttr,
                        correctRegion: this.curShowData.correctRegion.data,
                        showData: [...this.curShowData.data],
                    }
                }
            }
        }
    },
    computed: {
        // 总的实验个数
        totalExperimentNum() {
            return this.childExperimentNum * this.circleNum.length * this.glyphType.length;
        },
        // 根据是否是demo选择不同的数据
        presetData() {
            return this.experimentIsDemo ? this.$store.state.ExperimentCDemoPreset : this.$store.state.ExperimentCFormPreset;
        },
        glyphData() {
            return this.experimentIsDemo ? this.$store.state.ExperimentCDemo : this.$store.state.ExperimentCForm;
        },
        updateData() {
            return {
                glyph: this.curShowGlyph,
                condition: this.curShowData.condition,
                data: this.curShowData.data,
                // 下边这两个是地图的features和path映射
                ...this.featuresAndProjection,
                mapSize: this.mapSize,
                glyphSize: this.glyphSize,
            }
        },
        descriptionCondition() {
            return {
                experiment: this.experimentId,
                glyph: this.curShowGlyph,
                value: 2,
                max: this.curShowData.condition
            };
        },
        taskCondition() {
            let isChoose = false;
            if (this.currentChooseGlyph && this.currentChooseData) {
                isChoose = true;
            }
            return {
                // 前两项主要用于绘制glyph
                experiment: this.experimentId,
                isDemo: this.experimentIsDemo,
                data: this.curShowData,
                dataMax: this.dataMax,
                totalExperiment: this.totalExperimentNum,
                curExperiment: this.curActive,
                // 用于实验C判断是否已经选择了数据
                isChoose,
            }
        },
    }
};

export const mixinDrawMapPublicFunction = {
    data() {
        return {
            // 地图的尺寸
            mapSize: [
                1500, 780
            ],
            // glyph的尺寸
            glyphSize: 180,
        };
    },
    computed: {
        featuresAndProjection() {
            const vc = this;
            let projection = d3.geoMercator()
                .center([112, 33])
                .scale(13500)
                .translate([vc.mapSize[0] + 150, vc.mapSize[1] - 230]);
            return {
                features: qinling.features,
                path: d3.geoPath().projection(projection)
            };
        }
    }
}