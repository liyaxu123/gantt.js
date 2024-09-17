/* 
 * 时间轴
 * 
 * @param {string | HTMLElement} wrapper 容器
 * @param {object} options 视图配置，默认为日视图
*/
import { createElement, addPrefixCls, viewTypeList, getViewTypeConfig } from './utils';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import isLeapYear from 'dayjs/plugin/isLeapYear';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(isBetween);
dayjs.extend(weekday);
dayjs.extend(weekOfYear);
dayjs.extend(quarterOfYear);
dayjs.extend(isLeapYear);
dayjs.extend(advancedFormat);

class TimeAxis {
  constructor(wrapper, options = {}) {
    this.$wrapper = this.verify_wrapper(wrapper);
    this.options = options;
    // 视图配置，默认为日视图
    const sightConfig = getViewTypeConfig(options?.viewType) || viewTypeList[0];
    this.sightConfig = sightConfig;
    this.headerWidth = this.$wrapper.clientWidth; // 宽度
    this.headerHeight = 57; // 高度
    // 默认偏移量
    this.translateX = dayjs(this.getStartDate()).valueOf() / (sightConfig.value * 1000);
    // 是否正在移动中
    this._isMoveing = false;

    this.initDom();
  }

  verify_wrapper(element) {
    if (typeof element === "string") {
      return document.querySelector(element);
    } else if (element instanceof HTMLElement) {
      return element;
    } else {
      throw new TypeError("TimeAxis only supports usage of a string CSS selector, HTML DOM element for the 'element' parameter");
    }
  }

  // 组装DOM结构
  initDom() {
    const $header = createElement('header', addPrefixCls('time-axis'));
    const $tableHeader = this.createTableHeader();
    const $timeAxisHeader = this.createTimeAxis();

    $header.appendChild($tableHeader);
    $header.appendChild($timeAxisHeader);

    // 创建返回今日
    if (this.options.showBackToday) {
      const $backToday = this.createBackToday();
      $header.appendChild($backToday);
      this.$backToday = $backToday;
    }

    // 创建切换视图
    if (this.options.showViewTypeSwitch) {
      const $viewTypeSelect = this.createChangeViewType();
      $header.appendChild($viewTypeSelect);
    }

    this.$wrapper.appendChild($header);
    this.$header = $header;
  }

  // 创建左侧表头
  createTableHeader() {
    const $tableHeader = createElement('div', addPrefixCls('table-header'));
    return $tableHeader;
  }

  // 创建右侧时间轴
  createTimeAxis() {
    const $timeAxisHeader = this.createTimeAxisHeader();
    const $timeAxis = createElement('div', addPrefixCls('time-axis'));
    // $timeAxis.style.left = `500px`;
    this.$timeAxis = $timeAxis;
    this.renderTimeAxisChunk($timeAxis);
    $timeAxisHeader.appendChild($timeAxis);
    return $timeAxisHeader;
  }

  // 渲染时间轴块
  renderTimeAxisChunk(wrapper) {
    const $timeAxisRenderChunk = createElement('div', addPrefixCls('time-axis-render-chunk'));
    // 设置水平偏移
    $timeAxisRenderChunk.style.transform = `translateX(-${this.translateX}px)`;

    this.createTimeAxisMajor($timeAxisRenderChunk);
    this.createTimeAxisMinor($timeAxisRenderChunk);
    // 向wrapper容器中添加之前先清空wrapper
    wrapper.innerHTML = '';
    wrapper.appendChild($timeAxisRenderChunk);
    return $timeAxisRenderChunk;
  }

