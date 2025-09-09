// Centralized API endpoint paths, override via Vite env variables
// Configure in `.env.development` (and/or `.env.production`) as needed.

export const ACTIVITY_SUMMARY_PATH = import.meta.env.VITE_API_ACTIVITY_SUMMARY_PATH || '/api/activity/summary';
export const ACTIVITY_TIMELINE_PATH = import.meta.env.VITE_API_ACTIVITY_TIMELINE_PATH || '/api/activity/timeline';
export const ACTIVITY_SUMMARY_V1_PATH = import.meta.env.VITE_API_ACTIVITY_SUMMARY_V1_PATH || '/api/v1/activity/summary';
export const ACTIVITY_TIMELINE_V1_PATH = import.meta.env.VITE_API_ACTIVITY_TIMELINE_V1_PATH || '/api/v1/activity/timeline';

export const TIMESHEET_ENTRIES_PATH = import.meta.env.VITE_API_TIMESHEET_ENTRIES_PATH || '/api/timesheet/entries';
export const TIME_ENTRIES_V1_PATH   = import.meta.env.VITE_API_TIME_ENTRIES_V1_PATH || '/api/v1/time-entries';

export const PROJECTS_PATH   = import.meta.env.VITE_API_PROJECTS_PATH || '/api/projects';
export const PROJECTS_V1_PATH = import.meta.env.VITE_API_PROJECTS_V1_PATH || '/api/v1/projects';
