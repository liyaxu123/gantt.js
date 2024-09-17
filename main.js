import './style.less';
import Gantt from './lib/Gantt.js';
import TimeAxis from './lib/TimeAxis.js';
import Chart from './lib/Chart.js'

const tasks = [
  {
    id: 'Task 1',
    name: '任务1',
    start: '2024-09-11',
    end: '2024-09-31',
    progress: 20,
    dependencies: 'Task 2, Task 3'
  },
  {
    id: 'Task 2',
    name: '任务2',
    start: '2024-09-13',
    end: '2024-09-31',
    progress: 40,
    dependencies: 'Task 2, Task 3'
  },
  {
    id: 'Task 3',
    name: '任务3',
    start: '2024-09-17',
    end: '2024-09-31',
    progress: 60,
    dependencies: 'Task 2, Task 3'
  },
];

const gantt = new Gantt('#app', tasks, {
  viewType: 'day', // 视图类型
  showViewTypeSwitch: true, // 是否显示视图切换按钮
  showBackToday: true, // 是否显示返回今日按钮
  lineColor: '#f0f0f0', // 线条颜色
  curDayLineColor: '#1890ff', // 当天日期的线条颜色
  weekBarBg: '#fafbfd', // 周末条的背景色
  onViewTypeChange: (viewType) => {
    console.log(viewType);
  },
});
console.log(gantt);

new TimeAxis('#timeLine', {
  viewType: 'day', // 视图类型
});

