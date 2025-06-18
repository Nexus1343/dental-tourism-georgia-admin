-- =================================================================
-- QUESTIONNAIRE SUBMISSIONS VIEWS
-- =================================================================
-- Two views for admin panel: list view and detail view
-- Focus on human-readable information, no UUIDs in frontend
-- =================================================================

-- =================================================================
-- 1. LIST VIEW - For admin submissions table
-- =================================================================
CREATE OR REPLACE VIEW questionnaire_submissions_list AS
SELECT 
    -- Keep ID for routing (only UUID we need)
    qs.id,
    
    -- Human-readable submission info
    CASE 
        WHEN qs.is_complete = true THEN 'Complete'
        WHEN qs.completion_percentage = 0 THEN 'Not Started'
        ELSE 'In Progress'
    END as status,
    
    qs.completion_percentage,
    qs.is_complete,
    
    -- Template information (human-readable)
    COALESCE(qt.name, 'Unknown Template') as template_name,
    COALESCE(qt.version::text, 'N/A') as template_version,
    qt.language as template_language,
    
    -- Patient/Lead information (human-readable)
    CASE 
        WHEN pl.id IS NOT NULL THEN 
            CONCAT('Lead #', SUBSTRING(pl.id::text, 1, 8))
        ELSE 'No Lead'
    END as lead_reference,
    
    pl.status as lead_status,
    pl.priority as lead_priority,
    pl.source as lead_source,
    
    -- Time information (human-readable)
    qs.created_at,
    qs.completed_at,
    qs.updated_at,
    
    -- Duration in human format
    CASE 
        WHEN qs.time_spent_seconds IS NOT NULL THEN
            CASE 
                WHEN qs.time_spent_seconds >= 3600 THEN 
                    CONCAT(
                        (qs.time_spent_seconds / 3600)::integer, 'h ',
                        ((qs.time_spent_seconds % 3600) / 60)::integer, 'm'
                    )
                WHEN qs.time_spent_seconds >= 60 THEN 
                    CONCAT((qs.time_spent_seconds / 60)::integer, 'm ', (qs.time_spent_seconds % 60)::integer, 's')
                ELSE 
                    CONCAT(qs.time_spent_seconds, 's')
            END
        ELSE 'Unknown'
    END as time_spent_formatted,
    
    -- Progress indicators
    CASE 
        WHEN qs.completion_percentage >= 80 THEN 'High'
        WHEN qs.completion_percentage >= 40 THEN 'Medium'
        ELSE 'Low'
    END as progress_level,
    
    -- Age of submission
    CASE 
        WHEN EXTRACT(EPOCH FROM (NOW() - qs.created_at))::integer / 86400 = 0 THEN 'Today'
        WHEN EXTRACT(EPOCH FROM (NOW() - qs.created_at))::integer / 86400 = 1 THEN '1 day ago'
        WHEN EXTRACT(EPOCH FROM (NOW() - qs.created_at))::integer / 86400 < 30 THEN 
            CONCAT(EXTRACT(EPOCH FROM (NOW() - qs.created_at))::integer / 86400, ' days ago')
        ELSE 
            CONCAT(EXTRACT(EPOCH FROM (NOW() - qs.created_at))::integer / 2592000, ' months ago')
    END as submission_age,
    
    -- Technical info (minimal)
    qs.ip_address,
    CASE 
        WHEN qs.user_agent LIKE '%Chrome%' THEN 'Chrome'
        WHEN qs.user_agent LIKE '%Firefox%' THEN 'Firefox'
        WHEN qs.user_agent LIKE '%Safari%' THEN 'Safari'
        WHEN qs.user_agent LIKE '%Edge%' THEN 'Edge'
        ELSE 'Other Browser'
    END as browser

FROM questionnaire_submissions qs
LEFT JOIN questionnaire_templates qt ON qs.template_id = qt.id
LEFT JOIN patient_leads pl ON qs.lead_id = pl.id
ORDER BY qs.created_at DESC;

