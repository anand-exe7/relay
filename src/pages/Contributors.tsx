import { useParams, useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { useContributorsWithSkills } from '@/hooks/useGitHub';
import { ContributorCard } from '@/components/project/ContributorCard';
import { ProjectSidebar } from '@/components/layout/ProjectSidebar';
import { motion } from 'framer-motion';
import { User } from '@/types';

const mockMembers: User[] = [
  { id: 'user-1', name: 'You', email: 'you@example.com' },
  { id: '2', name: 'Alice', email: 'alice@example.com' },
  { id: '3', name: 'Bob', email: 'bob@example.com' },
];

export default function Contributors() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: contributors = [], isLoading } = useContributorsWithSkills();

  return (
    <div className="flex min-h-screen bg-background">
      <ProjectSidebar projectName="Project" members={mockMembers} onAddMember={() => {}} />
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border bg-card flex items-center px-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber" />
            <h1 className="text-xl font-display font-bold">Contributors & Skills</h1>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto max-w-5xl mx-auto w-full">
          {isLoading ? (
            <div className="text-center py-16 text-muted-foreground">Analyzing contributors...</div>
          ) : contributors.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No contributors found. Connect a GitHub repo first.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contributors.map((contributor, i) => (
                <motion.div key={contributor.login} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <ContributorCard contributor={contributor} />
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
