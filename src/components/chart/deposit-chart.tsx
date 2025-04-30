'use client'

import { useState } from 'react'

// Array of blue color variants
const BLUE_VARIANTS = [
  '#FFFFFF',  // White
  '#B3CCFF',  // Lightest blue
  '#8BB3FF',  // Light blue
  '#5B8BFF',  // Medium blue
  '#2B5CFF',  // Dark blue
] as const;

interface DepositSection {
  percentage: number
  pairName: string
}

interface DepositChartProps {
  totalDeposit: number
  sections: DepositSection[]
}

export function DepositChart({ 
  totalDeposit = 0,
  sections = []
}: DepositChartProps) {
  // State for tracking selected section
  const [selectedSection, setSelectedSection] = useState<DepositSection | null>(null);

  // Calculate the circumference of the circle
  const circumference = 2 * Math.PI * 40; // 2πr where r=40
  
  // Helper function to get color for section index (cycles through colors)
  const getColorForIndex = (index: number) => {
    return BLUE_VARIANTS[index % BLUE_VARIANTS.length];
  };

  // Calculate stroke dasharray and offset for each section
  const getSectionStyles = (index: number) => {
    const offset = sections
      .slice(0, index)
      .reduce((acc, section) => acc + section.percentage, 0);

    // Calculate total percentage of all sections
    const totalPercentage = sections.reduce((acc, section) => acc + section.percentage, 0);
    
    return {
      strokeDasharray: `${(sections[index].percentage * circumference) / 100} ${circumference}`,
      strokeDashoffset: `${((100 - totalPercentage) / 4 - offset) * circumference / 100}`,
      opacity: selectedSection === sections[index] ? '1' : '0.8',
      transition: 'opacity 0.2s ease-in-out',
      cursor: 'pointer'
    };
  };

  // Get the largest section for initial display
  const largestSection = sections.reduce((max, section) => 
    section.percentage > max.percentage ? section : max
  , sections[0]);

  return (
    <div className="rounded-[32px] p-2 flex flex-col gap-4">
      <div>
        <div className="text-gray text-l">Total Deposit</div>
        <div className="text-leah text-[24px] leading-[30px] font-medium">${totalDeposit.toFixed(2)}</div>
      </div>
      
      <div className="relative flex justify-center items-center">
        <div className="relative w-[150px] h-[150px]">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              className="stroke-[#2F3033]"
              fill="none"
              strokeWidth="12"
              cx="50"
              cy="50"
              r="40"
            />
            {/* Progress circles */}
            {sections.map((section, index) => (
              <circle
                key={index}
                stroke={getColorForIndex(index)}
                fill="none"
                strokeWidth="12"
                cx="50"
                cy="50"
                r="40"
                style={getSectionStyles(index)}
                onClick={() => setSelectedSection(section)}
                onMouseEnter={() => setSelectedSection(section)}
                onMouseLeave={() => setSelectedSection(null)}
                className="transition-all duration-200 hover:opacity-100"
              />
            ))}
          </svg>
          {/* Center text - shows selected or largest section */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-leah text-[18px] font-semibold">
              {(selectedSection || largestSection).percentage}%
            </span>
            <span className="text-gray text-xs">
              {(selectedSection || largestSection).pairName}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 