-- =================================================================
-- 2. DETAIL VIEW - For individual submission page
-- =================================================================
CREATE OR REPLACE VIEW questionnaire_submissions_detail AS
SELECT 
    -- Submission ID for routing
    qs.id,
    
    -- Submission Overview
    CASE 
        WHEN qs.is_complete = true THEN 'Complete'
        WHEN qs.completion_percentage = 0 THEN 'Not Started'
        ELSE 'In Progress'
    END as status,
    
    qs.completion_percentage,
    qs.is_complete,
    qs.submission_data,
    
    -- Template Details (Full Information)
    COALESCE(qt.name, 'Unknown Template') as template_name,
    COALESCE(qt.description, 'No description available') as template_description,
    qt.version as template_version,
    qt.language as template_language,
    qt.total_pages as template_total_pages,
    qt.estimated_completion_minutes as template_estimated_minutes,
    COALESCE(qt.introduction_text, 'No introduction') as template_introduction,
    COALESCE(qt.completion_message, 'No completion message') as template_completion_message,
    
    -- Template Creator Info
    CASE 
        WHEN tc.first_name IS NOT NULL AND tc.last_name IS NOT NULL THEN
            CONCAT(tc.first_name, ' ', tc.last_name)
        WHEN tc.email IS NOT NULL THEN tc.email
        ELSE 'Unknown Creator'
    END as template_created_by,
    
    -- Patient/Lead Details (Full Information)
    CASE 
        WHEN pl.id IS NOT NULL THEN 
            CONCAT('Lead #', SUBSTRING(pl.id::text, 1, 8))
        ELSE 'No Lead Associated'
    END as lead_reference,
    
    pl.status as lead_status,
    pl.priority as lead_priority,
    pl.source as lead_source,
    pl.preferred_contact_method,
    pl.preferred_treatment_date,
    
    -- Budget information (human-readable)
    CASE 
        WHEN pl.budget_range_min IS NOT NULL AND pl.budget_range_max IS NOT NULL THEN
            CONCAT('$', pl.budget_range_min::text, ' - $', pl.budget_range_max::text)
        WHEN pl.budget_range_min IS NOT NULL THEN
            CONCAT('From $', pl.budget_range_min::text)
        WHEN pl.budget_range_max IS NOT NULL THEN
            CONCAT('Up to $', pl.budget_range_max::text)
        ELSE 'Budget not specified'
    END as budget_range,
    
    pl.travel_group_size,
    pl.accommodation_preference,
    pl.special_requirements,
    pl.marketing_consent,
    pl.ai_analysis_summary,
    pl.ai_completeness_score,
    
    -- Timing Information (Detailed)
    qs.created_at,
    qs.updated_at,
    qs.completed_at,
    
    -- Time spent (detailed breakdown)
    qs.time_spent_seconds,
    CASE 
        WHEN qs.time_spent_seconds IS NOT NULL THEN
            CASE 
                WHEN qs.time_spent_seconds >= 3600 THEN 
                    CONCAT(
                        (qs.time_spent_seconds / 3600)::integer, ' hours, ',
                        ((qs.time_spent_seconds % 3600) / 60)::integer, ' minutes, ',
                        (qs.time_spent_seconds % 60)::integer, ' seconds'
                    )
                WHEN qs.time_spent_seconds >= 60 THEN 
                    CONCAT(
                        (qs.time_spent_seconds / 60)::integer, ' minutes, ',
                        (qs.time_spent_seconds % 60)::integer, ' seconds'
                    )
                ELSE 
                    CONCAT(qs.time_spent_seconds, ' seconds')
            END
        ELSE 'Time not tracked'
    END as time_spent_formatted,
    
    -- Completion time (if completed)
    CASE 
        WHEN qs.completed_at IS NOT NULL THEN 
            CONCAT(
                EXTRACT(EPOCH FROM (qs.completed_at - qs.created_at))::integer / 3600, ' hours, ',
                (EXTRACT(EPOCH FROM (qs.completed_at - qs.created_at))::integer % 3600) / 60, ' minutes'
            )
        ELSE 'Not completed'
    END as total_completion_time,
    
    -- Technical Details (Detailed)
    qs.ip_address,
    qs.user_agent,
    qs.submission_token,
    
    -- Browser details (parsed)
    CASE 
        WHEN qs.user_agent LIKE '%Chrome%' THEN 'Chrome'
        WHEN qs.user_agent LIKE '%Firefox%' THEN 'Firefox'
        WHEN qs.user_agent LIKE '%Safari%' AND qs.user_agent NOT LIKE '%Chrome%' THEN 'Safari'
        WHEN qs.user_agent LIKE '%Edge%' THEN 'Microsoft Edge'
        WHEN qs.user_agent LIKE '%Opera%' THEN 'Opera'
        ELSE 'Other Browser'
    END as browser,
    
    -- Device type (parsed from user agent)
    CASE 
        WHEN qs.user_agent LIKE '%Mobile%' OR qs.user_agent LIKE '%Android%' THEN 'Mobile'
        WHEN qs.user_agent LIKE '%Tablet%' OR qs.user_agent LIKE '%iPad%' THEN 'Tablet'
        ELSE 'Desktop'
    END as device_type,
    
    -- Progress Analysis
    CASE 
        WHEN qs.completion_percentage = 100 THEN 'Fully completed'
        WHEN qs.completion_percentage >= 80 THEN 'Nearly complete'
        WHEN qs.completion_percentage >= 50 THEN 'More than halfway'
        WHEN qs.completion_percentage >= 25 THEN 'Quarter complete'
        WHEN qs.completion_percentage > 0 THEN 'Just started'
        ELSE 'Not started'
    END as progress_description,
    
    -- Submission Quality Score
    CASE 
        WHEN qs.is_complete AND qs.time_spent_seconds > 300 THEN 'High Quality'
        WHEN qs.completion_percentage > 80 THEN 'Good Quality'
        WHEN qs.completion_percentage > 50 THEN 'Medium Quality'
        ELSE 'Low Quality'
    END as submission_quality

