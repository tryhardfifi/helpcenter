import { useState, useEffect } from 'react';
import { useCompanyData } from '@/contexts/CompanyDataContext';
import { updateCompany, getAllPromptRuns, saveAnalytics } from '@/services/dataService';
import { computeDailyAnalytics } from '@/services/analyticsComputation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, CreditCard, Users, Save, Plus, Trash2, Edit2, X, BarChart3 } from 'lucide-react';

const Settings = () => {
  const { company, loading, refetch } = useCompanyData();
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [saving, setSaving] = useState(false);
  const [computingAnalytics, setComputingAnalytics] = useState(false);
  const [analyticsMessage, setAnalyticsMessage] = useState('');

  // Preload company data when it's available
  useEffect(() => {
    if (company) {
      setCompanyName(company.name || '');
      setWebsite(company.website || '');
      setIndustry(company.industry || '');
    }
  }, [company]);

  const members = company?.members || [];

  const handleSaveCompanyInfo = async () => {
    setSaving(true);
    try {
      await updateCompany(company.id, {
        name: companyName,
        website: website,
        industry: industry,
      });
      await refetch();
      setIsEditingCompany(false);
    } catch (error) {
      console.error('Error saving company info:', error);
      alert('Failed to save company information');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setCompanyName(company?.name || '');
    setWebsite(company?.website || '');
    setIndustry(company?.industry || '');
    setIsEditingCompany(false);
  };

  const handleInviteMember = () => {
    // TODO: Implement invite member
    alert('Invite member functionality coming soon!');
  };

  const handleRemoveMember = async (memberId) => {
    // TODO: Implement remove member in Firestore
    alert('Remove member functionality coming soon!');
  };

  const handleComputeAnalytics = async () => {
    if (!company) {
      setAnalyticsMessage('No company data available');
      return;
    }

    setComputingAnalytics(true);
    setAnalyticsMessage('Computing analytics...');

    try {
      // Get today's date
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];

      // Get all runs from all prompts
      const allRuns = await getAllPromptRuns(company.id);

      if (allRuns.length === 0) {
        setAnalyticsMessage('No prompt runs found. Please run some prompts first.');
        setComputingAnalytics(false);
        return;
      }

      // Compute analytics
      const dailyAnalytics = computeDailyAnalytics({
        companyId: company.id,
        companyName: company.name,
        competitors: company.competitors || [],
        allPromptRuns: allRuns,
        date: dateStr
      });

      // Save analytics
      await saveAnalytics(company.id, dateStr, dailyAnalytics);

      setAnalyticsMessage(`✅ Analytics computed successfully for ${dateStr}! Total runs analyzed: ${allRuns.length}`);

      // Refresh company data to show updated analytics
      await refetch();
    } catch (error) {
      console.error('Error computing analytics:', error);
      setAnalyticsMessage(`❌ Error: ${error.message}`);
    } finally {
      setComputingAnalytics(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Loading...</p>
        </div>
      </div>
    );
  }

  const subscription = company?.subscription;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your company information, team, and subscription
        </p>
      </div>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>
                {isEditingCompany ? 'Update your company details and profile' : 'Your company details and profile'}
              </CardDescription>
            </div>
            {!isEditingCompany && (
              <Button variant="outline" size="sm" onClick={() => setIsEditingCompany(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditingCompany ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Inc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="acme.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="B2B SaaS"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveCompanyInfo} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={handleCancelEdit} disabled={saving}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Company Name</Label>
                  <p className="text-base font-medium mt-1">{company?.name || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Website</Label>
                  <p className="text-base font-medium mt-1">{company?.website || 'Not set'}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Industry</Label>
                <p className="text-base font-medium mt-1">{company?.industry || 'Not set'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription & Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription & Plan
          </CardTitle>
          <CardDescription>
            Manage your subscription and billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Plan */}
          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold capitalize">{subscription?.plan} Plan</span>
                <Badge variant={subscription?.status === 'active' ? 'default' : 'secondary'}>
                  {subscription?.status}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">${subscription?.price}</div>
                <div className="text-xs text-muted-foreground">/month</div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Next billing date: {subscription?.nextBillingDate}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics Computation
          </CardTitle>
          <CardDescription>
            Compute daily analytics from all prompt runs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-4">
              Click the button below to compute analytics for today based on all your prompt runs.
              This will calculate average visibility, mention rate, probability, and rank for your company and competitors.
            </p>
            <Button
              onClick={handleComputeAnalytics}
              disabled={computingAnalytics}
              variant="default"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {computingAnalytics ? 'Computing...' : 'Compute Analytics'}
            </Button>
          </div>

          {analyticsMessage && (
            <div className={`p-3 rounded-lg text-sm ${
              analyticsMessage.startsWith('✅')
                ? 'bg-green-50 text-green-900 border border-green-200'
                : analyticsMessage.startsWith('❌')
                ? 'bg-red-50 text-red-900 border border-red-200'
                : 'bg-blue-50 text-blue-900 border border-blue-200'
            }`}>
              {analyticsMessage}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
          <CardDescription>
            Invite and manage team members
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleInviteMember} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>

          <div className="space-y-2">
            {members.length > 0 ? (
              members
                .filter((member) => member && member.email) // Filter out invalid members
                .map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {member.email[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{member.email}</div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {member.role || 'member'} • {member.status || 'active'}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={member.role === 'admin'}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No team members yet. Invite someone to get started!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
