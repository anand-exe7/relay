import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Folder, Upload, Search, Grid, List, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Document {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: string;
  modified: string;
  fileType?: string;
}

const Documents = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const documents: Document[] = [
    { id: "1", name: "Project Requirements", type: "folder", modified: "Dec 20, 2024" },
    { id: "2", name: "Design Assets", type: "folder", modified: "Dec 19, 2024" },
    { id: "3", name: "Meeting Notes", type: "folder", modified: "Dec 18, 2024" },
    { id: "4", name: "Project Brief.pdf", type: "file", size: "2.4 MB", modified: "Dec 22, 2024", fileType: "PDF" },
    { id: "5", name: "Wireframes.fig", type: "file", size: "15.2 MB", modified: "Dec 21, 2024", fileType: "Figma" },
    { id: "6", name: "API Documentation.md", type: "file", size: "156 KB", modified: "Dec 20, 2024", fileType: "Markdown" },
    { id: "7", name: "Budget Report.xlsx", type: "file", size: "1.1 MB", modified: "Dec 19, 2024", fileType: "Excel" },
    { id: "8", name: "Team Structure.docx", type: "file", size: "524 KB", modified: "Dec 18, 2024", fileType: "Word" },
  ];

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const folders = filteredDocuments.filter((doc) => doc.type === "folder");
  const files = filteredDocuments.filter((doc) => doc.type === "file");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/project/${id}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Documents</h1>
          </div>
          <Button variant="default">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </header>

      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {folders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Folders</h2>
            <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-4 gap-4" : "space-y-2"}>
              {folders.map((folder) => (
                <Card
                  key={folder.id}
                  className="bg-card border-border hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <CardContent className={viewMode === "grid" ? "p-4" : "p-3 flex items-center justify-between"}>
                    <div className={viewMode === "grid" ? "text-center" : "flex items-center gap-3"}>
                      <Folder className={viewMode === "grid" ? "h-12 w-12 mx-auto mb-2 text-yellow-500" : "h-5 w-5 text-yellow-500"} />
                      <div>
                        <p className="font-medium truncate">{folder.name}</p>
                        <p className="text-sm text-muted-foreground">{folder.modified}</p>
                      </div>
                    </div>
                    {viewMode === "list" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>Open</DropdownMenuItem>
                          <DropdownMenuItem>Rename</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {files.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Files</h2>
            <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-4 gap-4" : "space-y-2"}>
              {files.map((file) => (
                <Card
                  key={file.id}
                  className="bg-card border-border hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <CardContent className={viewMode === "grid" ? "p-4" : "p-3 flex items-center justify-between"}>
                    <div className={viewMode === "grid" ? "text-center" : "flex items-center gap-3"}>
                      <FileText className={viewMode === "grid" ? "h-12 w-12 mx-auto mb-2 text-blue-500" : "h-5 w-5 text-blue-500"} />
                      <div className={viewMode === "grid" ? "" : "flex-1"}>
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {file.size} • {file.modified}
                        </p>
                      </div>
                    </div>
                    {viewMode === "list" && (
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{file.fileType}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>Download</DropdownMenuItem>
                            <DropdownMenuItem>Rename</DropdownMenuItem>
                            <DropdownMenuItem>Share</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Card className="mt-8 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Storage Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Used: 19.4 MB</span>
                  <span>Total: 1 GB</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[2%]" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-accent/30">
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Folders</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/30">
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-sm text-muted-foreground">Files</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/30">
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-sm text-muted-foreground">Shared</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Documents;
