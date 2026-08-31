import Header from '@/components/Header';
import CategoryTabs from '@/components/CategoryTabs';
import FilterSection from '@/components/FilterSection';
import RecipeGrid from '@/components/RecipeGrid';
import UploadModal from '@/components/UploadModal';

export default function App() {
  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <CategoryTabs />
      <FilterSection />
      <main>
        <RecipeGrid />
      </main>
      <UploadModal />
    </div>
  );
}