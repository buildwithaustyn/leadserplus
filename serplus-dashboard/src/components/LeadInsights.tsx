'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faMoneyBillWave,
  faRobot,
  faGaugeHigh,
  faUsers,
  faPercent,
  faBullhorn,
  faRankingStar
} from '@fortawesome/free-solid-svg-icons';
import StatsCard from './StatsCard';
import {
  TimeSavingsChart,
  CostSavingsChart,
  AIEfficiencyChart,
  LeadTrendsChart,
  LeadSourcesChart
} from './Charts';

export default function LeadInsights() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Performance & ROI Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Monthly Time Saved"
          value="120 hrs"
          change="Equivalent to 3 full-time employees"
          icon={faClock}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-500"
        />
        
        <StatsCard
          title="Monthly Cost Saved"
          value="$15,000"
          change="vs. Traditional Methods"
          icon={faMoneyBillWave}
          iconBgColor="bg-green-100"
          iconColor="text-green-500"
        />
        
        <StatsCard
          title="AI Automation Value"
          value="$8,500"
          change="vs. Manual Processing"
          icon={faRobot}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-500"
        />
        
        <StatsCard
          title="Efficiency Gain"
          value="85%"
          change="Faster Than Manual Methods"
          icon={faGaugeHigh}
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatsCard
          title="Total Leads"
          value="2,547"
          change="+12.5% from last month"
          icon={faUsers}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-500"
        />

        <StatsCard
          title="Conversion Rate"
          value="4.8%"
          change="+2.1% from last month"
          icon={faPercent}
          iconBgColor="bg-green-100"
          iconColor="text-green-500"
        />

        <StatsCard
          title="Active Campaigns"
          value="12"
          change="3 ending soon"
          icon={faBullhorn}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-500"
        />

        <StatsCard
          title="AI Lead Score"
          value="85/100"
          change="High quality leads"
          icon={faRankingStar}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeSavingsChart />
        <CostSavingsChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeadTrendsChart />
        <LeadSourcesChart />
      </div>
    </div>
  );
}
