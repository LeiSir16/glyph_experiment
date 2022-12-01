<template>
  <div :id="stripe_id"></div>
</template>

<script>
import * as d3 from 'd3'
import {
  angle_radian,
  cal_total_strip,
  GeneratePointsBasedOnPoissonDiskDistributions
} from "@/assets/js/tool"
import {nanoid} from "nanoid";

export default {
  name: "StripeGlyph",
  data: function () {
    return {
      svg_size: {
        width: this.$store.state.stripe_condition.glyph_size,
        height: this.$store.state.stripe_condition.glyph_size
      },
      // 强度编码颜色
      stripe_color: this.$store.state.ssiColorEncoding,
      // 布局类型，1：均匀 2：规则
      layer_out: this.$store.state.stripe_condition.layer_out,
      // 区域固定时层数
      fixed_layer_num: this.$store.state.stripe_condition.layer_num,
      // 默认最大半径
      max_radius: this.$store.state.default_max_radius,
      // 默认内半径
      inner_radius_all: this.$store.state.stripe_condition.inner_radius,
      // 默认扇形区域之间的间隔
      sector_interval: this.$store.state.stripe_condition.sector_interval,
      // 默认背景透明度
      bg_opacity: this.$store.state.stripe_condition.bg_opacity,
      // 默认分割线透明度
      division_opacity: this.$store.state.stripe_condition.division_opacity,
      // 隐喻条纹透明度
      metaphor_opacity: this.$store.state.stripe_condition.metaphor_opacity,
      // 内外轮廓透明度
      inner_opacity: this.$store.state.stripe_condition.inner_opacity,
      outer_opacity: this.$store.state.stripe_condition.outer_opacity,
      // 条纹透明度
      stripe_opacity: this.$store.state.stripe_condition.stripe_opacity,
      // 条纹颜色是否编码信息
      is_encoding_infor: this.$store.state.stripe_condition.is_encoding_infor,
      encoding_infor_color: this.$store.state.stripe_condition.stripe_encoding,
      // 隐喻条纹颜色
      metaphor_color: this.$store.state.stripe_condition.metaphor_color,
      // 轮廓颜色
      outline_color: this.$store.state.stripe_condition.outline_color,
      // 分割线颜色
      division_color: this.$store.state.stripe_condition.division_color,
      // 内外轮廓粗细
      outline_thickness: this.$store.state.stripe_condition.outline_thickness,
      // 分割线粗细
      division_thickness: this.$store.state.stripe_condition.division_thickness,
      // 条纹粗细变化事件
      stripe_uniform_proportion: this.$store.state.stripe_condition.stripe_proportion,
      stripe_tidy_proportion: this.$store.state.stripe_condition.stripe_proportion,
      // 条纹粗细，仅在均匀分布有用
      stripe_uniform_thickness: this.$store.state.stripe_condition.stripe_thickness,
      // 条纹的左右间距
      stripe_uniform_interval_space: this.$store.state.stripe_condition.stripe_L_R,
      stripe_tidy_interval_space: this.$store.state.stripe_condition.stripe_L_R,
      // 条纹的前后间距
      stripe_uniform_former_space: this.$store.state.stripe_condition.stripe_B_A,
      stripe_tidy_former_space: this.$store.state.stripe_condition.stripe_B_A,
      // 还没配置
      outline_outer: "outer",
      outline_inner: "inner",
      // 飓风图标尺寸
      hurricane_image_width: 50,
      svg_edge_dis: 0,
      encoding_value: this.$store.state.stripe_condition.encoding_value,
      sectors_infor: [],
      title_name: 'StripeGlyph',
      stripe_id: '',
    };
  },
  props: ['glyph_data', 'glyphCondition', 'experiment'],
  methods: {
    // 绘制隐喻条纹
    create_metaphor(draw_svg) {
      const vc = this;
      let glyph_metaphor = draw_svg.append("g")
          .attr("class", "glyph_metaphor")
          .attr("transform", function () {
            return "translate(" + vc.svg_size.width / 2 + "," + vc.svg_size.height / 2 + ")";
          })
          .selectAll("g")
          .data((d) => {
            return d.data;
          })
          .join("g")
          .attr("class", function (d) {
            // 类名为城市名+属性名
            let cityName = d3.select(this.parentNode.parentNode).data()[0].city.split(' ').join('_');
            let attrName = d.name.split(' ').join('_');
            return 'metaphor_' + cityName + attrName;
          })
          .attr("transform", function (d, i) {
            return "rotate(" + i * (vc.a_sector + vc.sector_interval) + ")";
          });
      // console.log(draw_svg.append('g'))
      let glyph_metaphor_stripe = glyph_metaphor.selectAll("path")
          .data(vc.sector_total_stripe)
          .join("path")
          .attr("d", function (d) {
            let arc = d3.arc()
                .innerRadius(d.inner_r)
                .outerRadius(d.outer_r)
                .startAngle(d.start)
                .endAngle(d.end);
            return arc();
          })
          .attr("fill", function () {
            return vc.metaphor_color;
          })
          .attr("fill-opacity", vc.metaphor_opacity);
    },
    // 半径比例尺
    radius_scale(radius) {
      const vc = this;
      let r_s = d3.scaleLinear()
          .domain([0, vc.max_radius])
          .range([0, vc.svg_size.width / 2]);
      return r_s(radius);
    },
    strength_scale(strength) {
      const vc = this;
      let s_s = d3.scaleQuantize()
          .domain([0, 100])
          .range(vc.hurricane_color);
      return s_s(strength);
    },
    // 绘制条纹内容
    create_content(draw_svg) {
      const vc = this;
      let glyph_content = draw_svg.append("g")
          .attr("class", "glyph_content")
          .attr("transform", function () {
            return "translate(" + vc.svg_size.width / 2 + "," + vc.svg_size.height / 2 + ")";
          })
          .selectAll("g")
          .data(d => {
            return d.data;
          })
          .join("g")
          .attr("class", function (d) {
            let cityName = d3.select(this.parentNode.parentNode).data()[0].city.split(' ').join('_');
            let attrName = d.name.split(' ').join('_');
            return 'content_' + cityName + attrName;
          })
          .attr("transform", function (d, i) {
            return "rotate(" + i * (vc.a_sector + vc.sector_interval) + ")";
          });
      let glyph_content_stripe = glyph_content.selectAll("path")
          .data(function (d) {
            let num = Math.ceil(d.value / vc.encoding_value);
            return vc.sector_total_stripe.slice(0, num);
          })
          .join("path")
          .attr("d", function (d, i) {
            let ve = d3.select(this.parentNode).data()[0].value;
            let num = Math.floor(ve / vc.encoding_value);
            let arcs = d3.arc()
                .innerRadius(d.inner_r)
                .outerRadius(d.outer_r)
                .startAngle(d.start);
            if (i === num) {
              let remain = ve - num * vc.encoding_value;
              let radian_scale = d3.scaleLinear()
                  .domain([0, vc.encoding_value])
                  .range([d.start, d.end]);
              arcs.endAngle(radian_scale(remain));
            } else {
              arcs.endAngle(d.end);
            }
            return arcs();
          })
          .attr("fill", function () {
            let tmp_data = d3.select(this.parentNode).data()[0];
            // 筛选出来指定属性的颜色
            let c = vc.stripe_color.filter((item, index) => {
              return item.name === tmp_data.name.split(' ').join('_');
            });
            return vc.is_encoding_infor ? c[0].color : vc.encoding_infor_color;
          })
          .attr("fill-opacity", vc.stripe_opacity);
    },
    // 绘制轮廓
    draw_outline(element, name, cx, cy, r, color, thickness, opacity = 1) {
      return element.append("g")
          .attr("class", name)
          .append("circle")
          .attr("cx", cx)
          .attr("cy", cy)
          .attr("r", r)
          .attr("fill", "white")
          .attr("fill-opacity", 0)
          .attr("stroke", color)
          .attr("stroke-width", thickness)
          .attr("stroke-opacity", opacity);
    },
    // 条纹均匀分布
    create_random_content(draw_svg) {
      const vc = this;
      let glyph_random = draw_svg.append("g")
          .attr("class", "glyph_content")
          .attr("transform", function () {
            return "translate(" + vc.svg_size.width / 2 + "," + vc.svg_size.height / 2 + ")";
          })
          .selectAll("g")
          .data(d => {
            return d.data;
          })
          .join("g")
          .attr("class", function (d) {
            let cityName = d3.select(this.parentNode.parentNode).data()[0].city.split(' ').join('_');
            let attrName = d.name.split(' ').join('_');
            return 'content_' + cityName + attrName;
          })
          .attr("transform", function (d, i) {
            return "rotate(" + i * (vc.a_sector + vc.sector_interval) + ")";
          });

      let glyph_random_stripe = glyph_random.selectAll("path")
          .data(function (d) {
            let num = Math.ceil(d.value / vc.encoding_value);
            let o_stripes = vc.sector_random_stripe;
            // let stripes = vc.sector_random_stripe.slice(0, num);
            let stripes = [];
            // 如果存在不完整的条纹则需要放一个隐喻的条纹 总是第一个条纹为隐喻条纹
            if (d.value !== 0 && d.value % vc.encoding_value !== 0) {
              // stripes.push(vc.sector_random_stripe[num - 1])
              stripes.push(o_stripes[0]);
            }
            return stripes.concat(o_stripes.slice(0, num));
          })
          .join("path")
          .attr("d", function (d, i) {
            let ve = d3.select(this.parentNode).data()[0].value;
            let num = Math.floor(ve / vc.encoding_value);
            let arcs = d3.arc()
                .innerRadius(d.inner_r)
                .outerRadius(d.outer_r)
                .startAngle(d.start);
            if (i === 1) {
              // 带有颜色的是不完整的条纹
              let remain = ve - num * vc.encoding_value;
              let radian_scale = d3.scaleLinear()
                  .domain([0, vc.encoding_value])
                  .range([d.start, d.end]);
              arcs.endAngle(radian_scale(remain));
            } else {
              arcs.endAngle(d.end);
            }
            return arcs();
          })
          .attr("fill", function (d, i) {
            let tmp_data = d3.select(this.parentNode).data()[0];
            // 筛选出来指定属性的颜色
            let c = vc.stripe_color.filter((item, index) => {
              return item.name === tmp_data.name.split(' ').join('_');
            });
            let ve = tmp_data.value;
            let num = Math.floor(ve / vc.encoding_value);
            if (num * vc.encoding_value < ve) {
              if (i === 0) {
                // 用于隐喻条纹
                return vc.metaphor_color;
              }
              return vc.is_encoding_infor ? c[0].color : vc.encoding_infor_color;
            }
            return vc.is_encoding_infor ? c[0].color : vc.encoding_infor_color;
          })
          .attr("fill-opacity", function (d, i) {
            let tmp_data = d3.select(this.parentNode).data()[0];
            let ve = tmp_data.value;
            let num = Math.floor(ve / vc.encoding_value);
            if (num * vc.encoding_value < ve) {
              if (i === 0) {
                // 用于隐喻条纹
                return vc.metaphor_opacity;
              }
              return vc.stripe_opacity;
            }
            return vc.stripe_opacity;
          })
          .attr("class", function (d, i) {
            let tmp_data = d3.select(this.parentNode).data()[0];
            let ve = tmp_data.value;
            let num = Math.floor(ve / vc.encoding_value);
            if (num * vc.encoding_value < ve) {
              if (i === 0) {
                // 用于隐喻条纹
                return "path_metaphor";
              }
              return "";
            }
            return "";
          });
    },
    // 创建背景
    create_background(draw_svg) {
      const vc = this;
      let glyph_bg = draw_svg.append("g")
          .attr("class", "glyph_bg")
          .attr("transform", function () {
            return "translate(" + vc.svg_size.width / 2 + "," + vc.svg_size.height / 2 + ")";
          });
      let bg_sector = glyph_bg.selectAll("path")
          .data(d => {
            return d.data;
          })
          .join("path")
          .attr("d", function () {
            // 创建圆环
            let arc = d3.arc()
                .innerRadius(vc.meta_data.inner)
                .outerRadius(vc.meta_data.outer)
                .startAngle(vc.meta_data.start)
                .endAngle(vc.meta_data.end);
            return arc();
          })
          .attr("fill", function (d) {
            // 筛选出来指定属性的颜色
            let c = vc.stripe_color.filter((item, index) => {
              return item.name === d.name.split(' ').join('_');
            });
            return c[0].color;
          })
          .attr("fill-opacity", vc.bg_opacity)
          .attr("transform", function (d, i) {
            let sector_i = {};
            sector_i["index"] = i;
            sector_i["direction"] = d.direction;
            sector_i["start"] = vc.meta_data.start;
            sector_i["end"] = vc.meta_data.end;
            sector_i["rotate"] = i * (vc.a_sector + vc.sector_interval);
            vc.sectors_infor.push(sector_i);
            return "rotate(" + (i * (vc.a_sector + vc.sector_interval)) + ")";
          });
    },
    // 创建分割线
    create_division(draw_svg) {
      const vc = this;
      let glyph_division = draw_svg.append("g")
          .attr("class", "glyph_division")
          .attr("transform", function () {
            return "translate(" + vc.svg_size.width / 2 + "," + vc.svg_size.height / 2 + ")";
          });
      let division = glyph_division.selectAll("line")
          .data(d => {
            return d.data;
          })
          .join("line")
          .attr("x1", 0)
          .attr("y1", -vc.meta_data.inner)
          .attr("x2", 0)
          .attr("y2", -vc.meta_data.outer)
          .attr("stroke", vc.division_color)
          .attr("stroke-width", 1)
          .attr("stroke-opacity", vc.division_opacity)
          .attr("transform", function (d, i) {
            return "rotate(" + (-(vc.a_sector) / 2 + i * (vc.a_sector + vc.sector_interval)) + ")";
          });
    },

    // 创建飓风图标
    // create_hurricane_icon(draw_svg) {
    //   const vc = this;
    //   let img = draw_svg.append("g")
    //       .attr("class", "hurricane")
    //       .append("image")
    //       // 注意图片加载
    //       .attr("xlink:href", require("@/assets/hurricane.png"))
    //       .attr("x", vc.svg_size.width / 2 - vc.hurricane_image_width / 2)
    //       .attr("y", vc.svg_size.height / 2 - vc.hurricane_image_width / 2)
    //       .attr("width", vc.hurricane_image_width + "px");
    // },

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
    // 将全部移除了之后重新生成
    create_all(svgs) {
      const vc = this;
      let bg = d3.selectAll(`#${this.stripe_id} .glyph_bg`);
      let division = d3.selectAll(`#${this.stripe_id} .glyph_division`);
      let inner = d3.selectAll(`#${this.stripe_id} .inner`);
      let outer = d3.selectAll(`#${this.stripe_id} .outer`);
      if (bg) {
        bg.remove();
      }
      if (division) {
        division.remove();
      }
      if (inner) {
        inner.remove();
      }
      if (outer) {
        outer.remove();
      }
      vc.create_background(svgs);
      vc.create_division(svgs);
      vc.draw_outline(svgs, "outer", vc.svg_size.width / 2, vc.svg_size.height / 2, vc.outer_radius, vc.division_color, vc.division_thickness, vc.outer_opacity);
      vc.draw_outline(svgs, "inner", vc.svg_size.width / 2, vc.svg_size.height / 2, vc.inner_radius, vc.division_color, vc.division_thickness, vc.inner_opacity);
      this.create_stripe(svgs);
    },

    // 只更新条纹
    create_stripe() {
      const vc = this;
      let glyph_metaphor = d3.selectAll(`#${this.stripe_id} .glyph_metaphor`);
      let glyph_content = d3.selectAll(`#${this.stripe_id} .glyph_content`);
      if (glyph_content) {
        glyph_content.remove();
      }
      if (glyph_metaphor) {
        glyph_metaphor.remove();
      }
      // 条纹布局显示
      switch (vc.layer_out) {
        case 2:
          vc.create_metaphor(vc.root_svgs);
          vc.create_content(vc.root_svgs);
          break;
        case 1:
          vc.create_random_content(vc.root_svgs);
          break;
      }
    },
    // 重新创建svg
    create_stripe_svg(finish) {
      const vc = this;
      let stripe_glyphs = d3.select('#' + vc.stripe_id);
      if (this.root_svgs && this.root_svgs._groups.length) {
        this.root_svgs.remove();
      }
      this.root_svgs = stripe_glyphs.selectAll('svg')
          .data(vc.show_data)
          .join('svg')
          .attr("class", function (d) {
            let name;
            if (vc.glyph_data.type === 1) {
              name = d.city.split(' ').join('_');
            }
            return name;
          })
          .attr("width", vc.svg_size.width)
          .attr("height", vc.svg_size.height);
      this.createSvgOutline(this.root_svgs);
      // 第一个实验在glyph上选择
      if (this.experiment.experiment === 1) {
        this.root_svgs.on('mouseenter', function () {
          // 鼠标进入时显示轮廓
          d3.select(this).select('.svg_outline rect').attr('stroke-opacity', 1);
        });
        this.root_svgs.on('mouseleave', function () {
          // 鼠标离开时隐藏轮廓
          d3.select(this).select('.svg_outline rect').attr('stroke-opacity', 0);
        });
        this.root_svgs.on('click', function () {
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
            vc.$bus.$emit('ExperimentAStripeGlyphRemember', result);
          }
        });
      }
      finish(this.root_svgs);
    }
  },
  beforeMount() {
    let tops = '';
    if (this.experiment.experiment === 1) {
      tops = 'ExperimentA';
    } else if (this.experiment.experiment === 2) {
      tops = 'ExperimentB';
    }
    this.stripe_id = tops + '_' + this.title_name + '_' + this.glyph_data.data.city.split(' ').join('_') + "_" + nanoid();
  },
  mounted() {
    this.show_data = [this.glyph_data.data];
    this.create_stripe_svg((s) => {
      this.create_all(s);
    });
  },
  watch: {
    glyph_data: {
      immediate: false,
      deep: true,
      handler(newVal) {
        if (newVal.data) {
          this.show_data = [newVal.data];
        }
      }
    },
    glyphCondition: {
      immediate: true,
      deep: true,
      handler(newVal) {
        this.$set(this.svg_size, 'width', newVal.glyph_size);
        this.$set(this.svg_size, 'height', newVal.glyph_size);
        this.layer_out = newVal.layer_out;
        this.fixed_layer_num = newVal.layer_num;
        this.inner_radius_all = newVal.inner_radius;
        this.sector_interval = newVal.sector_interval;
        this.bg_opacity = newVal.bg_opacity;
        this.division_opacity = newVal.division_opacity;
        this.metaphor_opacity = newVal.metaphor_opacity;
        this.inner_opacity = newVal.inner_opacity;
        this.outer_opacity = newVal.outer_opacity;
        this.stripe_opacity = newVal.stripe_opacity;
        this.is_encoding_infor = newVal.is_encoding_infor;
        this.encoding_infor_color = newVal.stripe_encoding;
        this.metaphor_color = newVal.metaphor_color;
        this.outline_color = newVal.outline_color;
        this.division_color = newVal.division_color;
        this.outline_thickness = newVal.outline_thickness;
        this.division_thickness = newVal.division_thickness;
        this.stripe_uniform_proportion = newVal.stripe_proportion;
        this.stripe_tidy_proportion = newVal.stripe_proportion;
        this.stripe_uniform_thickness = newVal.stripe_thickness;
        this.stripe_uniform_interval_space = newVal.stripe_L_R;
        this.stripe_tidy_interval_space = newVal.stripe_L_R;
        this.stripe_uniform_former_space = newVal.stripe_B_A;
        this.stripe_tidy_former_space = newVal.stripe_B_A;
        this.encoding_value = newVal.encoding_value;
      }
    }
  },
  computed: {
    // 每个扇形区域所占的角度
    a_sector() {
      return 360 / this.show_data[0].data.length - this.sector_interval;
    },
    // 外轮廓半径
    outer_radius() {
      return this.radius_scale(this.max_radius - this.svg_edge_dis) - this.outline_thickness / 2;
    },
    // 内轮廓半径
    inner_radius() {
      return this.radius_scale(this.inner_radius_all);
    },
    // 扇形区域元数据
    meta_data() {
      return {
        inner: this.inner_radius + this.outline_thickness / 2,
        outer: this.outer_radius - this.outline_thickness / 2,
        start: angle_radian(this.sector_interval / 2 - this.a_sector / 2),
        end: angle_radian(this.sector_interval / 2 - this.a_sector / 2 + this.a_sector)
      }
    },
    // 条纹数量固定时
    sector_total_stripe() {
      return cal_total_strip(this.meta_data, this.stripe_tidy_interval_space, this.stripe_tidy_former_space, this.stripe_tidy_proportion, this.fixed_layer_num);
    },
    // 均匀分布条纹
    sector_random_stripe() {
      return GeneratePointsBasedOnPoissonDiskDistributions(this.meta_data, this.stripe_uniform_thickness, this.stripe_uniform_interval_space, this.stripe_uniform_former_space, this.stripe_uniform_proportion);
    },
  }
}
</script>

<style scoped>

</style>