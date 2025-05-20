
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, PauseCircle, Award, AlertTriangle, Bold, Italic, List, ListOrdered, Heading1, Heading2, Quote, Link, Undo, Redo } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface RichTextEditorProps {
  content: string;
  onUpdate: (content: string) => void;
  onRegenerateContent: () => void;
  onToggleApproval: () => void;
  onValidateContent?: () => void;
  validation?: any;
  isValidating?: boolean;
  isApproved?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onUpdate,
  onRegenerateContent,
  onToggleApproval,
  onValidateContent,
  validation,
  isValidating = false,
  isApproved = false
}) => {
  const [editorContent, setEditorContent] = useState(content);
  const [previewMode, setPreviewMode] = useState<string>("edit");
  const [history, setHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditorContent(e.target.value);
  };
  
  const handleSave = () => {
    onUpdate(editorContent);
    // Add to history
    setHistory(prev => [...prev.slice(0, historyIndex + 1), editorContent]);
    setHistoryIndex(prev => prev + 1);
  };
  
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setEditorContent(history[newIndex]);
    }
  };
  
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setEditorContent(history[newIndex]);
    }
  };
  
  const insertFormat = (format: string) => {
    // Simple formatting - in a real rich text editor, this would be more sophisticated
    const textarea = document.getElementById("rich-editor") as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editorContent.substring(start, end);
    let formattedText = selectedText;
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'h1':
        formattedText = `\n# ${selectedText}`;
        break;
      case 'h2':
        formattedText = `\n## ${selectedText}`;
        break;
      case 'ul':
        formattedText = selectedText.split('\n').map(line => `- ${line}`).join('\n');
        break;
      case 'ol':
        formattedText = selectedText.split('\n').map((line, i) => `${i+1}. ${line}`).join('\n');
        break;
      case 'quote':
        formattedText = selectedText.split('\n').map(line => `> ${line}`).join('\n');
        break;
      case 'link':
        formattedText = `[${selectedText}](url)`;
        break;
    }
    
    const newContent = editorContent.substring(0, start) + formattedText + editorContent.substring(end);
    setEditorContent(newContent);
    
    // Set focus back to textarea and adjust cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
    }, 0);
  };
  
  // Convert markdown to HTML for preview
  const renderPreview = () => {
    let html = editorContent
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .split(/\n\n+/).map(paragraph => {
        if (paragraph.match(/^<h[1-6]>|^<li>/)) {
          return paragraph;
        }
        if (paragraph.trim()) {
          return `<p>${paragraph.trim()}</p>`;
        }
        return '';
      }).join('');
    
    // Wrap lists in ul/ol
    html = html.replace(/(<li>.*?<\/li>)+/g, '<ul>$&</ul>');
    
    return html;
  };
  
  const renderValidation = () => {
    if (!validation) return null;
    
    return (
      <div className="bg-gray-50 border rounded-lg p-4 space-y-4 mt-4">
        {/* Validation content similar to ContentView component */}
        {validation.strengths && validation.strengths.length > 0 && (
          <div>
            <h4 className="font-medium flex items-center text-green-700">
              <Award className="h-4 w-4 mr-1" />
              Strengths
            </h4>
            <ul className="ml-5 list-disc space-y-1 mt-1 text-gray-600">
              {validation.strengths.slice(0, 3).map((strength: string, i: number) => (
                <li key={i}>{strength}</li>
              ))}
            </ul>
          </div>
        )}
        
        {validation.weaknesses && validation.weaknesses.length > 0 && (
          <div>
            <h4 className="font-medium flex items-center text-amber-700">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Areas for Improvement
            </h4>
            <ul className="ml-5 list-disc space-y-1 mt-1 text-gray-600">
              {validation.weaknesses.slice(0, 3).map((weakness: string, i: number) => (
                <li key={i}>{weakness}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        {/* Editor Toolbar */}
        <div className="bg-gray-50 p-2 border-b flex flex-wrap gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => insertFormat('bold')}
          >
            <Bold size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => insertFormat('italic')}
          >
            <Italic size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => insertFormat('h1')}
          >
            <Heading1 size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => insertFormat('h2')}
          >
            <Heading2 size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => insertFormat('ul')}
          >
            <List size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => insertFormat('ol')}
          >
            <ListOrdered size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => insertFormat('quote')}
          >
            <Quote size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => insertFormat('link')}
          >
            <Link size={16} />
          </Button>
          
          <div className="border-l h-6 mx-1 my-1"></div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={handleUndo}
            disabled={historyIndex === 0}
          >
            <Undo size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={handleRedo}
            disabled={historyIndex === history.length - 1}
          >
            <Redo size={16} />
          </Button>
          
          <div className="ml-auto">
            <Tabs value={previewMode} onValueChange={setPreviewMode}>
              <TabsList className="h-8">
                <TabsTrigger value="edit" className="text-xs px-2 py-1">Edit</TabsTrigger>
                <TabsTrigger value="preview" className="text-xs px-2 py-1">Preview</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {/* Editor Content */}
        <div className="p-0">
          <Tabs value={previewMode} className="w-full">
            <TabsContent value="edit" className="m-0">
              <textarea
                id="rich-editor"
                value={editorContent}
                onChange={handleContentChange}
                className="w-full p-4 min-h-[400px] font-mono text-sm focus:outline-none resize-y border-none"
                placeholder="Write your educational content here..."
              />
            </TabsContent>
            
            <TabsContent value="preview" className="m-0">
              <div 
                className="prose max-w-none p-4 min-h-[400px] text-sm"
                dangerouslySetInnerHTML={{ __html: renderPreview() }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Validation Display */}
      {renderValidation()}
      
      {/* Action Buttons */}
      <div className="flex justify-between">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
          >
            Save Changes
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerateContent}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate
          </Button>
          
          {onValidateContent && (
            <Button
              variant="outline" 
              size="sm"
              onClick={onValidateContent}
              disabled={isValidating}
            >
              {isValidating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <Award className="h-4 w-4 mr-2" />
                  Validate
                </>
              )}
            </Button>
          )}
        </div>
        
        <Button
          size="sm"
          variant={isApproved ? "outline" : "default"}
          onClick={onToggleApproval}
        >
          {isApproved ? (
            <>
              <PauseCircle className="h-4 w-4 mr-2" />
              Unapprove
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Content
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
