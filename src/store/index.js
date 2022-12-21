import Vue from "vue";
// 创建vuex中的store
import Vuex from "vuex";
import axios from "axios";
import {formatSSIData} from "@/assets/js/tool";
// 需要在创建Vuex之前use，不然会报错
Vue.use(Vuex)
// 创建actions-响应组件中的动作
const actions = {
    // 加载实验所需要的数据 参数为对应的实验
    readExperimentData(context, data) {
        // let path = '/data/ssi/2016_random.json';
        let path = '/glyph_experiment/data/ssi/2016_random.json';
        axios.get(path).then(
            response => {
                console.log(response)
                let dataName = '';
                let d = {};
                switch (data.type) {
                    case 1:
                        dataName = 'ExperimentA';
                        d = {
                            Demo: formatSSIData(response.data[dataName].Demo),
                            peaGlyph: formatSSIData(response.data[dataName].peaGlyph),
                            stripeGlyph: formatSSIData(response.data[dataName].stripeGlyph),
                        }
                        break;
                    case 2:
                        dataName = 'ExperimentB';
                        d = {
                            Demo: formatSSIData(response.data[dataName].Demo),
                            ExperimentB_10: formatSSIData(response.data[dataName].ExperimentB_10),
                            ExperimentB_20: formatSSIData(response.data[dataName].ExperimentB_20),
                            ExperimentB_40: formatSSIData(response.data[dataName].ExperimentB_40),
                        }
                        // console.log(d.Demo)
                        break;
                    case 3:
                        break
                }
                let result = {
                    ExperimentData: d, Type: data.type
                };
                // 提交给mutations存储
                context.commit('ReadExperimentData', result);
            },
            error => {
                console.log('数据加载失败！', error);
            }
        );
    },
    // 读取秦岭数据
    readExperimentQinLingData(context, type) {
        let path = '';
        if (type === 1) {
            // 读取demo数据
            // path = '/data/qinling/weather_0.json';
            path = '/glyph_experiment/data/qinling/weather_0.json';
        } else {
            // 读取正式实验数据
            // path = '/data/qinling/weather_120.json';
            path = '/glyph_experiment/data/qinling/weather_120.json';
        }
        axios.get(path).then(response => {
            context.commit('ReadExperimentQinLingData', {
                type: type,
                data: response.data.data
            });
        }, error => {
            console.log('秦岭数据加载失败');
        });
    },
    readExperimentCPreset(context, type) {
        let path = '';
        if (type === 1) {
            // 读取demo数据
            // path = '/data/qinling/demo_weather_0.json';
            path = '/glyph_experiment/data/qinling/demo_weather_0.json';
        } else {
            // 读取正式实验数据
            // path = '/data/qinling/form_weather_120.json';
            path = '/glyph_experiment/data/qinling/form_weather_120.json';
        }
        axios.get(path).then(response => {
            context.commit('ReadExperimentQinLingDataPreset', {
                type: type,
                data: response.data.data
            });
        }, error => {
            console.log('秦岭数据加载失败');
        });
    }
};
// 创建mutation—操作state中的数据
const mutations = {
    ReadExperimentData(state, data) {
        switch (data.Type) {
            case 1:
                state.ExperimentAData = data.ExperimentData;
                break;
            case 2:
                state.ExperimentBData = data.ExperimentData;
                // console.log(this.state.ExperimentBData)
                break;
            case 3:
                break
        }
    },
    ReadExperimentQinLingData(state, data) {
        switch (data.type) {
            case 1:
                state.ExperimentCDemo = data.data;
                break;
            case 2:
                state.ExperimentCForm = data.data;
                break;
        }
        // console.log(state.ExperimentCDemo);
    },
    ReadExperimentQinLingDataPreset(state, data) {
        switch (data.type) {
            case 1:
                state.ExperimentCDemoPreset = data.data;
                break;
            case 2:
                state.ExperimentCFormPreset = data.data;
                break;
        }
    }
};
const getters = {}
// 创建state-存储数据
const state = {
    default_max_radius: 10,
    // 调节peaglyph的布局
    pea_glyph_condition: {
        circle_num: 10,
        circle_value: 1.5,
        glyph_size: 250,
        center_dis: 10,
        outline_dis: 10,
        outline_offset: 10,
        outline_thickness: 0.5,
        circle_thickness: 0.5
    },
    stripe_condition: {
        layer_out: 2,
        is_encoding_infor: true,
        glyph_size: 270,
        metaphor_color: "#878787",
        outline_color: "#000000",
        stripe_encoding: "#E31A1C",
        division_color: "#000000",
        bg_opacity: 0,
        division_opacity: 1,
        metaphor_opacity: .6,
        inner_opacity: 1,
        outer_opacity: 1,
        stripe_opacity: 1,
        layer_num: 7,
        inner_radius: 3,
        sector_interval: 1.5,
        outline_thickness: 1,
        division_thickness: 1,
        stripe_proportion: 0.1,
        stripe_B_A: 0.1,
        stripe_L_R: 0.05,
        stripe_thickness: 0.07,
        encoding_value: 0.5
    },
    // ssi数据的颜色编码
    ssiColorEncoding: [
        {
            id: 0,
            name: 'Sufficient_Food',
            color: "#e41a1c"
        },
        {
            id: 1,
            name: 'Sufficient_Drinking_Water',
            color: "#377eb8"
        },
        {
            id: 2,
            name: 'Safe_Sanitation',
            color: "#bf66eb"
        },
        {
            id: 3,
            name: 'Education',
            color: "#4daf4a"
        },
        {
            id: 4,
            name: 'Healthy_Life',
            color: "#984ea3"
        },
        {
            id: 5,
            name: 'Gender_Equality',
            color: "#ff7f00"
        },
        {
            id: 6,
            name: 'Income_Distribution',
            color: "#fdbf6f"
        },
        {
            id: 7,
            name: 'Population_Growth',
            color: "#a65628"
        },
        {
            id: 8,
            name: 'Good_Governance',
            color: "#f781bf"
        }
    ],
    qinlingColorEncoding: [
        {
            id: 0,
            name: 'tem',
            color: "#e41a1c"
        },
        {
            id: 1,
            name: 'wns',
            color: "#377eb8"
        },
        {
            id: 2,
            name: 'wns_100m',
            color: "#bf66eb"
        },
        {
            id: 3,
            name: 'vis',
            color: "#4daf4a"
        },
        {
            id: 4,
            name: 'gust',
            color: "#984ea3"
        },
        {
            id: 5,
            name: 'st_40',
            color: "#ff7f00"
        },
        {
            id: 6,
            name: 'st_200',
            color: "#fdbf6f"
        },
        {
            id: 7,
            name: 'sw_40',
            color: "#a65628"
        },
        {
            id: 8,
            name: 'sw_200',
            color: "#f781bf"
        }
    ],
    ssiColorName: {
        Sufficient_Food: '营养不良指数',
        Sufficient_Drinking_Water: '基础供水服务指数',
        Safe_Sanitation: '基础卫生服务指数',
        Education: '教育指数',
        Healthy_Life: '健康生活指数',
        Gender_Equality: '性别平等指数',
        Income_Distribution: '收入分配指数',
        Population_Growth: '人口增长指数',
        Good_Governance: '政府治理水平指数'
    },
    qinlingColorName: {
        tem: '温度',
        wns: '风速',
        wns_100m: '100m风速',
        vis: '能见度',
        gust: '10m阵风风速',
        st_40: '40cm土壤温度',
        st_200: '200cm土壤温度',
        sw_40: '40cm土壤湿度',
        sw_200: '200cm土壤湿度'
    },
    qinlingDataMax: {
        tem: {
            min: 9.911180250000001,
            max: 32.094128846826464,
            units: '°C',
        },
        wns: {
            min: 0.02221037032135465,
            max: 4.96336324858478,
            units: 'm/s'
        },
        wns_100m: {
            min: 0.049699569277675965,
            max: 8.806871456032194,
            units: 'm/s'
        },
        vis: {
            min: 205.99069693641036,
            max: 25678.431419823923,
            units: 'm'
        },
        gust: {
            min: 0.1518107246165421,
            max: 9.288777894331677,
            units: 'm/s'
        },
        st_40: {
            min: 14.904814313186815,
            max: 24.609709374668586,
            units: '°C'
        },
        st_200: {
            min: 10.472500346153849,
            max: 19.656643721748768,
            units: '°C'
        },
        sw_40: {
            min: 0.090093315,
            max: 0.42354325017979494,
            units: '%'
        },
        sw_200: {
            min: 0.19353281969924815,
            max: 0.3983533652870932,
            units: '%'
        }
    },
    ExperimentAData: {},
    ExperimentBData: {},
    Test: [],
    ExperimentCDemo: [],
    ExperimentCForm: [],
    ExperimentCDemoPreset: [],
    ExperimentCFormPreset: [],
}

// 创建store
const store = new Vuex.Store({
    // 如果key和value重名可以简写，原有格式是actions:name
    actions,
    mutations,
    state,
    getters
});
export default store;