  // 创建 header 并处理时间轴滚动
  createTimeAxisHeader() {
    const $timeAxisHeader = createElement('div', addPrefixCls('time-axis-header'));

    let positionX = 0;
    const handleMouseMove = (event) => {
      event.preventDefault();
      const moveX = event.clientX;

      const x = (moveX - positionX) - this.translateX;
      this.setTranslateX(-x);
    }

    const handleMouseUp = () => {
      this.isMoveing = false;

      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    // 绑定拖动事件
    $timeAxisHeader.onmousedown = (event) => {
      event.stopPropagation();
      event.preventDefault();
      this.isMoveing = true;

      positionX = event.clientX;

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return $timeAxisHeader;
  }

  // 创建主轴DOM
  createTimeAxisMajor(wrapper) {
    const majorList = this.getMajorList();
    majorList.forEach((item) => {
      const $major = createElement('div', addPrefixCls('time-axis-major'));
      const $majorLabel = createElement('div', addPrefixCls('time-axis-major-label'));
      $majorLabel.innerText = item.label;
      $major.appendChild($majorLabel);
      // 设置宽度
      $major.style.width = `${item.width}px`;
      // 设置left
      $major.style.left = `${item.left}px`;
      wrapper.appendChild($major);
    })
  }

  // 创建次轴DOM
  createTimeAxisMinor(wrapper) {
    const minorList = this.getMinorList();
    // console.log('minorList', minorList);

    minorList.forEach((item) => {
      const $minor = createElement('div', addPrefixCls('time-axis-minor'));
      const $minorLabel = createElement('div', addPrefixCls('time-axis-minor-label'));
      $minorLabel.innerText = item.label;
      $minor.appendChild($minorLabel);
      // 设置宽度
      $minor.style.width = `${item.width}px`;
      // 设置left
      $minor.style.left = `${item.left}px`;
      // 标识周末
      if (item.isWeek) {
        $minor.setAttribute('isWeek', true)
      }

      // 标识当天
      if (item.isToday) {
        $minor.setAttribute('curDay', true)
      }
      wrapper.appendChild($minor);
    })
  }

  // 创建返回今日
  createBackToday() {
    const $backToday = createElement('button', addPrefixCls('time-back-today'));
    $backToday.innerText = '返回今日';
    $backToday.style.display = 'none';

    $backToday.addEventListener('click', this.scrollToToday.bind(this));
    return $backToday;
  }

  // 创建切换视图
  createChangeViewType() {
    const $viewTypeSelect = createElement('select', addPrefixCls('view-type-switch'));

    viewTypeList.forEach((item) => {
      const $option = createElement('option', addPrefixCls('view-type-option'));
      $option.setAttribute('value', item.type)
      $option.innerText = item.label;
      $viewTypeSelect.appendChild($option);
    });

    // 设置默认值
    $viewTypeSelect.value = this.options?.viewType;

    $viewTypeSelect.addEventListener('change', (event) => {
      const val = event.target.value;
      this.setViewType(val);
    })

    return $viewTypeSelect;
  }

  setViewType(viewType) {
    this.options.viewType = viewType;
    this.sightConfig = getViewTypeConfig(viewType);
    const translateX = dayjs(this.getStartDate()).valueOf() / (this.sightConfig.value * 1000);
    // 执行 setTranslateX，会自动重新渲染
    this.setTranslateX(translateX);

    this.options.onViewTypeChange?.(viewType);
  }

  setBackTodayDisplay() {
    // 处理display
    const isOverLeft = this.todayTranslateX < this.translateX;
    const isOverRight = this.todayTranslateX > this.translateX + this.headerWidth;
    const display = isOverLeft || isOverRight ? 'block' : 'none';

    this.$backToday.style.display = display;
    // 处理定位
    if (isOverLeft) {
      this.$backToday.style.left = '0px';
      this.$backToday.style.right = 'unset';
    } else {
      this.$backToday.style.left = 'unset';
      this.$backToday.style.right = '111px';
    }
  }

  // 返回当天
  scrollToToday() {
    const translateX = this.todayTranslateX - this.headerWidth / 2;
    this.setTranslateX(translateX);
  }

  setTranslateX(translateX) {
    this.translateX = Math.max(translateX, 0);
    // 重新渲染时间轴数据
    this.renderTimeAxisChunk(this.$timeAxis);

    if (this.$backToday) {
      this.setBackTodayDisplay();
    }

    this.options.onChange?.({
      translateX,
      minorList: this.getMinorList(),
      todayTranslateX: this.todayTranslateX,
    });
  }

  // 获取视图宽度对应的毫秒数
  getDurationAmp() {
    const clientWidth = this.headerWidth;
    return this.pxUnitAmp * clientWidth;
  }

  // 获取主轴数据
  getMajorList() {
    const majorFormatMap = {
      day: 'YYYY年MM月',
      week: 'YYYY年MM月',
      month: 'YYYY年',
      quarter: 'YYYY年',
      halfYear: 'YYYY年',
    };
    // 获取当前开始时间毫秒数
    const { translateAmp } = this;
    // 获取结束时间的毫秒数
    const endAmp = translateAmp + this.getDurationAmp();
    // 获取当前视图类型
    const { type } = this.sightConfig;
    // 当前视图格式化类型
    const format = majorFormatMap[type];

    // 初始化当前时间
    let curDate = dayjs(translateAmp);
    // 主轴数据列表
    const dates = [];

    // 获取日期的开始时间
    const getStart = (date) => {
      if (type === 'day' || type === 'week') {
        return date.startOf('month');
      }
      return date.startOf('year');
    };

    // 获取日期的结束时间
    const getEnd = (date) => {
      // 如果类型为天或周，则返回月末时间
      if (type === 'day' || type === 'week') {
        return date.endOf('month');
      }
      // 否则返回年末时间
      return date.endOf('year');
    };

    /**
     * 获取下一个日期
     * @param {date} start - 起始日期
     * @returns {date} - 返回下一个日期
    */
    const getNextDate = (start) => {
      // 如果类型为天或周，则加上一个月
      if (type === 'day' || type === 'week') {
        return start.add(1, 'month');
      }
      // 否则加上一年
      return start.add(1, 'year');
    };

    // 对可视区域内的时间进行迭代
    while (curDate.isBetween(translateAmp - 1, endAmp + 1)) {
      const majorKey = curDate.format(format);

      let start = curDate;
      const end = getEnd(start);

      if (dates.length !== 0) {
        start = getStart(curDate);
      }

      dates.push({
        label: majorKey,
        startDate: start,
        endDate: end,
      });

      // 获取下次迭代的时间
      start = getStart(curDate);
      curDate = getNextDate(start);
    }

    return this.majorAmp2Px(dates);
  }

  majorAmp2Px(ampList) {
    const { pxUnitAmp } = this;
    const list = ampList.map((item) => {
      const { startDate } = item;
      const { endDate } = item;
      const { label } = item;
      const left = startDate.valueOf() / pxUnitAmp;
      const width = (endDate.valueOf() - startDate.valueOf()) / pxUnitAmp;

      return {
        label,
        left,
        width,
        key: startDate.format('YYYY-MM-DD HH:mm:ss'),
      };
    });
    return list;
  }

  // 获取次轴数据
  getMinorList() {
    const minorFormatMap = {
      day: 'YYYY-MM-D',
      week: 'YYYY-w周',
      month: 'YYYY-MM月',
      quarter: 'YYYY-第Q季',
      halfYear: 'YYYY-',
    };
    // 上半年的月份
    const fstHalfYear = [0, 1, 2, 3, 4, 5];
    const startAmp = this.translateAmp;
    const endAmp = startAmp + this.getDurationAmp();
    const format = minorFormatMap[this.sightConfig.type];

    // 初始化当前时间
    let curDate = dayjs(startAmp);
    // 次轴数据
    const dates = [];

    const getMinorKey = (date) => {
      if (this.sightConfig.type === 'halfYear') {
        return (
          date.format(format) +
          (fstHalfYear.includes(date.month()) ? '上半年' : '下半年')
        );
      }

      return date.format(format);
    };

    const setStart = (date) => {
      const map = {
        day() {
          // 返回当天的起始时间
          return date.startOf('day');
        },
        week() {
          // 返回本周一的起始时间
          return date.weekday(1).hour(0).minute(0).second(0);
        },
        month() {
          // 返回当月的起始时间
          return date.startOf('month');
        },
        quarter() {
          // 返回当季度的起始时间
          return date.startOf('quarter');
        },
        halfYear() {
          // 判断是否为上半年，如果是则返回上半年的起始时间，否则返回下半年的起始时间
          if (fstHalfYear.includes(date.month())) {
            return date.month(0).startOf('month');
          }
          return date.month(6).startOf('month');
        },
      };

      // 根据sightConfig对象中的type属性选择对应的起始日期处理函数并执行，然后返回起始日期对象
      return map[this.sightConfig.type]();
    };

    // 根据给定的起始时间，返回对应类型的结束时间
    const setEnd = (start) => {
      const map = {
        day() {
          // 返回当天的最后一秒
          return start.endOf('day');
        },
        week() {
          // 返回本周日的最后一秒
          return start.weekday(7).hour(23).minute(59).second(59);
        },
        month() {
          // 返回当月的最后一秒
          return start.endOf('month');
        },
        quarter() {
          // 返回当季度的最后一秒
          return start.endOf('quarter');
        },
        halfYear() {
          // 判断是否为上半年，并返回对应半年的最后一秒
          if (fstHalfYear.includes(start.month())) {
            return start.month(5).endOf('month');
          }
          return start.month(11).endOf('month');
        },
      };

      // 根据 sightConfig.type 调用对应的结束时间计算函数
      return map[this.sightConfig.type]();
    };

    const getNextDate = (start) => {
      const map = {
        day() {
          return start.add(1, 'day');
        },
        week() {
          return start.add(1, 'week');
        },
        month() {
          return start.add(1, 'month');
        },
        quarter() {
          return start.add(1, 'quarter');
        },
        halfYear() {
          return start.add(6, 'month');
        },
      };

      return map[this.sightConfig.type]();
    };

    while (curDate.isBetween(startAmp - 1, endAmp + 1)) {
      const minorKey = getMinorKey(curDate);
      const start = setStart(curDate);
      const end = setEnd(start);
      dates.push({
        label: minorKey.split('-').pop(),
        startDate: start,
        endDate: end,
      });
      curDate = getNextDate(start);
    }

    return this.minorAmp2Px(dates);
  }

  minorAmp2Px(ampList) {
    const { pxUnitAmp } = this;
    const list = ampList.map((item) => {
      const startDate = item.startDate;
      const endDate = item.endDate;

      const { label } = item;
      const left = startDate.valueOf() / pxUnitAmp;
      const width = (endDate.valueOf() - startDate.valueOf()) / pxUnitAmp;

      let isWeek = false;
      // const isToday = dayjs().isSame(dayjs(startDate), 'day');
      const isToday = this.isToday(startDate);
      if (this.sightConfig.type === 'day') {
        isWeek = this.isRestDay(startDate.toString());
      }
      return {
        label,
        left,
        width,
        isWeek,
        isToday,
        key: startDate.format('YYYY-MM-DD HH:mm:ss'),
      };
    });
    return list;
  }

  // 获取开始时间
  getStartDate() {
    return dayjs().subtract(10, 'day').toString();
  }

  // 1px对应的毫秒数
  get pxUnitAmp() {
    return this.sightConfig.value * 1000;
  }

  // 当前开始时间毫秒数
  get translateAmp() {
    const { translateX } = this;
    return this.pxUnitAmp * translateX;
  }

  // 当天日期的偏移量
  get todayTranslateX() {
    return dayjs().startOf('day').valueOf() / this.pxUnitAmp;
  }

  get isMoveing() {
    return this._isMoveing;
  }

  // 定义 setter，监听属性值的变化
  set isMoveing(value) {
    if (this._isMoveing !== value) {
      this._isMoveing = value;
      this.onMoveingChange(this.isMoveing);
    }
  }

  onMoveingChange(isMoveing) {
    if (isMoveing) {
      this.$timeAxis.style.cursor = 'col-resize';
      // 时间轴在滚动时，不显示今日
      if (this.$backToday) {
        this.$backToday.style.opacity = 0;
      }
    } else {
      this.$timeAxis.style.cursor = 'ew-resize';
      if (this.$backToday) {
        this.$backToday.style.opacity = 1;
      }
    }
  }

  // 判断是否为休息日
  isRestDay(date) {
    // dayjs(date).weekday() 获取日期对象的星期几（返回值范围是0到6，其中0代表周日，6代表周六）
    return [0, 6].includes(dayjs(date).weekday());
  }

  // 判断是否为今天
  isToday(date) {
    const today = dayjs().startOf('day'); // 今天的日期开始时间

    let res = false;
    if (this.sightConfig.type === 'day') {
      res = date.isSame(today, 'day');
    } else if (this.sightConfig.type === 'week') {
      res = date.isSame(today, 'week');
    } else if (this.sightConfig.type === 'month') {
      res = date.isSame(today, 'month');
    } else if (this.sightConfig.type === 'quarter' || this.sightConfig.type === 'halfYear') {
      res = date.isSame(today, 'quarter');
    }

    return res; // 判断是否是同一天
  }
}

export default TimeAxis;