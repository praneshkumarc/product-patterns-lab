
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Users, 
  Send, 
  MessageSquare, 
  FileText, 
  BellDot, 
  FileCheck,
  DollarSign,
  LineChart,
  Loader2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string | null;
}

interface Comment {
  id: string;
  user_name: string;
  role: string;
  avatar: string | null;
  content: string;
  created_at: string;
}

interface PricingStrategy {
  id: string;
  title: string;
  description: string;
  status: string;
  author: string;
  created_at: string;
}

interface CollaborationPanelProps {
  className?: string;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({ className }) => {
  // State for UI data
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [pricingStrategies, setPricingStrategies] = useState<PricingStrategy[]>([]);
  
  // State for new data
  const [newComment, setNewComment] = useState('');
  const [newStrategyTitle, setNewStrategyTitle] = useState('');
  const [newStrategy, setNewStrategy] = useState('');
  
  // Loading states
  const [isLoadingTeam, setIsLoadingTeam] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [isLoadingStrategies, setIsLoadingStrategies] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Responsive design
  const isMobile = useIsMobile();
  
  // Fetch team members data
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .order('name');
          
        if (error) throw error;
        
        setTeamMembers(data);
      } catch (error) {
        console.error('Error fetching team members:', error);
        toast({
          title: 'Error',
          description: 'Failed to load team members. Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setIsLoadingTeam(false);
      }
    };
    
    fetchTeamMembers();
    
    // Subscribe to real-time changes
    const teamChannel = supabase
      .channel('table-db-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'team_members' },
        (payload) => {
          fetchTeamMembers();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(teamChannel);
    };
  }, []);
  
  // Fetch comments data
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setComments(data);
      } catch (error) {
        console.error('Error fetching comments:', error);
        toast({
          title: 'Error',
          description: 'Failed to load comments. Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setIsLoadingComments(false);
      }
    };
    
    fetchComments();
    
    // Subscribe to real-time changes
    const commentsChannel = supabase
      .channel('comments-db-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'comments' },
        (payload) => {
          fetchComments();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(commentsChannel);
    };
  }, []);
  
  // Fetch pricing strategies data
  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const { data, error } = await supabase
          .from('pricing_strategies')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setPricingStrategies(data);
      } catch (error) {
        console.error('Error fetching strategies:', error);
        toast({
          title: 'Error',
          description: 'Failed to load pricing strategies. Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setIsLoadingStrategies(false);
      }
    };
    
    fetchStrategies();
    
    // Subscribe to real-time changes
    const strategiesChannel = supabase
      .channel('strategies-db-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'pricing_strategies' },
        (payload) => {
          fetchStrategies();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(strategiesChannel);
    };
  }, []);
  
  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };
  
  // Add a new comment
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      // Using Jamie Smith as the default user for this demo
      const { error } = await supabase
        .from('comments')
        .insert([{
          user_name: 'Jamie Smith',
          role: 'Data Analyst',
          avatar: '',
          content: newComment
        }]);
        
      if (error) throw error;
      
      setNewComment('');
      toast({
        title: 'Comment added',
        description: 'Your comment has been posted successfully.'
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to post your comment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Add a new pricing strategy
  const handleStrategySubmit = async () => {
    if (!newStrategyTitle.trim() || !newStrategy.trim()) return;
    
    setIsSubmitting(true);
    try {
      // Using Alex Johnson as the default author for this demo
      const { error } = await supabase
        .from('pricing_strategies')
        .insert([{
          title: newStrategyTitle,
          description: newStrategy,
          author: 'Alex Johnson',
          status: 'Under Review'
        }]);
        
      if (error) throw error;
      
      setNewStrategyTitle('');
      setNewStrategy('');
      toast({
        title: 'Strategy submitted',
        description: 'Your pricing strategy has been submitted for review.'
      });
    } catch (error) {
      console.error('Error adding strategy:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit your strategy. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle strategy approval
  const handleApproveStrategy = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pricing_strategies')
        .update({ status: 'Approved' })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: 'Strategy approved',
        description: 'The pricing strategy has been approved.'
      });
    } catch (error) {
      console.error('Error approving strategy:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve the strategy. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <Card className={`glass-card ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Cross-Functional Collaboration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="team">
          <TabsList className={`mb-4 ${isMobile ? 'flex flex-wrap justify-start' : ''}`}>
            <TabsTrigger value="team" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Team
            </TabsTrigger>
            <TabsTrigger value="discussions" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Discussions
            </TabsTrigger>
            <TabsTrigger value="strategies" className="flex items-center">
              <LineChart className="h-4 w-4 mr-2" />
              Pricing Strategies
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="team" className="space-y-4 animate-fade-in">
            {isLoadingTeam ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {teamMembers.map((member) => (
                  <Card key={member.id} className="hover-lift">
                    <CardContent className="p-4 flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            <div className="text-center mt-6">
              <Button variant="outline" onClick={() => toast({ title: 'Coming soon', description: 'Team member invitation will be available soon.' })}>
                <Users className="h-4 w-4 mr-2" />
                Invite Team Member
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="discussions" className="space-y-4 animate-fade-in">
            {isLoadingComments ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto pr-1">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4 p-4 border rounded-lg bg-card/50">
                    <Avatar>
                      <AvatarFallback>{comment.user_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{comment.user_name}</h3>
                          <p className="text-xs text-muted-foreground">{comment.role}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.created_at)}</span>
                      </div>
                      <p className="mt-2 text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarFallback>JS</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea 
                  placeholder="Add your insights and observations..." 
                  className="min-h-[100px]"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleCommentSubmit} 
                    disabled={isSubmitting || !newComment.trim()}>
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="strategies" className="space-y-6 animate-fade-in">
            {isLoadingStrategies ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-1">
                {pricingStrategies.map((strategy) => (
                  <Card key={strategy.id} className="overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium flex items-center">
                            <DollarSign className="h-4 w-4 mr-1 text-primary" />
                            {strategy.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Proposed by {strategy.author} on {new Date(strategy.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={strategy.status === 'Approved' ? 'outline' : 'secondary'}>
                          {strategy.status}
                        </Badge>
                      </div>
                      <p className="text-sm">{strategy.description}</p>
                      
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" onClick={() => toast({ title: 'Coming soon', description: 'Strategy details view will be available soon.' })}>
                          <FileText className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {strategy.status === 'Under Review' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleApproveStrategy(strategy.id)}>
                            <FileCheck className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Propose New Pricing Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Strategy Title</label>
                  <Input 
                    placeholder="Enter a concise title for your pricing strategy" 
                    value={newStrategyTitle}
                    onChange={(e) => setNewStrategyTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea 
                    placeholder="Describe your pricing strategy and its rationale..." 
                    className="min-h-[100px]"
                    value={newStrategy}
                    onChange={(e) => setNewStrategy(e.target.value)}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleStrategySubmit}
                    disabled={isSubmitting || !newStrategyTitle.trim() || !newStrategy.trim()}>
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <BellDot className="h-4 w-4 mr-2" />
                    )}
                    Submit for Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CollaborationPanel;
