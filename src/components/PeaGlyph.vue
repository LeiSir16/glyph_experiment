<template>
  <div :id="svgID"></div>
</template>

<script>
import * as d3 from 'd3'
import {nanoid} from 'nanoid'

export default {
  name: "PeaGlyph",
  data() {
    return {
      svg_size: {
        width: this.$store.state.pea_glyph_condition.glyph_size,
        height: this.$store.state.pea_glyph_condition.glyph_size
      },
      // 外轮廓到svg边界的距离
      outline_offset: this.$store.state.pea_glyph_condition.outline_offset,
      // 圆的数量
      circle_num: this.$store.state.pea_glyph_condition.circle_num,
      // 每个圆圈所编码的值的大小
      circle_value: this.$store.state.pea_glyph_condition.circle_value,
      // 每个圆圈的轮廓粗细
      thickness: this.$store.state.pea_glyph_condition.circle_thickness,
      // 最外层圆圈距离边界轮廓的距离
      outline_dis: this.$store.state.pea_glyph_condition.outline_dis,
      // 中心一圈圆到圆心的距离
      center_offset: this.$store.state.pea_glyph_condition.center_dis,
      // 轮廓的粗细
      outline_thickness: this.$store.state.pea_glyph_condition.outline_thickness,
      ssi_color: this.$store.state.ssiColorEncoding,
      data_list: [],
      title_id: 'pea_glyph',
      svgID: '',
    };
  },
  props: ['glyph_data', 'show_condition', 'experiment'],
  methods: {
    // 创建外围轮廓
    create_outline(glyph_svg) {
      const vc = this;
      let out_line = glyph_svg.append("g")
          .attr("class", "outline_circle")
          .append("circle")
          .attr("cx", vc.svg_size.width / 2)
          .attr("cy", vc.svg_size.height / 2)
          .attr("r", (vc.svg_size.width / 2 - vc.outline_offset))
          .attr("fill", "red")
          .attr("fill-opacity", 0)
          .attr("stroke", "black")
          .attr("stroke-width", vc.outline_thickness);
    },
    // 创建所有的circle
    create_all_circles(glyph_svg) {
      const vc = this;
      let glyph_content = glyph_svg.append("g")
          .attr("class", "glyph_content");
      // 创建每个属性，其中class为属性名
      let glyph_attr = glyph_content.selectAll("g")
          .data(function (d) {
            return d.data;
          })
          .join("g")
          .attr("class", function (d, i) {
            // 类名为属性名之间的空格换为下划线
            return d.name.split(" ").join('_');
          })
          .attr("transform", function (d, i) {
            let parent = d3.select(this.parentNode).data()[0]
            let attr_num = parent.data.length;
            let angle = 360 / attr_num;
            return "translate(" + vc.svg_size.width / 2 + "," + vc.svg_size.height / 2 + ") rotate(" + angle * i + ")";
          });
      let glyph_circles = glyph_attr.selectAll("g")
          .data(function (d) {
            let values = [];
            // 属性值小于0表示没有这个属性
            if (d.value >= 0) {
              if (d.value >= vc.circle_value) {
                let total = Math.floor(d.value / vc.circle_value);
                let remain = d.value - total * vc.circle_value;
                for (let i = 0; i < vc.circle_num; i++) {
                  if (i < total) {
                    values.push(vc.circle_value);
                  } else if (i === total) {
                    values.push(remain);
                  } else {
                    values.push(0);
                  }
                }
              } else {
                values.push(d.value);
                for (let i = 1; i < vc.circle_num; i++) {
                  values.push(0);
                }
              }
            } else {
              for (let i = 0; i < vc.circle_num; i++) {
                values.push(-1);
              }
            }
            return values;
          })
          .join("g");

      let glyph_real_circle = glyph_circles.append("circle")
          .attr("cx", 0)
          .attr("cy", function (d, i) {
            let dis = (vc.radius + vc.thickness / 2) * 2;
            return (0 - dis - vc.center_offset - dis * i);
          })
          .attr("r", vc.radius)
          .attr("fill", function (d) {
            let attr = d3.select(this.parentNode.parentNode).attr("class");
            let v = vc.ssi_color.filter((item, index) => {
              return item.name === attr;
            })
            return v[0].color;
          })
          .attr("stroke", "black")
          .attr("stroke-width", vc.thickness)
          .style("display", function (d) {
            // 如果数据为null则不显示这个属性
            if (d < 0) {
              return "none";
            }
            return "inline";
          });
      let glyph_rect = glyph_circles.append("defs")
          .append("clipPath")
          .attr("id", function (d, i) {
            let country = d3.select(this.parentNode.parentNode.parentNode.parentNode).data()[0].city.split(" ").join("_");
            let attr = d3.select(this.parentNode.parentNode.parentNode).attr("class");
            // 使用nanoid生成唯一的id来保证数据相同时，id不同从而保证clip_path不会被互相覆盖
            return country + "_" + attr + "_" + i + '_' + nanoid();
          })
          .append("rect")
          .attr("x", -vc.radius + vc.thickness / 2)
          .attr("y", function (d, i) {
            let dis = (vc.radius + vc.thickness / 2) * 2;
            return (0 - dis - vc.center_offset - dis * i - vc.radius + vc.thickness / 2);
            // return 0;
          })
          .attr("width", vc.radius * 2 - vc.thickness)
          .attr("height", function (d) {
            let height = vc.radius * 2 - vc.thickness;
            let height_scale = d3.scaleLinear()
                .domain([0, vc.circle_value])
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
            let dis = (vc.radius + vc.thickness / 2) * 2;
            return (0 - dis - vc.center_offset - dis * i);
          })
          .attr("r", vc.radius - vc.thickness / 2)
          .attr("fill", "white")
          .attr('fill-opacity', 1)
          .attr("clip-path", function (d, i) {
            let id_name = d3.select(this.previousSibling).select("clipPath").attr("id");
            return "url(#" + id_name + ")";
          });
    },
    // 用于鼠标移动的时候显示轮廓
    createSvgOutline(glyphSvg) {
      const vc = this;
      let rectComponent = glyphSvg.append('g')
          .attr('class', 'svg_outline');
      let rects = rectComponent.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', vc.svg_size.width - 1 / 2)
          .attr('height', vc.svg_size.height - 1 / 2)
          .attr('fill', 'transparent')
          .attr('stroke', 'black')
          .attr('stroke-width', 1)
          .attr('stroke-opacity', 0);
    },
    // 重新创建svg
    create_svgs() {
      const vc = this;
      let pea_glyphs = d3.select('#' + vc.svgID);
      if (this.glyph_svg && this.glyph_svg._groups.length) {
        this.glyph_svg.remove();
      }
      // console.log(vc.data_list)
      this.glyph_svg = pea_glyphs.selectAll(`${this.svgID} svg`)
          .data(vc.data_list)
          .join("svg")
          .attr("class", function (d) {
            let name;
            if (vc.glyph_data.type === 1) {
              name = d.city.split(' ').join('_');
            }
            return name;
          })
          .attr("width", vc.svg_size.width)
          .attr("height", vc.svg_size.height);
      this.createSvgOutline(this.glyph_svg);
      // 第一个实验在glyph上选择
      if (this.experiment.experiment === 1) {
        this.glyph_svg.on('mouseenter', function () {
          // 鼠标进入时显示轮廓
          d3.select(this).select('.svg_outline rect').attr('stroke-opacity', 1);
        });
        this.glyph_svg.on('mouseleave', function () {
          // 鼠标离开时隐藏轮廓
          d3.select(this).select('.svg_outline rect').attr('stroke-opacity', 0);
        });
        this.glyph_svg.on('click', function () {
          // 鼠标离开时隐藏轮廓
          d3.select(this).select('.svg_outline rect')
              .attr('fill', '#dcdcdc')
              .attr('fill-opacity', .4);
          // 当是正式实验的时候才记录信息
          if (!vc.experiment.isDemo) {
            let date = new Date();
            // 通知第一个实验页面记录点击的Glyph数据以及时间
            let result = {
              data: d3.select(this).data()[0],
              time: date.toLocaleString()
            }
            vc.$bus.$emit('ExperimentAPeaGlyphRemember', result);
          }
        });
      }
    },
    // 更新轮廓尺寸
    update_outline() {
      let outline = d3.selectAll(`${this.svgID} .outline_circle`);
      if (outline) {
        outline.remove();
      }
      this.create_outline(this.glyph_svg);
    },
    // 重新创建所有的圆
    update_circle() {
      let glyph_content = d3.selectAll(`${this.svgID} .glyph_content`);
      if (glyph_content) {
        glyph_content.remove();
      }
      this.create_all_circles(this.glyph_svg);
    },
  },
  beforeMount() {
    let tops = '';
    if (this.experiment.experiment === 1) {
      tops = 'ExperimentA';
    } else if (this.experiment.experiment === 2) {
      tops = 'ExperimentB';
    } else if (this.experiment.experiment === -2) {
      tops = 'ExperimentBTraining';
    }
    this.svgID = tops + '_' + this.title_id + '_' + this.glyph_data.data.city.split(' ').join('_') + "_" + nanoid();
  },
  mounted() {
    this.create_svgs();
    this.create_outline(this.glyph_svg);
    this.create_all_circles(this.glyph_svg);
  },
  watch: {
    glyph_data: {
      immediate: true,
      deep: true,
      handler(newVal) {
        if (newVal.data) {
          // 根据数据类型不一样要重新映射
          this.data_list = [newVal.data];
          // this.create_svgs();
          // this.update_outline(this.glyph_svg);
          // this.update_circle(this.glyph_svg);
        }
      }
    },
    show_condition: {
      immediate: true,
      deep: true,
      handler(newVal) {
        this.$set(this.svg_size, 'width', newVal.glyphSize);
        this.$set(this.svg_size, 'height', newVal.glyphSize);
        // 外轮廓到svg边界的距离
        this.outline_offset = newVal.outlineOffset;
        // 圆的数量
        this.circle_num = newVal.circleNum;
        // 每个圆圈所编码的值的大小
        this.circle_value = newVal.circleValue;
        // 每个圆圈的轮廓粗细
        this.thickness = newVal.circleThickness;
        // 最外层圆圈距离边界轮廓的距离
        this.outline_dis = newVal.outlineDis;
        // 中心一圈圆到圆心的距离
        this.center_offset = newVal.centerDis;
        // 轮廓的粗细
        this.outline_thickness = newVal.outlineThickness;
      }
    }
  },
  computed: {
    // 每一个圆圈的半径
    radius() {
      return (this.svg_size.width / 2 - this.outline_offset - this.outline_dis - this.center_offset) / ((this.circle_num + 1) * 2) - this.thickness / 2
    }
  },
}
</script>

<style scoped>
.ssi_tooltip {
  position: absolute;
  background-color: grey;
  width: 180px;
  padding: 5px 2px;
  border-radius: 5px;
  color: white;
  font-size: x-small;
}
</style>