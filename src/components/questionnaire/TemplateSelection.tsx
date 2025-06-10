'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, FileText, Users, Search } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface QuestionnaireTemplate {
  id: string;
  name: string;
  description: string;
  total_pages: number;
  estimated_completion_minutes: number;
  is_active: boolean;
  introduction_text?: string;
}

export function TemplateSelection() {
  const [templates, setTemplates] = useState<QuestionnaireTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<QuestionnaireTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "time" | "pages">("name");

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterAndSortTemplates();
  }, [templates, searchQuery, sortBy]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      
      // Check if we have cached templates
      const cached = sessionStorage.getItem('questionnaire-templates');
      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          if (Date.now() - cachedData.timestamp < 5 * 60 * 1000) { // 5 minutes cache
            setTemplates(cachedData.templates || []);
            setLoading(false);
            return;
          }
        } catch (e) {
          // Invalid cache, continue with fetch
        }
      }

      const response = await fetch('/api/questionnaire/templates');
      
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      
      const data = await response.json();
      const templates = data.templates || [];
      
      // Cache the templates
      sessionStorage.setItem('questionnaire-templates', JSON.stringify({
        templates,
        timestamp: Date.now()
      }));
      
      setTemplates(templates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTemplates = () => {
    let filtered = templates.filter(template =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "time":
          return a.estimated_completion_minutes - b.estimated_completion_minutes;
        case "pages":
          return a.total_pages - b.total_pages;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredTemplates(filtered);
  };

  const trackTemplateView = async (templateId: string) => {
    try {
      await fetch('/api/questionnaire/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'template_view',
          template_id: templateId,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      // Analytics tracking is non-critical, don't show errors to user
      console.warn('Analytics tracking failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading questionnaires...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Questionnaires</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchTemplates} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Questionnaires Available</h3>
          <p className="text-gray-600">There are currently no questionnaires available. Please check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search questionnaires..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={(value: "name" | "time" | "pages") => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="time">Time (Shortest)</SelectItem>
            <SelectItem value="pages">Pages (Fewest)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-center text-sm text-gray-600">
        {filteredTemplates.length === templates.length 
          ? `${templates.length} questionnaire${templates.length !== 1 ? 's' : ''} available`
          : `${filteredTemplates.length} of ${templates.length} questionnaire${templates.length !== 1 ? 's' : ''}`
        }
      </div>

      {/* No results state */}
      {filteredTemplates.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Results Found</h3>
            <p className="text-gray-600">No questionnaires match your search for "{searchQuery}"</p>
            <Button 
              variant="outline" 
              onClick={() => setSearchQuery("")}
              className="mt-4"
            >
              Clear Search
            </Button>
          </div>
        </div>
      )}

      {/* Template Grid */}
      {filteredTemplates.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredTemplates.map((template) => (
        <Card key={template.id} className="hover:shadow-lg transition-shadow border-green-200">
          <CardHeader>
            <CardTitle className="flex items-start justify-between">
              <span className="text-lg">{template.name}</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 line-clamp-3">
              {template.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Template Metadata */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{template.estimated_completion_minutes} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{template.total_pages} pages</span>
                </div>
              </div>

              {/* Start Button */}
              <Link 
                href={`/questionnaire/${template.id}`}
                onClick={() => trackTemplateView(template.id)}
              >
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Start Questionnaire
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
        </div>
      )}
    </div>
  );
} 