FROM questionnaire_submissions qs
LEFT JOIN questionnaire_templates qt ON qs.template_id = qt.id
LEFT JOIN patient_leads pl ON qs.lead_id = pl.id
LEFT JOIN users tc ON qt.created_by = tc.id;

-- =================================================================
-- 3. SUBMISSION RESPONSES VIEW - Properly joins JSONB data with questions
-- =================================================================
-- This view extracts each response from JSONB and joins with question details
CREATE OR REPLACE VIEW questionnaire_submission_responses AS
WITH response_keys AS (
    -- Extract all question IDs from submission_data JSONB
    SELECT 
        qs.id as submission_id,
        qs.template_id,
        jsonb_object_keys(qs.submission_data) as question_id,
        qs.submission_data
    FROM questionnaire_submissions qs
    WHERE qs.submission_data IS NOT NULL 
    AND jsonb_typeof(qs.submission_data) = 'object'
    AND qs.submission_data != '{}'::jsonb
)
SELECT 
    rk.submission_id,
    rk.question_id,
    
    -- Question details
    qq.question_text,
    qq.question_type,
    qq.options as question_options,
    qq.is_required,
    qq.order_index as question_order,
    
    -- Page details  
    qp.title as page_title,
    qp.page_number as page_order,
    
    -- Response details from JSONB
    (rk.submission_data->rk.question_id->>'value') as answer_value,
    (rk.submission_data->rk.question_id->>'answered_at') as answered_at,
    (rk.submission_data->rk.question_id->>'page_id') as response_page_id,
    
    -- Parse different answer types
    CASE 
        WHEN qq.question_type IN ('text', 'textarea', 'email', 'phone') THEN
            (rk.submission_data->rk.question_id->>'value')
        WHEN qq.question_type = 'number' THEN
            (rk.submission_data->rk.question_id->'value')::text
        WHEN qq.question_type = 'single_choice' THEN
            (rk.submission_data->rk.question_id->>'value')
        WHEN qq.question_type IN ('multiple_choice', 'checkbox') THEN
            CASE 
                WHEN jsonb_typeof(rk.submission_data->rk.question_id->'value') = 'array' THEN
                    array_to_string(
                        ARRAY(SELECT jsonb_array_elements_text(rk.submission_data->rk.question_id->'value')), 
                        ', '
                    )
                ELSE (rk.submission_data->rk.question_id->>'value')
            END
        WHEN qq.question_type IN ('rating', 'slider', 'pain_scale') THEN
            CONCAT((rk.submission_data->rk.question_id->>'value'), ' / 10')
        WHEN qq.question_type IN ('file_upload', 'photo_upload', 'photo_grid') THEN
            CASE 
                WHEN (rk.submission_data->rk.question_id->>'value') LIKE 'http%' THEN
                    'File uploaded'
                ELSE (rk.submission_data->rk.question_id->>'value')
            END
        WHEN qq.question_type = 'date' THEN
            CASE 
                WHEN (rk.submission_data->rk.question_id->>'value') ~ '^\d{4}-\d{2}-\d{2}' THEN
                    TO_CHAR(
                        TO_DATE(rk.submission_data->rk.question_id->>'value', 'YYYY-MM-DD'), 
                        'Mon DD, YYYY'
                    )
                ELSE (rk.submission_data->rk.question_id->>'value')
            END
        ELSE (rk.submission_data->rk.question_id->>'value')
    END as formatted_answer,
    
    -- Template info
    qt.name as template_name,
    qt.language as template_language

FROM response_keys rk
LEFT JOIN questionnaire_questions qq ON rk.question_id::uuid = qq.id
LEFT JOIN questionnaire_pages qp ON qq.page_id = qp.id
LEFT JOIN questionnaire_templates qt ON rk.template_id = qt.id
WHERE qq.id IS NOT NULL  -- Only include responses that have matching questions
ORDER BY rk.submission_id, qp.page_number, qq.order_index;

-- =================================================================
-- INDEXES FOR PERFORMANCE
-- =================================================================
CREATE INDEX IF NOT EXISTS idx_submissions_list_created_at 
ON questionnaire_submissions (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_submissions_list_status 
ON questionnaire_submissions (is_complete, completion_percentage);

CREATE INDEX IF NOT EXISTS idx_submissions_list_template 
ON questionnaire_submissions (template_id);

CREATE INDEX IF NOT EXISTS idx_submissions_list_lead 
ON questionnaire_submissions (lead_id);

-- =================================================================
-- PERMISSIONS
-- =================================================================
GRANT SELECT ON questionnaire_submissions_list TO authenticated;
GRANT SELECT ON questionnaire_submissions_list TO service_role;

GRANT SELECT ON questionnaire_submissions_detail TO authenticated;
GRANT SELECT ON questionnaire_submissions_detail TO service_role;

GRANT SELECT ON questionnaire_submission_responses TO authenticated;
GRANT SELECT ON questionnaire_submission_responses TO service_role; 