-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create leads table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    company TEXT,
    job_title TEXT,
    linkedin_url TEXT,
    source TEXT,
    status TEXT DEFAULT 'new',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create lead_categories table for custom categories
CREATE TABLE lead_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    color TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create lead_category_assignments junction table
CREATE TABLE lead_category_assignments (
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    category_id UUID REFERENCES lead_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (lead_id, category_id)
);

-- Create lead_lists table for custom lead lists
CREATE TABLE lead_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    filter_criteria JSONB,
    is_dynamic BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create lead_list_members junction table
CREATE TABLE lead_list_members (
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    list_id UUID REFERENCES lead_lists(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (lead_id, list_id)
);

-- Create email_templates table
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    variables JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create email_campaigns table
CREATE TABLE email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    template_id UUID REFERENCES email_templates(id),
    status TEXT DEFAULT 'draft',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create email_campaign_leads table (junction table for campaigns and leads)
CREATE TABLE email_campaign_leads (
    campaign_id UUID REFERENCES email_campaigns(id),
    lead_id UUID REFERENCES leads(id),
    status TEXT DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (campaign_id, lead_id)
);

-- Create sms_templates table
CREATE TABLE sms_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    variables JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sms_campaigns table
CREATE TABLE sms_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    template_id UUID REFERENCES sms_templates(id),
    status TEXT DEFAULT 'draft',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sms_campaign_leads table (junction table for SMS campaigns and leads)
CREATE TABLE sms_campaign_leads (
    campaign_id UUID REFERENCES sms_campaigns(id),
    lead_id UUID REFERENCES leads(id),
    status TEXT DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    replied_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (campaign_id, lead_id)
);

-- Create sms_logs table for individual SMS messages
CREATE TABLE sms_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id),
    phone_number TEXT NOT NULL,
    message TEXT NOT NULL,
    message_id TEXT,
    status TEXT NOT NULL,
    error TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create ai_insights table
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id),
    insight_type TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create scripts table for generated scripts
CREATE TABLE scripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    lead_id UUID REFERENCES leads(id),
    ai_provider TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create twilio_accounts table for storing user Twilio credentials
CREATE TABLE twilio_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    account_sid TEXT NOT NULL,
    auth_token TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create twilio_phone_numbers table for storing user's Twilio phone numbers
CREATE TABLE twilio_phone_numbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    twilio_account_id UUID REFERENCES twilio_accounts(id),
    phone_number TEXT NOT NULL,
    friendly_name TEXT,
    capabilities JSONB,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create lead_activities table for tracking all lead-related activities
CREATE TABLE lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id),
    activity_type TEXT NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_sms_campaigns_status ON sms_campaigns(status);
CREATE INDEX idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX idx_ai_insights_lead_id ON ai_insights(lead_id);
CREATE INDEX idx_sms_logs_lead_id ON sms_logs(lead_id);
CREATE INDEX idx_sms_logs_status ON sms_logs(status);
CREATE INDEX idx_twilio_accounts_user_id ON twilio_accounts(user_id);
CREATE INDEX idx_twilio_phone_numbers_user_id ON twilio_phone_numbers(user_id);
CREATE INDEX idx_twilio_phone_numbers_account_id ON twilio_phone_numbers(twilio_account_id);
CREATE INDEX idx_lead_categories_user_id ON lead_categories(user_id);
CREATE INDEX idx_lead_lists_user_id ON lead_lists(user_id);
CREATE INDEX idx_lead_category_assignments_lead_id ON lead_category_assignments(lead_id);
CREATE INDEX idx_lead_category_assignments_category_id ON lead_category_assignments(category_id);
CREATE INDEX idx_lead_list_members_lead_id ON lead_list_members(lead_id);
CREATE INDEX idx_lead_list_members_list_id ON lead_list_members(list_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating updated_at columns
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_categories_updated_at
    BEFORE UPDATE ON lead_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_lists_updated_at
    BEFORE UPDATE ON lead_lists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at
    BEFORE UPDATE ON email_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sms_templates_updated_at
    BEFORE UPDATE ON sms_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sms_campaigns_updated_at
    BEFORE UPDATE ON sms_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scripts_updated_at
    BEFORE UPDATE ON scripts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_twilio_accounts_updated_at
    BEFORE UPDATE ON twilio_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_twilio_phone_numbers_updated_at
    BEFORE UPDATE ON twilio_phone_numbers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_category_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_list_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaign_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_campaign_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE twilio_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE twilio_phone_numbers ENABLE ROW LEVEL SECURITY;

-- Create default policies
CREATE POLICY "Users can only access their own lead categories" ON lead_categories
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own lead lists" ON lead_lists
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Enable access to category assignments" ON lead_category_assignments
    FOR ALL USING (EXISTS (
        SELECT 1 FROM lead_categories
        WHERE id = lead_category_assignments.category_id
        AND user_id = auth.uid()
    ));

CREATE POLICY "Enable access to list members" ON lead_list_members
    FOR ALL USING (EXISTS (
        SELECT 1 FROM lead_lists
        WHERE id = lead_list_members.list_id
        AND user_id = auth.uid()
    ));

CREATE POLICY "Enable all access" ON leads FOR ALL USING (true);
CREATE POLICY "Enable all access" ON email_templates FOR ALL USING (true);
CREATE POLICY "Enable all access" ON email_campaigns FOR ALL USING (true);
CREATE POLICY "Enable all access" ON email_campaign_leads FOR ALL USING (true);
CREATE POLICY "Enable all access" ON sms_templates FOR ALL USING (true);
CREATE POLICY "Enable all access" ON sms_campaigns FOR ALL USING (true);
CREATE POLICY "Enable all access" ON sms_campaign_leads FOR ALL USING (true);
CREATE POLICY "Enable all access" ON sms_logs FOR ALL USING (true);
CREATE POLICY "Enable all access" ON ai_insights FOR ALL USING (true);
CREATE POLICY "Enable all access" ON scripts FOR ALL USING (true);
CREATE POLICY "Enable all access" ON lead_activities FOR ALL USING (true);
CREATE POLICY "Users can only access their own Twilio accounts" ON twilio_accounts
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own phone numbers" ON twilio_phone_numbers
    FOR ALL USING (auth.uid() = user_id);
