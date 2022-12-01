import * as d3 from 'd3';
import axios from "axios";
import dayjs from "dayjs";
import {saveAs} from 'file-saver';

/**
 * 弧度转为角度
 * @param radian    弧度
 * @returns {number}角度
 */
export function radian_angle(radian) {
    return radian * 180 / Math.PI;
}

/**
 * 角度转为弧度
 * @param angle 角度
 * @returns {number}弧度
 */
export function angle_radian(angle) {
    return angle * Math.PI / 180;
}

/**
 * 计算弧长
 * @param radian        弧度
 * @param radius        半径
 * @param proportion    比例
 * @returns {number}    弧长
 */
export function cal_arc(radian, radius, proportion = 1) {
    return (radian * radius * proportion)
}

/**
 * 基于弧长计算弧度
 * @param arc       弧长
 * @param radius    半径
 * @returns {number}角度
 */
export function cal_angle(arc, radius) {
    return (arc / radius);
}

/**
 * 获取一个扇形区域所能容纳的所有条纹
 * @param meta_data         扇形区域相关信息
 * @param interval_space    左右间隔比例，0.5表示间隔和条纹大小一致
 * @param former_space      前后间距 0-1 表示占环形区域的比例
 * @param proportion        条纹长度比例，最大弧长的比例
 * @param layer_num         层数
 * @returns {*[]}           所有条纹的数据
 */
export function cal_total_strip(meta_data, interval_space, former_space, proportion, layer_num) {
    let strip_infor = [];
    let radius_scale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, meta_data.outer - meta_data.inner]);
    // 每一层条纹的宽度
    const strip_thickness = (meta_data.outer - meta_data.inner - radius_scale(former_space) * (layer_num - 1)) / layer_num;
    // 最大弧长
    let max_arc = cal_arc(meta_data.end - meta_data.start, meta_data.outer);
    // 最小弧长
    let min_arc = cal_arc(meta_data.end - meta_data.start, meta_data.inner);
    // 最大的比例
    let max_proportion = min_arc / max_arc;
    let real_proportion = Math.min(proportion, max_proportion);
    // 指定弧长长度
    let special_arc = real_proportion * max_arc;
    for (let i = 0; i < layer_num; i++) {
        // 条纹中心半径
        let radius = meta_data.inner + strip_thickness / 2 + (strip_thickness + radius_scale(former_space)) * i;
        // 指定弧长和半径下的圆心角弧度
        let radian = cal_angle(special_arc, radius);
        // 可容纳数量 一个条纹包括一个显示的条纹和一个不显示的
        let num = Math.floor((meta_data.end - meta_data.start) / (radian * 2))
        let remain = (meta_data.end - meta_data.start) - num * radian * 2;
        // 当interval_space=0.5时显示和不显示条纹的大小一样
        let left_space_radian = radian * 2 * interval_space;
        let real_radian = radian * 2 - left_space_radian;
        let real_start = meta_data.start + remain / 2 + left_space_radian / 2;
        // 判断剩下的区域能否容纳一个条纹
        if (remain >= real_radian) {
            remain = remain - real_radian;
            num++;
            real_start = meta_data.start + remain / 2;
        }
        for (let j = 0; j < num; j++) {
            let strip = {
                layer: i,
                index: j,
                inner_r: radius - strip_thickness / 2,
                outer_r: radius + strip_thickness / 2,
                start: real_start + j * radian * 2,
                end: real_start + j * radian * 2 + real_radian
            }
            strip_infor.push(strip);
        }
    }
    return strip_infor;
}

/**
 * 在范围内随机生成条纹中心角度
 * @param start 开始角度
 * @param end   结束角度
 * @param angle 条纹角度
 * @returns {*} 条纹中心
 * @constructor
 */
function RandomAngle(start, end, angle) {
    return d3.randomUniform(start + angle / 2, end - angle / 2)();
}

function CandidateIsValid(real_thickness, target_space, form_space, candidate, strips) {
    for (let i = 0; i < strips.length; i++) {
        let s = strips[i];
        let is_radius = (Math.abs(s.inner_r - candidate.inner_r) < (real_thickness + form_space));
        let s_center = s.start + s.radian / 2;
        let c_center = candidate.start + candidate.radian / 2;
        let is_radian = Math.abs(s_center - c_center) < (s.radian / 2 + candidate.radian / 2 + target_space);
        if (is_radius && is_radian) {
            return false;
        }
    }
    return true;
}

