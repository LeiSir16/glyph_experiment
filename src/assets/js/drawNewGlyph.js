import * as d3 from 'd3';
import {nanoid} from "nanoid";

/**
 * 绘制一个peaGlyph
 * @param svgs      被绘制的svg
 * @param condition glyph的控制条件{size，outline_offset, outline_thickness}
 * @param data      数据
 * @param position  绘制的位置
 */
export function drawPeaGlyph(svgs, condition, data, position) {
    let uniformId = 'peaGlyph' + '-' + data.index + '-' + nanoid();
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
        .attr("r", condition.size - condition.outline_offset)
        .attr("fill", "red")
        .attr("fill-opacity", 0)
        .attr("stroke", "red")
        .attr("stroke-width", condition.outline_thickness);

    // 绘制glyph的主体内容
    let glyph_content = peaGlyph.append("g")
        .attr("class", uniformId + "glyph_content");

    // 创建每个属性
    // let glyph_attr = glyph_content.selectAll("g")
    //     .data(function (d) {
    //         return d.data;
    //     })
    //     .join("g")
    //     .attr("class", function (d, i) {
    //         // 类名为属性名之间的空格换为下划线
    //         return d.name.split(" ").join('_');
    //     })
    //     .attr("transform", function (d, i) {
    //         let parent = d3.select(this.parentNode).data()[0]
    //         let attr_num = parent.data.length;
    //         let angle = 360 / attr_num;
    //         return "translate(" + vc.svg_size.width / 2 + "," + vc.svg_size.height / 2 + ") rotate(" + angle * i + ")";
    //     });


    return uniformId;
}