// src/components/PostHogIntegration/PostHogCohortSelector.tsx
import React, { useState, useEffect } from 'react';
import { Card, Select, Spin, Alert } from 'antd';
import { useApi } from '../../hooks/useApi';
import './PostHogCohortSelector.css';

interface PostHogCohort {
  id: string;
  name: string;
  description?: string;
  count: number;
}

interface PostHogCohortSelectorProps {
  onCohortSelect: (cohortId: string) => void;
  selectedCohortId?: string;
}

/**
 * Component for selecting PostHog cohorts
 */
const PostHogCohortSelector: React.FC<PostHogCohortSelectorProps> = ({
  onCohortSelect,
  selectedCohortId
}) => {
  // Fetch cohorts from PostHog
  const {
    data: cohorts,
    loading,
    error,
    execute: fetchCohorts
  } = useApi<PostHogCohort[]>(
    async () => {
      const response = await fetch('/admin/posthog/cohorts');
      if (!response.ok) {
        throw new Error('Failed to fetch PostHog cohorts');
      }
      return response.json();
    },
    [],
    true
  );
  
  // Load cohorts on mount
  useEffect(() => {
    fetchCohorts();
  }, [fetchCohorts]);
  
  // Handle cohort selection
  const handleCohortChange = (value: string) => {
    onCohortSelect(value);
  };
  
  return (
    <div className="posthog-cohort-selector-container">
      <Card title="PostHog Cohort Selection" className="posthog-cohort-selector-card">
        {loading ? (
          <div className="posthog-cohort-loading">
            <Spin size="small" />
            <span>Loading cohorts from PostHog...</span>
          </div>
        ) : error ? (
          <Alert
            message="Error loading PostHog cohorts"
            description={error.message}
            type="error"
            showIcon
          />
        ) : cohorts && cohorts.length > 0 ? (
          <>
            <p className="posthog-cohort-description">
              Select a PostHog cohort to filter participants for the draw:
            </p>
            <Select
              placeholder="Select a cohort"
              value={selectedCohortId}
              onChange={handleCohortChange}
              className="posthog-cohort-select"
              loading={loading}
            >
              {cohorts.map(cohort => (
                <Select.Option key={cohort.id} value={cohort.id}>
                  {cohort.name} ({cohort.count} participants)
                </Select.Option>
              ))}
            </Select>
            {selectedCohortId && (
              <div className="posthog-cohort-info">
                <p>
                  Selected cohort: <strong>{cohorts.find(c => c.id === selectedCohortId)?.name}</strong>
                </p>
                <p>
                  Participants: <strong>{cohorts.find(c => c.id === selectedCohortId)?.count}</strong>
                </p>
                {cohorts.find(c => c.id === selectedCohortId)?.description && (
                  <p>
                    Description: {cohorts.find(c => c.id === selectedCohortId)?.description}
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <Alert
            message="No cohorts available"
            description="No cohorts were found in PostHog. Please create cohorts in PostHog first."
            type="info"
            showIcon
          />
        )}
      </Card>
    </div>
  );
};

export default PostHogCohortSelector;
