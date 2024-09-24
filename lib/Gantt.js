import TimeAxis from './TimeAxis';
import Chart from './Chart';
import { createElement, addPrefixCls } from './utils';
import './gantt.less';

class Gantt {
  constructor(wrapper, tasks, options) {
    this.prefixCls = 'my-gantt';
    this.tasks = tasks;
    this.options = options;
    this.setup_wrapper(wrapper);
    this._wheelTimer = null;
  }

  setup_wrapper(element) {
    if (typeof element === "string") {
      this.$container = document.querySelector(element);
    } else if (element instanceof HTMLElement) {
      this.$container = element;
    } else {
      throw new TypeError(
        "Gantt only supports usage of a string CSS selector," +
        " HTML DOM element for the 'element' parameter",
      );
    }

    // 创建甘特图外层容器
    this.$gantWrap = createElement('div', addPrefixCls('wrapper'));
    this.$container.appendChild(this.$gantWrap);

    // 实例化时间轴
    const timeAxis = new TimeAxis(this.$gantWrap, {
      viewType: this.options.viewType || 'day',
      showViewTypeSwitch: this.options.showViewTypeSwitch ?? true,
      showBackToday: this.options.showBackToday ?? true,
      onChange: ({ translateX, minorList, todayTranslateX, pxUnitAmp }) => {
        /* 
          1. viewType(视图类型)变化，导致translateX发生变化，会刷新 minorList，会重新渲染 chart的SVG背景
          2. translateX发生变化，会刷新 minorList，所以也需要重新渲染 chart的SVG背景
        */
        chart.rerenderSvgBg(translateX, minorList, todayTranslateX);
      },
      onViewTypeChange: ({ viewType, pxUnitAmp }) => {
        // 视图发生变化，会重新执行 setTranslateX，所以会自动重新渲染
        this.options.onViewTypeChange?.({ viewType, pxUnitAmp });
      },
      onTimelineClick: this.options.onTimelineClick,
    });

    // 实例化Chart
    const chart = new Chart(this.$gantWrap, {
      tasks: this.tasks,
      rowHeight: 40, // 行高
      translateX: timeAxis.translateX, // 偏移量
      todayTranslateX: timeAxis.todayTranslateX,
      minorList: timeAxis.getMinorList(),
      lineColor: this.options.lineColor || '#f0f0f0', // 线条颜色
      weekBarBg: this.options.weekBarBg || '#fafbfd', // 周末条的背景色
      onWheel: (offsetX) => { // 监听水平滚动事件
        if (this._wheelTimer) clearTimeout(this._wheelTimer);
        timeAxis.isMoveing = true;
        const newTranslateX = timeAxis.translateX + offsetX;
        timeAxis.setTranslateX(newTranslateX);

        this._wheelTimer = window.setTimeout(() => {
          timeAxis.isMoveing = false;
        }, 100);
      },
      onArrowBtnClick: ({ translateX }) => {
        timeAxis.setTranslateX(translateX);
      },
      onTaskBarClick: this.options.onTaskBarClick,
    });
  }
}

export default Gantt;