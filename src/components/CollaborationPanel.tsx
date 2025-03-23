
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Send, 
  MessageSquare, 
  FileText, 
  BellDot, 
  FileCheck,
  DollarSign,
  LineChart
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface CollaborationPanelProps {
  className?: string;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({ className }) => {
  const [newComment, setNewComment] = useState('');
  const [newStrategy, setNewStrategy] = useState('');
  
  // Example team members
  const teamMembers = [
    { name: 'Alex Johnson', role: 'Product Manager', avatar: '' },
    { name: 'Jamie Smith', role: 'Data Analyst', avatar: '' },
    { name: 'Casey Lee', role: 'Sales Director', avatar: '' },
    { name: 'Taylor Wilson', role: 'Marketing Lead', avatar: '' },
  ];
  
  // Example comments
  const comments = [
    { 
      id: 1, 
      user: 'Jamie Smith', 
      role: 'Data Analyst',
      avatar: '',
      content: 'The Q4 seasonality trend is consistent across all years. We should plan our pricing strategy accordingly.',
      time: '2 hours ago' 
    },
    { 
      id: 2, 
      user: 'Casey Lee', 
      role: 'Sales Director',
      avatar: '',
      content: 'I noticed that corporate clients have a higher average order value. Suggests potential for segment-specific pricing.',
      time: '3 hours ago' 
    }
  ];
  
  // Example pricing strategies
  const pricingStrategies = [
    {
      id: 1,
      title: 'Seasonal Pricing Adjustment',
      description: 'Implement dynamic pricing based on quarterly demand patterns with 10-15% premium during Q4.',
      status: 'Under Review',
      author: 'Alex Johnson',
      date: '2023-10-15'
    },
    {
      id: 2,
      title: 'Customer Segment Tiering',
      description: 'Develop tiered pricing structure for different customer segments based on historical purchasing power.',
      status: 'Approved',
      author: 'Casey Lee',
      date: '2023-10-10'
    }
  ];
  
  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;
    // In a real application, this would add a comment to the database
    setNewComment('');
  };
  
  const handleStrategySubmit = () => {
    if (!newStrategy.trim()) return;
    // In a real application, this would add a new strategy to the database
    setNewStrategy('');
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
          <TabsList className="mb-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {teamMembers.map((member, index) => (
                <Card key={index} className="hover-lift">
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
            
            <div className="text-center mt-6">
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Invite Team Member
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="discussions" className="space-y-4 animate-fade-in">
            <div className="space-y-4 mb-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-4 p-4 border rounded-lg bg-card/50">
                  <Avatar>
                    <AvatarFallback>{comment.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{comment.user}</h3>
                        <p className="text-xs text-muted-foreground">{comment.role}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{comment.time}</span>
                    </div>
                    <p className="mt-2 text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarFallback>YO</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea 
                  placeholder="Add your insights and observations..." 
                  className="min-h-[100px]"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button onClick={handleCommentSubmit}>
                    <Send className="h-4 w-4 mr-2" />
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="strategies" className="space-y-6 animate-fade-in">
            <div className="space-y-4 mb-6">
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
                          Proposed by {strategy.author} on {strategy.date}
                        </p>
                      </div>
                      <Badge variant={strategy.status === 'Approved' ? 'outline' : 'secondary'}>
                        {strategy.status}
                      </Badge>
                    </div>
                    <p className="text-sm">{strategy.description}</p>
                    
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      {strategy.status === 'Under Review' && (
                        <Button variant="outline" size="sm">
                          <FileCheck className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Propose New Pricing Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Strategy Title</label>
                  <Input placeholder="Enter a concise title for your pricing strategy" />
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
                  <Button onClick={handleStrategySubmit}>
                    <BellDot className="h-4 w-4 mr-2" />
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
