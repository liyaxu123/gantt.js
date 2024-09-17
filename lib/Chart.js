import { addPrefixCls, createElement, createSvgElement } from "./utils";

/* 
  图表
*/
class Chart {
  constructor(wrapper, options = {}) {
    this.$wrapper = this.verify_wrapper(wrapper);
    this.options = options;

    this.initDom()
  }

  verify_wrapper(element) {
    if (typeof element === "string") {
      return document.querySelector(element);
    } else if (element instanceof HTMLElement) {
      return element;
    } else {
      throw new TypeError("Chart only supports usage of a string CSS selector, HTML DOM element for the 'element' parameter");
    }
  }

  initDom() {
    const $chartWrapper = createElement('main', addPrefixCls('chart-wrapper'));
    this.createGanttChart($chartWrapper);
    this.$wrapper.appendChild($chartWrapper);
  }

  createGanttChart(wrapper) {
    const $ganttChart = createElement('div', addPrefixCls('chart'));
    $ganttChart.style.width = `${this.options?.width}px`;
    $ganttChart.style.height = `${this.options?.height}px`;
    // 绑定鼠标滚轮事件
    $ganttChart.addEventListener('wheel', this.handleWheel.bind(this));

    // 创建SVG背景
    this.createSvgBg($ganttChart);
    wrapper.appendChild($ganttChart);
  }

  // 处理鼠标滚轮事件，注意 this 发生了变化
  handleWheel(event) {
    if (event.deltaX !== 0) {
      event.preventDefault();
      event.stopPropagation();
    }
    // 水平滚动，需要修改 TranslateX，重新渲染
    if (Math.abs(event.deltaX) > 0) {
      this.options.onWheel?.(event.deltaX);
    }
  }

  // 创建 SVG 背景
  createSvgBg(wrapper) {
    // 创建一个SVG元素
    const {
      width: viewWidth,
      height: viewHeight,
      translateX,
      minorList,
    } = this.options;

    const $svg = createSvgElement('svg', {
      width: viewWidth,
      height: viewHeight,
      viewBox: `${translateX} 0 ${viewWidth} ${viewHeight}`,
      class: addPrefixCls('chart-svg-renderer'),
    });
    this.$svg = $svg;

    this.createVerticalStripe(minorList, this.options.todayTranslateX);

    wrapper.appendChild($svg);
  }

  // 创建SVG竖条纹
  createVerticalStripe(minorList, todayTranslateX) {
    // 先清空再创建
    this.$svg.innerHTML = '';

    const {
      height: viewHeight,
      lineColor,
      weekBarBg,
      curDayLineColor,
    } = this.options;

    minorList?.forEach((item) => {
      // 创建group元素
      const $g = createSvgElement('g', {
        stroke: lineColor, // 设置线条颜色
      })

      // 创建path
      const $path = createSvgElement('path', {
        d: `M${item.left},0 L${item.left},${viewHeight}`,
      });
      $g.appendChild($path);
      // 如果是周末创建rect
      if (item.isWeek) {
        const $rect = createSvgElement('rect', {
          x: item.left,
          y: 0,
          width: item.width,
          height: viewHeight,
          fill: weekBarBg, // 周末条的背景颜色
          strokeWidth: 0,
        });
        $g.appendChild($rect);
      }

      // 如果是当天，绘制 “今日”
      if (todayTranslateX) {
        const left = todayTranslateX + 15;
        const $line = createSvgElement('path', {
          d: `M${left},0 L${left},${viewHeight}`,
          stroke: curDayLineColor,
        });
        $g.appendChild($line);
      }

      this.$svg.appendChild($g);
    })
  }

  // 重新渲染Svg背景
  rerenderSvgBg(translateX, minorList, todayTranslateX) {
    // 重新设置 todayTranslateX
    this.options.todayTranslateX = todayTranslateX;
    // 修改svg视图偏移
    this.setSvgViewBox(translateX);
    this.createVerticalStripe(minorList, todayTranslateX);
  }

  setSvgViewBox(translateX) {
    const { width: viewWidth, height: viewHeight } = this.options;
    this.$svg.setAttribute('viewBox', `${translateX} 0 ${viewWidth} ${viewHeight}`)
  }
}

export default Chart;