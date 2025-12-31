import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Edit2, Mail, MessageSquare, Bell, User, Lock, Store as StoreIcon, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { defaultCategories } from '@/data/categories';
import { ItemCategory } from '@/types/billing';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';

const Settings: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', price: '', icon: '👕' });
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: false,
    smsEnabled: false,
    whatsappEnabled: false,
  });
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Profile settings
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    storeName: '',
    phone: '',
    address: '',
  });
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Password change
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    if (user?.role === 'ADMIN' || user?.role === 'EMPLOYEE') {
      fetchStoreSettings();
    }
  }, [user?.role]);

  const [storeStatus, setStoreStatus] = useState<{ isActive: boolean, deactivationReason: string | null }>({
    isActive: true,
    deactivationReason: null,
  });
  const [subscription, setSubscription] = useState<{ plan: string, endDate: string, status: string } | null>(null);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await api.get('/categories');
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchStoreSettings = async () => {
    if (!user || user.role === 'SUPER_ADMIN') return;
    try {
      const response = await api.get('/stores/settings/my-store');
      const data = response.data.data;

      setNotificationSettings({
        emailEnabled: data.emailNotificationsEnabled || false,
        smsEnabled: data.smsNotificationsEnabled || false,
        whatsappEnabled: data.whatsappNotificationsEnabled || false,
      });

      setStoreStatus({
        isActive: data.isActive,
        deactivationReason: data.deactivationReason,
      });

      setSubscription(data.subscription);
      await fetchCategories();
    } catch (error: any) {
      console.error('Failed to fetch store settings:', error);
    }
  };

  const handleNotificationToggle = async (type: 'email' | 'sms' | 'whatsapp', value: boolean) => {
    setLoadingNotifications(true);
    try {
      const updateData: any = {};

      if (type === 'email') updateData.emailNotificationsEnabled = value;
      if (type === 'sms') updateData.smsNotificationsEnabled = value;
      if (type === 'whatsapp') updateData.whatsappNotificationsEnabled = value;

      await api.put('/stores/settings/my-store', updateData);

      setNotificationSettings(prev => ({
        ...prev,
        [`${type}Enabled`]: value,
      }));

      toast({
        title: 'Settings updated',
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} notifications ${value ? 'enabled' : 'disabled'}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update settings',
        variant: 'destructive',
      });
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handlePriceChange = (id: string, price: number) => {
    setCategories(prev => prev.map(cat =>
      cat.id === id ? { ...cat, price } : cat
    ));
  };

  const handleSave = async (id: string) => {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    try {
      setIsUpdatingCategory(true);
      await api.put(`/categories/${id}`, {
        price: category.price
      });

      toast({
        title: "Settings saved!",
        description: "Your category price has been updated.",
      });
      setEditingId(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update category",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingCategory(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim() || !newCategory.price) {
      toast({
        title: "Missing information",
        description: "Please enter category name and price.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAddingCategory(true);
      const response = await api.post('/categories', {
        name: newCategory.name.trim(),
        price: parseFloat(newCategory.price),
        icon: newCategory.icon,
      });

      if (response.data.success) {
        setCategories(prev => [...prev, response.data.data]);
        setNewCategory({ name: '', price: '', icon: '👕' });

        toast({
          title: "Category added!",
          description: `${response.data.data.name} has been added to your categories.`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add category",
        variant: "destructive"
      });
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await api.delete(`/categories/${id}`);
      setCategories(prev => prev.filter(cat => cat.id !== id));
      toast({
        title: "Category deleted",
        description: "The category has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete category",
        variant: "destructive"
      });
    }
  };

  const handleProfileUpdate = async () => {
    setLoadingProfile(true);
    try {
      await api.put('/auth/profile', {
        name: profileData.name,
      });

      toast({
        title: 'Profile updated',
        description: 'Your profile information has been updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New password and confirm password do not match',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }

    setLoadingPassword(true);
    try {
      await api.put('/auth/change-password', {
        newPassword: passwordData.newPassword,
      });

      setPasswordData({
        newPassword: '',
        confirmPassword: '',
      });

      toast({
        title: 'Password updated',
        description: 'Your password has been changed successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  // For EMPLOYEE role - only show password update
  if (user?.role === 'EMPLOYEE') {
    return (
      <DashboardLayout title="Settings">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-2xl p-6 shadow-soft animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Change Password</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Update your account password
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">New Password</label>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                />
              </div>

              <Button onClick={handlePasswordChange} disabled={loadingPassword} className="gap-2">
                <Lock className="w-4 h-4" />
                {loadingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // For ADMIN and SUPER_ADMIN roles - show tabbed settings
  return (
    <DashboardLayout title="Settings">
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue={user?.role === 'ADMIN' ? 'pricing' : 'profile'} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            {user?.role === 'ADMIN' && (
              <>
                <TabsTrigger value="pricing">Item Pricing</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </>
            )}
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Item Pricing Tab - ADMIN only */}
          {user?.role === 'ADMIN' && (
            <TabsContent value="pricing">
              <div className="bg-card rounded-2xl p-6 shadow-soft animate-fade-in">
                <h2 className="text-lg font-semibold text-foreground mb-4">Item Pricing</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Configure prices for each ironing category. These prices will be used when creating new bills.
                </p>

                <div className="space-y-3">
                  {loadingCategories ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <Loader2 className="w-8 h-8 animate-spin mb-2" />
                      <p>Loading categories...</p>
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No categories found. Add them in the "Categories" tab.</p>
                    </div>
                  ) : (
                    categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{category.icon}</span>
                          <span className="font-medium text-foreground">{category.name}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {editingId === category.id ? (
                            <>
                              <span className="text-muted-foreground">₹</span>
                              <Input
                                type="number"
                                value={category.price}
                                onChange={(e) => handlePriceChange(category.id, parseFloat(e.target.value) || 0)}
                                className="w-24 text-right"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSave(category.id)}
                                disabled={isUpdatingCategory}
                              >
                                {isUpdatingCategory ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Save className="w-4 h-4" />
                                )}
                              </Button>
                            </>
                          ) : (
                            <>
                              <span className="font-semibold text-primary text-lg">₹{category.price}</span>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setEditingId(category.id)}
                                disabled={isUpdatingCategory || isAddingCategory}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteCategory(category.id)}
                                className="text-destructive hover:text-destructive"
                                disabled={isUpdatingCategory || isAddingCategory}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          )}

          {/* Add New Category Tab - ADMIN only */}
          {user?.role === 'ADMIN' && (
            <TabsContent value="categories">
              <div className="bg-card rounded-2xl p-6 shadow-soft animate-fade-in">
                <h2 className="text-lg font-semibold text-foreground mb-4">Add New Category</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Create custom clothing categories with pricing for your store
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Icon</label>
                    <Input
                      value={newCategory.icon}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
                      placeholder="👕"
                      className="text-center text-2xl"
                      maxLength={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Category Name</label>
                    <Input
                      value={newCategory.name}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Jacket"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Price (₹)</label>
                    <Input
                      type="number"
                      value={newCategory.price}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <Button onClick={handleAddCategory} disabled={isAddingCategory} className="mt-4 gap-2">
                  {isAddingCategory ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {isAddingCategory ? 'Adding...' : 'Add Category'}
                </Button>
              </div>
            </TabsContent>
          )}

          {/* Notification Settings Tab - ADMIN only */}
          {user?.role === 'ADMIN' && (
            <TabsContent value="notifications">
              <div className="bg-card rounded-2xl p-6 shadow-soft animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Notification Settings</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Configure which notification channels are enabled for your store
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Send bill updates via email</p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.emailEnabled}
                      onCheckedChange={(value) => handleNotificationToggle('email', value)}
                      disabled={loadingNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">SMS Notifications</p>
                        <p className="text-sm text-muted-foreground">Send bill updates via SMS</p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.smsEnabled}
                      onCheckedChange={(value) => handleNotificationToggle('sms', value)}
                      disabled={loadingNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium text-foreground">WhatsApp Notifications</p>
                        <p className="text-sm text-muted-foreground">Send bill updates via WhatsApp</p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.whatsappEnabled}
                      onCheckedChange={(value) => handleNotificationToggle('whatsapp', value)}
                      disabled={loadingNotifications}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          )}

          {/* Profile Tab - For both ADMIN and SUPER_ADMIN */}
          <TabsContent value="profile">
            <div className="space-y-6">
              {/* Subscription & Status Info */}
              {user?.role === 'ADMIN' && (
                <div className="bg-card rounded-2xl p-6 shadow-soft animate-fade-in border border-primary/10">
                  <div className="flex items-center gap-2 mb-6">
                    <StoreIcon className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Store Status & Subscription</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground block mb-1">Current Status</label>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${storeStatus.isActive ? 'bg-green-500' : 'bg-destructive'}`} />
                          <span className="font-semibold">{storeStatus.isActive ? 'Active' : 'Deactivated'}</span>
                        </div>
                      </div>

                      {!storeStatus.isActive && storeStatus.deactivationReason && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground block mb-1">Deactivation Reason</label>
                          <p className="text-sm text-destructive bg-destructive/5 p-3 rounded-lg border border-destructive/10">
                            {storeStatus.deactivationReason}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {subscription ? (
                        <>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground block mb-1">Subscription Plan</label>
                            <span className="font-semibold text-primary">{subscription.plan}</span>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground block mb-1">Expires On</label>
                            <span className="font-semibold">{new Date(subscription.endDate).toLocaleDateString()}</span>
                          </div>
                        </>
                      ) : (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground block mb-1">Subscription Plan</label>
                          <span className="text-sm text-muted-foreground italic">No active subscription</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-card rounded-2xl p-6 shadow-soft animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Update your personal information
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Name</label>
                    <Input
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <Input
                      value={profileData.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <Button onClick={handleProfileUpdate} disabled={loadingProfile} className="gap-2">
                    <Save className="w-4 h-4" />
                    {loadingProfile ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-soft animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Change Password</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Update your account password
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">New Password</label>
                    <Input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                    />
                  </div>

                  <Button onClick={handlePasswordChange} disabled={loadingPassword} className="gap-2">
                    <Lock className="w-4 h-4" />
                    {loadingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
