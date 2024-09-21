/* 
  图表
*/

import { addPrefixCls, createElement, createSvgElement, HEADER_HEIGHT, TOP_PADDING } from "./utils";
import throttle from 'lodash/throttle';
import dayjs from "dayjs";

class Chart {
  constructor(wrapper, options = {}) {
    this.$wrapper = this.verify_wrapper(wrapper);
    this.options = options;
    // 1px对应的毫秒数
    this.pxUnitAmp = dayjs().startOf('day').valueOf() / this.options.todayTranslateX;
    // 记录垂直滚动距离
    this.scrollTop = 0;
    // 垂直虚拟滚动开始索引
    this.virtualStartIndex = 0;

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
    $chartWrapper.style.height = `${this.bodyClientHeight}px`;
    // 给 $chartWrapper 绑定垂直滚动事件
    $chartWrapper.addEventListener('scroll', this.handleScroll.bind(this));

    this.createGanttChart($chartWrapper);
    this.$wrapper.appendChild($chartWrapper);

    this.handleTaskItemInView();
  }

  // 绑定水平滚动事件
  createGanttChart(wrapper) {
    const $ganttChart = createElement('div', addPrefixCls('chart'));
    $ganttChart.style.width = `${this.bodyClientWidth}px`;
    $ganttChart.style.height = `${this.bodyScrollHeight}px`;
    // 绑定鼠标滚轮事件
    $ganttChart.addEventListener('wheel', this.handleWheel.bind(this));

    let positionX = 0;
    const handleMouseMove = (event) => {
      event.preventDefault();
      const moveX = event.clientX;
      const x = moveX - positionX;
      this.options.onWheel?.(-x);
    }
    const handleMouseUp = () => {
      $ganttChart.style.cursor = 'default';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    // 绑定鼠标拖动事件
    $ganttChart.onmousedown = (event) => {
      const targetClassName = event.target.className;
      if (targetClassName !== addPrefixCls('task-row-style-bar')) {
        return
      }

      event.stopPropagation();
      event.preventDefault();
      positionX = event.clientX;
      $ganttChart.style.cursor = 'col-resize';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    // 创建SVG背景
    this.createSvgBg($ganttChart);
    // 创建横条纹管道
    this.createTaskBarRenderChunk($ganttChart);
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
      translateX,
      minorList,
    } = this.options;

    const $svg = createSvgElement('svg', {
      width: this.bodyClientWidth,
      height: this.bodyScrollHeight,
      viewBox: `${translateX} 0 ${this.bodyClientWidth} ${this.bodyScrollHeight}`,
      class: addPrefixCls('chart-svg-renderer'),
    });
    this.$svg = $svg;

    this.createVerticalStripe(minorList);

    wrapper.appendChild($svg);
  }

  // 创建SVG竖条纹
  createVerticalStripe(minorList) {
    // 先清空再创建
    this.$svg.innerHTML = '';

    const {
      lineColor,
      weekBarBg,
    } = this.options;

    const fragment = document.createDocumentFragment();
    minorList?.forEach((item) => {
      // 创建group元素
      const $g = createSvgElement('g', {
        stroke: lineColor, // 设置线条颜色
      })

      // 创建path
      const $path = createSvgElement('path', {
        d: `M${item.left},0 L${item.left},${this.bodyScrollHeight}`,
      });
      $g.appendChild($path);
      // 如果是周末创建rect
      if (item.isWeek) {
        const $rect = createSvgElement('rect', {
          x: item.left,
          y: 0,
          width: item.width,
          height: this.bodyScrollHeight,
          fill: weekBarBg, // 周末条的背景颜色
          strokeWidth: 0,
        });
        $g.appendChild($rect);
      }

      fragment.appendChild($g);
    })
    this.$svg.appendChild(fragment);
  }

  // 创建任务条区域
  createTaskBarRenderChunk(wrapper) {
    const $taskBarRenderChunk = createElement('div', addPrefixCls('task-bar-render-chunk'));
    $taskBarRenderChunk.style.cssText = `height: ${this.bodyScrollHeight}px; transform: translateX(-${this.options.translateX}px`;
    this.$taskBarRenderChunk = $taskBarRenderChunk;
    // 渲染 taskBar
    this.renderTaskBar();
    wrapper.appendChild($taskBarRenderChunk);
  }

  renderTaskBar() {
    const { count, start } = this.getVisibleRows;
    this.$taskBarRenderChunk.innerHTML = '';
    let end = start + count;
    if (end >= this.getBarList.length) {
      end = this.getBarList.length;
    }

    const fragment = document.createDocumentFragment();
    for (let i = start; i < end; i++) {
      const item = this.getBarList[i];
      const $taskRow = this.createTaskRow();
      $taskRow.style.top = `${i * this.options.rowHeight}px`;
      const $taskRowStyleBar = this.createTaskRowStyleBar();
      const $taskItemWrapper = this.renderTaskItem(item);

      $taskRow.appendChild($taskRowStyleBar);
      $taskRow.appendChild($taskItemWrapper);
      fragment.appendChild($taskRow);
    }
    this.$taskBarRenderChunk.appendChild(fragment);
    // 创建今日线
    this.createTodayLine();
  }

  createTaskRow() {
    const $taskRow = createElement('div', addPrefixCls('task-row'));
    $taskRow.style.width = `${this.bodyClientWidth}px`;
    return $taskRow;
  }

  // 负责渲染 taskRow 的样式
  createTaskRowStyleBar() {
    const $taskRowStyleBar = createElement('div', addPrefixCls('task-row-style-bar'));
    $taskRowStyleBar.style.transform = `translateX(${this.options.translateX}px)`;
    const $taskitemGoBackLeftBtn = this.taskitemGoBackBtnOnLeft();
    const $taskitemGoBackRightBtn = this.taskitemGoBackBtnOnRight();
    $taskRowStyleBar.appendChild($taskitemGoBackLeftBtn);
    $taskRowStyleBar.appendChild($taskitemGoBackRightBtn);
    return $taskRowStyleBar;
  }

  taskitemGoBackBtnOnLeft() {
    const $btn = createElement('div', addPrefixCls('task-item-go-back-left-btn'));
    $btn.innerHTML = '«';
    const _this = this;
    $btn.addEventListener('click', function () {
      const translateX = this.getAttribute('data-translatex');
      _this.options.onArrowBtnClick?.({
        translateX: translateX - _this.bodyClientWidth / 2,
      });
    })
    return $btn;
  }

  taskitemGoBackBtnOnRight() {
    const $btn = createElement('div', addPrefixCls('task-item-go-back-right-btn'));
    $btn.innerHTML = '»';
    const _this = this;
    $btn.addEventListener('click', function () {
      const translateX = this.getAttribute('data-translatex');
      _this.options.onArrowBtnClick?.({
        translateX: translateX - _this.bodyClientWidth / 2,
      });
    })
    return $btn;
  }

  // 渲染每一个任务条
  renderTaskItem(data) {
    const $taskItemWrapper = createElement('div', addPrefixCls('task-item-wrapper'));
    $taskItemWrapper.style.height = `${this.options.rowHeight - 1}px`;

    // 判断日期是否合法
    const valid = dayjs(data.startDate).isValid() && dayjs(data.endDate).isValid();
    if (!valid) {
      throw new Error("startDate or endDate is invalid");
    }

    let startAmp = dayjs(data.startDate || 0).startOf('day').valueOf();
    let endAmp = dayjs(data.endDate || 0).endOf('day').valueOf();
    // 最小宽度
    const minStamp = 11 * this.pxUnitAmp;
    // 开始结束日期相同默认一天
    if (Math.abs(endAmp - startAmp) < minStamp) {
      startAmp = dayjs(data.startDate || 0).startOf('day').valueOf();
      endAmp = dayjs(data.endDate || 0).endOf('day').add(minStamp, 'millisecond').valueOf();
    }
    // 计算宽度
    const width = (endAmp - startAmp) / this.pxUnitAmp;
    // 计算偏移
    const translateX = startAmp / this.pxUnitAmp;

    const $taskItem = createElement('div', addPrefixCls('task-item'));
    $taskItem.style.cssText = `width: ${width}px; transform: translateX(${translateX}px);`;
    $taskItem.innerHTML = data.title;
    $taskItemWrapper.appendChild($taskItem);
    return $taskItemWrapper;
  }

  // 创建今日线
  createTodayLine() {
    const $todayLine = createElement('div', addPrefixCls('today-line'));
    $todayLine.style.transform = `translateX(${this.options.todayTranslateX + 15}px)`;
    this.$taskBarRenderChunk.appendChild($todayLine);
  }

  // 重新渲染任务行在水平移动时，只修改样式，避免重新创建
  rerenderTaskRowOnScrollX() {
    const translateX = this.options.translateX;
    this.$taskBarRenderChunk.style.transform = `translateX(-${translateX}px`;
    const taskRowStyleBarList = document.querySelectorAll(`.${addPrefixCls('task-row-style-bar')}`);
    taskRowStyleBarList.forEach((item) => {
      item.style.transform = `translateX(${translateX}px)`;
    })

    // 判断 taskItem 水平滚动时是否在视图内
    this.handleTaskItemInView()
  }

  // 判断 taskItem 滚动时是否在视图内
  handleTaskItemInView = throttle(() => {
    const translateX = this.options.translateX;
    const taskItemList = document.querySelectorAll(`.${addPrefixCls('task-item')}`);
    taskItemList.forEach((item) => {
      // 获取每一个 taskItem 的 translateX
      const itemTranslateX = parseInt(item.getAttribute('style').match(/translateX\((\d+)px/)[1]);
      const itemWidth = parseInt(item.offsetWidth);
      // 获取父元素的上一个兄弟元素
      const $taskRowStyleBar = item.parentElement.previousElementSibling;
      const $leftArrowBtn = $taskRowStyleBar.querySelector(`.${addPrefixCls('task-item-go-back-left-btn')}`);
      const $rightArrowBtn = $taskRowStyleBar.querySelector(`.${addPrefixCls('task-item-go-back-right-btn')}`);

      // 在左侧隐藏
      if ((itemTranslateX + itemWidth <= translateX)) {
        $leftArrowBtn.setAttribute('data-left-arrow', true);
        $leftArrowBtn.setAttribute('data-translateX', itemTranslateX);
      } else {
        $leftArrowBtn.removeAttribute('data-left-arrow');
      }

      // 在右侧隐藏
      if (itemTranslateX >= translateX + this.bodyClientWidth) {
        $rightArrowBtn.setAttribute('data-right-arrow', true);
        $rightArrowBtn.setAttribute('data-translateX', itemTranslateX);
      } else {
        $rightArrowBtn.removeAttribute('data-right-arrow');
      }
    })
  }, 300)

  // 重新渲染Svg背景
  rerenderSvgBg(translateX, minorList, todayTranslateX) {
    // 重新设置
    this.options.translateX = translateX;
    this.options.minorList = minorList;
    // 视图发生了变化
    if (this.options.todayTranslateX !== todayTranslateX) {
      this.options.todayTranslateX = todayTranslateX;
      this.pxUnitAmp = dayjs().startOf('day').valueOf() / todayTranslateX;
      // 切视图时，需要重新渲染
      this.renderTaskBar();
    }

    // 修改svg视图偏移
    this.setSvgViewBox(translateX);
    this.createVerticalStripe(minorList);
    // 水平滚动，重新渲染任务行
    this.rerenderTaskRowOnScrollX();
  }

  setSvgViewBox(translateX) {
    this.$svg.setAttribute('viewBox', `${translateX} 0 ${this.bodyClientWidth} ${this.bodyScrollHeight}`)
  }

  // 处理垂直滚动事件
  handleScroll(event) {
    const { scrollTop } = event.currentTarget;
    this.setScrollY(scrollTop);

    // 处理虚拟滚动，计算开始位置
    const newStartIndex = Math.floor(scrollTop / this.options.rowHeight);
    if (newStartIndex !== this.virtualStartIndex) {
      this.virtualStartIndex = newStartIndex;
      // 重新渲染
      this.renderTaskBar();
    }

    this.handleTaskItemInView()
  }

  // 设置垂直滚动高度，节流处理
  setScrollY = throttle((scrollTop) => {
    this.scrollTop = scrollTop;
  }, 100);

  // 内容区宽度
  get bodyClientWidth() {
    const { width: $wrapperWidth } = this.$wrapper.getBoundingClientRect();
    return $wrapperWidth;
  }

  // 内容区高度
  get bodyClientHeight() {
    const { height: $wrapperHeight } = this.$wrapper.getBoundingClientRect();
    return $wrapperHeight - HEADER_HEIGHT;
  }

  // 内容区滚动区域高度
  get bodyScrollHeight() {
    let height = this.getBarList.length * this.options.rowHeight + TOP_PADDING;
    if (height < this.bodyClientHeight) {
      height = this.bodyClientHeight;
    }

    return height;
  }

  // 获取任务条列表数据
  get getBarList() {
    return this.options.tasks;
  }

  // 获取可视区域的行，虚拟滚动处理
  get getVisibleRows() {
    const visibleHeight = this.bodyClientHeight;
    // 多渲染几个，减少空白
    const visibleRowCount = Math.ceil(visibleHeight / this.options.rowHeight) + 10;

    return {
      start: this.virtualStartIndex,
      count: visibleRowCount,
    };
  }
}

export default Chart;