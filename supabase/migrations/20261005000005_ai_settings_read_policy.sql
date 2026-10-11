-- Enable SELECT for organization members on ai_settings table

-- Members of the organization can read their own organization's AI settings
CREATE POLICY "Members can view ai_settings"
    ON public.ai_settings
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 
            FROM public.organization_members 
            WHERE organization_members.organization_id = ai_settings.organization_id 
            AND organization_members.user_id = auth.uid()
        )
    );