export function GeneratePointsBasedOnPoissonDiskDistributions(meta_data, thickness, interval_space, form_space, proportion, num_samples_before_rejection = 30) {
    let radius_scale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, meta_data.outer - meta_data.inner]);
    let real_thickness = radius_scale(thickness)
    // 前后间隔表示条纹粗细的比例
    let real_form_space = real_thickness * form_space;
    // console.log(real_form_space)
    let radius_range = [meta_data.inner + real_thickness / 2, meta_data.outer - real_thickness / 2]
    // 最大弧长
    let max_arc = cal_arc(meta_data.end - meta_data.start, radius_range[1]);
    // 最小弧长
    let min_arc = cal_arc(meta_data.end - meta_data.start, radius_range[0]);
    // 最大的比例
    let max_proportion = min_arc / max_arc;
    let real_proportion = Math.min(proportion, max_proportion);
    // 指定弧长长度
    let special_arc = real_proportion * max_arc;
    // 随机生成第一个条纹
    let first_radius = d3.randomUniform(radius_range[0], radius_range[1])();
    let first_radian = cal_angle(special_arc, first_radius);
    // 对于边界来说不用考虑左右间距
    let first_center = RandomAngle(meta_data.start, meta_data.end, first_radian);
    let first_strip = {
        index: 0,
        inner_r: first_radius - real_thickness / 2,
        outer_r: first_radius + real_thickness / 2,
        start: first_center - first_radian / 2,
        end: first_center + first_radian / 2,
        radian: first_radian
    }
    let strips = [first_strip];
    let spawn_strips = [first_strip];
    while (spawn_strips.length > 0) {
        let spawn_index = Math.floor(Math.random() * spawn_strips.length);
        let spawn_strip = spawn_strips[spawn_index];
        let candidate_accepted = false;
        for (let i = 0; i < num_samples_before_rejection; i++) {
            let target_radius = d3.randomUniform(radius_range[0], radius_range[1])();
            let target_radian = cal_angle(special_arc, target_radius);
            let target_center = RandomAngle(meta_data.start, meta_data.end, target_radian);
            // 左右间距表示条纹角度的比例
            let target_space = target_radian * interval_space;
            let target_strip = {
                index: strips.length,
                inner_r: target_radius - real_thickness / 2,
                outer_r: target_radius + real_thickness / 2,
                start: target_center - target_radian / 2,
                end: target_center + target_radian / 2,
                radian: target_radian
            }
            if (CandidateIsValid(real_thickness, target_space, real_form_space, target_strip, strips)) {
                strips.push(target_strip);
                spawn_strips.push(target_strip);
                candidate_accepted = true;
                break;
            }
        }
        if (candidate_accepted === false) {
            spawn_strips.splice(spawn_index, 1);
        }
    }
    return strips;
}

/**
 * 格式化SSI数据 只取前九个属性
 * @param data  读出的数据
 */
export function formatSSIData(data) {
    let all_glyph_city = [];
    for (let realDataValue of data) {
        let one_glyph_city = {
            index: realDataValue.index,
            city: realDataValue.city,
            data: [
                {
                    name: 'Sufficient Food',
                    value: realDataValue['human']['needs']['food']
                },
                {
                    name: 'Sufficient Drinking Water',
                    value: realDataValue['human']['needs']['water']
                },
                {
                    name: 'Safe Sanitation',
                    value: realDataValue['human']['needs']['safe']
                },
                {
                    name: 'Education',
                    value: realDataValue['human']['health']['education']
                },
                {
                    name: 'Healthy Life',
                    value: realDataValue['human']['health']['life']
                },
                {
                    name: 'Gender Equality',
                    value: realDataValue['human']['health']['gender']
                },
                {
                    name: 'Income Distribution',
                    value: realDataValue['human']['society']['income']
                },
                {
                    name: 'Population Growth',
                    value: realDataValue['human']['society']['population']
                },
                {
                    name: 'Good Governance',
                    value: realDataValue['human']['society']['governance']
                },
            ],
        };
        all_glyph_city.push(one_glyph_city);
    }
    return all_glyph_city;
}

/**
 * 从指定文件中加载数据
 */
export function readSSIDataJson() {
    let path = '/data/ssi/2016_no_null.json';
    axios.get(path).then(
        response => {
            let formatData = formatSSIData(response.data);
            console.log(formatData)
        },
        error => {
            console.log('数据加载失败！');
        }
    );
}

function randomArr(arr) {
    arr.sort((a, b) => {
        return Math.random() > 0.5 ? -1 : 1;   // 如果a<b不交换，否则交换，即升序排列；如果a>b不交换，否则交换，即将序排列
    });
}

// 获取当前时间
export function getCurrentTime() {
    let date = dayjs();
    let format = 'YYYY-MM-DD HH:mm:ss.SSS';
    return date.format(format);
}

export function getId() {
    let date = dayjs();
    let format = 'YYYYMMDDHHmmss';
    return date.format(format);
}

/**
 * 将实验类型转为对应的字符串
 * @param type      1表示差值实验 2表示秦岭实验
 * @returns {string}
 */
function curExperiment(type) {
    if (type === 1) {
        return 'ExperimentB';
    } else {
        return 'ExperimentC';
    }
}

/**
 * 保存文件为json类型
 * @param data          要保存的数据 必须是对象
 * @param experiment     1表示差值实验 2表示秦岭实验
 * @param success       成功回调
 */
export function saveAsJson(data, experiment, success) {
    // 标明实验
    let e = curExperiment(experiment);
    let name = 'noName';
    if (sessionStorage.getItem('userInfor')) {
        let infor = JSON.parse(sessionStorage.getItem('userInfor'));
        name = infor.name;
        let result = {
            userInfor: infor,
            [e]: data
        }
        let prefix = infor.sId;
        let blob = new Blob([JSON.stringify(result)], {type: "text/plain;charset=utf-8"});
        let fileName = prefix + "-" + e + "-" + name + ".json";
        saveAs(blob, fileName);
        success();
    }
}