new Chart("#chartBox", {
  width: 1203, // 宽
  height: 6000, // 高
  translateX: 599134.0774305556, // 偏移量
  lineColor: '#f0f0f0', // 线条颜色
  curDayLineColor: '#1890ff', // 当天日期的线条颜色
  weekBarBg: '#fafbfd', // 周末条的背景色
  minorList: [
    {
      "label": "5",
      "left": 599120,
      "width": 29.999999652777777,
      "isWeek": false,
      "isCurDay": false,
      "key": "2024-09-05 00:00:00"
    },
    {
      "label": "6",
      "left": 599150,
      "width": 29.999999652777777,
      "isWeek": false,
      "isCurDay": false,
      "key": "2024-09-06 00:00:00"
    },
    {
      "label": "7",
      "left": 599180,
      "width": 29.999999652777777,
      "isWeek": true,
      "isCurDay": false,
      "key": "2024-09-07 00:00:00"
    },
    {
      "label": "8",
      "left": 599210,
      "width": 29.999999652777777,
      "isWeek": true,
      "isCurDay": false,
      "key": "2024-09-08 00:00:00"
    },
    {
      "label": "9",
      "left": 599240,
      "width": 29.999999652777777,
      "isWeek": false,
      "isCurDay": false,
      "key": "2024-09-09 00:00:00"
    },
    {
      "label": "10",
      "left": 599270,
      "width": 29.999999652777777,
      "isWeek": false,
      "isCurDay": false,
      "key": "2024-09-10 00:00:00"
    },
    {
      "label": "11",
      "left": 599300,
      "width": 29.999999652777777,
      "isWeek": false,
      "isCurDay": false,
      "key": "2024-09-11 00:00:00"
    },
    {
      "label": "12",
      "left": 599330,
      "width": 29.999999652777777,
      "isWeek": false,
      "isCurDay": false,
      "key": "2024-09-12 00:00:00"
    },
    {
      "label": "13",
      "left": 599360,
      "width": 29.999999652777777,
      "isWeek": false,
      "isCurDay": false,
      "key": "2024-09-13 00:00:00"
    },
    {
      "label": "14",
      "left": 599390,
      "width": 29.999999652777777,
      "isWeek": true,
      "isCurDay": false,
      "key": "2024-09-14 00:00:00"
    },
    {
      "label": "15",
      "left": 599420,
      "width": 29.999999652777777,
      "isWeek": true,
      "isCurDay": true,
      "key": "2024-09-15 00:00:00"
    },
    {
      "label": "16",
      "left": 599450,
      "width": 29.999999652777777,
      "isWeek": false,
      "isCurDay": false,
      "key": "2024-09-16 00:00:00"
    },
    {
      "label": "17",
      "left": 599480,
      "width": 29.999999652777777,
      "isWeek": false,
      "isCurDay": false,
      "key": "2024-09-17 00:00:00"
    },
    {
      "label": "18",
      "left": 599510,
      "width": 29.999999652777777,
      "isWeek": false,
      "isCurDay": false,
      "key": "2024-09-18 00:00:00"
    },
    {
      "label": "19",
      "left": 599540,
      "width": 29.999999652777777,
      "isWeek": false,
      "isCurDay": false,
      "key": "2024-09-19 00:00:00"
    },
    {
      "label": "20",
      "left": 599570,
      "width": 29.999999652777777,
      "isWeek": false,
      "isCurDay": false,
      "key": "2024-09-20 00:00:00"
    },
    {
      "label": "21",
      "left": 599600,
      "width": 29.999999652777777,
      "isWeek": true,
      "isCurDay": false,
      "key": "2024-09-21 00:00:00"
    },
    {
      "label": "22",
      "left": 599630,
      "width": 29.999999652777777,
      "isWeek": true,
      "isCurDay": false,
      "key": "2024-09-22 00:00:00"
    },
    {
      "label": "23",
      "left": 599660,
      "width": 29.999999652777777,
      "isWeek": false,
      "isCurDay": false,
      "key": "2024-09-23 00:00:00"
    },
    {
      "label": "24",
      "left": 599690,
      "width": 29.999999652777777,
      "isWeek": false,
      "isCurDay": false,
      "key": "2024-09-24 00:00:00"
    },
    {
      "label": "25",
      "left": 599720,
      "width": 29.999999652777777,
      "isWeek": false,
      "isCurDay": false,
      "key": "2024-09-25 00:00:00"
    },
    {
      "label": "26",
      "left": 599750,
      "width": 29.999999652777777,
      "isWeek": false,
      "isCurDay": false,
      "key": "2024-09-26 00:00:00"
    },
    {
      "label": "27",
      "left": 599780,
      "width": 29.999999652777777,
      "isWeek": false,
      "isCurDay": false,
      "key": "2024-09-27 00:00:00"
    },
    {
      "label": "28",
      "left": 599810,
      "width": 29.999999652777777,
      "isWeek": true,
      "isCurDay": false,
      "key": "2024-09-28 00:00:00"
    },
    {
      "label": "29",
      "left": 599840,
      "width": 29.999999652777777,
      "isWeek": true,
      "isCurDay": false,
      "key": "2024-09-29 00:00:00"
    },
    {
      "label": "30",
      "left": 599870,
      "width": 29.999999652777777,
      "isWeek": false,
      "isCurDay": false,
      "key": "2024-09-30 00:00:00"
    },
    {
      "label": "1",
      "left": 599900,
      "width": 29.999999652777777,
      "isWeek": false,
      "isCurDay": false,
      "key": "2024-10-01 00:00:00"
    },
    {
      "label": "2",
      "left": 599930,
      "width": 29.999999652777777,
      "isWeek": false,
      "isCurDay": false,
      "key": "2024-10-02 00:00:00"
    },
    {
      "label": "3",
      "left": 599960,
      "width": 29.999999652777777,
      "isWeek": false,
      "isCurDay": false,
      "key": "2024-10-03 00:00:00"
    },
    {
      "label": "4",
      "left": 599990,
      "width": 29.999999652777777,
      "isWeek": false,
      "isCurDay": false,
      "key": "2024-10-04 00:00:00"
    },
    {
      "label": "5",
      "left": 600020,
      "width": 29.999999652777777,
      "isWeek": true,
      "isCurDay": false,
      "key": "2024-10-05 00:00:00"
    },
    {
      "label": "6",
      "left": 600050,
      "width": 29.999999652777777,
      "isWeek": true,
      "isCurDay": false,
      "key": "2024-10-06 00:00:00"
    },
    {
      "label": "7",
      "left": 600080,
      "width": 29.999999652777777,
      "isWeek": false,
      "isCurDay": false,
      "key": "2024-10-07 00:00:00"
    },
    {
      "label": "8",
      "left": 600110,
      "width": 29.999999652777777,
      "isWeek": false,
      "isCurDay": false,
      "key": "2024-10-08 00:00:00"
    },
    {
      "label": "9",
      "left": 600140,
      "width": 29.999999652777777,
      "isWeek": false,
      "isCurDay": false,
      "key": "2024-10-09 00:00:00"
    },
    {
      "label": "10",
      "left": 600170,
      "width": 29.999999652777777,
      "isWeek": false,
      "isCurDay": false,
      "key": "2024-10-10 00:00:00"
    },
    {
      "label": "11",
      "left": 600200,
      "width": 29.999999652777777,
      "isWeek": false,
      "isCurDay": false,
      "key": "2024-10-11 00:00:00"
    },
    {
      "label": "12",
      "left": 600230,
      "width": 29.999999652777777,
      "isWeek": true,
      "isCurDay": false,
      "key": "2024-10-12 00:00:00"
    },
    {
      "label": "13",
      "left": 600260,
      "width": 29.999999652777777,
      "isWeek": true,
      "isCurDay": false,
      "key": "2024-10-13 00:00:00"
    },
    {
      "label": "14",
      "left": 600290,
      "width": 29.999999652777777,
      "isWeek": false,
      "isCurDay": false,
      "key": "2024-10-14 00:00:00"
    },
    {
      "label": "15",
      "left": 600320,
      "width": 29.999999652777777,
      "isWeek": false,
      "isCurDay": false,
      "key": "2024-10-15 00:00:00"
    }
  ]
});