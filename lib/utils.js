// 一天的毫秒数
export const ONE_DAY_MS = 86400000;
// 图表最小比例
export const MIN_VIEW_RATE = 0.5;

// 视图日视图、周视图、月视图、季视图、年视图
export const viewTypeList = [
  {
    type: 'day',
    label: '日视图',
    value: 2880, // 一个格子宽度为30px, 一天24*60*60秒 / 30px = 2880秒/px
  },
  {
    type: 'week',
    label: '周视图',
    value: 3600, // 一个格子宽度为168px, 一周24*60*60*7秒 / 168px = 36000秒/px
  },
  {
    type: 'month',
    label: '月视图',
    value: 14400,
  },
  {
    type: 'quarter',
    label: '季视图',
    value: 86400,
  },
  {
    type: 'halfYear',
    label: '年视图',
    value: 115200,
  },
];

export const getViewTypeConfig = (viewType) => {
  return viewTypeList.find((item) => item.type === viewType)
}

// 创建DOM
export const createElement = (tagName, className) => {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  return element;
}

// 创建SVG元素
export const createSvgElement = (tagName, props = {}) => {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tagName);

  for (const key in props) {
    const value = props[key];
    element.setAttribute(key, value);
  }

  return element;
}

export const addPrefixCls = (str, prefixCls = 'my-gantt') => {
  return `${prefixCls}-${str}`;
}

// 监听DOM尺寸变化
export const observeDOMResize = (element, callBack) => {
  // 创建一个 ResizeObserver 实例
  const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      // 获取元素的新尺寸
      const width = entry.contentRect.width;
      const height = entry.contentRect.height;
      callBack?.({ width, height });
    }
  });

  // 开始观察目标元素
  resizeObserver.observe(element);

  // 停止观察元素（在不需要时，可以调用这个方法）
  // resizeObserver.unobserve(element);

  // 断开观察器（在完成所有操作后调用此方法）
  // resizeObserver.disconnect();
}