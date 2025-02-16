'use client';

import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export function TimeSavingsChart() {
  const options: ApexOptions = {
    chart: {
      height: 350,
      type: 'area',
      toolbar: {
        show: false
      },
      background: 'transparent'
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2,
      colors: ['#3b82f6', '#ef4444']
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      labels: {
        style: {
          colors: '#4b5563'
        }
      }
    },
    yaxis: {
      title: {
        text: 'Hours'
      },
      labels: {
        style: {
          colors: '#4b5563'
        }
      }
    },
    tooltip: {
      theme: 'light'
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 5
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100]
      }
    },
    theme: {
      mode: 'light'
    }
  };

  const series = [
    {
      name: 'Time Saved',
      data: [45, 52, 68, 74, 85, 120]
    },
    {
      name: 'Manual Process Time',
      data: [120, 120, 120, 120, 120, 120]
    }
  ];

  return (
    <div className="dashboard-card p-6 bg-white border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Savings Trend</h3>
      <ReactApexChart options={options} series={series} type="area" height={350} />
    </div>
  );
}

export function CostSavingsChart() {
  const options: ApexOptions = {
    chart: {
      height: 350,
      type: 'bar',
      toolbar: {
        show: false
      },
      background: 'transparent'
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        dataLabels: {
          position: 'top'
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return '$' + val.toLocaleString();
      },
      offsetY: -20,
      style: {
        fontSize: '12px',
        colors: ['#4b5563']
      }
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      labels: {
        style: {
          colors: '#4b5563'
        }
      }
    },
    yaxis: {
      title: {
        text: 'Cost Savings ($)'
      },
      labels: {
        formatter: function (val) {
          return '$' + val.toLocaleString();
        },
        style: {
          colors: '#4b5563'
        }
      }
    },
    colors: ['#10b981'],
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 5
    }
  };

  const series = [
    {
      name: 'Cost Savings',
      data: [5000, 7500, 9000, 11000, 13500, 15000]
    }
  ];

  return (
    <div className="dashboard-card p-6 bg-white border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Cost Savings</h3>
      <ReactApexChart options={options} series={series} type="bar" height={350} />
    </div>
  );
}

export function AIEfficiencyChart() {
  const options: ApexOptions = {
    chart: {
      height: 350,
      type: 'radialBar',
      background: 'transparent'
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: {
          margin: 0,
          size: '70%',
          background: '#fff',
          image: undefined,
          imageOffsetX: 0,
          imageOffsetY: 0,
          position: 'front'
        },
        track: {
          background: '#e5e7eb',
          strokeWidth: '67%',
          margin: 0
        },
        dataLabels: {
          show: true,
          name: {
            show: true,
            fontSize: '16px',
            fontWeight: 600,
            color: '#4b5563',
            offsetY: -10
          },
          value: {
            show: true,
            fontSize: '36px',
            fontWeight: 700,
            color: '#3b82f6',
            offsetY: 5,
            formatter: function (val) {
              return val + '%';
            }
          }
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.5,
        gradientToColors: ['#3b82f6'],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100]
      }
    },
    stroke: {
      dashArray: 4
    },
    labels: ['AI Efficiency']
  };

  const series = [95];

  return (
    <div className="dashboard-card p-6 bg-white border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Efficiency Score</h3>
      <ReactApexChart options={options} series={series} type="radialBar" height={350} />
    </div>
  );
}

export function LeadTrendsChart() {
  const options: ApexOptions = {
    chart: {
      height: 350,
      type: 'area',
      toolbar: {
        show: false
      },
      background: 'transparent'
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2,
      colors: ['#3b82f6', '#10b981']
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      labels: {
        style: {
          colors: '#4b5563'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#4b5563'
        }
      }
    },
    tooltip: {
      theme: 'light'
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 5
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100]
      }
    },
    theme: {
      mode: 'light'
    }
  };

  const series = [
    {
      name: 'Total Leads',
      data: [31, 40, 28, 51, 42, 109, 100]
    },
    {
      name: 'Qualified Leads',
      data: [11, 32, 45, 32, 34, 52, 41]
    }
  ];

  return (
    <div className="dashboard-card p-6 bg-white border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Generation Trends</h3>
      <ReactApexChart options={options} series={series} type="area" height={350} />
    </div>
  );
}

export function LeadSourcesChart() {
  const options: ApexOptions = {
    chart: {
      type: 'donut',
      background: 'transparent'
    },
    labels: ['Organic Search', 'Paid Ads', 'Social Media', 'Referrals'],
    theme: {
      mode: 'light'
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }],
    tooltip: {
      theme: 'light'
    }
  };

  const series = [44, 55, 13, 43];

  return (
    <div className="dashboard-card p-6 bg-white border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Sources Distribution</h3>
      <ReactApexChart options={options} series={series} type="donut" height={350} />
    </div>
  );
}
