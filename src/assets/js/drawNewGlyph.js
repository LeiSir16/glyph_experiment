import * as d3 from 'd3';
import {nanoid} from "nanoid";

/**
 * 绘制一个peaGlyph
 * @param svgs      被绘制的svg
 * @param condition glyph的控制条件{size，outline_offset, outline_thickness,circle_value,circle_num,outline_dis,center_offset,thickness}
 * @param data      数据
 * @param position  绘制的位置
 */
export function drawPeaGlyph(svgs, condition, data, position, qinlingcolor) {
    let uniformId = 'peaGlyph' + '-' + data.index + '-' + nanoid();
    let radius = (condition.size / 2 - condition.outline_offset - condition.outline_dis - condition.center_offset) / (condition.circle_num * 2) - condition.thickness / 2;
    // console.log(radius)
    // 这就是一整个glyph
    let peaGlyph = svgs.append('g')
        .attr('class', uniformId)
        .datum(data);

    // 创建外轮廓
    let out_line = peaGlyph.append("g")
        .attr("class", uniformId + 'outline')
        .append("circle")
        .attr("cx", position[0])
        .attr("cy", position[1])
        .attr("r", condition.size / 2 - condition.outline_offset)
        .attr("fill", "red")
        .attr("fill-opacity", 0)
        .attr("stroke", "white")
        .attr("stroke-width", condition.outline_thickness);

    let center = peaGlyph.append("g")
        .attr("class", uniformId + 'center')
        .append("circle")
        .attr("cx", position[0])
        .attr("cy", position[1])
        .attr("r", 2)
        .attr("fill", "yellow")
        .attr("fill-opacity", 1);

    // 绘制glyph的主体内容
    let glyph_content = peaGlyph.append("g")
        .attr("class", uniformId + "_" + "glyph_content");

    // 创建每个属性
    let glyph_attr = glyph_content.selectAll("g")
        .data(function (d) {
            return d.data;
        })
        .join("g")
        .attr("class", function (d, i) {
            // 类名为属性名之间的空格换为下划线
            return uniformId + d.name;
        })
        .attr("transform", function (d, i) {
            let parent = d3.select(this.parentNode).data()[0]
            let attr_num = parent.data.length;
            let angle = 360 / attr_num;
            return "translate(" + position[0] + "," + position[1] + ") rotate(" + angle * i + ")";
        });

    let glyph_circles = glyph_attr.selectAll("g")
        .data(function (d) {
            let values = [];
            // 属性值小于0表示没有这个属性
            if (d.value >= 0) {
                if (d.value >= condition.circle_value) {
                    let total = Math.floor(d.value / condition.circle_value);
                    let remain = d.value - total * condition.circle_value;
                    for (let i = 0; i < condition.circle_num; i++) {
                        if (i < total) {
                            values.push(condition.circle_value);
                        } else if (i === total) {
                            values.push(remain);
                        } else {
                            values.push(0);
                        }
                    }
                } else {
                    values.push(d.value);
                    for (let i = 1; i < condition.circle_num; i++) {
                        values.push(0);
                    }
                }
            } else {
                for (let i = 0; i < condition.circle_num; i++) {
                    values.push(-1);
                }
            }
            return values;
        })
        .join("g");

    // 创建真实显现的circle
    let glyph_real_circle = glyph_circles.append("circle")
        .attr("cx", 0)
        .attr("cy", function (d, i) {
            let dis = (radius + condition.thickness / 2) * 2;
            return (0 - dis - condition.center_offset - dis * i);
        })
        .attr("r", radius)
        .attr("fill", function (d) {
            let attr = d3.select(this.parentNode.parentNode).data()[0].name;
            let v = qinlingcolor.filter((item, index) => {
                return item.name === attr;
            });
            return v[0].color;
        })
        .attr("stroke", "black")
        .attr("stroke-width", condition.thickness)
        .style("display", function (d) {
            // 如果数据为null则不显示这个属性
            if (d < 0) {
                return "none";
            }
            return "inline";
        });

    // 创建遮盖矩形
    let glyph_rect = glyph_circles.append("defs")
        .append("clipPath")
        .attr("id", function (d, i) {
            let country = d3.select(this.parentNode.parentNode.parentNode.parentNode).data()[0].index;
            let attr = d3.select(this.parentNode.parentNode.parentNode).data()[0].name;
            // 使用nanoid生成唯一的id来保证数据相同时，id不同从而保证clip_path不会被互相覆盖
            return attr + "_" + country + "_" + i + '_' + nanoid();
        })
        .append("rect")
        .attr("x", -radius + condition.thickness / 2)
        .attr("y", function (d, i) {
            let dis = (radius + condition.thickness / 2) * 2;
            return (0 - dis - condition.center_offset - dis * i - radius + condition.thickness / 2);
            // return 0;
        })
        .attr("width", radius * 2 - condition.thickness)
        .attr("height", function (d) {
            let height = radius * 2 - condition.thickness;
            let height_scale = d3.scaleLinear()
                .domain([0, condition.circle_value])
                .range([height, 0]);
            if (d < 0) {
                return 0;
            } else {
                return height_scale(d);
            }
        });
    let mask_circle = glyph_circles.append("circle")
        .attr("cx", 0)
        .attr("cy", function (d, i) {
            let dis = (radius + condition.thickness / 2) * 2;
            return (0 - dis - condition.center_offset - dis * i);
        })
        .attr("r", radius - condition.thickness / 2)
        .attr("fill", "white")
        .attr('fill-opacity', 1)
        .attr("clip-path", function (d, i) {
            let id_name = d3.select(this.previousSibling).select("clipPath").attr("id");
            return "url(#" + id_name + ")";
        });

    return uniformId;
}